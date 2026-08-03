"use client"

import {
  createPopClient,
  deletePopClient,
  getPopClientsTable,
  updatePopClient,
  type ClientTableRow,
  type UpsertPopClientInput,
} from "@/app/[siteId]/[popId]/clients/actions"
import { CLIENT_IVA_CONDITION_OPTIONS } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import {
  getSaleComprobantePickerOptions,
} from "@/lib/saleComprobantePicker"
import { suggestSaleComprobanteForClientIva } from "@/lib/saleComprobanteRules"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  DataWorkspaceTableIconAction,
  DataWorkspaceTableMoney,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { clientsSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import { DataWorkspaceListTableShell } from "@/components/data-workspace/DataWorkspaceListTableShell"
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
  listBulkToolbarClearButtonClass,
  selectColumnInnerClass,
  tableRowSelectCheckboxClass,
  toolbarBlockLabelClass,
  workspaceDataTableClassName,
  workspaceTableBodyRowClassNames,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import {
  CLIENT_TABLE_PAGE_SIZES,
  mergeClientsWorkspaceUrl,
  parseClientsWorkspaceUrl,
} from "@/app/[siteId]/[popId]/clients/workspaceUrl"
import {
  ClientUpsertFormFields,
  clientDialogBodyClass,
  clientDialogFooterClass,
  clientDialogHeaderClass,
  clientDialogSurface,
} from "@/app/[siteId]/[popId]/clients/ClientUpsertFormFields"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { cn } from "@/lib/utils"
import withAuth from "@/hoc/withAuth"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import {
  Filter,
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
  useMemo,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react"

function emptyForm(): UpsertPopClientInput {
  return {
    name: "",
    email: "",
    phone: "",
    taxId: "",
    notes: "",
    ivaCondition: "",
    addressLine: "",
    defaultInvoiceTypeLabel: "",
    isActive: true,
  }
}

const IVA_LABEL_BY_VALUE = Object.fromEntries(
  CLIENT_IVA_CONDITION_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>

function formatArs(amount: number) {
  return amount.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

function formatShortSaleDate(iso: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

type ClientsAppliedFilters = {
  withEmail: boolean
  withTaxId: boolean
  soloActivos: boolean
}

const defaultClientsFilters = (): ClientsAppliedFilters => ({
  withEmail: false,
  withTaxId: false,
  soloActivos: false,
})

function ClientsPage() {
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
    () => parseClientsWorkspaceUrl(searchParams),
    [searchParams],
  )

  const replaceWorkspaceQuery = useCallback(
    (patch: Parameters<typeof mergeClientsWorkspaceUrl>[1]) => {
      const qs = mergeClientsWorkspaceUrl(searchParams, patch)
      const next = qs ? `${pathname}?${qs}` : pathname
      router.replace(next, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const [rows, setRows] = useState<ClientTableRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [listFetching, setListFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchGenRef = useRef(0)
  const createTaxInputRef = useRef<HTMLInputElement>(null)
  const pendingCreateFromUrlRef = useRef(false)

  const listQuery = useMemo(
    () => ({
      page: workspaceParsed.page,
      pageSize: workspaceParsed.pageSize,
      search: workspaceParsed.q,
      soloActivos: workspaceParsed.soloActivos,
      withEmail: workspaceParsed.withEmail,
      withTaxId: workspaceParsed.withTaxId,
    }),
    [
      workspaceParsed.page,
      workspaceParsed.pageSize,
      workspaceParsed.q,
      workspaceParsed.soloActivos,
      workspaceParsed.withEmail,
      workspaceParsed.withTaxId,
    ],
  )

  const [searchInput, setSearchInput] = useState(workspaceParsed.q)
  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState(emptyForm)

  const [editRow, setEditRow] = useState<ClientTableRow | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editBanner, setEditBanner] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)

  const [deleteRow, setDeleteRow] = useState<ClientTableRow | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const searchInputId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<ClientsAppliedFilters>(
    defaultClientsFilters,
  )

  const pageSizeLabelId = useId()
  const [selected, setSelected] = useState<Set<string>>(() => new Set())

  const createOpenEffective = createOpen && canCreate

  const comprobanteFormOptions = useMemo(
    () =>
      getSaleComprobantePickerOptions(
        siteId || "arg",
        bootstrap?.popEmisorIvaCondition ?? "responsable_inscripto",
        bootstrap?.hasValidPopFiscalCuit ?? false,
      ),
    [siteId, bootstrap?.popEmisorIvaCondition, bootstrap?.hasValidPopFiscalCuit],
  )

  const suggestedComprobanteForCreate = useMemo(() => {
    if (!createForm.ivaCondition || !bootstrap?.hasValidPopFiscalCuit) return null
    return suggestSaleComprobanteForClientIva(
      createForm.ivaCondition as (typeof CLIENT_IVA_CONDITION_OPTIONS)[number]["value"],
      bootstrap.popEmisorIvaCondition,
    )
  }, [createForm.ivaCondition, bootstrap?.hasValidPopFiscalCuit, bootstrap?.popEmisorIvaCondition])

  const suggestedComprobanteForEdit = useMemo(() => {
    if (!editForm.ivaCondition || !bootstrap?.hasValidPopFiscalCuit) return null
    return suggestSaleComprobanteForClientIva(
      editForm.ivaCondition as (typeof CLIENT_IVA_CONDITION_OPTIONS)[number]["value"],
      bootstrap.popEmisorIvaCondition,
    )
  }, [editForm.ivaCondition, bootstrap?.hasValidPopFiscalCuit, bootstrap?.popEmisorIvaCondition])

  const createPadron = usePadronAutofillRazonSocial(popId, createForm.taxId, {
    enabled: Boolean(popId) && createOpenEffective && canCreate,
  })
  const editPadron = usePadronAutofillRazonSocial(popId, editForm.taxId, {
    enabled: Boolean(popId) && editRow !== null && canUpdate,
  })

  const fetchClientList = useCallback(async () => {
    if (!popId || !siteId) return
    const gen = ++fetchGenRef.current
    setListFetching(true)
    setError(null)
    try {
      const res = await getPopClientsTable(popId, listQuery)
      if (gen !== fetchGenRef.current) return
      if (!res.success) {
        setError(res.error || "Error")
        setRows([])
        setTotalCount(0)
        setCanCreate(false)
        setCanUpdate(false)
        setCanDelete(false)
        if (res.redirect) {
          setTimeout(() => routerRef.current.push(res.redirect!), 1200)
        }
        return
      }
      setRows(res.clients)
      setTotalCount(res.totalCount)
      setCanCreate(res.canCreate)
      setCanUpdate(res.canUpdate)
      setCanDelete(res.canDelete)
      setError(null)
      if (res.page !== workspaceParsed.page) {
        replaceWorkspaceQuery({ page: res.page })
      }
    } catch {
      if (gen === fetchGenRef.current) {
        setError("Unexpected error")
      }
    } finally {
      if (gen === fetchGenRef.current) {
        setListFetching(false)
      }
    }
  }, [popId, siteId, listQuery, workspaceParsed.page, replaceWorkspaceQuery])

  useEffect(() => {
    setRows([])
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
    setSelected(new Set())
  }, [searchParams])

  useEffect(() => {
    if (workspaceParsed.view === "new-client") {
      pendingCreateFromUrlRef.current = true
      replaceWorkspaceQuery({ view: "list" })
    }
  }, [workspaceParsed.view, replaceWorkspaceQuery])

  useEffect(() => {
    if (!pendingCreateFromUrlRef.current || !canCreate) return
    pendingCreateFromUrlRef.current = false
    setCreateBanner(null)
    setCreateForm(emptyForm())
    setCreateOpen(true)
  }, [canCreate])

  useEffect(() => {
    if (!createOpenEffective) return
    const t = window.setTimeout(() => {
      createTaxInputRef.current?.focus()
    }, 0)
    return () => window.clearTimeout(t)
  }, [createOpenEffective])

  useEffect(() => {
    if (!popId || !siteId) {
      setListFetching(false)
      setError("Store ID not found")
      return
    }
    void fetchClientList()
  }, [popId, siteId, fetchClientList])

  useEffect(() => {
    if (!createOpenEffective || !canCreate) return
    if (createPadron.busy) return
    if (
      !createPadron.razonSocial.trim() &&
      !createPadron.mappedIvaCondition &&
      !createPadron.domicilioFiscal.trim()
    ) {
      return
    }
    setCreateForm((f) => ({
      ...f,
      name: createPadron.razonSocial.trim() || f.name,
      ivaCondition:
        f.ivaCondition || createPadron.mappedIvaCondition || f.ivaCondition,
      addressLine:
        f.addressLine.trim() || createPadron.domicilioFiscal.trim() || f.addressLine,
    }))
  }, [
    createPadron.razonSocial,
    createPadron.mappedIvaCondition,
    createPadron.domicilioFiscal,
    createPadron.busy,
    createOpenEffective,
    canCreate,
  ])

  useEffect(() => {
    if (!editRow || !canUpdate) return
    if (editPadron.busy) return
    if (!editPadron.mappedIvaCondition && !editPadron.domicilioFiscal.trim()) {
      return
    }
    setEditForm((f) => ({
      ...f,
      ivaCondition:
        f.ivaCondition || editPadron.mappedIvaCondition || f.ivaCondition,
      addressLine:
        f.addressLine.trim() || editPadron.domicilioFiscal.trim() || f.addressLine,
    }))
  }, [
    editPadron.mappedIvaCondition,
    editPadron.domicilioFiscal,
    editPadron.busy,
    editRow,
    canUpdate,
  ])

  const openCreate = useCallback(() => {
    setCreateBanner(null)
    setCreateForm(emptyForm())
    setCreateOpen(true)
  }, [])

  const closeCreate = useCallback(() => {
    if (createSaving) return
    setCreateOpen(false)
  }, [createSaving])

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId || createSaving) return
    setCreateSaving(true)
    setCreateBanner(null)
    try {
      const res = await createPopClient(popId, createForm)
      if (!res.success) {
        setCreateBanner(res.error)
        return
      }
      setCreateOpen(false)
      setCreateForm(emptyForm())
      await fetchClientList()
    } finally {
      setCreateSaving(false)
    }
  }

  const openEdit = (row: ClientTableRow) => {
    setEditBanner(null)
    setEditRow(row)
    setEditForm({
      name: row.name,
      email: row.email,
      phone: row.phone,
      taxId: row.taxId,
      notes: row.notes,
      ivaCondition: row.ivaCondition ?? "",
      addressLine: row.addressLine,
      defaultInvoiceTypeLabel: row.defaultInvoiceTypeLabel ?? "",
      isActive: row.isActive,
    })
  }

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId || !editRow || editSaving) return
    setEditSaving(true)
    setEditBanner(null)
    try {
      const res = await updatePopClient(popId, editRow.id, editForm)
      if (!res.success) {
        setEditBanner(res.error)
        return
      }
      setEditRow(null)
      await fetchClientList()
    } finally {
      setEditSaving(false)
    }
  }

  const submitDelete = async () => {
    if (!popId || !siteId || !deleteRow) return
    setDeleteBusy(true)
    const res = await deletePopClient(popId, deleteRow.id)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteRow(null)
      return
    }
    setDeleteRow(null)
    await fetchClientList()
  }

  const skeletonRowCount = Math.min(12, Math.max(5, workspaceParsed.pageSize))

  const hasFilterChips =
    workspaceParsed.q.trim() !== "" ||
    workspaceParsed.withEmail ||
    workspaceParsed.withTaxId ||
    workspaceParsed.soloActivos

  const modalFiltersActiveCount = useMemo(() => {
    let count = 0
    if (workspaceParsed.withEmail) count++
    if (workspaceParsed.withTaxId) count++
    if (workspaceParsed.soloActivos) count++
    return count
  }, [
    workspaceParsed.withEmail,
    workspaceParsed.withTaxId,
    workspaceParsed.soloActivos,
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
    const noun = totalCount === 1 ? "cliente" : "clientes"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [listFetching, totalCount])

  const clearAllFilters = useCallback(() => {
    setSearchInput("")
    replaceWorkspaceQuery({
      q: "",
      withEmail: false,
      withTaxId: false,
      soloActivos: false,
      page: 1,
    })
    searchInputRef.current?.focus()
  }, [replaceWorkspaceQuery])

  const totalPages = useMemo(
    () =>
      Math.max(
        1,
        Math.ceil(totalCount / Math.max(1, workspaceParsed.pageSize)),
      ),
    [totalCount, workspaceParsed.pageSize],
  )

  const currentPage = workspaceParsed.page

  const pageRows = rows

  const visibleIds = useMemo(() => pageRows.map((r) => r.id), [pageRows])

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someVisibleSelected = visibleIds.some((id) => selected.has(id))

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

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Store ID not found</p>
      </div>
    )
  }

  return (
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Clientes"
      headerVariant="dark"
      contentFlush
      sidebarCollapsible={false}
      loading={bootstrapLoading || listFetching}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel}
      mainClassName="min-h-0 overflow-hidden"
      headerActions={
        canCreate ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <DataWorkspaceHeaderIconButton
                label="Nuevo cliente"
                headerVariant="dark"
                primary
                onClick={openCreate}
              >
                <Plus className="size-5" aria-hidden />
              </DataWorkspaceHeaderIconButton>
            </TooltipTrigger>
            <TooltipContent variant="dark" side="bottom" sideOffset={6}>
              Nuevo cliente
            </TooltipContent>
          </Tooltip>
        ) : null
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
                        withEmail: workspaceParsed.withEmail,
                        withTaxId: workspaceParsed.withTaxId,
                        soloActivos: workspaceParsed.soloActivos,
                      })
                      setFiltersModalOpen(true)
                    }}
                  >
                    <Filter className="size-4 shrink-0 opacity-80" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-left">
                      {modalFiltersActiveCount > 0
                        ? "Refinar filtros"
                        : "E-mail, CUIT y estado"}
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
                      placeholder="Nombre, contacto, CUIT, dirección, IVA… ( / )"
                      className={cn(
                        lightToolbarInputClass,
                        searchInput.trim().length > 0 && "pr-10",
                      )}
                      autoComplete="off"
                      spellCheck={false}
                      aria-label="Buscar clientes"
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
                    {workspaceParsed.withEmail ? (
                      <Badge variant="secondary" className={lightFilterChipClass}>
                        Con e-mail
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 shrink-0"
                          onClick={() =>
                            replaceWorkspaceQuery({ withEmail: false, page: 1 })
                          }
                          aria-label="Quitar filtro con e-mail"
                        >
                          <X className="size-3" />
                        </Button>
                      </Badge>
                    ) : null}
                    {workspaceParsed.withTaxId ? (
                      <Badge variant="secondary" className={lightFilterChipClass}>
                        Con CUIT / DNI
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 shrink-0"
                          onClick={() =>
                            replaceWorkspaceQuery({ withTaxId: false, page: 1 })
                          }
                          aria-label="Quitar filtro CUIT"
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
                            replaceWorkspaceQuery({ soloActivos: false, page: 1 })
                          }
                          aria-label="Quitar filtro solo activos"
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
                    withEmail: workspaceParsed.withEmail,
                    withTaxId: workspaceParsed.withTaxId,
                    soloActivos: workspaceParsed.soloActivos,
                  })
                }
                setFiltersModalOpen(open)
              }}
            >
              <DialogContent className="gap-0 sm:max-w-md" showCloseButton>
                <DialogHeader>
                  <DialogTitle>Filtros</DialogTitle>
                  <DialogDescription>
                    Refiná el listado por datos cargados. Se combinan con la
                    búsqueda.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-1 py-0.5 hover:bg-muted/50">
                    <Checkbox
                      checked={draftFilters.withEmail}
                      onCheckedChange={(c) =>
                        setDraftFilters((f) => ({
                          ...f,
                          withEmail: c === true,
                        }))
                      }
                      aria-label="Solo con e-mail"
                    />
                    <span className="text-sm">Solo clientes con e-mail</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-1 py-0.5 hover:bg-muted/50">
                    <Checkbox
                      checked={draftFilters.withTaxId}
                      onCheckedChange={(c) =>
                        setDraftFilters((f) => ({
                          ...f,
                          withTaxId: c === true,
                        }))
                      }
                      aria-label="Solo con CUIT o DNI"
                    />
                    <span className="text-sm">Solo con CUIT / DNI</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-1 py-0.5 hover:bg-muted/50">
                    <Checkbox
                      checked={draftFilters.soloActivos}
                      onCheckedChange={(c) =>
                        setDraftFilters((f) => ({
                          ...f,
                          soloActivos: c === true,
                        }))
                      }
                      aria-label="Solo clientes activos"
                    />
                    <span className="text-sm">Solo clientes activos</span>
                  </label>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDraftFilters(defaultClientsFilters())}
                  >
                    Restablecer
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      replaceWorkspaceQuery({
                        ...draftFilters,
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
              bulkToolbar={
                selected.size > 0 ? (
                  <div
                    className={cn(
                      "flex flex-wrap items-center gap-2 border-b border-border/80 bg-muted/35 px-3 py-2.5 sm:px-4",
                      listFetching && "pointer-events-none opacity-60",
                    )}
                    role="region"
                    aria-label="Acciones sobre selección"
                  >
                    <span className="text-sm text-foreground">
                      <span className="font-semibold">{selected.size}</span>{" "}
                      <span className="text-muted-foreground">seleccionados</span>
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="button" size="sm" variant="outline" className="h-8">
                        Eliminar selección
                      </Button>
                      <Button type="button" size="sm" variant="outline" className="h-8">
                        Exportar CSV
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className={listBulkToolbarClearButtonClass}
                        onClick={() => setSelected(new Set())}
                      >
                        Limpiar
                      </Button>
                    </div>
                  </div>
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
                  pageSizeOptions={CLIENT_TABLE_PAGE_SIZES}
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
                  <TableRow className="border-0 hover:bg-transparent">
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
                          onCheckedChange={(c) => {
                            setSelected((prev) => {
                              const next = new Set(prev)
                              if (c === true) {
                                visibleIds.forEach((id) => next.add(id))
                              } else {
                                visibleIds.forEach((id) => next.delete(id))
                              }
                              return next
                            })
                          }}
                          disabled={
                            listFetching ||
                            totalCount === 0 ||
                            pageRows.length === 0
                          }
                          aria-label="Seleccionar filas visibles"
                        />
                      </div>
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "min-w-[10rem] text-left")}>
                      Nombre
                    </TableHead>
                    <TableHead
                      className={cn(
                        lightTableThClass,
                        "w-[12rem] min-w-0 max-w-[12rem] text-left",
                      )}
                    >
                      E-mail
                    </TableHead>
                    <TableHead
                      className={cn(
                        lightTableThClass,
                        "w-[9rem] min-w-0 max-w-[9rem] text-left",
                      )}
                    >
                      Teléfono
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "w-[7.5rem] text-left")}>
                      CUIT / DNI
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "min-w-[8.5rem] text-left")}>
                      IVA
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "w-[7.25rem] text-left")}>
                      Última compra
                    </TableHead>
                    <TableHead
                      className={cn(lightTableThClass, "min-w-[8.5rem] text-right")}
                    >
                      Ventas / Total
                    </TableHead>
                    {canUpdate || canDelete ? (
                      <TableHead className={cn(lightTableThClass, "w-[7.25rem] text-right")}>
                        <span className="sr-only">Acciones</span>
                      </TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listFetching ? (
                    <WorkspaceTableSkeletonRows
                      rowCount={skeletonRowCount}
                      rowKeyPrefix="clients-sk"
                      columns={clientsSkeletonColumns({
                        hasActionsColumn: Boolean(canUpdate || canDelete),
                      })}
                    />
                  ) : totalCount === 0 ? (
                    null
                  ) : (
                    pageRows.map((r, i) => (
                      <TableRow
                        key={r.id}
                        className={cn(
                          workspaceTableBodyRowClassNames(i),
                          !r.isActive && "opacity-[0.88]",
                        )}
                      >
                        <TableCell className="w-12 !px-0 py-2 align-middle">
                          <div className={selectColumnInnerClass}>
                            <Checkbox
                              className={tableRowSelectCheckboxClass}
                              checked={selected.has(r.id)}
                              onCheckedChange={(c) => {
                                setSelected((prev) => {
                                  const next = new Set(prev)
                                  if (c === true) next.add(r.id)
                                  else next.delete(r.id)
                                  return next
                                })
                              }}
                              aria-label={`Seleccionar ${r.name || "cliente"}`}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="min-w-0 px-3 py-2.5 align-middle">
                          <p className="truncate font-medium text-foreground">
                            {r.name || "—"}
                          </p>
                          {r.addressLine.trim() ? (
                            <p
                              className="truncate text-xs text-muted-foreground"
                              title={r.addressLine}
                            >
                              {r.addressLine}
                            </p>
                          ) : null}
                          {!r.isActive ? (
                            <Badge
                              variant="outline"
                              className="mt-1 border-muted-foreground/30 text-[10px] font-normal text-muted-foreground"
                            >
                              Inactivo
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell
                          className="min-w-0 max-w-[12rem] overflow-hidden px-3 py-2.5 align-middle text-muted-foreground"
                          title={r.email.trim() ? r.email : undefined}
                        >
                          <p className="truncate">{r.email || "—"}</p>
                        </TableCell>
                        <TableCell
                          className="min-w-0 max-w-[9rem] overflow-hidden px-3 py-2.5 align-middle text-muted-foreground"
                          title={r.phone.trim() ? r.phone : undefined}
                        >
                          <p className="truncate">{r.phone || "—"}</p>
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-muted-foreground">
                          {r.taxId || "—"}
                        </TableCell>
                        <TableCell className="min-w-0 px-3 py-2.5 align-middle">
                          {r.ivaCondition ? (
                            <Badge
                              variant="secondary"
                              className="max-w-full truncate font-normal"
                              title={
                                IVA_LABEL_BY_VALUE[r.ivaCondition] ??
                                r.ivaCondition
                              }
                            >
                              <span className="truncate">
                                {IVA_LABEL_BY_VALUE[r.ivaCondition] ?? "—"}
                              </span>
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                          {formatShortSaleDate(r.lastSaleAt)}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-right align-middle">
                          {r.completedSalesCount > 0 ? (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-foreground">
                                {r.completedSalesCount.toLocaleString("es-AR")}{" "}
                                <span className="font-normal text-muted-foreground">
                                  ventas
                                </span>
                              </span>
                              <DataWorkspaceTableMoney muted>
                                <span className="text-xs">
                                  {formatArs(r.totalSpentArs)}
                                </span>
                              </DataWorkspaceTableMoney>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        {canUpdate || canDelete ? (
                          <TableCell className="px-1 py-1.5 align-middle">
                            <div className="flex items-center justify-end gap-1">
                              {canUpdate ? (
                                <DataWorkspaceTableIconAction
                                  label={`Editar ${r.name || "cliente"}`}
                                  icon={Pencil}
                                  onClick={() => openEdit(r)}
                                />
                              ) : null}
                              {canDelete ? (
                                <DataWorkspaceTableIconAction
                                  label={`Eliminar ${r.name || "cliente"}`}
                                  icon={Trash2}
                                  destructive
                                  onClick={() => setDeleteRow(r)}
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
              {!listFetching && totalCount === 0 ? (
                <div className="min-h-[12rem] flex-1" aria-hidden />
              ) : null}
              </DataWorkspaceListTableFrame>
            </DataWorkspaceListTableShell>
          </div>

      <Dialog open={createOpenEffective} onOpenChange={(o) => !o && closeCreate()}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton={!createSaving}
          className={clientDialogSurface}
        >
          <DialogHeader className={clientDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Nuevo cliente
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Datos fiscales y de contacto. Podés completar el CUIT con el padrón
              AFIP.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            onSubmit={(e) => void submitCreate(e)}
          >
            <div className={clientDialogBodyClass}>
              {createBanner ? (
                <p
                  role="alert"
                  className="mb-4 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                  {createBanner}
                </p>
              ) : null}
              <ClientUpsertFormFields
                idPrefix="cl"
                form={createForm}
                setForm={setCreateForm}
                padron={createPadron}
                comprobanteFormOptions={comprobanteFormOptions}
                suggestedComprobante={suggestedComprobanteForCreate}
                taxInputRef={createTaxInputRef}
              />
            </div>
            <DialogFooter className={clientDialogFooterClass}>
              <Button
                type="button"
                variant="outline"
                disabled={createSaving}
                onClick={closeCreate}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createSaving} className="gap-2">
                {createSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Guardando…
                  </>
                ) : (
                  "Crear cliente"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editRow !== null}
        onOpenChange={(o) => {
          if (!o && !editSaving) setEditRow(null)
        }}
      >
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton={!editSaving}
          className={clientDialogSurface}
        >
          <DialogHeader className={clientDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Editar cliente
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {editRow?.name
                ? `Actualizá los datos de ${editRow.name}.`
                : "Actualizá los datos del cliente."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            onSubmit={(e) => void submitEdit(e)}
          >
            <div className={clientDialogBodyClass}>
              {editBanner ? (
                <p
                  role="alert"
                  className="mb-4 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                  {editBanner}
                </p>
              ) : null}
              <ClientUpsertFormFields
                idPrefix="e-cl"
                form={editForm}
                setForm={setEditForm}
                padron={editPadron}
                comprobanteFormOptions={comprobanteFormOptions}
                suggestedComprobante={suggestedComprobanteForEdit}
                showPadronNameButton
              />
            </div>
            <DialogFooter className={clientDialogFooterClass}>
              <Button
                type="button"
                variant="outline"
                disabled={editSaving}
                onClick={() => setEditRow(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={editSaving} className="gap-2">
                {editSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Guardando…
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteRow !== null}
        onOpenChange={(o) => {
          if (!o && !deleteBusy) setDeleteRow(null)
        }}
      >
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton={!deleteBusy}
          className={cn(clientDialogSurface, "sm:max-w-md")}
        >
          <DialogHeader className={clientDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              ¿Eliminar cliente?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Se quitará{" "}
              <span className="font-medium text-foreground">
                {deleteRow?.name || "este cliente"}
              </span>{" "}
              de este punto de venta. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={clientDialogFooterClass}>
            <Button
              type="button"
              variant="outline"
              disabled={deleteBusy}
              onClick={() => setDeleteRow(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteBusy}
              className="gap-2"
              onClick={() => void submitDelete()}
            >
              {deleteBusy ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Eliminando…
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DataWorkspaceLayout>
  )
}

export default withAuth(ClientsPage)
