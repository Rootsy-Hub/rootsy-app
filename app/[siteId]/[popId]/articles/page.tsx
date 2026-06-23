"use client"

import {
  createPopArticle,
  createPopCategory,
  deletePopArticle,
  deletePopCategory,
  getPopArticleCategories,
  getPopArticlesTable,
  updatePopArticle,
  updatePopCategory,
  type ArticleCategoryOption,
  type ArticleTableRow,
} from "@/app/[siteId]/[popId]/articles/actions"
import { ARTICLE_DELETE_CONFIRM_PHRASE } from "@/app/[siteId]/[popId]/articles/articleConstants"
import {
  ARTICLE_TABLE_PAGE_SIZES,
  mergeArticlesWorkspaceUrl,
  parseArticlesWorkspaceUrl,
} from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import { DataWorkspaceListTableShell } from "@/components/data-workspace/DataWorkspaceListTableShell"
import {
  DataWorkspaceTableIconAction,
  DataWorkspaceTableMoney,
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
  toolbarBlockLabelClass,
  workspaceDataTableClassName,
  workspaceTableBodyRowClassNames,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceSectionMenu } from "@/components/layouts/DataWorkspaceSectionMenu"
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
  Table,
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
  Pencil,
  Plus,
  Search,
  Table2,
  Tag,
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

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(n)
}

const articlesSk = {
  bar: "animate-pulse rounded-[3px] bg-muted-foreground/12 dark:bg-muted-foreground/[0.14]",
  barSm:
    "animate-pulse rounded-[3px] bg-muted-foreground/8 dark:bg-muted-foreground/11",
  pill: "animate-pulse rounded-full bg-muted-foreground/12 dark:bg-muted-foreground/[0.14]",
  box: "animate-pulse rounded-sm bg-muted-foreground/10 dark:bg-muted-foreground/[0.12]",
} as const

function ArticlesTableSkeletonRows({
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
          key={`art-sk-${i}`}
          className={cn(
            "border-border/50",
            i % 2 === 0 ? "bg-white/30" : "bg-muted/25 dark:bg-muted/15",
          )}
          aria-hidden
        >
          <TableCell className="w-14 px-2 py-2 align-middle">
            <div className={cn("size-10 rounded-lg", articlesSk.box)} />
          </TableCell>
          <TableCell className="min-w-0 px-3 py-2.5 align-middle">
            <div className={cn("h-3.5 w-[72%] max-w-[11rem]", articlesSk.bar)} />
            <div
              className={cn(
                "mt-1.5 h-2.5 w-[45%] max-w-[7rem]",
                articlesSk.barSm,
              )}
            />
          </TableCell>
          <TableCell className="min-w-0 max-w-[10rem] px-3 py-2.5 align-middle">
            <div className={cn("h-3.5 w-[6rem]", articlesSk.bar)} />
          </TableCell>
          <TableCell className="w-[7.5rem] px-3 py-2.5 text-right align-middle tabular-nums">
            <div className={cn("ml-auto h-3.5 w-20", articlesSk.bar)} />
          </TableCell>
          <TableCell className="w-[7.5rem] px-3 py-2.5 text-right align-middle tabular-nums">
            <div className={cn("ml-auto h-3.5 w-20", articlesSk.bar)} />
          </TableCell>
          <TableCell className="w-[5rem] px-3 py-2.5 text-right align-middle tabular-nums">
            <div className={cn("ml-auto h-3.5 w-10", articlesSk.bar)} />
          </TableCell>
          <TableCell className="min-w-[6rem] px-3 py-2.5 align-middle">
            <div className={cn("inline-block h-5 w-16", articlesSk.pill)} />
          </TableCell>
          {hasActionsColumn ? (
            <TableCell className="w-[7.25rem] px-1 py-1.5 align-middle">
              <div className="flex items-center justify-end gap-0.5">
                <div
                  className={cn("size-8 shrink-0 rounded-md", articlesSk.box)}
                />
                <div
                  className={cn("size-8 shrink-0 rounded-md", articlesSk.box)}
                />
              </div>
            </TableCell>
          ) : null}
        </TableRow>
      ))}
    </>
  )
}

function ArticlesTableFooterSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4"
      aria-hidden
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <div
          className={cn(
            "h-3.5 w-52 max-w-[min(100%,20rem)]",
            articlesSk.bar,
          )}
        />
        <div className={cn("h-8 w-[4.25rem] rounded-md", articlesSk.box)} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
        <div className={cn("size-8 rounded-md", articlesSk.box)} />
        <div className={cn("h-8 w-36 rounded-md", articlesSk.box)} />
        <div className={cn("size-8 rounded-md", articlesSk.box)} />
      </div>
    </div>
  )
}

type ArticlesAppliedFilters = {
  soloActivos: boolean
  categoryId: string
}

const defaultArticlesFilters = (): ArticlesAppliedFilters => ({
  soloActivos: false,
  categoryId: "",
})

const VIEW_ITEMS = [{ id: "list", label: "Listado", icon: Table2 }] as const

