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
import { SupplierDeleteDialog } from "@/app/[siteId]/[popId]/suppliers/SupplierDeleteDialog"
import { SupplierUpsertDialog } from "@/app/[siteId]/[popId]/suppliers/SupplierUpsertDialog"
import {
  SuppliersFiltersDialog,
  defaultSuppliersModalFilters,
  type SuppliersModalFilters,
} from "@/app/[siteId]/[popId]/suppliers/SuppliersFiltersDialog"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import {
  DataWorkspaceListFiltersDialogTrigger,
  DataWorkspaceListSearchField,
} from "@/components/data-workspace/DataWorkspaceListFilterFields"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  DataWorkspaceTableIconAction,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { suppliersSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import { DataWorkspaceListTableShell } from "@/components/data-workspace/DataWorkspaceListTableShell"
import {
  lightTableThClass,
  listBulkToolbarClearButtonClass,
  selectColumnInnerClass,
  tableRowSelectCheckboxClass,
  workspaceDataTableClassName,
  workspaceTableBodyRowClassNames,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersBarClass,
  dataWorkspaceListFiltersBarInnerClass,
  dataWorkspaceListFiltersBarRowClass,
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { cn } from "@/lib/utils"
import {
  Pencil,
  Plus,
  Trash2,
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

type SuppliersAppliedFilters = SuppliersModalFilters

const defaultSupplierFilters = defaultSuppliersModalFilters

function SuppliersPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, loading: bootstrapLoading } = usePopWorkspace()

  const [rows, setRows] = useState<SupplierTableRow[]>([])
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [listFetching, setListFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState("")
  const searchInputId = useId()
  const filtersButtonId = useId()
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

  const [deleteTarget, setDeleteTarget] = useState<SupplierTableRow | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTyped, setDeleteTyped] = useState("")
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)

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
      return
    }
    setRows(res.suppliers)
    setCanCreate(res.canCreate)
    setCanUpdate(res.canUpdate)
    setCanDelete(res.canDelete)
    setError(null)
  }, [popId, siteId])

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
      } catch {
        if (!cancelled) setError("Error inesperado")
      } finally {
        if (!cancelled) setListFetching(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [popId, siteId, load])

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
    setCreateOpen(false)
    setCreateBanner(null)
  }, [])

  const finalizeCreateClose = useCallback(() => {
    setCreateForm(emptyForm())
  }, [])

  const closeEdit = useCallback(() => {
    setEditRow(null)
    setEditBanner(null)
  }, [])

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
      closeCreate()
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
      closeEdit()
      await load()
    } finally {
      setEditSaving(false)
    }
  }

  const submitDelete = async () => {
    if (!popId || !siteId || !deleteTarget) return
    setDeleteBusy(true)
    setDeleteBanner(null)
    const res = await deletePopSupplier(popId, deleteTarget.id, deleteTyped)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteBanner(res.error)
      return
    }
    requestCloseDelete()
    await load()
  }

  const requestCloseDelete = () => {
    setDeleteOpen(false)
  }

  const finalizeDeleteClose = () => {
    setDeleteTarget(null)
    setDeleteTyped("")
    setDeleteBanner(null)
  }

  const openDelete = (row: SupplierTableRow) => {
    setDeleteTarget(row)
    setDeleteTyped("")
    setDeleteBanner(null)
    setDeleteOpen(true)
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
    setPage(1)
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
      popName={bootstrap?.popName ?? ""}
      title="Proveedores"
      headerVariant="dark"
      contentFlush
      sidebarCollapsible={false}
      loading={bootstrapLoading || listFetching}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      mainClassName="rootsy-nature-palette min-h-0 overflow-hidden"
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
                  <DataWorkspaceListFiltersDialogTrigger
                    id={filtersButtonId}
                    placeholder="E-mail, CUIT y estado"
                    activeCount={modalFiltersActiveCount}
                    expanded={filtersModalOpen}
                    onClick={() => {
                      setDraftFilters({ ...appliedFilters })
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
                    placeholder="Nombre, contacto, CUIT, dirección, IVA… ( / )"
                    resultsSummary={resultsSummary}
                  />
                </div>
              </div>
            </div>
          </div>

          <SuppliersFiltersDialog
            open={filtersModalOpen}
            onOpenChange={(open) => {
              if (open) {
                setDraftFilters({ ...appliedFilters })
              }
              setFiltersModalOpen(open)
            }}
            draft={draftFilters}
            onDraftChange={setDraftFilters}
            onApply={() => {
              setAppliedFilters({ ...draftFilters })
              setPage(1)
              setFiltersModalOpen(false)
            }}
          />

          <DataWorkspaceListTableShell
            variant="flush"
            activeFiltersBar={
              hasFilterChips ? (
                <DataWorkspaceListActiveFiltersBar
                  activeCount={activeFilterCount}
                  onClearAll={clearAllFilters}
                >
                  {searchInput.trim() ? (
                    <DataWorkspaceListFilterChip
                      label={`Buscar: «${searchInput.trim()}»`}
                      onRemove={() => {
                        setSearchInput("")
                        searchInputRef.current?.focus()
                      }}
                      removeAriaLabel="Quitar búsqueda"
                    />
                  ) : null}
                  {appliedFilters.withEmail ? (
                    <DataWorkspaceListFilterChip
                      label="Con e-mail"
                      onRemove={() =>
                        setAppliedFilters((f) => ({ ...f, withEmail: false }))
                      }
                      removeAriaLabel="Quitar filtro con e-mail"
                    />
                  ) : null}
                  {appliedFilters.withTaxId ? (
                    <DataWorkspaceListFilterChip
                      label="Con CUIT / ID fiscal"
                      onRemove={() =>
                        setAppliedFilters((f) => ({ ...f, withTaxId: false }))
                      }
                      removeAriaLabel="Quitar filtro CUIT"
                    />
                  ) : null}
                  {appliedFilters.soloActivos ? (
                    <DataWorkspaceListFilterChip
                      label="Solo activos"
                      onRemove={() =>
                        setAppliedFilters((f) => ({ ...f, soloActivos: false }))
                      }
                      removeAriaLabel="Quitar filtro solo activos"
                    />
                  ) : null}
                </DataWorkspaceListActiveFiltersBar>
              ) : null
            }
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
                    <WorkspaceTableSkeletonRows
                      rowCount={skeletonRowCount}
                      rowKeyPrefix="suppliers-sk"
                      columns={suppliersSkeletonColumns({
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
                                  onClick={() => openDelete(r)}
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

      <SupplierUpsertDialog
        open={createOpenEffective}
        onOpenChange={(open) => !open && closeCreate()}
        mode="create"
        title="Nuevo proveedor"
        description="Datos fiscales y de contacto. Podés completar el CUIT con el padrón AFIP."
        saving={createSaving}
        banner={createBanner}
        onSubmit={(e) => void submitCreate(e)}
        onCancel={closeCreate}
        onAfterClose={finalizeCreateClose}
        idPrefix="sp"
        form={createForm}
        setForm={setCreateForm}
        padron={createPadron}
        taxInputRef={createTaxInputRef}
      />

      <SupplierUpsertDialog
        open={editRow !== null}
        onOpenChange={(open) => {
          if (!open && !editSaving) closeEdit()
        }}
        mode="edit"
        title="Editar proveedor"
        description={
          editRow?.name
            ? `Actualizá los datos de ${editRow.name}.`
            : "Actualizá los datos del proveedor."
        }
        saving={editSaving}
        banner={editBanner}
        onSubmit={(e) => void submitEdit(e)}
        onCancel={closeEdit}
        idPrefix="e-sp"
        form={editForm}
        setForm={setEditForm}
        padron={editPadron}
        showPadronNameButton
      />

      {deleteTarget ? (
        <SupplierDeleteDialog
          open={deleteOpen}
          supplierName={deleteTarget.name}
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
    </DataWorkspaceLayout>
  )
}

export default withAuth(SuppliersPage)
