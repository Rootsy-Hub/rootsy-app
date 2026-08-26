"use client"

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
import { showRootsyToast } from "@/components/rootsy-toast"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { usePopSettings } from "@/hooks/usePopSettings"
import { DEFAULT_OPERATIONAL_DAY_CLOSE_TIME } from "@/lib/popOperationalDay"
import {
  ARGENTINA_COUNTRY_CODE,
  resolveArgentinaCountryCode,
} from "@/lib/argentinaLocalities"
import { parsePadronActividadesJson } from "@/lib/padronActividadesHelpers"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
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
import { popSettingsQueryKey } from "@/lib/queryKeys"
import {
  updatePopSettingsBusiness,
  updatePopSettingsFiscal,
  updatePopSettingsImages,
} from "@/lib/rootsyApi/settingsClient"
import { useQueryClient } from "@tanstack/react-query"
import { useParams, usePathname, useSearchParams } from "next/navigation"
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

const EMPTY_FORM: SettingsFormState = {
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
}

function formFromSettingsQuery(form: SettingsFormState): SettingsFormState {
  return {
    ...form,
    country: resolveArgentinaCountryCode(form.country),
    imageUrl: form.imageUrl ?? "",
    invoiceLogoUrl: form.invoiceLogoUrl ?? "",
    backgroundImageUrl: form.backgroundImageUrl ?? "",
    fiscalCuit: form.fiscalCuit ?? "",
    fiscalRazonSocial: form.fiscalRazonSocial ?? "",
    fiscalInicioActividadesDate: form.fiscalInicioActividadesDate ?? "",
    fiscalIngresosBrutosText: form.fiscalIngresosBrutosText ?? "",
    fiscalPadronActividadesJson: form.fiscalPadronActividadesJson ?? "",
    fiscalActividadSeleccionadaId: form.fiscalActividadSeleccionadaId ?? "",
  }
}

export function SettingsWorkspaceView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const queryClient = useQueryClient()
  const {
    bootstrap,
    loading: bootstrapLoading,
    error: bootstrapError,
    refresh: refreshBootstrap,
    hasPermission,
  } = usePopWorkspace()
  const afterHydration = useAfterHydration()
  const menuCache = usePopMenuCache(popId)

  const [workspaceSearch, setWorkspaceSearch] = useState(() =>
    searchParams.toString(),
  )

  useEffect(() => {
    setWorkspaceSearch(searchParams.toString())
  }, [searchParams])

  const workspaceParams = useMemo(
    () => new URLSearchParams(workspaceSearch),
    [workspaceSearch],
  )

  const settingsPerm = useCallback(
    (perm: { resource: string; action: string }) =>
      afterHydration &&
      (hasPermission(perm.resource, perm.action) ||
        (menuCache.popAccess
          ? hasPopAccessPermission(
              menuCache.popAccess,
              perm.resource,
              perm.action,
            )
          : false)),
    [afterHydration, hasPermission, menuCache.popAccess],
  )
  const canUpdate = settingsPerm(POP_PERMS.SETTINGS_UPDATE)

  const settingsQuery = usePopSettings(popId, {
    enabled: Boolean(popId && siteId),
  })

  const [form, setForm] = useState<SettingsFormState>(EMPTY_FORM)
  const [savedSnapshots, setSavedSnapshots] = useState<SavedSnapshots>({
    business: null,
    fiscal: null,
    images: null,
  })
  const hydratedAtRef = useRef<number | null>(null)
  const [optimisticSectionId, setOptimisticSectionId] =
    useState<PopSettingsSectionId | null>(null)
  const [savingSection, setSavingSection] = useState<PopSettingsSectionId | null>(
    null,
  )
  const [sectionBanners, setSectionBanners] = useState<
    Partial<Record<PopSettingsSectionId, SectionBanner>>
  >({})

  // Hidratar durante el render (no en useEffect): si no, `loading` pasa a false
  // con el form todavía vacío y el efecto del padrón borra los datos fiscales.
  if (
    settingsQuery.data?.success &&
    settingsQuery.dataUpdatedAt !== hydratedAtRef.current
  ) {
    hydratedAtRef.current = settingsQuery.dataUpdatedAt
    const nextForm = formFromSettingsQuery(settingsQuery.data.form)
    setForm(nextForm)
    setSavedSnapshots(buildInitialSnapshots(nextForm))
  }

  const loading =
    !popId || !siteId
      ? false
      : settingsQuery.isPending ||
        (settingsQuery.isFetching && !settingsQuery.isFetched)
  const pageLoading = bootstrapLoading || loading
  const error =
    settingsQuery.data?.success === false
      ? settingsQuery.data.error
      : settingsQuery.error instanceof Error
        ? settingsQuery.error.message
        : settingsQuery.error
          ? String(settingsQuery.error)
          : null

  const requestedSectionId = workspaceParams.get(POP_SETTINGS_SECTION_QUERY_PARAM)

  const visibleSections = useMemo(() => visiblePopSettingsSections(), [])

  const visibleSectionIds = useMemo(
    () => visibleSections.map((section) => section.id),
    [visibleSections],
  )

  const urlSectionId = useMemo(
    () => resolvePopSettingsSectionId(requestedSectionId, visibleSectionIds),
    [requestedSectionId, visibleSectionIds],
  )

  const activeSectionId = optimisticSectionId ?? urlSectionId

  const replaceSection = useCallback(
    (sectionId: PopSettingsSectionId) => {
      const href = mergePopSettingsSectionQuery(
        pathname,
        workspaceParams,
        sectionId,
      )
      if (typeof window !== "undefined") {
        const current = `${window.location.pathname}${window.location.search}`
        if (current !== href) {
          window.history.replaceState(window.history.state, "", href)
        }
      }
      const qIndex = href.indexOf("?")
      setWorkspaceSearch(qIndex >= 0 ? href.slice(qIndex + 1) : "")
    },
    [pathname, workspaceParams],
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
    replaceSection(urlSectionId)
  }, [
    pageLoading,
    replaceSection,
    requestedSectionId,
    urlSectionId,
    visibleSectionIds,
  ])

  const handleSectionSelect = useCallback(
    (sectionId: PopSettingsSectionId) => {
      if (sectionId === activeSectionId) return
      setOptimisticSectionId(sectionId)
      replaceSection(sectionId)
    },
    [activeSectionId, replaceSection],
  )

  const padron = usePadronAutofillRazonSocial(popId, form.fiscalCuit ?? "", {
    enabled: Boolean(popId) && canUpdate && !pageLoading,
    suppressClear: pageLoading,
    manual: true,
  })

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
    if (!canUpdate || loading) return
    if (padron.busy) return
    if (!(form.fiscalCuit ?? "").trim()) return
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
    canUpdate,
    loading,
    form.fiscalCuit,
  ])

  const submitSection = async (
    sectionId: PopSettingsSectionId,
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    if (!popId || !siteId || !canUpdate) return
    if (!isSettingsSectionDirty(sectionId, form, savedSnapshots[sectionId])) {
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

    showRootsyToast({ title: "Guardado", intent: "success" })
    await queryClient.invalidateQueries({
      queryKey: popSettingsQueryKey(popId),
    })
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
