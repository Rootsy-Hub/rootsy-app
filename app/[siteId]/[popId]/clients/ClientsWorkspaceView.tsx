"use client"

import "@/app/library/color/rootsyNaturePalette.css"
import { RootsIconButton } from "@/components/rootsy-button"
import type {
  ClientTableRow,
  UpsertPopClientInput,
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
  tableListInfiniteFromQuery,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import { DataWorkspaceTableListPageDock } from "@/components/data-workspace/DataWorkspaceTableInfinitePageDock"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  WorkspaceTableStatusBadge,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT,
  WorkspaceTableSkeletonRows,
} from "@/components/data-workspace/WorkspaceTableSkeleton"
import { clientsSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import {
  selectColumnInnerClass,
  workspaceTableLayoutClassName,
  workspaceTableNatureLinkClass,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureStockOkClass,
  workspaceTableNatureTextPrimaryClass,
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
  workspaceTableLayoutSelectBodyCellClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableSelectCell,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { WorkspaceTableSortHead } from "@/components/data-workspace/WorkspaceTableSortHead"
import {
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  mergeClientsWorkspaceUrl,
  parseClientsWorkspaceUrl,
  type ClientTableSortKey,
} from "@/app/[siteId]/[popId]/clients/workspaceUrl"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
} from "@/lib/workspaceTableSort"
import { PopModuleLoading } from "@/app/[siteId]/[popId]/PopModuleLoading"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { usePopClientsTable } from "@/hooks/usePopClientsTable"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import { invalidateDataWorkspaceTableInfinite } from "@/lib/dataWorkspaceTableInfinite"
import { popClientsQueryRoot } from "@/lib/queryKeys"
import { formatMoneyInputForField } from "@/lib/moneyInput"
import {
  createPopClient,
  deletePopClient,
  updatePopClient,
} from "@/lib/rootsyApi/clientsClient"
import { cn } from "@/lib/utils"
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
} from "@/lib/pop-spa/navigation"
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
    currentAccountEnabled: false,
    currentAccountCreditLimit: "",
    currentAccountTermDays: "30",
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

