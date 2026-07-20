"use client"

import {
  createPopRecipe,
  createRecipeCategory,
  deletePopRecipe,
  deleteRecipeCategory,
  getPopRecipeCategories,
  getPopRecipesTable,
  getPopRecipeDetail,
  getRecipeIngredientOptions,
  syncRecipeCategoryMenuLayout,
  updatePopRecipe,
  updateRecipeCategory,
  type RecipeCategoryOption,
  type RecipeIngredientOption,
  type RecipeTableRow,
} from "@/app/[siteId]/[popId]/recipes/actions"
import { RecipeCategoriesMenuBoard } from "@/app/[siteId]/[popId]/recipes/components/RecipeCategoriesMenuBoard"
import {
  RecipeIngredientEditor,
  createEmptyIngredientLine,
  ingredientLinesFromDetail,
  ingredientLinesToInput,
  type RecipeIngredientFormLine,
} from "@/app/[siteId]/[popId]/recipes/components/RecipeIngredientEditor"
import {
  RECIPE_DELETE_CONFIRM_PHRASE,
  recipeDialogBodyClass,
  recipeDialogFooterClass,
  recipeDialogHeaderClass,
  recipeDialogSurfaceClass,
  recipeDialogSurfaceWideClass,
  recipeFormFieldClass,
  recipesStockTableClassName,
} from "@/app/[siteId]/[popId]/recipes/recipeConstants"
import {
  RECIPE_TABLE_PAGE_SIZES,
  mergeRecipesWorkspaceUrl,
  parseRecipesWorkspaceUrl,
} from "@/app/[siteId]/[popId]/recipes/workspaceUrl"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import {
  articleDialogBodyClass,
  articleDialogFooterClass,
  articleDialogHeaderClass,
  articleDialogSurfaceClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import { DataWorkspaceListTableShell } from "@/components/data-workspace/DataWorkspaceListTableShell"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  DataWorkspaceTableIconAction,
  DataWorkspaceTableThumbnail,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  lightFilterChipClass,
  lightTableThClass,
  lightToolbarButtonClass,
  lightToolbarControlActiveClass,
  lightToolbarInputClass,
  lightToolbarClearButtonClass,
  lightToolbarPanelClass,
  lightToolbarPanelLastClass,
  lightToolbarShellClass,
  selectColumnInnerClass,
  tableRowSelectCheckboxClass,
  tdMoneyMutedClass,
  tdMoneyTotalClass,
  tdTruncatedNameCellClass,
  tdTruncatedTextCellClass,
  toolbarBlockLabelClass,
  workspaceTableBodyRowClassNames,
  workspaceTableHeaderRowClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { Badge } from "@/components/ui/badge"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import withAuth from "@/hoc/withAuth"
import { getWorkspaceHeaderForPop } from "@/lib/workspaceHeaderServer"
import { cn } from "@/lib/utils"
import {
  Filter,
  FolderTree,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
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

type RecipesAppliedFilters = {
  soloActivos: boolean
  categoryId: string
}

const defaultRecipesFilters = (): RecipesAppliedFilters => ({
  soloActivos: false,
  categoryId: "",
})

const recipesSk = {
  bar: "animate-pulse rounded-[3px] bg-muted-foreground/12 dark:bg-muted-foreground/[0.14]",
  barSm:
    "animate-pulse rounded-[3px] bg-muted-foreground/8 dark:bg-muted-foreground/11",
  pill: "animate-pulse rounded-full bg-muted-foreground/12 dark:bg-muted-foreground/[0.14]",
  box: "animate-pulse rounded-sm bg-muted-foreground/10 dark:bg-muted-foreground/[0.12]",
} as const

function RecipesTableSkeletonRows({
  rowCount,
  hasActionsColumn,
}: {
  rowCount: number
  hasActionsColumn: boolean
}) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow
          key={`recipe-sk-${i}`}
          className={cn(
            "border-border/50",
            i % 2 === 0 ? "bg-white/30" : "bg-muted/25 dark:bg-muted/15",
          )}
          aria-hidden
        >
          <TableCell className="w-24 px-3 py-2 align-middle">
            <div className={cn("size-20 rounded-lg", recipesSk.box)} />
          </TableCell>
          <TableCell className={tdTruncatedNameCellClass}>
            <div className={cn("h-3.5 w-[72%] max-w-[11rem]", recipesSk.bar)} />
          </TableCell>
          <TableCell className={tdTruncatedTextCellClass}>
            <div className={cn("h-3 w-24", recipesSk.barSm)} />
          </TableCell>
          <TableCell className="px-3 py-2.5 text-right">
            <div className={cn("ml-auto h-3.5 w-16", recipesSk.bar)} />
          </TableCell>
          <TableCell className="px-3 py-2.5 text-right">
            <div className={cn("ml-auto h-3.5 w-16", recipesSk.bar)} />
          </TableCell>
          <TableCell className="w-[5.5rem] px-3 py-2.5 text-center">
            <div className={cn("mx-auto h-3.5 w-8", recipesSk.bar)} />
          </TableCell>
          <TableCell className="w-[6.5rem] px-3 py-2.5 align-middle">
            <div className={cn("inline-block h-5 w-16", recipesSk.pill)} />
          </TableCell>
          {hasActionsColumn ? (
            <TableCell className="w-[6.5rem] px-3 py-2.5 text-right">
              <div className={cn("ml-auto h-8 w-16 rounded-md", recipesSk.box)} />
            </TableCell>
          ) : null}
        </TableRow>
      ))}
    </>
  )
}

