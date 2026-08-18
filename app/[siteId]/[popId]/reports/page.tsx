"use client"

import dynamic from "next/dynamic"
import { ReportHubGrid } from "@/components/reports/ReportHubGrid"
import { VatPositionReportView } from "@/components/reports/VatPositionReportView"
import { RootsSpinner } from "@/components/rootsy-spinner"
import {
  dataWorkspaceBlocksContentInnerClass,
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceBlocksPageScopeClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import {
  buildReportHref,
  supportsInlineReportDetail,
} from "@/lib/reportsCatalog"
import {
  computeDataWorkspaceDateBounds,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"
import type { DateRange } from "react-day-picker"
import { useMemo, useState } from "react"

const SalesDetailReportView = dynamic(
  () =>
    import("@/components/reports/SalesDetailReportView").then(
      (mod) => mod.SalesDetailReportView,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
        aria-busy="true"
      >
        <RootsSpinner size="default" label="Cargando reporte" />
        <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
      </div>
    ),
  },
)

const PurchasesExpensesReportView = dynamic(
  () =>
    import("@/components/reports/PurchasesExpensesReportView").then(
      (mod) => mod.PurchasesExpensesReportView,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
        aria-busy="true"
      >
        <RootsSpinner size="default" label="Cargando reporte" />
        <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
      </div>
    ),
  },
)

const IssuedInvoicesReportView = dynamic(
  () =>
    import("@/components/reports/IssuedInvoicesReportView").then(
      (mod) => mod.IssuedInvoicesReportView,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
        aria-busy="true"
      >
        <RootsSpinner size="default" label="Cargando reporte" />
        <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
      </div>
    ),
  },
)

const ReceivedInvoicesReportView = dynamic(
  () =>
    import("@/components/reports/ReceivedInvoicesReportView").then(
      (mod) => mod.ReceivedInvoicesReportView,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
        aria-busy="true"
      >
        <RootsSpinner size="default" label="Cargando reporte" />
        <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
      </div>
    ),
  },
)

const IncomeStatementReportView = dynamic(
  () =>
    import("@/components/reports/IncomeStatementReportView").then(
      (mod) => mod.IncomeStatementReportView,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
        aria-busy="true"
      >
        <RootsSpinner size="default" label="Cargando reporte" />
        <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
      </div>
    ),
  },
)

const BalanceSheetReportView = dynamic(
  () =>
    import("@/components/reports/BalanceSheetReportView").then(
      (mod) => mod.BalanceSheetReportView,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
        aria-busy="true"
      >
        <RootsSpinner size="default" label="Cargando reporte" />
        <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
      </div>
    ),
  },
)

const CashFlowReportView = dynamic(
  () =>
    import("@/components/reports/CashFlowReportView").then(
      (mod) => mod.CashFlowReportView,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
        aria-busy="true"
      >
        <RootsSpinner size="default" label="Cargando reporte" />
        <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
      </div>
    ),
  },
)

const AccountSummariesReportView = dynamic(
  () =>
    import("@/components/reports/AccountSummariesReportView").then(
      (mod) => mod.AccountSummariesReportView,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
        aria-busy="true"
      >
        <RootsSpinner size="default" label="Cargando reporte" />
        <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
      </div>
    ),
  },
)

const TrialBalanceReportView = dynamic(
  () =>
    import("@/components/reports/TrialBalanceReportView").then(
      (mod) => mod.TrialBalanceReportView,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
        aria-busy="true"
      >
        <RootsSpinner size="default" label="Cargando reporte" />
        <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
      </div>
    ),
  },
)

const JournalReportView = dynamic(
  () =>
    import("@/components/reports/JournalReportView").then(
      (mod) => mod.JournalReportView,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
        aria-busy="true"
      >
        <RootsSpinner size="default" label="Cargando reporte" />
        <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
      </div>
    ),
  },
)

const LedgerReportView = dynamic(
  () =>
    import("@/components/reports/LedgerReportView").then(
      (mod) => mod.LedgerReportView,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
        aria-busy="true"
      >
        <RootsSpinner size="default" label="Cargando reporte" />
        <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
      </div>
    ),
  },
)

const CashRegistersReportView = dynamic(
  () =>
    import("@/components/reports/CashRegistersReportView").then(
      (mod) => mod.CashRegistersReportView,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
        aria-busy="true"
      >
        <RootsSpinner size="default" label="Cargando reporte" />
        <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
      </div>
    ),
  },
)

const TreasuryReportView = dynamic(
  () =>
    import("@/components/reports/TreasuryReportView").then(
      (mod) => mod.TreasuryReportView,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
        aria-busy="true"
      >
        <RootsSpinner size="default" label="Cargando reporte" />
        <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
      </div>
    ),
  },
)

const ChartOfAccountsReportView = dynamic(
  () =>
    import("@/components/reports/ChartOfAccountsReportView").then(
      (mod) => mod.ChartOfAccountsReportView,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
        aria-busy="true"
      >
        <RootsSpinner size="default" label="Cargando reporte" />
        <p className="text-sm text-rootsy-bruma-500">Cargando reporte…</p>
      </div>
    ),
  },
)

function ReportsPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  const [preset, setPreset] = useState<DataWorkspaceDatePreset>("this_month")
  const [customRange, setCustomRange] = useState<DateRange | undefined>(
    undefined,
  )
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  const bounds = useMemo(
    () => computeDataWorkspaceDateBounds(preset, customRange),
    [preset, customRange],
  )
  const showingInlineDetail =
    selectedReportId != null && supportsInlineReportDetail(selectedReportId)

  const periodProps = {
    preset,
    customRange,
    bounds,
    onPresetChange: setPreset,
    onCustomRangeChange: setCustomRange,
  }

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
            : dataWorkspaceBlocksContentInnerClass,
          showingInlineDetail && "flex min-h-full flex-1 flex-col",
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
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "sales-detail" ? (
          <SalesDetailReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "purchases-expenses" ? (
          <PurchasesExpensesReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "invoices" ? (
          <IssuedInvoicesReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "received-invoices" ? (
          <ReceivedInvoicesReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "income-statement" ? (
          <IncomeStatementReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "balance-sheet" ? (
          <BalanceSheetReportView
            popId={popId}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "cash-flow" ? (
          <CashFlowReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "summaries" ? (
          <AccountSummariesReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "trial-balance" ? (
          <TrialBalanceReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "journal" ? (
          <JournalReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "ledger" ? (
          <LedgerReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "cash-registers" ? (
          <CashRegistersReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "treasury" ? (
          <TreasuryReportView
            popId={popId}
            from={bounds.from}
            to={bounds.to}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : selectedReportId === "chart-of-accounts" ? (
          <ChartOfAccountsReportView
            popId={popId}
            onBack={() => setSelectedReportId(null)}
            {...periodProps}
          />
        ) : (
          <ReportHubGrid
            selectedReportId={selectedReportId}
            onSelectReport={setSelectedReportId}
            buildItemHref={(item) => buildReportHref(siteId, popId, item, bounds)}
          />
        )}
      </div>
    </DataWorkspaceModuleLayout>
  )
}

export default ReportsPage
