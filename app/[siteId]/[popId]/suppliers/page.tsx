"use client"

import {
  createPopSupplier,
  deletePopSupplier,
  getPopSuppliersTable,
  updatePopSupplier,
  type SupplierTableRow,
  type UpsertPopSupplierInput,
} from "@/app/[siteId]/[popId]/suppliers/actions"
import { CLIENT_IVA_CONDITION_OPTIONS } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import {
  SupplierUpsertFormFields,
  supplierDialogBodyClass,
  supplierDialogFooterClass,
  supplierDialogHeaderClass,
  supplierDialogSurface,
} from "@/app/[siteId]/[popId]/suppliers/SupplierUpsertFormFields"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  DataWorkspaceTableIconAction,
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
  listBulkToolbarClearButtonClass,
  selectColumnInnerClass,
  tableRowSelectCheckboxClass,
  toolbarBlockLabelClass,
  workspaceDataTableClassName,
  workspaceTableBodyRowClassNames,
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
import withAuth from "@/hoc/withAuth"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { getWorkspaceHeaderForPop } from "@/lib/workspaceHeaderServer"
import { cn } from "@/lib/utils"
import {
  Filter,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { useParams, useSearchParams } from "next/navigation"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"

const SUPPLIER_PAGE_SIZES = [10, 25, 50, 100] as const
const DEFAULT_PAGE_SIZE = 25

const suppliersSk = {
  bar: "animate-pulse rounded-[3px] bg-muted-foreground/12 dark:bg-muted-foreground/[0.14]",
  barSm: "animate-pulse rounded-[3px] bg-muted-foreground/8 dark:bg-muted-foreground/11",
  pill: "animate-pulse rounded-full bg-muted-foreground/12 dark:bg-muted-foreground/[0.14]",
  box: "animate-pulse rounded-sm bg-muted-foreground/10 dark:bg-muted-foreground/[0.12]",
} as const

function SuppliersTableSkeletonRows({
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
            i % 2 === 0 ? "bg-white/30" : "bg-muted/25 dark:bg-muted/15",
          )}
          aria-hidden
        >
          <TableCell className="w-12 !px-0 py-2 align-middle">
            <div className={selectColumnInnerClass}>
              <div className={cn("mx-auto size-4 shrink-0", suppliersSk.box)} />
            </div>
          </TableCell>
          <TableCell className="min-w-0 px-3 py-2.5 align-middle">
            <div className={cn("h-3.5 w-[72%] max-w-[11rem]", suppliersSk.bar)} />
            <div
              className={cn("mt-1.5 h-2.5 w-[45%] max-w-[7rem]", suppliersSk.barSm)}
            />
          </TableCell>
          <TableCell className="min-w-0 max-w-[12rem] px-3 py-2.5 align-middle">
            <div className={cn("h-3.5 w-full max-w-[10.5rem]", suppliersSk.bar)} />
          </TableCell>
          <TableCell className="min-w-0 max-w-[9rem] px-3 py-2.5 align-middle">
            <div className={cn("h-3.5 w-[5.5rem]", suppliersSk.bar)} />
          </TableCell>
          <TableCell className="w-[7.5rem] px-3 py-2.5 align-middle">
            <div className={cn("h-3.5 w-16", suppliersSk.bar)} />
          </TableCell>
          <TableCell className="min-w-[8.5rem] px-3 py-2.5 align-middle">
            <div className={cn("inline-block h-5 w-[6.5rem]", suppliersSk.pill)} />
          </TableCell>
          {hasActionsColumn ? (
            <TableCell className="w-[7.25rem] px-1 py-1.5 align-middle">
              <div className="flex items-center justify-end gap-0.5">
                <div className={cn("size-8 shrink-0 rounded-md", suppliersSk.box)} />
                <div className={cn("size-8 shrink-0 rounded-md", suppliersSk.box)} />
              </div>
            </TableCell>
          ) : null}
        </TableRow>
      ))}
    </>
  )
}