type WorkspaceHeaderState = {
  userFullName: string
  userImageUrl: string | null
  roleLabel: string
} | null

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(n)
}

type RecipeFormState = {
  name: string
  description: string
  imageUrl: string
  categoryId: string
  salePrice: string
  iva: string
  isActive: boolean
  ingredients: RecipeIngredientFormLine[]
}

function defaultFormState(): RecipeFormState {
  return {
    name: "",
    description: "",
    imageUrl: "",
    categoryId: "",
    salePrice: "0",
    iva: "21",
    isActive: true,
    ingredients: [createEmptyIngredientLine()],
  }
}

function formFromRow(
  row: RecipeTableRow,
  ingredients: RecipeIngredientFormLine[],
): RecipeFormState {
  return {
    name: row.name,
    description: row.description,
    imageUrl: row.imageUrl ?? "",
    categoryId: row.categoryId ?? "",
    salePrice: String(row.salePrice),
    iva: String(row.iva),
    isActive: row.isActive,
    ingredients:
      ingredients.length > 0 ? ingredients : [createEmptyIngredientLine()],
  }
}

function RecipesPage() {
  const params = useParams()
  const popId = String(params.popId ?? "")
  const siteId = String(params.siteId ?? "")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ws = useMemo(
    () => parseRecipesWorkspaceUrl(searchParams),
    [searchParams],
  )

  const [popName, setPopName] = useState("")
  const [recipes, setRecipes] = useState<RecipeTableRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workspaceHeader, setWorkspaceHeader] =
    useState<WorkspaceHeaderState>(null)
  const pageSizeLabelId = useId()
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)

  const [categories, setCategories] = useState<RecipeCategoryOption[]>([])
  const [ingredientOptions, setIngredientOptions] = useState<
    RecipeIngredientOption[]
  >([])

  const [searchInput, setSearchInput] = useState(ws.q)
  const searchInputId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftFilters, setDraftFilters] =
    useState<RecipesAppliedFilters>(defaultRecipesFilters)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<RecipeFormState>(defaultFormState)
  const [formBusy, setFormBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<RecipeTableRow | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState("")
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

  const loadTable = useCallback(async () => {
    if (!popId) return
    setLoading(true)
    setError(null)
    const res = await getPopRecipesTable(popId, {
      q: ws.q,
      page: ws.page,
      pageSize: ws.pageSize,
      soloActivos: ws.soloActivos,
      categoryId: ws.categoryId,
    })
    if (!res.success) {
      setError(res.error)
      setRecipes(res.recipes)
      setTotalCount(res.totalCount)
      setCanCreate(res.canCreate)
      setCanUpdate(res.canUpdate)
      setCanDelete(res.canDelete)
      if ("redirect" in res && res.redirect) {
        router.replace(res.redirect)
      }
      setLoading(false)
      return
    }
    setRecipes(res.recipes)
    setTotalCount(res.totalCount)
    setPopName(res.popName)
    setCanCreate(res.canCreate)
    setCanUpdate(res.canUpdate)
    setCanDelete(res.canDelete)
    setLoading(false)
  }, [popId, router, ws])

  const fetchWorkspaceHeader = useCallback(async () => {
    if (!popId) return
    const head = await getWorkspaceHeaderForPop(popId)
    if (head.success) {
      setWorkspaceHeader({
        userFullName: head.userFullName,
        userImageUrl: head.userImageUrl,
        roleLabel: head.roleLabel,
      })
      if (!popName) setPopName(head.popName)
    } else {
      setWorkspaceHeader(null)
    }
  }, [popId, popName])

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
    void loadTable()
  }, [loadTable])

  useEffect(() => {
    void fetchWorkspaceHeader()
    void loadCategories()
    void loadIngredientOptions()
  }, [fetchWorkspaceHeader, loadCategories, loadIngredientOptions])

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

  const hasFilterChips =
    ws.q.trim() !== "" || ws.soloActivos || ws.categoryId.trim() !== ""

  const modalFiltersActiveCount = useMemo(() => {
    let count = 0
    if (ws.soloActivos) count++
    if (ws.categoryId.trim()) count++
    return count
  }, [ws.soloActivos, ws.categoryId])

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
    setForm(defaultFormState())
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = async (row: RecipeTableRow) => {
    setFormError(null)
    setFormBusy(true)
    setFormOpen(true)
    setEditingId(row.id)
    const res = await getPopRecipeDetail(popId, row.id)
    setFormBusy(false)
    if (!res.success) {
      setFormError(res.error)
      return
    }
    setForm(
      formFromRow(
        res.recipe,
        ingredientLinesFromDetail(res.recipe.ingredients),
      ),
    )
  }

  const closeForm = () => {
    if (formBusy) return
    setFormOpen(false)
    setEditingId(null)
    setFormError(null)
  }

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    if (formBusy) return
    setFormBusy(true)
    setFormError(null)
    const payload = {
      name: form.name,
      description: form.description,
      imageUrl: form.imageUrl,
      categoryId: form.categoryId,
      salePrice: Number(form.salePrice.replace(",", ".")),
      iva: Number(form.iva.replace(",", ".")),
      isActive: form.isActive,
      ingredients: ingredientLinesToInput(form.ingredients),
    }
    const res = editingId
      ? await updatePopRecipe(popId, editingId, payload)
      : await createPopRecipe(popId, payload)
    setFormBusy(false)
    if (!res.success) {
      setFormError(res.error)
      return
    }
    setFormOpen(false)
    setEditingId(null)
    await loadTable()
  }

  const confirmDelete = async () => {
    if (!deleteTarget || deleteBusy) return
    setDeleteBusy(true)
    const res = await deletePopRecipe(popId, deleteTarget.id, deleteConfirm)
    setDeleteBusy(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setDeleteOpen(false)
    setDeleteTarget(null)
    setDeleteConfirm("")
    await loadTable()
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
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title="Recetas"
      headerVariant="dark"
      contentFlush
      sidebarCollapsible={false}
      loading={!popName && loading}
      userName={workspaceHeader?.userFullName}
      userAvatarSrc={workspaceHeader?.userImageUrl ?? undefined}
      userRoleLabel={workspaceHeader?.roleLabel}
      pillLabel="Menú"
      mainClassName="min-h-0 overflow-hidden"
      headerActions={
        <>
          {canCreate ? (
            <DataWorkspaceHeaderIconButton
              label="Nueva receta"
              headerVariant="dark"
              primary
              onClick={openCreate}
            >
              <Plus className="size-5" aria-hidden />
            </DataWorkspaceHeaderIconButton>
          ) : null}
          {(canUpdate || canCreate) && (
            <DataWorkspaceHeaderIconButton
              label="Gestionar categorías"
              headerVariant="dark"
              onClick={() => setCategoriesOpen(true)}
            >
              <FolderTree className="size-5" aria-hidden />
            </DataWorkspaceHeaderIconButton>
          )}
        </>
      }
    >
      <div className="relative flex min-h-0 w-full flex-1 flex-col">
        {error ? (
          <div
            role="alert"
            className="relative shrink-0 border-b border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            className={lightToolbarShellClass}
            role="toolbar"
            aria-label="Filtros del listado"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12">
              <div
                className={cn(
                  lightToolbarPanelClass,
                  "order-2 w-full min-w-0 md:col-span-1 xl:order-1 xl:col-span-3",
                )}
              >
                <div className="mb-2 flex min-w-0 items-baseline justify-between gap-3">
                  <span className={toolbarBlockLabelClass}>Filtros</span>
                  {modalFiltersActiveCount > 0 ? (
                    <span className="shrink-0 text-[11px] font-medium text-primary">
                      Activo
                    </span>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    lightToolbarButtonClass,
                    modalFiltersActiveCount > 0 &&
                      lightToolbarControlActiveClass,
                  )}
                  aria-haspopup="dialog"
                  aria-expanded={filtersModalOpen}
                  onClick={() => {
                    setDraftFilters({
                      soloActivos: ws.soloActivos,
                      categoryId: ws.categoryId,
                    })
                    setFiltersModalOpen(true)
                  }}
                >
                  <Filter className="size-4 shrink-0 opacity-80" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {modalFiltersActiveCount > 0
                      ? "Refinar filtros"
                      : "Estado y categoría"}
                  </span>
                  {modalFiltersActiveCount > 0 ? (
                    <span
                      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold tabular-nums text-primary"
                      aria-hidden
                    >
                      {modalFiltersActiveCount}
                    </span>
                  ) : null}
                </Button>
              </div>

              <div
                className={cn(
                  lightToolbarPanelLastClass,
                  "order-1 min-w-0 md:col-span-2 xl:order-2 xl:col-span-9",
                )}
              >
                <div className="mb-2 flex min-w-0 items-baseline justify-between gap-3">
                  <label htmlFor={searchInputId} className={toolbarBlockLabelClass}>
                    Buscar
                  </label>
                  <span
                    className="shrink-0 text-[11px] font-medium text-muted-foreground"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {resultsSummary}
                  </span>
                </div>
                <div className="relative min-w-0">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    ref={searchInputRef}
                    id={searchInputId}
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Nombre, descripción… ( / )"
                    className={cn(
                      lightToolbarInputClass,
                      searchInput.trim().length > 0 && "pr-10",
                    )}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="Buscar recetas"
                  />
                  {searchInput.trim().length > 0 ? (
                    <button
                      type="button"
                      aria-label="Limpiar búsqueda"
                      className={lightToolbarClearButtonClass}
                      onClick={() => {
                        setSearchInput("")
                        searchInputRef.current?.focus()
                      }}
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {hasFilterChips ? (
              <div
                className="border-t border-border/80 bg-card px-4 py-3"
                role="region"
                aria-label="Filtros activos"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className={toolbarBlockLabelClass}>
                    Filtros activos
                    <span className="sr-only">: {activeFilterCount}</span>
                    <span
                      className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums normal-case tracking-normal text-muted-foreground"
                      aria-hidden
                    >
                      {activeFilterCount}
                    </span>
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                    onClick={clearAllFilters}
                  >
                    Limpiar todo
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {ws.q.trim() ? (
                    <Badge variant="secondary" className={lightFilterChipClass}>
                      <span className="truncate">Buscar: «{ws.q.trim()}»</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0"
                        onClick={() => pushWs({ q: "", page: 1 })}
                        aria-label="Quitar búsqueda"
                      >
                        <X className="size-3" />
                      </Button>
                    </Badge>
                  ) : null}
                  {ws.soloActivos ? (
                    <Badge variant="secondary" className={lightFilterChipClass}>
                      Solo activas
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0"
                        onClick={() =>
                          pushWs({ soloActivos: false, page: 1 })
                        }
                        aria-label="Quitar filtro solo activas"
                      >
                        <X className="size-3" />
                      </Button>
                    </Badge>
                  ) : null}
                  {ws.categoryId.trim() ? (
                    <Badge variant="secondary" className={lightFilterChipClass}>
                      <span className="truncate">
                        Categoría:{" "}
                        {categoryLabelForChip || ws.categoryId}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0"
                        onClick={() => pushWs({ categoryId: "", page: 1 })}
                        aria-label="Quitar filtro categoría"
                      >
                        <X className="size-3" />
                      </Button>
                    </Badge>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <Dialog
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
          >
            <DialogContent
              className={articleDialogSurfaceClass}
              showCloseButton
              data-rootsy-light-shell="true"
            >
              <DialogHeader className={articleDialogHeaderClass}>
                <DialogTitle className="text-base font-semibold tracking-tight">
                  Filtros
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed">
                  Combinan con la búsqueda. El listado se pagina en el servidor.
                </DialogDescription>
              </DialogHeader>
              <div className={articleDialogBodyClass}>
                <div className="grid gap-4">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-1 py-0.5 hover:bg-muted/50">
                    <Checkbox
                      checked={draftFilters.soloActivos}
                      onCheckedChange={(c) =>
                        setDraftFilters((f) => ({
                          ...f,
                          soloActivos: c === true,
                        }))
                      }
                      aria-label="Solo recetas activas"
                    />
                    <span className="text-sm text-foreground">
                      Solo recetas activas
                    </span>
                  </label>
                  <div className="space-y-2">
                    <Label htmlFor="recipes-filter-category">Categoría</Label>
                    <Select
                      value={draftFilters.categoryId.trim() || "__all__"}
                      onValueChange={(v) =>
                        setDraftFilters((f) => ({
                          ...f,
                          categoryId: v === "__all__" ? "" : v,
                        }))
                      }
                    >
                      <SelectTrigger
                        id="recipes-filter-category"
                        className="bg-background"
                      >
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Todas</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name || "—"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className={articleDialogFooterClass}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDraftFilters(defaultRecipesFilters())}
                >
                  Restablecer
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    pushWs({
                      soloActivos: draftFilters.soloActivos,
                      categoryId: draftFilters.categoryId,
                      page: 1,
                    })
                    setFiltersModalOpen(false)
                  }}
                >
                  Aplicar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DataWorkspaceListTableShell
            variant="flush"
            overlay={
              !loading && totalCount === 0 ? (
                <DataWorkspaceTableEmptyMascot />
              ) : null
            }
            footer={
              <DataWorkspaceListPaginationFooter
                variant="dark"
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
                className={recipesStockTableClassName}
                aria-busy={loading}
              >
                <TableHeader>
                  <TableRow className={workspaceTableHeaderRowClass}>
                    <TableHead className={cn(lightTableThClass, "w-24 px-3 text-left")}>
                      <span className="sr-only">Foto</span>
                    </TableHead>
                    <TableHead
                      className={cn(
                        lightTableThClass,
                        "w-[14rem] min-w-0 max-w-[14rem] px-3 text-left",
                      )}
                    >
                      Receta
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "w-[10rem] px-3 text-left")}>
                      Categoría
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "px-3 text-right")}>
                      Venta
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "px-3 text-right")}>
                      Costo
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "w-[5.5rem] px-3 text-center")}>
                      Ingredientes
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "w-[6.5rem] px-3 text-left")}>
                      Estado
                    </TableHead>
                    {canUpdate || canDelete ? (
                      <TableHead
                        className={cn(lightTableThClass, "w-[6.5rem] px-3 text-right")}
                      >
                        <span className="sr-only">Acciones</span>
                      </TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <RecipesTableSkeletonRows
                      rowCount={skeletonRowCount}
                      hasActionsColumn={Boolean(canUpdate || canDelete)}
                    />
                  ) : totalCount === 0 ? null : (
                    recipes.map((row, index) => (
                      <TableRow
                        key={row.id}
                        className={workspaceTableBodyRowClassNames(index)}
                      >
                        <TableCell className="w-24 px-3 py-2.5 align-middle">
                          <DataWorkspaceTableThumbnail
                            src={row.imageUrl}
                            alt={row.name}
                            size="lg"
                          />
                        </TableCell>
                        <TableCell className={tdTruncatedNameCellClass}>
                          <div className="flex min-w-0 flex-col gap-1">
                            <span
                              className="block min-w-0 truncate font-medium leading-snug text-foreground"
                              title={row.name}
                            >
                              {row.name}
                            </span>
                            {row.description ? (
                              <span
                                className="block min-w-0 truncate text-xs leading-tight text-muted-foreground"
                                title={row.description}
                              >
                                {row.description}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell
                          className={cn(
                            tdTruncatedTextCellClass,
                            "text-muted-foreground",
                          )}
                        >
                          <span className="block truncate" title={row.categoryName}>
                            {row.categoryName}
                          </span>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "px-3 py-2.5 text-right text-sm",
                            tdMoneyTotalClass,
                          )}
                        >
                          {formatMoney(row.salePrice)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "px-3 py-2.5 text-right text-sm",
                            tdMoneyMutedClass,
                          )}
                        >
                          {formatMoney(row.costPrice)}
                        </TableCell>
                        <TableCell className="w-[5.5rem] px-3 py-2.5 text-center text-sm tabular-nums text-muted-foreground">
                          {row.ingredientCount}
                        </TableCell>
                        <TableCell className="w-[6.5rem] px-3 py-2.5 align-middle">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "font-normal",
                              row.isActive
                                ? "border-emerald-200/80 bg-emerald-50 text-emerald-800"
                                : "text-muted-foreground",
                            )}
                          >
                            {row.isActive ? "Activa" : "Inactiva"}
                          </Badge>
                        </TableCell>
                        {canUpdate || canDelete ? (
                          <TableCell className="w-[6.5rem] px-3 py-2.5 text-right align-middle">
                            <div className="flex items-center justify-end gap-1">
                              {canUpdate ? (
                                <DataWorkspaceTableIconAction
                                  label={`Editar ${row.name}`}
                                  icon={Pencil}
                                  variant="edit"
                                  onClick={() => void openEdit(row)}
                                />
                              ) : null}
                              {canDelete ? (
                                <DataWorkspaceTableIconAction
                                  label={`Eliminar ${row.name}`}
                                  icon={Trash2}
                                  variant="destructive"
                                  onClick={() => {
                                    setDeleteTarget(row)
                                    setDeleteConfirm("")
                                    setDeleteOpen(true)
                                  }}
                                />
                              ) : null}
                            </div>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </table>
            </DataWorkspaceListTableFrame>
          </DataWorkspaceListTableShell>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={(o) => !o && closeForm()}>
        <DialogContent
          className={recipeDialogSurfaceWideClass}
          data-rootsy-light-shell="true"
          showCloseButton
        >
          <DialogHeader className={recipeDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              {editingId ? "Editar receta" : "Nueva receta"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Platos o tragos vendibles por unidad. El costo se calcula desde los
              ingredientes.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            onSubmit={(e) => void submitForm(e)}
          >
            <div className={recipeDialogBodyClass}>
              {formError ? (
                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </p>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="recipe-name">Nombre *</Label>
                  <Input
                    id="recipe-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                    className={recipeFormFieldClass}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="recipe-desc">Descripción</Label>
                  <Textarea
                    id="recipe-desc"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={2}
                    className={recipeFormFieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select
                    value={form.categoryId || undefined}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, categoryId: v }))
                    }
                  >
                    <SelectTrigger className={recipeFormFieldClass}>
                      <SelectValue placeholder="Elegir categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.isActive)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipe-image">URL imagen</Label>
                  <Input
                    id="recipe-image"
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, imageUrl: e.target.value }))
                    }
                    className={recipeFormFieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipe-sale">Precio venta *</Label>
                  <Input
                    id="recipe-sale"
                    inputMode="decimal"
                    value={form.salePrice}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, salePrice: e.target.value }))
                    }
                    className={recipeFormFieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipe-iva">IVA %</Label>
                  <Input
                    id="recipe-iva"
                    inputMode="decimal"
                    value={form.iva}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, iva: e.target.value }))
                    }
                    className={recipeFormFieldClass}
                  />
                </div>
                <label className="flex items-center gap-2 sm:col-span-2">
                  <Checkbox
                    checked={form.isActive}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, isActive: v === true }))
                    }
                  />
                  <span className="text-sm text-foreground">Receta activa</span>
                </label>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <RecipeIngredientEditor
                  lines={form.ingredients}
                  options={ingredientOptions}
                  disabled={formBusy}
                  onChange={(ingredients) =>
                    setForm((f) => ({ ...f, ingredients }))
                  }
                />
              </div>
            </div>
            <DialogFooter className={recipeDialogFooterClass}>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={formBusy}>
                {formBusy ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Guardando…
                  </>
                ) : editingId ? (
                  "Guardar cambios"
                ) : (
                  "Crear receta"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent
          className={recipeDialogSurfaceClass}
          data-rootsy-light-shell="true"
          showCloseButton
        >
          <DialogHeader className={recipeDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Eliminar receta
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Esta acción no se puede deshacer. Escribí{" "}
              <strong>{RECIPE_DELETE_CONFIRM_PHRASE}</strong> para confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className={recipeDialogBodyClass}>
            <p className="text-sm text-foreground">
              {deleteTarget ? `«${deleteTarget.name}»` : ""}
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={RECIPE_DELETE_CONFIRM_PHRASE}
              className={cn("mt-3", recipeFormFieldClass)}
            />
          </div>
          <DialogFooter className={recipeDialogFooterClass}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={
                deleteBusy || deleteConfirm !== RECIPE_DELETE_CONFIRM_PHRASE
              }
              onClick={() => void confirmDelete()}
            >
              {deleteBusy ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={categoriesOpen} onOpenChange={setCategoriesOpen}>
        <DialogContent
          className={recipeDialogSurfaceWideClass}
          data-rootsy-light-shell="true"
          showCloseButton
        >
          <DialogHeader className={recipeDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Categorías de recetas
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Organizá el menú de Mesas y Mostrador.
            </DialogDescription>
          </DialogHeader>
          <div className={recipeDialogBodyClass}>
            {canCreate ? (
              <div className="mb-4 flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nueva categoría"
                  className={recipeFormFieldClass}
                />
                <Button
                  type="button"
                  onClick={() => void handleCreateCategory()}
                  disabled={categoryBusy || !newCategoryName.trim()}
                >
                  Agregar
                </Button>
              </div>
            ) : null}
            <RecipeCategoriesMenuBoard
              categories={categories}
              canUpdate={canUpdate}
              canDelete={canDelete}
              editingCategoryId={editingCategoryId}
              editingCategoryName={editingCategoryName}
              categorySaveBusy={categoryBusy}
              onStartEdit={(c) => {
                setEditingCategoryId(c.id)
                setEditingCategoryName(c.name)
              }}
              onCancelEdit={() => {
                setEditingCategoryId(null)
                setEditingCategoryName("")
              }}
              onEditingNameChange={setEditingCategoryName}
              onSaveEdit={() => void handleSaveCategoryEdit()}
              onDelete={(id, name) => void handleDeleteCategory(id, name)}
              onLayoutChange={async (updates) => {
                setCategoryBusy(true)
                const res = await syncRecipeCategoryMenuLayout(popId, updates)
                setCategoryBusy(false)
                if (!res.success) setError(res.error)
                else await loadCategories()
              }}
            />
          </div>
          <DialogFooter className={recipeDialogFooterClass}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCategoriesOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DataWorkspaceLayout>
  )
}

export default withAuth(RecipesPage)
