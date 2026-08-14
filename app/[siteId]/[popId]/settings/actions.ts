"use server"

import {
  getPopById,
  getPopSiteId,
  validatePopAccess,
} from "@/lib/popHelpers"
import {
  lookupPadronContribuyente,
  type PadronActividadItem,
} from "@/lib/argentinaPadronLookup"
import { mapPadronCondicionIvaToClientEnum } from "@/lib/padronIvaMapping"
import { clientIvaToPopEmisorIva } from "@/lib/saleComprobanteRules"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { popMenuHref } from "@/lib/popRoutes"
import { getAuthenticatedUserOrNull } from "@/lib/authHelpers"
import {
  buildPopSettingsImageFileName,
  buildPopSettingsImageStoragePath,
  POP_IMAGE_STORAGE_BUCKET,
  type PopSettingsImageKind,
} from "@/lib/popImageStorage"
import { createClient } from "@/utils/supabase/server"
import {
  operationalDayCloseTimeFromSettings,
  POP_SETTINGS_OPERATIONAL_DAY_CLOSE_TIME_KEY,
  normalizeOperationalDayCloseTime,
} from "@/lib/popOperationalDay"

export type PopSettingsFormInput = {
  name: string
  phone: string
  country: string
  state: string
  city: string
  streetAddress: string
  postalCode: string
  imageUrl?: string | null
  invoiceLogoUrl?: string | null
  backgroundImageUrl?: string | null
  fiscalCuit?: string | null
  fiscalRazonSocial?: string | null
  /** YYYY-MM-DD */
  fiscalInicioActividadesDate?: string | null
  fiscalIngresosBrutosText?: string | null
  /** JSON stringificado de PadronActividadItem[] */
  fiscalPadronActividadesJson?: string | null
  fiscalActividadSeleccionadaId?: string | null
  /** HH:mm — cierre del día operativo (default 00:00). */
  operationalDayCloseTime?: string | null
}

