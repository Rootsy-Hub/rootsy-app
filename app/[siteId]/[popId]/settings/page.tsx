"use client"

import {
  getPopSettingsPageData,
  updatePopSettingsBusiness,
  updatePopSettingsFiscal,
  updatePopSettingsImages,
} from "@/app/[siteId]/[popId]/settings/actions"
import { PopSettingsFormFields } from "@/app/[siteId]/[popId]/settings/PopSettingsFormFields"
import {
  businessSettingsSnapshot,
  fiscalSettingsSnapshot,
  imagesSettingsSnapshot,
  isSettingsSectionDirty,
  type SettingsFormState,
} from "@/app/[siteId]/[popId]/settings/popSettingsSnapshots"
import { PopSettingsSectionNav } from "@/components/settings/PopSettingsSectionNav"
import { PopSettingsSectionLoading } from "@/components/settings/PopSettingsSectionLoading"
import { dataWorkspaceBlocksPageMainClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  statisticsMainContentClass,
  statisticsNavAsideClass,
  statisticsNavScrollClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { RootsBanner } from "@/components/rootsy-banner"
import withAuth from "@/hoc/withAuth"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { DEFAULT_OPERATIONAL_DAY_CLOSE_TIME } from "@/lib/popOperationalDay"
import {
  ARGENTINA_COUNTRY_CODE,
  resolveArgentinaCountryCode,
} from "@/lib/argentinaLocalities"
import { parsePadronActividadesJson } from "@/lib/padronActividadesHelpers"
import {
  popSettingsSectionById,
  visiblePopSettingsSections,
  type PopSettingsSectionId,
} from "@/lib/popSettingsCatalog"
import {
  isPopSettingsSectionId,
  mergePopSettingsSectionQuery,
  POP_SETTINGS_SECTION_QUERY_PARAM,
  resolvePopSettingsSectionId,
} from "@/lib/popSettingsUrl"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"
import { cn } from "@/lib/utils"

type SectionBanner = {
  message: string
  intent: "success" | "danger"
}

type SavedSnapshots = Record<PopSettingsSectionId, string | null>

function buildInitialSnapshots(form: SettingsFormState): SavedSnapshots {
  return {
    business: businessSettingsSnapshot(form),
    fiscal: fiscalSettingsSnapshot(form),
    images: imagesSettingsSnapshot(form),
  }
}

function SettingsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const routerRef = useRef(router)
  routerRef.current = router
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const {
    bootstrap,
    popAccess,
    loading: bootstrapLoading,
    error: bootstrapError,
    refresh: refreshBootstrap,
  } = usePopWorkspace()

  const [isOwner, setIsOwner] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dataLoadGenRef = useRef(0)
  const [optimisticSectionId, setOptimisticSectionId] =
    useState<PopSettingsSectionId | null>(null)

  const pageLoading = bootstrapLoading || loading
  const resolvedIsOwner = isOwner || popAccess?.isOwner === true

  const requestedSectionId = searchParams.get(POP_SETTINGS_SECTION_QUERY_PARAM)

  const pendingNavSectionIds = useMemo(() => {
    if (!pageLoading) return [] as PopSettingsSectionId[]

    const ids = new Set<PopSettingsSectionId>()
    if (isPopSettingsSectionId(requestedSectionId)) {
      ids.add(requestedSectionId)
    }
    if (optimisticSectionId) {
      ids.add(optimisticSectionId)
    }
    return [...ids]
  }, [optimisticSectionId, pageLoading, requestedSectionId])

  const visibleSections = useMemo(
    () =>
      visiblePopSettingsSections(resolvedIsOwner, {
        includeSectionIds: pendingNavSectionIds,
      }),
    [resolvedIsOwner, pendingNavSectionIds],
  )

  const visibleSectionIds = useMemo(
    () => visibleSections.map((section) => section.id),
    [visibleSections],
  )

  const urlSectionId = useMemo(
    () => resolvePopSettingsSectionId(requestedSectionId, visibleSectionIds),
    [requestedSectionId, visibleSectionIds],
  )

  const activeSectionId = optimisticSectionId ?? urlSectionId

  const getSectionHref = useCallback(
    (sectionId: PopSettingsSectionId) =>
      mergePopSettingsSectionQuery(pathname, searchParams, sectionId),
    [pathname, searchParams],
  )

  useEffect(() => {
    if (!optimisticSectionId) return
    if (urlSectionId === optimisticSectionId) {
      setOptimisticSectionId(null)
    }
  }, [optimisticSectionId, urlSectionId])

  useEffect(() => {
    if (pageLoading) return
    if (!isPopSettingsSectionId(requestedSectionId)) return
    if (visibleSectionIds.includes(requestedSectionId)) return

    setOptimisticSectionId(null)
    router.replace(getSectionHref(urlSectionId), { scroll: false })
  }, [
    getSectionHref,
    pageLoading,
    requestedSectionId,
    router,
    urlSectionId,
    visibleSectionIds,
  ])

  const handleSectionSelect = useCallback(
    (sectionId: PopSettingsSectionId) => {
      if (sectionId === activeSectionId) return

      setOptimisticSectionId(sectionId)
      router.replace(getSectionHref(sectionId), { scroll: false })
    },
    [activeSectionId, getSectionHref, router],
  )

  const [savingSection, setSavingSection] = useState<PopSettingsSectionId | null>(
    null,
  )
  const [sectionBanners, setSectionBanners] = useState<
    Partial<Record<PopSettingsSectionId, SectionBanner>>
  >({})
  const [savedSnapshots, setSavedSnapshots] = useState<SavedSnapshots>({
    business: null,
    fiscal: null,
    images: null,
  })

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
    if (!popId || !siteId) return false

    const gen = ++dataLoadGenRef.current

    try {
      const res = await getPopSettingsPageData(popId)
      if (gen !== dataLoadGenRef.current) return false

      if (!res.success) {
        setError(res.error || "Error")
        if (res.redirect) {
          setTimeout(() => routerRef.current.push(res.redirect!), 1200)
        }
        return false
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
      setSavedSnapshots(buildInitialSnapshots(nextForm))
      setError(null)
      return true
    } catch (e: unknown) {
      if (gen !== dataLoadGenRef.current) return false
      setError(e instanceof Error ? e.message : "No se pudieron cargar los ajustes.")
      return false
    }
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
      dataLoadGenRef.current += 1
    }
  }, [load, popId, siteId])

  const popName = bootstrap?.popName ?? form.name

  const loadingLabel = useMemo(() => {
    const section = popSettingsSectionById(activeSectionId)
    return section
      ? `Cargando ${section.label.toLowerCase()}…`
      : "Cargando ajustes…"
  }, [activeSectionId])

  const actividadesPadronList = useMemo(
    () => parsePadronActividadesJson(form.fiscalPadronActividadesJson),
    [form.fiscalPadronActividadesJson],
  )

  const activeSectionDirty = isSettingsSectionDirty(
    activeSectionId,
    form,
    savedSnapshots[activeSectionId],
  )

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

  const submitSection = async (
    sectionId: PopSettingsSectionId,
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    if (!popId || !siteId || !canUpdate) return
    if (
      !isSettingsSectionDirty(sectionId, form, savedSnapshots[sectionId])
    ) {
      return
    }

    setSavingSection(sectionId)
    setSectionBanners((current) => {
      const next = { ...current }
      delete next[sectionId]
      return next
    })

    let res: { success: true } | { success: false; error: string }

    if (sectionId === "business") {
      res = await updatePopSettingsBusiness(popId, {
        name: form.name,
        phone: form.phone,
        country: ARGENTINA_COUNTRY_CODE,
        state: form.state,
        city: form.city,
        streetAddress: form.streetAddress,
        postalCode: form.postalCode,
        operationalDayCloseTime: form.operationalDayCloseTime,
      })
    } else if (sectionId === "fiscal") {
      res = await updatePopSettingsFiscal(popId, {
        fiscalCuit: form.fiscalCuit,
        fiscalRazonSocial: form.fiscalRazonSocial,
        fiscalInicioActividadesDate: form.fiscalInicioActividadesDate,
        fiscalIngresosBrutosText: form.fiscalIngresosBrutosText,
        fiscalPadronActividadesJson: form.fiscalPadronActividadesJson,
        fiscalActividadSeleccionadaId: form.fiscalActividadSeleccionadaId,
      })
    } else {
      res = await updatePopSettingsImages(popId, {
        imageUrl: form.imageUrl,
        invoiceLogoUrl: form.invoiceLogoUrl,
        backgroundImageUrl: form.backgroundImageUrl,
      })
    }

    setSavingSection(null)

    if (!res.success) {
      setSectionBanners((current) => ({
        ...current,
        [sectionId]: { message: res.error ?? "Error", intent: "danger" },
      }))
      return
    }

    setSectionBanners((current) => ({
      ...current,
      [sectionId]: { message: "Cambios guardados.", intent: "success" },
    }))

    await load()
    if (sectionId === "business" || sectionId === "images") {
      await refreshBootstrap()
    }
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
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
        {!error && !bootstrapError ? (
          <aside className={statisticsNavAsideClass}>
            <div className={statisticsNavScrollClass}>
              <PopSettingsSectionNav
                sections={visibleSections}
                activeSectionId={activeSectionId}
                onSectionSelect={handleSectionSelect}
              />
            </div>
          </aside>
        ) : null}

        <div
          className={cn(
            statisticsMainContentClass,
            "min-h-0 flex-1 overflow-y-auto",
          )}
        >
          {pageLoading ? (
            <PopSettingsSectionLoading label={loadingLabel} />
          ) : null}

          {!pageLoading && error ? (
            <RootsBanner intent="danger" layout="message" message={error} />
          ) : null}

          {bootstrapError ? (
            <RootsBanner
              intent="danger"
              layout="message"
              message={`Cabecera: ${bootstrapError}`}
            />
          ) : null}

          {!pageLoading && !error && !bootstrapError ? (
            <PopSettingsFormFields
              popId={popId}
              form={form}
              setForm={setForm}
              canUpdate={canUpdate}
              activeSectionId={activeSectionId}
              padron={padron}
              actividadesPadronList={actividadesPadronList}
              saving={savingSection === activeSectionId}
              isDirty={activeSectionDirty}
              banner={sectionBanners[activeSectionId] ?? null}
              onSubmit={(event) => void submitSection(activeSectionId, event)}
            />
          ) : null}
        </div>
      </div>
    </DataWorkspaceModuleLayout>
  )
}

export default withAuth(SettingsPage)
