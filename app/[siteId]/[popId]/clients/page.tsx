"use client"

import "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette.css"
import {
  createPopClient,
  deletePopClient,
  updatePopClient,
  type ClientTableRow,
  type UpsertPopClientInput,
} from "@/app/[siteId]/[popId]/clients/actions"
import { CLIENT_IVA_CONDITION_OPTIONS } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import {
  getSaleComprobantePickerOptions,
} from "@/lib/saleComprobantePicker"
import { suggestSaleComprobanteForClientIva } from "@/lib/saleComprobanteRules"
import { ClientDeleteDialog } from "@/app/[siteId]/[popId]/clients/ClientDeleteDialog"
import { ClientUpsertDialog } from "@/app/[siteId]/[popId]/clients/ClientUpsertDialog"
import {
  ClientsFiltersDialog,
  defaultClientsModalFilters,
  type ClientsModalFilters,
} from "@/app/[siteId]/[popId]/clients/ClientsFiltersDialog"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListBulkToolbar } from "@/components/data-workspace/DataWorkspaceListBulkToolbar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import {
  DataWorkspaceListFiltersDialogTrigger,
  DataWorkspaceListSearchField,
} from "@/components/data-workspace/DataWorkspaceListFilterFields"
import {
  DataWorkspaceTableListPage,
  DataWorkspaceTableListNatureShell,
  DataWorkspaceTableListFiltersBar,
  DataWorkspaceTableListShell,
  DataWorkspaceTableListPaginationFooter,
  dataWorkspaceTableListHeaderVariant,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  DataWorkspaceTableIconAction,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { clientsSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import {
  selectColumnInnerClass,
  workspaceTableLayoutClassName,
  workspaceTableNatureBodyRowClassNames,
  workspaceTableNatureCheckboxClass,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutActionsBodyCellClass,
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutBodyRowClass,
  workspaceTableLayoutCellStackClass,
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutSelectBodyCellClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import {
  CLIENT_TABLE_PAGE_SIZES,
  mergeClientsWorkspaceUrl,
  parseClientsWorkspaceUrl,
} from "@/app/[siteId]/[popId]/clients/workspaceUrl"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { usePopClientsTable } from "@/hooks/usePopClientsTable"
import { popClientsQueryRoot } from "@/lib/queryKeys"
import { cn } from "@/lib/utils"
import withAuth from "@/hoc/withAuth"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { useQueryClient } from "@tanstack/react-query"
import {
  Pencil,
  Plus,
  Trash2,
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

type ClientsAppliedFilters = ClientsModalFilters

const defaultClientsFilters = defaultClientsModalFilters

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
  const queryClient = useQueryClient()

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

  const listQueryParams = useMemo(
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

  const clientsTableQuery = usePopClientsTable(popId, listQueryParams, {
    enabled: Boolean(popId && siteId),
  })

  const rows = clientsTableQuery.data?.clients ?? []
  const totalCount = clientsTableQuery.data?.totalCount ?? 0
  const canCreate = clientsTableQuery.data?.canCreate ?? false
  const canUpdate = clientsTableQuery.data?.canUpdate ?? false
  const canDelete = clientsTableQuery.data?.canDelete ?? false
  const listFetching =
    clientsTableQuery.isPending ||
    (clientsTableQuery.isFetching && !clientsTableQuery.isFetched)
  const error =
    clientsTableQuery.data?.success === false
      ? clientsTableQuery.data.error || "Error"
      : clientsTableQuery.error instanceof Error
        ? clientsTableQuery.error.message
        : clientsTableQuery.error
          ? String(clientsTableQuery.error)
          : null

  const refreshClientList = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popClientsQueryRoot(popId),
    })
  }, [popId, queryClient])

  const [searchInput, setSearchInput] = useState(workspaceParsed.q)
  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState(emptyForm)

  const [editRow, setEditRow] = useState<ClientTableRow | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editBanner, setEditBanner] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)

  const [deleteTarget, setDeleteTarget] = useState<ClientTableRow | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTyped, setDeleteTyped] = useState("")
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)

  const searchInputId = useId()
  const filtersButtonId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<ClientsAppliedFilters>(
    defaultClientsFilters,
  )

  const pageSizeLabelId = useId()
  const [selected, setSelected] = useState<Set<string>>(() => new Set())

  const createOpenEffective = createOpen && canCreate

  const createTaxInputRef = useRef<HTMLInputElement>(null)
  const pendingCreateFromUrlRef = useRef(false)

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

  useEffect(() => {
    setSearchInput(workspaceParsed.q)
  }, [workspaceParsed.q])

  useEffect(() => {
    if (clientsTableQuery.data?.success !== false || !clientsTableQuery.data.redirect) {
      return
    }
    const t = window.setTimeout(() => {
      routerRef.current.push(clientsTableQuery.data!.redirect!)
    }, 1200)
    return () => window.clearTimeout(t)
  }, [clientsTableQuery.data])

  useEffect(() => {
    if (clientsTableQuery.data?.success !== true) return
    if (clientsTableQuery.data.page !== workspaceParsed.page) {
      replaceWorkspaceQuery({ page: clientsTableQuery.data.page })
    }
  }, [clientsTableQuery.data, workspaceParsed.page, replaceWorkspaceQuery])

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
      const res = await createPopClient(popId, createForm)
      if (!res.success) {
        setCreateBanner(res.error)
        return
      }
      closeCreate()
      await refreshClientList()
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
      closeEdit()
      await refreshClientList()
    } finally {
      setEditSaving(false)
    }
  }

  const submitDelete = async () => {
    if (!popId || !siteId || !deleteTarget) return
    setDeleteBusy(true)
    setDeleteBanner(null)
    const res = await deletePopClient(popId, deleteTarget.id, deleteTyped)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteBanner(res.error)
      return
    }
    requestCloseDelete()
    await refreshClientList()
  }

  const requestCloseDelete = () => {
    setDeleteOpen(false)
  }

  const finalizeDeleteClose = () => {
    setDeleteTarget(null)
    setDeleteTyped("")
    setDeleteBanner(null)
  }

  const openDelete = (row: ClientTableRow) => {
    setDeleteTarget(row)
    setDeleteTyped("")
    setDeleteBanner(null)
    setDeleteOpen(true)
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
    <DataWorkspaceTableListPage
      layout={{
        siteId,
        popId,
        popName: bootstrap?.popName ?? "",
        title: "Clientes",
        loading: bootstrapLoading || listFetching,
        userName: bootstrap?.userFullName,
        userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
        userRoleLabel: bootstrap?.roleLabel,
        pillLabel: "CRM",
        headerActions: canCreate ? (
          <DataWorkspaceHeaderIconButton
            label="Nuevo cliente"
            headerVariant={dataWorkspaceTableListHeaderVariant}
            primary
            onClick={openCreate}
          >
            <Plus className="size-5" aria-hidden />
          </DataWorkspaceHeaderIconButton>
        ) : null,
      }}
      error={error}
    >
      <DataWorkspaceTableListNatureShell>
        <DataWorkspaceTableListFiltersBar>
          <div className={dataWorkspaceListFiltersGridClass}>
                <div className={dataWorkspaceListFiltersPanelClass}>
                  <DataWorkspaceListFiltersDialogTrigger
                    id={filtersButtonId}
                    placeholder="E-mail, CUIT y estado"
                    activeCount={modalFiltersActiveCount}
                    expanded={filtersModalOpen}
                    onClick={() => {
                      setDraftFilters({
                        withEmail: workspaceParsed.withEmail,
                        withTaxId: workspaceParsed.withTaxId,
                        soloActivos: workspaceParsed.soloActivos,
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
                    placeholder="Nombre, contacto, CUIT, dirección, IVA… ( / )"
                    resultsSummary={resultsSummary}
                  />
                </div>
              </div>
        </DataWorkspaceTableListFiltersBar>

        <ClientsFiltersDialog
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
                      onRemove={() => replaceWorkspaceQuery({ q: "", page: 1 })}
                      removeAriaLabel="Quitar búsqueda"
                    />
                  ) : null}
                  {workspaceParsed.withEmail ? (
                    <DataWorkspaceListFilterChip
                      label="Con e-mail"
                      onRemove={() =>
                        replaceWorkspaceQuery({ withEmail: false, page: 1 })
                      }
                      removeAriaLabel="Quitar filtro con e-mail"
                    />
                  ) : null}
                  {workspaceParsed.withTaxId ? (
                    <DataWorkspaceListFilterChip
                      label="Con CUIT / DNI"
                      onRemove={() =>
                        replaceWorkspaceQuery({ withTaxId: false, page: 1 })
                      }
                      removeAriaLabel="Quitar filtro CUIT"
                    />
                  ) : null}
                  {workspaceParsed.soloActivos ? (
                    <DataWorkspaceListFilterChip
                      label="Solo activos"
                      onRemove={() =>
                        replaceWorkspaceQuery({ soloActivos: false, page: 1 })
                      }
                      removeAriaLabel="Quitar filtro solo activos"
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
                className={cn(workspaceTableLayoutClassName, "min-w-[72rem]")}
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
                        "min-w-[10rem] px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Nombre
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "w-[12rem] min-w-0 max-w-[12rem] px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      E-mail
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "w-[9rem] min-w-0 max-w-[9rem] px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Teléfono
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "w-[7.5rem] px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      CUIT / DNI
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "min-w-[8.5rem] px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      IVA
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "w-[7.25rem] px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Última compra
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      align="right"
                      className={cn(
                        "min-w-[8.5rem] px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Ventas / Total
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
                      rowKeyPrefix="clients-sk"
                      columns={clientsSkeletonColumns({
                        hasActionsColumn: Boolean(canUpdate || canDelete),
                      })}
                      tone="nature"
                    />
                  ) : totalCount === 0 ? (
                    null
                  ) : (
                    pageRows.map((r, i) => (
                      <TableRow
                        key={r.id}
                        className={cn(
                          workspaceTableLayoutBodyRowClass,
                          workspaceTableNatureBodyRowClassNames(i, {
                            selected: selected.has(r.id),
                            noHover: true,
                            inactive: !r.isActive,
                          }),
                        )}
                      >
                        <TableCell className={workspaceTableLayoutSelectBodyCellClass}>
                          <div className={selectColumnInnerClass}>
                            <Checkbox
                              className={workspaceTableNatureCheckboxClass}
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
                        <TableCell className={cn(workspaceTableLayoutBodyCellClass, "min-w-[10rem]")}>
                          <p className={cn("truncate font-medium", workspaceTableNatureTextPrimaryClass)}>
                            {r.name || "—"}
                          </p>
                          {r.addressLine.trim() ? (
                            <p
                              className={cn(
                                "truncate text-xs leading-4",
                                workspaceTableNatureTextSecondaryClass,
                              )}
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
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            "min-w-0 max-w-[12rem] overflow-hidden",
                            workspaceTableNatureTextSecondaryClass,
                          )}
                          title={r.email.trim() ? r.email : undefined}
                        >
                          <p className="truncate">{r.email || "—"}</p>
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            "min-w-0 max-w-[9rem] overflow-hidden",
                            workspaceTableNatureTextSecondaryClass,
                          )}
                          title={r.phone.trim() ? r.phone : undefined}
                        >
                          <p className="truncate">{r.phone || "—"}</p>
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            workspaceTableNatureTextSecondaryClass,
                          )}
                        >
                          {r.taxId || "—"}
                        </TableCell>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
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
                            <span className={workspaceTableNatureTextSecondaryClass}>
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            "whitespace-nowrap",
                            workspaceTableNatureTextSecondaryClass,
                          )}
                        >
                          {formatShortSaleDate(r.lastSaleAt)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            "text-right align-middle",
                          )}
                        >
                          {r.completedSalesCount > 0 ? (
                            <div className={cn(workspaceTableLayoutCellStackClass, "items-end")}>
                              <span className={workspaceTableNatureTextPrimaryClass}>
                                {r.completedSalesCount.toLocaleString("es-AR")}{" "}
                                <span className={cn("font-normal", workspaceTableNatureTextSecondaryClass)}>
                                  ventas
                                </span>
                              </span>
                              <span
                                className={cn(
                                  "text-xs tabular-nums",
                                  workspaceTableNatureMoneyClass,
                                )}
                              >
                                {formatArs(r.totalSpentArs)}
                              </span>
                            </div>
                          ) : (
                            <span className={workspaceTableNatureTextSecondaryClass}>
                              —
                            </span>
                          )}
                        </TableCell>
                        {canUpdate || canDelete ? (
                          <TableCell className={workspaceTableLayoutActionsBodyCellClass}>
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
          </DataWorkspaceListTableFrame>
        </DataWorkspaceTableListShell>
      </DataWorkspaceTableListNatureShell>

      <ClientUpsertDialog
        open={createOpenEffective}
        onOpenChange={(open) => !open && closeCreate()}
        mode="create"
        title="Nuevo cliente"
        description="Datos fiscales y de contacto. Podés completar el CUIT con el padrón AFIP."
        saving={createSaving}
        banner={createBanner}
        onSubmit={(e) => void submitCreate(e)}
        onCancel={closeCreate}
        onAfterClose={finalizeCreateClose}
        idPrefix="cl"
        form={createForm}
        setForm={setCreateForm}
        padron={createPadron}
        comprobanteFormOptions={comprobanteFormOptions}
        suggestedComprobante={suggestedComprobanteForCreate}
        taxInputRef={createTaxInputRef}
      />

      <ClientUpsertDialog
        open={editRow !== null}
        onOpenChange={(open) => {
          if (!open && !editSaving) closeEdit()
        }}
        mode="edit"
        title="Editar cliente"
        description={
          editRow?.name
            ? `Actualizá los datos de ${editRow.name}.`
            : "Actualizá los datos del cliente."
        }
        saving={editSaving}
        banner={editBanner}
        onSubmit={(e) => void submitEdit(e)}
        onCancel={closeEdit}
        idPrefix="e-cl"
        form={editForm}
        setForm={setEditForm}
        padron={editPadron}
        comprobanteFormOptions={comprobanteFormOptions}
        suggestedComprobante={suggestedComprobanteForEdit}
        showPadronNameButton
      />

      {deleteTarget ? (
        <ClientDeleteDialog
          open={deleteOpen}
          clientName={deleteTarget.name}
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
    </DataWorkspaceTableListPage>
  )
}

export default withAuth(ClientsPage)
