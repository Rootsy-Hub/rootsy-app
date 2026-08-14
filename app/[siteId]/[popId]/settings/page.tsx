"use client"

import {
  getPopSettingsPageData,
  updatePopSettings,
  type PopSettingsFormInput,
} from "@/app/[siteId]/[popId]/settings/actions"
import { PopSettingsFormFields } from "@/app/[siteId]/[popId]/settings/PopSettingsFormFields"
import {
  dataWorkspaceBlocksContentInnerClass,
  dataWorkspaceBlocksContentScopeClass,
  dataWorkspaceBlocksPageMainClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { RootsPrimaryButton } from "@/components/rootsy-button"
import { RootsBanner } from "@/components/rootsy-banner"
import withAuth from "@/hoc/withAuth"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import {
  DEFAULT_OPERATIONAL_DAY_CLOSE_TIME,
  normalizeOperationalDayCloseTime,
} from "@/lib/popOperationalDay"
import {
  ARGENTINA_COUNTRY_CODE,
  resolveArgentinaCountryCode,
} from "@/lib/argentinaLocalities"
import { parsePadronActividadesJson } from "@/lib/padronActividadesHelpers"
import { useParams, useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"
import { cn } from "@/lib/utils"

type SettingsFormState = PopSettingsFormInput & {
  fiscalPadronSyncedAt: string | null
}

function buildPersistedSnapshot(
  form: SettingsFormState,
  isOwner: boolean,
): PopSettingsFormInput {
  const base: PopSettingsFormInput = {
    name: form.name.trim(),
    phone: form.phone.trim(),
    country: resolveArgentinaCountryCode(form.country),
    state: form.state.trim(),
    city: form.city.trim(),
    streetAddress: form.streetAddress.trim(),
    postalCode: form.postalCode.trim(),
    imageUrl: form.imageUrl ?? "",
    invoiceLogoUrl: form.invoiceLogoUrl ?? "",
    backgroundImageUrl: form.backgroundImageUrl ?? "",
    operationalDayCloseTime: normalizeOperationalDayCloseTime(
      form.operationalDayCloseTime,
    ),
  }

  if (!isOwner) return base

  return {
    ...base,
    fiscalCuit: (form.fiscalCuit ?? "").trim(),
    fiscalRazonSocial: (form.fiscalRazonSocial ?? "").trim(),
    fiscalInicioActividadesDate: (form.fiscalInicioActividadesDate ?? "").trim(),
    fiscalIngresosBrutosText: (form.fiscalIngresosBrutosText ?? "").replace(
      /\D/g,
      "",
    ),
    fiscalPadronActividadesJson: form.fiscalPadronActividadesJson ?? "",
    fiscalActividadSeleccionadaId: (
      form.fiscalActividadSeleccionadaId ?? ""
    ).trim(),
  }
}

function snapshotKey(form: SettingsFormState, isOwner: boolean): string {
  return JSON.stringify(buildPersistedSnapshot(form, isOwner))
}

function SettingsPage() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const {
    bootstrap,
    loading: bootstrapLoading,
    error: bootstrapError,
    refresh: refreshBootstrap,
  } = usePopWorkspace()

  const [isOwner, setIsOwner] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pageLoading = bootstrapLoading || loading
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<{
    message: string
    intent: "success" | "danger"
  } | null>(null)
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null)

  const [form, setForm] = useState<SettingsFormState>({
    name: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    streetAddress: "",
    postalCode: "",
    imageUrl: "",
    invoiceLogoUrl: "",
    backgroundImageUrl: "",
    fiscalCuit: "",
    fiscalRazonSocial: "",
    fiscalInicioActividadesDate: "",
    fiscalIngresosBrutosText: "",
    fiscalPadronActividadesJson: "",
    fiscalActividadSeleccionadaId: "",
    fiscalPadronSyncedAt: null,
    operationalDayCloseTime: DEFAULT_OPERATIONAL_DAY_CLOSE_TIME,
  })

  const padron = usePadronAutofillRazonSocial(popId, form.fiscalCuit ?? "", {
    enabled: Boolean(popId) && isOwner && canUpdate && !pageLoading,
    suppressClear: pageLoading,
    manual: true,
  })

  const load = useCallback(async () => {
    if (!popId || !siteId) return
    const res = await getPopSettingsPageData(popId)
    if (!res.success) {
      setError(res.error || "Error")
      if (res.redirect) {
        setTimeout(() => routerRef.current.push(res.redirect!), 1200)
      }
      return
    }
    setIsOwner(res.isOwner)
    setCanUpdate(res.canUpdate)
    const nextForm: SettingsFormState = {
      ...res.form,
      country: resolveArgentinaCountryCode(res.form.country),
      imageUrl: res.form.imageUrl ?? "",
      invoiceLogoUrl: res.form.invoiceLogoUrl ?? "",
      backgroundImageUrl: res.form.backgroundImageUrl ?? "",
      fiscalCuit: res.form.fiscalCuit ?? "",
      fiscalRazonSocial: res.form.fiscalRazonSocial ?? "",
      fiscalInicioActividadesDate: res.form.fiscalInicioActividadesDate ?? "",
      fiscalIngresosBrutosText: res.form.fiscalIngresosBrutosText ?? "",
      fiscalPadronActividadesJson: res.form.fiscalPadronActividadesJson ?? "",
      fiscalActividadSeleccionadaId: res.form.fiscalActividadSeleccionadaId ?? "",
    }
    setForm(nextForm)
    setSavedSnapshot(snapshotKey(nextForm, res.isOwner))
    setError(null)
  }, [popId, siteId])

  useEffect(() => {
    if (!popId || !siteId) {
      setLoading(false)
      setError("Punto de venta no encontrado")
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      await load()
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [load, popId, siteId])

  const popName = bootstrap?.popName ?? form.name

  const actividadesPadronList = useMemo(
    () => parsePadronActividadesJson(form.fiscalPadronActividadesJson),
    [form.fiscalPadronActividadesJson],
  )

  const isDirty =
    savedSnapshot !== null &&
    snapshotKey(form, isOwner) !== savedSnapshot

  useEffect(() => {
    if (!isOwner || loading) return
    if (padron.busy) return
    const hasCuit = Boolean((form.fiscalCuit ?? "").trim())
    if (!hasCuit) {
      setForm((f) => ({
        ...f,
        fiscalRazonSocial: "",
        fiscalPadronActividadesJson: "",
        fiscalActividadSeleccionadaId: "",
        fiscalInicioActividadesDate: "",
        fiscalIngresosBrutosText: "",
      }))
      return
    }
    if (!padron.razonSocial.trim()) return
    const acts = padron.fiscalActividadesPadron ?? []
    const json = acts.length ? JSON.stringify(acts) : ""
    setForm((f) => {
      const sel = f.fiscalActividadSeleccionadaId?.trim() ?? ""
      const selStillValid =
        sel.length > 0 && acts.some((a) => a.idActividad === sel)
      return {
        ...f,
        fiscalRazonSocial: padron.razonSocial,
        fiscalPadronActividadesJson: json,
        ...(selStillValid ? {} : { fiscalActividadSeleccionadaId: "" }),
      }
    })
  }, [
    padron.razonSocial,
    padron.fiscalActividadesPadron,
    padron.busy,
    isOwner,
    loading,
    form.fiscalCuit,
  ])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId || !canUpdate || !isDirty) return
    setSaving(true)
    setBanner(null)
    const res = await updatePopSettings(popId, {
      name: form.name,
      phone: form.phone,
      country: ARGENTINA_COUNTRY_CODE,
      state: form.state,
      city: form.city,
      streetAddress: form.streetAddress,
      postalCode: form.postalCode,
      imageUrl: form.imageUrl,
      invoiceLogoUrl: form.invoiceLogoUrl,
      backgroundImageUrl: form.backgroundImageUrl,
      fiscalCuit: isOwner ? form.fiscalCuit : undefined,
      fiscalRazonSocial: isOwner ? form.fiscalRazonSocial : undefined,
      fiscalInicioActividadesDate: isOwner
        ? form.fiscalInicioActividadesDate
        : undefined,
      fiscalIngresosBrutosText: isOwner
        ? form.fiscalIngresosBrutosText
        : undefined,
      fiscalPadronActividadesJson: isOwner
        ? form.fiscalPadronActividadesJson
        : undefined,
      fiscalActividadSeleccionadaId: isOwner
        ? form.fiscalActividadSeleccionadaId
        : undefined,
      operationalDayCloseTime: form.operationalDayCloseTime,
    })
    setSaving(false)
    if (!res.success) {
      setBanner({ message: res.error ?? "Error", intent: "danger" })
      return
    }
    setBanner({ message: "Cambios guardados.", intent: "success" })
    await Promise.all([load(), refreshBootstrap()])
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado</p>
      </div>
    )
  }

  return (
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title="Ajustes"
      pillLabel="Configuración"
      headerVariant={dataWorkspaceModuleHeaderVariant}
      loading={pageLoading}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel}
      contentFlush
      mainMaxWidthClass="max-w-none"
      mainClassName={cn(
        dataWorkspaceBlocksPageMainClass,
        "flex min-h-0 flex-1 flex-col overflow-hidden",
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            dataWorkspaceBlocksContentScopeClass,
            dataWorkspaceBlocksContentInnerClass,
            "min-h-0 flex-1 overflow-y-auto",
          )}
        >
          <div className="mx-auto w-full max-w-[88rem] space-y-4">
            {error || bootstrapError ? (
              <RootsBanner
                intent="danger"
                layout="message"
                message={error ?? bootstrapError ?? ""}
              />
            ) : null}

            {!pageLoading && !error && !bootstrapError ? (
              <form
                id="pop-settings-form"
                onSubmit={(e) => void submit(e)}
                className="space-y-6"
              >
                {banner ? (
                  <RootsBanner
                    intent={banner.intent}
                    layout="message"
                    message={banner.message}
                  />
                ) : null}

                <PopSettingsFormFields
                  popId={popId}
                  form={form}
                  setForm={setForm}
                  canUpdate={canUpdate}
                  isOwner={isOwner}
                  padron={padron}
                  actividadesPadronList={actividadesPadronList}
                />
              </form>
            ) : null}
          </div>
        </div>

        {!pageLoading && !error && !bootstrapError ? (
          <footer className="relative z-20 shrink-0 border-t border-[var(--rootsy-bruma-200)] bg-white">
            <div className="mx-auto flex h-18 w-full max-w-[88rem] items-center justify-end px-4 sm:px-6 lg:px-8">
              <RootsPrimaryButton
                type="submit"
                form="pop-settings-form"
                disabled={!canUpdate || saving || !isDirty}
              >
                {saving ? "Guardando…" : "Guardar"}
              </RootsPrimaryButton>
            </div>
          </footer>
        ) : null}
      </div>
    </DataWorkspaceModuleLayout>
  )
}

export default withAuth(SettingsPage)