const CREATION_NEW_ARTICLE = {
  id: "new-article",
  label: "Nuevo artículo",
  icon: Plus,
} as const

function ArticlesPage() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const workspaceParsed = useMemo(
    () => parseArticlesWorkspaceUrl(searchParams),
    [searchParams],
  )

  const replaceWorkspaceQuery = useCallback(
    (patch: Parameters<typeof mergeArticlesWorkspaceUrl>[1]) => {
      const qs = mergeArticlesWorkspaceUrl(searchParams, patch)
      const next = qs ? `${pathname}?${qs}` : pathname
      router.replace(next, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const [popName, setPopName] = useState("")
  const [articles, setArticles] = useState<ArticleTableRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [canCreate, setCanCreate] = useState(false)
  const [canPostInitialStock, setCanPostInitialStock] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [listFetching, setListFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchGenRef = useRef(0)

  const [searchInput, setSearchInput] = useState(workspaceParsed.q)
  const searchInputId = useId()
  const pageSizeLabelId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<ArticlesAppliedFilters>(
    defaultArticlesFilters,
  )
  const [filterCategoryList, setFilterCategoryList] = useState<
    ArticleCategoryOption[]
  >([])

  const [quickNewCategoryOpen, setQuickNewCategoryOpen] = useState(false)
  const [quickNewCategoryName, setQuickNewCategoryName] = useState("")
  const [quickNewCategorySaving, setQuickNewCategorySaving] = useState(false)
  const [quickNewCategoryBanner, setQuickNewCategoryBanner] = useState<
    string | null
  >(null)

  const [workspaceHeader, setWorkspaceHeader] = useState<{
    userFullName: string
    userImageUrl: string | null
    roleLabel: string
  } | null>(null)

  const [editRow, setEditRow] = useState<ArticleTableRow | null>(null)
  const [editCategories, setEditCategories] = useState<ArticleCategoryOption[]>(
    [],
  )
  const [editLoading, setEditLoading] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    salePrice: "",
    costPrice: "",
    iva: "",
    categoryId: "",
    isActive: true,
  })
  const [editBanner, setEditBanner] = useState<string | null>(null)

  const [deleteRow, setDeleteRow] = useState<ArticleTableRow | null>(null)
  const [deleteTyped, setDeleteTyped] = useState("")
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)

  const [createCategories, setCreateCategories] = useState<
    ArticleCategoryOption[]
  >([])
  const [createCatLoading, setCreateCatLoading] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    salePrice: "0",
    costPrice: "0",
    iva: "21",
    categoryId: "",
    isActive: true,
    initialStock: "",
  })

  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [categoriesRows, setCategoriesRows] = useState<ArticleCategoryOption[]>(
    [],
  )
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoriesBanner, setCategoriesBanner] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategorySaving, setNewCategorySaving] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  )
  const [editingCategoryName, setEditingCategoryName] = useState("")
  const [categorySaveBusy, setCategorySaveBusy] = useState(false)

  const sidebarActiveId =
    workspaceParsed.view === "new-article"
      ? CREATION_NEW_ARTICLE.id
      : workspaceParsed.view

  const createOpen = Boolean(
    canCreate && workspaceParsed.view === "new-article",
  )

  const fetchWorkspaceHeader = useCallback(async () => {
    if (!popId) return
    const head = await getWorkspaceHeaderForPop(popId)
    if (head.success) {
      setWorkspaceHeader({
        userFullName: head.userFullName,
        userImageUrl: head.userImageUrl,
        roleLabel: head.roleLabel,
      })
    } else {
      setWorkspaceHeader(null)
    }
  }, [popId])

  const fetchArticlesList = useCallback(async () => {
    if (!popId || !siteId) return
    const gen = ++fetchGenRef.current
    setListFetching(true)
    setError(null)
    try {
      const res = await getPopArticlesTable(popId, {
        page: workspaceParsed.page,
        pageSize: workspaceParsed.pageSize,
        search: workspaceParsed.q,
        soloActivos: workspaceParsed.soloActivos,
        categoryId: workspaceParsed.categoryId,
      })
      if (gen !== fetchGenRef.current) return
      if (!res.success) {
        setError(res.error || "Error al cargar")
        setArticles([])
        setTotalCount(0)
        setCanCreate(false)
        setCanPostInitialStock(false)
        setCanUpdate(false)
        setCanDelete(false)
        if (res.redirect) {
          setTimeout(() => routerRef.current.push(res.redirect!), 1200)
        }
        return
      }
      setArticles(res.articles)
      setTotalCount(res.totalCount)
      setPopName(res.popName)
      setCanCreate(res.canCreate)
      setCanPostInitialStock(res.canPostInitialStock)
      setCanUpdate(res.canUpdate)
      setCanDelete(res.canDelete)
      setError(null)
      if (res.page !== workspaceParsed.page) {
        replaceWorkspaceQuery({ page: res.page })
      }
    } catch {
      if (gen === fetchGenRef.current) {
        setError("Error inesperado")
      }
    } finally {
      if (gen === fetchGenRef.current) {
        setListFetching(false)
      }
    }
  }, [popId, siteId, workspaceParsed, replaceWorkspaceQuery])

  useEffect(() => {
    setPopName("")
    setArticles([])
    setTotalCount(0)
  }, [popId])

  useEffect(() => {
    setSearchInput(workspaceParsed.q)
  }, [workspaceParsed.q])

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === workspaceParsed.q.trim()) return
      replaceWorkspaceQuery({ q: next, page: 1 })
    }, 400)
    return () => window.clearTimeout(t)
  }, [searchInput, workspaceParsed.q, replaceWorkspaceQuery])

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

  useEffect(() => {
    if (!popId || !siteId) return
    let cancelled = false
    ;(async () => {
      const res = await getPopArticleCategories(popId)
      if (cancelled) return
      if (res.success) {
        setFilterCategoryList(res.categories)
      } else {
        setFilterCategoryList([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [popId, siteId])

  useEffect(() => {
    if (!popId || !siteId) return
    void fetchWorkspaceHeader()
  }, [popId, siteId, fetchWorkspaceHeader])

  useEffect(() => {
    if (!popId || !siteId) {
      setListFetching(false)
      setError("ID de POP no encontrado")
      return
    }
    void fetchArticlesList()
  }, [popId, siteId, fetchArticlesList])

  useEffect(() => {
    if (workspaceParsed.view !== "new-article" || canCreate) return
    replaceWorkspaceQuery({ view: "list" })
  }, [workspaceParsed.view, canCreate, replaceWorkspaceQuery])

  useEffect(() => {
    if (!createOpen || !popId) return
    setCreateBanner(null)
    setCreateForm({
      name: "",
      description: "",
      imageUrl: "",
      salePrice: "0",
      costPrice: "0",
      iva: "21",
      categoryId: "",
      isActive: true,
      initialStock: "",
    })
  }, [createOpen, popId])

  useEffect(() => {
    if (!createOpen || !popId) return
    let cancelled = false
    ;(async () => {
      setCreateCatLoading(true)
      const catRes = await getPopArticleCategories(popId)
      if (cancelled) return
      setCreateCatLoading(false)
      if (catRes.success) {
        setCreateCategories(catRes.categories)
      } else {
        setCreateBanner(catRes.error)
        setCreateCategories([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [createOpen, popId])

  const openEdit = async (row: ArticleTableRow) => {
    if (!popId || !siteId) return
    setEditBanner(null)
    setEditRow(row)
    setEditForm({
      name: row.name,
      description: row.description,
      imageUrl: row.imageUrl ?? "",
      salePrice: String(row.salePrice),
      costPrice: String(row.costPrice),
      iva: String(row.iva),
      categoryId: row.categoryId,
      isActive: row.isActive,
    })
    setEditLoading(true)
    const catRes = await getPopArticleCategories(popId)
    setEditLoading(false)
    if (catRes.success) {
      setEditCategories(catRes.categories)
    } else {
      setEditBanner(catRes.error)
      setEditCategories([])
    }
  }

  const closeEdit = () => {
    setEditRow(null)
    setEditBanner(null)
  }

  const loadModalCategories = useCallback(async () => {
    if (!popId || !siteId) return
    setCategoriesLoading(true)
    setCategoriesBanner(null)
    const res = await getPopArticleCategories(popId)
    setCategoriesLoading(false)
    if (res.success) {
      setCategoriesRows(res.categories)
    } else {
      setCategoriesBanner(res.error)
      setCategoriesRows([])
    }
  }, [popId, siteId])

  const openCreate = useCallback(() => {
    if (!canCreate) return
    setCreateBanner(null)
    replaceWorkspaceQuery({ view: "new-article" })
  }, [canCreate, replaceWorkspaceQuery])

  const closeCreate = useCallback(() => {
    replaceWorkspaceQuery({ view: "list" })
    setCreateBanner(null)
  }, [replaceWorkspaceQuery])

  const handleSidebarSelect = useCallback(
    (id: string) => {
      if (id === CREATION_NEW_ARTICLE.id) {
        openCreate()
        return
      }
      replaceWorkspaceQuery({ view: "list" })
    },
    [openCreate, replaceWorkspaceQuery],
  )

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId) return
    setCreateSaving(true)
    setCreateBanner(null)
    const initialTrim = createForm.initialStock.trim()
    const initialNum =
      initialTrim === "" ? null : parseInt(initialTrim, 10)
    const res = await createPopArticle(popId, {
      name: createForm.name,
      description: createForm.description,
      imageUrl: createForm.imageUrl,
      salePrice: Number(createForm.salePrice),
      costPrice: Number(createForm.costPrice),
      iva: Number(createForm.iva),
      categoryId: createForm.categoryId,
      isActive: createForm.isActive,
      siteId,
      initialStockQuantity:
        initialNum != null && Number.isFinite(initialNum) && initialNum > 0
          ? initialNum
          : null,
    })
    setCreateSaving(false)
    if (!res.success) {
      setCreateBanner(res.error)
      return
    }
    closeCreate()
    await fetchArticlesList()
  }

  const submitNewCategory = async () => {
    if (!popId || !siteId || !newCategoryName.trim()) return
    setNewCategorySaving(true)
    setCategoriesBanner(null)
    const res = await createPopCategory(popId, newCategoryName)
    setNewCategorySaving(false)
    if (!res.success) {
      setCategoriesBanner(res.error)
      return
    }
    setNewCategoryName("")
    await loadModalCategories()
    const fresh = await getPopArticleCategories(popId)
    if (fresh.success) {
      setFilterCategoryList(fresh.categories)
    }
  }

  const submitQuickNewCategory = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId || !quickNewCategoryName.trim()) return
    setQuickNewCategorySaving(true)
    setQuickNewCategoryBanner(null)
    const res = await createPopCategory(popId, quickNewCategoryName)
    setQuickNewCategorySaving(false)
    if (!res.success) {
      setQuickNewCategoryBanner(res.error)
      return
    }
    setQuickNewCategoryOpen(false)
    setQuickNewCategoryName("")
    const fresh = await getPopArticleCategories(popId)
    if (fresh.success) {
      setFilterCategoryList(fresh.categories)
    }
    await fetchArticlesList()
  }

  const startEditCategory = (c: ArticleCategoryOption) => {
    setEditingCategoryId(c.id)
    setEditingCategoryName(c.name)
    setCategoriesBanner(null)
  }

  const cancelEditCategory = () => {
    setEditingCategoryId(null)
    setEditingCategoryName("")
  }

  const saveEditCategory = async () => {
    if (!popId || !siteId || !editingCategoryId) return
    setCategorySaveBusy(true)
    setCategoriesBanner(null)
    const res = await updatePopCategory(
      popId,
      editingCategoryId,
      editingCategoryName,
    )
    setCategorySaveBusy(false)
    if (!res.success) {
      setCategoriesBanner(res.error)
      return
    }
    cancelEditCategory()
    await loadModalCategories()
    const fresh = await getPopArticleCategories(popId)
    if (fresh.success) {
      setFilterCategoryList(fresh.categories)
    }
  }

  const removeCategory = async (id: string, label: string) => {
    if (!popId || !siteId) return
    if (
      !window.confirm(
        `¿Eliminar la categoría "${label}"? Los artículos que la usen pueden fallar si la base no lo permite.`,
      )
    ) {
      return
    }
    setCategoriesBanner(null)
    const res = await deletePopCategory(popId, id)
    if (!res.success) {
      setCategoriesBanner(res.error)
      return
    }
    await loadModalCategories()
    const fresh = await getPopArticleCategories(popId)
    if (fresh.success) {
      setFilterCategoryList(fresh.categories)
    }
  }

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId || !editRow) return
    setEditSaving(true)
    setEditBanner(null)
    const res = await updatePopArticle(popId, editRow.id, {
      name: editForm.name,
      description: editForm.description,
      imageUrl: editForm.imageUrl,
      salePrice: Number(editForm.salePrice),
      costPrice: Number(editForm.costPrice),
      iva: Number(editForm.iva),
      categoryId: editForm.categoryId,
      isActive: editForm.isActive,
    })
    setEditSaving(false)
    if (!res.success) {
      setEditBanner(res.error)
      return
    }
    closeEdit()
    await fetchArticlesList()
  }

  const openDelete = (row: ArticleTableRow) => {
    setDeleteBanner(null)
    setDeleteTyped("")
    setDeleteRow(row)
  }

  const closeDelete = () => {
    setDeleteRow(null)
    setDeleteTyped("")
    setDeleteBanner(null)
  }

  const submitDelete = async () => {
    if (!popId || !siteId || !deleteRow) return
    setDeleteBusy(true)
    setDeleteBanner(null)
    const res = await deletePopArticle(popId, deleteRow.id, deleteTyped)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteBanner(res.error)
      return
    }
    closeDelete()
    await fetchArticlesList()
  }

  const emptyCols = 7 + (canUpdate || canDelete ? 1 : 0)

  const creationItems = useMemo(
    () => (canCreate ? [CREATION_NEW_ARTICLE] : []),
    [canCreate],
  )

  const totalPages = useMemo(
    () =>
      Math.max(
        1,
        Math.ceil(totalCount / Math.max(1, workspaceParsed.pageSize)),
      ),
    [totalCount, workspaceParsed.pageSize],
  )

  const currentPage = workspaceParsed.page
  const pageRows = articles

  const rangeLabel = useMemo(() => {
    if (totalCount === 0) return { start: 0, end: 0 }
    const ps = workspaceParsed.pageSize
    const start = (currentPage - 1) * ps + 1
    const end = Math.min(currentPage * ps, totalCount)
    return { start, end }
  }, [currentPage, workspaceParsed.pageSize, totalCount])

  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages, currentPage),
    [totalPages, currentPage],
  )

  const hasFilterChips =
    workspaceParsed.q.trim() !== "" ||
    workspaceParsed.soloActivos ||
    workspaceParsed.categoryId.trim() !== ""

  const skeletonRowCount = Math.min(
    12,
    Math.max(5, workspaceParsed.pageSize),
  )

  const categoryLabelForChip = useMemo(() => {
    const id = workspaceParsed.categoryId.trim()
    if (!id) return ""
    return filterCategoryList.find((c) => c.id === id)?.name ?? ""
  }, [filterCategoryList, workspaceParsed.categoryId])

  const modalFiltersActiveCount = useMemo(() => {
    let count = 0
    if (workspaceParsed.soloActivos) count++
    if (workspaceParsed.categoryId.trim()) count++
    return count
  }, [workspaceParsed.soloActivos, workspaceParsed.categoryId])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (workspaceParsed.q.trim()) count++
    count += modalFiltersActiveCount
    return count
  }, [workspaceParsed.q, modalFiltersActiveCount])

  const resultsSummary = useMemo(() => {
    if (listFetching && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "artículo" : "artículos"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [listFetching, totalCount])

  const clearAllFilters = useCallback(() => {
    setSearchInput("")
    replaceWorkspaceQuery({
      q: "",
      soloActivos: false,
      categoryId: "",
      page: 1,
    })
    searchInputRef.current?.focus()
  }, [replaceWorkspaceQuery])

  const sectionActiveId = sidebarActiveId

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">ID de POP no encontrado</p>
      </div>
    )
  }

  return (
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title="Stock"
      headerVariant="dark"
      contentFlush
      sidebarCollapsible={false}
      loading={!popName && listFetching}
      userName={workspaceHeader?.userFullName}
      userAvatarSrc={workspaceHeader?.userImageUrl ?? undefined}
      userRoleLabel={workspaceHeader?.roleLabel}
      pillLabel="Catálogo"
      mainClassName="min-h-0 overflow-hidden"
      headerActions={
        <>
          {canCreate ? (
            <button
              type="button"
              onClick={() => {
                setQuickNewCategoryBanner(null)
                setQuickNewCategoryName("")
                setQuickNewCategoryOpen(true)
              }}
              className="group inline-flex size-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Nueva categoría"
              title="Nueva categoría"
            >
              <Tag className="size-4.5" aria-hidden />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setCategoriesOpen(true)
              void loadModalCategories()
            }}
            className="group inline-flex size-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Gestionar categorías"
            title="Categorías"
          >
            <FolderTree className="size-4.5" aria-hidden />
          </button>
        </>
      }
      sectionMenu={
        <DataWorkspaceSectionMenu
          headerVariant="dark"
          creationItems={creationItems}
          viewItems={VIEW_ITEMS}
          activeId={sectionActiveId}
          onSelect={handleSidebarSelect}
          creationSectionLabel="Nuevo"
          viewsSectionLabel="En esta sección"
        />
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
        {workspaceParsed.view === "list" ||
        workspaceParsed.view === "new-article" ? (
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
                        soloActivos: workspaceParsed.soloActivos,
                        categoryId: workspaceParsed.categoryId,
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
                      aria-label="Buscar artículos"
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
                    {workspaceParsed.q.trim() ? (
                      <Badge variant="secondary" className={lightFilterChipClass}>
                        <span className="truncate">
                          Buscar: «{workspaceParsed.q.trim()}»
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 shrink-0"
                          onClick={() =>
                            replaceWorkspaceQuery({ q: "", page: 1 })
                          }
                          aria-label="Quitar búsqueda"
                        >
                          <X className="size-3" />
                        </Button>
                      </Badge>
                    ) : null}
                    {workspaceParsed.soloActivos ? (
                      <Badge variant="secondary" className={lightFilterChipClass}>
                        Solo activos
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 shrink-0"
                          onClick={() =>
                            replaceWorkspaceQuery({
                              soloActivos: false,
                              page: 1,
                            })
                          }
                          aria-label="Quitar filtro solo activos"
                        >
                          <X className="size-3" />
                        </Button>
                      </Badge>
                    ) : null}
                    {workspaceParsed.categoryId.trim() ? (
                      <Badge variant="secondary" className={lightFilterChipClass}>
                        <span className="truncate">
                          Categoría:{" "}
                          {categoryLabelForChip ||
                            workspaceParsed.categoryId}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 shrink-0"
                          onClick={() =>
                            replaceWorkspaceQuery({
                              categoryId: "",
                              page: 1,
                            })
                          }
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
                    soloActivos: workspaceParsed.soloActivos,
                    categoryId: workspaceParsed.categoryId,
                  })
                }
                setFiltersModalOpen(open)
              }}
            >
              <DialogContent className="gap-0 sm:max-w-md" showCloseButton>
                <DialogHeader>
                  <DialogTitle>Filtros</DialogTitle>
                  <DialogDescription>
                    Combinan con la búsqueda. El listado se pagina en el
                    servidor.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-1 py-0.5 hover:bg-muted/50">
                    <Checkbox
                      checked={draftFilters.soloActivos}
                      onCheckedChange={(c) =>
                        setDraftFilters((f) => ({
                          ...f,
                          soloActivos: c === true,
                        }))
                      }
                      aria-label="Solo artículos activos"
                    />
                    <span className="text-sm">Solo artículos activos</span>
                  </label>
                  <div className="space-y-2">
                    <Label htmlFor="articles-filter-category">Categoría</Label>
                    <Select
                      value={
                        draftFilters.categoryId.trim() || "__all__"
                      }
                      onValueChange={(v) =>
                        setDraftFilters((f) => ({
                          ...f,
                          categoryId: v === "__all__" ? "" : v,
                        }))
                      }
                    >
                      <SelectTrigger
                        id="articles-filter-category"
                        className="bg-background"
                      >
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Todas</SelectItem>
                        {filterCategoryList.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name || "—"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDraftFilters(defaultArticlesFilters())}
                  >
                    Restablecer
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      replaceWorkspaceQuery({
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

            <Dialog
              open={quickNewCategoryOpen}
              onOpenChange={(o) => {
                setQuickNewCategoryOpen(o)
                if (!o) {
                  setQuickNewCategoryBanner(null)
                  setQuickNewCategoryName("")
                }
              }}
            >
              <DialogContent
                className="sm:max-w-md"
                showCloseButton
                data-rootsy-light-shell="true"
              >
                <DialogHeader>
                  <DialogTitle>Nueva categoría</DialogTitle>
                </DialogHeader>
                {quickNewCategoryBanner ? (
                  <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {quickNewCategoryBanner}
                  </p>
                ) : null}
                <form
                  className="space-y-4 py-2"
                  onSubmit={(e) => void submitQuickNewCategory(e)}
                >
                  <div className="space-y-2">
                    <Label htmlFor="quick-new-cat-name">Nombre</Label>
                    <Input
                      id="quick-new-cat-name"
                      value={quickNewCategoryName}
                      onChange={(e) => setQuickNewCategoryName(e.target.value)}
                      placeholder="Nombre de la categoría"
                      className="bg-background"
                      autoFocus
                    />
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setQuickNewCategoryOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        quickNewCategorySaving || !quickNewCategoryName.trim()
                      }
                    >
                      {quickNewCategorySaving ? "Creando…" : "Crear"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <DataWorkspaceListTableShell
              variant="flush"
              footer={
                <DataWorkspaceListPaginationFooter
                  variant="dark"
                  listFetching={listFetching}
                  totalCount={totalCount}
                  rangeStart={rangeLabel.start}
                  rangeEnd={rangeLabel.end}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={workspaceParsed.pageSize}
                  pageSizeOptions={ARTICLE_TABLE_PAGE_SIZES}
                  paginationItems={paginationItems}
                  onPageChange={(p) => replaceWorkspaceQuery({ page: p })}
                  onPageSizeChange={(ps) =>
                    replaceWorkspaceQuery({ pageSize: ps, page: 1 })
                  }
                  pageSizeLabelId={pageSizeLabelId}
                  loadingSlot={<ArticlesTableFooterSkeleton />}
                />
              }
            >
              <table
                className={workspaceDataTableClassName}
                aria-busy={listFetching}
              >
                <TableHeader>
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableHead className={cn(lightTableThClass, "w-14 text-left")}>
                      <span className="sr-only">Foto</span>
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "min-w-[11rem] text-left")}>
                      Artículo
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "w-[11%] text-left")}>
                      Categoría
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "w-[9%] text-right")}>
                      Venta
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "w-[9%] text-right")}>
                      Costo
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "w-[6%] text-right")}>
                      IVA %
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "w-[8%] text-left")}>
                      Estado
                    </TableHead>
                    {canUpdate || canDelete ? (
                      <TableHead
                        className={cn(lightTableThClass, "w-[6.5rem] text-right")}
                      >
                        <span className="sr-only">Acciones</span>
                      </TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listFetching ? (
                    <ArticlesTableSkeletonRows
                      rowCount={skeletonRowCount}
                      hasActionsColumn={Boolean(canUpdate || canDelete)}
                    />
                  ) : totalCount === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={emptyCols}
                        className="py-12 text-center text-muted-foreground"
                      >
                        No hay artículos que coincidan con la búsqueda o los
                        filtros, o no tenés permiso de lectura.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageRows.map((a, i) => (
                      <TableRow
                        key={a.id}
                        className={workspaceTableBodyRowClassNames(i)}
                      >
                        <TableCell className="w-14 px-2 py-2 align-middle">
                          <DataWorkspaceTableThumbnail
                            src={a.imageUrl}
                            alt={a.name || "Artículo"}
                            size="md"
                          />
                        </TableCell>
                        <TableCell className="min-w-0 px-3 py-2.5 align-middle">
                          <p className="truncate font-medium text-foreground">
                            {a.name || "—"}
                          </p>
                          {a.description.trim() ? (
                            <p
                              className="mt-0.5 truncate text-xs text-muted-foreground"
                              title={a.description}
                            >
                              {a.description}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="min-w-0 px-3 py-2.5 text-muted-foreground">
                          {a.categoryName}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-right align-middle">
                          <DataWorkspaceTableMoney>
                            {formatMoney(a.salePrice)}
                          </DataWorkspaceTableMoney>
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-right align-middle">
                          <DataWorkspaceTableMoney muted>
                            {formatMoney(a.costPrice)}
                          </DataWorkspaceTableMoney>
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-right align-middle">
                          <DataWorkspaceTableMoney muted>
                            {a.iva}
                          </DataWorkspaceTableMoney>
                        </TableCell>
                        <TableCell className="px-3 py-2.5">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "font-normal",
                              a.isActive
                                ? "border-primary/25 bg-primary/10 text-forest"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {a.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        {canUpdate || canDelete ? (
                          <TableCell className="px-1 py-1.5 align-middle">
                            <div className="flex items-center justify-end gap-0.5">
                              {canUpdate ? (
                                <DataWorkspaceTableIconAction
                                  label={`Editar ${a.name || "artículo"}`}
                                  icon={Pencil}
                                  onClick={() => void openEdit(a)}
                                />
                              ) : null}
                              {canDelete ? (
                                <DataWorkspaceTableIconAction
                                  label={`Eliminar ${a.name || "artículo"}`}
                                  icon={Trash2}
                                  destructive
                                  onClick={() => openDelete(a)}
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
            </DataWorkspaceListTableShell>
          </div>
        ) : null}

      <Dialog open={editRow !== null} onOpenChange={(o) => !o && closeEdit()}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="max-h-[min(90vh,640px)] overflow-y-auto border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Editar artículo</DialogTitle>
          </DialogHeader>
          {editBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {editBanner}
            </p>
          ) : null}
          {editLoading ? (
            <p className="text-sm text-muted-foreground">
              Cargando categorías…
            </p>
          ) : (
            <form className="space-y-4" onSubmit={(e) => void submitEdit(e)}>
              <div className="space-y-2">
                <Label htmlFor="art-name">Nombre</Label>
                <Input
                  id="art-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="art-desc">Descripción</Label>
                <Textarea
                  id="art-desc"
                  rows={3}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="art-image-url">URL de imagen (opcional)</Label>
                <Input
                  id="art-image-url"
                  type="url"
                  inputMode="url"
                  placeholder="https://…"
                  value={editForm.imageUrl}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, imageUrl: e.target.value }))
                  }
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="art-cat">Categoría</Label>
                <select
                  id="art-cat"
                  value={editForm.categoryId}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, categoryId: e.target.value }))
                  }
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Elegir…</option>
                  {editCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="art-price">Precio venta</Label>
                  <Input
                    id="art-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={editForm.salePrice}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, salePrice: e.target.value }))
                    }
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="art-cost">Precio de costo</Label>
                  <Input
                    id="art-cost"
                    type="number"
                    min={0}
                    step="0.01"
                    value={editForm.costPrice}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, costPrice: e.target.value }))
                    }
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="art-iva">IVA %</Label>
                  <Input
                    id="art-iva"
                    type="number"
                    min={0}
                    step="1"
                    value={editForm.iva}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, iva: e.target.value }))
                    }
                    required
                    className="bg-background"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  className="size-4 rounded border-input"
                />
                Activo
              </label>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={closeEdit}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={editSaving}>
                  {editSaving ? "Guardando…" : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteRow !== null} onOpenChange={(o) => !o && closeDelete()}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>¿Eliminar artículo?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Vas a borrar{" "}
            <strong className="text-foreground">
              {deleteRow?.name || "este artículo"}
            </strong>
            . Esta acción no se puede deshacer desde acá.
          </p>
          <p className="text-sm text-muted-foreground">
            Para confirmar, escribí{" "}
            <strong className="text-foreground">
              {ARTICLE_DELETE_CONFIRM_PHRASE}
            </strong>{" "}
            abajo.
          </p>
          {deleteBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {deleteBanner}
            </p>
          ) : null}
          <Input
            autoComplete="off"
            value={deleteTyped}
            onChange={(e) => setDeleteTyped(e.target.value)}
            placeholder={ARTICLE_DELETE_CONFIRM_PHRASE}
            className="bg-background"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeDelete}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={
                deleteBusy ||
                deleteTyped.trim() !== ARTICLE_DELETE_CONFIRM_PHRASE
              }
              onClick={() => void submitDelete()}
            >
              {deleteBusy ? "Eliminando…" : "Eliminar definitivamente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={(o) => !o && closeCreate()}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="max-h-[min(90vh,640px)] overflow-y-auto border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Nuevo artículo</DialogTitle>
          </DialogHeader>
          {createBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {createBanner}
            </p>
          ) : null}
          {createCatLoading ? (
            <p className="text-sm text-muted-foreground">
              Cargando categorías…
            </p>
          ) : (
            <form className="space-y-4" onSubmit={(e) => void submitCreate(e)}>
              <div className="space-y-2">
                <Label htmlFor="create-art-name">Nombre</Label>
                <Input
                  id="create-art-name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-art-desc">Descripción</Label>
                <Textarea
                  id="create-art-desc"
                  rows={3}
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-art-image-url">URL de imagen (opcional)</Label>
                <Input
                  id="create-art-image-url"
                  type="url"
                  inputMode="url"
                  placeholder="https://…"
                  value={createForm.imageUrl}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, imageUrl: e.target.value }))
                  }
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-art-cat">Categoría</Label>
                <select
                  id="create-art-cat"
                  value={createForm.categoryId}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      categoryId: e.target.value,
                    }))
                  }
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Elegir…</option>
                  {createCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="create-art-price">Precio venta</Label>
                  <Input
                    id="create-art-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={createForm.salePrice}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        salePrice: e.target.value,
                      }))
                    }
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-art-cost">Precio de costo</Label>
                  <Input
                    id="create-art-cost"
                    type="number"
                    min={0}
                    step="0.01"
                    value={createForm.costPrice}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        costPrice: e.target.value,
                      }))
                    }
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-art-iva">IVA %</Label>
                  <Input
                    id="create-art-iva"
                    type="number"
                    min={0}
                    step="1"
                    value={createForm.iva}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, iva: e.target.value }))
                    }
                    required
                    className="bg-background"
                  />
                </div>
              </div>
              {canPostInitialStock ? (
                <div className="space-y-2">
                  <Label htmlFor="create-art-initial-stock">
                    Stock inicial (opcional)
                  </Label>
                  <Input
                    id="create-art-initial-stock"
                    type="number"
                    min={0}
                    max={10000}
                    step={1}
                    inputMode="numeric"
                    placeholder="Vacío = sin movimiento de stock"
                    value={createForm.initialStock}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        initialStock: e.target.value,
                      }))
                    }
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Si indicás una cantidad, se registra el movimiento tipo saldo inicial y el
                    asiento contable (Mercaderías / otros ingresos) usando el precio de costo.
                  </p>
                </div>
              ) : null}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={createForm.isActive}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      isActive: e.target.checked,
                    }))
                  }
                  className="size-4 rounded border-input"
                />
                Activo
              </label>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={closeCreate}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createSaving}>
                  {createSaving ? "Creando…" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={categoriesOpen}
        onOpenChange={(o) => {
          setCategoriesOpen(o)
          if (!o) {
            setCategoriesBanner(null)
            cancelEditCategory()
            setNewCategoryName("")
          }
        }}
      >
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="max-h-[min(90vh,560px)] overflow-y-auto border-border bg-card text-foreground sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>Categorías</DialogTitle>
          </DialogHeader>
          {categoriesBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {categoriesBanner}
            </p>
          ) : null}
          {canCreate ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="new-cat-name">Nueva categoría</Label>
                <Input
                  id="new-cat-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nombre"
                  className="bg-background"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      void submitNewCategory()
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                disabled={newCategorySaving || !newCategoryName.trim()}
                onClick={() => void submitNewCategory()}
              >
                {newCategorySaving ? "Agregando…" : "Agregar"}
              </Button>
            </div>
          ) : null}
          {categoriesLoading ? (
            <p className="text-sm text-muted-foreground">
              Cargando categorías…
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold text-foreground">
                      Nombre
                    </TableHead>
                    {canUpdate || canDelete ? (
                      <TableHead className="text-right font-semibold text-foreground">
                        Acciones
                      </TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoriesRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={canUpdate || canDelete ? 2 : 1}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        No hay categorías cargadas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categoriesRows.map((c) => (
                      <TableRow key={c.id} className="border-border/80">
                        <TableCell className="font-medium text-foreground">
                          {editingCategoryId === c.id ? (
                            <Input
                              value={editingCategoryName}
                              onChange={(e) =>
                                setEditingCategoryName(e.target.value)
                              }
                              className="bg-background"
                              autoFocus
                            />
                          ) : (
                            c.name || "—"
                          )}
                        </TableCell>
                        {canUpdate || canDelete ? (
                          <TableCell className="text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              {editingCategoryId === c.id ? (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelEditCategory}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    disabled={
                                      categorySaveBusy ||
                                      !editingCategoryName.trim()
                                    }
                                    onClick={() => void saveEditCategory()}
                                  >
                                    {categorySaveBusy ? "Guardando…" : "Guardar"}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  {canUpdate ? (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-primary hover:bg-primary/10 hover:text-forest"
                                      onClick={() => startEditCategory(c)}
                                    >
                                      Editar
                                    </Button>
                                  ) : null}
                                  {canDelete ? (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:bg-destructive/10"
                                      onClick={() =>
                                        void removeCategory(c.id, c.name)
                                      }
                                    >
                                      Eliminar
                                    </Button>
                                  ) : null}
                                </>
                              )}
                            </div>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </DataWorkspaceLayout>
  )
}

export default withAuth(ArticlesPage)
