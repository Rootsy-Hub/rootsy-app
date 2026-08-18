"use client"

import {
  cancelServiceCharge,
  createServiceCharges,
  getActiveServicesPageData,
  getServiceTypeChargeOptions,
  recordServiceChargePayment,
  type CreateServiceChargeInput,
  type ServiceChargeListRow,
  type ServiceChargePaymentMethodOption,
  type ServiceTypeChargeOption,
} from "@/app/[siteId]/[popId]/active-services/actions"
import { ActiveServicesKpiCards } from "@/app/[siteId]/[popId]/active-services/components/ActiveServicesKpiCards"
import { ServiceChargeCreateDialog } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeCreateDialog"
import { ServiceChargeListPanel } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeListPanel"
import { ServiceChargePaymentDialog } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargePaymentDialog"
import {
  mergeActiveServicesWorkspaceUrl,
  parseActiveServicesWorkspaceUrl,
} from "@/app/[siteId]/[popId]/active-services/workspaceUrl"
import { DataWorkspaceListSearchField } from "@/components/data-workspace/DataWorkspaceListFilterFields"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import withAuth from "@/hoc/withAuth"
import type { CheckoutCheckDetails } from "@/lib/checkoutCheck"
import type { ActiveServicesViewFilter } from "@/lib/serviceChargeTypes"
import { treasuryPaymentOptionKey } from "@/lib/treasuryPaymentOptions"
import { Plus } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

