"use client"

import type { RecipeTableRow } from "@/app/[siteId]/[popId]/recipes/actions"
import { RootsIconButton } from "@/components/rootsy-button"
import { ingredientLinesFromDetail } from "@/app/[siteId]/[popId]/recipes/components/RecipeIngredientEditor"
import { RecipeCategoryDeleteDialog } from "@/app/[siteId]/[popId]/recipes/RecipeCategoryDeleteDialog"
import { RecipeCategoriesDialog } from "@/app/[siteId]/[popId]/recipes/RecipeCategoriesDialog"
import { RecipeStationDeleteDialog } from "@/app/[siteId]/[popId]/recipes/RecipeStationDeleteDialog"
import { RecipeStationsDialog } from "@/app/[siteId]/[popId]/recipes/RecipeStationsDialog"
import { RecipeDeleteDialog } from "@/app/[siteId]/[popId]/recipes/RecipeDeleteDialog"
import { RecipesFiltersDialog } from "@/app/[siteId]/[popId]/recipes/RecipesFiltersDialog"
import { RecipeUpsertDialog } from "@/app/[siteId]/[popId]/recipes/RecipeUpsertDialog"
import {
  defaultRecipeFormState,
  defaultRecipesFilters,
  recipeFormFromDetail,
  recipeFormToPayload,
  type RecipeFormState,
  type RecipesAppliedFilters,
} from "@/app/[siteId]/[popId]/recipes/recipeFormState"
import {
  RecipeTableCategoryCell,
  RecipeTableCostPriceCell,
  RecipeTableImageCell,
  RecipeTableIngredientsCell,
  RecipeTableNameCell,
  RecipeTableSalePriceCell,
  RecipeTableSelectCell,
  RecipeTableStatusCell,
} from "@/app/[siteId]/[popId]/recipes/recipesTableCells"
import {
  recipeTableActionsColumnClass,
  recipeTableCategoryColumnClass,
  recipeTableCostColumnClass,
  recipeTableHeaderClass,
  recipeTableImageColumnClass,
  recipeTableIngredientsColumnClass,
  recipeTableNameColumnClass,
  recipeTableSaleColumnClass,
  recipeTableStatusColumnClass,
} from "@/app/[siteId]/[popId]/recipes/recipesTableLayout"
import {
  mergeRecipesWorkspaceUrl,
  parseRecipesWorkspaceUrl,
  type RecipeTableSortKey,
} from "@/app/[siteId]/[popId]/recipes/workspaceUrl"
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
import { recipesSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import { TableBody, TableCell } from "@/components/ui/table"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePopComandaStations } from "@/hooks/usePopComandaStations"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { usePopPriceLists } from "@/hooks/usePopPriceLists"
import { usePopRecipeCategories } from "@/hooks/usePopRecipeCategories"
import { usePopRecipesTable } from "@/hooks/usePopRecipesTable"
import { invalidateDataWorkspaceTableInfinite } from "@/lib/dataWorkspaceTableInfinite"
import { invalidatePopOperateCatalogs } from "@/lib/invalidatePopOperateCatalogs"
import { formatMoneyInputForField } from "@/lib/moneyInput"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import {
  extraPriceLists,
  parseListPriceFormValues,
} from "@/lib/salePriceLists"
import {
  popComandaStationsQueryKey,
  popRecipeCategoriesQueryKey,
  popRecipeQueryKey,
  popRecipesQueryRoot,
} from "@/lib/queryKeys"
import {
  createPopComandaStation,
  deletePopComandaStation,
  fetchPopComandaStationCategoryCount,
  updatePopComandaStation,
} from "@/lib/rootsyApi/comandaStationsClient"
import {
  createPopRecipeCategory,
  deletePopRecipeCategory,
  fetchPopRecipeCategoryCount,
  syncPopRecipeCategoryLayout,
  updatePopRecipeCategory,
} from "@/lib/rootsyApi/recipeCategoriesClient"
import {
  createPopRecipe,
  deletePopRecipe,
  fetchPopRecipe,
  updatePopRecipe,
} from "@/lib/rootsyApi/recipesClient"
import { useQueryClient } from "@tanstack/react-query"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { cn } from "@/lib/utils"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
} from "@/lib/workspaceTableSort"
import { ChefHat, FolderTree, Pencil, Plus, Trash2 } from "lucide-react"
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

