"use client"

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
import {
  ArticleUpsertFormFields,
  type ArticleUpsertFormState,
} from "@/app/[siteId]/[popId]/articles/ArticleUpsertFormFields"
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
  articleDialogFooterClass,
  articleDialogHeaderClass,
  articleDialogSurfaceClass,
  articleDialogSurfaceTwoColClass,
  articleDialogSurfaceWideClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import {
  ARTICLE_TABLE_PAGE_SIZES,
  mergeArticlesWorkspaceUrl,
  parseArticlesWorkspaceUrl,
} from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import { DataWorkspaceListTableShell } from "@/components/data-workspace/DataWorkspaceListTableShell"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  DataWorkspaceTableIconAction,
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
  toolbarBlockLabelClass,
  workspaceDataTableClassName,
  workspaceTableBodyRowClassNames,
  workspaceTableHeaderRowClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { articlesSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
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
  Filter,
  FolderTree,
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
    salePrice: "0",
    costPrice: "0",
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
  }, [
    workspaceParsed.soloActivos,
    workspaceParsed.categoryId,
  ])

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
      mainClassName="min-h-0 overflow-hidden"
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
              className={lightToolbarShellClass}
              role="toolbar"
              aria-label="Filtros del listado"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12">
                <ArticleItemKindToolbarFilter
                  className="order-1 w-full min-w-0 md:col-span-1 xl:col-span-3"
                  value={activeItemKindFilterId}
                  onChange={(id) =>
                    replaceWorkspaceQuery({
                      itemKinds: articleItemKindFilterToQuery(id),
                      page: 1,
                    })
                  }
                />

                <div
                  className={cn(
                    lightToolbarPanelClass,
                    "order-2 w-full min-w-0 md:col-span-1 xl:order-2 xl:col-span-3",
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
                    "order-3 min-w-0 md:col-span-2 xl:order-3 xl:col-span-6",
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
              <DataWorkspaceListTableFrame>
              <table
                className={workspaceDataTableClassName}
                aria-busy={listFetching}
              >
                <TableHeader>
                  <TableRow className={workspaceTableHeaderRowClass}>
                    <TableHead className={cn(lightTableThClass, "w-12 !px-0 text-center")}>
                      <div className={cn(selectColumnInnerClass, "min-h-10")}>
                        <Checkbox
                          className={tableRowSelectCheckboxClass}
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
                          aria-label="Seleccionar filas visibles"
                        />
                      </div>
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "w-24 px-3 text-left")}>
                      Imagen
                    </TableHead>
                    <TableHead
                      className={cn(
                        lightTableThClass,
                        "w-[14rem] min-w-0 max-w-[14rem] px-3 text-left",
                      )}
                    >
                      Artículo
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "min-w-[9rem] max-w-[11rem] px-3 text-left")}>
                      Detalle
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "w-[10rem] px-3 text-left")}>
                      Categoría
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "w-[10rem] px-3 text-left")}>
                      Proveedores
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "px-3 text-right")}>
                      Venta
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "px-3 text-right")}>
                      Costo
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "w-[5.5rem] px-3 text-right")}>
                      Stock
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
                  {listFetching ? (
                    <WorkspaceTableSkeletonRows
                      rowCount={skeletonRowCount}
                      rowKeyPrefix="articles-sk"
                      columns={articlesSkeletonColumns({
                        hasActionsColumn: Boolean(canUpdate || canDelete),
                      })}
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
                        className={workspaceTableBodyRowClassNames(i)}
                      >
                        <TableCell className="w-12 !px-0 py-2.5 align-middle">
                          <div className={selectColumnInnerClass}>
                            <Checkbox
                              className={tableRowSelectCheckboxClass}
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
                          hasDiscount={hasDiscount}
                          onVerMas={() => setDetailRow(a)}
                        />
                        <ArticleTableCategoryCell name={a.categoryName} />
                        <ArticleTableSuppliersCell suppliers={a.suppliers} />
                        <TableCell
                          className={cn(
                            "px-3 py-2.5 text-right text-sm align-middle",
                            sellable ? tdMoneyTotalClass : tdMoneyMutedClass,
                          )}
                        >
                          {sellable ? (
                            hasDiscount ? (
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="text-xs font-medium text-muted-foreground line-through">
                                  {formatMoney(a.salePrice)}
                                </span>
                                <span>{formatMoney(effectiveSalePrice)}</span>
                              </div>
                            ) : (
                              formatMoney(a.salePrice)
                            )
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "px-3 py-2.5 text-right text-sm align-middle",
                            tdMoneyMutedClass,
                          )}
                        >
                          {formatMoney(a.costPrice)}
                        </TableCell>
                        <ArticleTableStockCell stockOnHand={a.stockOnHand} />
                        {canUpdate || canDelete ? (
                          <TableCell className="px-3 py-1.5 align-middle">
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

      <Dialog open={editRow !== null} onOpenChange={(o) => !o && closeEdit()}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className={articleDialogSurfaceTwoColClass}
        >
          <DialogHeader className={articleDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Editar artículo
            </DialogTitle>
            <DialogDescription className="sr-only">
              Editar artículo
            </DialogDescription>
          </DialogHeader>
          {editLoading ? (
            <p className={cn(articleDialogBodyClass, "text-sm text-muted-foreground")}>
              Cargando categorías…
            </p>
          ) : (
            <form
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
              onSubmit={(e) => void submitEdit(e)}
            >
              <div className={articleDialogBodyClass}>
                {editBanner ? (
                  <p
                    role="alert"
                    className="mb-4 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                  >
                    {editBanner}
                  </p>
                ) : null}
                <ArticleUpsertFormFields
                  idPrefix="edit-art"
                  siteId={siteId}
                  popId={popId}
                  form={editForm}
                  onChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))}
                  onItemKindChange={handleEditItemKindChange}
                  categories={editCategories}
                  supplierOptions={supplierPickerOptions}
                  suppliersLoading={suppliersLoading}
                  mode="edit"
                  disabled={editSaving}
                />
              </div>
              <DialogFooter className={articleDialogFooterClass}>
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
          className={articleDialogSurfaceClass}
        >
          <DialogHeader className={articleDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Eliminar artículo
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
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

      <Dialog open={createOpen} onOpenChange={(o) => !o && closeCreate()}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className={articleDialogSurfaceTwoColClass}
        >
          <DialogHeader className={articleDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Nuevo artículo
            </DialogTitle>
            <DialogDescription className="sr-only">
              Nuevo artículo
            </DialogDescription>
          </DialogHeader>
          {createCatLoading ? (
            <p className={cn(articleDialogBodyClass, "text-sm text-muted-foreground")}>
              Cargando categorías…
            </p>
          ) : (
            <form
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
              onSubmit={(e) => void submitCreate(e)}
            >
              <div className={articleDialogBodyClass}>
                {createBanner ? (
                  <p
                    role="alert"
                    className="mb-4 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                  >
                    {createBanner}
                  </p>
                ) : null}
                <ArticleUpsertFormFields
                  idPrefix="create-art"
                  siteId={siteId}
                  popId={popId}
                  form={createForm}
                  onChange={(patch) => setCreateForm((f) => ({ ...f, ...patch }))}
                  onItemKindChange={handleCreateItemKindChange}
                  categories={createCategories}
                  supplierOptions={supplierPickerOptions}
                  suppliersLoading={suppliersLoading}
                  canPostInitialStock={canPostInitialStock}
                  mode="create"
                  disabled={createSaving}
                />
              </div>
              <DialogFooter className={articleDialogFooterClass}>
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
          className={articleDialogSurfaceWideClass}
        >
          <DialogHeader className={articleDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Categorías
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Organizá qué categorías se ven en ventas y en qué orden.
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
                onDelete={(id, name) => void removeCategory(id, name)}
                onLayoutChange={(updates) => void saveCategoryLayout(updates)}
              />
            )}
          </div>
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

export default withAuth(ArticlesPage)