export async function getPopSettingsPageData(popId: string): Promise<
  | {
      success: true
      popName: string
      isOwner: boolean
      canUpdate: boolean
      form: PopSettingsFormInput & {
        fiscalPadronSyncedAt: string | null
      }
    }
  | { success: false; error: string; redirect?: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return {
        success: false,
        error: access.error || "Sin acceso",
        redirect: "/home",
      }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.SETTINGS_READ.resource,
        POP_PERMS.SETTINGS_READ.action,
      )
    ) {
      return {
        success: false,
        error: "No tenés permiso para ver ajustes de este punto.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
      }
    }
    const canUpdate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.SETTINGS_UPDATE.resource,
      POP_PERMS.SETTINGS_UPDATE.action,
    )
    const popRes = await getPopById(popId, { includeOwnerUserId: true })
    if (!popRes.success || !popRes.pop) {
      return { success: false, error: "No se pudieron cargar los datos del punto." }
    }
    const p = popRes.pop
    const user = await getAuthenticatedUserOrNull()
    const isOwner =
      "ownerUserId" in p &&
      p.ownerUserId != null &&
      user?.uid === p.ownerUserId

    return {
      success: true,
      popName: String(p.name ?? ""),
      isOwner: Boolean(isOwner),
      canUpdate,
      form: {
        name: String(p.name ?? ""),
        phone: p.phone ?? "",
        country: p.country ?? "",
        state: p.state ?? "",
        city: p.city ?? "",
        streetAddress: p.streetAddress ?? "",
        postalCode: p.postalCode ?? "",
        imageUrl: p.imageUrl ?? "",
        invoiceLogoUrl: p.invoiceLogoUrl ?? "",
        backgroundImageUrl: p.backgroundImageUrl ?? "",
        fiscalCuit: p.fiscalCuit ?? "",
        fiscalRazonSocial: p.fiscalRazonSocial ?? "",
        fiscalInicioActividadesDate: p.fiscalInicioActividadesDate ?? "",
        fiscalIngresosBrutosText: p.fiscalIngresosBrutosText ?? "",
        fiscalPadronActividadesJson: p.fiscalPadronActividadesJson ?? "",
        fiscalActividadSeleccionadaId: p.fiscalActividadSeleccionadaId ?? "",
        fiscalPadronSyncedAt: p.fiscalPadronSyncedAt ?? null,
        operationalDayCloseTime: operationalDayCloseTimeFromSettings(p.settings),
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function updatePopSettings(
  popId: string,
  input: PopSettingsFormInput,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.SETTINGS_UPDATE.resource,
        POP_PERMS.SETTINGS_UPDATE.action,
      )
    ) {
      return { success: false, error: "No tenés permiso para editar ajustes." }
    }
    const popRes = await getPopById(popId, { includeOwnerUserId: true })
    if (!popRes.success || !popRes.pop || !("ownerUserId" in popRes.pop)) {
      return { success: false, error: "No se pudo validar el punto." }
    }
    const user = await getAuthenticatedUserOrNull()
    const isOwner =
      popRes.pop.ownerUserId != null && user?.uid === popRes.pop.ownerUserId

    const name = input.name.trim()
    if (!name) {
      return { success: false, error: "El nombre del punto es obligatorio." }
    }

    const supabase = await createClient()
    const patch: Record<string, unknown> = {
      name,
      phone: input.phone.trim() || null,
      country: input.country.trim() || null,
      state: input.state.trim() || null,
      city: input.city.trim() || null,
      street_address: input.streetAddress.trim() || null,
      postal_code: input.postalCode.trim() || null,
      image_url: input.imageUrl?.trim() || null,
      invoice_logo_url: input.invoiceLogoUrl?.trim() || null,
      background_image_url: input.backgroundImageUrl?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const fiscalCuitIn = input.fiscalCuit?.trim() ?? ""
    const fiscalRsIn = input.fiscalRazonSocial?.trim() ?? ""
    const fiscalIniIn = input.fiscalInicioActividadesDate?.trim() ?? ""
    const fiscalIbIn = input.fiscalIngresosBrutosText?.trim() ?? ""
    const fiscalActsRaw = input.fiscalPadronActividadesJson?.trim() ?? ""
    const fiscalSelId = input.fiscalActividadSeleccionadaId?.trim() ?? ""

    if (isOwner) {
      patch.fiscal_cuit = fiscalCuitIn.length > 0 ? fiscalCuitIn : null
      patch.fiscal_razon_social = fiscalRsIn.length > 0 ? fiscalRsIn : null
      patch.fiscal_inicio_actividades_date =
        fiscalIniIn.length > 0 ? fiscalIniIn.slice(0, 10) : null
      patch.fiscal_ingresos_brutos_text =
        fiscalIbIn.length > 0 ? fiscalIbIn : null
      if (fiscalActsRaw.length > 0) {
        try {
          const parsed = JSON.parse(fiscalActsRaw) as unknown
          if (!Array.isArray(parsed)) {
            return { success: false, error: "Lista de actividades inválida." }
          }
          patch.fiscal_padron_actividades_json = parsed
        } catch {
          return { success: false, error: "Lista de actividades inválida." }
        }
      } else {
        patch.fiscal_padron_actividades_json = null
      }
      patch.fiscal_actividad_seleccionada_id =
        fiscalSelId.length > 0 ? fiscalSelId : null
    }

    const currentSettings =
      popRes.pop.settings && typeof popRes.pop.settings === "object"
        ? { ...(popRes.pop.settings as Record<string, unknown>) }
        : {}
    currentSettings[POP_SETTINGS_OPERATIONAL_DAY_CLOSE_TIME_KEY] =
      normalizeOperationalDayCloseTime(input.operationalDayCloseTime)
    patch.settings = currentSettings

    const { error } = await supabase.from("pops").update(patch).eq("id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo guardar." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function uploadPopSettingsImage(
  popId: string,
  kind: PopSettingsImageKind,
  formData: FormData,
): Promise<{ success: true; imageUrl: string } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.SETTINGS_UPDATE.resource,
        POP_PERMS.SETTINGS_UPDATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para subir imágenes." }
    }

    const raw = formData.get("file")
    if (!(raw instanceof File) || raw.size <= 0) {
      return { success: false, error: "Elegí una imagen para subir." }
    }

    const expectedType = kind === "ticket-logo" ? "image/png" : "image/webp"
    if (raw.type !== expectedType) {
      return {
        success: false,
        error:
          kind === "ticket-logo"
            ? "El logo de ticket debe estar en formato PNG."
            : "La imagen debe estar en formato WebP.",
      }
    }
    if (raw.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "La imagen comprimida supera el límite de 5 MB.",
      }
    }

    const fileName = buildPopSettingsImageFileName(kind)
    const storagePath = buildPopSettingsImageStoragePath(popId, kind, fileName)
    const bytes = Buffer.from(await raw.arrayBuffer())

    const supabase = await createClient()
    const { error: uploadError } = await supabase.storage
      .from(POP_IMAGE_STORAGE_BUCKET)
      .upload(storagePath, bytes, {
        contentType: expectedType,
        cacheControl: "31536000",
        upsert: false,
      })

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message || "No se pudo subir la imagen.",
      }
    }

    const { data: publicUrlData } = supabase.storage
      .from(POP_IMAGE_STORAGE_BUCKET)
      .getPublicUrl(storagePath)

    const imageUrl = publicUrlData.publicUrl?.trim()
    if (!imageUrl) {
      return { success: false, error: "No se pudo obtener la URL pública." }
    }

    return { success: true, imageUrl }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function syncPadronForPopFiscal(
  popId: string,
): Promise<
  | {
      success: true
      razonSocial: string
      domicilioFiscal?: string
      condicionIvaNombre?: string
      fiscalActividadesPadron?: PadronActividadItem[]
    }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.SETTINGS_UPDATE.resource,
        POP_PERMS.SETTINGS_UPDATE.action,
      )
    ) {
      return { success: false, error: "No tenés permiso para actualizar datos fiscales." }
    }
    const popRes = await getPopById(popId, { includeOwnerUserId: true })
    if (!popRes.success || !popRes.pop || !("ownerUserId" in popRes.pop)) {
      return { success: false, error: "No se pudo validar el punto." }
    }
    const user = await getAuthenticatedUserOrNull()
    const isOwner =
      popRes.pop.ownerUserId != null && user?.uid === popRes.pop.ownerUserId
    if (!isOwner) {
      return {
        success: false,
        error: "Solo el titular puede sincronizar el padrón con el CUIT del punto.",
      }
    }
    const cuit = String(popRes.pop.fiscalCuit ?? "").trim()
    if (!cuit) {
      return { success: false, error: "Cargá primero el CUIT del punto." }
    }
    const pad = await lookupPadronContribuyente(cuit)
    if ("error" in pad) {
      return { success: false, error: pad.error }
    }
    const mappedIva = mapPadronCondicionIvaToClientEnum(pad.condicionIvaNombre)
    const emisorIva = clientIvaToPopEmisorIva(mappedIva)
    const currentSettings =
      popRes.pop.settings && typeof popRes.pop.settings === "object"
        ? { ...(popRes.pop.settings as Record<string, unknown>) }
        : {}
    currentSettings.fiscal_iva_condition = emisorIva

    const supabase = await createClient()
    const { error } = await supabase
      .from("pops")
      .update({
        fiscal_razon_social: pad.razonSocial,
        fiscal_padron_actividades_json: pad.fiscalActividadesPadron?.length
          ? pad.fiscalActividadesPadron
          : null,
        fiscal_padron_synced_at: new Date().toISOString(),
        settings: currentSettings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo guardar." }
    }
    return {
      success: true,
      razonSocial: pad.razonSocial,
      domicilioFiscal: pad.domicilioFiscal,
      condicionIvaNombre: pad.condicionIvaNombre,
      fiscalActividadesPadron: pad.fiscalActividadesPadron,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
