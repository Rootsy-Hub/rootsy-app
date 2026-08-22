"use client"

import type { InvoiceFormContextResult } from "@/app/[siteId]/[popId]/invoices/actions"
import {
  formatInvoiceCbteFch,
  invoiceMoneyFormatter,
  invoiceStatusLabel,
} from "@/app/[siteId]/[popId]/invoices/invoiceConstants"
import { InvoiceComposeDialog } from "@/app/[siteId]/[popId]/invoices/InvoiceComposeDialog"
import { InvoiceFiscalConfigDialog } from "@/app/[siteId]/[popId]/invoices/InvoiceFiscalConfigDialog"
import {
  defaultInvoiceComposeFormState,
  invoiceComposeFormToFormData,
  type InvoiceComposeFormState,
} from "@/app/[siteId]/[popId]/invoices/invoiceComposeFormState"
import {
  defaultInvoicesFilters,
  type InvoicesAppliedFilters,
} from "@/app/[siteId]/[popId]/invoices/invoiceFormState"
import { InvoicesFiltersDialog } from "@/app/[siteId]/[popId]/invoices/InvoicesFiltersDialog"
import { InvoiceTypeToolbarFilter } from "@/app/[siteId]/[popId]/invoices/InvoiceTypeToolbarFilter"
import {
  InvoiceTableCaeCell,
  InvoiceTableDateCell,
  InvoiceTableExpandCell,
  InvoiceTableExpandedDetailRow,
  InvoiceTableNumberCell,
  InvoiceTableReceptorCell,
  InvoiceTableStatusCell,
  InvoiceTableTotalCell,
  InvoiceTableTypeCell,
} from "@/app/[siteId]/[popId]/invoices/invoicesTableCells"
import {
  invoiceTableCaeColumnClass,
  invoiceTableDateColumnClass,
  invoiceTableExpandColumnClass,
  invoiceTableHeaderClass,
  invoiceTableNumberColumnClass,
  invoiceTableReceptorColumnClass,
  invoiceTableStatusColumnClass,
  invoiceTableTotalColumnClass,
  invoiceTableTypeColumnClass,
} from "@/app/[siteId]/[popId]/invoices/invoicesTableLayout"
import {
  INVOICE_RECIBO_X_FILTER,
  INVOICE_TABLE_PAGE_SIZES,
  mergeInvoicesWorkspaceUrl,
  parseInvoicesWorkspaceUrl,
  type InvoiceTableSortKey,
} from "@/app/[siteId]/[popId]/invoices/workspaceUrl"
import { buildPaginationItems } from "@/components/data-workspace/buildPaginationItems"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import {
  DataWorkspaceListFiltersDialogTrigger,
  DataWorkspaceListSearchField,
} from "@/components/data-workspace/DataWorkspaceListFilterFields"
import {
  DataWorkspaceTableListFiltersBar,
  DataWorkspaceTableListNatureShell,
  DataWorkspaceTableListPage,
  DataWorkspaceTableListPaginationFooter,
  DataWorkspaceTableListShell,
  dataWorkspaceTableListHeaderVariant,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  workspaceTableLayoutClassName,
  workspaceTableStaticRowClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import {
  dataWorkspaceListFiltersGridFourClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableHead,
  WorkspaceTableBodyRow,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { WorkspaceTableSortHead } from "@/components/data-workspace/WorkspaceTableSortHead"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { invoicesSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { TableBody, TableRow } from "@/components/ui/table"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { useInvoiceFormContext } from "@/hooks/useInvoiceFormContext"
import { usePopInvoicesTable } from "@/hooks/usePopInvoicesTable"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import {
  computeDataWorkspaceDateBounds,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { SALE_COMPROBANTE_RECIBO_X_LABEL } from "@/lib/saleComprobantePicker"
import { findSaleInvoiceTypeByArcaCbteTipo } from "@/lib/saleInvoiceTypes"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import { popInvoicesFormContextQueryKey, popInvoicesQueryRoot } from "@/lib/queryKeys"
import {
  createArcaInvoiceWithOpenCashRegister,
  testArcaInvoiceHomologacion,
} from "@/lib/rootsyApi/invoicesClient"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
} from "@/lib/workspaceTableSort"
import {
  CheckCircle2,
  Plus,
  Settings,
  Sparkles,
} from "lucide-react"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"
import type { DateRange } from "react-day-picker"

export function InvoicesWorkspaceView() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const queryClient = useQueryClient()

  const searchInputId = useId()
  const filtersButtonId = useId()
  const dateFilterLabelId = useId()
  const dateFilterTriggerId = useId()
  const pageSizeLabelId = useId()

  const { bootstrap, loading: bootstrapLoading, hasPermission } =
    usePopWorkspace()
  const afterHydration = useAfterHydration()
  const menuCache = usePopMenuCache(popId ?? "")

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
  const ws = useMemo(
    () => parseInvoicesWorkspaceUrl(workspaceParams),
    [workspaceParams],
  )

  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState(ws.q)
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<InvoicesAppliedFilters>(
    defaultInvoicesFilters(),
  )
  const [datePreset, setDatePreset] =
    useState<DataWorkspaceDatePreset>("this_month")
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >(undefined)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dateBounds = useMemo(
    () => computeDataWorkspaceDateBounds(datePreset, customDateRange),
    [datePreset, customDateRange],
  )

  const composeIdPrefix = "invoice-compose"

  const [fiscalConfigOpen, setFiscalConfigOpen] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeForm, setComposeForm] = useState<InvoiceComposeFormState>(
    defaultInvoiceComposeFormState(),
  )
  const [composeBanner, setComposeBanner] = useState<string | null>(null)
  const [composeDebugFecae, setComposeDebugFecae] = useState<string | null>(
    null,
  )
  const [composeSaving, setComposeSaving] = useState(false)
  const [crtFile, setCrtFile] = useState<File | null>(null)
  const [keyFile, setKeyFile] = useState<File | null>(null)
  const crtInputRef = useRef<HTMLInputElement>(null)
  const keyInputRef = useRef<HTMLInputElement>(null)
  const [issuedHighlight, setIssuedHighlight] = useState<{
    mode: "homologacion" | "guardada"
    cae: string
    caeFchVto: string
    cbteNro: number
    ptoVta: number
    impTotal: number
    invoiceId?: string
  } | null>(null)

  const pushWs = useCallback(
    (patch: Parameters<typeof mergeInvoicesWorkspaceUrl>[1]) => {
      const qs = mergeInvoicesWorkspaceUrl(workspaceParams, patch)
      const next = qs.toString() ? `${pathname}?${qs.toString()}` : pathname
      if (typeof window !== "undefined") {
        const current = `${window.location.pathname}${window.location.search}`
        if (current !== next) {
          window.history.replaceState(window.history.state, "", next)
        }
      }
      setWorkspaceSearch(qs.toString())
    },
    [pathname, workspaceParams],
  )

  const handleSortColumn = useCallback(
    (column: InvoiceTableSortKey) => {
      const next = nextWorkspaceTableSortState(
        { sort: ws.sort, ord: ws.ord },
        column,
      )
      pushWs({
        sort: next.sort as InvoiceTableSortKey | null,
        ord: next.ord,
      })
    },
    [pushWs, ws.ord, ws.sort],
  )

  const sortDirection = useCallback(
    (column: InvoiceTableSortKey) =>
      workspaceTableSortDisplayDirection(
        { sort: ws.sort, ord: ws.ord },
        column,
      ),
    [ws.ord, ws.sort],
  )

  const invoicesQuery = usePopInvoicesTable(
    popId,
    {
      q: ws.q,
      page: ws.page,
      pageSize: ws.pageSize,
      status: ws.status,
      cbteTipo: ws.cbteTipo,
      dateFrom: dateBounds.from,
      dateTo: dateBounds.to,
      sort: ws.sort,
      ord: ws.ord,
    },
    { enabled: Boolean(popId) },
  )

  const invoicePerm = useCallback(
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
  const canCreate = invoicePerm(POP_PERMS.INVOICES_CREATE)
  const canReadInvoices = invoicePerm(POP_PERMS.INVOICES_READ)

  const formCtxQuery = useInvoiceFormContext(popId, {
    enabled: Boolean(popId) && composeOpen && canCreate,
  })
  const formCtx: InvoiceFormContextResult | null = formCtxQuery.data ?? null
  const formRefreshing =
    composeOpen &&
    (formCtxQuery.isPending ||
      (formCtxQuery.isFetching && !formCtxQuery.isFetched))

  const invoices = invoicesQuery.data?.invoices ?? []
  const totalCount = invoicesQuery.data?.totalCount ?? 0
  const loading =
    invoicesQuery.isPending ||
    (invoicesQuery.isFetching && !invoicesQuery.isFetched)
  const error =
    invoicesQuery.data?.success === false
      ? invoicesQuery.data.error || "Error"
      : invoicesQuery.error instanceof Error
        ? invoicesQuery.error.message
        : invoicesQuery.error
          ? String(invoicesQuery.error)
          : null

  const refreshInvoicesList = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popInvoicesQueryRoot(popId),
    })
  }, [popId, queryClient])

  useEffect(() => {
    const res = invoicesQuery.data
    if (!res || res.success || !res.redirect) return
    routerRef.current.replace(res.redirect)
  }, [invoicesQuery.data])

  useEffect(() => {
    setSearchInput(ws.q)
  }, [ws.q])

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === ws.q.trim()) return
      pushWs({ q: next, page: 1 })
    }, 400)
    return () => window.clearTimeout(t)
  }, [searchInput, ws.q, pushWs])

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

  const totalPages = Math.max(1, Math.ceil(totalCount / ws.pageSize))
  const rangeStart =
    totalCount === 0 ? 0 : (ws.page - 1) * ws.pageSize + 1
  const rangeEnd = Math.min(ws.page * ws.pageSize, totalCount)
  const skeletonRowCount = Math.min(12, Math.max(5, ws.pageSize))
  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages, ws.page),
    [totalPages, ws.page],
  )

  const modalFiltersActiveCount = ws.status ? 1 : 0
  const hasFilterChips =
    ws.q.trim() !== "" || ws.status !== "" || ws.cbteTipo !== ""
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (ws.q.trim()) count++
    if (ws.status) count++
    if (ws.cbteTipo !== "") count++
    return count
  }, [ws.q, ws.status, ws.cbteTipo])
  const cbteTipoChipLabel = useMemo(() => {
    if (ws.cbteTipo === "") return ""
    if (ws.cbteTipo === INVOICE_RECIBO_X_FILTER) {
      return SALE_COMPROBANTE_RECIBO_X_LABEL
    }
    return (
      findSaleInvoiceTypeByArcaCbteTipo(siteId, ws.cbteTipo)?.label ??
      `Tipo ${ws.cbteTipo}`
    )
  }, [siteId, ws.cbteTipo])

  const resultsSummary = useMemo(() => {
    if (loading && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "comprobante" : "comprobantes"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [loading, totalCount])

  const clearAllFilters = useCallback(() => {
    setSearchInput("")
    pushWs({ q: "", status: "", cbteTipo: "", page: 1 })
    searchInputRef.current?.focus()
  }, [pushWs])

  const canEmit =
    canCreate &&
    formCtx?.success === true &&
    formCtx.canCreateInvoice === true

  const hasOpenCashSession =
    formCtx?.success === true && formCtx.cashSession != null

  const selectedSalePoint =
    formCtx?.success === true ? formCtx.cashSession?.salePoint ?? null : null

  const cashEmitReady =
    hasOpenCashSession && Boolean(selectedSalePoint?.configured)

  const submitCompose = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || composeSaving) return

    if (composeForm.tab === "homologacion") {
      if (!crtFile || !keyFile) {
        setComposeBanner("Subí certificado y clave para homologación.")
        return
      }
      if (!composeForm.ptoVta.trim()) {
        setComposeBanner("Indicá el punto de venta.")
        return
      }
    }

    setComposeSaving(true)
    setComposeBanner(null)
    setComposeDebugFecae(null)
    const fd = invoiceComposeFormToFormData(composeForm, {
      crt: crtFile,
      key: keyFile,
    })
    const res =
      composeForm.tab === "homologacion"
        ? await testArcaInvoiceHomologacion(popId, fd)
        : await createArcaInvoiceWithOpenCashRegister(popId, fd)
    setComposeSaving(false)
    if (!res.success) {
      setComposeBanner(res.error)
      setComposeDebugFecae(
        "debugFecaeSoap" in res ? res.debugFecaeSoap ?? null : null,
      )
      return
    }
    setComposeOpen(false)
    setIssuedHighlight({
      mode: composeForm.tab === "homologacion" ? "homologacion" : "guardada",
      cae: res.cae,
      caeFchVto: res.caeFchVto,
      cbteNro: res.cbteNro,
      ptoVta: res.ptoVta,
      impTotal: res.impTotal,
      invoiceId:
        composeForm.tab === "caja" && "invoiceId" in res
          ? res.invoiceId
          : undefined,
    })
    if (composeForm.tab === "caja" && "invoiceId" in res) {
      setExpandedId(res.invoiceId)
    }
    if (popId) {
      await queryClient.invalidateQueries({
        queryKey: popInvoicesFormContextQueryKey(popId),
      })
    }
    await refreshInvoicesList()
  }

  const finalizeComposeClose = () => {
    setComposeForm(defaultInvoiceComposeFormState())
    setComposeBanner(null)
    setComposeDebugFecae(null)
    setComposeSaving(false)
    setCrtFile(null)
    setKeyFile(null)
    if (crtInputRef.current) crtInputRef.current.value = ""
    if (keyInputRef.current) keyInputRef.current.value = ""
  }

  const composeConfirmDisabled =
    composeSaving ||
    formRefreshing ||
    (composeForm.tab === "caja"
      ? !cashEmitReady || !canEmit
      : !crtFile ||
        !keyFile ||
        !composeForm.ptoVta.trim() ||
        !composeForm.importeTotal.trim())

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado</p>
      </div>
    )
  }

  const openCompose = () => {
    setComposeBanner(null)
    setComposeDebugFecae(null)
    setComposeOpen(true)
  }

  return (
    <DataWorkspaceTableListPage
        layout={{
          siteId,
          popId,
          popName: bootstrap?.popName ?? "",
          title: "Facturas",
          loading: bootstrapLoading,
          userName: bootstrap?.userFullName,
          userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
          userRoleLabel: bootstrap?.roleLabel ?? undefined,
          pillLabel: "ARCA / AFIP",
          headerActions: (
            <>
              {canReadInvoices ? (
                <DataWorkspaceHeaderIconButton
                  label="Configuración fiscal"
                  headerVariant={dataWorkspaceTableListHeaderVariant}
                  onClick={() => setFiscalConfigOpen(true)}
                >
                  <Settings className="size-5" aria-hidden />
                </DataWorkspaceHeaderIconButton>
              ) : null}
              {canCreate ? (
                <DataWorkspaceHeaderIconButton
                  label="Nueva factura"
                  headerVariant={dataWorkspaceTableListHeaderVariant}
                  primary
                  onClick={openCompose}
                >
                  <Plus className="size-5" aria-hidden />
                </DataWorkspaceHeaderIconButton>
              ) : null}
            </>
          ),
        }}
        error={error}
      >
        <DataWorkspaceTableListNatureShell>
          <DataWorkspaceTableListFiltersBar>
                <div className={dataWorkspaceListFiltersGridFourClass}>
                  <div className={dataWorkspaceListFiltersPanelClass}>
                    <DataWorkspacePeriodFilter
                      variant="layout"
                      preset={datePreset}
                      customRange={customDateRange}
                      onPresetChange={(preset) => {
                        setDatePreset(preset)
                        pushWs({ page: 1 })
                      }}
                      onCustomRangeChange={(range) => {
                        setCustomDateRange(range)
                        pushWs({ page: 1 })
                      }}
                      bounds={dateBounds}
                      showActiveState={false}
                      labelId={dateFilterLabelId}
                      triggerId={dateFilterTriggerId}
                    />
                  </div>

                  <div className={dataWorkspaceListFiltersPanelClass}>
                    <InvoiceTypeToolbarFilter
                      siteId={siteId}
                      emisorIva={
                        bootstrap?.popEmisorIvaCondition ??
                        "responsable_inscripto"
                      }
                      hasValidFiscalCuit={
                        bootstrap?.hasValidPopFiscalCuit ?? false
                      }
                      value={ws.cbteTipo}
                      onChange={(cbteTipo) => pushWs({ cbteTipo, page: 1 })}
                    />
                  </div>

                  <div className={dataWorkspaceListFiltersPanelClass}>
                    <DataWorkspaceListFiltersDialogTrigger
                      id={filtersButtonId}
                      placeholder="Estado"
                      activeCount={modalFiltersActiveCount}
                      expanded={filtersModalOpen}
                      onClick={() => {
                        setDraftFilters({ status: ws.status })
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
                      placeholder="Receptor, CAE, nº comprobante… ( / )"
                      resultsSummary={resultsSummary}
                    />
                  </div>
                </div>
          </DataWorkspaceTableListFiltersBar>

            <DataWorkspaceTableListShell
              activeFiltersBar={
                hasFilterChips ? (
                  <DataWorkspaceListActiveFiltersBar
                    activeCount={activeFilterCount}
                    onClearAll={clearAllFilters}
                  >
                    {ws.q.trim() ? (
                      <DataWorkspaceListFilterChip
                        label={`Buscar: «${ws.q.trim()}»`}
                        onRemove={() => pushWs({ q: "", page: 1 })}
                        removeAriaLabel="Quitar búsqueda"
                      />
                    ) : null}
                    {ws.cbteTipo !== "" ? (
                      <DataWorkspaceListFilterChip
                        label={`Tipo: ${cbteTipoChipLabel}`}
                        onRemove={() => pushWs({ cbteTipo: "", page: 1 })}
                        removeAriaLabel="Quitar filtro de tipo de comprobante"
                      />
                    ) : null}
                    {ws.status ? (
                      <DataWorkspaceListFilterChip
                        label={`Estado: ${invoiceStatusLabel(ws.status)}`}
                        onRemove={() => pushWs({ status: "", page: 1 })}
                        removeAriaLabel="Quitar filtro de estado"
                      />
                    ) : null}
                  </DataWorkspaceListActiveFiltersBar>
                ) : null
              }
              overlay={
                !loading && totalCount === 0 ? (
                  <DataWorkspaceTableEmptyMascot />
                ) : null
              }
              footer={
                <DataWorkspaceTableListPaginationFooter
                  listFetching={loading}
                  totalCount={totalCount}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  currentPage={ws.page}
                  totalPages={totalPages}
                  pageSize={ws.pageSize}
                  pageSizeOptions={INVOICE_TABLE_PAGE_SIZES}
                  paginationItems={paginationItems}
                  onPageChange={(p) => pushWs({ page: p })}
                  onPageSizeChange={(ps) =>
                    pushWs({
                      pageSize: ps as typeof ws.pageSize,
                      page: 1,
                    })
                  }
                  pageSizeLabelId={pageSizeLabelId}
                />
              }
            >
              <DataWorkspaceListTableFrame>
                <table
                  className={cn(workspaceTableLayoutClassName, "min-w-[64rem]")}
                  aria-busy={loading}
                >
                  <WorkspaceTableHeader>
                    <WorkspaceTableHeaderRow>
                      <WorkspaceTableHead
                        tone="nature"
                        className={invoiceTableHeaderClass(
                          invoiceTableExpandColumnClass,
                        )}
                        srOnly
                      >
                        Detalle
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={invoiceTableHeaderClass(
                          invoiceTableTypeColumnClass,
                        )}
                      >
                        Tipo
                      </WorkspaceTableHead>
                      <WorkspaceTableSortHead
                        tone="nature"
                        label="Fecha"
                        direction={sortDirection("cbte_fch")}
                        onSort={() => handleSortColumn("cbte_fch")}
                        className={invoiceTableHeaderClass(
                          invoiceTableDateColumnClass,
                        )}
                      />
                      <WorkspaceTableHead
                        tone="nature"
                        className={invoiceTableHeaderClass(
                          invoiceTableNumberColumnClass,
                        )}
                      >
                        Pto. / Nº
                      </WorkspaceTableHead>
                      <WorkspaceTableSortHead
                        tone="nature"
                        label="Receptor"
                        direction={sortDirection("receptor")}
                        onSort={() => handleSortColumn("receptor")}
                        className={invoiceTableHeaderClass(
                          invoiceTableReceptorColumnClass,
                        )}
                      />
                      <WorkspaceTableSortHead
                        tone="nature"
                        label="Total"
                        align="right"
                        direction={sortDirection("imp_total")}
                        onSort={() => handleSortColumn("imp_total")}
                        className={invoiceTableHeaderClass(
                          invoiceTableTotalColumnClass,
                        )}
                      />
                      <WorkspaceTableHead
                        tone="nature"
                        className={invoiceTableHeaderClass(
                          invoiceTableCaeColumnClass,
                        )}
                      >
                        CAE
                      </WorkspaceTableHead>
                      <WorkspaceTableSortHead
                        tone="nature"
                        label="Estado"
                        direction={sortDirection("status")}
                        onSort={() => handleSortColumn("status")}
                        className={invoiceTableHeaderClass(
                          invoiceTableStatusColumnClass,
                        )}
                      />
                    </WorkspaceTableHeaderRow>
                  </WorkspaceTableHeader>
                  <TableBody>
                    {loading ? (
                      <WorkspaceTableSkeletonRows
                        rowCount={skeletonRowCount}
                        rowKeyPrefix="invoices-sk"
                        columns={invoicesSkeletonColumns()}
                        tone="nature"
                      />
                    ) : totalCount === 0 ? null : (
                      invoices.map((inv, index) => {
                        const open = expandedId === inv.id
                        const justIssued = issuedHighlight?.invoiceId === inv.id
                        return (
                          <Fragment key={inv.id}>
                            <WorkspaceTableBodyRow
                              index={index}
                              selected={justIssued}
                              className={cn(
                                open &&
                                  !justIssued &&
                                  "bg-[var(--wt-surface-hover)] hover:!bg-[var(--wt-surface-hover)]",
                              )}
                            >
                              <InvoiceTableExpandCell
                                open={open}
                                onToggle={() =>
                                  setExpandedId((id) =>
                                    id === inv.id ? null : inv.id,
                                  )
                                }
                              />
                              <InvoiceTableTypeCell row={inv} />
                              <InvoiceTableDateCell row={inv} />
                              <InvoiceTableNumberCell row={inv} />
                              <InvoiceTableReceptorCell row={inv} />
                              <InvoiceTableTotalCell row={inv} />
                              <InvoiceTableCaeCell row={inv} />
                              <InvoiceTableStatusCell row={inv} />
                            </WorkspaceTableBodyRow>
                            {open ? (
                              <TableRow className={workspaceTableStaticRowClass}>
                                <InvoiceTableExpandedDetailRow row={inv} />
                              </TableRow>
                            ) : null}
                          </Fragment>
                        )
                      })
                    )}
                  </TableBody>
                </table>
              </DataWorkspaceListTableFrame>
            </DataWorkspaceTableListShell>
        </DataWorkspaceTableListNatureShell>

        <InvoicesFiltersDialog
          open={filtersModalOpen}
          onOpenChange={setFiltersModalOpen}
          draft={draftFilters}
          onDraftChange={setDraftFilters}
          onApply={() => {
            pushWs({ status: draftFilters.status, page: 1 })
            setFiltersModalOpen(false)
          }}
        />

        <InvoiceFiscalConfigDialog
          open={fiscalConfigOpen}
          onOpenChange={setFiscalConfigOpen}
          popId={popId}
          siteId={siteId}
        />

        <InvoiceComposeDialog
        open={composeOpen}
        onOpenChange={(open) => {
          setComposeOpen(open)
          if (!open) {
            setComposeBanner(null)
            setComposeDebugFecae(null)
          }
        }}
        idPrefix={composeIdPrefix}
        form={composeForm}
        setForm={(next) => {
          setComposeForm((current) => {
            const resolved =
              typeof next === "function" ? next(current) : next
            if (resolved.tab !== current.tab) {
              setComposeBanner(null)
              setComposeDebugFecae(null)
            }
            return resolved
          })
        }}
        formCtx={formCtx}
        canEmit={canEmit}
        cashEmitReady={cashEmitReady}
        hasOpenCashSession={hasOpenCashSession}
        crtFile={crtFile}
        onCrtFileChange={setCrtFile}
        crtInputRef={crtInputRef}
        keyFile={keyFile}
        onKeyFileChange={setKeyFile}
        keyInputRef={keyInputRef}
        disabled={composeSaving || formRefreshing}
        saving={composeSaving}
        refreshing={formRefreshing}
        banner={composeBanner}
        debugFecae={composeDebugFecae}
        confirmDisabled={composeConfirmDisabled}
        onSubmit={submitCompose}
        onCancel={() => setComposeOpen(false)}
        onAfterClose={finalizeComposeClose}
        />

        <Sheet
        open={issuedHighlight != null}
        onOpenChange={(o) => {
          if (!o) setIssuedHighlight(null)
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-hidden border-l border-border bg-linear-to-b from-card via-card to-primary/5 p-0 sm:max-w-md"
        >
          {issuedHighlight ? (
            <>
              <SheetHeader className="relative border-b border-border px-6 pb-4 pt-6">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute -right-8 -top-12 size-40 rounded-full bg-primary/15 blur-2xl" />
                  <div className="absolute -bottom-6 left-1/4 size-32 rounded-full bg-emerald-400/10 blur-2xl" />
                </div>
                <div className="relative flex items-start gap-3">
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25">
                    <CheckCircle2 className="size-7" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <SheetTitle className="text-xl font-bold tracking-tight">
                      {issuedHighlight.mode === "homologacion"
                        ? "Prueba autorizada"
                        : "Factura autorizada"}
                    </SheetTitle>
                    <SheetDescription className="text-sm text-muted-foreground">
                      {issuedHighlight.mode === "homologacion" ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Sparkles className="size-3.5 text-amber-600" />
                          Homologación AFIP — no se guardó en Rootsy
                        </span>
                      ) : (
                        "El comprobante quedó registrado y aparece en el listado."
                      )}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    CAE
                  </p>
                  <p className="mt-1 break-all text-lg font-semibold tracking-tight text-foreground">
                    {issuedHighlight.cae}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 rounded-lg text-xs"
                      onClick={() => {
                        void navigator.clipboard.writeText(issuedHighlight.cae)
                      }}
                    >
                      Copiar CAE
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/50 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Punto / Número
                    </p>
                    <p className="mt-0.5 font-numeric text-sm font-semibold tabular-nums text-foreground">
                      {issuedHighlight.ptoVta} — {issuedHighlight.cbteNro}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/50 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Vto. CAE
                    </p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                      {formatInvoiceCbteFch(issuedHighlight.caeFchVto)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/80">
                    Total factura
                  </p>
                  <p className="mt-1 text-3xl font-black tabular-nums tracking-tight text-primary">
                    {invoiceMoneyFormatter.format(issuedHighlight.impTotal)}
                  </p>
                </div>
              </div>

              <div className="border-t border-border bg-card/95 px-6 py-4">
                <Button
                  type="button"
                  className="w-full rounded-xl bg-primary"
                  onClick={() => setIssuedHighlight(null)}
                >
                  Entendido
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </DataWorkspaceTableListPage>
  )
}