function emptyForm(): UpsertPopSupplierInput {
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

type SuppliersAppliedFilters = {
  withEmail: boolean
  withTaxId: boolean
  soloActivos: boolean
}

const defaultSupplierFilters = (): SuppliersAppliedFilters => ({
  withEmail: false,
  withTaxId: false,
  soloActivos: false,
})

function SuppliersPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const [popName, setPopName] = useState("")
  const [rows, setRows] = useState<SupplierTableRow[]>([])
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [listFetching, setListFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState("")
  const searchInputId = useId()
  const pageSizeLabelId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const createTaxInputRef = useRef<HTMLInputElement>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const [appliedFilters, setAppliedFilters] = useState<SuppliersAppliedFilters>(
    defaultSupplierFilters,
  )
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<SuppliersAppliedFilters>(
    defaultSupplierFilters,
  )

  const [selected, setSelected] = useState<Set<string>>(() => new Set())

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState(emptyForm)

  const [editRow, setEditRow] = useState<SupplierTableRow | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editBanner, setEditBanner] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)

  const [deleteRow, setDeleteRow] = useState<SupplierTableRow | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const [workspaceHeader, setWorkspaceHeader] = useState<{
    userFullName: string
    userImageUrl: string | null
    roleLabel: string
  } | null>(null)

  const createOpenEffective = createOpen && canCreate

  const createPadron = usePadronAutofillRazonSocial(popId, createForm.taxId, {
    enabled: Boolean(popId) && createOpenEffective && canCreate,
  })
  const editPadron = usePadronAutofillRazonSocial(popId, editForm.taxId, {
    enabled: Boolean(popId) && editRow !== null && canUpdate,
  })

  const load = useCallback(async () => {
    if (!popId || !siteId) return
    const res = await getPopSuppliersTable(popId)
    if (!res.success) {
      setError(res.error || "Error")
      setRows([])
      setCanCreate(false)
      setCanUpdate(false)
      setCanDelete(false)
      setPopName(res.popName ?? "")
      return
    }
    setRows(res.suppliers)
    setPopName(res.popName)
    setCanCreate(res.canCreate)
    setCanUpdate(res.canUpdate)
    setCanDelete(res.canDelete)
    setError(null)
  }, [popId, siteId])

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

  useEffect(() => {
    const q = searchParams.get("q")?.trim()
    if (q) setSearchInput(q)
  }, [searchParams])

  useEffect(() => {
    if (!popId || !siteId) {
      setListFetching(false)
      setError("Punto de venta no encontrado")
      return
    }
    let cancelled = false
    ;(async () => {
      setListFetching(true)
      setError(null)
      try {
        await load()
        if (!cancelled) await fetchWorkspaceHeader()
      } catch {
        if (!cancelled) setError("Error inesperado")
      } finally {
        if (!cancelled) setListFetching(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [popId, siteId, load, fetchWorkspaceHeader])

  useEffect(() => {
    setPage(1)
    setSelected(new Set())
  }, [searchInput, appliedFilters])

  useEffect(() => {
    if (!createOpenEffective) return
    const t = window.setTimeout(() => {
      createTaxInputRef.current?.focus()
    }, 0)
    return () => window.clearTimeout(t)
  }, [createOpenEffective])

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

  const openCreate = useCallback(() => {
    if (!canCreate) return
    setCreateBanner(null)
    setCreateForm(emptyForm())
    setCreateOpen(true)
  }, [canCreate])

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
      const res = await createPopSupplier(popId, createForm)
      if (!res.success) {
        setCreateBanner(res.error)
        return
      }
      setCreateOpen(false)
      await load()
    } finally {
      setCreateSaving(false)
    }
  }

  const openEdit = (row: SupplierTableRow) => {
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
    if (!popId || !siteId || !editRow || editSaving) return
    setEditSaving(true)
    setEditBanner(null)
    try {
      const res = await updatePopSupplier(popId, editRow.id, editForm)
      if (!res.success) {
        setEditBanner(res.error)
        return
      }
      setEditRow(null)
      await load()
    } finally {
      setEditSaving(false)
    }
  }

  const submitDelete = async () => {
    if (!popId || !siteId || !deleteRow) return
    setDeleteBusy(true)
    const res = await deletePopSupplier(popId, deleteRow.id)
    setDeleteBusy(false)
    if (!res.success) return
    setDeleteRow(null)
    await load()
  }

  const filteredRows = useMemo(() => {
    let list = rows
    if (appliedFilters.soloActivos) {
      list = list.filter((r) => r.isActive)
    }
    if (appliedFilters.withEmail) {
      list = list.filter((r) => r.email.trim().length > 0)
    }
    if (appliedFilters.withTaxId) {
      list = list.filter((r) => r.taxId.trim().length > 0)
    }
    const q = searchInput.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.taxId.toLowerCase().includes(q) ||
        r.addressLine.toLowerCase().includes(q) ||
        (r.ivaCondition &&
          (IVA_LABEL_BY_VALUE[r.ivaCondition] ?? r.ivaCondition)
            .toLowerCase()
            .includes(q)) ||
        r.notes.toLowerCase().includes(q),
    )
  }, [rows, searchInput, appliedFilters])

  const totalCount = filteredRows.length
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize))),
    [totalCount, pageSize],
  )
  const currentPage = Math.min(Math.max(1, page), totalPages)

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, currentPage, pageSize])

  const visibleIds = useMemo(() => pageRows.map((r) => r.id), [pageRows])
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someVisibleSelected = visibleIds.some((id) => selected.has(id))

  const rangeLabel = useMemo(() => {
    if (totalCount === 0) return { start: 0, end: 0 }
    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, totalCount)
    return { start, end }
  }, [currentPage, pageSize, totalCount])

  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages, currentPage),
    [totalPages, currentPage],
  )

  const modalFiltersActiveCount = useMemo(() => {
    let count = 0
    if (appliedFilters.withEmail) count++
    if (appliedFilters.withTaxId) count++
    if (appliedFilters.soloActivos) count++
    return count
  }, [appliedFilters])

  const hasFilterChips =
    searchInput.trim() !== "" ||
    appliedFilters.withEmail ||
    appliedFilters.withTaxId ||
    appliedFilters.soloActivos

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchInput.trim()) count++
    count += modalFiltersActiveCount
    return count
  }, [searchInput, modalFiltersActiveCount])

  const resultsSummary = useMemo(() => {
    if (listFetching && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "proveedor" : "proveedores"
    if (searchInput.trim() && totalCount !== rows.length) {
      return `${totalCount.toLocaleString("es-AR")} de ${rows.length.toLocaleString("es-AR")} ${noun}`
    }
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [listFetching, totalCount, rows.length, searchInput])

  const clearAllFilters = useCallback(() => {
    setSearchInput("")
    setAppliedFilters(defaultSupplierFilters())
    searchInputRef.current?.focus()
  }, [])

  const skeletonRowCount = Math.min(12, Math.max(5, pageSize))
  const emptyCols = 6 + (canUpdate || canDelete ? 1 : 0)

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  return (
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title="Proveedores"
      headerVariant="dark"
      contentFlush
      sidebarCollapsible={false}
      loading={!popName && listFetching}
      userName={workspaceHeader?.userFullName}
      userAvatarSrc={workspaceHeader?.userImageUrl ?? undefined}
      userRoleLabel={workspaceHeader?.roleLabel ?? "Compras"}
      mainClassName="min-h-0 overflow-hidden"
      headerActions={
        canCreate ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <DataWorkspaceHeaderIconButton
                label="Nuevo proveedor"
                headerVariant="dark"
                primary
                onClick={openCreate}
              >
                <Plus className="size-5" aria-hidden />
              </DataWorkspaceHeaderIconButton>
            </TooltipTrigger>
            <TooltipContent variant="dark" side="bottom" sideOffset={6}>
              Nuevo proveedor
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
                    modalFiltersActiveCount > 0 && lightToolbarControlActiveClass,
                  )}
                  aria-haspopup="dialog"
                  aria-expanded={filtersModalOpen}
                  onClick={() => {
                    setDraftFilters({ ...appliedFilters })
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
                    aria-label="Buscar proveedores"
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
                  {searchInput.trim() ? (
                    <Badge variant="secondary" className={lightFilterChipClass}>
                      <span className="truncate">
                        Buscar: «{searchInput.trim()}»
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0"
                        onClick={() => {
                          setSearchInput("")
                          searchInputRef.current?.focus()
                        }}
                        aria-label="Quitar búsqueda"
                      >
                        <X className="size-3" />
                      </Button>
                    </Badge>
                  ) : null}
                  {appliedFilters.withEmail ? (
                    <Badge variant="secondary" className={lightFilterChipClass}>
                      Con e-mail
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0"
                        onClick={() =>
                          setAppliedFilters((f) => ({ ...f, withEmail: false }))
                        }
                        aria-label="Quitar filtro e-mail"
                      >
                        <X className="size-3" />
                      </Button>
                    </Badge>
                  ) : null}
                  {appliedFilters.withTaxId ? (
                    <Badge variant="secondary" className={lightFilterChipClass}>
                      Con CUIT
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0"
                        onClick={() =>
                          setAppliedFilters((f) => ({ ...f, withTaxId: false }))
                        }
                        aria-label="Quitar filtro CUIT"
                      >
                        <X className="size-3" />
                      </Button>
                    </Badge>
                  ) : null}
                  {appliedFilters.soloActivos ? (
                    <Badge variant="secondary" className={lightFilterChipClass}>
                      Solo activos
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0"
                        onClick={() =>
                          setAppliedFilters((f) => ({ ...f, soloActivos: false }))
                        }
                        aria-label="Quitar filtro activos"
                      >
                        <X className="size-3" />
                      </Button>
                    </Badge>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <Dialog open={filtersModalOpen} onOpenChange={setFiltersModalOpen}>
            <DialogContent
              data-rootsy-light-shell="true"
              className="border-border bg-card text-foreground sm:max-w-md"
            >
              <DialogHeader>
                <DialogTitle>Filtros del listado</DialogTitle>
                <DialogDescription>
                  Refiná qué proveedores se muestran en la tabla.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-1">
                <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2.5">
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
                  <span className="text-sm">Solo con e-mail</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2.5">
                  <Checkbox
                    checked={draftFilters.withTaxId}
                    onCheckedChange={(c) =>
                      setDraftFilters((f) => ({
                        ...f,
                        withTaxId: c === true,
                      }))
                    }
                    aria-label="Solo con CUIT"
                  />
                  <span className="text-sm">Solo con CUIT / ID fiscal</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2.5">
                  <Checkbox
                    checked={draftFilters.soloActivos}
                    onCheckedChange={(c) =>
                      setDraftFilters((f) => ({
                        ...f,
                        soloActivos: c === true,
                      }))
                    }
                    aria-label="Solo proveedores activos"
                  />
                  <span className="text-sm">Solo proveedores activos</span>
                </label>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDraftFilters(defaultSupplierFilters())}
                >
                  Restablecer
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setAppliedFilters({ ...draftFilters })
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
                pageSize={pageSize}
                pageSizeOptions={SUPPLIER_PAGE_SIZES}
                paginationItems={paginationItems}
                onPageChange={setPage}
                onPageSizeChange={(ps) => {
                  setPageSize(ps)
                  setPage(1)
                }}
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
                      CUIT / ID fiscal
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "min-w-[8.5rem] text-left")}>
                      IVA
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
                    <SuppliersTableSkeletonRows
                      rowCount={skeletonRowCount}
                      hasActionsColumn={Boolean(canUpdate || canDelete)}
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
                              aria-label={`Seleccionar ${r.name || "proveedor"}`}
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
                        {canUpdate || canDelete ? (
                          <TableCell className="px-1 py-1.5 align-middle">
                            <div className="flex items-center justify-end gap-1">
                              {canUpdate ? (
                                <DataWorkspaceTableIconAction
                                  label={`Editar ${r.name || "proveedor"}`}
                                  icon={Pencil}
                                  onClick={() => openEdit(r)}
                                />
                              ) : null}
                              {canDelete ? (
                                <DataWorkspaceTableIconAction
                                  label={`Eliminar ${r.name || "proveedor"}`}
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
      </div>

      <Dialog open={createOpenEffective} onOpenChange={(o) => !o && closeCreate()}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton={!createSaving}
          className={supplierDialogSurface}
        >
          <DialogHeader className={supplierDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Nuevo proveedor
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
            <div className={supplierDialogBodyClass}>
              {createBanner ? (
                <p
                  role="alert"
                  className="mb-4 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                  {createBanner}
                </p>
              ) : null}
              <SupplierUpsertFormFields
                idPrefix="sp"
                form={createForm}
                setForm={setCreateForm}
                padron={createPadron}
                taxInputRef={createTaxInputRef}
              />
            </div>
            <DialogFooter className={supplierDialogFooterClass}>
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
                  "Crear proveedor"
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
          className={supplierDialogSurface}
        >
          <DialogHeader className={supplierDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Editar proveedor
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {editRow?.name
                ? `Actualizá los datos de ${editRow.name}.`
                : "Actualizá los datos del proveedor."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            onSubmit={(e) => void submitEdit(e)}
          >
            <div className={supplierDialogBodyClass}>
              {editBanner ? (
                <p
                  role="alert"
                  className="mb-4 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                  {editBanner}
                </p>
              ) : null}
              <SupplierUpsertFormFields
                idPrefix="e-sp"
                form={editForm}
                setForm={setEditForm}
                padron={editPadron}
                showPadronNameButton
              />
            </div>
            <DialogFooter className={supplierDialogFooterClass}>
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
          className={cn(supplierDialogSurface, "sm:max-w-md")}
        >
          <DialogHeader className={supplierDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              ¿Eliminar proveedor?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Se quitará{" "}
              <span className="font-medium text-foreground">
                {deleteRow?.name || "este proveedor"}
              </span>{" "}
              de este punto de venta. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={supplierDialogFooterClass}>
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
              onClick={() => void submitDelete()}
            >
              {deleteBusy ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DataWorkspaceLayout>
  )
}

export default withAuth(SuppliersPage)
