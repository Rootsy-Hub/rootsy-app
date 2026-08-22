import "server-only"

import type {
  InvoiceEmitFailure,
  InvoiceEmitSuccess,
  InvoiceFormCashSession,
  InvoiceFormContextResult,
  InvoiceFormSalePoint,
  InvoiceHomologacionSuccess,
} from "@/app/[siteId]/[popId]/invoices/actions"
import { emitArcaFacturaBConsumidorFinal } from "@/lib/arcaWsfeEmit"
import { isArcaAfipHomologationFromEnv } from "@/lib/arcaAfipGlobalMode"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopById, getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import type { PopPermissionsSnapshotJSON } from "@/lib/popPermissionsServer"
import { popMenuHref, siteIdFromPopRow } from "@/lib/popRoutes"
import { downloadArcaSalePointPemFiles } from "@/lib/rootsyAfipStorage"
import {
  DEFAULT_SALE_SITE_ID,
  findSaleInvoiceTypeByArcaCbteTipo,
} from "@/lib/saleInvoiceTypes"
import { createClient } from "@/utils/supabase/server"
import { createServiceRoleClient } from "@/utils/supabase/service-role"

function normalizeCuitDigits(s: string): string {
  return s.replace(/\D/g, "")
}

function cbteFchNumToIsoDate(cbteFch: string): string {
  const t = cbteFch.replace(/\D/g, "")
  if (t.length === 8) {
    return `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}`
  }
  return new Date().toISOString().slice(0, 10)
}

function canQueryOpenCashRegisterForInvoiceUi(
  snap: PopPermissionsSnapshotJSON,
): boolean {
  return permissionKeysInclude(
    snap.keys,
    POP_PERMS.INVOICES_READ.resource,
    POP_PERMS.INVOICES_READ.action,
  )
}

