"use client"

import {
  createPopRecipe,
  createRecipeCategory,
  deletePopRecipe,
  deleteRecipeCategory,
  getPopRecipeCategories,
  getPopRecipeDetail,
  getRecipeIngredientOptions,
  syncRecipeCategoryMenuLayout,
  updatePopRecipe,
  updateRecipeCategory,
  type RecipeCategoryOption,
  type RecipeIngredientOption,
  type RecipeTableRow,
} from "@/app/[siteId]/[popId]/recipes/actions"
import { ingredientLinesFromDetail } from "@/app/[siteId]/[popId]/recipes/components/RecipeIngredientEditor"
import { RecipeCategoriesDialog } from "@/app/[siteId]/[popId]/recipes/RecipeCategoriesDialog"
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
import { invalidatePopOperateCatalogs } from "@/lib/invalidatePopOperateCatalogs"
import { popRecipesQueryRoot } from "@/lib/queryKeys"
import { useQueryClient } from "@tanstack/react-query"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { cn } from "@/lib/utils"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
} from "@/lib/workspaceTableSort"
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react"
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
  const [ingredientOptions, setIngredientOptions] = useState<
    RecipeIngredientOption[]
  >([])

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

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<RecipeTableRow | null>(null)
  const [deleteTyped, setDeleteTyped] = useState("")
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [categoryBusy, setCategoryBusy] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState("")

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

  const loadIngredientOptions = useCallback(async () => {
    if (!popId) return
    const res = await getRecipeIngredientOptions(popId)
    if (res.success) setIngredientOptions(res.ingredients)
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
    void loadIngredientOptions()
  }, [loadCategories, loadIngredientOptions])

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
    setForm(
      recipeFormFromDetail(
        res.recipe,
        ingredientLinesFromDetail(res.recipe.ingredients),
      ),
    )
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
    const payload = recipeFormToPayload(form)
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
    if (!newCategoryName.trim() || categoryBusy) return
    setCategoryBusy(true)
    const res = await createRecipeCategory(popId, newCategoryName)
    setCategoryBusy(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setNewCategoryName("")
    await loadCategories()
  }

  const handleSaveCategoryEdit = async () => {
    if (!editingCategoryId || categoryBusy) return
    setCategoryBusy(true)
    const res = await updateRecipeCategory(
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
    if (!window.confirm(`¿Eliminar la categoría «${name}»?`)) return
    setCategoryBusy(true)
    const res = await deleteRecipeCategory(popId, id)
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
        title: "Recetas",
        loading: bootstrapLoading || loading,
        userName: bootstrap?.userFullName,
        userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
        userRoleLabel: bootstrap?.roleLabel,
        pillLabel: "Menú",
        headerActions: (
          <>
            {canCreate ? (
              <DataWorkspaceHeaderIconButton
                label="Nueva receta"
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
        categories={categories}
        ingredientOptions={ingredientOptions}
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
        onStartEdit={(c) => {
          setEditingCategoryId(c.id)
          setEditingCategoryName(c.name)
        }}
        onCancelEdit={() => {
          setEditingCategoryId(null)
          setEditingCategoryName("")
        }}
        onSaveEdit={() => void handleSaveCategoryEdit()}
        onDeleteCategory={(id, name) => void handleDeleteCategory(id, name)}
        onLayoutChange={async (updates) => {
          setCategoryBusy(true)
          const res = await syncRecipeCategoryMenuLayout(popId, updates)
          setCategoryBusy(false)
          if (!res.success) setError(res.error)
          else await loadCategories()
        }}
      />
    </DataWorkspaceTableListPage>
  )
}

