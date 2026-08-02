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
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    <div
      className={cn(
        "grid shrink-0 grid-cols-1 divide-y divide-border/60 border-b border-border/60 bg-muted/5 sm:grid-cols-3 sm:divide-x sm:divide-y-0",
      )}
    >
      <div className="px-4 py-4 lg:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {isPos ? "Liquidado en el período" : "Pagado en el período"}
        </p>
        <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">
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
          <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">
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
        <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">
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
          <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {loading ? "—" : fmt.format(periodReceivedInAccount)}
          </p>
        </div>
      ) : null}
    </div>
  )

  const periodFilterControl = (
    <DataWorkspacePeriodFilter
      variant="compact"
      hideAllPreset
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
    <Button
      type="button"
      size="sm"
      className="shrink-0 gap-1.5 self-end font-medium lg:self-auto"
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
    </Button>
  ) : null

  const panelTabSliderClass =
    "pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-md bg-background shadow-sm transition-transform duration-200 ease-out"

  const panelTabTriggerClass = cn(
    "relative z-10 h-full rounded-md border-0 bg-transparent px-4 py-0 text-sm font-semibold shadow-none",
    "text-muted-foreground transition-colors duration-200",
    "data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none",
    "dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
  )

  const panelTabsListClass = cn(
    "relative grid h-8 shrink-0 grid-cols-2 gap-0 rounded-lg bg-muted/35 p-0.5",
    "w-full border-0 shadow-none sm:w-auto sm:min-w-[21rem]",
  )

  const primaryTabValue = isPos ? "resumen" : "consumos"
  const secondaryTabValue = isPos ? "liquidaciones" : "pagos"
  const primaryTabLabel = isPos ? "Resumen POS" : "Resumen TC"
  const secondaryTabLabel = isPos ? "Liquidaciones" : "Pagos"

  const posResumenKpiStrip = (
    <div className="grid shrink-0 divide-y divide-border/60 border-b border-border/60 bg-muted/5 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
      <div className="px-4 py-4 lg:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          A liquidar antes del período
        </p>
        <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {openingPendingBalance != null
            ? fmt.format(openingPendingBalance)
            : "—"}
        </p>
      </div>
      <div className="px-4 py-4 lg:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          A liquidar en el período
        </p>
        <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {fmt.format(periodToLiquidate)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Cobros menos faltantes de caja
        </p>
      </div>
    </div>
  )

  const cardConsumosKpiStrip = (
    <div className="shrink-0 border-b border-border/60 bg-muted/5 px-4 py-4 lg:px-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Consumos del período
      </p>
      <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {fmt.format(periodGrossAmount)}
      </p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{child.name}</p>
    </div>
  )

  const primaryPanelContent = isPos ? (
    <>
      {posResumenKpiStrip}
      <TreasuryGroupedSummaryMovementsList
        movements={summaryMovements}
        emptyStateMessage={summaryEmptyStateMessage}
      />
    </>
  ) : (
    <>
      {cardConsumosKpiStrip}
      <TreasuryGroupedSummaryMovementsList
        movements={summaryMovements}
        emptyStateMessage={summaryEmptyStateMessage}
        positiveAmounts
      />
    </>
  )

  const secondaryPanelContent = (
    <>
      {reconciliationsSummaryBar}
      <ReconciliationEventsList
        events={events}
        timeZone={timeZone}
        isPos={isPos}
        emptyStateMessage={reconciliationsEmptyStateMessage}
      />
    </>
  )

  return (
    <Tabs
      value={panelTab}
      onValueChange={setPanelTab}
      className="flex flex-1 flex-col gap-0"
    >
      <div className="flex shrink-0 flex-col gap-3 border-b border-border/60 bg-muted/15 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="min-w-0 sm:max-w-xs lg:max-w-sm">{periodFilterControl}</div>
            <TabsList className={panelTabsListClass}>
              <span
                aria-hidden
                className={panelTabSliderClass}
                style={{
                  transform: isSecondaryPanelTab
                    ? "translateX(100%)"
                    : "translateX(0)",
                }}
              />
              <TabsTrigger value={primaryTabValue} className={panelTabTriggerClass}>
                {primaryTabLabel}
              </TabsTrigger>
              <TabsTrigger value={secondaryTabValue} className={panelTabTriggerClass}>
                {secondaryTabLabel}
              </TabsTrigger>
            </TabsList>
          </div>
          {conciliarButton}
        </div>

        {error ? (
          <div className="shrink-0 border-b border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive lg:px-5">
            {error}
          </div>
        ) : null}

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
        <>
          <TabsContent value={primaryTabValue} className="mt-0">
            {primaryPanelContent}
          </TabsContent>

          <TabsContent value={secondaryTabValue} className="mt-0">
            {secondaryPanelContent}
          </TabsContent>
        </>
      )}
    </Tabs>
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
        "group flex items-center text-left transition-all",
        compact ? "shrink-0" : "min-w-0",
        compact
          ? "w-auto shrink-0 gap-3 rounded-xl px-4 py-2.5"
          : "w-full min-w-0 gap-3 rounded-xl px-3 py-3",
        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        compact
          ? cn(
              "border shadow-xs hover:shadow-sm",
              selected
                ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20"
                : "border-border/70 bg-background hover:border-border hover:bg-muted/20",
            )
          : cn(
              "rounded-xl border hover:border-primary/35 hover:bg-muted/25 hover:shadow-sm",
              selected
                ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/25"
                : "border-border/60 bg-muted/15",
            ),
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg transition-colors",
          compact ? "size-9 ring-1 ring-border/40" : "size-9",
          selected
            ? "bg-primary/10 ring-primary/15"
            : compact
              ? "bg-muted/35 group-hover:bg-muted/50"
              : "bg-background/80 group-hover:bg-background",
        )}
      >
        {isPos ? (
          <Wifi
            className={cn(
              "size-4",
              selected ? "text-primary" : "text-muted-foreground",
            )}
            aria-hidden
          />
        ) : (
          <CreditCard
            className={cn(
              "size-4",
              selected ? "text-primary" : "text-muted-foreground",
            )}
            aria-hidden
          />
        )}
      </div>
      <div className={cn(compact ? "pr-0.5" : "min-w-0 flex-1")}>
        <p
          className={cn(
            "font-medium uppercase text-muted-foreground",
            compact
              ? "whitespace-nowrap text-[10px] tracking-[0.1em]"
              : "text-[10px] font-semibold tracking-wide",
          )}
        >
          {isPos ? "Terminal POS" : "Tarjeta corporativa"}
        </p>
        <p
          className={cn(
            "truncate font-semibold text-foreground",
            compact ? "mt-1 text-[13px] leading-snug" : "mt-0.5 text-sm",
          )}
        >
          {child.name}
        </p>
      </div>
    </button>
  )
}
