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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import {
  DataWorkspaceTableIconAction,
  DataWorkspaceTableMoney,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
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
  selectColumnInnerClass,
  tableRowSelectCheckboxClass,
  toolbarBlockLabelClass,
  workspaceDataTableClassName,
  workspaceTableBodyRowClassNames,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceSectionMenu } from "@/components/layouts/DataWorkspaceSectionMenu"
import {
  CLIENT_TABLE_PAGE_SIZES,
  mergeClientsWorkspaceUrl,
  parseClientsWorkspaceUrl,
} from "@/app/[siteId]/[popId]/clients/workspaceUrl"
import { getWorkspaceHeaderForPop } from "@/lib/workspaceHeaderServer"
import { cn } from "@/lib/utils"
import withAuth from "@/hoc/withAuth"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import {
  Copy,
  Filter,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Table2,
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

const clientsSk = {
  bar: "animate-pulse rounded-[3px] bg-muted-foreground/12 dark:bg-muted-foreground/[0.14]",
  barSm: "animate-pulse rounded-[3px] bg-muted-foreground/8 dark:bg-muted-foreground/11",
  pill: "animate-pulse rounded-full bg-muted-foreground/12 dark:bg-muted-foreground/[0.14]",
  box: "animate-pulse rounded-sm bg-muted-foreground/10 dark:bg-muted-foreground/[0.12]",
} as const

function ClientsTableSkeletonRows({
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
          key={`sk-${i}`}
          className={cn(
            "border-border/50",
            i % 2 === 0
              ? "bg-white/30"
              : "bg-muted/25 dark:bg-muted/15",
          )}
          aria-hidden
        >
          <TableCell className="w-12 !px-0 py-2 align-middle">
            <div className={selectColumnInnerClass}>
              <div
                className={cn("mx-auto size-4 shrink-0", clientsSk.box)}
              />
            </div>
          </TableCell>
          <TableCell className="min-w-0 px-3 py-2.5 align-middle">
            <div className={cn("h-3.5 w-[72%] max-w-[11rem]", clientsSk.bar)} />
            <div
              className={cn("mt-1.5 h-2.5 w-[45%] max-w-[7rem]", clientsSk.barSm)}
            />
          </TableCell>
          <TableCell className="min-w-0 max-w-[12rem] px-3 py-2.5 align-middle">
            <div className={cn("h-3.5 w-full max-w-[10.5rem]", clientsSk.bar)} />
          </TableCell>
          <TableCell className="min-w-0 max-w-[9rem] px-3 py-2.5 align-middle">
            <div className={cn("h-3.5 w-[5.5rem]", clientsSk.bar)} />
          </TableCell>
          <TableCell className="w-[7.5rem] px-3 py-2.5 align-middle">
            <div className={cn("h-3.5 w-16", clientsSk.bar)} />
          </TableCell>
          <TableCell className="min-w-[8.5rem] px-3 py-2.5 align-middle">
            <div className={cn("inline-block h-5 w-[6.5rem]", clientsSk.pill)} />
          </TableCell>
          <TableCell className="w-[7.25rem] whitespace-nowrap px-3 py-2.5 align-middle">
            <div className={cn("h-3.5 w-[4.5rem]", clientsSk.bar)} />
          </TableCell>
          <TableCell className="min-w-[8.5rem] px-3 py-2.5 text-right align-middle tabular-nums">
            <div className="flex flex-col items-end gap-1">
              <div className={cn("h-3 w-24", clientsSk.bar)} />
              <div className={cn("h-2.5 w-20", clientsSk.barSm)} />
            </div>
          </TableCell>
          {hasActionsColumn ? (
            <TableCell className="w-[7.25rem] px-1 py-1.5 align-middle">
              <div className="flex items-center justify-end gap-0.5">
                <div className={cn("size-8 shrink-0 rounded-md", clientsSk.box)} />
                <div className={cn("size-8 shrink-0 rounded-md", clientsSk.box)} />
                <div className={cn("size-8 shrink-0 rounded-md", clientsSk.box)} />
              </div>
            </TableCell>
          ) : null}
        </TableRow>
      ))}
    </>
  )
}

function ClientsTableFooterSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4"
      aria-hidden
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <div className={cn("h-3.5 w-52 max-w-[min(100%,20rem)]", clientsSk.bar)} />
        <div className={cn("h-8 w-[4.25rem] rounded-md", clientsSk.box)} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
        <div className={cn("size-8 rounded-md", clientsSk.box)} />
        <div className={cn("h-8 w-36 rounded-md", clientsSk.box)} />
        <div className={cn("size-8 rounded-md", clientsSk.box)} />
      </div>
    </div>
  )
}

function emptyForm(): UpsertPopClientInput {
  return {
    name: "",
    email: "",
    phone: "",
    taxId: "",
    notes: "",
    ivaCondition: "",
    addressLine: "",
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

const VIEW_ITEMS = [
  { id: "list", label: "Listado", icon: Table2 },
] as const

const CREATION_NEW_CLIENT = {
  id: "new-client",
  label: "Nuevo cliente",
  icon: Plus,
} as const

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

  const [popName, setPopName] = useState("")
  const [rows, setRows] = useState<ClientTableRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [listFetching, setListFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchGenRef = useRef(0)

  const [searchInput, setSearchInput] = useState(workspaceParsed.q)
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
  const [workspaceHeader, setWorkspaceHeader] = useState<{
    userFullName: string
    userImageUrl: string | null
    roleLabel: string
  } | null>(null)

  const sidebarActiveId =
    workspaceParsed.view === "new-client"
      ? CREATION_NEW_CLIENT.id
      : workspaceParsed.view

  const createOpen = Boolean(
    canCreate && workspaceParsed.view === "new-client",
  )

  const createPadron = usePadronAutofillRazonSocial(popId, createForm.taxId, {
    enabled: Boolean(popId) && createOpen && canCreate,
  })
  const editPadron = usePadronAutofillRazonSocial(popId, editForm.taxId, {
    enabled: Boolean(popId) && editRow !== null && canUpdate,
  })

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

  const fetchClientList = useCallback(async () => {
    if (!popId || !siteId) return
    const gen = ++fetchGenRef.current
    setListFetching(true)
    setError(null)
    try {
      const tableInput = {
        page: workspaceParsed.page,
        pageSize: workspaceParsed.pageSize,
        search: workspaceParsed.q,
        soloActivos: workspaceParsed.soloActivos,
        withEmail: workspaceParsed.withEmail,
        withTaxId: workspaceParsed.withTaxId,
      }
      const res = await getPopClientsTable(popId, tableInput)
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
      setPopName(res.popName)
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
  }, [popId, siteId, workspaceParsed, replaceWorkspaceQuery])

  useEffect(() => {
    setPopName("")
    setRows([])
    setTotalCount(0)
  }, [popId])

  useEffect(() => {
    if (!popId || !siteId) return
    void fetchWorkspaceHeader()
  }, [popId, siteId, fetchWorkspaceHeader])

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
    if (workspaceParsed.view !== "new-client" || canCreate) return
    replaceWorkspaceQuery({ view: "list" })
  }, [workspaceParsed.view, canCreate, replaceWorkspaceQuery])

  useEffect(() => {
    if (!popId || !siteId) {
      setListFetching(false)
      setError("Store ID not found")
      return
    }
    void fetchClientList()
  }, [popId, siteId, fetchClientList])

  useEffect(() => {
    if (!createOpen || !canCreate) return
    if (createPadron.busy) return
    if (!createPadron.razonSocial.trim()) return
    setCreateForm((f) => ({ ...f, name: createPadron.razonSocial }))
  }, [createPadron.razonSocial, createPadron.busy, createOpen, canCreate])

  useEffect(() => {
    if (!editRow || !canUpdate) return
    if (editPadron.busy) return
    if (!editPadron.razonSocial.trim()) return
    setEditForm((f) => ({ ...f, name: editPadron.razonSocial }))
  }, [editPadron.razonSocial, editPadron.busy, editRow, canUpdate])

  const openCreate = useCallback(() => {
    setCreateBanner(null)
    setCreateForm(emptyForm())
    replaceWorkspaceQuery({ view: "new-client" })
  }, [replaceWorkspaceQuery])

  const handleSidebarSelect = useCallback(
    (id: string) => {
      if (id === CREATION_NEW_CLIENT.id) {
        openCreate()
        return
      }
      replaceWorkspaceQuery({ view: id })
    },
    [openCreate, replaceWorkspaceQuery],
  )

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId) return
    setCreateSaving(true)
    setCreateBanner(null)
    const res = await createPopClient(popId, createForm)
    setCreateSaving(false)
    if (!res.success) {
      setCreateBanner(res.error)
      return
    }
    replaceWorkspaceQuery({ view: "list" })
    await fetchClientList()
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
      isActive: row.isActive,
    })
  }

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId || !editRow) return
    setEditSaving(true)
    setEditBanner(null)
    const res = await updatePopClient(popId, editRow.id, editForm)
    setEditSaving(false)
    if (!res.success) {
      setEditBanner(res.error)
      return
    }
    setEditRow(null)
    await fetchClientList()
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

  const emptyCols = 1 + 7 + (canUpdate || canDelete ? 1 : 0)
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

  const sectionActiveId = sidebarActiveId

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

  const creationItems = useMemo(
    () => (canCreate ? [CREATION_NEW_CLIENT] : []),
    [canCreate],
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
      popName={popName}
      title="Clientes"
      headerVariant="dark"
      contentFlush
      sidebarCollapsible={false}
      loading={!popName && listFetching}
      userName={workspaceHeader?.userFullName}
      userAvatarSrc={workspaceHeader?.userImageUrl ?? undefined}
      userRoleLabel={workspaceHeader?.roleLabel}
      mainClassName="min-h-0 overflow-hidden"
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
        workspaceParsed.view === "new-client" ? (
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
                        className="h-8 text-muted-foreground"
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
                  loadingSlot={<ClientsTableFooterSkeleton />}
                />
              }
            >
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
                    <ClientsTableSkeletonRows
                      rowCount={skeletonRowCount}
                      hasActionsColumn={Boolean(canUpdate || canDelete)}
                    />
                  ) : totalCount === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={emptyCols}
                        className="py-12 text-center text-muted-foreground"
                      >
                        No hay clientes que coincidan con la búsqueda o los filtros,
                        o no tenés permiso de lectura.
                      </TableCell>
                    </TableRow>
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
                            <div className="flex items-center justify-end gap-0.5">
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
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                                    aria-label={`Más opciones: ${r.name || r.id}`}
                                  >
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem
                                    className="gap-2"
                                    disabled
                                  >
                                    <Copy className="size-4" aria-hidden />
                                    Duplicar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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

      <Dialog
        open={createOpen}
        onOpenChange={(o) => {
          if (!o) replaceWorkspaceQuery({ view: "list" })
        }}
      >
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="max-h-[min(90vh,640px)] overflow-y-auto border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>New client</DialogTitle>
          </DialogHeader>
          {createBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {createBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitCreate(e)}>
            <div className="space-y-2">
              <Label htmlFor="cl-name">Name</Label>
              <Input
                id="cl-name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cl-email">Email</Label>
              <Input
                id="cl-email"
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, email: e.target.value }))
                }
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cl-phone">Phone</Label>
              <Input
                id="cl-phone"
                value={createForm.phone}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cl-tax">CUIT / DNI</Label>
              <Input
                id="cl-tax"
                value={createForm.taxId}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, taxId: e.target.value }))
                }
                className="bg-background"
                placeholder="Opcional — completa la razón social automáticamente"
              />
              {createPadron.busy ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Consultando padrón…
                </p>
              ) : createPadron.error ? (
                <p className="text-xs text-destructive">{createPadron.error}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cl-iva">Condición IVA</Label>
              <Select
                value={createForm.ivaCondition || "__none__"}
                onValueChange={(v) =>
                  setCreateForm((f) => ({
                    ...f,
                    ivaCondition: v === "__none__" ? "" : v,
                  }))
                }
              >
                <SelectTrigger id="cl-iva" className="bg-background">
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin definir</SelectItem>
                  {CLIENT_IVA_CONDITION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cl-address">Dirección</Label>
              <Input
                id="cl-address"
                value={createForm.addressLine}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, addressLine: e.target.value }))
                }
                className="bg-background"
                placeholder="Calle, localidad (opcional)"
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 px-3 py-3">
              <div className="min-w-0 space-y-0.5">
                <Label htmlFor="cl-active" className="text-foreground">
                  Cliente activo
                </Label>
                <p className="text-xs text-muted-foreground">
                  Para ocultarlos del listado usá el filtro «Solo clientes activos».
                </p>
              </div>
              <Switch
                id="cl-active"
                checked={createForm.isActive}
                onCheckedChange={(c) =>
                  setCreateForm((f) => ({ ...f, isActive: c }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cl-notes">Notes</Label>
              <Textarea
                id="cl-notes"
                rows={3}
                value={createForm.notes}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="bg-background"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => replaceWorkspaceQuery({ view: "list" })}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createSaving}>
                {createSaving ? "Saving…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editRow !== null} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="max-h-[min(90vh,640px)] overflow-y-auto border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Edit client</DialogTitle>
          </DialogHeader>
          {editBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {editBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitEdit(e)}>
            <div className="space-y-2">
              <Label htmlFor="e-cl-name">Name</Label>
              <Input
                id="e-cl-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-cl-email">Email</Label>
              <Input
                id="e-cl-email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
                }
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-cl-phone">Phone</Label>
              <Input
                id="e-cl-phone"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-cl-tax">CUIT / DNI</Label>
              <Input
                id="e-cl-tax"
                value={editForm.taxId}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, taxId: e.target.value }))
                }
                className="bg-background"
                placeholder="Opcional — completa la razón social automáticamente"
              />
              {editPadron.busy ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Consultando padrón…
                </p>
              ) : editPadron.error ? (
                <p className="text-xs text-destructive">{editPadron.error}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-cl-iva">Condición IVA</Label>
              <Select
                value={editForm.ivaCondition || "__none__"}
                onValueChange={(v) =>
                  setEditForm((f) => ({
                    ...f,
                    ivaCondition: v === "__none__" ? "" : v,
                  }))
                }
              >
                <SelectTrigger id="e-cl-iva" className="bg-background">
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin definir</SelectItem>
                  {CLIENT_IVA_CONDITION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-cl-address">Dirección</Label>
              <Input
                id="e-cl-address"
                value={editForm.addressLine}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, addressLine: e.target.value }))
                }
                className="bg-background"
                placeholder="Calle, localidad (opcional)"
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 px-3 py-3">
              <div className="min-w-0 space-y-0.5">
                <Label htmlFor="e-cl-active" className="text-foreground">
                  Cliente activo
                </Label>
                <p className="text-xs text-muted-foreground">
                  Para ocultarlos del listado usá el filtro «Solo clientes activos».
                </p>
              </div>
              <Switch
                id="e-cl-active"
                checked={editForm.isActive}
                onCheckedChange={(c) =>
                  setEditForm((f) => ({ ...f, isActive: c }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-cl-notes">Notes</Label>
              <Textarea
                id="e-cl-notes"
                rows={3}
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="bg-background"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setEditRow(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editSaving}>
                {editSaving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteRow !== null} onOpenChange={(o) => !o && setDeleteRow(null)}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Delete client?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will remove{" "}
            <strong className="text-foreground">
              {deleteRow?.name || "this client"}
            </strong>{" "}
            from this store.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeleteRow(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteBusy}
              onClick={() => void submitDelete()}
            >
              {deleteBusy ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DataWorkspaceLayout>
  )
}

export default withAuth(ClientsPage)