function ActiveServicesPage() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const params = useParams()
  const searchParams = useSearchParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const ws = useMemo(
    () => parseActiveServicesWorkspaceUrl(searchParams),
    [searchParams],
  )

  const { bootstrap, loading: bootstrapLoading } = usePopWorkspace()
  const popName = bootstrap?.popName ?? ""

  const [loading, setLoading] = useState(true)
  const [listBusy, setListBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    activeClients: 0,
    activeCharges: 0,
    overdueCharges: 0,
    cancelledCharges: 0,
  })
  const [charges, setCharges] = useState<ServiceChargeListRow[]>([])
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canReadClients, setCanReadClients] = useState(false)
  const [canCreateClient, setCanCreateClient] = useState(false)
  const [canUpdateClient, setCanUpdateClient] = useState(false)
  const [serviceOptions, setServiceOptions] = useState<ServiceTypeChargeOption[]>(
    [],
  )
  const [paymentMethods, setPaymentMethods] = useState<
    ServiceChargePaymentMethodOption[]
  >([])

  const [searchInput, setSearchInput] = useState(ws.q)
  const searchDebounceRef = useRef<number | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)

  const [payOpen, setPayOpen] = useState(false)
  const [payTarget, setPayTarget] = useState<ServiceChargeListRow | null>(null)
  const [paySaving, setPaySaving] = useState(false)
  const [payBanner, setPayBanner] = useState(null as string | null)

  const pushWs = useCallback(
    (patch: Partial<{ view: ActiveServicesViewFilter; q: string }>) => {
      if (!siteId || !popId) return
      const href = mergeActiveServicesWorkspaceUrl(ws, patch)
      router.push(`/${siteId}/${popId}/active-services${href}`)
    },
    [router, siteId, popId, ws],
  )

  const loadList = useCallback(async () => {
    if (!popId) return
    setListBusy(true)
    const res = await getActiveServicesPageData(popId, {
      view: ws.view,
      clientQ: ws.q,
    })
    setListBusy(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setError(null)
    setStats(res.stats)
    setCharges(res.charges)
    setCanCreate(res.canCreate)
    setCanUpdate(res.canUpdate)
    setCanReadClients(res.canReadClients)
    setCanCreateClient(res.canCreateClient)
    setCanUpdateClient(res.canUpdateClient)
    setPaymentMethods(res.paymentMethods)
  }, [popId, ws.view, ws.q])

  const loadServices = useCallback(async () => {
    if (!popId) return
    const res = await getServiceTypeChargeOptions(popId)
    if (res.success) setServiceOptions(res.services)
  }, [popId])

  useEffect(() => {
    if (!popId) return
    setLoading(true)
    void Promise.all([loadList(), loadServices()]).finally(() => setLoading(false))
  }, [popId, loadList, loadServices])

  useEffect(() => {
    setSearchInput(ws.q)
  }, [ws.q])

  useEffect(() => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current)
    }
    searchDebounceRef.current = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === ws.q.trim()) return
      pushWs({ q: next })
    }, 350)
    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current)
    }
  }, [searchInput, ws.q, pushWs])

  const openCreate = () => {
    setCreateBanner(null)
    setCreateOpen(true)
  }

  const submitCreate = async (input: CreateServiceChargeInput) => {
    if (!popId || createSaving) return
    setCreateSaving(true)
    setCreateBanner(null)
    const res = await createServiceCharges(popId, input)
    setCreateSaving(false)
    if (!res.success) {
      setCreateBanner(res.error)
      return
    }
    setCreateOpen(false)
    await loadList()
  }

  const openPayment = (charge: ServiceChargeListRow) => {
    setPayTarget(charge)
    setPayBanner(null)
    setPayOpen(true)
  }

  const submitPayment = async (input: {
    amount: number
    paidAt: string
    paymentMethodKey: string
    notes: string
    checkDetails: CheckoutCheckDetails | null
  }) => {
    if (!popId || !payTarget || paySaving) return
    setPaySaving(true)
    setPayBanner(null)
    const selected = paymentMethods.find(
      (pm) => treasuryPaymentOptionKey(pm) === input.paymentMethodKey.trim(),
    )
    const res = await recordServiceChargePayment(
      popId,
      payTarget.id,
      input.amount,
      input.paidAt,
      selected?.kind ?? null,
      selected?.treasuryAccountId ?? null,
      input.notes,
      input.checkDetails,
    )
    setPaySaving(false)
    if (!res.success) {
      setPayBanner(res.error)
      return
    }
    setPayOpen(false)
    setPayTarget(null)
    await loadList()
  }

  const handleCancelCharge = async (charge: ServiceChargeListRow) => {
    if (!popId || !canUpdate) return
    const ok = window.confirm(
      `¿Cancelar el cargo de ${charge.serviceName} para ${charge.clientName}?`,
    )
    if (!ok) return
    const res = await cancelServiceCharge(popId, charge.id)
    if (!res.success) {
      setError(res.error)
      return
    }
    await loadList()
  }

  const pageLoading = bootstrapLoading || loading

  return (
    <>
      <DataWorkspaceModuleLayout
        siteId={siteId}
        popId={popId ?? ""}
        popName={popName}
        title="Servicios activos"
        headerVariant={dataWorkspaceModuleHeaderVariant}
        loading={pageLoading}
        userName={bootstrap?.userFullName}
        userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
        userRoleLabel={bootstrap?.roleLabel}
        contentFlush
        mainMaxWidthClass="max-w-none"
        mainClassName="min-h-0 overflow-y-auto"
        headerActions={
          canCreate ? (
            <DataWorkspaceHeaderIconButton
              label="Crear cargo"
              headerVariant={dataWorkspaceModuleHeaderVariant}
              primary
              onClick={openCreate}
            >
              <Plus className="size-5" aria-hidden />
            </DataWorkspaceHeaderIconButton>
          ) : null
        }
      >
        <div className="relative flex w-full min-h-0 flex-1 flex-col">
          <div className="relative flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}

            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando cargos…</p>
            ) : (
              <>
                <ActiveServicesKpiCards
                  stats={stats}
                  activeFilter={ws.view}
                  onFilterChange={(view) => pushWs({ view })}
                />

                <div className="max-w-md">
                  <DataWorkspaceListSearchField
                    id="active-services-search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Buscar cliente o servicio…"
                  />
                </div>

                <ServiceChargeListPanel
                  charges={charges}
                  canUpdate={canUpdate}
                  onRecordPayment={openPayment}
                  onCancelCharge={handleCancelCharge}
                />
              </>
            )}
          </div>
        </div>
      </DataWorkspaceModuleLayout>

      {popId ? (
        <>
          <ServiceChargeCreateDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            popId={popId}
            siteId={siteId}
            services={serviceOptions}
            paymentMethods={paymentMethods}
            canReadClients={canReadClients}
            canCreateClient={canCreateClient}
            canUpdateClient={canUpdateClient}
            saving={createSaving}
            banner={createBanner}
            onSubmit={(input) => {
              void submitCreate(input)
            }}
          />

          <ServiceChargePaymentDialog
            open={payOpen}
            onOpenChange={setPayOpen}
            popId={popId}
            charge={payTarget}
            paymentMethods={paymentMethods}
            saving={paySaving}
            banner={payBanner}
            onSubmit={(input) => {
              void submitPayment(input)
            }}
          />
        </>
      ) : null}
    </>
  )
}

export default withAuth(ActiveServicesPage)
