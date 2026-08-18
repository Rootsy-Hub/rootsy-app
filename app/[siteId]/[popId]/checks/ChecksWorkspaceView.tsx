"use client"

import {
  clearPopCheck,
  createPopCheck,
  depositPopCheck,
  rejectPopCheck,
  voidPopCheck,
  type CheckTableRow,
} from "@/app/[siteId]/[popId]/checks/actions"
import { CheckLifecycleDialog } from "@/app/[siteId]/[popId]/checks/CheckLifecycleDialog"
import {
  CheckDirectionToolbarFilter,
  checkDirectionFilterToQuery,
  resolveCheckDirectionFilterId,
} from "@/app/[siteId]/[popId]/checks/CheckDirectionToolbarFilter"
import { CheckStatusToolbarFilter, checkStatusFilterToQuery, resolveCheckStatusFilterId } from "@/app/[siteId]/[popId]/checks/CheckStatusToolbarFilter"
import { CheckUpsertDialog } from "@/app/[siteId]/[popId]/checks/CheckUpsertDialog"
import {
  defaultCheckCreateFormState,
  type CheckCreateFormState,
} from "@/app/[siteId]/[popId]/checks/checkFormState"
import {
  CheckTableActionsCell,
  CheckTableAmountCell,
  CheckTableBankCell,
  CheckTableDateCell,
  CheckTableDirectionCell,
  CheckTableNumberCell,
  CheckTablePartyCell,
  CheckTableStatusCell,
} from "@/app/[siteId]/[popId]/checks/checksTableCells"
import {
  checkTableActionsColumnClass,
  checkTableAmountColumnClass,
  checkTableBankColumnClass,
  checkTableDateColumnClass,
  checkTableDirectionColumnClass,
  checkTableNumberColumnClass,
  checkTablePartyColumnClass,
  checkTableStatusColumnClass,
} from "@/app/[siteId]/[popId]/checks/checksTableLayout"
import {
  CHECK_TABLE_PAGE_SIZES,
  mergeChecksWorkspaceUrl,
  parseChecksWorkspaceUrl,
  type CheckTableSortKey,
} from "@/app/[siteId]/[popId]/checks/workspaceUrl"
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
import { checksSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { TableBody } from "@/components/ui/table"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { usePopChecksTable } from "@/hooks/usePopChecksTable"
import { popChecksQueryRoot } from "@/lib/queryKeys"
import { useQueryClient } from "@tanstack/react-query"
import {
  checkDirectionLabel,
  checkStatusLabel,
  type CheckDirection,
  type CheckLifecycleAction,
} from "@/lib/checkDocuments"
import { getTreasuryPaymentContext } from "@/lib/treasuryPaymentContext"
import { cn } from "@/lib/utils"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
} from "@/lib/workspaceTableSort"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"

