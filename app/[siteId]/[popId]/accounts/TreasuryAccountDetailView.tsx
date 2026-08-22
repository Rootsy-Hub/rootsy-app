"use client"

import { TreasuryAccountDetailContentSkeleton, TreasuryAccountDetailSkeleton, resolveTreasuryDetailSkeletonProfile } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountDetailSkeleton"
import {
  getTreasuryAccountPageData,
  type TreasuryAccountTableRow,
  type TreasuryChildAccountRow,
  type TreasuryFundingOption,
} from "@/app/[siteId]/[popId]/accounts/actions"
import {
  TreasuryBrandIsotype,
  TreasuryBrandName,
} from "@/app/[siteId]/[popId]/accounts/TreasuryBrandMark"
import {
  addManualBankStatementLine,
  clearMovementReconciliation,
  deleteBankStatementLine,
  getTreasuryAccountDetail,
  importBankStatementCsv,
  recordPosAcreditationForAccount,
  recordTreasurySettlementForAccount,
  setMovementReconciliation,
  type BankStatementLineRow,
  type PaymentMethodMovementRow,
  type TreasuryAccountDetailResult,
  type TreasurySettlementRow,
} from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import { TreasuryCashMovementsTable } from "@/app/[siteId]/[popId]/accounts/TreasuryCashMovementsTable"
import { TreasuryGroupedMovementsList } from "@/app/[siteId]/[popId]/accounts/TreasuryGroupedMovementsList"
import {
  ChildIntegrationChip,
  TreasuryChildReconciliationPanel,
} from "@/app/[siteId]/[popId]/accounts/TreasuryChildReconciliationPanel"
import { TreasuryMercadoPagoConnectionPanel } from "@/app/[siteId]/[popId]/accounts/TreasuryMercadoPagoConnectionPanel"
import { TreasuryReconcileModal } from "@/app/[siteId]/[popId]/accounts/TreasuryReconcileModal"
import {
  defaultTreasuryPeriodEnd,
  exportTreasuryAccountPeriodCsv,
  findMatchingBankStatementLine,
  formatTreasuryShortDate,
  formatTreasurySignedAmount,
  treasuryMoneyFmt as fmt,
  treasuryMovementKindLabel,
} from "@/app/[siteId]/[popId]/accounts/treasuryAccountUiUtils"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import {
  dataWorkspaceDetailBodyClass,
  dataWorkspaceDetailCardClass,
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceDetailCardStatsClass,
  dataWorkspaceDetailKpiStripClass,
  dataWorkspaceDetailToolbarClass,
  dataWorkspaceDetailKpiStripTwoColClass,
  dataWorkspaceDetailPanelClass,
  dataWorkspaceDetailSectionClass,
  dataWorkspaceFlushBottomPanelBodyClass,
  dataWorkspaceFlushBottomPanelChromeClass,
  dataWorkspaceFlushBottomPanelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsDefaultButton,
  RootsIconButton,
  RootsPrimaryButton,
} from "@/components/rootsy-button"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  treasuryAccountOffersMercadoPagoConnection,
  type PopMercadoPagoConnectionPublic,
} from "@/lib/popMercadoPago"
import { resolveTreasuryAccountBrand } from "@/lib/treasuryAccountBrands"
import { treasuryKindLabel } from "@/lib/treasuryAccountKinds"
import type { TreasuryAccountKind } from "@/lib/treasuryAccountKinds"
import {
  computeDataWorkspaceDateBounds,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Download,
  Trash2,
  Upload,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"
import type { DateRange } from "react-day-picker"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const shellCard = dataWorkspaceDetailPanelClass

type DetailSection = "resumen" | "movimientos" | "conciliacion"

function parseAccountKindHint(
  value: string | null | undefined,
): TreasuryAccountKind | undefined {
  if (
    value === "cash" ||
    value === "bank" ||
    value === "wallet" ||
    value === "other" ||
    value === "card_payable"
  ) {
    return value
  }
  return undefined
}

function moneyOrDash(amount: number | null | undefined): string {
  if (amount == null) return "—"
  return fmt.format(amount)
}

function integrationBalanceOrDash(
  hasIntegration: boolean,
  amount: number | null | undefined,
): string {
  if (!hasIntegration) return "—"
  return moneyOrDash(amount)
}

function DashboardKpi({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="px-4 py-4 lg:px-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 font-numeric text-2xl font-bold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function DashboardSectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function DashboardEmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[12rem] items-center justify-center px-4 py-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}

const dashboardKpiStripClass = dataWorkspaceDetailKpiStripClass

const dashboardBalanceStripClass = dataWorkspaceDetailKpiStripTwoColClass

const dashboardBodyClass = dataWorkspaceDetailBodyClass

const dashboardSectionClass = dataWorkspaceDetailSectionClass

function TreasuryStat({
  label,
  value,
  large,
  inverted,
  className,
}: {
  label: string
  value: string
  large?: boolean
  inverted?: boolean
  className?: string
}) {
  return (
    <div className={cn(inverted ? "text-right sm:text-left" : undefined, className)}>
      <p
        className={cn(
          "text-[11px] font-medium uppercase tracking-[0.14em]",
          inverted ? "text-white/75" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-numeric font-bold tabular-nums tracking-tight",
          inverted ? "text-white" : "text-foreground",
          large ? "mt-1.5 text-2xl sm:text-3xl" : "text-base sm:text-lg",
        )}
      >
        {value}
      </p>
    </div>
  )
}

export function TreasuryAccountDetailView({
  siteId,
  popId,
  accountId,
  accountKindHint,
}: {
  siteId: string
  popId: string
  accountId: string
  accountKindHint?: TreasuryAccountKind
}) {
  const searchParams = useSearchParams()
  const kindFromQuery = parseAccountKindHint(searchParams.get("kind"))
  const resolvedKindHint = accountKindHint ?? kindFromQuery
  const accountsBasePath = `/${siteId}/${popId}/accounts`
  const [account, setAccount] = useState<TreasuryAccountTableRow | null>(null)
  const [children, setChildren] = useState<TreasuryChildAccountRow[]>([])
  const [isMother, setIsMother] = useState(true)
  const [parentAccount, setParentAccount] = useState<{
    id: string
    name: string
  } | null>(null)
  const [fundingAccounts, setFundingAccounts] = useState<TreasuryFundingOption[]>(
    [],
  )
  const [canUpdate, setCanUpdate] = useState(false)
  const [canSettle, setCanSettle] = useState(false)
  const [mercadopagoConnection, setMercadopagoConnection] =
    useState<PopMercadoPagoConnectionPublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailData, setDetailData] = useState<TreasuryAccountDetailResult | null>(
    null,
  )
  const [section, setSection] = useState<DetailSection>("resumen")
  const [datePreset, setDatePreset] =
    useState<DataWorkspaceDatePreset>("this_month")
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >(undefined)

  const dateBounds = useMemo(
    () => computeDataWorkspaceDateBounds(datePreset, customDateRange),
    [datePreset, customDateRange],
  )

  const [csvText, setCsvText] = useState("")
  const [csvImporting, setCsvImporting] = useState(false)
  const [csvBanner, setCsvBanner] = useState<string | null>(null)
  const [manualDate, setManualDate] = useState(defaultTreasuryPeriodEnd())
  const [manualDesc, setManualDesc] = useState("")
  const [manualAmount, setManualAmount] = useState("")
  const [manualDirection, setManualDirection] = useState<"in" | "out">("out")
  const [manualSaving, setManualSaving] = useState(false)
  const [reconcileBusyKey, setReconcileBusyKey] = useState<string | null>(null)
  const [manualLineOpen, setManualLineOpen] = useState(false)

  const [settleChild, setSettleChild] = useState<TreasuryChildAccountRow | null>(
    null,
  )
  const [settleAmount, setSettleAmount] = useState("")
  const [settleDate, setSettleDate] = useState(defaultTreasuryPeriodEnd())
  const [settleFundingId, setSettleFundingId] = useState("")
  const [settleNotes, setSettleNotes] = useState("")
  const [settleSaving, setSettleSaving] = useState(false)
  const [settleBanner, setSettleBanner] = useState<string | null>(null)

  const [posChild, setPosChild] = useState<TreasuryChildAccountRow | null>(null)
  const [posAmount, setPosAmount] = useState("")
  const [posDate, setPosDate] = useState(defaultTreasuryPeriodEnd())
  const [posNotes, setPosNotes] = useState("")
  const [posSaving, setPosSaving] = useState(false)
  const [posBanner, setPosBanner] = useState<string | null>(null)

  const [reconcileOpen, setReconcileOpen] = useState(false)
  const [selectedIntegrationChild, setSelectedIntegrationChild] =
    useState<TreasuryChildAccountRow | null>(null)
  const [childReconciliationRefreshKey, setChildReconciliationRefreshKey] =
    useState(0)

  useEffect(() => {
    if (!selectedIntegrationChild) return
    const updated = children.find((c) => c.id === selectedIntegrationChild.id)
    if (updated) setSelectedIntegrationChild(updated)
  }, [children, selectedIntegrationChild?.id])

  const loadPage = useCallback(async () => {
    if (!popId || !accountId) return null
    const res = await getTreasuryAccountPageData(popId, accountId)
    if (!res.success) {
      setError(res.error || "Error")
      return null
    }
    setAccount(res.account)
    setChildren(res.children)
    setIsMother(res.isMother)
    setParentAccount(res.parentAccount)
    setFundingAccounts(res.fundingAccounts)
    setCanUpdate(res.canUpdate)
    setCanSettle(res.canSettle)
    setMercadopagoConnection(res.mercadopagoConnection)
    setError(null)
    return res
  }, [popId, accountId])

  const loadDetail = useCallback(
    async (pageRes?: Awaited<ReturnType<typeof getTreasuryAccountPageData>>) => {
      if (!popId || !accountId) return
      setDetailLoading(true)
      setDetailError(null)

      let childIds: string[] = []
      if (pageRes?.success && pageRes.isMother) {
        childIds = pageRes.children.map((c) => c.id)
      } else if (isMother && children.length > 0) {
        childIds = children.map((c) => c.id)
      }

      const res = await getTreasuryAccountDetail(popId, accountId, {
        dateFrom: dateBounds.from ?? "",
        dateTo: dateBounds.to ?? "",
        includeRelatedAccounts: childIds.length > 0,
        relatedTreasuryAccountIds: childIds,
      })
      setDetailLoading(false)
      if (!res.success) {
        setDetailError(res.error)
        return
      }
      setDetailData(res.data)
    },
    [popId, accountId, dateBounds.from, dateBounds.to, isMother, children],
  )

  useEffect(() => {
    if (!popId || !accountId) {
      setLoading(false)
      setError("No se encontró la cuenta.")
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setSection("resumen")
      setError(null)
      setDetailData(null)
      setSelectedIntegrationChild(null)
      try {
        await loadPage()
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [popId, accountId, loadPage])

  useLayoutEffect(() => {
    if (!popId || !accountId || loading || !account) return
    setDetailLoading(true)
  }, [popId, accountId, loading, account, dateBounds.from, dateBounds.to])

  useEffect(() => {
    if (!popId || !accountId || loading || !account) return
    void loadDetail()
  }, [
    popId,
    accountId,
    loading,
    account,
    dateBounds.from,
    dateBounds.to,
    loadDetail,
  ])

  const reloadAll = useCallback(async () => {
    setLoading(true)
    try {
      const pageRes = await loadPage()
      if (pageRes?.success) await loadDetail(pageRes)
    } finally {
      setLoading(false)
    }
  }, [loadPage, loadDetail])

  const handleImportCsv = async () => {
    if (!popId || !csvText.trim()) return
    setCsvImporting(true)
    setCsvBanner(null)
    const res = await importBankStatementCsv(popId, accountId, csvText)
    setCsvImporting(false)
    if (!res.success) {
      setCsvBanner(res.error)
      return
    }
    const warn =
      res.warnings.length > 0
        ? `Importadas ${res.imported} líneas con ${res.warnings.length} advertencias.`
        : `Se importaron ${res.imported} líneas.`
    setCsvBanner(warn)
    setCsvText("")
    await reloadAll()
  }

  const handleAddManualLine = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId) return
    setManualSaving(true)
    setCsvBanner(null)
    const res = await addManualBankStatementLine(popId, accountId, {
      lineDate: manualDate,
      description: manualDesc,
      amount: Number(String(manualAmount).replace(",", ".")),
      direction: manualDirection,
    })
    setManualSaving(false)
    if (!res.success) {
      setCsvBanner(res.error)
      return
    }
    setManualDesc("")
    setManualAmount("")
    await reloadAll()
  }

  const handleDeleteStatementLine = async (lineId: string) => {
    if (!popId) return
    const res = await deleteBankStatementLine(popId, lineId)
    if (!res.success) {
      setCsvBanner(res.error)
      return
    }
    await reloadAll()
  }

  const handleReconcileMovement = async (m: PaymentMethodMovementRow) => {
    if (!popId) return
    const key = `${m.kind}:${m.movementRefId}`
    setReconcileBusyKey(key)
    const match =
      detailData?.statementLines != null
        ? findMatchingBankStatementLine(m, detailData.statementLines)
        : null
    const res = await setMovementReconciliation(
      popId,
      accountId,
      m.kind,
      m.movementRefId,
      match?.id ?? null,
    )
    setReconcileBusyKey(null)
    if (!res.success) {
      setDetailError(res.error)
      return
    }
    await reloadAll()
  }

  const handleUnreconcileMovement = async (m: PaymentMethodMovementRow) => {
    if (!popId) return
    const key = `${m.kind}:${m.movementRefId}`
    setReconcileBusyKey(key)
    const res = await clearMovementReconciliation(popId, m.kind, m.movementRefId)
    setReconcileBusyKey(null)
    if (!res.success) {
      setDetailError(res.error)
      return
    }
    await reloadAll()
  }

  const toggleIntegrationChild = (child: TreasuryChildAccountRow) => {
    setSelectedIntegrationChild((prev) =>
      prev?.id === child.id ? null : child,
    )
  }

  const openPayCard = (child: TreasuryChildAccountRow) => {
    setSettleBanner(null)
    setSettleChild(child)
    setSettleAmount(
      child.outstandingBalance > 0 ? String(child.outstandingBalance) : "",
    )
    setSettleDate(defaultTreasuryPeriodEnd())
    setSettleFundingId(fundingAccounts[0]?.id ?? "")
    setSettleNotes("")
  }

  const submitSettle = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !settleChild) return
    setSettleSaving(true)
    setSettleBanner(null)
    const res = await recordTreasurySettlementForAccount(popId, {
      cardTreasuryAccountId: settleChild.id,
      fundingTreasuryAccountId: settleFundingId,
      principalAmount: Number(String(settleAmount).replace(",", ".")),
      settledAt: settleDate,
      notes: settleNotes,
    })
    setSettleSaving(false)
    if (!res.success) {
      setSettleBanner(res.error)
      return
    }
    setSettleChild(null)
    await reloadAll()
  }

  const openPosAcredit = (child: TreasuryChildAccountRow) => {
    setPosBanner(null)
    setPosChild(child)
    setPosAmount(
      (child.ledgerBalance ?? 0) > 0 ? String(child.ledgerBalance) : "",
    )
    setPosDate(defaultTreasuryPeriodEnd())
    setPosNotes("")
  }

  const submitPosAcredit = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !posChild) return
    setPosSaving(true)
    setPosBanner(null)
    const motherId = isMother ? accountId : (parentAccount?.id ?? "")
    if (!motherId) {
      setPosBanner("No se encontró la cuenta madre.")
      setPosSaving(false)
      return
    }
    const res = await recordPosAcreditationForAccount(popId, {
      posTreasuryAccountId: posChild.id,
      motherTreasuryAccountId: motherId,
      principalAmount: Number(String(posAmount).replace(",", ".")),
      creditedAt: posDate,
      notes: posNotes,
    })
    setPosSaving(false)
    if (!res.success) {
      setPosBanner(res.error)
      return
    }
    setPosChild(null)
    await reloadAll()
  }

  const brand = account
    ? resolveTreasuryAccountBrand({
        kind: account.kind,
        brandKey: account.brandKey,
        name: account.name,
      })
    : null

  const posChildren = children.filter((c) => c.childRole === "pos")
  const cardChildren = children.filter((c) => c.childRole === "card_payable")
  const recentMovements = detailData?.movements.slice(0, 12) ?? []
  const isCashAccount = account?.kind === "cash"
  const showTreasuryMovementDetails =
    account?.kind === "bank" || account?.kind === "wallet"
  const isMovementsOnlyView =
    account?.kind === "cash" ||
    account?.kind === "bank" ||
    account?.kind === "wallet"
  const isMotherBankWallet =
    isMother &&
    (account?.kind === "bank" || account?.kind === "wallet")
  const skeletonProfile = resolveTreasuryDetailSkeletonProfile(
    account?.kind ?? resolvedKindHint,
  )
  const periodContentSkeleton = (
    <TreasuryAccountDetailContentSkeleton bodyOnly />
  )

  const integrationChildren = [...posChildren, ...cardChildren]
  const tabItems: { id: DetailSection; label: string }[] = [
    { id: "resumen", label: "Resumen" },
    { id: "movimientos", label: "Movimientos" },
    ...(detailData?.supportsBankReconciliation
      ? [{ id: "conciliacion" as const, label: "Conciliación" }]
      : []),
  ]

  const handleExportPeriod = () => {
    if (!account || !detailData) return
    exportTreasuryAccountPeriodCsv({
      accountName: account.name,
      dateFrom: dateBounds.from ?? "",
      dateTo: dateBounds.to ?? "",
      movements: detailData.movements,
      totals: detailData.movementTotals,
      periodSummary: detailData.periodSummary,
      includeTreasuryDetails: showTreasuryMovementDetails,
    })
  }

  const periodFilter = (
    <DataWorkspacePeriodFilter
      variant="compact"
      showActiveState={false}
      preset={datePreset}
      customRange={customDateRange}
      onPresetChange={setDatePreset}
      onCustomRangeChange={setCustomDateRange}
      bounds={dateBounds}
    />
  )

  const exportPeriodButton = (
    <RootsDefaultButton
      type="button"
      withIcon
      disabled={
        detailLoading || !detailData || detailData.movements.length === 0
      }
      onClick={handleExportPeriod}
      className="self-end lg:self-auto"
    >
      <Download className="size-4 shrink-0" aria-hidden />
      Resumen del período
    </RootsDefaultButton>
  )

  const movementsToolbar = (
    <div className={dataWorkspaceDetailToolbarClass}>
      <div className="min-w-0 flex-1">{periodFilter}</div>
      {exportPeriodButton}
    </div>
  )

  const periodSummary = detailData?.periodSummary ?? null

  const periodBalanceStrip = periodSummary ? (
    <div className={dashboardBalanceStripClass}>
      {periodSummary.openingBalance != null ? (
        <DashboardKpi
          label="Saldo anterior al período"
          value={fmt.format(periodSummary.openingBalance)}
        />
      ) : null}
      <DashboardKpi
        label="Saldo del período"
        value={fmt.format(periodSummary.currentBalance)}
      />
    </div>
  ) : detailData ? (
    <div className={dashboardKpiStripClass}>
      <DashboardKpi
        label="Ingresos del período"
        value={fmt.format(detailData.movementTotals.in)}
      />
      <DashboardKpi
        label="Egresos del período"
        value={fmt.format(detailData.movementTotals.out)}
      />
    </div>
  ) : null

  const periodMovementsBody = detailLoading ? (
    <TreasuryAccountDetailContentSkeleton bodyOnly />
  ) : detailData ? (
    isMovementsOnlyView ? (
      <TreasuryCashMovementsTable
        movements={detailData.movements}
        fullWidth
      />
    ) : (
      <div className={dashboardBodyClass}>
        <DashboardSectionHeader
          title="Últimos movimientos"
          description="Vista rápida del período seleccionado"
        />
        {recentMovements.length > 0 ? (
          <MovementList movements={recentMovements} compact embedded />
        ) : (
          <DashboardEmptyState message="No hay movimientos recientes en este período." />
        )}
      </div>
    )
  ) : null

  const resumenContent = detailLoading ? (
    <TreasuryAccountDetailContentSkeleton />
  ) : detailData ? (
    isMovementsOnlyView ? (
      <>
        {periodBalanceStrip}
        <TreasuryCashMovementsTable
          movements={detailData.movements}
          fullWidth
        />
      </>
    ) : (
      <>
        {periodBalanceStrip}
        <div className={dashboardBodyClass}>
          <DashboardSectionHeader
            title="Últimos movimientos"
            description="Vista rápida del período seleccionado"
          />
          {recentMovements.length > 0 ? (
            <MovementList movements={recentMovements} compact embedded />
          ) : (
            <DashboardEmptyState message="No hay movimientos recientes en este período." />
          )}
        </div>
      </>
    )
  ) : null

  const flushMovementsPanel =
    isMotherBankWallet && selectedIntegrationChild ? (
      <TreasuryChildReconciliationPanel
        popId={popId}
        motherAccountId={accountId}
        child={selectedIntegrationChild}
        canConciliar={canUpdate}
        datePreset={datePreset}
        customDateRange={customDateRange}
        dateBounds={dateBounds}
        onPresetChange={setDatePreset}
        onCustomRangeChange={setCustomDateRange}
        onConciliar={() => setReconcileOpen(true)}
        refreshKey={childReconciliationRefreshKey}
      />
    ) : (
      <div className={dataWorkspaceFlushBottomPanelClass}>
        <div className={dataWorkspaceFlushBottomPanelChromeClass}>
          {movementsToolbar}
          {detailError ? (
            <div className="border-b border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive lg:px-5">
              {detailError}
            </div>
          ) : null}
          {detailLoading ? (
            <TreasuryAccountDetailContentSkeleton chromeOnly />
          ) : (
            periodBalanceStrip
          )}
        </div>
        <div className={dataWorkspaceFlushBottomPanelBodyClass}>
          {periodMovementsBody}
        </div>
      </div>
    )

  const bottomPanelContent =
    isMovementsOnlyView ? (
      flushMovementsPanel
    ) : (
      <>
        {movementsToolbar}
        {detailError ? (
          <div className="border-b border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive lg:px-5">
            {detailError}
          </div>
        ) : null}
        {resumenContent}
      </>
    )

  const useFlushMovementsLayout =
    skeletonProfile.layout === "movements" ||
    (!loading && account != null && isMovementsOnlyView)

  return (
    <>
      <div className="relative flex w-full min-h-full flex-1 flex-col">
        <div
          className={cn(
            "relative flex w-full flex-1 flex-col",
            useFlushMovementsLayout
              ? "min-h-full gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8"
              : "gap-6 px-4 py-6 sm:px-6 lg:px-8",
          )}
        >
          {loading ? (
            <TreasuryAccountDetailSkeleton profile={skeletonProfile} />
          ) : error ? (
            <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : account ? (
            <>
              <article className={cn("shrink-0", dataWorkspaceDetailCardClass)}>
                <div className={dataWorkspaceDetailCardHeaderClass}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <RootsIconButton
                        theme="workspace"
                        emphasis="ghost"
                        size="default"
                        label="Volver a cuentas"
                        href={accountsBasePath}
                        className="shrink-0"
                      >
                        <ArrowLeft aria-hidden />
                      </RootsIconButton>
                      <TreasuryBrandIsotype
                        brandKey={brand?.key}
                        monogram={
                          brand?.monogram ??
                          (account.name.slice(0, 2).toUpperCase() || "—")
                        }
                        size="lg"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                          {treasuryKindLabel(account.kind)}
                          {!account.isActive ? " · Inactiva" : ""}
                        </p>
                        <TreasuryBrandName
                          preset={brand}
                          name={account.name}
                          textClass="text-foreground"
                          className="mt-0.5 text-lg font-semibold sm:text-xl"
                        />
                        {parentAccount ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Vinculada a{" "}
                            <Link
                              href={`${accountsBasePath}/${parentAccount.id}`}
                              className="font-medium text-foreground underline-offset-2 hover:underline"
                            >
                              {parentAccount.name}
                            </Link>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {isMotherBankWallet && integrationChildren.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
                        {posChildren.map((child) => (
                          <ChildIntegrationChip
                            key={child.id}
                            child={child}
                            compact
                            selected={selectedIntegrationChild?.id === child.id}
                            onToggle={toggleIntegrationChild}
                          />
                        ))}
                        {cardChildren.map((child) => (
                          <ChildIntegrationChip
                            key={child.id}
                            child={child}
                            compact
                            selected={selectedIntegrationChild?.id === child.id}
                            onToggle={toggleIntegrationChild}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className={dataWorkspaceDetailCardStatsClass}>
                  <TreasuryStat
                    label="Saldo real"
                    value={moneyOrDash(account.ledgerBalance)}
                    large
                    className="lg:min-w-36"
                  />
                  {!isCashAccount ? (
                    <>
                      <TreasuryStat
                        label="A liquidar"
                        value={integrationBalanceOrDash(
                          account.hasPosIntegration,
                          account.toLiquidateBalance,
                        )}
                        className="lg:min-w-28"
                      />
                      <TreasuryStat
                        label="A pagar"
                        value={integrationBalanceOrDash(
                          account.hasCardIntegration,
                          account.toPayBalance,
                        )}
                        className="lg:min-w-28"
                      />
                    </>
                  ) : null}
                  {account.isCardPayable ? (
                    <TreasuryStat
                      label="Deuda del resumen"
                      value={fmt.format(account.outstandingBalance)}
                      className="lg:min-w-36"
                    />
                  ) : null}
                </div>

                {!isMother && account.isCardPayable && canSettle ? (
                  <div className="border-t border-[var(--rootsy-bruma-200)] bg-white px-4 py-3 sm:px-6 lg:px-8">
                    <RootsPrimaryButton
                      type="button"
                      disabled={account.outstandingBalance <= 0}
                      onClick={() =>
                        openPayCard({
                          id: account.id,
                          name: account.name,
                          kind: account.kind,
                          chartAccountCode: account.chartAccountCode,
                          ledgerBalance: account.ledgerBalance,
                          childRole: "card_payable",
                          outstandingBalance: account.outstandingBalance,
                          settledTotal: account.settledTotal,
                        })
                      }
                    >
                      Pagar resumen
                    </RootsPrimaryButton>
                  </div>
                ) : null}

                {!isMother &&
                !account.isCardPayable &&
                (account.ledgerBalance ?? 0) > 0 &&
                canUpdate &&
                parentAccount ? (
                  <div className="border-t border-[var(--rootsy-bruma-200)] bg-white px-4 py-3 sm:px-6 lg:px-8">
                    <RootsPrimaryButton
                      type="button"
                      onClick={() =>
                        openPosAcredit({
                          id: account.id,
                          name: account.name,
                          kind: account.kind,
                          chartAccountCode: account.chartAccountCode,
                          ledgerBalance: account.ledgerBalance,
                          childRole: "pos",
                          outstandingBalance: 0,
                          settledTotal: 0,
                        })
                      }
                    >
                      Registrar acreditación
                    </RootsPrimaryButton>
                  </div>
                ) : null}

                {isMother &&
                treasuryAccountOffersMercadoPagoConnection(account) ? (
                  <TreasuryMercadoPagoConnectionPanel
                    siteId={siteId}
                    popId={popId}
                    treasuryAccountId={account.id}
                    connection={mercadopagoConnection}
                    canUpdate={canUpdate}
                    onChanged={() => void loadPage()}
                  />
                ) : null}
              </article>

              {isMovementsOnlyView ? (
                bottomPanelContent
              ) : (
              <Tabs
                value={section}
                onValueChange={(v) => setSection(v as DetailSection)}
                className="w-full"
              >
                <div className={cn(shellCard, "overflow-hidden")}>
                  <div className={dataWorkspaceDetailToolbarClass}>
                    <TabsList
                      className={cn(
                        "grid h-auto w-full gap-1 rounded-lg border border-border/60 bg-white p-1 shadow-sm",
                        tabItems.length === 2 && "grid-cols-2",
                        tabItems.length === 3 && "grid-cols-3",
                        "lg:w-auto lg:min-w-[22rem]",
                      )}
                    >
                      {tabItems.map((tab) => (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="rounded-md py-2 text-xs font-semibold sm:text-sm"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {periodFilter}
                  </div>

                  {detailError ? (
                    <div className="border-b border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive lg:px-5">
                      {detailError}
                    </div>
                  ) : null}

                  <TabsContent value="resumen" className="mt-0">
                    {resumenContent}
                  </TabsContent>

                  <TabsContent value="movimientos" className="mt-0">
                    {detailLoading ? (
                      periodContentSkeleton
                    ) : detailData ? (
                      <>
                        {detailData.settlements.length > 0 ? (
                          <div className={dashboardBodyClass}>
                            <DashboardSectionHeader title="Liquidaciones del resumen" />
                            <ul className="divide-y divide-border/50 rounded-lg border border-border/60">
                              {detailData.settlements.map((s: TreasurySettlementRow) => (
                                <li
                                  key={s.id}
                                  className="flex items-start justify-between gap-2 px-3 py-2.5 text-sm"
                                >
                                  <div>
                                    <p className="font-numeric tabular-nums text-foreground">
                                      {fmt.format(s.amount)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatTreasuryShortDate(s.settledAt)}
                                      {s.fundingMethodName
                                        ? ` · desde ${s.fundingMethodName}`
                                        : ""}
                                      {s.notes ? ` · ${s.notes}` : ""}
                                    </p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        <div
                          className={cn(
                            dashboardBodyClass,
                            detailData.settlements.length > 0 && dashboardSectionClass,
                          )}
                        >
                          <DashboardSectionHeader title="Movimientos del período" />
                          {detailData.movements.length === 0 ? (
                            <DashboardEmptyState message="No hay movimientos en el período seleccionado." />
                          ) : (
                            <MovementList
                              movements={detailData.movements}
                              embedded
                              supportsReconciliation={
                                detailData.supportsBankReconciliation
                              }
                              statementLines={detailData.statementLines}
                              canUpdate={canUpdate}
                              reconcileBusyKey={reconcileBusyKey}
                              onReconcile={handleReconcileMovement}
                              onUnreconcile={handleUnreconcileMovement}
                            />
                          )}
                        </div>
                      </>
                    ) : null}
                  </TabsContent>

                  {detailData?.supportsBankReconciliation ? (
                    <TabsContent value="conciliacion" className="mt-0">
                      {detailLoading ? (
                        periodContentSkeleton
                      ) : detailData ? (
                        <ReconciliationPanel
                          detailData={detailData}
                          csvText={csvText}
                          setCsvText={setCsvText}
                          csvImporting={csvImporting}
                          csvBanner={csvBanner}
                          canUpdate={canUpdate}
                          manualLineOpen={manualLineOpen}
                          setManualLineOpen={setManualLineOpen}
                          manualDate={manualDate}
                          setManualDate={setManualDate}
                          manualDesc={manualDesc}
                          setManualDesc={setManualDesc}
                          manualAmount={manualAmount}
                          setManualAmount={setManualAmount}
                          manualDirection={manualDirection}
                          setManualDirection={setManualDirection}
                          manualSaving={manualSaving}
                          reconcileBusyKey={reconcileBusyKey}
                          onImportCsv={() => void handleImportCsv()}
                          onAddManualLine={(e) => void handleAddManualLine(e)}
                          onDeleteLine={(id) => void handleDeleteStatementLine(id)}
                          onReconcile={handleReconcileMovement}
                          onUnreconcile={handleUnreconcileMovement}
                        />
                      ) : null}
                    </TabsContent>
                  ) : null}
                </div>
              </Tabs>
              )}
            </>
          ) : null}
        </div>
      </div>

      {account && selectedIntegrationChild && isMotherBankWallet ? (
        <TreasuryReconcileModal
          open={reconcileOpen}
          onOpenChange={setReconcileOpen}
          popId={popId}
          motherAccountId={accountId}
          child={selectedIntegrationChild}
          fundingAccounts={fundingAccounts}
          canSubmit={canUpdate}
          globalPendingBalance={
            selectedIntegrationChild.childRole === "pos"
              ? (selectedIntegrationChild.ledgerBalance ?? 0)
              : selectedIntegrationChild.outstandingBalance
          }
          onCompleted={async () => {
            setChildReconciliationRefreshKey((key) => key + 1)
            await reloadAll()
          }}
        />
      ) : null}

      <Dialog open={settleChild !== null} onOpenChange={(o) => !o && setSettleChild(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pagar resumen</DialogTitle>
            <DialogDescription>
              Registrá el pago del resumen de{" "}
              <strong>{settleChild?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          {settleBanner ? (
            <p className="text-sm text-destructive">{settleBanner}</p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitSettle(e)}>
            <div className="space-y-2">
              <Label htmlFor="settle-amount">Importe</Label>
              <Input
                id="settle-amount"
                type="number"
                min={0}
                step="0.01"
                required
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                className="font-numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settle-date">Fecha de pago</Label>
              <DatePicker
                id="settle-date"
                value={settleDate}
                onChange={setSettleDate}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settle-funding">Pagado desde</Label>
              <select
                id="settle-funding"
                required
                value={settleFundingId}
                onChange={(e) => setSettleFundingId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {fundingAccounts.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settle-notes">Notas (opcional)</Label>
              <Input
                id="settle-notes"
                value={settleNotes}
                onChange={(e) => setSettleNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSettleChild(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={settleSaving}>
                {settleSaving ? "Registrando…" : "Registrar pago"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={posChild !== null} onOpenChange={(o) => !o && setPosChild(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar acreditación POS</DialogTitle>
            <DialogDescription>
              Transferí el saldo a liquidar de{" "}
              <strong>{posChild?.name}</strong> al saldo real de la cuenta madre.
            </DialogDescription>
          </DialogHeader>
          {posBanner ? (
            <p className="text-sm text-destructive">{posBanner}</p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitPosAcredit(e)}>
            <div className="space-y-2">
              <Label htmlFor="pos-amount">Importe acreditado</Label>
              <Input
                id="pos-amount"
                type="number"
                min={0}
                step="0.01"
                required
                value={posAmount}
                onChange={(e) => setPosAmount(e.target.value)}
                className="font-numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pos-date">Fecha de acreditación</Label>
              <DatePicker
                id="pos-date"
                value={posDate}
                onChange={setPosDate}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pos-notes">Notas (opcional)</Label>
              <Input
                id="pos-notes"
                value={posNotes}
                onChange={(e) => setPosNotes(e.target.value)}
                placeholder="Ej. Liquidación semanal Mercado Pago"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPosChild(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={posSaving}>
                {posSaving ? "Registrando…" : "Registrar acreditación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function MovementList({
  movements,
  compact,
  embedded,
  supportsReconciliation,
  statementLines,
  canUpdate,
  reconcileBusyKey,
  onReconcile,
  onUnreconcile,
}: {
  movements: PaymentMethodMovementRow[]
  compact?: boolean
  embedded?: boolean
  supportsReconciliation?: boolean
  statementLines?: BankStatementLineRow[]
  canUpdate?: boolean
  reconcileBusyKey?: string | null
  onReconcile?: (m: PaymentMethodMovementRow) => void
  onUnreconcile?: (m: PaymentMethodMovementRow) => void
}) {
  return (
    <TreasuryGroupedMovementsList
      movements={movements}
      fullWidth={embedded}
      className={cn(
        "overflow-y-auto",
        embedded ? undefined : "rounded-xl",
        compact ? "max-h-64" : "max-h-128",
      )}
      renderRowTrailing={(m) => {
        const busyKey = `${m.kind}:${m.movementRefId}`
        const isBusy = reconcileBusyKey === busyKey

        return (
          <>
            {m.reconciled ? (
              <CheckCircle2
                className="size-3.5 shrink-0 text-emerald-600"
                aria-label="Conciliado"
              />
            ) : null}
            {supportsReconciliation && canUpdate && onReconcile && onUnreconcile ? (
              m.reconciled ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  disabled={isBusy}
                  onClick={() => onUnreconcile(m)}
                >
                  {isBusy ? "…" : "Deshacer"}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  disabled={isBusy}
                  onClick={() => onReconcile(m)}
                >
                  {isBusy ? "…" : "Conciliar"}
                </Button>
              )
            ) : null}
          </>
        )
      }}
    />
  )
}

function ReconciliationPanel({
  detailData,
  csvText,
  setCsvText,
  csvImporting,
  csvBanner,
  canUpdate,
  manualLineOpen,
  setManualLineOpen,
  manualDate,
  setManualDate,
  manualDesc,
  setManualDesc,
  manualAmount,
  setManualAmount,
  manualDirection,
  setManualDirection,
  manualSaving,
  reconcileBusyKey,
  onImportCsv,
  onAddManualLine,
  onDeleteLine,
  onReconcile,
  onUnreconcile,
}: {
  detailData: TreasuryAccountDetailResult
  csvText: string
  setCsvText: (v: string) => void
  csvImporting: boolean
  csvBanner: string | null
  canUpdate: boolean
  manualLineOpen: boolean
  setManualLineOpen: (v: boolean) => void
  manualDate: string
  setManualDate: (v: string) => void
  manualDesc: string
  setManualDesc: (v: string) => void
  manualAmount: string
  setManualAmount: (v: string) => void
  manualDirection: "in" | "out"
  setManualDirection: (v: "in" | "out") => void
  manualSaving: boolean
  reconcileBusyKey: string | null
  onImportCsv: () => void
  onAddManualLine: (e: FormEvent) => void
  onDeleteLine: (lineId: string) => void
  onReconcile: (m: PaymentMethodMovementRow) => void
  onUnreconcile: (m: PaymentMethodMovementRow) => void
}) {
  const summary = detailData.reconciliationSummary
  const totalMovements =
    summary.movementsReconciled + summary.movementsPending
  const progressPct =
    totalMovements > 0
      ? Math.round((summary.movementsReconciled / totalMovements) * 100)
      : 0
  const pendingMovements = detailData.movements.filter((m) => !m.reconciled)
  const reconciledMovements = detailData.movements.filter((m) => m.reconciled)

  return (
    <>
      <div className={dashboardKpiStripClass}>
        <DashboardKpi
          label="Conciliados"
          value={String(summary.movementsReconciled)}
          hint={`de ${totalMovements} movimientos`}
        />
        <DashboardKpi
          label="Pendientes"
          value={String(summary.movementsPending)}
          hint="por cruzar con el extracto"
        />
        <DashboardKpi
          label="Extracto cargado"
          value={String(detailData.statementLines.length)}
          hint={`${summary.statementReconciled} ya usadas`}
        />
      </div>

      <div className={dashboardBodyClass}>
        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
          <span className="font-medium text-foreground">Progreso de conciliación</span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {progressPct}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted/80">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Importá el extracto del banco y marcá los movimientos que coincidan.
        </p>
      </div>

      {csvBanner ? (
        <div className="border-t border-border/60 px-4 py-3 lg:px-5">
          <p
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              csvBanner.startsWith("Se importaron") || csvBanner.includes("Importadas")
                ? "border-emerald-200/70 bg-emerald-50/80 text-emerald-900"
                : "border-destructive/25 bg-destructive/5 text-destructive",
            )}
          >
            {csvBanner}
          </p>
        </div>
      ) : null}

      <div className={dashboardSectionClass}>
        <DashboardSectionHeader
          title="Cargar extracto"
          description="Pegá el CSV del banco (fecha, descripción, importe) y tocá importar."
        />
        <Textarea
          id="csv-import"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={3}
          placeholder="2026-01-15,Transferencia recibida,-15000"
          className="text-xs"
          disabled={!canUpdate || csvImporting}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={!canUpdate || csvImporting || !csvText.trim()}
            onClick={onImportCsv}
          >
            <Upload className="mr-1.5 size-3.5" />
            {csvImporting ? "Importando…" : "Importar extracto"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="gap-1.5"
            onClick={() => setManualLineOpen(!manualLineOpen)}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                manualLineOpen && "rotate-180",
              )}
            />
            Agregar línea manual
          </Button>
        </div>

        {manualLineOpen ? (
          <form
            className="mt-4 space-y-3 border-t border-border/60 pt-4"
            onSubmit={onAddManualLine}
          >
            <div className="grid grid-cols-2 gap-2">
              <DatePicker
                value={manualDate}
                onChange={setManualDate}
                disabled={!canUpdate || manualSaving}
                className="w-full"
              />
              <select
                value={manualDirection}
                onChange={(e) =>
                  setManualDirection(e.target.value as "in" | "out")
                }
                className="flex h-10 rounded-md border border-input bg-background px-2 text-sm"
                disabled={!canUpdate || manualSaving}
              >
                <option value="out">Salida</option>
                <option value="in">Entrada</option>
              </select>
            </div>
            <Input
              required
              placeholder="Descripción"
              value={manualDesc}
              onChange={(e) => setManualDesc(e.target.value)}
              disabled={!canUpdate || manualSaving}
            />
            <Input
              type="number"
              min={0}
              step="0.01"
              required
              placeholder="Importe"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              className="font-numeric"
              disabled={!canUpdate || manualSaving}
            />
            <Button type="submit" size="sm" disabled={!canUpdate || manualSaving}>
              {manualSaving ? "Agregando…" : "Agregar línea"}
            </Button>
          </form>
        ) : null}
      </div>

      {pendingMovements.length > 0 ? (
        <div className={dashboardSectionClass}>
          <DashboardSectionHeader
            title="Pendientes de conciliar"
            description="Tocá conciliar cuando el movimiento coincida con una línea del extracto."
          />
          <MovementList
            movements={pendingMovements}
            embedded
            supportsReconciliation
            statementLines={detailData.statementLines}
            canUpdate={canUpdate}
            reconcileBusyKey={reconcileBusyKey}
            onReconcile={onReconcile}
            onUnreconcile={onUnreconcile}
          />
        </div>
      ) : (
        <div className={dashboardSectionClass}>
          <div className="flex min-h-[10rem] flex-col items-center justify-center text-center">
            <CheckCircle2 className="size-8 text-emerald-600" aria-hidden />
            <p className="mt-2 text-sm font-medium text-foreground">
              No hay movimientos pendientes
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Todos los movimientos del período están conciliados.
            </p>
          </div>
        </div>
      )}

      {reconciledMovements.length > 0 ? (
        <div className={dashboardSectionClass}>
          <DashboardSectionHeader
            title={`Ya conciliados (${reconciledMovements.length})`}
          />
          <MovementList
            movements={reconciledMovements.slice(0, 8)}
            compact
            embedded
            supportsReconciliation
            canUpdate={canUpdate}
            reconcileBusyKey={reconcileBusyKey}
            onReconcile={onReconcile}
            onUnreconcile={onUnreconcile}
          />
        </div>
      ) : null}

      <div className={dashboardSectionClass}>
        <DashboardSectionHeader
          title="Líneas del extracto"
          description={
            detailData.statementLines.length === 0
              ? "Todavía no cargaste extracto para este período."
              : `${detailData.statementLines.length} líneas · ${summary.statementReconciled} usadas en conciliaciones`
          }
        />
        {detailData.statementLines.length === 0 ? (
          <DashboardEmptyState message="Importá el CSV del banco arriba para empezar." />
        ) : (
          <ul className="max-h-56 divide-y divide-border/50 overflow-y-auto rounded-lg border border-border/60">
            {detailData.statementLines.map((line) => (
              <li
                key={line.id}
                className="flex items-center justify-between gap-2 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {line.description || "Sin descripción"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTreasuryShortDate(line.lineDate)}
                    {line.reconciled ? " · Conciliada" : " · Disponible"}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 whitespace-nowrap font-numeric text-sm tabular-nums",
                    line.direction === "in"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-rose-700 dark:text-rose-400",
                  )}
                >
                  {formatTreasurySignedAmount(line.direction, line.amount)}
                </span>
                {canUpdate && !line.reconciled ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0"
                    aria-label="Eliminar línea"
                    onClick={() => onDeleteLine(line.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
