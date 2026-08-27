"use client"

import { ArticleCatalogImagePlaceholder } from "@/app/[siteId]/[popId]/articles/ArticleCatalogImagePlaceholder"
import type { ServiceTableRow } from "@/app/[siteId]/[popId]/services/actions"
import { ServiceCategoriesDialog } from "@/app/[siteId]/[popId]/services/ServiceCategoriesDialog"
import { ServiceCategoryDeleteDialog } from "@/app/[siteId]/[popId]/services/ServiceCategoryDeleteDialog"
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
  type ServiceTableSortKey,
} from "@/app/[siteId]/[popId]/services/workspaceUrl"
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
  tableListInfiniteFromQuery,
  DataWorkspaceTableListShell,
  dataWorkspaceTableListHeaderVariant,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  DataWorkspaceTableIconAction,
  DataWorkspaceTableThumbnail,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT,
  WorkspaceTableSkeletonRows,
} from "@/components/data-workspace/WorkspaceTableSkeleton"
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
  workspaceTableLayoutImageColumnClass,
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
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { usePopServiceCategories } from "@/hooks/usePopServiceCategories"
import { usePopServicesTable } from "@/hooks/usePopServicesTable"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { emptyServiceDetailsGrid } from "@/lib/serviceCatalogTypes"
import { invalidateDataWorkspaceTableInfinite } from "@/lib/dataWorkspaceTableInfinite"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import {
  popServiceCategoriesQueryKey,
  popServiceQueryKey,
  popServicesQueryRoot,
} from "@/lib/queryKeys"
import {
  createPopServiceCategory,
  deletePopServiceCategory,
  updatePopServiceCategory,
} from "@/lib/rootsyApi/serviceCategoriesClient"
import {
  createPopService,
  deletePopService,
  fetchPopService,
  updatePopService,
} from "@/lib/rootsyApi/servicesClient"
import { useQueryClient } from "@tanstack/react-query"
import { formatSaleComprobanteMoney } from "@/lib/saleComprobantePreview"
import { cn } from "@/lib/utils"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
} from "@/lib/workspaceTableSort"
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react"
import { useParams, usePathname, useRouter, useSearchParams } from "@/lib/pop-spa/navigation"
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
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const queryClient = useQueryClient()
  const routerRef = useRef(router)
  routerRef.current = router

  const { bootstrap, loading: bootstrapLoading, hasPermission } =
    usePopWorkspace()
  const afterHydration = useAfterHydration()
  const menuCache = usePopMenuCache(popId)
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
    () => parseServicesWorkspaceUrl(workspaceParams),
    [workspaceParams],
  )

  const [actionError, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(() => new Set())

  const [searchInput, setSearchInput] = useState(ws.q)
  const searchInputId = useId()
  const filtersButtonId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<ServicesAppliedFilters>(
    defaultServicesFilters(),
  )

  const [formOpen, setFormOpen] = useState(false)
  const [formRefreshing, setFormRefreshing] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultServiceFormState())
  const editRequestIdRef = useRef(0)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ServiceTableRow | null>(null)
  const [deleteTyped, setDeleteTyped] = useState("")
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [categoryBusy, setCategoryBusy] = useState(false)
  const [pendingCategoryCreate, setPendingCategoryCreate] = useState<{
    name: string
  } | null>(null)
  const [pendingCategoryDeleteId, setPendingCategoryDeleteId] = useState<
    string | null
  >(null)
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [deleteCategoryBusy, setDeleteCategoryBusy] = useState(false)
  const [deleteCategoryBanner, setDeleteCategoryBanner] = useState<string | null>(
    null,
  )
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState("")

  const pushWs = useCallback(
    (patch: Parameters<typeof mergeServicesWorkspaceUrl>[1]) => {
      const qs = mergeServicesWorkspaceUrl(workspaceParams, patch)
      const next = qs.toString() ? `${pathname}?${qs.toString()}` : pathname
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
    popId || undefined,
    {
      q: ws.q,
      page: ws.page,
      pageSize: ws.pageSize,
      soloActivos: ws.soloActivos,
      categoryId: ws.categoryId,
      sort: ws.sort,
      ord: ws.ord,
    },
    { enabled: Boolean(popId && siteId) },
  )
  const categoriesNeeded = formOpen || categoriesOpen || filtersModalOpen
  const categoriesQuery = usePopServiceCategories(popId || undefined, {
    enabled: categoriesNeeded,
  })
  const categories = categoriesQuery.data ?? []

  const services = servicesQuery.data?.services ?? []
  const totalCount = servicesQuery.data?.totalCount ?? 0
  const servicePerm = useCallback(
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
  const canCreate = servicePerm(POP_PERMS.SERVICE_CREATE)
  const canUpdate = servicePerm(POP_PERMS.SERVICE_UPDATE)
  const canDelete = servicePerm(POP_PERMS.SERVICE_DELETE)
  const loading =
    !popId || !siteId
      ? false
      : servicesQuery.isPending ||
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
    await invalidateDataWorkspaceTableInfinite(
      queryClient,
      popServicesQueryRoot(popId),
    )
  }, [popId, queryClient])

  const refreshCategories = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popServiceCategoriesQueryKey(popId),
    })
  }, [popId, queryClient])

  useEffect(() => {
    const res = servicesQuery.data
    if (!res || res.success || !("redirect" in res) || !res.redirect) return
    const redirect = res.redirect
    const timeout = window.setTimeout(() => {
      routerRef.current.push(redirect)
    }, 1200)
    return () => window.clearTimeout(timeout)
  }, [servicesQuery.data])

  useEffect(() => {
    setSelected(new Set())
  }, [ws.q, ws.page, ws.pageSize, ws.soloActivos, ws.categoryId, ws.sort, ws.ord])

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

  const skeletonRowCount = DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT
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
    if (!canCreate) return
    setEditingId(null)
    setForm(defaultServiceFormState())
    setFormError(null)
    setFormRefreshing(false)
    setFormOpen(true)
  }

  const openEdit = (row: ServiceTableRow) => {
    if (!popId) return
    const requestId = ++editRequestIdRef.current
    setFormError(null)
    setEditingId(row.id)
    setForm(
      serviceFormFromDetail({
        categoryId: row.categoryId,
        name: row.name,
        description: row.description,
        imageUrl: row.imageUrl,
        defaultPrice: row.defaultPrice,
        billingPeriod: row.billingPeriod,
        billingPeriodLabel: row.billingPeriodLabel,
        detailsGrid: emptyServiceDetailsGrid(),
        contractText: "",
        paymentTiming: "end_of_period",
        dueDaysAfter: 0,
        lateInterestType: "none",
        lateInterestValue: null,
        discountMode: "none",
        discountValue: null,
        isActive: row.isActive,
        articles: [],
        addons: [],
      }),
    )
    setFormRefreshing(true)
    setFormOpen(true)
    void queryClient
      .fetchQuery({
        queryKey: popServiceQueryKey(popId, row.id),
        queryFn: () => fetchPopService(popId, row.id),
        staleTime: 0,
      })
      .then((detail) => {
        if (editRequestIdRef.current !== requestId) return
        setForm(
          serviceFormFromDetail({
            categoryId: detail.categoryId,
            name: detail.name,
            description: detail.description,
            imageUrl: detail.imageUrl,
            defaultPrice: detail.defaultPrice,
            billingPeriod: detail.billingPeriod,
            billingPeriodLabel: detail.billingPeriodLabel,
            detailsGrid: detail.detailsGrid,
            contractText: detail.contractText,
            paymentTiming: detail.paymentTiming,
            dueDaysAfter: detail.dueDaysAfter,
            lateInterestType: detail.lateInterestType,
            lateInterestValue: detail.lateInterestValue,
            discountMode: detail.discountMode,
            discountValue: detail.discountValue,
            isActive: detail.isActive,
            articles: detail.articles.map((line) => ({
              articleId: line.articleId,
              quantity: line.quantity,
              articleName: line.articleName,
              unitOfMeasure: line.unitOfMeasure,
            })),
            addons: detail.addons.map((addon) => ({
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
      })
      .catch((err: unknown) => {
        if (editRequestIdRef.current !== requestId) return
        setFormError(
          err instanceof Error ? err.message : "No se pudo cargar el servicio",
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
    setForm(defaultServiceFormState())
  }

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || formSaving || formRefreshing) return
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
    const name = newCategoryName.trim()
    if (!popId || !name || categoryBusy) return
    setCategoryBusy(true)
    setPendingCategoryCreate({ name })
    setNewCategoryName("")
    const res = await createPopServiceCategory(popId, name)
    if (!res.success) {
      setPendingCategoryCreate(null)
      setCategoryBusy(false)
      setNewCategoryName(name)
      setError(res.error)
      return
    }
    await refreshCategories()
    setCategoryBusy(false)
    setPendingCategoryCreate(null)
  }

  const handleSaveCategoryEdit = async () => {
    if (!popId || !editingCategoryId || categoryBusy) return
    setCategoryBusy(true)
    const res = await updatePopServiceCategory(
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
    await refreshCategories()
  }

  const closeDeleteCategory = () => {
    setDeleteCategoryTarget(null)
    setDeleteCategoryBanner(null)
  }

  const requestDeleteCategory = (id: string, name: string) => {
    setDeleteCategoryBanner(null)
    setDeleteCategoryTarget({ id, name })
  }

  const handleDeleteCategory = async () => {
    if (!popId || !deleteCategoryTarget) return
    const target = deleteCategoryTarget
    setDeleteCategoryBusy(true)
    setDeleteCategoryBanner(null)
    setPendingCategoryDeleteId(target.id)
    if (editingCategoryId === target.id) {
      setEditingCategoryId(null)
      setEditingCategoryName("")
    }
    setDeleteCategoryTarget(null)
    setDeleteCategoryBusy(false)
    const res = await deletePopServiceCategory(popId, target.id)
    if (!res.success) {
      setPendingCategoryDeleteId(null)
      setError(res.error)
      return
    }
    await refreshCategories()
    setPendingCategoryDeleteId(null)
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
        headerActions: canCreate ? (
          <DataWorkspaceHeaderIconButton
            label="Nuevo servicio"
            headerVariant={dataWorkspaceTableListHeaderVariant}
            primary
            onClick={openCreate}
          >
            <Plus className="size-5" aria-hidden />
          </DataWorkspaceHeaderIconButton>
        ) : null,
        headerMoreActions:
          canUpdate || canCreate
            ? [
                {
                  label: "Gestionar categorías",
                  icon: FolderTree,
                  onClick: () => setCategoriesOpen(true),
                },
              ]
            : undefined,
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
            infinite={tableListInfiniteFromQuery(servicesQuery, "services")}
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
                  <WorkspaceTableHead
                    tone="nature"
                    className={workspaceTableLayoutImageColumnClass}
                    srOnly
                  >
                    Foto
                  </WorkspaceTableHead>
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
                      <TableCell
                        className={cn(
                          workspaceTableLayoutImageColumnClass,
                          workspaceTableLayoutBodyCellClass,
                        )}
                      >
                        {row.imageUrl?.trim() ? (
                          <DataWorkspaceTableThumbnail
                            src={row.imageUrl}
                            alt={row.name || "Servicio"}
                            size="sm"
                          />
                        ) : (
                          <ArticleCatalogImagePlaceholder size="sm" />
                        )}
                      </TableCell>
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
        refreshing={formRefreshing}
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
        onOpenChange={(open) => {
          setCategoriesOpen(open)
          if (!open) {
            setNewCategoryName("")
            setPendingCategoryCreate(null)
            setPendingCategoryDeleteId(null)
            setCategoryBusy(false)
            closeDeleteCategory()
          }
        }}
        categories={categories}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        newCategoryName={newCategoryName}
        onNewCategoryNameChange={setNewCategoryName}
        onCreateCategory={() => void handleCreateCategory()}
        categoryBusy={categoryBusy}
        pendingCreateName={
          pendingCategoryCreate &&
          !categories.some(
            (category) => category.name === pendingCategoryCreate.name,
          )
            ? pendingCategoryCreate.name
            : null
        }
        pendingDeleteId={pendingCategoryDeleteId}
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
        onDeleteCategory={requestDeleteCategory}
      />

      <ServiceCategoryDeleteDialog
        open={deleteCategoryTarget !== null}
        target={deleteCategoryTarget}
        banner={deleteCategoryBanner}
        busy={deleteCategoryBusy}
        onOpenChange={(open) => {
          if (!open && !deleteCategoryBusy) closeDeleteCategory()
        }}
        onClose={closeDeleteCategory}
        onConfirmDelete={() => void handleDeleteCategory()}
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

