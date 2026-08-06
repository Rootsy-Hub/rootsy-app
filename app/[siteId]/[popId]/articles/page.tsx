"use client"

import {
  defaultArticleCatalogExtraFormState,
  type ArticleCatalogExtraFormState,
} from "@/app/[siteId]/[popId]/articles/ArticleCatalogExtraFields"
import { ArticleDeleteDialog } from "@/app/[siteId]/[popId]/articles/ArticleDeleteDialog"
import { ArticleCategoriesDialog } from "@/app/[siteId]/[popId]/articles/ArticleCategoriesDialog"
import { ArticleCategoryDeleteDialog } from "@/app/[siteId]/[popId]/articles/ArticleCategoryDeleteDialog"
import { ArticleItemKindToolbarFilter, articleItemKindFilterToQuery, resolveArticleItemKindFilterId } from "@/app/[siteId]/[popId]/articles/ArticleItemKindToolbarFilter"
import {
  createPopArticle,
  createPopCategory,
  deletePopArticle,
  deletePopCategory,
  getPopArticleCategories,
  getPopCategoryArticleCount,
  getPopArticleSupplierOptions,
  getPopArticlesTable,
  syncPopCategorySaleLayout,
  updatePopArticle,
  updatePopCategory,
  type ArticleCategoryOption,
  type CategoryLayoutUpdate,
  type ArticleTableRow,
} from "@/app/[siteId]/[popId]/articles/actions"
import {
  parseArticleItemFormState,
  type ArticleItemFormState,
} from "@/app/[siteId]/[popId]/articles/ArticleItemFormFields"
import { ArticleUpsertDialog } from "@/app/[siteId]/[popId]/articles/ArticleUpsertDialog"
import type { ArticleUpsertFormState } from "@/app/[siteId]/[popId]/articles/ArticleUpsertFormFields"
import { ArticlesFiltersDialog } from "@/app/[siteId]/[popId]/articles/ArticlesFiltersDialog"
import { ArticlesTableDetailDialog } from "@/app/[siteId]/[popId]/articles/ArticlesTableDetailDialog"
import { ArticleImagePreviewDialog } from "@/app/[siteId]/[popId]/articles/ArticleImagePreviewDialog"
import {
  ArticleTableArticleCell,
  ArticleTableCategoryCell,
  ArticleTableDetailCell,
  ArticleTableImageCell,
  ArticleTableStockCell,
  articleTableArticleColumnClass,
  articleTableDetailColumnClass,
} from "@/app/[siteId]/[popId]/articles/articlesTableCells"
import {
  ARTICLE_TABLE_PAGE_SIZES,
  articlesModalFiltersFromWorkspace,
  defaultArticlesModalFilters,
  mergeArticlesWorkspaceUrl,
  parseArticlesWorkspaceUrl,
  type ArticleTableSortKey,
  type ArticlesModalFilters,
} from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
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
import {
  workspaceTableLayoutClassName,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutActionsBodyCellClass,
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellStackClass,
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
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { articlesSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import {
  TableBody,
  TableCell,
} from "@/components/ui/table"
import withAuth from "@/hoc/withAuth"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import {
  DEFAULT_ARTICLE_IVA_ALICUOTA_ID,
  parseArticleIvaFromSelect,
  resolveArticleIvaSelectValue,
} from "@/lib/articleIva"
import { cn } from "@/lib/utils"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
} from "@/lib/workspaceTableSort"
import {
  formatMoneyInputForField,
  parseMoneyInput,
} from "@/lib/moneyInput"
import {
  ARTICLE_ITEM_KIND_STOCK_LABEL,
  type ArticleItemKind,
  defaultUnitForKind,
  unitOfMeasureToFormState,
} from "@/lib/articleItemKind"
import {
  articleHasCatalogDiscount,
  effectiveArticleSalePrice,
  parseArticleDiscountInput,
} from "@/lib/articleDiscount"
import {
  FolderTree,
  Pencil,
  Plus,
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

type ArticleFormState = ArticleUpsertFormState

function defaultCreateFormState(): ArticleFormState {
  return {
    name: "",
    description: "",
    imageUrl: "",
    sku: "",
    barcode: "",
    salePrice: formatMoneyInputForField(0),
    costPrice: formatMoneyInputForField(0),
    iva: String(DEFAULT_ARTICLE_IVA_ALICUOTA_ID),
    categoryId: "",
    isActive: true,
    allowNegativeStock: false,
    initialStock: "",
    itemKind: "merchandise",
    ...defaultItemFormFields("merchandise"),
    ...defaultArticleCatalogExtraFormState(),
  }
}

function catalogFieldsFromRow(row: ArticleTableRow): ArticleCatalogExtraFormState {
  return {
    brand: row.brand,
    discountMode: row.discountMode ?? "",
    discountValue:
      row.discountValue != null ? String(row.discountValue) : "",
    supplierIds: row.suppliers.map((s) => s.id),
  }
}

function parseCatalogFieldsForSubmit(form: ArticleFormState):
  | {
      brand: string
      discountMode: ReturnType<typeof parseArticleDiscountInput>["discountMode"]
      discountValue: ReturnType<typeof parseArticleDiscountInput>["discountValue"]
      supplierIds: string[]
    }
  | { error: string } {
  const discount = parseArticleDiscountInput(
    form.itemKind,
    form.discountMode,
    form.discountValue,
  )
  if (discount.error) {
    return { error: discount.error }
  }
  return {
    brand: form.brand.trim(),
    discountMode: discount.discountMode,
    discountValue: discount.discountValue,
    supplierIds: form.supplierIds,
  }
}


function defaultItemFormFields(kind: ArticleItemKind): ArticleItemFormState {
  return {
    unitOfMeasure: defaultUnitForKind(kind),
    customUnitOfMeasure: "",
    defaultWastePct: "",
    minStockLevel: "",
  }
}

function ArticlesPage() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, loading: bootstrapLoading } = usePopWorkspace()

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

  const handleSortColumn = useCallback(
    (column: ArticleTableSortKey) => {
      const next = nextWorkspaceTableSortState(
        { sort: workspaceParsed.sort, ord: workspaceParsed.ord },
        column,
      )
      replaceWorkspaceQuery({
        sort: next.sort as ArticleTableSortKey | null,
        ord: next.ord,
      })
    },
    [replaceWorkspaceQuery, workspaceParsed.ord, workspaceParsed.sort],
  )

  const sortDirection = useCallback(
    (column: ArticleTableSortKey) =>
      workspaceTableSortDisplayDirection(
        { sort: workspaceParsed.sort, ord: workspaceParsed.ord },
        column,
      ),
    [workspaceParsed.ord, workspaceParsed.sort],
  )

  const [articles, setArticles] = useState<ArticleTableRow[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
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
  const filtersButtonId = useId()
  const pageSizeLabelId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<ArticlesModalFilters>(
    defaultArticlesModalFilters,
  )
  const [filterCategoryList, setFilterCategoryList] = useState<
    ArticleCategoryOption[]
  >([])

  const [editRow, setEditRow] = useState<ArticleTableRow | null>(null)
  const [editCategories, setEditCategories] = useState<ArticleCategoryOption[]>(
    [],
  )
  const [editLoading, setEditLoading] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editForm, setEditForm] = useState<ArticleFormState>(() => ({
    name: "",
    description: "",
    imageUrl: "",
    sku: "",
    barcode: "",
    salePrice: "",
    costPrice: "",
    iva: "",
    categoryId: "",
    isActive: true,
    allowNegativeStock: false,
    itemKind: "merchandise",
    ...defaultItemFormFields("merchandise"),
    ...defaultArticleCatalogExtraFormState(),
  }))
  const [editBanner, setEditBanner] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<ArticleTableRow | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTyped, setDeleteTyped] = useState("")
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)

  const [createCategories, setCreateCategories] = useState<
    ArticleCategoryOption[]
  >([])
  const [createCatLoading, setCreateCatLoading] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<ArticleFormState>(defaultCreateFormState)
  const [supplierOptions, setSupplierOptions] = useState<
    { id: string; name: string }[]
  >([])
  const [suppliersLoading, setSuppliersLoading] = useState(false)

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
  const [categoriesBoardKey, setCategoriesBoardKey] = useState(0)
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<{
    id: string
    name: string
    articleCount: number | null
  } | null>(null)
  const [deleteCategoryBusy, setDeleteCategoryBusy] = useState(false)
  const [deleteCategoryBanner, setDeleteCategoryBanner] = useState<string | null>(
    null,
  )
  const [createOpen, setCreateOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<{
    url: string
    title: string
  } | null>(null)
  const [detailRow, setDetailRow] = useState<ArticleTableRow | null>(null)

  const pendingLegacyCreateRef = useRef(
    workspaceParsed.view === "new-article",
  )

  const articlesListParams = useMemo(
    () => ({
      page: workspaceParsed.page,
      pageSize: workspaceParsed.pageSize,
      search: workspaceParsed.q,
      ...articlesModalFiltersFromWorkspace(workspaceParsed),
      categoryId: workspaceParsed.categoryId,
      itemKinds: workspaceParsed.itemKinds,
      sort: workspaceParsed.sort,
      ord: workspaceParsed.ord,
    }),
    [
      workspaceParsed.page,
      workspaceParsed.pageSize,
      workspaceParsed.q,
      workspaceParsed.soloActivos,
      workspaceParsed.soloInactivos,
      workspaceParsed.conDescuento,
      workspaceParsed.sinDescuento,
      workspaceParsed.conStock,
      workspaceParsed.sinStock,
      workspaceParsed.stockNegativo,
      workspaceParsed.ventaSinStock,
      workspaceParsed.categoryId,
      workspaceParsed.itemKinds.join(","),
      workspaceParsed.sort,
      workspaceParsed.ord,
    ],
  )

  const fetchArticlesList = useCallback(async () => {
    if (!popId || !siteId) return
    const gen = ++fetchGenRef.current
    setListFetching(true)
    setError(null)
    try {
      const res = await getPopArticlesTable(popId, articlesListParams)
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
      setCanCreate(res.canCreate)
      setCanPostInitialStock(res.canPostInitialStock)
      setCanUpdate(res.canUpdate)
      setCanDelete(res.canDelete)
      setError(null)
      if (res.page !== articlesListParams.page) {
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
  }, [popId, siteId, articlesListParams, replaceWorkspaceQuery])

  useEffect(() => {
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
    if (workspaceParsed.view !== "new-article") return
    replaceWorkspaceQuery({ view: "list" })
  }, [workspaceParsed.view, replaceWorkspaceQuery])

  useEffect(() => {
    if (!pendingLegacyCreateRef.current || !canCreate) return
    pendingLegacyCreateRef.current = false
    setCreateOpen(true)
  }, [canCreate])

  const articlesListQueryKey = useMemo(
    () => JSON.stringify(articlesListParams),
    [articlesListParams],
  )

  useEffect(() => {
    setSelected(new Set())
  }, [articlesListQueryKey])

  useEffect(() => {
    if (!popId || !siteId) {
      setListFetching(false)
      setError("ID de POP no encontrado")
      return
    }
    void fetchArticlesList()
  }, [popId, siteId, fetchArticlesList])

  useEffect(() => {
    if (!createOpen || !popId) return
    setCreateBanner(null)
    setCreateForm(defaultCreateFormState())
  }, [createOpen, popId])

  useEffect(() => {
    if (!popId || (!createOpen && !editRow)) return
    let cancelled = false
    ;(async () => {
      setSuppliersLoading(true)
      const res = await getPopArticleSupplierOptions(popId)
      if (cancelled) return
      setSuppliersLoading(false)
      if (res.success) {
        setSupplierOptions(res.suppliers)
      } else {
        setSupplierOptions([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [popId, createOpen, editRow])

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
      sku: row.sku ?? "",
      barcode: row.barcode ?? "",
      salePrice: formatMoneyInputForField(row.salePrice),
      costPrice: formatMoneyInputForField(row.costPrice),
      iva: resolveArticleIvaSelectValue(siteId, row.iva),
      categoryId: row.categoryId,
      isActive: row.isActive,
      allowNegativeStock: row.allowNegativeStock,
      itemKind: row.itemKind,
      ...unitOfMeasureToFormState(row.unitOfMeasure),
      defaultWastePct:
        row.defaultWastePct != null ? String(row.defaultWastePct) : "",
      minStockLevel:
        row.minStockLevel != null ? String(row.minStockLevel) : "",
      ...catalogFieldsFromRow(row),
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

  const loadModalCategories = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!popId || !siteId) return
      const silent = opts?.silent === true
      if (!silent) setCategoriesLoading(true)
      const res = await getPopArticleCategories(popId)
      if (!silent) setCategoriesLoading(false)
      if (res.success) {
        setCategoriesRows(res.categories)
        if (!silent) setCategoriesBanner(null)
      } else if (!silent) {
        setCategoriesBanner(res.error)
        setCategoriesRows([])
      } else {
        setCategoriesBanner(res.error)
      }
    },
    [popId, siteId],
  )

  const openCreate = useCallback(() => {
    if (!canCreate) return
    setCreateBanner(null)
    setCreateOpen(true)
  }, [canCreate])

  const closeCreate = useCallback(() => {
    setCreateOpen(false)
    setCreateBanner(null)
  }, [])

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId) return
    setCreateSaving(true)
    setCreateBanner(null)
    const initialTrim = (createForm.initialStock ?? "").trim()
    const initialNum =
      initialTrim === "" ? null : parseInt(initialTrim, 10)
    const itemFields = parseArticleItemFormState(createForm, createForm.itemKind)
    if ("error" in itemFields) {
      setCreateSaving(false)
      setCreateBanner(itemFields.error)
      return
    }
    const catalogFields = parseCatalogFieldsForSubmit(createForm)
    if ("error" in catalogFields) {
      setCreateSaving(false)
      setCreateBanner(catalogFields.error)
      return
    }
    const ivaParsed = parseArticleIvaFromSelect(siteId, createForm.iva)
    if ("error" in ivaParsed) {
      setCreateSaving(false)
      setCreateBanner(ivaParsed.error)
      return
    }
    const res = await createPopArticle(popId, {
      name: createForm.name,
      description: createForm.description,
      imageUrl: createForm.imageUrl,
      sku: createForm.sku,
      barcode: createForm.barcode,
      salePrice: parseMoneyInput(createForm.salePrice),
      costPrice: parseMoneyInput(createForm.costPrice),
      iva: ivaParsed.ratePercent,
      categoryId: createForm.categoryId,
      isActive: createForm.isActive,
      allowNegativeStock: createForm.allowNegativeStock,
      itemKind: createForm.itemKind,
      ...itemFields,
      ...catalogFields,
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
    try {
      const res = await createPopCategory(popId, newCategoryName)
      if (!res.success) {
        setCategoriesBanner(res.error)
        return
      }
      setNewCategoryName("")
      await loadModalCategories({ silent: true })
      setCategoriesBoardKey((k) => k + 1)
      const fresh = await getPopArticleCategories(popId)
      if (fresh.success) {
        setFilterCategoryList(fresh.categories)
      }
    } finally {
      setNewCategorySaving(false)
    }
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
    await loadModalCategories({ silent: true })
    const fresh = await getPopArticleCategories(popId)
    if (fresh.success) {
      setFilterCategoryList(fresh.categories)
    }
  }

  const saveCategoryLayout = async (updates: CategoryLayoutUpdate[]) => {
    if (!popId || !siteId || updates.length === 0) return
    setCategoriesRows((prev) =>
      prev.map((c) => {
        const patch = updates.find((u) => u.id === c.id)
        return patch
          ? {
              ...c,
              sortOrder: patch.sortOrder,
              showInSale: patch.showInSale,
            }
          : c
      }),
    )
    setCategoriesBanner(null)
    const res = await syncPopCategorySaleLayout(popId, updates)
    if (!res.success) {
      setCategoriesBanner(res.error)
      await loadModalCategories({ silent: true })
      setCategoriesBoardKey((k) => k + 1)
      return
    }
    void getPopArticleCategories(popId).then((fresh) => {
      if (fresh.success) {
        setFilterCategoryList(fresh.categories)
      }
    })
  }

  const removeCategory = (id: string, label: string) => {
    if (!popId) return
    setDeleteCategoryBanner(null)
    setDeleteCategoryTarget({ id, name: label, articleCount: null })
    void getPopCategoryArticleCount(popId, id).then((res) => {
      if (!res.success) {
        setDeleteCategoryTarget(null)
        setCategoriesBanner(res.error)
        return
      }
      setDeleteCategoryTarget((current) =>
        current?.id === id
          ? { ...current, articleCount: res.count }
          : current,
      )
    })
  }

  const closeDeleteCategory = () => {
    setDeleteCategoryTarget(null)
    setDeleteCategoryBanner(null)
  }

  const submitDeleteCategory = async () => {
    if (!popId || !siteId || !deleteCategoryTarget) return
    if (deleteCategoryTarget.articleCount !== 0) return
    setDeleteCategoryBusy(true)
    setDeleteCategoryBanner(null)
    const res = await deletePopCategory(popId, deleteCategoryTarget.id)
    setDeleteCategoryBusy(false)
    if (!res.success) {
      setDeleteCategoryBanner(res.error)
      return
    }
    closeDeleteCategory()
    setCategoriesBanner(null)
    await loadModalCategories({ silent: true })
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
    const itemFields = parseArticleItemFormState(editForm, editForm.itemKind)
    if ("error" in itemFields) {
      setEditSaving(false)
      setEditBanner(itemFields.error)
      return
    }
    const catalogFields = parseCatalogFieldsForSubmit(editForm)
    if ("error" in catalogFields) {
      setEditSaving(false)
      setEditBanner(catalogFields.error)
      return
    }
    const ivaParsed = parseArticleIvaFromSelect(siteId, editForm.iva)
    if ("error" in ivaParsed) {
      setEditSaving(false)
      setEditBanner(ivaParsed.error)
      return
    }
    const res = await updatePopArticle(popId, editRow.id, {
      name: editForm.name,
      description: editForm.description,
      imageUrl: editForm.imageUrl,
      sku: editForm.sku,
      barcode: editForm.barcode,
      salePrice: parseMoneyInput(editForm.salePrice),
      costPrice: parseMoneyInput(editForm.costPrice),
      iva: ivaParsed.ratePercent,
      categoryId: editForm.categoryId,
      isActive: editForm.isActive,
      allowNegativeStock: editForm.allowNegativeStock,
      itemKind: editForm.itemKind,
      ...itemFields,
      ...catalogFields,
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
    setDeleteTarget(row)
    setDeleteOpen(true)
  }

  const requestCloseDelete = () => {
    setDeleteOpen(false)
  }

  const finalizeDeleteClose = () => {
    setDeleteTarget(null)
    setDeleteTyped("")
    setDeleteBanner(null)
  }

  const submitDelete = async () => {
    if (!popId || !siteId || !deleteTarget) return
    setDeleteBusy(true)
    setDeleteBanner(null)
    const res = await deletePopArticle(popId, deleteTarget.id, deleteTyped)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteBanner(res.error)
      return
    }
    requestCloseDelete()
    await fetchArticlesList()
  }

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
  const visibleIds = useMemo(() => pageRows.map((a) => a.id), [pageRows])
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someVisibleSelected = visibleIds.some((id) => selected.has(id))
  const activeItemKindFilterId = useMemo(
    () => resolveArticleItemKindFilterId(workspaceParsed.itemKinds),
    [workspaceParsed.itemKinds],
  )

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
    workspaceParsed.soloInactivos ||
    workspaceParsed.conDescuento ||
    workspaceParsed.sinDescuento ||
    workspaceParsed.conStock ||
    workspaceParsed.sinStock ||
    workspaceParsed.stockNegativo ||
    workspaceParsed.ventaSinStock ||
    workspaceParsed.categoryId.trim() !== "" ||
    activeItemKindFilterId !== "all"

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
    const filters = articlesModalFiltersFromWorkspace(workspaceParsed)
    return Object.values(filters).filter(Boolean).length
  }, [
    workspaceParsed.soloActivos,
    workspaceParsed.soloInactivos,
    workspaceParsed.conDescuento,
    workspaceParsed.sinDescuento,
    workspaceParsed.conStock,
    workspaceParsed.sinStock,
    workspaceParsed.stockNegativo,
    workspaceParsed.ventaSinStock,
  ])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (workspaceParsed.q.trim()) count++
    count += modalFiltersActiveCount
    if (activeItemKindFilterId !== "all") count++
    return count
  }, [workspaceParsed.q, modalFiltersActiveCount, activeItemKindFilterId])

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
      ...defaultArticlesModalFilters(),
      itemKinds: [],
      page: 1,
    })
    searchInputRef.current?.focus()
  }, [replaceWorkspaceQuery])

  const handleCreateItemKindChange = useCallback((kind: ArticleItemKind) => {
    setCreateForm((f) => ({
      ...f,
      itemKind: kind,
      ...defaultItemFormFields(kind),
      ...(kind !== "merchandise"
        ? {
            discountMode: "" as const,
            discountValue: "",
            barcode: "",
            allowNegativeStock: false,
          }
        : {}),
    }))
  }, [])

  const handleEditItemKindChange = useCallback((kind: ArticleItemKind) => {
    setEditForm((f) => ({
      ...f,
      itemKind: kind,
      ...defaultItemFormFields(kind),
      ...(kind !== "merchandise"
        ? {
            discountMode: "" as const,
            discountValue: "",
            barcode: "",
            allowNegativeStock: false,
          }
        : {}),
    }))
  }, [])

  const supplierPickerOptions = useMemo(() => {
    const byId = new Map(supplierOptions.map((supplier) => [supplier.id, supplier]))
    if (editRow) {
      for (const supplier of editRow.suppliers) {
        byId.set(supplier.id, { id: supplier.id, name: supplier.name })
      }
    }
    return [...byId.values()]
  }, [supplierOptions, editRow])

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">ID de POP no encontrado</p>
      </div>
    )
  }

  return (
    <DataWorkspaceTableListPage
      layout={{
        siteId,
        popId,
        popName: bootstrap?.popName ?? "",
        title: "Stock",
        loading: bootstrapLoading || listFetching,
        userName: bootstrap?.userFullName,
        userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
        userRoleLabel: bootstrap?.roleLabel,
        pillLabel: "Catálogo",
        headerActions: (
          <>
            {canCreate ? (
              <DataWorkspaceHeaderIconButton
                label="Nuevo artículo"
                headerVariant={dataWorkspaceTableListHeaderVariant}
                primary
                onClick={openCreate}
              >
                <Plus className="size-5" aria-hidden />
              </DataWorkspaceHeaderIconButton>
            ) : null}
            <DataWorkspaceHeaderIconButton
              label="Gestionar categorías"
              headerVariant={dataWorkspaceTableListHeaderVariant}
              onClick={() => {
                setCategoriesOpen(true)
                void loadModalCategories({
                  silent: categoriesRows.length > 0,
                })
              }}
            >
              <FolderTree className="size-5" aria-hidden />
            </DataWorkspaceHeaderIconButton>
          </>
        ),
      }}
      error={error}
    >
      <DataWorkspaceTableListNatureShell>
        <DataWorkspaceTableListFiltersBar>
              <div className={dataWorkspaceListFiltersGridClass}>
                <div className={dataWorkspaceListFiltersPanelClass}>
                  <ArticleItemKindToolbarFilter
                    value={activeItemKindFilterId}
                    onChange={(id) =>
                      replaceWorkspaceQuery({
                        itemKinds: articleItemKindFilterToQuery(id),
                        page: 1,
                      })
                    }
                  />
                </div>

                <div className={dataWorkspaceListFiltersPanelClass}>
                  <DataWorkspaceListFiltersDialogTrigger
                    id={filtersButtonId}
                    placeholder="Estado y stock"
                    activeCount={modalFiltersActiveCount}
                    expanded={filtersModalOpen}
                    onClick={() => {
                      setDraftFilters(
                        articlesModalFiltersFromWorkspace(workspaceParsed),
                      )
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
                    {workspaceParsed.q.trim() ? (
                      <DataWorkspaceListFilterChip
                        label={`Buscar: «${workspaceParsed.q.trim()}»`}
                        onRemove={() =>
                          replaceWorkspaceQuery({ q: "", page: 1 })
                        }
                        removeAriaLabel="Quitar búsqueda"
                      />
                    ) : null}
                    {activeItemKindFilterId !== "all" ? (
                      <DataWorkspaceListFilterChip
                        label={`Tipo: ${ARTICLE_ITEM_KIND_STOCK_LABEL[activeItemKindFilterId]}`}
                        onRemove={() =>
                          replaceWorkspaceQuery({ itemKinds: [], page: 1 })
                        }
                        removeAriaLabel="Quitar filtro de tipo"
                      />
                    ) : null}
                    {workspaceParsed.soloActivos ? (
                      <DataWorkspaceListFilterChip
                        label="Activos"
                        onRemove={() =>
                          replaceWorkspaceQuery({
                            soloActivos: false,
                            page: 1,
                          })
                        }
                        removeAriaLabel="Quitar filtro activos"
                      />
                    ) : null}
                    {workspaceParsed.soloInactivos ? (
                      <DataWorkspaceListFilterChip
                        label="Inactivos"
                        onRemove={() =>
                          replaceWorkspaceQuery({
                            soloInactivos: false,
                            page: 1,
                          })
                        }
                        removeAriaLabel="Quitar filtro inactivos"
                      />
                    ) : null}
                    {workspaceParsed.conDescuento ? (
                      <DataWorkspaceListFilterChip
                        label="Con descuento"
                        onRemove={() =>
                          replaceWorkspaceQuery({
                            conDescuento: false,
                            page: 1,
                          })
                        }
                        removeAriaLabel="Quitar filtro con descuento"
                      />
                    ) : null}
                    {workspaceParsed.sinDescuento ? (
                      <DataWorkspaceListFilterChip
                        label="Sin descuento"
                        onRemove={() =>
                          replaceWorkspaceQuery({
                            sinDescuento: false,
                            page: 1,
                          })
                        }
                        removeAriaLabel="Quitar filtro sin descuento"
                      />
                    ) : null}
                    {workspaceParsed.conStock ? (
                      <DataWorkspaceListFilterChip
                        label="Con stock"
                        onRemove={() =>
                          replaceWorkspaceQuery({
                            conStock: false,
                            page: 1,
                          })
                        }
                        removeAriaLabel="Quitar filtro con stock"
                      />
                    ) : null}
                    {workspaceParsed.sinStock ? (
                      <DataWorkspaceListFilterChip
                        label="Sin stock (0)"
                        onRemove={() =>
                          replaceWorkspaceQuery({
                            sinStock: false,
                            page: 1,
                          })
                        }
                        removeAriaLabel="Quitar filtro sin stock"
                      />
                    ) : null}
                    {workspaceParsed.stockNegativo ? (
                      <DataWorkspaceListFilterChip
                        label="Con stock negativo"
                        onRemove={() =>
                          replaceWorkspaceQuery({
                            stockNegativo: false,
                            page: 1,
                          })
                        }
                        removeAriaLabel="Quitar filtro stock negativo"
                      />
                    ) : null}
                    {workspaceParsed.ventaSinStock ? (
                      <DataWorkspaceListFilterChip
                        label="Venta sin stock"
                        onRemove={() =>
                          replaceWorkspaceQuery({
                            ventaSinStock: false,
                            page: 1,
                          })
                        }
                        removeAriaLabel="Quitar filtro venta sin stock"
                      />
                    ) : null}
                    {workspaceParsed.categoryId.trim() ? (
                      <DataWorkspaceListFilterChip
                        label={`Categoría: ${categoryLabelForChip || workspaceParsed.categoryId}`}
                        onRemove={() =>
                          replaceWorkspaceQuery({
                            categoryId: "",
                            page: 1,
                          })
                        }
                        removeAriaLabel="Quitar filtro categoría"
                        className="max-w-48"
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
                    placement={hasFilterChips ? "stacked" : "standalone"}
                    disabled={listFetching}
                    actions={[
                      ...(canDelete
                        ? [
                            {
                              label: "Eliminar selección",
                              onClick: () => {},
                              semantic: "destructive" as const,
                            },
                          ]
                        : []),
                      { label: "Exportar CSV", onClick: () => {} },
                    ]}
                  />
                ) : null
              }
              overlay={
                !listFetching && totalCount === 0 ? (
                  <DataWorkspaceTableEmptyMascot />
                ) : null
              }
              footer={
                <DataWorkspaceTableListPaginationFooter
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
                />
              }
            >
              <DataWorkspaceListTableFrame>
              <table
                className={cn(workspaceTableLayoutClassName, "min-w-[80rem]")}
                aria-busy={listFetching}
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
                        listFetching || totalCount === 0 || pageRows.length === 0
                      }
                      ariaLabel="Seleccionar filas visibles"
                    />
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        workspaceTableLayoutImageColumnClass,
                        "px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                      srOnly
                    >
                      Imagen
                    </WorkspaceTableHead>
                    <WorkspaceTableSortHead
                      tone="nature"
                      label="Artículo"
                      direction={sortDirection("name")}
                      onSort={() => handleSortColumn("name")}
                      className={cn(
                        articleTableArticleColumnClass,
                        "px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    />
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        articleTableDetailColumnClass,
                        "px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Detalle
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "w-40 px-3",
                        workspaceTableLayoutHeaderHeadClass,
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
                      className={cn("w-28 px-3", workspaceTableLayoutHeaderHeadClass)}
                    />
                    <WorkspaceTableSortHead
                      tone="nature"
                      label="Costo"
                      align="right"
                      direction={sortDirection("cost_price")}
                      onSort={() => handleSortColumn("cost_price")}
                      className={cn("w-28 px-3", workspaceTableLayoutHeaderHeadClass)}
                    />
                    <WorkspaceTableHead
                      tone="nature"
                      align="right"
                      className={cn(
                        "w-[5.5rem] px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Stock
                    </WorkspaceTableHead>
                    {canUpdate || canDelete ? (
                      <WorkspaceTableHead
                        tone="nature"
                        align="right"
                        className={cn(
                          "w-[7.25rem] px-3",
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
                  {listFetching ? (
                    <WorkspaceTableSkeletonRows
                      rowCount={skeletonRowCount}
                      rowKeyPrefix="articles-sk"
                      columns={articlesSkeletonColumns({
                        hasActionsColumn: Boolean(canUpdate || canDelete),
                      })}
                      tone="nature"
                    />
                  ) : totalCount === 0 ? (
                    null
                  ) : (
                    pageRows.map((a, i) => {
                      const sellable = a.itemKind === "merchandise"
                      const hasDiscount = articleHasCatalogDiscount(
                        a.discountMode,
                        a.discountValue,
                      )
                      const effectiveSalePrice = effectiveArticleSalePrice(
                        a.salePrice,
                        a.discountMode,
                        a.discountValue,
                      )

                      return (
                      <WorkspaceTableBodyRow
                        key={a.id}
                        index={i}
                        selected={selected.has(a.id)}
                        inactive={!a.isActive}
                      >
                        <WorkspaceTableSelectCell
                          tone="nature"
                          checked={selected.has(a.id)}
                          onCheckedChange={(c) => {
                            setSelected((prev) => {
                              const next = new Set(prev)
                              if (c === true) next.add(a.id)
                              else next.delete(a.id)
                              return next
                            })
                          }}
                          ariaLabel={`Seleccionar ${a.name || "ítem"}`}
                        />
                        <ArticleTableImageCell
                          row={a}
                          onPreview={(url) =>
                            setImagePreview({
                              url,
                              title: a.name || "Imagen del artículo",
                            })
                          }
                        />
                        <ArticleTableArticleCell row={a} />
                        <ArticleTableDetailCell
                          row={a}
                          onVerDetalle={() => setDetailRow(a)}
                        />
                        <ArticleTableCategoryCell name={a.categoryName} />
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            "text-right text-sm leading-4",
                          )}
                        >
                          {sellable ? (
                            hasDiscount ? (
                              <div className={workspaceTableLayoutCellStackClass}>
                                <span
                                  className={cn(
                                    "truncate text-xs leading-4 line-through",
                                    workspaceTableNatureTextSecondaryClass,
                                  )}
                                >
                                  {formatMoney(a.salePrice)}
                                </span>
                                <span
                                  className={cn(
                                    "block truncate tabular-nums",
                                    workspaceTableNatureMoneyClass,
                                  )}
                                >
                                  {formatMoney(effectiveSalePrice)}
                                </span>
                              </div>
                            ) : (
                              <span
                                className={cn(
                                  "block truncate tabular-nums",
                                  workspaceTableNatureMoneyClass,
                                )}
                              >
                                {formatMoney(a.salePrice)}
                              </span>
                            )
                          ) : (
                            <span
                              className={cn(
                                "block",
                                workspaceTableNatureTextSecondaryClass,
                              )}
                            >
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            "text-right text-sm leading-4",
                          )}
                        >
                          <span
                            className={cn(
                              "block truncate tabular-nums",
                              workspaceTableNatureMoneyClass,
                            )}
                          >
                            {formatMoney(a.costPrice)}
                          </span>
                        </TableCell>
                        <ArticleTableStockCell stockOnHand={a.stockOnHand} />
                        {canUpdate || canDelete ? (
                          <TableCell className={workspaceTableLayoutActionsBodyCellClass}>
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
                      </WorkspaceTableBodyRow>
                    )})
                  )}
                </TableBody>
              </table>
              {!listFetching && totalCount === 0 ? (
                <div className="min-h-[12rem] flex-1" aria-hidden />
              ) : null}
              </DataWorkspaceListTableFrame>
            </DataWorkspaceTableListShell>
      </DataWorkspaceTableListNatureShell>

      <ArticlesFiltersDialog
        open={filtersModalOpen}
        onOpenChange={(open) => {
          if (open) {
            setDraftFilters(
              articlesModalFiltersFromWorkspace(workspaceParsed),
            )
          }
          setFiltersModalOpen(open)
        }}
        draft={draftFilters}
        onDraftChange={setDraftFilters}
        onApply={() => {
          replaceWorkspaceQuery({
            ...draftFilters,
            page: 1,
          })
          setFiltersModalOpen(false)
        }}
      />

      <ArticleUpsertDialog
        open={editRow !== null}
        onOpenChange={(open) => !open && closeEdit()}
        mode="edit"
        title="Editar artículo"
        loading={editLoading}
        saving={editSaving}
        banner={editBanner}
        onSubmit={(e) => void submitEdit(e)}
        onCancel={closeEdit}
        idPrefix="edit-art"
        siteId={siteId}
        popId={popId!}
        form={editForm}
        onChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))}
        onItemKindChange={handleEditItemKindChange}
        categories={editCategories}
        supplierOptions={supplierPickerOptions}
        suppliersLoading={suppliersLoading}
        disabled={editSaving}
      />

      <ArticleDeleteDialog
        open={deleteOpen}
        articleName={deleteTarget?.name ?? ""}
        confirmValue={deleteTyped}
        banner={deleteBanner}
        busy={deleteBusy}
        onOpenChange={(open) => {
          if (!open) requestCloseDelete()
        }}
        onClose={requestCloseDelete}
        onAfterClose={finalizeDeleteClose}
        onConfirmValueChange={setDeleteTyped}
        onConfirmDelete={() => void submitDelete()}
      />

      <ArticleUpsertDialog
        open={createOpen}
        onOpenChange={(open) => !open && closeCreate()}
        mode="create"
        title="Nuevo artículo"
        loading={createCatLoading}
        saving={createSaving}
        banner={createBanner}
        onSubmit={(e) => void submitCreate(e)}
        onCancel={closeCreate}
        idPrefix="create-art"
        siteId={siteId}
        popId={popId!}
        form={createForm}
        onChange={(patch) => setCreateForm((f) => ({ ...f, ...patch }))}
        onItemKindChange={handleCreateItemKindChange}
        categories={createCategories}
        supplierOptions={supplierPickerOptions}
        suppliersLoading={suppliersLoading}
        canPostInitialStock={canPostInitialStock}
        disabled={createSaving}
      />

      <ArticleCategoriesDialog
        open={categoriesOpen}
        onOpenChange={(open) => {
          setCategoriesOpen(open)
          if (!open) {
            setCategoriesBanner(null)
            cancelEditCategory()
            setNewCategoryName("")
            closeDeleteCategory()
          }
        }}
        banner={categoriesBanner}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        loading={categoriesLoading}
        categories={categoriesRows}
        boardKey={categoriesBoardKey}
        newCategoryName={newCategoryName}
        newCategorySaving={newCategorySaving}
        onNewCategoryNameChange={setNewCategoryName}
        onSubmitNewCategory={() => void submitNewCategory()}
        editingCategoryId={editingCategoryId}
        editingCategoryName={editingCategoryName}
        categorySaveBusy={categorySaveBusy}
        onStartEdit={startEditCategory}
        onCancelEdit={cancelEditCategory}
        onEditingNameChange={setEditingCategoryName}
        onSaveEdit={() => void saveEditCategory()}
        onDelete={removeCategory}
        onLayoutChange={(updates) => void saveCategoryLayout(updates)}
      />

      <ArticleCategoryDeleteDialog
        open={deleteCategoryTarget !== null}
        target={deleteCategoryTarget}
        banner={deleteCategoryBanner}
        busy={deleteCategoryBusy}
        onOpenChange={(open) => !open && closeDeleteCategory()}
        onClose={closeDeleteCategory}
        onConfirmDelete={() => void submitDeleteCategory()}
      />

      <ArticleImagePreviewDialog
        open={imagePreview !== null}
        onOpenChange={(open) => {
          if (!open) setImagePreview(null)
        }}
        imageUrl={imagePreview?.url ?? null}
        title={imagePreview?.title}
      />

      <ArticlesTableDetailDialog
        row={detailRow}
        siteId={siteId}
        open={detailRow !== null}
        onOpenChange={(open) => {
          if (!open) setDetailRow(null)
        }}
      />
    </DataWorkspaceTableListPage>
  )
}

export default withAuth(ArticlesPage)
