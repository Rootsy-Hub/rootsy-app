"use client"

import type { TreasuryChildAccountRow } from "@/app/[siteId]/[popId]/accounts/actions"
import {
  getTreasuryReconciliationHistory,
  type TreasuryPosSummaryMovementRow,
  type TreasuryReconciliationEventRow,
} from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import {
  TREASURY_CARD_OTHER_CHARGES_LABEL,
  TREASURY_RECONCILE_COMMISSIONS_LABEL,
  expandTreasuryReconciliationEventRows,
  formatTreasuryInlineMovementDescription,
  formatTreasuryMovementAmount,
  groupItemsByYearAndDate,
  treasuryMoneyFmt as fmt,
} from "@/app/[siteId]/[popId]/accounts/treasuryAccountUiUtils"
import { TreasuryGroupedSummaryMovementsList } from "@/app/[siteId]/[popId]/accounts/TreasuryGroupedSummaryMovementsList"
import {
  TreasuryInfiniteScrollFooter,
  useTreasuryInfiniteScroll,
} from "@/app/[siteId]/[popId]/accounts/treasuryInfiniteScroll"
import { TreasuryYearGroupedMovementsView } from "@/app/[siteId]/[popId]/accounts/TreasuryYearGroupedMovementsView"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import {
  dataWorkspaceDetailBodyClass,
  dataWorkspaceDetailKpiStripClass,
  dataWorkspaceDetailKpiStripTwoColClass,
  dataWorkspaceDetailToolbarClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardTitleClass,
  dataWorkspaceFlushBottomPanelBodyClass,
  dataWorkspaceFlushBottomPanelChromeClass,
  dataWorkspaceFlushBottomPanelClass,
  dataWorkspaceIntegrationChipBaseClass,
  dataWorkspaceIntegrationChipEyebrowClass,
  dataWorkspaceIntegrationChipIsotypeClass,
  dataWorkspaceIntegrationChipIsotypeSelectedClass,
  dataWorkspaceIntegrationChipSelectedClass,
  dataWorkspaceIntegrationChipSurfaceClass,
  dataWorkspaceIntegrationChipTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsFormSegmentField } from "@/components/rootsy-form"
import { RootsPrimaryButton, rootsButtonCompactSizeClass } from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import {
  type DataWorkspaceDatePreset,
  computeDataWorkspaceDateBounds,
} from "@/lib/dataWorkspaceDateFilter"
import { Banknote, CreditCard, Loader2, Wifi } from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"

function ReconciliationEventsList({
  events,
  timeZone,
  isPos,
  emptyStateMessage,
  scrollRoot = null,
}: {
  events: TreasuryReconciliationEventRow[]
  timeZone: string
  isPos: boolean
  emptyStateMessage: string
  scrollRoot?: HTMLElement | null
}) {
  const { visibleItems, hasMore, totalCount, sentinelRef } =
    useTreasuryInfiniteScroll(events, scrollRoot)
  const displayRows = useMemo(
    () => expandTreasuryReconciliationEventRows(visibleItems, isPos, timeZone),
    [visibleItems, isPos, timeZone],
  )
  const yearGroups = useMemo(
    () => groupItemsByYearAndDate(displayRows, timeZone),
    [displayRows, timeZone],
  )

  return (
    <div className="overflow-hidden">
      <TreasuryYearGroupedMovementsView
        yearGroups={yearGroups}
        emptyMessage={emptyStateMessage}
        fullWidth
        getRowKey={(row) => row.rowKey}
        renderRow={(row) => ({
          description: formatTreasuryInlineMovementDescription(
            row.description,
            row.timeLabel,
          ),
          amount: row.amount,
          suppressTopBorder: row.suppressTopBorder,
          descriptionClassName: row.descriptionClassName,
          amountClassName: row.amountClassName,
        })}
      />
      <TreasuryInfiniteScrollFooter
        hasMore={hasMore}
        totalCount={totalCount}
        sentinelRef={sentinelRef}
        fullWidth
        itemLabel={isPos ? "liquidación" : "pago"}
        itemLabelPlural={isPos ? "liquidaciones" : "pagos"}
      />
    </div>
  )
}

