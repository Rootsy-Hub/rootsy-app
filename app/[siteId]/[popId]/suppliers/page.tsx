"use client"

import {
  createPopSupplier,
  deletePopSupplier,
  getPopSuppliersTable,
  updatePopSupplier,
  type SupplierTableRow,
  type UpsertPopSupplierInput,
} from "@/app/[siteId]/[popId]/suppliers/actions"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import {
  DataWorkspaceTableIconAction,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { DataWorkspaceListTableShell } from "@/components/data-workspace/DataWorkspaceListTableShell"
import {
  lightFilterChipClass,
  lightTableThClass,
  lightToolbarClearButtonClass,
  lightToolbarInputClass,
  lightToolbarPanelLastClass,
  lightToolbarShellClass,
  toolbarBlockLabelClass,
  workspaceDataTableClassName,
  workspaceTableBodyRowClassNames,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceSectionMenu } from "@/components/layouts/DataWorkspaceSectionMenu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import withAuth from "@/hoc/withAuth"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { getWorkspaceHeaderForPop } from "@/lib/workspaceHeaderServer"
import { cn } from "@/lib/utils"
import {
  Loader2,
  Pencil,
  Plus,
  Search,
  Table2,
  Trash2,
  X,
} from "lucide-react"
import { useParams } from "next/navigation"
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

const VIEW_ITEMS = [{ id: "list", label: "Listado", icon: Table2 }] as const

const CREATION_NEW_SUPPLIER = {
  id: "new-supplier",
  label: "Nuevo proveedor",
  icon: Plus,
} as const

const suppliersSk = {
  bar: "animate-pulse rounded-[3px] bg-muted-foreground/12 dark:bg-muted-foreground/[0.14]",
  box: "animate-pulse rounded-sm bg-muted-foreground/10 dark:bg-muted-foreground/[0.12]",
} as const

function SuppliersTableFooterSkeleton() {
  return (
    <div
      className="flex min-h-16 w-full items-center justify-center px-4"
      aria-hidden
    >
      <div className={cn("h-11 w-full max-w-md rounded-lg", suppliersSk.box)} />
    </div>
  )
}

function emptyForm(): UpsertPopSupplierInput {
  return { name: "", email: "", phone: "", taxId: "", notes: "" }
}

function SuppliersPage() {
  const params = useParams()
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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

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

  const createPadron = usePadronAutofillRazonSocial(popId, createForm.taxId, {
    enabled: Boolean(popId) && createOpen && canCreate,
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

  useEffect(() => {
    setPage(1)
  }, [searchInput])

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

  const handleSectionSelect = useCallback(
    (id: string) => {
      if (id === CREATION_NEW_SUPPLIER.id) {
        openCreate()
        return
      }
      setCreateOpen(false)
    },
    [openCreate],
  )

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId) return
    setCreateSaving(true)
    setCreateBanner(null)
    const res = await createPopSupplier(popId, createForm)
    setCreateSaving(false)
    if (!res.success) {
      setCreateBanner(res.error)
      return
    }
    setCreateOpen(false)
    await load()
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
    })
  }

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId || !editRow) return
    setEditSaving(true)
    setEditBanner(null)
    const res = await updatePopSupplier(popId, editRow.id, editForm)
    setEditSaving(false)
    if (!res.success) {
      setEditBanner(res.error)
      return
    }
    setEditRow(null)
    await load()
  }

  const submitDelete = async () => {
    if (!popId || !siteId || !deleteRow) return
    setDeleteBusy(true)
    const res = await deletePopSupplier(popId, deleteRow.id)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteRow(null)
      return
    }
    setDeleteRow(null)
    await load()
  }

  const filteredRows = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.taxId.toLowerCase().includes(q) ||
        r.notes.toLowerCase().includes(q),
    )
  }, [rows, searchInput])

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

  const resultsSummary = useMemo(() => {
    if (listFetching && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "proveedor" : "proveedores"
    if (searchInput.trim() && totalCount !== rows.length) {
      return `${totalCount.toLocaleString("es-AR")} de ${rows.length.toLocaleString("es-AR")} ${noun}`
    }
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [listFetching, totalCount, rows.length, searchInput])

  const hasSearchChip = searchInput.trim().length > 0

  const clearSearch = useCallback(() => {
    setSearchInput("")
    searchInputRef.current?.focus()
  }, [])

  const creationItems = useMemo(
    () => (canCreate ? [CREATION_NEW_SUPPLIER] : []),
    [canCreate],
  )

  const sectionActiveId = createOpen ? CREATION_NEW_SUPPLIER.id : "list"
  const emptyCols = 5 + (canUpdate || canDelete ? 1 : 0)

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
      sectionMenu={
        <DataWorkspaceSectionMenu
          headerVariant="dark"
          creationItems={creationItems}
          viewItems={VIEW_ITEMS}
          activeId={sectionActiveId}
          onSelect={handleSectionSelect}
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

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            className={lightToolbarShellClass}
            role="toolbar"
            aria-label="Filtros del listado"
          >
            <div className={cn(lightToolbarPanelLastClass, "w-full")}>
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
                  placeholder="Nombre, email, teléfono, CUIT, notas… ( / )"
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
                    onClick={clearSearch}
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                ) : null}
              </div>
            </div>

            {hasSearchChip ? (
              <div
                className="border-t border-border/80 bg-card px-4 py-3"
                role="region"
                aria-label="Filtros activos"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className={toolbarBlockLabelClass}>Filtros activos</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                    onClick={clearSearch}
                  >
                    Limpiar todo
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className={lightFilterChipClass}>
                    <span className="truncate">
                      Buscar: «{searchInput.trim()}»
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0"
                      onClick={clearSearch}
                      aria-label="Quitar búsqueda"
                    >
                      <X className="size-3" />
                    </Button>
                  </Badge>
                </div>
              </div>
            ) : null}
          </div>

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
                pageSize={pageSize}
                pageSizeOptions={SUPPLIER_PAGE_SIZES}
                paginationItems={paginationItems}
                onPageChange={setPage}
                onPageSizeChange={(ps) => {
                  setPageSize(ps)
                  setPage(1)
                }}
                pageSizeLabelId={pageSizeLabelId}
                loadingSlot={<SuppliersTableFooterSkeleton />}
              />
            }
          >
            <table
              className={workspaceDataTableClassName}
              aria-busy={listFetching}
            >
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className={cn(lightTableThClass, "min-w-[10rem] text-left")}>
                    Nombre
                  </TableHead>
                  <TableHead className={cn(lightTableThClass, "w-[12rem] text-left")}>
                    Email
                  </TableHead>
                  <TableHead className={cn(lightTableThClass, "w-[9rem] text-left")}>
                    Teléfono
                  </TableHead>
                  <TableHead className={cn(lightTableThClass, "w-[7.5rem] text-left")}>
                    CUIT / ID fiscal
                  </TableHead>
                  <TableHead className={cn(lightTableThClass, "min-w-[8rem] text-left")}>
                    Notas
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
                  <TableRow>
                    <TableCell
                      colSpan={emptyCols}
                      className="py-12 text-center text-muted-foreground"
                    >
                      Cargando proveedores…
                    </TableCell>
                  </TableRow>
                ) : totalCount === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={emptyCols}
                      className="py-12 text-center text-muted-foreground"
                    >
                      {searchInput.trim()
                        ? "No hay proveedores que coincidan con la búsqueda."
                        : "No hay proveedores aún o no hay permiso de lectura."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((r, i) => (
                    <TableRow
                      key={r.id}
                      className={workspaceTableBodyRowClassNames(i)}
                    >
                      <TableCell className="min-w-0 px-3 py-2.5 align-middle">
                        <p className="truncate font-medium text-foreground">
                          {r.name || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="min-w-0 px-3 py-2.5 text-muted-foreground">
                        {r.email || "—"}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-muted-foreground">
                        {r.phone || "—"}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-muted-foreground">
                        {r.taxId || "—"}
                      </TableCell>
                      <TableCell
                        className="max-w-[180px] truncate px-3 py-2.5 text-muted-foreground"
                        title={r.notes}
                      >
                        {r.notes || "—"}
                      </TableCell>
                      {canUpdate || canDelete ? (
                        <TableCell className="px-1 py-1.5 align-middle">
                          <div className="flex items-center justify-end gap-0.5">
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
          </DataWorkspaceListTableShell>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={(o) => !o && setCreateOpen(false)}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="max-h-[min(90vh,640px)] overflow-y-auto border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Nuevo proveedor</DialogTitle>
          </DialogHeader>
          {createBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {createBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitCreate(e)}>
            <div className="space-y-2">
              <Label htmlFor="sp-name">Nombre</Label>
              <Input
                id="sp-name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sp-email">Email</Label>
              <Input
                id="sp-email"
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, email: e.target.value }))
                }
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sp-phone">Teléfono</Label>
              <Input
                id="sp-phone"
                value={createForm.phone}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sp-tax">CUIT / ID fiscal</Label>
              <Input
                id="sp-tax"
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
              <Label htmlFor="sp-notes">Notas</Label>
              <Textarea
                id="sp-notes"
                rows={3}
                value={createForm.notes}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="bg-background"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createSaving}>
                {createSaving ? "Guardando…" : "Crear"}
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
            <DialogTitle>Editar proveedor</DialogTitle>
          </DialogHeader>
          {editBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {editBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitEdit(e)}>
            <div className="space-y-2">
              <Label htmlFor="e-sp-name">Nombre</Label>
              <Input
                id="e-sp-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-sp-email">Email</Label>
              <Input
                id="e-sp-email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
                }
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-sp-phone">Teléfono</Label>
              <Input
                id="e-sp-phone"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-sp-tax">CUIT / ID fiscal</Label>
              <Input
                id="e-sp-tax"
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
              <Label htmlFor="e-sp-notes">Notas</Label>
              <Textarea
                id="e-sp-notes"
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
                Cancelar
              </Button>
              <Button type="submit" disabled={editSaving}>
                {editSaving ? "Guardando…" : "Guardar"}
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
            <DialogTitle>¿Eliminar proveedor?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Se va a quitar{" "}
            <strong className="text-foreground">
              {deleteRow?.name || "este proveedor"}
            </strong>{" "}
            de este punto de venta.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeleteRow(null)}>
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
