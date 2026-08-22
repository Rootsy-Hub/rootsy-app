"use client"

import {
  createComandaStation,
  createPopRecipe,
  createRecipeCategory,
  deleteComandaStation,
  deletePopRecipe,
  deleteRecipeCategory,
  getPopComandaStationCategoryCount,
  getPopComandaStations,
  getPopRecipeCategories,
  getPopRecipeCategoryRecipeCount,
  getPopRecipeDetail,
  syncRecipeCategoryMenuLayout,
  updateComandaStation,
  updatePopRecipe,
  updateRecipeCategory,
  type ComandaStationOption,
  type RecipeCategoryOption,
  type RecipeTableRow,
} from "@/app/[siteId]/[popId]/recipes/actions"
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
  RECIPE_TABLE_PAGE_SIZES,
  mergeRecipesWorkspaceUrl,
  parseRecipesWorkspaceUrl,
  type RecipeTableSortKey,
} from "@/app/[siteId]/[popId]/recipes/workspaceUrl"
import { buildPaginationItems } from "@/components/data-workspace/buildPaginationItems"
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
  DataWorkspaceTableListPaginationFooter,
  DataWorkspaceTableListShell,
  dataWorkspaceTableListHeaderVariant,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  DataWorkspaceTableIconAction,
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
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { recipesSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { usePopRecipesTable } from "@/hooks/usePopRecipesTable"
import {
  getItemPriceListAmounts,
  getPopPriceLists,
} from "@/app/[siteId]/[popId]/articles/priceListActions"
import { invalidatePopOperateCatalogs } from "@/lib/invalidatePopOperateCatalogs"
import { formatMoneyInputForField } from "@/lib/moneyInput"
import {
  extraPriceLists,
  parseListPriceFormValues,
  type SalePriceList,
} from "@/lib/salePriceLists"
import { popRecipesQueryRoot } from "@/lib/queryKeys"
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
  const ws = useMemo(
    () => parseRecipesWorkspaceUrl(searchParams),
    [searchParams],
  )

  const searchInputId = useId()
  const filtersButtonId = useId()
  const pageSizeLabelId = useId()

  const { bootstrap, loading: bootstrapLoading } = usePopWorkspace()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [actionError, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<RecipeCategoryOption[]>([])
  const [stations, setStations] = useState<ComandaStationOption[]>([])
  const [searchInput, setSearchInput] = useState(ws.q)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<RecipesAppliedFilters>(
    defaultRecipesFilters,
  )

  const [formOpen, setFormOpen] = useState(false)
  const [formDetailLoading, setFormDetailLoading] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<RecipeFormState>(defaultRecipeFormState())
  const [priceLists, setPriceLists] = useState<SalePriceList[]>([])

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
  const [stationsLoading, setStationsLoading] = useState(false)
  const [stationsBanner, setStationsBanner] = useState<string | null>(null)
  const [newStationName, setNewStationName] = useState("")
  const [newStationSaving, setNewStationSaving] = useState(false)
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
      const next = mergeRecipesWorkspaceUrl(searchParams, patch)
      router.replace(`${pathname}?${next.toString()}`)
    },
    [pathname, router, searchParams],
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
    { enabled: Boolean(popId) },
  )

  const recipes = recipesQuery.data?.recipes ?? []
  const totalCount = recipesQuery.data?.totalCount ?? 0
  const canCreate = recipesQuery.data?.canCreate ?? false
  const canUpdate = recipesQuery.data?.canUpdate ?? false
  const canDelete = recipesQuery.data?.canDelete ?? false
  const loading =
    recipesQuery.isPending ||
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
    await queryClient.invalidateQueries({
      queryKey: popRecipesQueryRoot(popId),
    })
  }, [popId, queryClient])

  const loadCategories = useCallback(async () => {
    if (!popId) return
    const res = await getPopRecipeCategories(popId)
    if (res.success) setCategories(res.categories)
  }, [popId])

  const loadStations = useCallback(
    async (opts?: { spinner?: boolean }) => {
      if (!popId) return
      if (opts?.spinner) setStationsLoading(true)
      try {
        const res = await getPopComandaStations(popId)
        if (res.success) {
          setStations(res.stations)
          if (opts?.spinner) setStationsBanner(null)
        } else if (opts?.spinner) {
          setStationsBanner(res.error)
        }
      } finally {
        if (opts?.spinner) setStationsLoading(false)
      }
    },
    [popId],
  )

  const loadPriceLists = useCallback(async () => {
    if (!popId) return
    const res = await getPopPriceLists(popId)
    if (res.success) setPriceLists(res.lists)
  }, [popId])

  useEffect(() => {
    const res = recipesQuery.data
    if (!res || res.success || !("redirect" in res) || !res.redirect) return
    routerRef.current.replace(res.redirect)
  }, [recipesQuery.data])

  useEffect(() => {
    setSelected(new Set())
  }, [ws.q, ws.page, ws.pageSize, ws.soloActivos, ws.categoryId, ws.sort, ws.ord])

  useEffect(() => {
    void loadCategories()
    void loadStations()
    void loadPriceLists()
  }, [loadCategories, loadStations, loadPriceLists])

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
    const noun = totalCount === 1 ? "receta" : "recetas"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [loading, totalCount])

  const skeletonRowCount = Math.min(12, Math.max(5, ws.pageSize))

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
    setEditingId(null)
    setForm(defaultRecipeFormState())
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = async (row: RecipeTableRow) => {
    setFormError(null)
    setFormDetailLoading(true)
    setFormOpen(true)
    setEditingId(row.id)
    const res = await getPopRecipeDetail(popId, row.id)
    setFormDetailLoading(false)
    if (!res.success) {
      setFormError(res.error)
      return
    }
    const amountsRes = await getItemPriceListAmounts(popId, "recipe", row.id)
    const next = recipeFormFromDetail(
      res.recipe,
      ingredientLinesFromDetail(res.recipe.ingredients),
    )
    if (amountsRes.success) {
      next.listPrices = Object.fromEntries(
        Object.entries(amountsRes.amounts).map(([id, amount]) => [
          id,
          formatMoneyInputForField(amount),
        ]),
      )
    }
    setForm(next)
  }

  const closeForm = () => {
    setFormOpen(false)
  }

  const finalizeFormClose = () => {
    setEditingId(null)
    setFormError(null)
    setFormDetailLoading(false)
    setFormSaving(false)
    setForm(defaultRecipeFormState())
  }

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    if (formSaving || formDetailLoading) return
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
    if (!newCategoryName.trim() || newCategorySaving) return
    setNewCategorySaving(true)
    const res = await createRecipeCategory(
      popId,
      newCategoryName,
      newCategoryStationId,
    )
    setNewCategorySaving(false)
    if (!res.success) {
      setCategoriesBanner(res.error)
      return
    }
    setCategoriesBanner(null)
    setNewCategoryName("")
    setNewCategoryStationId(null)
    setCategoriesBoardKey((k) => k + 1)
    await loadCategories()
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
    const res = await updateRecipeCategory(
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
    await loadCategories()
  }

  const requestDeleteCategory = (id: string, name: string) => {
    if (!popId) return
    setDeleteCategoryBanner(null)
    setDeleteCategoryTarget({ id, name, recipeCount: null })
    void getPopRecipeCategoryRecipeCount(popId, id).then((res) => {
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
    setDeleteCategoryBusy(true)
    setDeleteCategoryBanner(null)
    const res = await deleteRecipeCategory(popId, deleteCategoryTarget.id)
    setDeleteCategoryBusy(false)
    if (!res.success) {
      setDeleteCategoryBanner(res.error)
      return
    }
    closeDeleteCategory()
    setCategoriesBanner(null)
    setCategoriesBoardKey((k) => k + 1)
    await loadCategories()
  }

  const handleCreateStation = async () => {
    if (!newStationName.trim() || newStationSaving) return
    setNewStationSaving(true)
    const res = await createComandaStation(popId, newStationName)
    setNewStationSaving(false)
    if (!res.success) {
      setStationsBanner(res.error)
      return
    }
    setStationsBanner(null)
    setNewStationName("")
    await loadStations()
  }

  const handleSaveStationEdit = async () => {
    if (!editingStationId || stationBusy) return
    const current = stations.find((station) => station.id === editingStationId)
    if (current && editingStationName.trim() === current.name.trim()) return
    setStationBusy(true)
    const res = await updateComandaStation(
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
    await Promise.all([loadStations(), loadCategories()])
  }

  const requestDeleteStation = (id: string, name: string) => {
    if (!popId) return
    setDeleteStationBanner(null)
    setDeleteStationTarget({ id, name, categoryCount: null })
    void getPopComandaStationCategoryCount(popId, id).then((res) => {
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
    setDeleteStationBusy(true)
    setDeleteStationBanner(null)
    const res = await deleteComandaStation(popId, deleteStationTarget.id)
    setDeleteStationBusy(false)
    if (!res.success) {
      setDeleteStationBanner(res.error)
      return
    }
    closeDeleteStation()
    setStationsBanner(null)
    await Promise.all([loadStations(), loadCategories()])
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
          <DataWorkspaceHeaderIconButton
            label="Nueva receta"
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
                {
                  label: "Gestionar estaciones",
                  icon: ChefHat,
                  onClick: () => {
                    setStationsOpen(true)
                    setStationsLoading(true)
                    void loadStations({ spinner: true })
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
            footer={
              <DataWorkspaceTableListPaginationFooter
                listFetching={loading}
                totalCount={totalCount}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                currentPage={ws.page}
                totalPages={totalPages}
                pageSize={ws.pageSize}
                pageSizeOptions={RECIPE_TABLE_PAGE_SIZES}
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
        loading={formDetailLoading}
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
        priceLists={priceLists}
        disabled={formDetailLoading || formSaving}
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
            closeDeleteCategory()
          }
        }}
        banner={categoriesBanner}
        categories={categories}
        boardKey={categoriesBoardKey}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        newCategoryName={newCategoryName}
        newCategoryStationId={newCategoryStationId}
        newCategorySaving={newCategorySaving}
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
          const res = await syncRecipeCategoryMenuLayout(popId, updates)
          setCategoryBusy(false)
          if (!res.success) setCategoriesBanner(res.error)
          else {
            setCategoriesBanner(null)
            await loadCategories()
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
            closeDeleteStation()
          }
        }}
        banner={stationsBanner}
        loading={stationsLoading}
        stations={stations}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        newStationName={newStationName}
        onNewStationNameChange={setNewStationName}
        onCreateStation={() => void handleCreateStation()}
        newStationSaving={newStationSaving}
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

