"use client"

import { ArticlesPageSkeleton } from "@/app/[siteId]/[popId]/articles/ArticlesPageSkeleton"
import {
  defaultArticleCatalogExtraFormState,
  type ArticleCatalogExtraFormState,
} from "@/app/[siteId]/[popId]/articles/ArticleCatalogExtraFields"
import { ArticleCategoriesSaleBoard } from "@/app/[siteId]/[popId]/articles/ArticleCategoriesSaleBoard"
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
import { ArticleImagePreviewDialog } from "@/app/[siteId]/[popId]/articles/ArticleImagePreviewDialog"
import { ArticlesTableDetailDialog } from "@/app/[siteId]/[popId]/articles/ArticlesTableDetailDialog"
import {
  ArticleTableArticleCell,
  ArticleTableCategoryCell,
  ArticleTableDetailCell,
  ArticleTableImageCell,
  ArticleTableStockCell,
  ArticleTableSuppliersCell,
} from "@/app/[siteId]/[popId]/articles/articlesTableCells"
import {
  ARTICLE_DELETE_CONFIRM_PHRASE,
  articleDialogBodyClass,
  articleDialogDescriptionClass,
  articleDialogFooterClass,
  articleDialogHeaderClass,
  articleDialogOverlayClass,
  articleDialogSurfaceClass,
  articleDialogSurfaceWideClass,
  articleDialogTitleClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import {
  ARTICLE_TABLE_PAGE_SIZES,
  mergeArticlesWorkspaceUrl,
  parseArticlesWorkspaceUrl,
} from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListBulkToolbar } from "@/components/data-workspace/DataWorkspaceListBulkToolbar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import {
  DataWorkspaceListFiltersDialogTrigger,
  DataWorkspaceListSearchField,
} from "@/components/data-workspace/DataWorkspaceListFilterFields"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import { DataWorkspaceListTableShell } from "@/components/data-workspace/DataWorkspaceListTableShell"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  DataWorkspaceTableIconAction,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  selectColumnInnerClass,
  workspaceTableLayoutClassName,
  workspaceTableNatureBodyRowClassNames,
  workspaceTableNatureCheckboxClass,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersBarClass,
  dataWorkspaceListFiltersBarInnerClass,
  dataWorkspaceListFiltersBarRowClass,
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutActionsBodyCellClass,
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutBodyRowClass,
  workspaceTableLayoutCellStackClass,
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutImageColumnClass,
  workspaceTableLayoutListBodyScopeClass,
  workspaceTableLayoutListSurfaceClass,
  workspaceTableLayoutSelectBodyCellClass,
  workspaceTableNatureEarthOrganicScopeClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { articlesSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
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
  TableRow,
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
  Suspense,
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

type ArticlesAppliedFilters = {
  soloActivos: boolean
  categoryId: string
}

const defaultArticlesFilters = (): ArticlesAppliedFilters => ({
  soloActivos: false,
  categoryId: "",
})

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
  const [draftFilters, setDraftFilters] = useState<ArticlesAppliedFilters>(
    defaultArticlesFilters,
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
    itemKind: "merchandise",
    ...defaultItemFormFields("merchandise"),
    ...defaultArticleCatalogExtraFormState(),
  }))
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
      soloActivos: workspaceParsed.soloActivos,
      categoryId: workspaceParsed.categoryId,
      itemKinds: workspaceParsed.itemKinds,
    }),
    [
      workspaceParsed.page,
      workspaceParsed.pageSize,
      workspaceParsed.q,
      workspaceParsed.soloActivos,
      workspaceParsed.categoryId,
      workspaceParsed.itemKinds.join(","),
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
      setSelected(new Set())
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
    const res = await createPopCategory(popId, newCategoryName)
    setNewCategorySaving(false)
    if (!res.success) {
      setCategoriesBanner(res.error)
      return
    }
    setNewCategoryName("")
    await loadModalCategories({ silent: true })
    const fresh = await getPopArticleCategories(popId)
    if (fresh.success) {
      setFilterCategoryList(fresh.categories)
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

  const deleteCategoryBlocked =
    deleteCategoryTarget != null &&
    deleteCategoryTarget.articleCount != null &&
    deleteCategoryTarget.articleCount > 0
  const deleteCategoryReady =
    deleteCategoryTarget != null && deleteCategoryTarget.articleCount === 0
  const deleteCategoryChecking =
    deleteCategoryTarget != null && deleteCategoryTarget.articleCount === null

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
    let count = 0
    if (workspaceParsed.soloActivos) count++
    if (workspaceParsed.categoryId.trim()) count++
    return count
  }, [
    workspaceParsed.soloActivos,
    workspaceParsed.categoryId,
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
      soloActivos: false,
      categoryId: "",
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
        ? { discountMode: "" as const, discountValue: "", barcode: "" }
        : {}),
    }))
  }, [])

  const handleEditItemKindChange = useCallback((kind: ArticleItemKind) => {
    setEditForm((f) => ({
      ...f,
      itemKind: kind,
      ...defaultItemFormFields(kind),
      ...(kind !== "merchandise"
        ? { discountMode: "" as const, discountValue: "", barcode: "" }
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
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Stock"
      headerVariant="dark"
      contentFlush
      sidebarCollapsible={false}
      loading={bootstrapLoading || listFetching}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel}
      pillLabel="Catálogo"
      mainClassName="rootsy-nature-palette min-h-0 overflow-hidden"
      headerActions={
        <>
          {canCreate ? (
            <DataWorkspaceHeaderIconButton
              label="Nuevo artículo"
              headerVariant="dark"
              primary
              onClick={openCreate}
            >
              <Plus className="size-5" aria-hidden />
            </DataWorkspaceHeaderIconButton>
          ) : null}
          <DataWorkspaceHeaderIconButton
            label="Gestionar categorías"
            headerVariant="dark"
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
            className={dataWorkspaceListFiltersBarClass}
            role="toolbar"
            aria-label="Filtros del listado"
          >
            <div
              className={cn(
                dataWorkspaceListFiltersBarInnerClass,
                dataWorkspaceListFiltersBarRowClass,
              )}
            >
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
                    placeholder="Estado y categoría"
                    activeCount={modalFiltersActiveCount}
                    expanded={filtersModalOpen}
                    onClick={() => {
                      setDraftFilters({
                        soloActivos: workspaceParsed.soloActivos,
                        categoryId: workspaceParsed.categoryId,
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
            </div>
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
              <DialogContent
                className={articleDialogSurfaceClass}
                overlayClassName={articleDialogOverlayClass}
                showCloseButton
                data-rootsy-light-shell="true"
              >
                <DialogHeader className={articleDialogHeaderClass}>
                  <DialogTitle className={articleDialogTitleClass}>
                    Filtros
                  </DialogTitle>
                  <DialogDescription className={articleDialogDescriptionClass}>
                    Combinan con la búsqueda. El listado se pagina en el
                    servidor.
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
                        aria-label="Solo artículos activos"
                      />
                      <span className="text-sm text-foreground">
                        Solo artículos activos
                      </span>
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
                </div>
                <DialogFooter className={articleDialogFooterClass}>
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

            <DataWorkspaceListTableShell
              variant="flush"
              className={cn(
                workspaceTableNatureEarthOrganicScopeClass,
                workspaceTableLayoutListBodyScopeClass,
                workspaceTableLayoutListSurfaceClass,
              )}
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
                        label="Solo activos"
                        onRemove={() =>
                          replaceWorkspaceQuery({
                            soloActivos: false,
                            page: 1,
                          })
                        }
                        removeAriaLabel="Quitar filtro solo activos"
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
                />
              }
            >
              <DataWorkspaceListTableFrame className={workspaceTableLayoutListSurfaceClass}>
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
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "min-w-48 px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Artículo
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "w-44 px-3",
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
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "w-40 px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Proveedores
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      align="right"
                      className={cn("w-28 px-3", workspaceTableLayoutHeaderHeadClass)}
                    >
                      Venta
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      align="right"
                      className={cn("w-28 px-3", workspaceTableLayoutHeaderHeadClass)}
                    >
                      Costo
                    </WorkspaceTableHead>
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
                      <TableRow
                        key={a.id}
                        className={cn(
                          workspaceTableLayoutBodyRowClass,
                          workspaceTableNatureBodyRowClassNames(i, {
                            selected: selected.has(a.id),
                            noHover: true,
                          }),
                        )}
                      >
                        <TableCell className={workspaceTableLayoutSelectBodyCellClass}>
                          <div className={selectColumnInnerClass}>
                            <Checkbox
                              className={workspaceTableNatureCheckboxClass}
                              checked={selected.has(a.id)}
                              onCheckedChange={(c) => {
                                setSelected((prev) => {
                                  const next = new Set(prev)
                                  if (c === true) next.add(a.id)
                                  else next.delete(a.id)
                                  return next
                                })
                              }}
                              aria-label={`Seleccionar ${a.name || "ítem"}`}
                            />
                          </div>
                        </TableCell>
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
                        <ArticleTableSuppliersCell suppliers={a.suppliers} />
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
                                    "truncate text-sm font-medium leading-4 tabular-nums",
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
                      </TableRow>
                    )})
                  )}
                </TableBody>
              </table>
              {!listFetching && totalCount === 0 ? (
                <div className="min-h-[12rem] flex-1" aria-hidden />
              ) : null}
              </DataWorkspaceListTableFrame>
            </DataWorkspaceListTableShell>
          </div>

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

      <Dialog open={deleteRow !== null} onOpenChange={(o) => !o && closeDelete()}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className={articleDialogSurfaceClass}
          overlayClassName={articleDialogOverlayClass}
        >
          <DialogHeader className={articleDialogHeaderClass}>
            <DialogTitle className={articleDialogTitleClass}>
              Eliminar artículo
            </DialogTitle>
            <DialogDescription className={articleDialogDescriptionClass}>
              Esta acción no se puede deshacer desde acá.
            </DialogDescription>
          </DialogHeader>
          <div className={articleDialogBodyClass}>
            <p className="text-sm text-muted-foreground">
              Vas a borrar{" "}
              <strong className="text-foreground">
                {deleteRow?.name || "este artículo"}
              </strong>
              .
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Para confirmar, escribí{" "}
              <strong className="text-foreground">
                {ARTICLE_DELETE_CONFIRM_PHRASE}
              </strong>{" "}
              abajo.
            </p>
            {deleteBanner ? (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {deleteBanner}
              </p>
            ) : null}
            <Input
              autoComplete="off"
              value={deleteTyped}
              onChange={(e) => setDeleteTyped(e.target.value)}
              placeholder={ARTICLE_DELETE_CONFIRM_PHRASE}
              className="mt-4 bg-background"
            />
          </div>
          <DialogFooter className={articleDialogFooterClass}>
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

      <Dialog
        open={categoriesOpen}
        onOpenChange={(o) => {
          setCategoriesOpen(o)
          if (!o) {
            setCategoriesBanner(null)
            cancelEditCategory()
            setNewCategoryName("")
            closeDeleteCategory()
          }
        }}
      >
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className={articleDialogSurfaceWideClass}
          overlayClassName={articleDialogOverlayClass}
        >
          <DialogHeader className={articleDialogHeaderClass}>
            <DialogTitle className={articleDialogTitleClass}>
              Categorías
            </DialogTitle>
            <DialogDescription className={articleDialogDescriptionClass}>
              Ordená las categorías y elegí cuáles se muestran en ventas.
            </DialogDescription>
          </DialogHeader>
          <div className={articleDialogBodyClass}>
            {categoriesBanner ? (
              <p
                role="alert"
                className="mb-4 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {categoriesBanner}
              </p>
            ) : null}
            {canCreate ? (
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1 space-y-2">
                  <Label htmlFor="new-cat-name" className="text-foreground">
                    Nueva categoría
                  </Label>
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
                  className="shrink-0"
                  disabled={newCategorySaving || !newCategoryName.trim()}
                  onClick={() => void submitNewCategory()}
                >
                  {newCategorySaving ? "Agregando…" : "Agregar"}
                </Button>
              </div>
            ) : null}
            {categoriesLoading && categoriesRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Cargando categorías…
              </p>
            ) : (
              <ArticleCategoriesSaleBoard
                key={categoriesBoardKey}
                categories={categoriesRows}
                canUpdate={canUpdate}
                canDelete={canDelete}
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
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteCategoryTarget !== null}
        onOpenChange={(o) => !o && closeDeleteCategory()}
      >
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className={articleDialogSurfaceClass}
          overlayClassName={articleDialogOverlayClass}
        >
          <DialogHeader className={articleDialogHeaderClass}>
            <DialogTitle className={articleDialogTitleClass}>
              {deleteCategoryBlocked
                ? "No se puede eliminar"
                : "Eliminar categoría"}
            </DialogTitle>
            <DialogDescription className={articleDialogDescriptionClass}>
              {deleteCategoryChecking
                ? "Verificando artículos relacionados…"
                : deleteCategoryBlocked
                  ? "La categoría todavía está en uso en el stock."
                  : "Esta acción no se puede deshacer."}
            </DialogDescription>
          </DialogHeader>
          <div className={articleDialogBodyClass}>
            {deleteCategoryChecking ? (
              <p className="text-sm text-muted-foreground">
                Un momento…
              </p>
            ) : deleteCategoryBlocked ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                La categoría{" "}
                <strong className="text-foreground">
                  {deleteCategoryTarget?.name || "seleccionada"}
                </strong>{" "}
                tiene{" "}
                <strong className="text-foreground">
                  {deleteCategoryTarget?.articleCount === 1
                    ? "1 artículo relacionado"
                    : `${deleteCategoryTarget?.articleCount ?? 0} artículos relacionados`}
                </strong>
                . Para eliminar, cambiá la categoría de los artículos que la
                utilizan actualmente.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                ¿Eliminar la categoría{" "}
                <strong className="text-foreground">
                  {deleteCategoryTarget?.name || "seleccionada"}
                </strong>
                ?
              </p>
            )}
            {deleteCategoryBanner ? (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {deleteCategoryBanner}
              </p>
            ) : null}
          </div>
          <DialogFooter className={articleDialogFooterClass}>
            {deleteCategoryBlocked ? (
              <Button type="button" onClick={closeDeleteCategory}>
                Entendido
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDeleteCategory}
                  disabled={deleteCategoryBusy || deleteCategoryChecking}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!deleteCategoryReady || deleteCategoryBusy}
                  onClick={() => void submitDeleteCategory()}
                >
                  {deleteCategoryBusy ? "Eliminando…" : "Eliminar"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
      </div>
    </DataWorkspaceLayout>
  )
}

export default withAuth(function ArticlesPageRoute() {
  return (
    <Suspense fallback={<ArticlesPageSkeleton />}>
      <ArticlesPage />
    </Suspense>
  )
})
