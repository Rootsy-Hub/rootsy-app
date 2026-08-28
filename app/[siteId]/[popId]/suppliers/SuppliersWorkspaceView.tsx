"use client"

import "@/app/library/color/rootsyNaturePalette.css"
import { RootsIconButton } from "@/components/rootsy-button"
import type {
  SupplierTableRow,
  UpsertPopSupplierInput,
} from "@/app/[siteId]/[popId]/suppliers/actions"
import { CLIENT_IVA_CONDITION_OPTIONS } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { SupplierDeleteDialog } from "@/app/[siteId]/[popId]/suppliers/SupplierDeleteDialog"
import { SupplierUpsertDialog } from "@/app/[siteId]/[popId]/suppliers/SupplierUpsertDialog"
import {
  SuppliersFiltersDialog,
  defaultSuppliersModalFilters,
  type SuppliersModalFilters,
} from "@/app/[siteId]/[popId]/suppliers/SuppliersFiltersDialog"
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
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  WorkspaceTableStatusBadge,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT,
  WorkspaceTableSkeletonRows,
} from "@/components/data-workspace/WorkspaceTableSkeleton"
import { suppliersSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import {
  workspaceTableLayoutClassName,
  workspaceTableNatureLinkClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutActionsBodyCellClass,
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutHeaderHeadClass,
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
import { RootsNaturePill } from "@/components/rootsy-pill"
import {
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { usePopSuppliersTable } from "@/hooks/usePopSuppliersTable"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import { invalidateDataWorkspaceTableInfinite } from "@/lib/dataWorkspaceTableInfinite"
import { popSuppliersQueryRoot } from "@/lib/queryKeys"
import {
  createPopSupplier,
  deletePopSupplier,
  updatePopSupplier,
} from "@/lib/rootsyApi/suppliersClient"
import { useQueryClient } from "@tanstack/react-query"
import { formatMoneyInputForField } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
} from "@/lib/workspaceTableSort"
import {
  mergeSuppliersWorkspaceUrl,
  parseSuppliersWorkspaceUrl,
  type SupplierTableSortKey,
} from "@/app/[siteId]/[popId]/suppliers/workspaceUrl"
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
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"

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
    currentAccountEnabled: false,
    currentAccountCreditLimit: "",
    currentAccountTermDays: "30",
  }
}