export function RecipesWorkspaceView() {
  const params = useParams()
  const popId = String(params.popId ?? "")
  const queryClient = useQueryClient()
  const siteId = String(params.siteId ?? "")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
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
    () => parseRecipesWorkspaceUrl(workspaceParams),
    [workspaceParams],
  )

  const searchInputId = useId()
  const filtersButtonId = useId()

  const { bootstrap, loading: bootstrapLoading, hasPermission } =
    usePopWorkspace()
  const afterHydration = useAfterHydration()
  const menuCache = usePopMenuCache(popId)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [actionError, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(ws.q)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<RecipesAppliedFilters>(
    defaultRecipesFilters,
  )

  const [formOpen, setFormOpen] = useState(false)
  const [formRefreshing, setFormRefreshing] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<RecipeFormState>(defaultRecipeFormState())
  const editRequestIdRef = useRef(0)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<RecipeTableRow | null>(null)
  const [deleteTyped, setDeleteTyped] = useState("")
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [categoriesBanner, setCategoriesBanner] = useState<string | null>(null)
  const [categoriesBoardKey, setCategoriesBoardKey] = useState(0)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryStationId, setNewCategoryStationId] = useState<string | null>(
    null,
  )
  const [newCategorySaving, setNewCategorySaving] = useState(false)
  const [pendingCategoryCreate, setPendingCategoryCreate] = useState<{
    name: string
    stationName: string
  } | null>(null)
  const [pendingCategoryDeleteId, setPendingCategoryDeleteId] = useState<
    string | null
  >(null)
  const [categoryBusy, setCategoryBusy] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState("")
  const [editingCategoryStationId, setEditingCategoryStationId] = useState<
    string | null
  >(null)
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<{
    id: string
    name: string
    recipeCount: number | null
  } | null>(null)
  const [deleteCategoryBusy, setDeleteCategoryBusy] = useState(false)
  const [deleteCategoryBanner, setDeleteCategoryBanner] = useState<string | null>(
    null,
  )

  const [stationsOpen, setStationsOpen] = useState(false)
  const [stationsBanner, setStationsBanner] = useState<string | null>(null)
  const [newStationName, setNewStationName] = useState("")
  const [newStationSaving, setNewStationSaving] = useState(false)
  const [pendingStationCreate, setPendingStationCreate] = useState<{
    name: string
  } | null>(null)
  const [pendingStationDeleteId, setPendingStationDeleteId] = useState<
    string | null
  >(null)
  const [stationBusy, setStationBusy] = useState(false)
  const [editingStationId, setEditingStationId] = useState<string | null>(null)
  const [editingStationName, setEditingStationName] = useState("")
  const [deleteStationTarget, setDeleteStationTarget] = useState<{
    id: string
    name: string
    categoryCount: number | null
  } | null>(null)
  const [deleteStationBusy, setDeleteStationBusy] = useState(false)
  const [deleteStationBanner, setDeleteStationBanner] = useState<string | null>(
    null,
  )

  const pushWs = useCallback(
    (patch: Parameters<typeof mergeRecipesWorkspaceUrl>[1]) => {
      const qs = mergeRecipesWorkspaceUrl(workspaceParams, patch)
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
    (column: RecipeTableSortKey) => {
      const next = nextWorkspaceTableSortState(
        { sort: ws.sort, ord: ws.ord },
        column,
      )
      pushWs({
        sort: next.sort as RecipeTableSortKey | null,
        ord: next.ord,
      })
    },
    [pushWs, ws.ord, ws.sort],
  )

  const sortDirection = useCallback(
    (column: RecipeTableSortKey) =>
      workspaceTableSortDisplayDirection(
        { sort: ws.sort, ord: ws.ord },
        column,
      ),
    [ws.ord, ws.sort],
  )

  const recipesQuery = usePopRecipesTable(
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
    { enabled: Boolean(popId && siteId) },
  )
  const categoriesNeeded =
    formOpen || categoriesOpen || filtersModalOpen
  const categoriesQuery = usePopRecipeCategories(popId, {
    enabled: categoriesNeeded,
  })
  const categories = categoriesQuery.data ?? []
  const stationsNeeded = categoriesOpen || stationsOpen
  const stationsQuery = usePopComandaStations(popId, {
    enabled: stationsNeeded,
  })
  const stations = stationsQuery.data ?? []
  const priceListsNeeded = formOpen
  const priceListsQuery = usePopPriceLists(popId, {
    enabled: priceListsNeeded,
  })
  const priceLists = priceListsQuery.data ?? []

  const recipes = recipesQuery.data?.recipes ?? []
  const totalCount = recipesQuery.data?.totalCount ?? 0
  const recipePerm = useCallback(
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
  const canCreate = recipePerm(POP_PERMS.RECIPE_CREATE)
  const canUpdate = recipePerm(POP_PERMS.RECIPE_UPDATE)
  const canDelete = recipePerm(POP_PERMS.RECIPE_DELETE)
  const loading =
    !popId || !siteId
      ? false
      : recipesQuery.isPending ||
        (recipesQuery.isFetching && !recipesQuery.isFetched)
  const tableError =
    recipesQuery.data?.success === false
      ? recipesQuery.data.error
      : recipesQuery.error instanceof Error
        ? recipesQuery.error.message
        : recipesQuery.error
          ? String(recipesQuery.error)
          : null
  const error = actionError ?? tableError

  const refreshRecipesList = useCallback(async () => {
    if (!popId) return
    invalidatePopOperateCatalogs(queryClient, popId)
    await invalidateDataWorkspaceTableInfinite(
      queryClient,
      popRecipesQueryRoot(popId),
    )
  }, [popId, queryClient])

  const refreshCategories = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popRecipeCategoriesQueryKey(popId),
    })
  }, [popId, queryClient])

  const refreshStations = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popComandaStationsQueryKey(popId),
    })
  }, [popId, queryClient])

  useEffect(() => {
    const res = recipesQuery.data
    if (!res || res.success || !("redirect" in res) || !res.redirect) return
    const redirect = res.redirect
    const timeout = window.setTimeout(() => {
      routerRef.current.push(redirect)
    }, 1200)
    return () => window.clearTimeout(timeout)
  }, [recipesQuery.data])

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
    const noun = totalCount === 1 ? "receta" : "recetas"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [loading, totalCount])

  const skeletonRowCount = DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT

  const visibleIds = useMemo(() => recipes.map((row) => row.id), [recipes])
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
    setForm(defaultRecipeFormState())
    setFormError(null)
    setFormRefreshing(false)
    setFormOpen(true)
  }

  const openEdit = (row: RecipeTableRow) => {
    if (!popId) return
    const requestId = ++editRequestIdRef.current
    setFormError(null)
    setEditingId(row.id)
    setForm(recipeFormFromDetail(row, []))
    setFormRefreshing(true)
    setFormOpen(true)
    void queryClient
      .fetchQuery({
        queryKey: popRecipeQueryKey(popId, row.id),
        queryFn: () => fetchPopRecipe(popId, row.id),
        staleTime: 0,
      })
      .then((detail) => {
        if (editRequestIdRef.current !== requestId) return
        setForm(
          recipeFormFromDetail(
            detail,
            ingredientLinesFromDetail(detail.ingredients),
            Object.fromEntries(
              (detail.listPrices ?? []).map((item) => [
                item.listId,
                formatMoneyInputForField(item.amount),
              ]),
            ),
          ),
        )
      })
      .catch((err: unknown) => {
        if (editRequestIdRef.current !== requestId) return
        setFormError(
          err instanceof Error ? err.message : "No se pudo cargar la receta",
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
    setForm(defaultRecipeFormState())
  }

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    if (formSaving || formRefreshing) return
    setFormSaving(true)
    setFormError(null)
    const payload = {
      ...recipeFormToPayload(form),
      listPrices: parseListPriceFormValues(
        form.listPrices,
        extraPriceLists(priceLists),
      ),
    }
    const res = editingId
      ? await updatePopRecipe(popId, editingId, payload)
      : await createPopRecipe(popId, payload)
    setFormSaving(false)
    if (!res.success) {
      setFormError(res.error)
      return
    }
    setFormOpen(false)
    invalidatePopOperateCatalogs(queryClient, popId)
    await refreshRecipesList()
  }

  const submitDelete = async () => {
    if (!deleteTarget || deleteBusy) return
    setDeleteBusy(true)
    setDeleteBanner(null)
    const res = await deletePopRecipe(popId, deleteTarget.id, deleteTyped)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteBanner(res.error)
      return
    }
    requestCloseDelete()
    invalidatePopOperateCatalogs(queryClient, popId)
    await refreshRecipesList()
  }

  const requestCloseDelete = () => {
    setDeleteOpen(false)
  }

  const finalizeDeleteClose = () => {
    setDeleteTarget(null)
    setDeleteTyped("")
    setDeleteBanner(null)
  }

  const openDelete = (row: RecipeTableRow) => {
    setDeleteTarget(row)
    setDeleteTyped("")
    setDeleteBanner(null)
    setDeleteOpen(true)
  }

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim()
    if (!name || newCategorySaving) return
    const stationId = newCategoryStationId
    const stationName =
      stations.find((station) => station.id === stationId)?.name ||
      "Sin comanda"
    setCategoriesBanner(null)
    setNewCategorySaving(true)
    setPendingCategoryCreate({ name, stationName })
    setNewCategoryName("")
    setNewCategoryStationId(null)
    const res = await createPopRecipeCategory(popId, name, stationId)
    if (!res.success) {
      setPendingCategoryCreate(null)
      setNewCategorySaving(false)
      setNewCategoryName(name)
      setCategoriesBanner(res.error)
      return
    }
    await refreshCategories()
    setCategoriesBoardKey((k) => k + 1)
    setNewCategorySaving(false)
    setPendingCategoryCreate(null)
  }

  const handleSaveCategoryEdit = async () => {
    if (!editingCategoryId || categoryBusy) return
    const current = categories.find((category) => category.id === editingCategoryId)
    if (
      current &&
      editingCategoryName.trim() === current.name.trim() &&
      editingCategoryStationId === current.stationId
    ) {
      return
    }
    setCategoryBusy(true)
    const res = await updatePopRecipeCategory(
      popId,
      editingCategoryId,
      editingCategoryName,
      editingCategoryStationId,
    )
    setCategoryBusy(false)
    if (!res.success) {
      setCategoriesBanner(res.error)
      return
    }
    setCategoriesBanner(null)
    setEditingCategoryId(null)
    setEditingCategoryName("")
    setEditingCategoryStationId(null)
    await refreshCategories()
  }

  const requestDeleteCategory = (id: string, name: string) => {
    if (!popId) return
    setDeleteCategoryBanner(null)
    setDeleteCategoryTarget({ id, name, recipeCount: null })
    void fetchPopRecipeCategoryCount(popId, id).then((res) => {
      if (!res.success) {
        setDeleteCategoryTarget(null)
        setCategoriesBanner(res.error)
        return
      }
      setDeleteCategoryTarget((current) =>
        current?.id === id ? { ...current, recipeCount: res.count } : current,
      )
    })
  }

  const closeDeleteCategory = () => {
    setDeleteCategoryTarget(null)
    setDeleteCategoryBanner(null)
  }

  const handleDeleteCategory = async () => {
    if (!popId || !deleteCategoryTarget) return
    if (deleteCategoryTarget.recipeCount !== 0) return
    const target = deleteCategoryTarget
    setDeleteCategoryBusy(true)
    setDeleteCategoryBanner(null)
    setPendingCategoryDeleteId(target.id)
    if (editingCategoryId === target.id) {
      setEditingCategoryId(null)
      setEditingCategoryName("")
      setEditingCategoryStationId(null)
    }
    closeDeleteCategory()
    setDeleteCategoryBusy(false)
    setCategoriesBanner(null)
    const res = await deletePopRecipeCategory(popId, target.id)
    if (!res.success) {
      setPendingCategoryDeleteId(null)
      setCategoriesBanner(res.error)
      return
    }
    await refreshCategories()
    setCategoriesBoardKey((k) => k + 1)
    setPendingCategoryDeleteId(null)
  }

  const handleCreateStation = async () => {
    const name = newStationName.trim()
    if (!name || newStationSaving) return
    setStationsBanner(null)
    setNewStationSaving(true)
    setPendingStationCreate({ name })
    setNewStationName("")
    const res = await createPopComandaStation(popId, name)
    if (!res.success) {
      setPendingStationCreate(null)
      setNewStationSaving(false)
      setNewStationName(name)
      setStationsBanner(res.error)
      return
    }
    await refreshStations()
    setNewStationSaving(false)
    setPendingStationCreate(null)
  }

  const handleSaveStationEdit = async () => {
    if (!editingStationId || stationBusy) return
    const current = stations.find((station) => station.id === editingStationId)
    if (current && editingStationName.trim() === current.name.trim()) return
    setStationBusy(true)
    const res = await updatePopComandaStation(
      popId,
      editingStationId,
      editingStationName,
    )
    setStationBusy(false)
    if (!res.success) {
      setStationsBanner(res.error)
      return
    }
    setStationsBanner(null)
    setEditingStationId(null)
    setEditingStationName("")
    await Promise.all([refreshStations(), refreshCategories()])
  }

  const requestDeleteStation = (id: string, name: string) => {
    if (!popId) return
    setDeleteStationBanner(null)
    setDeleteStationTarget({ id, name, categoryCount: null })
    void fetchPopComandaStationCategoryCount(popId, id).then((res) => {
      if (!res.success) {
        setDeleteStationTarget(null)
        setStationsBanner(res.error)
        return
      }
      setDeleteStationTarget((current) =>
        current?.id === id ? { ...current, categoryCount: res.count } : current,
      )
    })
  }

  const closeDeleteStation = () => {
    setDeleteStationTarget(null)
    setDeleteStationBanner(null)
  }

  const handleDeleteStation = async () => {
    if (!popId || !deleteStationTarget) return
    if (deleteStationTarget.categoryCount !== 0) return
    const target = deleteStationTarget
    setDeleteStationBusy(true)
    setDeleteStationBanner(null)
    setPendingStationDeleteId(target.id)
    if (editingStationId === target.id) {
      setEditingStationId(null)
      setEditingStationName("")
    }
    closeDeleteStation()
    setDeleteStationBusy(false)
    setStationsBanner(null)
    const res = await deletePopComandaStation(popId, target.id)
    if (!res.success) {
      setPendingStationDeleteId(null)
      setStationsBanner(res.error)
      return
    }
    await Promise.all([refreshStations(), refreshCategories()])
    setPendingStationDeleteId(null)
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
        title: "Recetas",
        loading: bootstrapLoading,
        userName: bootstrap?.userFullName,
        userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
        userRoleLabel: bootstrap?.roleLabel,
        pillLabel: "Menú",
        headerActions: canCreate ? (
          <RootsIconButton
            label="Nueva receta"
            semantic="primary"
            atmosphere="eter"
            size="default"
            onClick={openCreate}
          >
            <Plus className="size-5" aria-hidden />
          </RootsIconButton>
        ) : null,
        headerMoreActions:
          canUpdate || canCreate
            ? [
                {
                  label: "Gestionar categorías",
                  icon: FolderTree,
                  onClick: () => setCategoriesOpen(true),
                },
                {
                  label: "Gestionar estaciones",
                  icon: ChefHat,
                  onClick: () => {
                    setStationsOpen(true)
                  },
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
                      label="Solo activas"
                      onRemove={() => pushWs({ soloActivos: false, page: 1 })}
                      removeAriaLabel="Quitar filtro solo activas"
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
            overlay={
              !loading && totalCount === 0 ? (
                <DataWorkspaceTableEmptyMascot />
              ) : null
            }
            infinite={tableListInfiniteFromQuery(recipesQuery, "recipes")}
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
                        loading || totalCount === 0 || recipes.length === 0
                      }
                      ariaLabel="Seleccionar filas visibles"
                    />
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        workspaceTableLayoutImageColumnClass,
                        recipeTableImageColumnClass,
                        recipeTableHeaderClass(),
                      )}
                      srOnly
                    >
                      Foto
                    </WorkspaceTableHead>
                    <WorkspaceTableSortHead
                      tone="nature"
                      label="Receta"
                      direction={sortDirection("name")}
                      onSort={() => handleSortColumn("name")}
                      className={recipeTableHeaderClass(recipeTableNameColumnClass)}
                    />
                    <WorkspaceTableHead
                      tone="nature"
                      className={recipeTableHeaderClass(
                        recipeTableCategoryColumnClass,
                      )}
                    >
                      Categoría
                    </WorkspaceTableHead>
                    <WorkspaceTableSortHead
                      tone="nature"
                      label="Venta"
                      align="right"
                      direction={sortDirection("sale_price")}
                      onSort={() => handleSortColumn("sale_price")}
                      className={recipeTableHeaderClass(
                        recipeTableSaleColumnClass,
                      )}
                    />
                    <WorkspaceTableSortHead
                      tone="nature"
                      label="Costo"
                      align="right"
                      direction={sortDirection("cost_price")}
                      onSort={() => handleSortColumn("cost_price")}
                      className={recipeTableHeaderClass(
                        recipeTableCostColumnClass,
                      )}
                    />
                    <WorkspaceTableHead
                      tone="nature"
                      className={recipeTableHeaderClass(
                        recipeTableIngredientsColumnClass,
                        "text-center",
                      )}
                    >
                      Ingredientes
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={recipeTableHeaderClass(
                        recipeTableStatusColumnClass,
                      )}
                    >
                      Estado
                    </WorkspaceTableHead>
                    {canUpdate || canDelete ? (
                      <WorkspaceTableHead
                        tone="nature"
                        className={recipeTableHeaderClass(
                          recipeTableActionsColumnClass,
                          "text-right",
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
                      rowKeyPrefix="recipes-sk"
                      columns={recipesSkeletonColumns({
                        hasActionsColumn: Boolean(canUpdate || canDelete),
                      })}
                      tone="nature"
                    />
                  ) : totalCount === 0 ? null : (
                    recipes.map((row, index) => (
                      <WorkspaceTableBodyRow
                        key={row.id}
                        index={index}
                        selected={selected.has(row.id)}
                        inactive={!row.isActive}
                      >
                        <RecipeTableSelectCell
                          checked={selected.has(row.id)}
                          onCheckedChange={(checked) => {
                            setSelected((prev) => {
                              const next = new Set(prev)
                              if (checked) next.add(row.id)
                              else next.delete(row.id)
                              return next
                            })
                          }}
                          label={`Seleccionar ${row.name || "receta"}`}
                        />
                        <RecipeTableImageCell row={row} />
                        <RecipeTableNameCell row={row} />
                        <RecipeTableCategoryCell row={row} />
                        <RecipeTableSalePriceCell row={row} />
                        <RecipeTableCostPriceCell row={row} />
                        <RecipeTableIngredientsCell row={row} />
                        <RecipeTableStatusCell row={row} />
                        {canUpdate || canDelete ? (
                          <TableCell
                            className={workspaceTableLayoutActionsBodyCellClass}
                          >
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

      <RecipesFiltersDialog
        open={filtersModalOpen}
        onOpenChange={(open) => {
          if (open) {
            setDraftFilters({
              soloActivos: ws.soloActivos,
              categoryId: ws.categoryId,
            })
          }
          setFiltersModalOpen(open)
        }}
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

      <RecipeUpsertDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open && !formSaving) closeForm()
        }}
        mode={editingId ? "edit" : "create"}
        idPrefix={editingId ? "recipe-edit" : "recipe-create"}
        title={editingId ? "Editar receta" : "Nueva receta"}
        description="Platos o tragos vendibles por unidad. El costo se calcula desde los ingredientes."
        refreshing={formRefreshing}
        saving={formSaving}
        banner={formError}
        onSubmit={(e) => void submitForm(e)}
        onCancel={closeForm}
        onAfterClose={finalizeFormClose}
        form={form}
        setForm={setForm}
        siteId={siteId}
        popId={popId}
        categories={categories}
        categoriesLoading={categoriesQuery.isPending && !categoriesQuery.data}
        priceLists={priceLists}
        priceListsLoading={priceListsQuery.isPending && !priceListsQuery.data}
        disabled={formSaving}
      />

      {deleteTarget ? (
        <RecipeDeleteDialog
          open={deleteOpen}
          recipeName={deleteTarget.name}
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

      <RecipeCategoriesDialog
        open={categoriesOpen}
        onOpenChange={(open) => {
          setCategoriesOpen(open)
          if (!open) {
            setCategoriesBanner(null)
            setEditingCategoryId(null)
            setEditingCategoryName("")
            setEditingCategoryStationId(null)
            setNewCategoryName("")
            setNewCategoryStationId(null)
            setPendingCategoryCreate(null)
            setPendingCategoryDeleteId(null)
            setNewCategorySaving(false)
            closeDeleteCategory()
          }
        }}
        banner={categoriesBanner}
        loading={categoriesQuery.isPending && !categoriesQuery.data}
        categories={categories}
        boardKey={categoriesBoardKey}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        newCategoryName={newCategoryName}
        newCategoryStationId={newCategoryStationId}
        newCategorySaving={newCategorySaving}
        pendingCreateName={
          pendingCategoryCreate &&
          !categories.some(
            (category) => category.name === pendingCategoryCreate.name,
          )
            ? pendingCategoryCreate.name
            : null
        }
        pendingCreateStationName={pendingCategoryCreate?.stationName ?? null}
        pendingDeleteId={pendingCategoryDeleteId}
        onNewCategoryNameChange={setNewCategoryName}
        onNewCategoryStationChange={setNewCategoryStationId}
        onCreateCategory={() => void handleCreateCategory()}
        categoryBusy={categoryBusy}
        editingCategoryId={editingCategoryId}
        editingCategoryName={editingCategoryName}
        onEditingCategoryNameChange={setEditingCategoryName}
        onStartEdit={(c) => {
          setEditingCategoryId(c.id)
          setEditingCategoryName(c.name)
          setEditingCategoryStationId(c.stationId)
        }}
        onCancelEdit={() => {
          setEditingCategoryId(null)
          setEditingCategoryName("")
          setEditingCategoryStationId(null)
        }}
        onSaveEdit={() => void handleSaveCategoryEdit()}
        onDeleteCategory={requestDeleteCategory}
        onLayoutChange={async (updates) => {
          setCategoryBusy(true)
          const res = await syncPopRecipeCategoryLayout(popId, updates)
          setCategoryBusy(false)
          if (!res.success) setCategoriesBanner(res.error)
          else {
            setCategoriesBanner(null)
            await refreshCategories()
          }
        }}
        stations={stations}
        editingStationId={editingCategoryStationId}
        onEditingStationChange={setEditingCategoryStationId}
      />

      <RecipeCategoryDeleteDialog
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

      <RecipeStationsDialog
        open={stationsOpen}
        onOpenChange={(open) => {
          setStationsOpen(open)
          if (!open) {
            setStationsBanner(null)
            setEditingStationId(null)
            setEditingStationName("")
            setNewStationName("")
            setPendingStationCreate(null)
            setPendingStationDeleteId(null)
            setNewStationSaving(false)
            closeDeleteStation()
          }
        }}
        banner={stationsBanner}
        loading={stationsQuery.isPending && !stationsQuery.data}
        stations={stations}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        newStationName={newStationName}
        onNewStationNameChange={setNewStationName}
        onCreateStation={() => void handleCreateStation()}
        newStationSaving={newStationSaving}
        pendingCreateName={
          pendingStationCreate &&
          !stations.some((station) => station.name === pendingStationCreate.name)
            ? pendingStationCreate.name
            : null
        }
        pendingDeleteId={pendingStationDeleteId}
        stationSaveBusy={stationBusy}
        editingStationId={editingStationId}
        editingStationName={editingStationName}
        onEditingStationNameChange={setEditingStationName}
        onStartEdit={(station) => {
          setEditingStationId(station.id)
          setEditingStationName(station.name)
        }}
        onCancelEdit={() => {
          setEditingStationId(null)
          setEditingStationName("")
        }}
        onSaveEdit={() => void handleSaveStationEdit()}
        onDeleteStation={requestDeleteStation}
      />

      <RecipeStationDeleteDialog
        open={deleteStationTarget !== null}
        target={deleteStationTarget}
        banner={deleteStationBanner}
        busy={deleteStationBusy}
        onOpenChange={(open) => {
          if (!open && !deleteStationBusy) closeDeleteStation()
        }}
        onClose={closeDeleteStation}
        onConfirmDelete={() => void handleDeleteStation()}
      />
    </DataWorkspaceTableListPage>
  )
}