export function ClientsWorkspaceView() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, hasPermission } =
    usePopWorkspace()
  const afterHydration = useAfterHydration()
  const menuCache = usePopMenuCache(popId)
  const queryClient = useQueryClient()
  const [workspaceSearch, setWorkspaceSearch] = useState(() =>
    searchParams.toString(),
  )

  useEffect(() => {
    setWorkspaceSearch(searchParams.toString())
  }, [searchParams])

  const workspaceParams = useMemo(
    () => new URLSearchParams(workspaceSearch),
    [workspaceSearch],
  )
  const workspaceParsed = useMemo(
    () => parseClientsWorkspaceUrl(workspaceParams),
    [workspaceParams],
  )

  const replaceWorkspaceQuery = useCallback(
    (patch: Parameters<typeof mergeClientsWorkspaceUrl>[1]) => {
      const qs = mergeClientsWorkspaceUrl(workspaceParams, patch)
      const next = qs ? `${pathname}?${qs}` : pathname
      if (typeof window !== "undefined") {
        const current = `${window.location.pathname}${window.location.search}`
        if (current !== next) {
          window.history.replaceState(window.history.state, "", next)
        }
      }
      setWorkspaceSearch(qs)
    },
    [pathname, workspaceParams],
  )

  const listQueryParams = useMemo(
    () => ({
      page: workspaceParsed.page,
      pageSize: workspaceParsed.pageSize,
      search: workspaceParsed.q,
      soloActivos: workspaceParsed.soloActivos,
      withEmail: workspaceParsed.withEmail,
      withTaxId: workspaceParsed.withTaxId,
      sort: workspaceParsed.sort,
      ord: workspaceParsed.ord,
    }),
    [
      workspaceParsed.page,
      workspaceParsed.pageSize,
      workspaceParsed.q,
      workspaceParsed.soloActivos,
      workspaceParsed.withEmail,
      workspaceParsed.withTaxId,
      workspaceParsed.sort,
      workspaceParsed.ord,
    ],
  )

  const handleSortColumn = useCallback(
    (column: ClientTableSortKey) => {
      const next = nextWorkspaceTableSortState(
        { sort: workspaceParsed.sort, ord: workspaceParsed.ord },
        column,
      )
      replaceWorkspaceQuery({
        sort: next.sort as ClientTableSortKey | null,
        ord: next.ord,
      })
    },
    [replaceWorkspaceQuery, workspaceParsed.ord, workspaceParsed.sort],
  )

  const sortDirection = useCallback(
    (column: ClientTableSortKey) =>
      workspaceTableSortDisplayDirection(
        { sort: workspaceParsed.sort, ord: workspaceParsed.ord },
        column,
      ),
    [workspaceParsed.ord, workspaceParsed.sort],
  )

  const clientsTableQuery = usePopClientsTable(popId, listQueryParams, {
    enabled: Boolean(popId && siteId),
  })

  const rows = clientsTableQuery.data?.clients ?? []
  const totalCount = clientsTableQuery.data?.totalCount ?? 0
  const clientPerm = useCallback(
    (perm: { resource: string; action: string }) =>
      afterHydration &&
      (hasPermission(perm.resource, perm.action) ||
        (menuCache.popAccess
          ? hasPopAccessPermission(
              menuCache.popAccess,
              perm.resource,
              perm.action,
            )
          : false)),
    [afterHydration, hasPermission, menuCache.popAccess],
  )
  const canCreate = clientPerm(POP_PERMS.CLIENT_CREATE)
  const canUpdate = clientPerm(POP_PERMS.CLIENT_UPDATE)
  const canDelete = clientPerm(POP_PERMS.CLIENT_DELETE)
  const listPending = !clientsTableQuery.data && clientsTableQuery.isPending
  const listFetching = !clientsTableQuery.data && clientsTableQuery.isPending
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
    await invalidateDataWorkspaceTableInfinite(
      queryClient,
      popClientsQueryRoot(popId),
    )
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
  }, [
    workspaceParsed.q,
    workspaceParsed.page,
    workspaceParsed.pageSize,
    workspaceParsed.soloActivos,
    workspaceParsed.withEmail,
    workspaceParsed.withTaxId,
    workspaceParsed.sort,
    workspaceParsed.ord,
  ])

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
      currentAccountEnabled: row.currentAccountEnabled,
      currentAccountCreditLimit: row.currentAccountCreditLimit
        ? formatMoneyInputForField(row.currentAccountCreditLimit)
        : "",
      currentAccountTermDays: String(row.currentAccountTermDays),
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

  const skeletonRowCount = DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT

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

  const pageRows = rows

  const visibleIds = useMemo(() => pageRows.map((r) => r.id), [pageRows])

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someVisibleSelected = visibleIds.some((id) => selected.has(id))

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado</p>
      </div>
    )
  }

  if (listPending) {
    return <PopModuleLoading moduleKey="clients" />
  }

  const popName = bootstrap?.popName ?? ""

  return (
    <DataWorkspaceTableListPage
      layout={{
        siteId,
        popId,
        popName,
        title: "Clientes",
        loading: !popName,
        userName: bootstrap?.userFullName,
        userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
        userRoleLabel: bootstrap?.roleLabel,
        pillLabel: "CRM",
        headerActions:
          !afterHydration || canCreate ? (
            <RootsIconButton
              label="Nuevo cliente"
              semantic="primary"
              atmosphere="eter"
              size="default"
              disabled={!canCreate}
              onClick={openCreate}
            >
              <Plus className="size-5" aria-hidden />
            </RootsIconButton>
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
          lockScroll={listFetching}
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
            footerFloating
            footerFloatingCentered
            scrollResetKey={workspaceParsed.page}
            footer={
              <DataWorkspaceTableListPageDock
                listFetching={listFetching}
                loadedCount={rows.length}
                totalCount={totalCount}
                page={workspaceParsed.page}
                onPageJump={(nextPage) => replaceWorkspaceQuery({ page: nextPage })}
              />
            }
            infinite={tableListInfiniteFromQuery(clientsTableQuery, "clients")}
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
                    <WorkspaceTableSortHead
                      tone="nature"
                      label="Nombre"
                      direction={sortDirection("name")}
                      onSort={() => handleSortColumn("name")}
                      className={cn(
                        "min-w-[10rem] px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    />
                    <WorkspaceTableSortHead
                      tone="nature"
                      label="E-mail"
                      direction={sortDirection("email")}
                      onSort={() => handleSortColumn("email")}
                      className={cn(
                        "w-[12rem] min-w-0 max-w-[12rem] px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    />
                    <WorkspaceTableSortHead
                      tone="nature"
                      label="Teléfono"
                      direction={sortDirection("phone")}
                      onSort={() => handleSortColumn("phone")}
                      className={cn(
                        "w-[9rem] min-w-0 max-w-[9rem] px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    />
                    <WorkspaceTableSortHead
                      tone="nature"
                      label="CUIT / DNI"
                      direction={sortDirection("tax_id")}
                      onSort={() => handleSortColumn("tax_id")}
                      className={cn(
                        "w-[7.5rem] px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    />
                    <WorkspaceTableSortHead
                      tone="nature"
                      label="IVA"
                      direction={sortDirection("iva")}
                      onSort={() => handleSortColumn("iva")}
                      className={cn(
                        "min-w-[8.5rem] px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    />
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
                      <WorkspaceTableBodyRow
                        key={r.id}
                        index={i}
                        selected={selected.has(r.id)}
                        inactive={!r.isActive}
                      >
                        <WorkspaceTableSelectCell
                          tone="nature"
                          checked={selected.has(r.id)}
                          onCheckedChange={(c) => {
                            setSelected((prev) => {
                              const next = new Set(prev)
                              if (c === true) next.add(r.id)
                              else next.delete(r.id)
                              return next
                            })
                          }}
                          ariaLabel={`Seleccionar ${r.name || "cliente"}`}
                        />
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
                          <WorkspaceTableStatusBadge
                            status={r.isActive ? "activo" : "inactivo"}
                            className="mt-1"
                          >
                            {r.isActive ? "Activo" : "Inactivo"}
                          </WorkspaceTableStatusBadge>
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            "min-w-0 max-w-[12rem] overflow-hidden",
                            workspaceTableNatureTextSecondaryClass,
                          )}
                          title={r.email.trim() ? r.email : undefined}
                        >
                          {r.email.trim() ? (
                            <a
                              href={`mailto:${r.email.trim()}`}
                              className={cn("block truncate", workspaceTableNatureLinkClass)}
                            >
                              {r.email}
                            </a>
                          ) : (
                            <p className="truncate">—</p>
                          )}
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
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            "min-w-0 max-w-[11rem] overflow-hidden",
                            workspaceTableNatureTextSecondaryClass,
                          )}
                          title={
                            r.ivaCondition
                              ? (IVA_LABEL_BY_VALUE[r.ivaCondition] ?? r.ivaCondition)
                              : undefined
                          }
                        >
                          <p className="truncate">
                            {r.ivaCondition
                              ? (IVA_LABEL_BY_VALUE[r.ivaCondition] ?? "—")
                              : "—"}
                          </p>
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            "whitespace-nowrap",
                            r.lastSaleAt
                              ? workspaceTableNatureTextPrimaryClass
                              : workspaceTableNatureTextSecondaryClass,
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
                              <span>
                                <span
                                  className={cn(
                                    "font-semibold tabular-nums",
                                    workspaceTableNatureStockOkClass,
                                  )}
                                >
                                  {r.completedSalesCount.toLocaleString("es-AR")}
                                </span>{" "}
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
                                <RootsIconButton
                                  type="button"
                                  label={`Editar ${r.name || "cliente"}`}
                                  tone="action"
                                  intent="edit"
                                  size="compact"
                                  onClick={() => openEdit(r)}
                                >
                                  <Pencil />
                                </RootsIconButton>
                              ) : null}
                              {canDelete ? (
                                <RootsIconButton
                                  type="button"
                                  label={`Eliminar ${r.name || "cliente"}`}
                                  tone="action"
                                  intent="destructive"
                                  size="compact"
                                  onClick={() => openDelete(r)}
                                >
                                  <Trash2 />
                                </RootsIconButton>
                              ) : null}
                            </div>
                          </TableCell>
                        ) : null}
                      </WorkspaceTableBodyRow>
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
