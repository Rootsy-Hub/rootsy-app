"use client"

import { CurrentAccountAgingToolbarFilter } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountAgingToolbarFilter"
import { CurrentAccountApplyDialog } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountApplyDialog"
import { CurrentAccountDetailView } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountDetailView"
import { CurrentAccountDirectionToolbarFilter } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountDirectionToolbarFilter"
import { CurrentAccountEnrollDialog } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountEnrollDialog"
import { CurrentAccountSettleDialog } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountSettleDialog"
import { CurrentAccountTermsDialog } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountTermsDialog"
import {
  getPopCurrentAccountLedger,
  setPopCurrentAccountEnrollment,
  type CurrentAccountOpenDocument,
  type CurrentAccountPartyRow,
} from "@/app/[siteId]/[popId]/current-accounts/actions"
import {
  CurrentAccountCountCell,
  CurrentAccountLimitCell,
  CurrentAccountMoneyCell,
  CurrentAccountOverdueCell,
  CurrentAccountPartyNameCell,
  CurrentAccountTermDaysCell,
} from "@/app/[siteId]/[popId]/current-accounts/currentAccountsTableCells"
import {
  CurrentAccountTableActionsCell,
  CurrentAccountTableActionsHead,
  type CurrentAccountRowActionKind,
} from "@/app/[siteId]/[popId]/current-accounts/currentAccountsTableRowOptions"
import {
  currentAccountTableAmountColumnClass,
  currentAccountTableCountColumnClass,
  currentAccountTableLimitColumnClass,
  currentAccountTablePartyColumnClass,
  currentAccountTableTermColumnClass,
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
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceBlocksPageScopeClass,
  workspaceTableLayoutClassName,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutHeaderHeadClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { RootsConfirmDialog } from "@/components/rootsy-dialog"
import { WorkspaceTableSortHead } from "@/components/data-workspace/WorkspaceTableSortHead"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { currentAccountsSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { DataWorkspaceHeaderTooltipIconButton } from "@/components/layouts/DataWorkspaceHeaderTooltipIconButton"
import { TableBody } from "@/components/ui/table"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { usePopCurrentAccountParties } from "@/hooks/usePopCurrentAccountParties"
import {
  CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS,
  currentAccountAgingFilterLabel,
  currentAccountDirectionLabel,
  type CurrentAccountDirection,
} from "@/lib/currentAccounts"
import {
  popCurrentAccountLedgerQueryKey,
  popCurrentAccountLedgerQueryRoot,
  popCurrentAccountPartiesQueryRoot,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { Truck, UserPlus } from "lucide-react"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
} from "@/lib/workspaceTableSort"
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
  const ws = useMemo(
    () => parseCurrentAccountsWorkspaceUrl(searchParams),
    [searchParams],
  )
  const searchInputId = useId()
  const pageSizeLabelId = useId()
  const { bootstrap, loading: bootstrapLoading, popAccess } = usePopWorkspace()
  const queryClient = useQueryClient()

  const [searchInput, setSearchInput] = useState(ws.q)
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [enrollDirection, setEnrollDirection] =
    useState<CurrentAccountDirection>("receivable")
  const [rowAction, setRowAction] = useState<{
    kind: CurrentAccountRowActionKind
    party: CurrentAccountPartyRow
    documents: CurrentAccountOpenDocument[]
    unappliedCredit: number
  } | null>(null)
  const [rowActionBusyId, setRowActionBusyId] = useState<string | null>(null)
  const [enrollmentBusy, setEnrollmentBusy] = useState(false)
  const [rowActionError, setRowActionError] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  const parties = partiesQuery.data?.parties ?? []
  const totalCount = partiesQuery.data?.totalCount ?? 0
  const canCreate = partiesQuery.data?.success
    ? partiesQuery.data.canCreate
    : false
  const loading =
    partiesQuery.isPending ||
    (partiesQuery.isFetching && !partiesQuery.isFetched)
  const tableError =
    partiesQuery.data?.success === false
      ? partiesQuery.data.error
      : partiesQuery.error instanceof Error
        ? partiesQuery.error.message
        : partiesQuery.error
          ? String(partiesQuery.error)
          : null
  const error = rowActionError ?? tableError

  useEffect(() => {
    const res = partiesQuery.data
    if (!res || res.success || !res.redirect) return
    routerRef.current.replace(res.redirect)
  }, [partiesQuery.data])

  useEffect(() => {
    setSearchInput(ws.q)
  }, [ws.q])

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
  const activeFilterCount = Number(hasSearchChip) + Number(hasAgingChip)
  const partyNoun = ws.direction === "payable" ? "proveedor" : "cliente"
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

  const openParty = (
    partyId: string,
    direction: CurrentAccountDirection = ws.direction,
  ) => {
    const next = mergeCurrentAccountsWorkspaceUrl(searchParams, {
      partyId,
      direction,
      page: 1,
    })
    const qs = next.toString()
    const href = qs ? `${pathname}?${qs}` : pathname
    router.push(href, { scroll: false })
  }

  const openEnroll = (direction: CurrentAccountDirection) => {
    setEnrollDirection(direction)
    setEnrollOpen(true)
  }

  const refreshParties = useCallback(async () => {
    if (!popId) return
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: popCurrentAccountPartiesQueryRoot(popId),
      }),
      queryClient.invalidateQueries({
        queryKey: popCurrentAccountLedgerQueryRoot(popId),
      }),
    ])
  }, [popId, queryClient])

  const closeRowAction = () => setRowAction(null)

  const handleRowAction = async (
    party: CurrentAccountPartyRow,
    kind: CurrentAccountRowActionKind,
  ) => {
    setRowActionError(null)
    if (kind === "terms" || kind === "enroll" || kind === "unenroll") {
      setRowAction({
        kind,
        party,
        documents: [],
        unappliedCredit: party.unappliedCredit,
      })
      return
    }

    setRowActionBusyId(party.partyId)
    try {
      const ledger = await queryClient.fetchQuery({
        queryKey: popCurrentAccountLedgerQueryKey(
          popId,
          ws.direction,
          party.partyId,
        ),
        queryFn: () =>
          getPopCurrentAccountLedger(popId, {
            direction: ws.direction,
            partyId: party.partyId,
          }),
        ...sessionListQueryOptions,
      })
      if (!ledger.success) {
        setRowActionError(ledger.error)
        return
      }
      setRowAction({
        kind,
        party: {
          ...party,
          unappliedCredit: ledger.unappliedCredit,
          creditLimit: ledger.creditLimit,
          termDays: ledger.termDays,
          enrolled: ledger.enrolled,
        },
        documents: ledger.openDocuments,
        unappliedCredit: ledger.unappliedCredit,
      })
    } catch (e: unknown) {
      setRowActionError(
        e instanceof Error ? e.message : "No se pudo abrir la acción.",
      )
    } finally {
      setRowActionBusyId(null)
    }
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  if (viewingParty && ws.partyId) {
    return (
      <DataWorkspaceModuleLayout
        siteId={siteId}
        popId={popId}
        popName={bootstrap?.popName ?? ""}
        title="Cuentas corrientes"
        headerVariant={dataWorkspaceModuleHeaderVariant}
        loading={bootstrapLoading}
        userName={bootstrap?.userFullName}
        userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
        userRoleLabel={bootstrap?.roleLabel}
        contentFlush
        mainMaxWidthClass="max-w-none"
        mainClassName={dataWorkspaceBlocksPageMainClass}
      >
        <div className={dataWorkspaceBlocksPageScopeClass}>
          <CurrentAccountDetailView
            popId={popId}
            direction={ws.direction}
            partyId={ws.partyId}
            view={ws.view}
            listBackHref={listBackHref}
            onViewChange={(view) => pushWs({ view })}
            pdfBrand={{
              popName: bootstrap?.popName,
              popLogoUrl: popAccess?.pop.imageUrl ?? undefined,
              popStreetAddress: popAccess?.pop.streetAddress ?? null,
            }}
          />
        </div>
      </DataWorkspaceModuleLayout>
    )
  }

  return (
    <>
    <DataWorkspaceTableListPage
      layout={{
        siteId,
        popId,
        popName: bootstrap?.popName ?? "",
        title: "Cuentas corrientes",
        loading: bootstrapLoading,
        userName: bootstrap?.userFullName,
        userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
        userRoleLabel: bootstrap?.roleLabel,
        headerActions: canCreate ? (
          <>
            <DataWorkspaceHeaderTooltipIconButton
              label="Dar de alta un cliente"
              headerVariant={dataWorkspaceTableListHeaderVariant}
              primary
              onClick={() => openEnroll("receivable")}
            >
              <UserPlus className="size-5" aria-hidden />
            </DataWorkspaceHeaderTooltipIconButton>
            <DataWorkspaceHeaderTooltipIconButton
              label="Dar de alta un proveedor"
              headerVariant={dataWorkspaceTableListHeaderVariant}
              primary
              onClick={() => openEnroll("payable")}
            >
              <Truck className="size-5" aria-hidden />
            </DataWorkspaceHeaderTooltipIconButton>
          </>
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
            <div className={dataWorkspaceListFiltersPanelClass}>
              <CurrentAccountAgingToolbarFilter
                value={ws.aging}
                onChange={(aging) => pushWs({ aging, page: 1 })}
              />
            </div>
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
          </div>
        </DataWorkspaceTableListFiltersBar>

        <DataWorkspaceTableListShell
          activeFiltersBar={
            hasFilterChips ? (
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
            !loading && totalCount === 0 ? <DataWorkspaceTableEmptyMascot /> : null
          }
          footer={
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
          }
        >
          <DataWorkspaceListTableFrame>
            <table
              className={cn(workspaceTableLayoutClassName, "min-w-4xl")}
              aria-busy={loading}
            >
              <WorkspaceTableHeader>
                <WorkspaceTableHeaderRow>
                  <CurrentAccountTableActionsHead />
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
                    align="right"
                    label="Límite"
                    direction={sortDirection("credit_limit")}
                    onSort={() => handleSortColumn("credit_limit")}
                    className={cn(
                      currentAccountTableLimitColumnClass,
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  />
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Plazo"
                    direction={sortDirection("term_days")}
                    onSort={() => handleSortColumn("term_days")}
                    className={cn(
                      currentAccountTableTermColumnClass,
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
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver cuenta de ${row.partyName}`}
                      className="cursor-pointer"
                      onClick={() => openParty(row.partyId)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          openParty(row.partyId)
                        }
                      }}
                    >
                      <CurrentAccountTableActionsCell
                        row={row}
                        direction={ws.direction}
                        canCreate={canCreate}
                        busy={rowActionBusyId === row.partyId}
                        onAction={(kind) => {
                          void handleRowAction(row, kind)
                        }}
                      />
                      <CurrentAccountPartyNameCell value={row.partyName} />
                      <CurrentAccountLimitCell
                        enrolled={row.enrolled}
                        creditLimit={row.creditLimit}
                      />
                      <CurrentAccountTermDaysCell
                        enrolled={row.enrolled}
                        termDays={row.termDays}
                      />
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
          </DataWorkspaceListTableFrame>
        </DataWorkspaceTableListShell>
      </DataWorkspaceTableListNatureShell>
    </DataWorkspaceTableListPage>
    <CurrentAccountEnrollDialog
      open={enrollOpen}
      onOpenChange={setEnrollOpen}
      popId={popId}
      direction={enrollDirection}
      onEnrolled={(partyId) => {
        void queryClient.invalidateQueries({
          queryKey: popCurrentAccountPartiesQueryRoot(popId),
        })
        openParty(partyId, enrollDirection)
      }}
    />
    <CurrentAccountSettleDialog
      open={rowAction?.kind === "settle"}
      onOpenChange={(open) => {
        if (!open) closeRowAction()
      }}
      popId={popId}
      direction={ws.direction}
      partyId={rowAction?.party.partyId ?? ""}
      partyName={rowAction?.party.partyName ?? ""}
      documents={rowAction?.documents ?? []}
      onSettled={() => {
        closeRowAction()
        void refreshParties()
      }}
    />
    <CurrentAccountApplyDialog
      open={rowAction?.kind === "apply"}
      onOpenChange={(open) => {
        if (!open) closeRowAction()
      }}
      popId={popId}
      direction={ws.direction}
      partyId={rowAction?.party.partyId ?? ""}
      partyName={rowAction?.party.partyName ?? ""}
      unappliedCredit={rowAction?.unappliedCredit ?? 0}
      documents={rowAction?.documents ?? []}
      onApplied={() => {
        closeRowAction()
        void refreshParties()
      }}
    />
    <CurrentAccountTermsDialog
      open={rowAction?.kind === "terms" || rowAction?.kind === "enroll"}
      onOpenChange={(open) => {
        if (!open) closeRowAction()
      }}
      popId={popId}
      direction={ws.direction}
      partyId={rowAction?.party.partyId ?? ""}
      partyName={rowAction?.party.partyName ?? ""}
      creditLimit={rowAction?.party.creditLimit ?? null}
      termDays={
        rowAction?.party.termDays ?? CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS
      }
      onSaved={() => {
        closeRowAction()
        void refreshParties()
      }}
    />
    <RootsConfirmDialog
      open={rowAction?.kind === "unenroll"}
      onOpenChange={(open) => {
        if (!open) closeRowAction()
      }}
      title="Deshabilitar cuenta corriente"
      description={
        ws.direction === "payable"
          ? "Ya no se podrá comprar a cuenta de este proveedor. El saldo y el extracto se mantienen."
          : "Ya no se podrá vender a cuenta de este cliente. El saldo y el extracto se mantienen."
      }
      confirmLabel="Deshabilitar"
      busy={enrollmentBusy}
      onConfirm={() => {
        if (!rowAction) return
        void (async () => {
          setEnrollmentBusy(true)
          setRowActionError(null)
          const result = await setPopCurrentAccountEnrollment(popId, {
            direction: ws.direction,
            partyId: rowAction.party.partyId,
            enabled: false,
          })
          setEnrollmentBusy(false)
          if (!result.success) {
            setRowActionError(result.error)
            return
          }
          closeRowAction()
          await refreshParties()
        })()
      }}
    />
    </>
  )
}