export function TreasuryChildReconciliationPanel({
  popId,
  motherAccountId,
  child,
  canConciliar,
  datePreset,
  customDateRange,
  dateBounds,
  onPresetChange,
  onCustomRangeChange,
  onConciliar,
  refreshKey,
}: {
  popId: string
  motherAccountId: string
  child: TreasuryChildAccountRow
  canConciliar: boolean
  datePreset: DataWorkspaceDatePreset
  customDateRange: DateRange | undefined
  dateBounds: ReturnType<typeof computeDataWorkspaceDateBounds>
  onPresetChange: (preset: DataWorkspaceDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  onConciliar: () => void
  refreshKey?: number
}) {
  const timeZone = usePopTimeZone()
  const [events, setEvents] = useState<TreasuryReconciliationEventRow[]>([])
  const [summaryMovements, setSummaryMovements] = useState<
    TreasuryPosSummaryMovementRow[]
  >([])
  const [openingPendingBalance, setOpeningPendingBalance] = useState<
    number | null
  >(null)
  const [periodToLiquidate, setPeriodToLiquidate] = useState(0)
  const [periodGrossAmount, setPeriodGrossAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [panelTab, setPanelTab] = useState<string>(
    child.childRole === "pos" ? "resumen" : "consumos",
  )

  const isPos = child.childRole === "pos"
  const isSecondaryPanelTab =
    panelTab === "liquidaciones" || panelTab === "pagos"

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getTreasuryReconciliationHistory(popId, motherAccountId, {
      childTreasuryAccountId: child.id,
      childRole: child.childRole,
      dateFrom: dateBounds.from ?? "",
      dateTo: dateBounds.to ?? "",
    })
    setLoading(false)
    if (!res.success) {
      setError(res.error)
      setEvents([])
      setSummaryMovements([])
      setOpeningPendingBalance(null)
      setPeriodToLiquidate(0)
      setPeriodGrossAmount(0)
      return
    }
    setEvents(res.events)
    setSummaryMovements(res.summaryMovements)
    setOpeningPendingBalance(res.openingPendingBalance)
    setPeriodToLiquidate(res.periodToLiquidate)
    setPeriodGrossAmount(res.periodGrossAmount)
  }, [
    popId,
    motherAccountId,
    child.id,
    child.childRole,
    dateBounds.from,
    dateBounds.to,
  ])

  useLayoutEffect(() => {
    setLoading(true)
  }, [dateBounds.from, dateBounds.to, refreshKey])

  useEffect(() => {
    void loadEvents()
  }, [loadEvents, refreshKey])

  useEffect(() => {
    setPanelTab(isPos ? "resumen" : "consumos")
  }, [child.id, isPos])

  const periodPrincipalTotal = events.reduce(
    (sum, event) => sum + event.principalAmount,
    0,
  )
  const periodAdjustmentTotal = events.reduce(
    (sum, event) => sum + event.adjustmentAmount,
    0,
  )
  const periodSettledTotal = events.reduce(
    (sum, event) => sum + event.totalAmount,
    0,
  )
  const periodReceivedInAccount = periodSettledTotal - periodAdjustmentTotal
  const reconciliationsEmptyStateMessage = isPos
    ? "No hay liquidaciones en el período seleccionado"
    : "No hay pagos en el período seleccionado"
  const summaryEmptyStateMessage = isPos
    ? "No hay cobros POS en el período seleccionado"
    : "No hay consumos en el período seleccionado"

  const reconciliationsSummaryBar = (
    <div className={cn("grid shrink-0 grid-cols-1 sm:grid-cols-3", dataWorkspaceDetailKpiStripClass)}>
      <div className="px-4 py-4 lg:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {isPos ? "Liquidado en el período" : "Pagado en el período"}
        </p>
        <p className="mt-1.5 font-numeric text-2xl font-bold tabular-nums tracking-tight text-foreground">
          {loading
            ? "—"
            : isPos
              ? fmt.format(periodSettledTotal)
              : formatTreasuryMovementAmount("out", periodSettledTotal)}
        </p>
      </div>
      {!isPos ? (
        <div className="px-4 py-4 lg:px-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Consumos pagados
          </p>
          <p className="mt-1.5 font-numeric text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {loading
              ? "—"
              : formatTreasuryMovementAmount("out", periodPrincipalTotal)}
          </p>
        </div>
      ) : null}
      <div className="px-4 py-4 lg:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {isPos
            ? TREASURY_RECONCILE_COMMISSIONS_LABEL
            : TREASURY_CARD_OTHER_CHARGES_LABEL}
        </p>
        <p className="mt-1.5 font-numeric text-2xl font-bold tabular-nums tracking-tight text-foreground">
          {loading
            ? "—"
            : isPos
              ? periodAdjustmentTotal > 0
                ? formatTreasuryMovementAmount("out", periodAdjustmentTotal)
                : fmt.format(periodAdjustmentTotal)
              : formatTreasuryMovementAmount("out", periodAdjustmentTotal)}
        </p>
      </div>
      {isPos ? (
        <div className="px-4 py-4 lg:px-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Recibido en cuenta
          </p>
          <p className="mt-1.5 font-numeric text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {loading ? "—" : fmt.format(periodReceivedInAccount)}
          </p>
        </div>
      ) : null}
    </div>
  )

  const periodFilterControl = (
    <DataWorkspacePeriodFilter
      variant="compact"
      showActiveState={false}
      preset={datePreset}
      customRange={customDateRange}
      onPresetChange={onPresetChange}
      onCustomRangeChange={onCustomRangeChange}
      bounds={dateBounds}
      className="w-full sm:w-auto"
    />
  )

  const conciliarButton = canConciliar ? (
    <RootsPrimaryButton
      type="button"
      size="sm"
      className={cn(rootsButtonCompactSizeClass, "shrink-0 self-end lg:self-auto")}
      onClick={onConciliar}
    >
      {isPos ? (
        <>
          <Banknote className="size-4" aria-hidden />
          Liquidar
        </>
      ) : (
        <>
          <CreditCard className="size-4" aria-hidden />
          Pagar
        </>
      )}
    </RootsPrimaryButton>
  ) : null

  const primaryTabValue = isPos ? "resumen" : "consumos"
  const secondaryTabValue = isPos ? "liquidaciones" : "pagos"
  const primaryTabLabel = isPos ? "Resumen POS" : "Resumen TC"
  const secondaryTabLabel = isPos ? "Liquidaciones" : "Pagos"

  const panelSegmentOptions = useMemo(
    () => [
      { value: primaryTabValue, label: primaryTabLabel },
      { value: secondaryTabValue, label: secondaryTabLabel },
    ],
    [primaryTabValue, primaryTabLabel, secondaryTabValue, secondaryTabLabel],
  )

  const panelSegmentField = (
    <RootsFormSegmentField
      label={isPos ? "Vista POS" : "Vista tarjeta"}
      aria-label={isPos ? "Sección POS" : "Sección tarjeta"}
      value={panelTab}
      onValueChange={setPanelTab}
      options={panelSegmentOptions}
      className="!w-auto shrink-0 [&>span:first-child]:sr-only"
      groupClassName="!w-auto"
    />
  )

  const posResumenKpiStrip = (
    <div className={cn("grid shrink-0 sm:grid-cols-2", dataWorkspaceDetailKpiStripTwoColClass)}>
      <div className="px-4 py-4 lg:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          A liquidar antes del período
        </p>
        <p className="mt-1.5 font-numeric text-2xl font-bold tabular-nums tracking-tight text-foreground">
          {openingPendingBalance != null
            ? fmt.format(openingPendingBalance)
            : "—"}
        </p>
      </div>
      <div className="px-4 py-4 lg:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          A liquidar en el período
        </p>
        <p className="mt-1.5 font-numeric text-2xl font-bold tabular-nums tracking-tight text-foreground">
          {fmt.format(periodToLiquidate)}
        </p>
      </div>
    </div>
  )

  const cardConsumosKpiStrip = (
    <div
      className={cn(
        "shrink-0 border-b border-border/60",
        dataWorkspaceDetailBodyClass,
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Consumos del período
      </p>
      <p className="mt-1.5 font-numeric text-2xl font-bold tabular-nums tracking-tight text-foreground">
        {fmt.format(periodGrossAmount)}
      </p>
    </div>
  )

  const activeTabKpiStrip = isPos
    ? isSecondaryPanelTab
      ? reconciliationsSummaryBar
      : posResumenKpiStrip
    : isSecondaryPanelTab
      ? reconciliationsSummaryBar
      : cardConsumosKpiStrip

  const primaryPanelBody = (
    <TreasuryGroupedSummaryMovementsList
      movements={summaryMovements}
      emptyStateMessage={summaryEmptyStateMessage}
      positiveAmounts={!isPos}
    />
  )

  const secondaryPanelBody = (
    <ReconciliationEventsList
      events={events}
      timeZone={timeZone}
      isPos={isPos}
      emptyStateMessage={reconciliationsEmptyStateMessage}
    />
  )

  const activeTabBody = isSecondaryPanelTab ? secondaryPanelBody : primaryPanelBody

  return (
    <div className={dataWorkspaceFlushBottomPanelClass}>
      <div className={dataWorkspaceFlushBottomPanelChromeClass}>
        <div className={dataWorkspaceDetailToolbarClass}>
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <div className="min-w-0 w-full shrink-0 sm:w-auto sm:max-w-xs lg:max-w-sm">
              {periodFilterControl}
            </div>
            {panelSegmentField}
          </div>
          {conciliarButton}
        </div>

        {error ? (
          <div className="border-b border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive lg:px-5">
            {error}
          </div>
        ) : null}

        {!loading ? activeTabKpiStrip : null}
      </div>

      <div className={dataWorkspaceFlushBottomPanelBodyClass}>
        {loading ? (
          <div
            role="status"
            aria-busy="true"
            aria-label="Cargando resumen"
            className="flex min-h-48 items-center justify-center px-4 py-10"
          >
            <Loader2
              className="size-6 animate-spin text-muted-foreground"
              aria-hidden
            />
            <span className="sr-only">Cargando…</span>
          </div>
        ) : (
          activeTabBody
        )}
      </div>
    </div>
  )
}

export function ChildIntegrationChip({
  child,
  selected,
  onToggle,
  compact = false,
  className,
}: {
  child: TreasuryChildAccountRow
  selected: boolean
  onToggle: (child: TreasuryChildAccountRow) => void
  compact?: boolean
  className?: string
}) {
  const isPos = child.childRole === "pos"

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle(child)}
      className={cn(
        dataWorkspaceIntegrationChipBaseClass,
        compact ? "shrink-0" : "min-w-0",
        compact
          ? "w-auto shrink-0 gap-3 rounded-xl px-4 py-2.5"
          : "w-full min-w-0 gap-3 rounded-xl px-3 py-3",
        compact
          ? cn(
              dataWorkspaceIntegrationChipSurfaceClass,
              selected && dataWorkspaceIntegrationChipSelectedClass,
            )
          : cn(
              "rounded-xl border hover:shadow-[0_2px_4px_rgb(5_8_7/0.1),0_8px_20px_rgb(5_8_7/0.12)]",
              dataWorkspaceIntegrationChipSurfaceClass,
              selected
                ? dataWorkspaceIntegrationChipSelectedClass
                : "hover:border-[var(--rootsy-bruma-300)]",
            ),
        className,
      )}
    >
      <div
        className={cn(
          dataWorkspaceIntegrationChipIsotypeClass,
          selected && dataWorkspaceIntegrationChipIsotypeSelectedClass,
        )}
      >
        {isPos ? (
          <Wifi className="size-4" aria-hidden />
        ) : (
          <CreditCard className="size-4" aria-hidden />
        )}
      </div>
      <div className={cn(compact ? "pr-0.5" : "min-w-0 flex-1")}>
        <p
          className={cn(
            compact
              ? dataWorkspaceIntegrationChipEyebrowClass
              : cn(dataWorkspaceEntityCardEyebrowClass, "text-[10px] font-semibold tracking-wide"),
          )}
        >
          {isPos ? "Terminal POS" : "Tarjeta corporativa"}
        </p>
        <p
          className={cn(
            compact
              ? dataWorkspaceIntegrationChipTitleClass
              : cn(dataWorkspaceEntityCardTitleClass, "mt-0.5 truncate text-sm"),
          )}
        >
          {child.name}
        </p>
      </div>
    </button>
  )
}
