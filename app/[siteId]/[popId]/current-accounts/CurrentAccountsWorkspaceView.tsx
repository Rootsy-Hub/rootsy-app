"use client"

import { CurrentAccountAgingStrip } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountAgingStrip"
import { CurrentAccountAgingToolbarFilter } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountAgingToolbarFilter"
import { CurrentAccountApplyDialog } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountApplyDialog"
import { CurrentAccountSettleDialog } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountSettleDialog"
import { CurrentAccountDirectionToolbarFilter } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountDirectionToolbarFilter"
import { CurrentAccountViewToolbarFilter } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountViewToolbarFilter"
import {
  CurrentAccountCountCell,
  CurrentAccountLedgerDateCell,
  CurrentAccountLedgerDocCell,
  CurrentAccountLedgerMoneyCell,
  CurrentAccountMoneyCell,
  CurrentAccountOpenAgingCell,
  CurrentAccountOverdueCell,
  CurrentAccountPartyNameCell,
} from "@/app/[siteId]/[popId]/current-accounts/currentAccountsTableCells"
import {
  currentAccountLedgerDateColumnClass,
  currentAccountLedgerDocColumnClass,
  currentAccountLedgerMoneyColumnClass,
  currentAccountOpenAgingColumnClass,
  currentAccountTableAmountColumnClass,
  currentAccountTableCountColumnClass,
  currentAccountTablePartyColumnClass,
} from "@/app/[siteId]/[popId]/current-accounts/currentAccountsTableLayout"
import {
  CURRENT_ACCOUNT_TABLE_PAGE_SIZES,
  mergeCurrentAccountsWorkspaceUrl,
  parseCurrentAccountsWorkspaceUrl,
  type CurrentAccountTableSortKey,
} from "@/app/[siteId]/[popId]/current-accounts/workspaceUrl"
import { buildPaginationItems } from "@/components/data-workspace/buildPaginationItems"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import { DataWorkspaceListSearchField } from "@/components/data-workspace/DataWorkspaceListFilterFields"
import {
  DataWorkspaceTableListFiltersBar,
  DataWorkspaceTableListNatureShell,
  DataWorkspaceTableListPage,
  DataWorkspaceTableListPaginationFooter,
  DataWorkspaceTableListShell,
  dataWorkspaceTableListHeaderVariant,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { workspaceTableLayoutClassName } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutHeaderHeadClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { WorkspaceTableSortHead } from "@/components/data-workspace/WorkspaceTableSortHead"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import {
  currentAccountLedgerSkeletonColumns,
  currentAccountOpenSkeletonColumns,
  currentAccountsSkeletonColumns,
} from "@/components/data-workspace/workspaceTableSkeletonPresets"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { usePopCurrentAccountLedger } from "@/hooks/usePopCurrentAccountLedger"
import { usePopCurrentAccountParties } from "@/hooks/usePopCurrentAccountParties"
import {
  popCurrentAccountLedgerQueryRoot,
  popCurrentAccountPartiesQueryRoot,
} from "@/lib/queryKeys"
import { useQueryClient } from "@tanstack/react-query"
import {
  currentAccountAgingFilterLabel,
  currentAccountDirectionLabel,
  currentAccountOpenDocumentAgingLabel,
  emptyCurrentAccountAgingTotals,
  type CurrentAccountDirection,
} from "@/lib/currentAccounts"
import {
  exportCurrentAccountStatementPdf,
  printCurrentAccountStatementPdf,
} from "@/lib/currentAccountStatementPdfExport"
import { showReportExportInProgressToast } from "@/lib/reportExportInProgressToast"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
} from "@/lib/workspaceTableSort"
import { TableBody } from "@/components/ui/table"
import { Banknote, Download, Link2, Printer } from "lucide-react"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"