async function resolveOpenCashRegisterForInvoice(
  popId: string,
  snap: PopPermissionsSnapshotJSON,
): Promise<{ success: true; ctx: InvoiceFormCashSession } | { success: false }> {
  if (!canQueryOpenCashRegisterForInvoiceUi(snap)) {
    return { success: false }
  }
  const srv = createServiceRoleClient()
  const { data: regs, error: regErr } = await srv
    .from("cash_registers")
    .select("id, name, sort_order, arca_sale_point_id")
    .eq("pop_id", popId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
  if (regErr || !regs) return { success: false }
  const { data: sessions, error: sessErr } = await srv
    .from("cash_register_sessions")
    .select("id, cash_register_id")
    .eq("pop_id", popId)
    .eq("status", "open")
  if (sessErr) return { success: false }
  const openByReg = new Map<string, string>()
  for (const s of sessions || []) {
    openByReg.set(String(s.cash_register_id), String(s.id))
  }

  for (const r of regs) {
    const sid = openByReg.get(String(r.id))
    if (!sid) continue
    const salePoint = await loadInvoiceSalePoint(
      srv,
      popId,
      r.arca_sale_point_id != null ? String(r.arca_sale_point_id) : null,
    )
    return {
      success: true,
      ctx: {
        cashRegisterId: String(r.id),
        cashRegisterName: String(r.name ?? ""),
        sessionId: sid,
        salePoint,
      },
    }
  }
  return { success: false }
}

async function loadInvoiceSalePoint(
  srv: ReturnType<typeof createServiceRoleClient>,
  popId: string,
  salePointId: string | null,
): Promise<InvoiceFormSalePoint | null> {
  if (!salePointId) return null
  const { data, error } = await srv
    .from("arca_sale_points")
    .select(
      "id, pto_vta, certificate_crt_uploaded_at, certificate_key_uploaded_at",
    )
    .eq("pop_id", popId)
    .eq("id", salePointId)
    .maybeSingle()
  if (error || !data) return null
  return {
    id: String(data.id),
    ptoVta: Number(data.pto_vta),
    configured: Boolean(
      data.certificate_crt_uploaded_at && data.certificate_key_uploaded_at,
    ),
  }
}

export async function getInvoiceFormContext(
  popId: string,
): Promise<InvoiceFormContextResult> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso", redirect: "/home" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    const canCreate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.INVOICES_CREATE.resource,
      POP_PERMS.INVOICES_CREATE.action,
    )
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.INVOICES_READ.resource,
        POP_PERMS.INVOICES_READ.action,
      )
    ) {
      return {
        success: false,
        error: "No tenés permiso para facturación.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
      }
    }
    const popRes = await getPopById(popId)
    const fiscalCuit =
      popRes.success && popRes.pop?.fiscalCuit
        ? normalizeCuitDigits(String(popRes.pop.fiscalCuit))
        : null
    const fiscalRazonSocial =
      popRes.success && popRes.pop?.fiscalRazonSocial
        ? String(popRes.pop.fiscalRazonSocial)
        : null
    const open = await resolveOpenCashRegisterForInvoice(popId, snap)
    return {
      success: true,
      fiscalCuit: fiscalCuit && fiscalCuit.length === 11 ? fiscalCuit : null,
      fiscalRazonSocial,
      cashSession: open.success ? open.ctx : null,
      canCreateInvoice: canCreate,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function testArcaInvoiceHomologacion(
  popId: string,
  formData: FormData,
): Promise<InvoiceHomologacionSuccess | InvoiceEmitFailure> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.INVOICES_CREATE.resource,
        POP_PERMS.INVOICES_CREATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para emitir comprobantes de prueba." }
    }
    const popRes = await getPopById(popId)
    if (!popRes.success || !popRes.pop?.fiscalCuit) {
      return {
        success: false,
        error: "Configurá el CUIT fiscal del punto de venta antes de probar.",
      }
    }
    const cuitEmisor = normalizeCuitDigits(String(popRes.pop.fiscalCuit))
    if (cuitEmisor.length !== 11) {
      return { success: false, error: "CUIT fiscal del punto de venta inválido." }
    }

    const crt = formData.get("crt")
    const key = formData.get("key")
    if (!(crt instanceof File) || !(key instanceof File)) {
      return { success: false, error: "Subí el certificado (.crt) y la clave (.key)." }
    }
    if (crt.size === 0 || key.size === 0) {
      return { success: false, error: "Los archivos no pueden estar vacíos." }
    }
    const certPem = Buffer.from(await crt.arrayBuffer()).toString("utf8")
    const keyPem = Buffer.from(await key.arrayBuffer()).toString("utf8")

    const ptoRaw = String(formData.get("ptoVta") ?? "").trim()
    const ptoVta = ptoRaw === "" ? NaN : Number(ptoRaw)
    if (!Number.isFinite(ptoVta) || ptoVta < 0 || ptoVta > 99999) {
      return { success: false, error: "Punto de venta inválido (0–99999)." }
    }
    const impRaw = String(formData.get("importeTotal") ?? "").trim()
    const impTotal = Number(impRaw.replace(",", "."))
    if (!Number.isFinite(impTotal) || impTotal <= 0) {
      return { success: false, error: "Importe total inválido." }
    }

    const docTipo = Number(formData.get("docTipo") ?? 99)
    const docNro = String(formData.get("docNro") ?? "0").trim()
    const razon =
      String(formData.get("receptorRazonSocial") ?? "Consumidor Final").trim() ||
      "Consumidor Final"

    const emit = await emitArcaFacturaBConsumidorFinal({
      certPem,
      keyPem,
      cuitEmisor,
      ptoVta,
      cbteTipo: 6,
      impTotal,
      homologation: true,
      docTipo: Number.isFinite(docTipo) ? docTipo : 99,
      docNro,
      receptorRazonSocial: razon,
    })

    if (!emit.ok) {
      return {
        success: false,
        error: emit.error,
        ...(emit.debugFecaeSoap !== undefined
          ? { debugFecaeSoap: emit.debugFecaeSoap }
          : {}),
      }
    }

    return {
      success: true,
      cae: emit.cae,
      caeFchVto: emit.caeFchVto,
      cbteNro: emit.cbteNro,
      ptoVta,
      impTotal: emit.impTotal,
      impNeto: emit.impNeto,
      impIva: emit.impIva,
      cbteFch: emit.cbteFch,
      payloadRequest: emit.requestPayload,
      payloadResponse: emit.responsePayload,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function createArcaInvoiceWithOpenCashRegister(
  popId: string,
  formData: FormData,
): Promise<InvoiceEmitSuccess | InvoiceEmitFailure> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.INVOICES_CREATE.resource,
        POP_PERMS.INVOICES_CREATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para emitir facturas." }
    }
    const popRes = await getPopById(popId)
    if (!popRes.success || !popRes.pop?.fiscalCuit) {
      return {
        success: false,
        error: "Configurá el CUIT fiscal del punto de venta.",
      }
    }
    const cuitEmisor = normalizeCuitDigits(String(popRes.pop.fiscalCuit))
    if (cuitEmisor.length !== 11) {
      return { success: false, error: "CUIT fiscal del punto de venta inválido." }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.id) {
      return { success: false, error: "Sesión requerida." }
    }

    const open = await resolveOpenCashRegisterForInvoice(popId, snap)
    if (!open.success) {
      return {
        success: false,
        error: "Tenés que tener una caja abierta. Abrí una sesión en Cajas.",
      }
    }
    const ctx = open.ctx
    const salePoint = ctx.salePoint
    if (!salePoint) {
      return {
        success: false,
        error:
          "Asigná un punto de venta AFIP a esta caja en Cajas.",
      }
    }
    if (!salePoint.configured) {
      return {
        success: false,
        error:
          "Ese punto de venta no tiene certificado y clave. Cargalos en Configuración fiscal.",
      }
    }

    const pem = await downloadArcaSalePointPemFiles(popId, salePoint.id)
    if (!pem.success) {
      return { success: false, error: pem.error }
    }

    const impRaw = String(formData.get("importeTotal") ?? "").trim()
    const impTotal = Number(impRaw.replace(",", "."))
    if (!Number.isFinite(impTotal) || impTotal <= 0) {
      return { success: false, error: "Importe total inválido." }
    }
    const docTipo = Number(formData.get("docTipo") ?? 99)
    const docNro = String(formData.get("docNro") ?? "0").trim()
    const razon =
      String(formData.get("receptorRazonSocial") ?? "Consumidor Final").trim() ||
      "Consumidor Final"

    const emit = await emitArcaFacturaBConsumidorFinal({
      certPem: pem.certPemUtf8,
      keyPem: pem.keyPemUtf8,
      cuitEmisor,
      ptoVta: salePoint.ptoVta,
      cbteTipo: 6,
      impTotal,
      homologation: isArcaAfipHomologationFromEnv(),
      docTipo: Number.isFinite(docTipo) ? docTipo : 99,
      docNro,
      receptorRazonSocial: razon,
    })

    if (!emit.ok) {
      return {
        success: false,
        error: emit.error,
        ...(emit.debugFecaeSoap !== undefined
          ? { debugFecaeSoap: emit.debugFecaeSoap }
          : {}),
      }
    }

    const cbteFchIso = cbteFchNumToIsoDate(emit.cbteFch)
    const siteIdForInv =
      siteIdFromPopRow({
        site_id: popRes.pop.siteId as string | null | undefined,
        settings: popRes.pop.settings,
      }) ?? DEFAULT_SALE_SITE_ID
    const opt = findSaleInvoiceTypeByArcaCbteTipo(siteIdForInv, 6)

    const { data: ins, error: insErr } = await supabase
      .from("invoices_arca")
      .insert({
        pop_id: popId,
        sale_id: null,
        cash_register_id: ctx.cashRegisterId,
        arca_cbte_tipo: 6,
        arca_regimen: opt?.arcaRegimen ?? "fe_general",
        pto_vta: salePoint.ptoVta,
        cbte_nro: emit.cbteNro,
        cbte_fch: cbteFchIso,
        doc_tipo: Number.isFinite(docTipo) ? docTipo : 99,
        doc_nro: docTipo === 99 ? "0" : docNro,
        receptor_razon_social: razon,
        imp_total: emit.impTotal,
        imp_neto: emit.impNeto,
        imp_iva: emit.impIva,
        imp_trib: 0,
        mon_id: "PES",
        mon_cotiz: 1,
        cae: emit.cae,
        cae_fch_vto: emit.caeFchVto.slice(0, 10),
        status: "authorized",
        arca_resultado: emit.resultado,
        arca_observaciones: null,
        payload_request: emit.requestPayload,
        payload_response: emit.responsePayload,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (insErr || !ins?.id) {
      return {
        success: false,
        error: insErr?.message || "No se pudo guardar la factura en la base.",
      }
    }

    return {
      success: true,
      invoiceId: String(ins.id),
      cae: emit.cae,
      caeFchVto: emit.caeFchVto,
      cbteNro: emit.cbteNro,
      ptoVta: salePoint.ptoVta,
      impTotal: emit.impTotal,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