const IVA_LABEL_BY_VALUE = Object.fromEntries(
  CLIENT_IVA_CONDITION_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>

type SuppliersAppliedFilters = SuppliersModalFilters

const defaultSupplierFilters = defaultSuppliersModalFilters

export function SuppliersWorkspaceView() {
  const params = useParams()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const routerRef = useRef(router)
  routerRef.current = router

  const { bootstrap, loading: bootstrapLoading, hasPermission } =
    usePopWorkspace()
  const afterHydration = useAfterHydration()
  const menuCache = usePopMenuCache(popId)
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
    () => parseSuppliersWorkspaceUrl(workspaceParams),
    [workspaceParams],
  )

  const replaceWorkspaceQuery = useCallback(
    (patch: Parameters<typeof mergeSuppliersWorkspaceUrl>[1]) => {
      const qs = mergeSuppliersWorkspaceUrl(workspaceParams, patch)
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

  const suppliersQuery = usePopSuppliersTable(popId, listQueryParams, {
    enabled: Boolean(popId && siteId),
  })
  const rows = suppliersQuery.data?.suppliers ?? []
  const totalCount = suppliersQuery.data?.totalCount ?? 0
  const supplierPerm = useCallback(
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
  const canCreate = supplierPerm(POP_PERMS.SUPPLIER_CREATE)
  const canUpdate = supplierPerm(POP_PERMS.SUPPLIER_UPDATE)
  const canDelete = supplierPerm(POP_PERMS.SUPPLIER_DELETE)
  const listFetching =
    !popId || !siteId
      ? false
      : suppliersQuery.isPending ||
        (suppliersQuery.isFetching && !suppliersQuery.isFetched)
  const error =
    !popId || !siteId
      ? "Punto de venta no encontrado"
      : suppliersQuery.data?.success === false
        ? suppliersQuery.data.error || "Error"
        : suppliersQuery.error instanceof Error
          ? suppliersQuery.error.message
          : suppliersQuery.error
            ? String(suppliersQuery.error)
            : null

  const [searchInput, setSearchInput] = useState(workspaceParsed.q)
  const searchInputId = useId()
  const filtersButtonId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const createTaxInputRef = useRef<HTMLInputElement>(null)

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

  const refreshSuppliersList = useCallback(async () => {
    if (!popId) return
    await invalidateDataWorkspaceTableInfinite(
      queryClient,
      popSuppliersQueryRoot(popId),
    )
  }, [popId, queryClient])

  useEffect(() => {
    setSearchInput(workspaceParsed.q)
  }, [workspaceParsed.q])

  useEffect(() => {
    const res = suppliersQuery.data
    if (!res || res.success || !("redirect" in res) || !res.redirect) return
    const redirect = res.redirect
    const timeout = window.setTimeout(() => {
      routerRef.current.push(redirect)
    }, 1200)
    return () => window.clearTimeout(timeout)
  }, [suppliersQuery.data])

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === workspaceParsed.q.trim()) return
      replaceWorkspaceQuery({ q: next, page: 1 })
    }, 400)
    return () => window.clearTimeout(t)
  }, [searchInput, workspaceParsed.q, replaceWorkspaceQuery])

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

  const handleSortColumn = useCallback(
    (column: SupplierTableSortKey) => {
      const next = nextWorkspaceTableSortState(
        { sort: workspaceParsed.sort, ord: workspaceParsed.ord },
        column,
      )
      replaceWorkspaceQuery({
        sort: next.sort as SupplierTableSortKey | null,
        ord: next.ord,
      })
    },
    [replaceWorkspaceQuery, workspaceParsed.ord, workspaceParsed.sort],
  )

  const sortDirection = useCallback(
    (column: SupplierTableSortKey) =>
      workspaceTableSortDisplayDirection(
        { sort: workspaceParsed.sort, ord: workspaceParsed.ord },
        column,
      ),
    [workspaceParsed.ord, workspaceParsed.sort],
  )

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
      await refreshSuppliersList()
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
      const res = await updatePopSupplier(popId, editRow.id, editForm)
      if (!res.success) {
        setEditBanner(res.error)
        return
      }
      closeEdit()
      await refreshSuppliersList()
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
    await refreshSuppliersList()
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

  const pageRows = rows
  const visibleIds = useMemo(() => pageRows.map((r) => r.id), [pageRows])
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someVisibleSelected = visibleIds.some((id) => selected.has(id))

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

  const hasFilterChips =
    workspaceParsed.q.trim() !== "" ||
    workspaceParsed.withEmail ||
    workspaceParsed.withTaxId ||
    workspaceParsed.soloActivos

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (workspaceParsed.q.trim()) count++
    count += modalFiltersActiveCount
    return count
  }, [workspaceParsed.q, modalFiltersActiveCount])

  const resultsSummary = useMemo(() => {
    if (listFetching && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "proveedor" : "proveedores"
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

  const skeletonRowCount = DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  return (
    <DataWorkspaceTableListPage
      layout={{
        siteId,
        popId,
        popName: bootstrap?.popName ?? "",
        title: "Proveedores",
        loading: bootstrapLoading,
        userName: bootstrap?.userFullName,
        userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
        userRoleLabel: bootstrap?.roleLabel,
        headerActions: canCreate ? (
          <RootsIconButton
            label="Nuevo proveedor"
            semantic="primary"
            atmosphere="eter"
            size="default"
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

        <SuppliersFiltersDialog
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
                withEmail: draftFilters.withEmail,
                withTaxId: draftFilters.withTaxId,
                soloActivos: draftFilters.soloActivos,
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
                      onRemove={() => {
                        setSearchInput("")
                        replaceWorkspaceQuery({ q: "", page: 1 })
                        searchInputRef.current?.focus()
                      }}
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
                      label="Con CUIT / ID fiscal"
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
            overlay={
              !listFetching && totalCount === 0 ? (
                <DataWorkspaceTableEmptyMascot />
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
            infinite={tableListInfiniteFromQuery(suppliersQuery, "suppliers")}
        >
          <DataWorkspaceListTableFrame>
            <table
              className={cn(workspaceTableLayoutClassName, "min-w-[52rem]")}
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
                    label="CUIT / ID fiscal"
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
                    rowKeyPrefix="suppliers-sk"
                    columns={suppliersSkeletonColumns({
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
                          ariaLabel={`Seleccionar ${r.name || "proveedor"}`}
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
                      <TableCell className={workspaceTableLayoutBodyCellClass}>
                        {r.ivaCondition ? (
                          <RootsNaturePill
                            variant="bruma"
                            className="max-w-full"
                            title={
                              IVA_LABEL_BY_VALUE[r.ivaCondition] ??
                              r.ivaCondition
                            }
                          >
                            <span className="truncate">
                              {IVA_LABEL_BY_VALUE[r.ivaCondition] ?? "—"}
                            </span>
                          </RootsNaturePill>
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
                                label={`Editar ${r.name || "proveedor"}`}
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
                                label={`Eliminar ${r.name || "proveedor"}`}
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
    </DataWorkspaceTableListPage>
  )
}