export function CurrentAccountsWorkspaceView() {
  const params = useParams()
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const siteId = String(params.siteId ?? "")
  const popId = String(params.popId ?? "")
  const queryClient = useQueryClient()
  const ws = useMemo(
    () => parseCurrentAccountsWorkspaceUrl(searchParams),
    [searchParams],
  )
  const searchInputId = useId()
  const pageSizeLabelId = useId()
  const { bootstrap, loading: bootstrapLoading, popAccess } = usePopWorkspace()

  const [searchInput, setSearchInput] = useState(ws.q)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [actionError, setError] = useState<string | null>(null)

  const [settleOpen, setSettleOpen] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)

  const viewingParty = Boolean(ws.partyId)

  const pushWs = useCallback(
    (patch: Parameters<typeof mergeCurrentAccountsWorkspaceUrl>[1]) => {
      const next = mergeCurrentAccountsWorkspaceUrl(searchParams, patch)
      const qs = next.toString()
      if (qs === searchParams.toString()) return
      const href = qs ? `${pathname}?${qs}` : pathname
      routerRef.current.replace(href, { scroll: false })
    },
    [pathname, searchParams],
  )

  const handleSortColumn = useCallback(
    (column: CurrentAccountTableSortKey) => {
      const next = nextWorkspaceTableSortState(
        { sort: ws.sort, ord: ws.ord },
        column,
      )
      pushWs({
        sort: next.sort as CurrentAccountTableSortKey | null,
        ord: next.ord,
      })
    },
    [pushWs, ws.ord, ws.sort],
  )

  const sortDirection = useCallback(
    (column: CurrentAccountTableSortKey) =>
      workspaceTableSortDisplayDirection(
        { sort: ws.sort, ord: ws.ord },
        column,
      ),
    [ws.ord, ws.sort],
  )

  const partiesQuery = usePopCurrentAccountParties(
    popId,
    {
      q: ws.q,
      page: ws.page,
      pageSize: ws.pageSize,
      direction: ws.direction,
      aging: ws.aging,
      sort: ws.sort,
      ord: ws.ord,
    },
    { enabled: Boolean(popId) && !viewingParty },
  )
  const ledgerQuery = usePopCurrentAccountLedger(
    popId,
    ws.direction,
    ws.partyId,
    { enabled: Boolean(popId) && viewingParty },
  )

  const parties = partiesQuery.data?.parties ?? []
  const totalCount = partiesQuery.data?.totalCount ?? 0
  const ledgerLines = ledgerQuery.data?.lines ?? []
  const ledgerPartyName = ledgerQuery.data?.partyName ?? ""
  const ledgerBalance = ledgerQuery.data?.balance ?? 0
  const ledgerOpenCount = ledgerQuery.data?.openCount ?? 0
  const ledgerAging =
    ledgerQuery.data?.aging ?? emptyCurrentAccountAgingTotals()
  const ledgerOpenDocuments = ledgerQuery.data?.openDocuments ?? []
  const ledgerCanCreate = ledgerQuery.data?.canCreate ?? false
  const ledgerUnapplied = ledgerQuery.data?.unappliedCredit ?? 0
  const activeQuery = viewingParty ? ledgerQuery : partiesQuery
  const loading =
    activeQuery.isPending ||
    (activeQuery.isFetching && !activeQuery.isFetched)
  const tableError =
    activeQuery.data?.success === false
      ? activeQuery.data.error
      : activeQuery.error instanceof Error
        ? activeQuery.error.message
        : activeQuery.error
          ? String(activeQuery.error)
          : null
  const error = actionError ?? tableError

  const refreshCurrentAccountLedger = useCallback(async () => {
    if (!popId) return
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: popCurrentAccountLedgerQueryRoot(popId),
      }),
      queryClient.invalidateQueries({
        queryKey: popCurrentAccountPartiesQueryRoot(popId),
      }),
    ])
  }, [popId, queryClient])

  useEffect(() => {
    const res = activeQuery.data
    if (!res || res.success || !res.redirect) return
    routerRef.current.replace(res.redirect)
  }, [activeQuery.data])

  useEffect(() => {
    setSearchInput(ws.q)
  }, [ws.q])

  useEffect(() => {
    setSettleOpen(false)
    setApplyOpen(false)
  }, [ws.direction, ws.partyId])

  useEffect(() => {
    if (viewingParty) return
    const timer = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === ws.q.trim()) return
      pushWs({ q: next, page: 1 })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [pushWs, searchInput, viewingParty, ws.q])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return
      }
      event.preventDefault()
      searchInputRef.current?.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const totalPages = Math.max(1, Math.ceil(totalCount / ws.pageSize))
  const rangeStart = totalCount === 0 ? 0 : (ws.page - 1) * ws.pageSize + 1
  const rangeEnd = Math.min(ws.page * ws.pageSize, totalCount)
  const skeletonRowCount = Math.min(12, Math.max(5, ws.pageSize))
  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages, ws.page),
    [totalPages, ws.page],
  )

  const hasSearchChip = ws.q.trim() !== ""
  const hasAgingChip = ws.aging !== "all"
  const hasFilterChips = hasSearchChip || hasAgingChip
  const activeFilterCount =
    Number(hasSearchChip) + Number(hasAgingChip)
  const partyNoun =
    ws.direction === "payable" ? "proveedor" : "cliente"
  const partyNounPlural =
    ws.direction === "payable" ? "proveedores" : "clientes"

  const resultsSummary = useMemo(() => {
    if (loading && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? partyNoun : partyNounPlural
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [loading, partyNoun, partyNounPlural, totalCount])

  const listHref = popScopedHref(siteId, popId, "current-accounts")
  const listBackHref = useMemo(() => {
    const next = mergeCurrentAccountsWorkspaceUrl(searchParams, {
      partyId: "",
    })
    const qs = next.toString()
    return qs ? `${listHref}?${qs}` : listHref
  }, [listHref, searchParams])

  const changeDirection = (direction: CurrentAccountDirection) => {
    pushWs({ direction, partyId: "", page: 1 })
  }

  const viewingOpen = viewingParty && ws.view === "open"
  const pdfBrand = {
    popName: bootstrap?.popName,
    popLogoUrl: popAccess?.pop.imageUrl ?? undefined,
    popStreetAddress: popAccess?.pop.streetAddress ?? null,
  }

  const runStatementPdf = async (action: "download" | "print") => {
    if (!viewingParty) return
    setPdfBusy(true)
    const dismiss =
      action === "download"
        ? showReportExportInProgressToast({ title: "Generando extracto…" })
        : null
    try {
      const payload = {
        partyName: ledgerPartyName,
        direction: ws.direction,
        balance: ledgerBalance,
        aging: ledgerAging,
        openDocuments: ledgerOpenDocuments,
        lines: ledgerLines,
      }
      if (action === "download") {
        await exportCurrentAccountStatementPdf(payload, pdfBrand)
      } else {
        await printCurrentAccountStatementPdf(payload, pdfBrand)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo generar el PDF.")
    } finally {
      dismiss?.()
      setPdfBusy(false)
    }
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  return (
    <DataWorkspaceTableListPage
      layout={{
        siteId,
        popId,
        popName: bootstrap?.popName ?? "",
        title: viewingParty
          ? ledgerPartyName || "Cuenta corriente"
          : "Cuentas corrientes",
        loading: bootstrapLoading || loading,
        userName: bootstrap?.userFullName,
        userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
        backHref: viewingParty ? listBackHref : undefined,
        headerActions: viewingParty ? (
          <div className="flex items-center gap-2">
            <DataWorkspaceHeaderIconButton
              label="Descargar extracto"
              headerVariant={dataWorkspaceTableListHeaderVariant}
              disabled={pdfBusy || loading}
              onClick={() => void runStatementPdf("download")}
            >
              <Download className="size-5" aria-hidden />
            </DataWorkspaceHeaderIconButton>
            <DataWorkspaceHeaderIconButton
              label="Imprimir extracto"
              headerVariant={dataWorkspaceTableListHeaderVariant}
              disabled={pdfBusy || loading}
              onClick={() => void runStatementPdf("print")}
            >
              <Printer className="size-5" aria-hidden />
            </DataWorkspaceHeaderIconButton>
            {ledgerCanCreate && ledgerUnapplied > 0.009 ? (
              <DataWorkspaceHeaderIconButton
                label="Imputar a cuenta"
                headerVariant={dataWorkspaceTableListHeaderVariant}
                onClick={() => setApplyOpen(true)}
              >
                <Link2 className="size-5" aria-hidden />
              </DataWorkspaceHeaderIconButton>
            ) : null}
            {ledgerCanCreate ? (
              <DataWorkspaceHeaderIconButton
                label={ws.direction === "payable" ? "Pagar" : "Cobrar"}
                headerVariant={dataWorkspaceTableListHeaderVariant}
                primary
                onClick={() => setSettleOpen(true)}
              >
                <Banknote className="size-5" aria-hidden />
              </DataWorkspaceHeaderIconButton>
            ) : null}
          </div>
        ) : null,
      }}
      error={error}
    >
      <DataWorkspaceTableListNatureShell>
        <DataWorkspaceTableListFiltersBar>
          <div className={dataWorkspaceListFiltersGridClass}>
            <div className={dataWorkspaceListFiltersPanelClass}>
              <CurrentAccountDirectionToolbarFilter
                value={ws.direction}
                onChange={changeDirection}
              />
            </div>
            {viewingParty ? (
              <div className={dataWorkspaceListFiltersPanelClass}>
                <CurrentAccountViewToolbarFilter
                  value={ws.view}
                  onChange={(view) => pushWs({ view })}
                />
              </div>
            ) : (
              <div className={dataWorkspaceListFiltersPanelClass}>
                <CurrentAccountAgingToolbarFilter
                  value={ws.aging}
                  onChange={(aging) => pushWs({ aging, page: 1 })}
                />
              </div>
            )}
            {viewingParty ? (
              <div className={dataWorkspaceListFiltersPanelLastClass}>
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="shrink-0 text-sm leading-relaxed text-rootsy-bruma-500">
                    {ledgerOpenCount === 1
                      ? "1 comprobante abierto"
                      : `${ledgerOpenCount.toLocaleString("es-AR")} comprobantes abiertos`}
                    {ledgerUnapplied > 0.009
                      ? ` · a cuenta ${new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        }).format(ledgerUnapplied)}`
                      : ""}
                    {` · saldo ${new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(ledgerBalance)}`}
                  </p>
                  <CurrentAccountAgingStrip aging={ledgerAging} />
                </div>
              </div>
            ) : (
              <div className={dataWorkspaceListFiltersPanelLastClass}>
                <DataWorkspaceListSearchField
                  id={searchInputId}
                  inputRef={searchInputRef}
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onClear={() => {
                    setSearchInput("")
                    searchInputRef.current?.focus()
                  }}
                  placeholder={`${currentAccountDirectionLabel(ws.direction)}… ( / )`}
                  resultsSummary={resultsSummary}
                />
              </div>
            )}
          </div>
        </DataWorkspaceTableListFiltersBar>

        <DataWorkspaceTableListShell
          activeFiltersBar={
            !viewingParty && hasFilterChips ? (
              <DataWorkspaceListActiveFiltersBar
                activeCount={activeFilterCount}
                onClearAll={() => {
                  setSearchInput("")
                  pushWs({ q: "", aging: "all", page: 1 })
                  searchInputRef.current?.focus()
                }}
              >
                {hasSearchChip ? (
                  <DataWorkspaceListFilterChip
                    label={`Buscar: «${ws.q.trim()}»`}
                    onRemove={() => {
                      setSearchInput("")
                      pushWs({ q: "", page: 1 })
                    }}
                    removeAriaLabel="Quitar búsqueda"
                  />
                ) : null}
                {hasAgingChip ? (
                  <DataWorkspaceListFilterChip
                    label={`Vencimiento: ${currentAccountAgingFilterLabel(ws.aging)}`}
                    onRemove={() => pushWs({ aging: "all", page: 1 })}
                    removeAriaLabel="Quitar filtro de vencimiento"
                  />
                ) : null}
              </DataWorkspaceListActiveFiltersBar>
            ) : null
          }
          overlay={
            !loading &&
            (viewingParty
              ? viewingOpen
                ? ledgerOpenDocuments.length === 0
                : ledgerLines.length === 0
              : totalCount === 0) ? (
              <DataWorkspaceTableEmptyMascot />
            ) : null
          }
          footer={
            viewingParty ? null : (
              <DataWorkspaceTableListPaginationFooter
                listFetching={loading}
                totalCount={totalCount}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                currentPage={ws.page}
                totalPages={totalPages}
                pageSize={ws.pageSize}
                pageSizeOptions={[...CURRENT_ACCOUNT_TABLE_PAGE_SIZES]}
                paginationItems={paginationItems}
                onPageChange={(page) => pushWs({ page })}
                onPageSizeChange={(pageSize) =>
                  pushWs({
                    pageSize:
                      pageSize as (typeof CURRENT_ACCOUNT_TABLE_PAGE_SIZES)[number],
                    page: 1,
                  })
                }
                pageSizeLabelId={pageSizeLabelId}
              />
            )
          }
        >
          <DataWorkspaceListTableFrame>
            {viewingParty && viewingOpen ? (
              <table
                className={cn(workspaceTableLayoutClassName, "min-w-4xl")}
                aria-busy={loading}
              >
                <WorkspaceTableHeader>
                  <WorkspaceTableHeaderRow>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        currentAccountLedgerDateColumnClass,
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Fecha
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        currentAccountLedgerDocColumnClass,
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Comprobante
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        currentAccountLedgerDateColumnClass,
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Vence
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      align="right"
                      className={cn(
                        currentAccountLedgerMoneyColumnClass,
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Restante
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        currentAccountOpenAgingColumnClass,
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Tramo
                    </WorkspaceTableHead>
                  </WorkspaceTableHeaderRow>
                </WorkspaceTableHeader>
                <TableBody>
                  {loading ? (
                    <WorkspaceTableSkeletonRows
                      rowCount={8}
                      rowKeyPrefix="ca-open-sk"
                      columns={currentAccountOpenSkeletonColumns()}
                      tone="nature"
                    />
                  ) : (
                    ledgerOpenDocuments.map((document, index) => (
                      <WorkspaceTableBodyRow key={document.id} index={index}>
                        <CurrentAccountLedgerDateCell value={document.date} />
                        <CurrentAccountLedgerDocCell
                          label={document.documentLabel}
                          description={currentAccountOpenDocumentAgingLabel(
                            document.daysOverdue,
                          )}
                        />
                        <CurrentAccountLedgerDateCell value={document.dueDate} />
                        <CurrentAccountLedgerMoneyCell value={document.remaining} />
                        <CurrentAccountOpenAgingCell bucket={document.agingBucket} />
                      </WorkspaceTableBodyRow>
                    ))
                  )}
                </TableBody>
              </table>
            ) : viewingParty ? (
              <table
                className={cn(workspaceTableLayoutClassName, "min-w-4xl")}
                aria-busy={loading}
              >
                <WorkspaceTableHeader>
                  <WorkspaceTableHeaderRow>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        currentAccountLedgerDateColumnClass,
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Fecha
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        currentAccountLedgerDocColumnClass,
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Comprobante
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      align="right"
                      className={cn(
                        currentAccountLedgerMoneyColumnClass,
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Debe
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      align="right"
                      className={cn(
                        currentAccountLedgerMoneyColumnClass,
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Haber
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      align="right"
                      className={cn(
                        currentAccountLedgerMoneyColumnClass,
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Saldo
                    </WorkspaceTableHead>
                  </WorkspaceTableHeaderRow>
                </WorkspaceTableHeader>
                <TableBody>
                  {loading ? (
                    <WorkspaceTableSkeletonRows
                      rowCount={8}
                      rowKeyPrefix="ca-ledger-sk"
                      columns={currentAccountLedgerSkeletonColumns()}
                      tone="nature"
                    />
                  ) : (
                    ledgerLines.map((line, index) => (
                      <WorkspaceTableBodyRow key={line.id} index={index}>
                        <CurrentAccountLedgerDateCell value={line.date} />
                        <CurrentAccountLedgerDocCell
                          label={line.documentLabel}
                          description={line.description}
                        />
                        <CurrentAccountLedgerMoneyCell value={line.debit} />
                        <CurrentAccountLedgerMoneyCell value={line.credit} />
                        <CurrentAccountLedgerMoneyCell value={line.balance} />
                      </WorkspaceTableBodyRow>
                    ))
                  )}
                </TableBody>
              </table>
            ) : (
              <table
                className={cn(workspaceTableLayoutClassName, "min-w-4xl")}
                aria-busy={loading}
              >
                <WorkspaceTableHeader>
                  <WorkspaceTableHeaderRow>
                    <WorkspaceTableSortHead
                      tone="nature"
                      label={
                        ws.direction === "payable" ? "Proveedor" : "Cliente"
                      }
                      direction={sortDirection("party_name")}
                      onSort={() => handleSortColumn("party_name")}
                      className={cn(
                        currentAccountTablePartyColumnClass,
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    />
                    <WorkspaceTableSortHead
                      tone="nature"
                      label="Abiertos"
                      direction={sortDirection("open_count")}
                      onSort={() => handleSortColumn("open_count")}
                      className={cn(
                        currentAccountTableCountColumnClass,
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    />
                    <WorkspaceTableSortHead
                      tone="nature"
                      align="right"
                      label="Vencido"
                      direction={sortDirection("overdue")}
                      onSort={() => handleSortColumn("overdue")}
                      className={cn(
                        currentAccountTableAmountColumnClass,
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    />
                    <WorkspaceTableSortHead
                      tone="nature"
                      align="right"
                      label="Saldo"
                      direction={sortDirection("balance")}
                      onSort={() => handleSortColumn("balance")}
                      className={cn(
                        currentAccountTableAmountColumnClass,
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    />
                  </WorkspaceTableHeaderRow>
                </WorkspaceTableHeader>
                <TableBody>
                  {loading ? (
                    <WorkspaceTableSkeletonRows
                      rowCount={skeletonRowCount}
                      rowKeyPrefix="ca-parties-sk"
                      columns={currentAccountsSkeletonColumns()}
                      tone="nature"
                    />
                  ) : (
                    parties.map((row, index) => (
                      <WorkspaceTableBodyRow
                        key={row.partyId}
                        index={index}
                        noHover={false}
                        className="cursor-pointer"
                        onClick={() => pushWs({ partyId: row.partyId })}
                      >
                        <CurrentAccountPartyNameCell value={row.partyName} />
                        <CurrentAccountCountCell value={row.openCount} />
                        <CurrentAccountOverdueCell
                          value={row.overdueAmount}
                          aging={row.aging}
                        />
                        <CurrentAccountMoneyCell value={row.balance} />
                      </WorkspaceTableBodyRow>
                    ))
                  )}
                </TableBody>
              </table>
            )}
          </DataWorkspaceListTableFrame>
        </DataWorkspaceTableListShell>
      </DataWorkspaceTableListNatureShell>
      {viewingParty && ws.partyId ? (
        <>
          <CurrentAccountSettleDialog
            open={settleOpen}
            onOpenChange={setSettleOpen}
            popId={popId}
            direction={ws.direction}
            partyId={ws.partyId}
            partyName={ledgerPartyName}
            documents={ledgerOpenDocuments}
            onSettled={() => void refreshCurrentAccountLedger()}
          />
          <CurrentAccountApplyDialog
            open={applyOpen}
            onOpenChange={setApplyOpen}
            popId={popId}
            direction={ws.direction}
            partyId={ws.partyId}
            partyName={ledgerPartyName}
            unappliedCredit={ledgerUnapplied}
            documents={ledgerOpenDocuments}
            onApplied={() => void refreshCurrentAccountLedger()}
          />
        </>
      ) : null}
    </DataWorkspaceTableListPage>
  )
}

