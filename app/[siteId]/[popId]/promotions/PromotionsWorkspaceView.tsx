"use client"

import type { PromotionTableRow } from "@/app/[siteId]/[popId]/promotions/actions"
import { RootsIconButton } from "@/components/rootsy-button"
import { PromotionDeleteDialog } from "@/app/[siteId]/[popId]/promotions/PromotionDeleteDialog"
import { PromotionUpsertDialog } from "@/app/[siteId]/[popId]/promotions/PromotionUpsertDialog"
import {
  defaultPromotionFormState,
  promotionFormFromDetail,
  promotionFormToPayload,
  type PromotionFormState,
} from "@/app/[siteId]/[popId]/promotions/promotionFormState"
import {
  promotionDialogBodyClass,
  promotionDialogFooterClass,
  promotionDialogHeaderClass,
  promotionDialogSurfaceClass,
} from "@/app/[siteId]/[popId]/promotions/promotionConstants"
import {
  PromotionTypeToolbarFilter,
  promotionTypeFilterToQuery,
  resolvePromotionTypeFilterId,
} from "@/app/[siteId]/[popId]/promotions/PromotionTypeToolbarFilter"
import {
  PromotionTableImageCell,
  PromotionTableItemsCell,
  PromotionTableNameCell,
  PromotionTablePricingCell,
  PromotionTableScheduleCell,
  PromotionTableSelectCell,
  PromotionTableStatusCell,
  PromotionTableTypeCell,
} from "@/app/[siteId]/[popId]/promotions/promotionsTableCells"
import {
  promotionTableActionsColumnClass,
  promotionTableImageColumnClass,
  promotionTableItemsColumnClass,
  promotionTableNameColumnClass,
  promotionTablePricingColumnClass,
  promotionTableScheduleColumnClass,
  promotionTableStatusColumnClass,
  promotionTableTypeColumnClass,
} from "@/app/[siteId]/[popId]/promotions/promotionsTableLayout"
import {
  mergePromotionsWorkspaceUrl,
  parsePromotionsWorkspaceUrl,
  type PromotionTableSortKey,
} from "@/app/[siteId]/[popId]/promotions/workspaceUrl"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import {
  DataWorkspaceListFiltersDialogTrigger,
  DataWorkspaceListSearchField,
} from "@/components/data-workspace/DataWorkspaceListFilterFields"
import {
  DataWorkspaceTableListFiltersBar,
  DataWorkspaceTableListNatureShell,
  DataWorkspaceTableListPage,
  tableListInfiniteFromQuery,
  DataWorkspaceTableListShell,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import { DataWorkspaceTableListPageDock } from "@/components/data-workspace/DataWorkspaceTableInfinitePageDock"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  workspaceTableLayoutClassName,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutActionsBodyCellClass,
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutImageColumnClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableHead,
  WorkspaceTableBodyRow,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { WorkspaceTableSortHead } from "@/components/data-workspace/WorkspaceTableSortHead"
import {
  DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT,
  WorkspaceTableSkeletonRows,
} from "@/components/data-workspace/WorkspaceTableSkeleton"
import { promotionsSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { usePopPromotionCatalog } from "@/hooks/usePopPromotionCatalog"
import { usePopPromotionsTable } from "@/hooks/usePopPromotionsTable"
import { invalidateDataWorkspaceTableInfinite } from "@/lib/dataWorkspaceTableInfinite"
import { invalidatePopOperateCatalogs } from "@/lib/invalidatePopOperateCatalogs"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import {
  popPromotionQueryKey,
  popPromotionsQueryRoot,
} from "@/lib/queryKeys"
import {
  createPopPromotion,
  deletePopPromotion,
  fetchPopPromotion,
  updatePopPromotion,
} from "@/lib/rootsyApi/promotionsClient"
import { useQueryClient } from "@tanstack/react-query"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import {
  PROMOTION_TYPE_LABEL,
} from "@/lib/promotionTypes"
import { cn } from "@/lib/utils"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
} from "@/lib/workspaceTableSort"
import { Pencil, Plus, Trash2 } from "lucide-react"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "@/lib/pop-spa/navigation"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"

export function PromotionsWorkspaceView() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const siteId = String(params.siteId ?? "")
  const popId = String(params.popId ?? "")
  const queryClient = useQueryClient()
  const routerRef = useRef(router)
  routerRef.current = router
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
  const ws = useMemo(
    () => parsePromotionsWorkspaceUrl(workspaceParams),
    [workspaceParams],
  )
  const searchInputId = useId()
  const filtersButtonId = useId()

  const { bootstrap, loading: bootstrapLoading, hasPermission } =
    usePopWorkspace()
  const afterHydration = useAfterHydration()
  const menuCache = usePopMenuCache(popId)

  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [searchInput, setSearchInput] = useState(ws.q)
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftSoloActivos, setDraftSoloActivos] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const pushWs = useCallback(
    (patch: Parameters<typeof mergePromotionsWorkspaceUrl>[1]) => {
      const qs = mergePromotionsWorkspaceUrl(workspaceParams, patch)
      const next = qs.toString()
        ? `${pathname}?${qs.toString()}`
        : pathname
      if (typeof window !== "undefined") {
        const current = `${window.location.pathname}${window.location.search}`
        if (current !== next) {
          window.history.replaceState(window.history.state, "", next)
        }
      }
      setWorkspaceSearch(qs.toString())
    },
    [pathname, workspaceParams],
  )

  const handleSortColumn = useCallback(
    (column: PromotionTableSortKey) => {
      const next = nextWorkspaceTableSortState(
        { sort: ws.sort, ord: ws.ord },
        column,
      )
      pushWs({
        sort: next.sort as PromotionTableSortKey | null,
        ord: next.ord,
      })
    },
    [pushWs, ws.ord, ws.sort],
  )

  const sortDirection = useCallback(
    (column: PromotionTableSortKey) =>
      workspaceTableSortDisplayDirection(
        { sort: ws.sort, ord: ws.ord },
        column,
      ),
    [ws.ord, ws.sort],
  )

  const activePromotionTypeFilterId = useMemo(
    () => resolvePromotionTypeFilterId(ws.promotionType),
    [ws.promotionType],
  )

  const [formOpen, setFormOpen] = useState(false)
  const [formRefreshing, setFormRefreshing] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PromotionFormState>(defaultPromotionFormState())
  const editRequestIdRef = useRef(0)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PromotionTableRow | null>(
    null,
  )
  const [deleteTyped, setDeleteTyped] = useState("")
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const promotionsQuery = usePopPromotionsTable(
    popId,
    {
      q: ws.q,
      page: ws.page,
      pageSize: ws.pageSize,
      soloActivos: ws.soloActivos,
      promotionType: ws.promotionType,
      sort: ws.sort,
      ord: ws.ord,
    },
    { enabled: Boolean(popId && siteId) },
  )
  const catalogQuery = usePopPromotionCatalog(popId, { enabled: formOpen })
  const catalogOptions = catalogQuery.data ?? []
  const catalogLoading = catalogQuery.isPending && !catalogQuery.data

  const promotions = promotionsQuery.data?.promotions ?? []
  const totalCount = promotionsQuery.data?.totalCount ?? 0
  const promoPerm = useCallback(
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
  const canCreate = promoPerm(POP_PERMS.PROMOTION_CREATE)
  const canUpdate = promoPerm(POP_PERMS.PROMOTION_UPDATE)
  const canDelete = promoPerm(POP_PERMS.PROMOTION_DELETE)
  const loading =
    !popId || !siteId
      ? false
      : promotionsQuery.isPending ||
        (promotionsQuery.isFetching && !promotionsQuery.isFetched)
  const error =
    promotionsQuery.data?.success === false
      ? promotionsQuery.data.error
      : promotionsQuery.error instanceof Error
        ? promotionsQuery.error.message
        : promotionsQuery.error
          ? String(promotionsQuery.error)
          : null

  const refreshPromotionsList = useCallback(async () => {
    if (!popId) return
    await invalidateDataWorkspaceTableInfinite(
      queryClient,
      popPromotionsQueryRoot(popId),
    )
  }, [popId, queryClient])

  useEffect(() => {
    const res = promotionsQuery.data
    if (!res || res.success || !("redirect" in res) || !res.redirect) return
    const redirect = res.redirect
    const timeout = window.setTimeout(() => {
      routerRef.current.push(redirect)
    }, 1200)
    return () => window.clearTimeout(timeout)
  }, [promotionsQuery.data])

  useEffect(() => {
    setSelected(new Set())
  }, [
    ws.q,
    ws.page,
    ws.pageSize,
    ws.soloActivos,
    ws.promotionType,
    ws.sort,
    ws.ord,
  ])

  useEffect(() => {
    setSearchInput(ws.q)
  }, [ws.q])

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === ws.q.trim()) return
      pushWs({ q: next, page: 1 })
    }, 400)
    return () => window.clearTimeout(t)
  }, [searchInput, ws.q, pushWs])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target
      if (!(target instanceof HTMLElement)) return
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return
      }
      e.preventDefault()
      searchInputRef.current?.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const skeletonRowCount = DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT

  const visibleIds = useMemo(() => promotions.map((row) => row.id), [promotions])
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someVisibleSelected = visibleIds.some((id) => selected.has(id))

  const modalFiltersActiveCount = ws.soloActivos ? 1 : 0

  const hasFilterChips =
    ws.q.trim() !== "" || ws.soloActivos || ws.promotionType !== ""

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (ws.q.trim()) count++
    if (ws.soloActivos) count++
    if (ws.promotionType) count++
    return count
  }, [ws.q, ws.soloActivos, ws.promotionType])

  const resultsSummary = useMemo(() => {
    if (loading && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "promoción" : "promociones"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [loading, totalCount])

  const clearAllFilters = useCallback(() => {
    setSearchInput("")
    pushWs({
      q: "",
      soloActivos: false,
      promotionType: "",
      page: 1,
    })
    searchInputRef.current?.focus()
  }, [pushWs])

  const openCreate = () => {
    if (!canCreate) return
    setEditingId(null)
    setForm(defaultPromotionFormState())
    setFormError(null)
    setFormRefreshing(false)
    setFormOpen(true)
  }

  const openEdit = (row: PromotionTableRow) => {
    if (!popId) return
    const requestId = ++editRequestIdRef.current
    setFormError(null)
    setEditingId(row.id)
    setForm(promotionFormFromDetail({ ...row, slots: [] }))
    setFormRefreshing(true)
    setFormOpen(true)
    void queryClient
      .fetchQuery({
        queryKey: popPromotionQueryKey(popId, row.id),
        queryFn: () => fetchPopPromotion(popId, row.id),
        staleTime: 0,
      })
      .then((detail) => {
        if (editRequestIdRef.current !== requestId) return
        setForm(promotionFormFromDetail(detail))
      })
      .catch((err: unknown) => {
        if (editRequestIdRef.current !== requestId) return
        setFormError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la promoción",
        )
      })
      .finally(() => {
        if (editRequestIdRef.current === requestId) setFormRefreshing(false)
      })
  }

  const closeForm = () => {
    editRequestIdRef.current += 1
    setFormOpen(false)
  }

  const finalizeFormClose = () => {
    setEditingId(null)
    setFormError(null)
    setFormRefreshing(false)
    setFormSaving(false)
    setForm(defaultPromotionFormState())
  }

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    if (formSaving || formRefreshing) return
    setFormSaving(true)
    setFormError(null)
    const payload = promotionFormToPayload(form)
    const res = editingId
      ? await updatePopPromotion(popId, editingId, payload)
      : await createPopPromotion(popId, payload)
    setFormSaving(false)
    if (!res.success) {
      setFormError(res.error)
      return
    }
    setFormOpen(false)
    invalidatePopOperateCatalogs(queryClient, popId)
    await refreshPromotionsList()
  }

  const submitDelete = async () => {
    if (!deleteTarget || deleteBusy) return
    setDeleteBusy(true)
    setDeleteBanner(null)
    const res = await deletePopPromotion(popId, deleteTarget.id, deleteTyped)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteBanner(res.error)
      return
    }
    requestCloseDelete()
    invalidatePopOperateCatalogs(queryClient, popId)
    await refreshPromotionsList()
  }

  const requestCloseDelete = () => {
    setDeleteOpen(false)
  }

  const finalizeDeleteClose = () => {
    setDeleteTarget(null)
    setDeleteTyped("")
    setDeleteBanner(null)
  }

  const openDelete = (row: PromotionTableRow) => {
    setDeleteTarget(row)
    setDeleteTyped("")
    setDeleteBanner(null)
    setDeleteOpen(true)
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado</p>
      </div>
    )
  }

  return (
    <DataWorkspaceTableListPage
      layout={{
        siteId,
        popId,
        popName: bootstrap?.popName ?? "",
        title: "Promociones",
        loading: bootstrapLoading,
        userName: bootstrap?.userFullName,
        userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
        userRoleLabel: bootstrap?.roleLabel ?? undefined,
        pillLabel: "Menú",
        headerActions: canCreate ? (
          <RootsIconButton
            label="Nueva promoción"
            semantic="primary"
            atmosphere="eter"
            size="default"
            onClick={openCreate}
          >
            <Plus className="size-5" aria-hidden />
          </RootsIconButton>
        ) : null,
      }}
      error={error}
    >
      <DataWorkspaceTableListNatureShell>
        <DataWorkspaceTableListFiltersBar>
              <div className={dataWorkspaceListFiltersGridClass}>
                <div className={dataWorkspaceListFiltersPanelClass}>
                  <PromotionTypeToolbarFilter
                    value={activePromotionTypeFilterId}
                    onChange={(id) =>
                      pushWs({
                        promotionType: promotionTypeFilterToQuery(id),
                        page: 1,
                      })
                    }
                  />
                </div>

                <div className={dataWorkspaceListFiltersPanelClass}>
                  <DataWorkspaceListFiltersDialogTrigger
                    id={filtersButtonId}
                    placeholder="Estado"
                    activeCount={modalFiltersActiveCount}
                    expanded={filtersModalOpen}
                    onClick={() => {
                      setDraftSoloActivos(ws.soloActivos)
                      setFiltersModalOpen(true)
                    }}
                  />
                </div>

                <div className={dataWorkspaceListFiltersPanelLastClass}>
                  <DataWorkspaceListSearchField
                    id={searchInputId}
                    inputRef={searchInputRef}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onClear={() => {
                      setSearchInput("")
                      searchInputRef.current?.focus()
                    }}
                    placeholder="Nombre, descripción… ( / )"
                    resultsSummary={resultsSummary}
                  />
                </div>
              </div>
        </DataWorkspaceTableListFiltersBar>

        <DataWorkspaceTableListShell
          lockScroll={loading}
          activeFiltersBar={
            hasFilterChips ? (
              <DataWorkspaceListActiveFiltersBar
                activeCount={activeFilterCount}
                onClearAll={clearAllFilters}
              >
                {ws.q.trim() ? (
                  <DataWorkspaceListFilterChip
                    label={`Buscar: «${ws.q.trim()}»`}
                    onRemove={() => pushWs({ q: "", page: 1 })}
                    removeAriaLabel="Quitar búsqueda"
                  />
                ) : null}
                {ws.soloActivos ? (
                  <DataWorkspaceListFilterChip
                    label="Solo activas"
                    onRemove={() => pushWs({ soloActivos: false, page: 1 })}
                    removeAriaLabel="Quitar filtro solo activas"
                  />
                ) : null}
                {ws.promotionType ? (
                  <DataWorkspaceListFilterChip
                    label={`Tipo: ${PROMOTION_TYPE_LABEL[ws.promotionType]}`}
                    onRemove={() => pushWs({ promotionType: "", page: 1 })}
                    removeAriaLabel="Quitar filtro de tipo"
                  />
                ) : null}
              </DataWorkspaceListActiveFiltersBar>
            ) : null
          }
          overlay={
            !loading && totalCount === 0 ? (
              <DataWorkspaceTableEmptyMascot />
            ) : null
          }
          footerFloating
          footerFloatingCentered
          scrollResetKey={ws.page}
          footer={
            <DataWorkspaceTableListPageDock
              listFetching={loading}
              loadedCount={promotions.length}
              totalCount={totalCount}
              page={ws.page}
              onPageJump={(nextPage) => pushWs({ page: nextPage })}
            />
          }
            infinite={tableListInfiniteFromQuery(promotionsQuery, "promotions")}
        >
          <DataWorkspaceListTableFrame>
            <table
              className={cn(workspaceTableLayoutClassName, "min-w-[80rem]")}
              aria-busy={loading}
            >
              <WorkspaceTableHeader>
                <WorkspaceTableHeaderRow>
                  <WorkspaceTableSelectHead
                    tone="nature"
                    className={workspaceTableLayoutHeaderHeadClass}
                    checked={
                      allVisibleSelected
                        ? true
                        : someVisibleSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) => {
                      setSelected((prev) => {
                        const next = new Set(prev)
                        if (checked === true) {
                          visibleIds.forEach((id) => next.add(id))
                        } else {
                          visibleIds.forEach((id) => next.delete(id))
                        }
                        return next
                      })
                    }}
                    disabled={
                      loading || totalCount === 0 || promotions.length === 0
                    }
                    ariaLabel="Seleccionar filas visibles"
                  />
                  <WorkspaceTableHead
                    tone="nature"
                    className={cn(
                      workspaceTableLayoutImageColumnClass,
                      promotionTableImageColumnClass,
                      "px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                    srOnly
                  >
                    Imagen
                  </WorkspaceTableHead>
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Promoción"
                    direction={sortDirection("name")}
                    onSort={() => handleSortColumn("name")}
                    className={cn(
                      promotionTableNameColumnClass,
                      "px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  />
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Tipo"
                    direction={sortDirection("promotion_type")}
                    onSort={() => handleSortColumn("promotion_type")}
                    className={cn(
                      promotionTableTypeColumnClass,
                      "px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  />
                  <WorkspaceTableHead
                    tone="nature"
                    className={cn(
                      promotionTablePricingColumnClass,
                      "px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  >
                    Precio / regla
                  </WorkspaceTableHead>
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Vigencia"
                    direction={sortDirection("valid_from")}
                    onSort={() => handleSortColumn("valid_from")}
                    className={cn(
                      promotionTableScheduleColumnClass,
                      "px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  />
                  <WorkspaceTableHead
                    tone="nature"
                    className={cn(
                      promotionTableItemsColumnClass,
                      "px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  >
                    Ítems
                  </WorkspaceTableHead>
                  <WorkspaceTableHead
                    tone="nature"
                    className={cn(
                      promotionTableStatusColumnClass,
                      "px-3",
                      workspaceTableLayoutHeaderHeadClass,
                    )}
                  >
                    Estado
                  </WorkspaceTableHead>
                  {canUpdate || canDelete ? (
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        promotionTableActionsColumnClass,
                        "px-3 text-right",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                      srOnly
                    >
                      Acciones
                    </WorkspaceTableHead>
                  ) : null}
                </WorkspaceTableHeaderRow>
              </WorkspaceTableHeader>
              <TableBody>
                {loading ? (
                  <WorkspaceTableSkeletonRows
                    rowCount={skeletonRowCount}
                    rowKeyPrefix="promotions-sk"
                    columns={promotionsSkeletonColumns({
                      hasActionsColumn: Boolean(canUpdate || canDelete),
                    })}
                    tone="nature"
                  />
                ) : totalCount === 0 ? null : (
                  promotions.map((row, index) => (
                    <WorkspaceTableBodyRow
                        key={row.id}
                        index={index}
                        selected={selected.has(row.id)}
                        inactive={!row.isActive}
                      >
                      <PromotionTableSelectCell
                        checked={selected.has(row.id)}
                        onCheckedChange={(checked) => {
                          setSelected((prev) => {
                            const next = new Set(prev)
                            if (checked) next.add(row.id)
                            else next.delete(row.id)
                            return next
                          })
                        }}
                        label={`Seleccionar ${row.name || "promoción"}`}
                      />
                      <PromotionTableImageCell row={row} />
                      <PromotionTableNameCell row={row} />
                      <PromotionTableTypeCell row={row} />
                      <PromotionTablePricingCell row={row} />
                      <PromotionTableScheduleCell row={row} />
                      <PromotionTableItemsCell row={row} />
                      <PromotionTableStatusCell row={row} />
                      {canUpdate || canDelete ? (
                        <TableCell className={workspaceTableLayoutActionsBodyCellClass}>
                          <div className="flex items-center justify-end gap-0.5">
                            {canUpdate ? (
                              <RootsIconButton
                                type="button"
                                label={`Editar ${row.name}`}
                                tone="action"
                                intent="edit"
                                size="compact"
                                onClick={() => void openEdit(row)}
                              >
                                <Pencil />
                              </RootsIconButton>
                            ) : null}
                            {canDelete ? (
                              <RootsIconButton
                                type="button"
                                label={`Eliminar ${row.name}`}
                                tone="action"
                                intent="destructive"
                                size="compact"
                                onClick={() => openDelete(row)}
                              >
                                <Trash2 />
                              </RootsIconButton>
                            ) : null}
                          </div>
                        </TableCell>
                      ) : null}
                    </WorkspaceTableBodyRow>
                  ))
                )}
              </TableBody>
            </table>
          </DataWorkspaceListTableFrame>
        </DataWorkspaceTableListShell>
      </DataWorkspaceTableListNatureShell>

      <Dialog
        open={filtersModalOpen}
        onOpenChange={(open) => {
          if (open) setDraftSoloActivos(ws.soloActivos)
          setFiltersModalOpen(open)
        }}
      >
        <DialogContent
          className={promotionDialogSurfaceClass}
          showCloseButton
          data-rootsy-light-shell="true"
        >
          <DialogHeader className={promotionDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Filtros
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Combinan con la búsqueda y el tipo. El listado se pagina en el
              servidor.
            </DialogDescription>
          </DialogHeader>
          <div className={promotionDialogBodyClass}>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-1 py-0.5 hover:bg-muted/50">
              <Checkbox
                id="filter-solo-activos"
                checked={draftSoloActivos}
                onCheckedChange={(v) => setDraftSoloActivos(Boolean(v))}
                aria-label="Solo promociones activas"
              />
              <span className="text-sm text-foreground">Solo promociones activas</span>
            </label>
          </div>
          <DialogFooter className={promotionDialogFooterClass}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDraftSoloActivos(false)}
            >
              Restablecer
            </Button>
            <Button
              type="button"
              onClick={() => {
                pushWs({ soloActivos: draftSoloActivos, page: 1 })
                setFiltersModalOpen(false)
              }}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PromotionUpsertDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open && !formSaving) closeForm()
        }}
        mode={editingId ? "edit" : "create"}
        idPrefix={editingId ? "promo-edit" : "promo-create"}
        title={editingId ? "Editar promoción" : "Nueva promoción"}
        description="Combos con ítems configurables u ofertas por cantidad (2x1, etc.)."
        refreshing={formRefreshing}
        saving={formSaving}
        banner={formError}
        onSubmit={(e) => void submitForm(e)}
        onCancel={closeForm}
        onAfterClose={finalizeFormClose}
        form={form}
        setForm={setForm}
        catalogOptions={catalogOptions}
        catalogLoading={catalogLoading}
        disabled={formSaving}
      />

      {deleteTarget ? (
        <PromotionDeleteDialog
          open={deleteOpen}
          promotionName={deleteTarget.name}
          confirmValue={deleteTyped}
          banner={deleteBanner}
          busy={deleteBusy}
          onOpenChange={(open) => {
            if (!open && !deleteBusy) requestCloseDelete()
          }}
          onClose={requestCloseDelete}
          onAfterClose={finalizeDeleteClose}
          onConfirmValueChange={setDeleteTyped}
          onConfirmDelete={() => void submitDelete()}
        />
      ) : null}
    </DataWorkspaceTableListPage>
  )
}