export function ChecksWorkspaceView() {
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
    () => parseChecksWorkspaceUrl(searchParams),
    [searchParams],
  )
  const searchInputId = useId()
  const pageSizeLabelId = useId()
  const { bootstrap, loading: bootstrapLoading } = usePopWorkspace()

  const [searchInput, setSearchInput] = useState(ws.q)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [bankOptions, setBankOptions] = useState<{ id: string; name: string }[]>(
    [],
  )
  const [lifecycleOpen, setLifecycleOpen] = useState(false)
  const [lifecycleAction, setLifecycleAction] =
    useState<CheckLifecycleAction | null>(null)
  const [lifecycleCheck, setLifecycleCheck] = useState<CheckTableRow | null>(
    null,
  )
  const [lifecycleSaving, setLifecycleSaving] = useState(false)
  const [lifecycleError, setLifecycleError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState<CheckCreateFormState>(
    defaultCheckCreateFormState("received"),
  )

  const pushWs = useCallback(
    (patch: Parameters<typeof mergeChecksWorkspaceUrl>[1]) => {
      const next = mergeChecksWorkspaceUrl(searchParams, patch)
      const qs = next.toString()
      if (qs === searchParams.toString()) return
      const href = qs ? `${pathname}?${qs}` : pathname
      routerRef.current.replace(href, { scroll: false })
    },
    [pathname, searchParams],
  )

  const handleSortColumn = useCallback(
    (column: CheckTableSortKey) => {
      const next = nextWorkspaceTableSortState(
        { sort: ws.sort, ord: ws.ord },
        column,
      )
      pushWs({
        sort: next.sort as CheckTableSortKey | null,
        ord: next.ord,
      })
    },
    [pushWs, ws.ord, ws.sort],
  )

  const sortDirection = useCallback(
    (column: CheckTableSortKey) =>
      workspaceTableSortDisplayDirection(
        { sort: ws.sort, ord: ws.ord },
        column,
      ),
    [ws.ord, ws.sort],
  )

  const checksQuery = usePopChecksTable(
    popId,
    {
      q: ws.q,
      page: ws.page,
      pageSize: ws.pageSize,
      direction: ws.direction,
      status: ws.status,
      sort: ws.sort,
      ord: ws.ord,
    },
    { enabled: Boolean(popId) },
  )

  const checks = checksQuery.data?.checks ?? []
  const totalCount = checksQuery.data?.totalCount ?? 0
  const canCreate = checksQuery.data?.canCreate ?? false
  const canUpdate = checksQuery.data?.canUpdate ?? false
  const loading =
    checksQuery.isPending ||
    (checksQuery.isFetching && !checksQuery.isFetched)
  const error =
    checksQuery.data?.success === false
      ? checksQuery.data.error
      : checksQuery.error instanceof Error
        ? checksQuery.error.message
        : checksQuery.error
          ? String(checksQuery.error)
          : null

  const refreshChecksList = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popChecksQueryRoot(popId),
    })
  }, [popId, queryClient])

  useEffect(() => {
    const res = checksQuery.data
    if (!res || res.success || !res.redirect) return
    routerRef.current.replace(res.redirect)
  }, [checksQuery.data])

  useEffect(() => {
    if (!popId) return
    let cancelled = false
    void getTreasuryPaymentContext(popId).then((res) => {
      if (cancelled || !res.success) return
      setBankOptions(res.context.bankTreasuryAccounts)
    })
    return () => {
      cancelled = true
    }
  }, [popId])

  useEffect(() => {
    setSearchInput(ws.q)
  }, [ws.q])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === ws.q.trim()) return
      pushWs({ q: next, page: 1 })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [pushWs, searchInput, ws.q])

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

  const hasFilterChips =
    ws.q.trim() !== "" || ws.direction !== "" || ws.status !== ""
  const activeFilterCount = [ws.q.trim(), ws.direction, ws.status].filter(
    Boolean,
  ).length

  const resultsSummary = useMemo(() => {
    if (loading && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "cheque" : "cheques"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [loading, totalCount])

  const openCreate = (direction: CheckDirection) => {
    setForm(defaultCheckCreateFormState(direction))
    setFormError(null)
    setFormOpen(true)
  }

  const openLifecycle = (row: CheckTableRow, action: CheckLifecycleAction) => {
    setLifecycleCheck(row)
    setLifecycleAction(action)
    setLifecycleError(null)
    setLifecycleOpen(true)
  }

  const submitLifecycle = async (input: {
    treasuryAccountId: string
    actionDate: string
    reason: string
  }) => {
    if (!popId || !lifecycleCheck || !lifecycleAction || lifecycleSaving) return
    setLifecycleSaving(true)
    setLifecycleError(null)
    const checkId = lifecycleCheck.id
    const res =
      lifecycleAction === "deposit"
        ? await depositPopCheck(popId, checkId, {
            treasuryAccountId: input.treasuryAccountId,
            depositedAt: input.actionDate,
          })
        : lifecycleAction === "clear"
          ? await clearPopCheck(popId, checkId, { clearedAt: input.actionDate })
          : lifecycleAction === "reject"
            ? await rejectPopCheck(popId, checkId, {
                rejectedAt: input.actionDate,
                reason: input.reason,
              })
            : await voidPopCheck(popId, checkId)
    setLifecycleSaving(false)
    if (!res.success) {
      setLifecycleError(res.error)
      return
    }
    setLifecycleOpen(false)
    setLifecycleCheck(null)
    setLifecycleAction(null)
    await refreshChecksList()
  }

  const submitForm = async (event: FormEvent) => {
    event.preventDefault()
    if (formSaving) return
    setFormSaving(true)
    setFormError(null)
    const res = await createPopCheck(popId, form)
    setFormSaving(false)
    if (!res.success) {
      setFormError(res.error)
      return
    }
    setFormOpen(false)
    await refreshChecksList()
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
        title: "Cheques",
        loading: bootstrapLoading || loading,
        userName: bootstrap?.userFullName,
        userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
        headerActions: canCreate ? (
          <div className="flex items-center gap-2">
            <DataWorkspaceHeaderIconButton
              label="Recibir cheque"
              headerVariant={dataWorkspaceTableListHeaderVariant}
              primary
              onClick={() => openCreate("received")}
            >
              <ArrowDownLeft className="size-5" aria-hidden />
            </DataWorkspaceHeaderIconButton>
            <DataWorkspaceHeaderIconButton
              label="Emitir cheque"
              headerVariant={dataWorkspaceTableListHeaderVariant}
              onClick={() => openCreate("issued")}
            >
              <ArrowUpRight className="size-5" aria-hidden />
            </DataWorkspaceHeaderIconButton>
          </div>
        ) : null,
      }}
      error={error}
    >
      <DataWorkspaceTableListNatureShell>
        <DataWorkspaceTableListFiltersBar>
          <div className={dataWorkspaceListFiltersGridClass}>
            <div className={dataWorkspaceListFiltersPanelClass}>
              <CheckDirectionToolbarFilter
                value={resolveCheckDirectionFilterId(ws.direction)}
                onChange={(id) =>
                  pushWs({
                    direction: checkDirectionFilterToQuery(id),
                    page: 1,
                  })
                }
              />
            </div>
            <div className={dataWorkspaceListFiltersPanelClass}>
              <CheckStatusToolbarFilter
                value={resolveCheckStatusFilterId(ws.status)}
                onChange={(id) =>
                  pushWs({
                    status: checkStatusFilterToQuery(id),
                    page: 1,
                  })
                }
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
                placeholder="Número, banco, contraparte… ( / )"
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
                  pushWs({ q: "", direction: "", status: "", page: 1 })
                  searchInputRef.current?.focus()
                }}
              >
                {ws.q.trim() ? (
                  <DataWorkspaceListFilterChip
                    label={`Buscar: «${ws.q.trim()}»`}
                    onRemove={() => {
                      setSearchInput("")
                      pushWs({ q: "", page: 1 })
                    }}
                    removeAriaLabel="Quitar búsqueda"
                  />
                ) : null}
                {ws.direction ? (
                  <DataWorkspaceListFilterChip
                    label={checkDirectionLabel(ws.direction)}
                    onRemove={() => pushWs({ direction: "", page: 1 })}
                    removeAriaLabel="Quitar filtro de dirección"
                  />
                ) : null}
                {ws.status ? (
                  <DataWorkspaceListFilterChip
                    label={checkStatusLabel(ws.status)}
                    onRemove={() => pushWs({ status: "", page: 1 })}
                    removeAriaLabel="Quitar filtro de estado"
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
              pageSizeOptions={[...CHECK_TABLE_PAGE_SIZES]}
              paginationItems={paginationItems}
              onPageChange={(page) => pushWs({ page })}
              onPageSizeChange={(pageSize) =>
                pushWs({ pageSize: pageSize as (typeof CHECK_TABLE_PAGE_SIZES)[number], page: 1 })
              }
              pageSizeLabelId={pageSizeLabelId}
            />
          }
        >
          <DataWorkspaceListTableFrame>
            <table
              className={cn(workspaceTableLayoutClassName, "min-w-5xl")}
              aria-busy={loading}
            >
              <WorkspaceTableHeader>
                <WorkspaceTableHeaderRow>
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Número"
                    direction={sortDirection("check_number")}
                    onSort={() => handleSortColumn("check_number")}
                    className={cn(
                      checkTableNumberColumnClass,
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  />
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Dirección"
                    direction={sortDirection("direction")}
                    onSort={() => handleSortColumn("direction")}
                    className={cn(
                      checkTableDirectionColumnClass,
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  />
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Banco"
                    direction={sortDirection("bank_name")}
                    onSort={() => handleSortColumn("bank_name")}
                    className={cn(
                      checkTableBankColumnClass,
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  />
                  <WorkspaceTableHead
                    tone="nature"
                    className={cn(
                      checkTablePartyColumnClass,
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  >
                    Contraparte
                  </WorkspaceTableHead>
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Importe"
                    direction={sortDirection("amount")}
                    onSort={() => handleSortColumn("amount")}
                    className={cn(
                      checkTableAmountColumnClass,
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  />
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Emisión"
                    direction={sortDirection("issue_date")}
                    onSort={() => handleSortColumn("issue_date")}
                    className={cn(
                      checkTableDateColumnClass,
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  />
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Cobro"
                    direction={sortDirection("due_date")}
                    onSort={() => handleSortColumn("due_date")}
                    className={cn(
                      checkTableDateColumnClass,
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  />
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Estado"
                    direction={sortDirection("status")}
                    onSort={() => handleSortColumn("status")}
                    className={cn(
                      checkTableStatusColumnClass,
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  />
                  <WorkspaceTableHead
                    tone="nature"
                    className={cn(
                      checkTableActionsColumnClass,
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  >
                    <span className="sr-only">Acciones</span>
                  </WorkspaceTableHead>
                </WorkspaceTableHeaderRow>
              </WorkspaceTableHeader>
              <TableBody>
                {loading ? (
                  <WorkspaceTableSkeletonRows
                    rowCount={skeletonRowCount}
                    rowKeyPrefix="checks-sk"
                    columns={checksSkeletonColumns()}
                    tone="nature"
                  />
                ) : totalCount === 0 ? null : (
                  checks.map((row, index) => (
                    <WorkspaceTableBodyRow key={row.id} index={index}>
                      <CheckTableNumberCell value={row.checkNumber} />
                      <CheckTableDirectionCell value={row.direction} />
                      <CheckTableBankCell value={row.bankName} />
                      <CheckTablePartyCell value={row.partyName} />
                      <CheckTableAmountCell value={row.amount} />
                      <CheckTableDateCell value={row.issueDate} />
                      <CheckTableDateCell value={row.dueDate} />
                      <CheckTableStatusCell value={row.status} />
                      <CheckTableActionsCell
                        row={row}
                        disabled={!canUpdate}
                        onAction={(action) => openLifecycle(row, action)}
                      />
                    </WorkspaceTableBodyRow>
                  ))
                )}
              </TableBody>
            </table>
          </DataWorkspaceListTableFrame>
        </DataWorkspaceTableListShell>
      </DataWorkspaceTableListNatureShell>

      <CheckUpsertDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        popId={popId}
        title={
          form.direction === "issued" ? "Emitir cheque" : "Recibir cheque"
        }
        description={
          form.direction === "issued"
            ? "Queda pendiente de débito hasta que se acredite o rechace."
            : "Queda en cartera hasta que lo deposites o se acredite."
        }
        saving={formSaving}
        banner={formError}
        form={form}
        setForm={setForm}
        onSubmit={submitForm}
        onCancel={() => setFormOpen(false)}
        onAfterClose={() => {
          setFormError(null)
          setFormSaving(false)
        }}
      />

      <CheckLifecycleDialog
        open={lifecycleOpen}
        onOpenChange={setLifecycleOpen}
        action={lifecycleAction}
        check={lifecycleCheck}
        banks={bankOptions}
        saving={lifecycleSaving}
        banner={lifecycleError}
        onSubmit={(input) => {
          void submitLifecycle(input)
        }}
      />
    </DataWorkspaceTableListPage>
  )
}

