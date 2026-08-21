"use client"

import {
  createPopService,
  createServiceCategory,
  deletePopService,
  deleteServiceCategory,
  getPopServiceCategories,
  getPopServiceDetail,
  updatePopService,
  updateServiceCategory,
  type ServiceCategoryOption,
  type ServiceTableRow,
} from "@/app/[siteId]/[popId]/services/actions"
import { ServiceCategoriesDialog } from "@/app/[siteId]/[popId]/services/ServiceCategoriesDialog"
import { ServiceDeleteDialog } from "@/app/[siteId]/[popId]/services/ServiceDeleteDialog"
import {
  defaultServiceFormState,
  ServiceUpsertDialog,
  serviceFormFromDetail,
  serviceFormToPayload,
} from "@/app/[siteId]/[popId]/services/ServiceUpsertDialog"
import {
  defaultServicesFilters,
  ServicesFiltersDialog,
  type ServicesAppliedFilters,
} from "@/app/[siteId]/[popId]/services/ServicesFiltersDialog"
import {
  mergeServicesWorkspaceUrl,
  parseServicesWorkspaceUrl,
  SERVICE_TABLE_PAGE_SIZES,
  type ServiceTableSortKey,
} from "@/app/[siteId]/[popId]/services/workspaceUrl"
import { buildPaginationItems } from "@/components/data-workspace/buildPaginationItems"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListBulkToolbar } from "@/components/data-workspace/DataWorkspaceListBulkToolbar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import {
  DataWorkspaceListFiltersDialogTrigger,
  DataWorkspaceListSearchField,
} from "@/components/data-workspace/DataWorkspaceListFilterFields"
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
  DataWorkspaceTableIconAction,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { servicesSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import {
  workspaceTableLayoutClassName,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutActionsBodyCellClass,
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutHeaderHeadClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectCell,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { WorkspaceTableSortHead } from "@/components/data-workspace/WorkspaceTableSortHead"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { RootsNaturePill } from "@/components/rootsy-pill"
import { TableBody, TableCell } from "@/components/ui/table"
import { usePopServicesTable } from "@/hooks/usePopServicesTable"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { popServicesQueryRoot } from "@/lib/queryKeys"
import { useQueryClient } from "@tanstack/react-query"
import { formatSaleComprobanteMoney } from "@/lib/saleComprobantePreview"
import { cn } from "@/lib/utils"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
} from "@/lib/workspaceTableSort"
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"

export function ServicesWorkspaceView() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const queryClient = useQueryClient()
  const routerRef = useRef(router)
  routerRef.current = router

  const { bootstrap, loading: bootstrapLoading } = usePopWorkspace()
  const ws = useMemo(
    () => parseServicesWorkspaceUrl(searchParams),
    [searchParams],
  )

  const [actionError, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(() => new Set())

  const [categories, setCategories] = useState<ServiceCategoryOption[]>([])
  const [searchInput, setSearchInput] = useState(ws.q)
  const searchInputId = useId()
  const filtersButtonId = useId()
  const pageSizeLabelId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<ServicesAppliedFilters>(
    defaultServicesFilters(),
  )

  const [formOpen, setFormOpen] = useState(false)
  const [formDetailLoading, setFormDetailLoading] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultServiceFormState())

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ServiceTableRow | null>(null)
  const [deleteTyped, setDeleteTyped] = useState("")
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [categoryBusy, setCategoryBusy] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState("")

  const pushWs = useCallback(
    (patch: Parameters<typeof mergeServicesWorkspaceUrl>[1]) => {
      const next = mergeServicesWorkspaceUrl(searchParams, patch)
      router.replace(`${pathname}?${next.toString()}`)
    },
    [pathname, router, searchParams],
  )

  const handleSortColumn = useCallback(
    (column: ServiceTableSortKey) => {
      const next = nextWorkspaceTableSortState(
        { sort: ws.sort, ord: ws.ord },
        column,
      )
      pushWs({
        sort: next.sort as ServiceTableSortKey | null,
        ord: next.ord,
      })
    },
    [pushWs, ws.ord, ws.sort],
  )

  const sortDirection = useCallback(
    (column: ServiceTableSortKey) =>
      workspaceTableSortDisplayDirection(
        { sort: ws.sort, ord: ws.ord },
        column,
      ),
    [ws.ord, ws.sort],
  )

  const servicesQuery = usePopServicesTable(
    popId,
    {
      q: ws.q,
      page: ws.page,
      pageSize: ws.pageSize,
      soloActivos: ws.soloActivos,
      categoryId: ws.categoryId,
      sort: ws.sort,
      ord: ws.ord,
    },
    { enabled: Boolean(popId) },
  )

  const services = servicesQuery.data?.services ?? []
  const totalCount = servicesQuery.data?.totalCount ?? 0
  const canCreate = servicesQuery.data?.canCreate ?? false
  const canUpdate = servicesQuery.data?.canUpdate ?? false
  const canDelete = servicesQuery.data?.canDelete ?? false
  const loading =
    servicesQuery.isPending ||
    (servicesQuery.isFetching && !servicesQuery.isFetched)
  const tableError =
    servicesQuery.data?.success === false
      ? servicesQuery.data.error
      : servicesQuery.error instanceof Error
        ? servicesQuery.error.message
        : servicesQuery.error
          ? String(servicesQuery.error)
          : null
  const error = actionError ?? tableError

  const refreshServicesList = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popServicesQueryRoot(popId),
    })
  }, [popId, queryClient])

  const loadCategories = useCallback(async () => {
    if (!popId) return
    const res = await getPopServiceCategories(popId)
    if (res.success) setCategories(res.categories)
  }, [popId])

  useEffect(() => {
    const res = servicesQuery.data
    if (!res || res.success || !("redirect" in res) || !res.redirect) return
    routerRef.current.replace(res.redirect)
  }, [servicesQuery.data])

  useEffect(() => {
    setSelected(new Set())
  }, [ws.q, ws.page, ws.pageSize, ws.soloActivos, ws.categoryId, ws.sort, ws.ord])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

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

  const totalPages = Math.max(1, Math.ceil(totalCount / ws.pageSize))
  const rangeStart =
    totalCount === 0 ? 0 : (ws.page - 1) * ws.pageSize + 1
  const rangeEnd = Math.min(ws.page * ws.pageSize, totalCount)
  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages, ws.page),
    [totalPages, ws.page],
  )

  const modalFiltersActiveCount = useMemo(() => {
    let count = 0
    if (ws.soloActivos) count++
    if (ws.categoryId.trim()) count++
    return count
  }, [ws.soloActivos, ws.categoryId])

  const hasFilterChips =
    ws.q.trim() !== "" || ws.soloActivos || ws.categoryId.trim() !== ""

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (ws.q.trim()) count++
    count += modalFiltersActiveCount
    return count
  }, [ws.q, modalFiltersActiveCount])

  const categoryLabelForChip = useMemo(() => {
    const id = ws.categoryId.trim()
    if (!id) return ""
    return categories.find((c) => c.id === id)?.name ?? ""
  }, [categories, ws.categoryId])

  const resultsSummary = useMemo(() => {
    if (loading && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "servicio" : "servicios"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [loading, totalCount])

  const skeletonRowCount = Math.min(12, Math.max(5, ws.pageSize))
  const visibleIds = useMemo(() => services.map((row) => row.id), [services])
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someVisibleSelected = visibleIds.some((id) => selected.has(id))

  const clearAllFilters = useCallback(() => {
    setSearchInput("")
    pushWs({
      q: "",
      soloActivos: false,
      categoryId: "",
      page: 1,
    })
    searchInputRef.current?.focus()
  }, [pushWs])

  const openCreate = () => {
    setEditingId(null)
    setForm(defaultServiceFormState())
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = async (row: ServiceTableRow) => {
    if (!popId) return
    setFormError(null)
    setFormDetailLoading(true)
    setFormOpen(true)
    setEditingId(row.id)
    const res = await getPopServiceDetail(popId, row.id)
    setFormDetailLoading(false)
    if (!res.success) {
      setFormError(res.error)
      return
    }
    setForm(
      serviceFormFromDetail({
        categoryId: res.service.categoryId,
        name: res.service.name,
        description: res.service.description,
        imageUrl: res.service.imageUrl,
        defaultPrice: res.service.defaultPrice,
        billingPeriod: res.service.billingPeriod,
        billingPeriodLabel: res.service.billingPeriodLabel,
        detailsGrid: res.service.detailsGrid,
        contractText: res.service.contractText,
        paymentTiming: res.service.paymentTiming,
        dueDaysAfter: res.service.dueDaysAfter,
        lateInterestType: res.service.lateInterestType,
        lateInterestValue: res.service.lateInterestValue,
        discountMode: res.service.discountMode,
        discountValue: res.service.discountValue,
        isActive: res.service.isActive,
        articles: res.service.articles.map((line) => ({
          articleId: line.articleId,
          quantity: line.quantity,
          articleName: line.articleName,
          unitOfMeasure: line.unitOfMeasure,
        })),
        addons: res.service.addons.map((addon) => ({
          name: addon.name,
          price: addon.price,
          articles: addon.articles.map((line) => ({
            articleId: line.articleId,
            quantity: line.quantity,
            articleName: line.articleName,
            unitOfMeasure: line.unitOfMeasure,
          })),
        })),
      }),
    )
  }

  const closeForm = () => setFormOpen(false)

  const finalizeFormClose = () => {
    setEditingId(null)
    setFormError(null)
    setFormDetailLoading(false)
    setFormSaving(false)
    setForm(defaultServiceFormState())
  }

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || formSaving || formDetailLoading) return
    setFormSaving(true)
    setFormError(null)
    const payload = serviceFormToPayload(form)
    const res = editingId
      ? await updatePopService(popId, editingId, payload)
      : await createPopService(popId, payload)
    setFormSaving(false)
    if (!res.success) {
      setFormError(res.error)
      return
    }
    setFormOpen(false)
    await refreshServicesList()
  }

  const openDelete = (row: ServiceTableRow) => {
    setDeleteTarget(row)
    setDeleteTyped("")
    setDeleteBanner(null)
    setDeleteOpen(true)
  }

  const requestCloseDelete = () => setDeleteOpen(false)

  const finalizeDeleteClose = () => {
    setDeleteTarget(null)
    setDeleteTyped("")
    setDeleteBanner(null)
  }

  const submitDelete = async () => {
    if (!popId || !deleteTarget || deleteBusy) return
    setDeleteBusy(true)
    setDeleteBanner(null)
    const res = await deletePopService(popId, deleteTarget.id, deleteTyped)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteBanner(res.error)
      return
    }
    requestCloseDelete()
    await refreshServicesList()
  }

  const handleCreateCategory = async () => {
    if (!popId || !newCategoryName.trim() || categoryBusy) return
    setCategoryBusy(true)
    const res = await createServiceCategory(popId, newCategoryName)
    setCategoryBusy(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setNewCategoryName("")
    await loadCategories()
  }

  const handleSaveCategoryEdit = async () => {
    if (!popId || !editingCategoryId || categoryBusy) return
    setCategoryBusy(true)
    const res = await updateServiceCategory(
      popId,
      editingCategoryId,
      editingCategoryName,
    )
    setCategoryBusy(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setEditingCategoryId(null)
    setEditingCategoryName("")
    await loadCategories()
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!popId) return
    if (!window.confirm(`¿Eliminar la categoría «${name}»?`)) return
    setCategoryBusy(true)
    const res = await deleteServiceCategory(popId, id)
    setCategoryBusy(false)
    if (!res.success) setError(res.error)
    else await loadCategories()
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
        title: "Servicios",
        loading: bootstrapLoading,
        userName: bootstrap?.userFullName,
        userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
        userRoleLabel: bootstrap?.roleLabel,
        pillLabel: "Catálogo",
        headerActions: (
          <>
            {canCreate ? (
              <DataWorkspaceHeaderIconButton
                label="Nuevo servicio"
                headerVariant={dataWorkspaceTableListHeaderVariant}
                primary
                onClick={openCreate}
              >
                <Plus className="size-5" aria-hidden />
              </DataWorkspaceHeaderIconButton>
            ) : null}
            {(canUpdate || canCreate) && (
              <DataWorkspaceHeaderIconButton
                label="Gestionar categorías"
                headerVariant={dataWorkspaceTableListHeaderVariant}
                onClick={() => setCategoriesOpen(true)}
              >
                <FolderTree className="size-5" aria-hidden />
              </DataWorkspaceHeaderIconButton>
            )}
          </>
        ),
      }}
      error={error}
    >
      <DataWorkspaceTableListNatureShell>
        <DataWorkspaceTableListFiltersBar>
          <div className={dataWorkspaceListFiltersGridClass}>
            <div className={dataWorkspaceListFiltersPanelClass}>
              <DataWorkspaceListFiltersDialogTrigger
                id={filtersButtonId}
                placeholder="Estado y categoría"
                activeCount={modalFiltersActiveCount}
                expanded={filtersModalOpen}
                onClick={() => {
                  setDraftFilters({
                    soloActivos: ws.soloActivos,
                    categoryId: ws.categoryId,
                  })
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
                    label="Solo activos"
                    onRemove={() => pushWs({ soloActivos: false, page: 1 })}
                    removeAriaLabel="Quitar filtro solo activos"
                  />
                ) : null}
                {ws.categoryId.trim() ? (
                  <DataWorkspaceListFilterChip
                    label={`Categoría: ${categoryLabelForChip || ws.categoryId}`}
                    onRemove={() => pushWs({ categoryId: "", page: 1 })}
                    removeAriaLabel="Quitar filtro categoría"
                  />
                ) : null}
              </DataWorkspaceListActiveFiltersBar>
            ) : null
          }
          bulkToolbar={
            selected.size > 0 ? (
              <DataWorkspaceListBulkToolbar
                selectedCount={selected.size}
                onClear={() => setSelected(new Set())}
              />
            ) : null
          }
          overlay={
            !loading && totalCount === 0 ? (
              <DataWorkspaceTableEmptyMascot />
            ) : null
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
              pageSizeOptions={SERVICE_TABLE_PAGE_SIZES}
              paginationItems={paginationItems}
              onPageChange={(p) => pushWs({ page: p })}
              onPageSizeChange={(ps) =>
                pushWs({ pageSize: ps as typeof ws.pageSize, page: 1 })
              }
              pageSizeLabelId={pageSizeLabelId}
            />
          }
        >
          <DataWorkspaceListTableFrame>
            <table
              className={cn(workspaceTableLayoutClassName, "min-w-[64rem]")}
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
                    disabled={loading || totalCount === 0 || services.length === 0}
                    ariaLabel="Seleccionar filas visibles"
                  />
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Servicio"
                    direction={sortDirection("name")}
                    onSort={() => handleSortColumn("name")}
                    className="min-w-56"
                  />
                  <WorkspaceTableHead tone="nature" className="w-40">
                    Categoría
                  </WorkspaceTableHead>
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Precio"
                    align="right"
                    direction={sortDirection("default_price")}
                    onSort={() => handleSortColumn("default_price")}
                    className="w-32"
                  />
                  <WorkspaceTableSortHead
                    tone="nature"
                    label="Período"
                    direction={sortDirection("billing_period")}
                    onSort={() => handleSortColumn("billing_period")}
                    className="w-36"
                  />
                  <WorkspaceTableHead tone="nature" className="w-28 text-center">
                    Detalles
                  </WorkspaceTableHead>
                  <WorkspaceTableHead tone="nature" className="w-32">
                    Estado
                  </WorkspaceTableHead>
                  {canUpdate || canDelete ? (
                    <WorkspaceTableHead
                      tone="nature"
                      className="w-[7.25rem] text-right"
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
                    rowKeyPrefix="services-sk"
                    columns={servicesSkeletonColumns({
                      hasActionsColumn: Boolean(canUpdate || canDelete),
                    })}
                    tone="nature"
                  />
                ) : totalCount === 0 ? null : (
                  services.map((row, index) => (
                    <WorkspaceTableBodyRow
                      key={row.id}
                      index={index}
                      selected={selected.has(row.id)}
                      inactive={!row.isActive}
                    >
                      <WorkspaceTableSelectCell
                        tone="nature"
                        checked={selected.has(row.id)}
                        onCheckedChange={(checked) => {
                          setSelected((prev) => {
                            const next = new Set(prev)
                            if (checked === true) next.add(row.id)
                            else next.delete(row.id)
                            return next
                          })
                        }}
                        ariaLabel={`Seleccionar ${row.name || "servicio"}`}
                      />
                      <TableCell className={workspaceTableLayoutBodyCellClass}>
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "truncate font-medium",
                              workspaceTableNatureTextPrimaryClass,
                            )}
                          >
                            {row.name || "—"}
                          </p>
                          {row.description ? (
                            <p
                              className={cn(
                                "truncate text-xs",
                                workspaceTableNatureTextSecondaryClass,
                              )}
                            >
                              {row.description}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className={workspaceTableLayoutBodyCellClass}>
                        <span className={workspaceTableNatureTextSecondaryClass}>
                          {row.categoryName}
                        </span>
                      </TableCell>
                      <TableCell
                        className={cn(
                          workspaceTableLayoutBodyCellClass,
                          "text-right tabular-nums",
                        )}
                      >
                        {formatSaleComprobanteMoney(row.defaultPrice)}
                      </TableCell>
                      <TableCell className={workspaceTableLayoutBodyCellClass}>
                        <RootsNaturePill variant="bruma">
                          {row.billingPeriodDisplay}
                        </RootsNaturePill>
                      </TableCell>
                      <TableCell
                        className={cn(
                          workspaceTableLayoutBodyCellClass,
                          "text-center tabular-nums",
                        )}
                      >
                        {row.detailCount}
                      </TableCell>
                      <TableCell className={workspaceTableLayoutBodyCellClass}>
                        <RootsNaturePill
                          variant={row.isActive ? "savia" : "brumaMuted"}
                        >
                          {row.isActive ? "Activo" : "Inactivo"}
                        </RootsNaturePill>
                      </TableCell>
                      {canUpdate || canDelete ? (
                        <TableCell className={workspaceTableLayoutActionsBodyCellClass}>
                          <div className="flex items-center justify-end gap-0.5">
                            {canUpdate ? (
                              <DataWorkspaceTableIconAction
                                label={`Editar ${row.name}`}
                                icon={Pencil}
                                onClick={() => void openEdit(row)}
                              />
                            ) : null}
                            {canDelete ? (
                              <DataWorkspaceTableIconAction
                                label={`Eliminar ${row.name}`}
                                icon={Trash2}
                                variant="destructive"
                                onClick={() => openDelete(row)}
                              />
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

      <ServiceUpsertDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm()
          else setFormOpen(true)
        }}
        mode={editingId ? "edit" : "create"}
        title={editingId ? "Editar servicio" : "Nuevo servicio"}
        loading={formDetailLoading}
        saving={formSaving}
        banner={formError}
        onBannerChange={setFormError}
        form={form}
        setForm={setForm}
        categories={categories}
        popId={popId ?? ""}
        onSubmit={submitForm}
        onCancel={closeForm}
        onAfterClose={finalizeFormClose}
      />

      <ServiceDeleteDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) requestCloseDelete()
          else setDeleteOpen(true)
        }}
        serviceName={deleteTarget?.name ?? ""}
        confirmValue={deleteTyped}
        banner={deleteBanner}
        busy={deleteBusy}
        onClose={requestCloseDelete}
        onConfirmValueChange={setDeleteTyped}
        onConfirmDelete={() => void submitDelete()}
        onAfterClose={finalizeDeleteClose}
      />

      <ServiceCategoriesDialog
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
        categories={categories}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        newCategoryName={newCategoryName}
        onNewCategoryNameChange={setNewCategoryName}
        onCreateCategory={() => void handleCreateCategory()}
        categoryBusy={categoryBusy}
        editingCategoryId={editingCategoryId}
        editingCategoryName={editingCategoryName}
        onEditingCategoryNameChange={setEditingCategoryName}
        onStartEdit={(category) => {
          setEditingCategoryId(category.id)
          setEditingCategoryName(category.name)
        }}
        onCancelEdit={() => {
          setEditingCategoryId(null)
          setEditingCategoryName("")
        }}
        onSaveEdit={() => void handleSaveCategoryEdit()}
        onDeleteCategory={(id, name) => void handleDeleteCategory(id, name)}
      />

      <ServicesFiltersDialog
        open={filtersModalOpen}
        onOpenChange={setFiltersModalOpen}
        draft={draftFilters}
        onDraftChange={setDraftFilters}
        categories={categories}
        onApply={() => {
          pushWs({
            soloActivos: draftFilters.soloActivos,
            categoryId: draftFilters.categoryId,
            page: 1,
          })
          setFiltersModalOpen(false)
        }}
      />
    </DataWorkspaceTableListPage>
  )
}

