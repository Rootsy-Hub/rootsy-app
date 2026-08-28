"use client"

import dynamic from "next/dynamic"
import { ReportHubGrid } from "@/components/reports/ReportHubGrid"
import { VatPositionReportView } from "@/components/reports/VatPositionReportView"
import { RootsSpinner } from "@/components/rootsy-spinner"
import {
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceBlocksPageScopeClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import {
  mergeReportsWorkspaceUrl,
  parseReportsWorkspaceUrl,
  reportsCustomDateRange,
} from "@/app/[siteId]/[popId]/reports/workspaceUrl"
import {
  buildReportHref,
  supportsInlineReportDetail,
} from "@/lib/reportsCatalog"
import {
  computeDataWorkspaceDateBounds,
  toISODateLocal,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { useParams, usePathname, useSearchParams } from "@/lib/pop-spa/navigation"
import type { DateRange } from "react-day-picker"
import { useCallback, useMemo } from "react"

const reportLoading = (
  <div
    className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
    aria-busy="true"
  >
    <RootsSpinner size="default" label="Cargando reporte" />
    <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
  </div>
)

const SalesDetailReportView = dynamic(
  () =>
    import("@/components/reports/SalesDetailReportView").then(
      (mod) => mod.SalesDetailReportView,
    ),
  { ssr: false, loading: () => reportLoading },
)

const PurchasesExpensesReportView = dynamic(
  () =>
    import("@/components/reports/PurchasesExpensesReportView").then(
      (mod) => mod.PurchasesExpensesReportView,
    ),
  { ssr: false, loading: () => reportLoading },
)

const IssuedInvoicesReportView = dynamic(
  () =>
    import("@/components/reports/IssuedInvoicesReportView").then(
      (mod) => mod.IssuedInvoicesReportView,
    ),
  { ssr: false, loading: () => reportLoading },
)

const ReceivedInvoicesReportView = dynamic(
  () =>
    import("@/components/reports/ReceivedInvoicesReportView").then(
      (mod) => mod.ReceivedInvoicesReportView,
    ),
  { ssr: false, loading: () => reportLoading },
)

const IncomeStatementReportView = dynamic(
  () =>
    import("@/components/reports/IncomeStatementReportView").then(
      (mod) => mod.IncomeStatementReportView,
    ),
  { ssr: false, loading: () => reportLoading },
)

const BalanceSheetReportView = dynamic(
  () =>
    import("@/components/reports/BalanceSheetReportView").then(
      (mod) => mod.BalanceSheetReportView,
    ),
  { ssr: false, loading: () => reportLoading },
)

const CashFlowReportView = dynamic(
  () =>
    import("@/components/reports/CashFlowReportView").then(
      (mod) => mod.CashFlowReportView,
    ),
  { ssr: false, loading: () => reportLoading },
)

const AccountSummariesReportView = dynamic(
  () =>
    import("@/components/reports/AccountSummariesReportView").then(
      (mod) => mod.AccountSummariesReportView,
    ),
  { ssr: false, loading: () => reportLoading },
)

const TrialBalanceReportView = dynamic(
  () =>
    import("@/components/reports/TrialBalanceReportView").then(
      (mod) => mod.TrialBalanceReportView,
    ),
  { ssr: false, loading: () => reportLoading },
)

const JournalReportView = dynamic(
  () =>
    import("@/components/reports/JournalReportView").then(
      (mod) => mod.JournalReportView,
    ),
  { ssr: false, loading: () => reportLoading },
)

const LedgerReportView = dynamic(
  () =>
    import("@/components/reports/LedgerReportView").then(
      (mod) => mod.LedgerReportView,
    ),
  { ssr: false, loading: () => reportLoading },
)

const CashRegistersReportView = dynamic(
  () =>
    import("@/components/reports/CashRegistersReportView").then(
      (mod) => mod.CashRegistersReportView,
    ),
  { ssr: false, loading: () => reportLoading },
)

const TreasuryReportView = dynamic(
  () =>
    import("@/components/reports/TreasuryReportView").then(
      (mod) => mod.TreasuryReportView,
    ),
  { ssr: false, loading: () => reportLoading },
)

const ChartOfAccountsReportView = dynamic(
  () =>
    import("@/components/reports/ChartOfAccountsReportView").then(
      (mod) => mod.ChartOfAccountsReportView,
    ),
  { ssr: false, loading: () => reportLoading },
)

export function ReportsWorkspaceView() {
  const params = useParams()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  const workspaceParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  )
  const ws = useMemo(
    () => parseReportsWorkspaceUrl(workspaceParams),
    [workspaceParams],
  )
  const customRange = reportsCustomDateRange(ws)
  const bounds = useMemo(
    () => computeDataWorkspaceDateBounds(ws.datePreset, customRange),
    [ws.datePreset, customRange],
  )
  const selectedReportId = ws.report
  const showingInlineDetail =
    selectedReportId != null && supportsInlineReportDetail(selectedReportId)

  const pushWs = useCallback(
    (patch: Parameters<typeof mergeReportsWorkspaceUrl>[1]) => {
      const next = mergeReportsWorkspaceUrl(workspaceParams, patch)
      const qs = next.toString()
      window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, workspaceParams],
  )

  const periodProps = {
    preset: ws.datePreset,
    customRange,
    bounds,
    onPresetChange: (preset: DataWorkspaceDatePreset) => {
      pushWs({
        datePreset: preset,
        customFrom: preset === "custom" ? ws.customFrom : null,
        customTo: preset === "custom" ? ws.customTo : null,
      })
    },
    onCustomRangeChange: (range: DateRange | undefined) => {
      const from = range?.from ? toISODateLocal(range.from) : null
      const to = range?.to ? toISODateLocal(range.to) : null
      pushWs({
        datePreset: "custom",
        customFrom: from,
        customTo: to,
      })
    },
  }

  const onBack = useCallback(() => {
    pushWs({ report: null })
  }, [pushWs])

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  return (
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Reportes"
      headerVariant={dataWorkspaceModuleHeaderVariant}
      loading={bootstrapLoading}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel}
      contentFlush
      mainMaxWidthClass={showingInlineDetail ? "max-w-none" : "max-w-[88rem]"}
      mainClassName={dataWorkspaceBlocksPageMainClass}
    >
      <div
        className={cn(
          showingInlineDetail
            ? dataWorkspaceBlocksPageScopeClass
            : dataWorkspaceBlocksPageContentClass,
          showingInlineDetail && "flex min-h-0 flex-1 flex-col",
        )}
      >
        {bootstrapError ? (
          <div
            role="alert"
            className={cn(
              "rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive",
              showingInlineDetail && "mx-4 mt-4 sm:mx-6 lg:mx-8",
            )}
          >
            Cabecera: {bootstrapError}
          </div>
        ) : null}

        {selectedReportId === "vat-position" ? (
          <VatPositionReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={onBack}
            {...periodProps}
          />
        ) : selectedReportId === "sales-detail" ? (
          <SalesDetailReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={onBack}
            {...periodProps}
          />
        ) : selectedReportId === "purchases-expenses" ? (
          <PurchasesExpensesReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={onBack}
            {...periodProps}
          />
        ) : selectedReportId === "invoices" ? (
          <IssuedInvoicesReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={onBack}
            {...periodProps}
          />
        ) : selectedReportId === "received-invoices" ? (
          <ReceivedInvoicesReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={onBack}
            {...periodProps}
          />
        ) : selectedReportId === "income-statement" ? (
          <IncomeStatementReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={onBack}
            {...periodProps}
          />
        ) : selectedReportId === "balance-sheet" ? (
          <BalanceSheetReportView
            popId={popId}
            onBack={onBack}
            {...periodProps}
          />
        ) : selectedReportId === "cash-flow" ? (
          <CashFlowReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={onBack}
            {...periodProps}
          />
        ) : selectedReportId === "summaries" ? (
          <AccountSummariesReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={onBack}
            {...periodProps}
          />
        ) : selectedReportId === "trial-balance" ? (
          <TrialBalanceReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={onBack}
            {...periodProps}
          />
        ) : selectedReportId === "journal" ? (
          <JournalReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={onBack}
            {...periodProps}
          />
        ) : selectedReportId === "ledger" ? (
          <LedgerReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={onBack}
            {...periodProps}
          />
        ) : selectedReportId === "cash-registers" ? (
          <CashRegistersReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={onBack}
            {...periodProps}
          />
        ) : selectedReportId === "treasury" ? (
          <TreasuryReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={onBack}
            {...periodProps}
          />
        ) : selectedReportId === "chart-of-accounts" ? (
          <ChartOfAccountsReportView
            popId={popId}
            onBack={onBack}
            {...periodProps}
          />
        ) : (
          <ReportHubGrid
            selectedReportId={selectedReportId}
            activeCategoryId={ws.category}
            onCategoryChange={(category) => pushWs({ category })}
            onSelectReport={(report) => pushWs({ report })}
            buildItemHref={(item) => buildReportHref(siteId, popId, item, bounds)}
          />
        )}
      </div>
    </DataWorkspaceModuleLayout>
  )
}
