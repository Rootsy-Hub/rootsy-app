"use client"

import {
  createArcaInvoiceWithOpenCashRegister,
  getInvoiceFormContext,
  getPopInvoicesArcaTable,
  testArcaInvoiceHomologacion,
  type InvoiceArcaTableRow,
} from "@/app/[siteId]/[popId]/invoices/actions"
import {
  formatInvoiceCbteFch,
  invoiceMoneyFormatter,
  invoiceRegimenLabel,
  invoiceStatusLabel,
} from "@/app/[siteId]/[popId]/invoices/invoiceConstants"
import { InvoiceComposeDialog } from "@/app/[siteId]/[popId]/invoices/InvoiceComposeDialog"
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
import {
  InvoiceStatusToolbarFilter,
  invoiceStatusFilterToQuery,
  resolveInvoiceStatusFilterId,
} from "@/app/[siteId]/[popId]/invoices/InvoiceStatusToolbarFilter"
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
import {
  dataWorkspaceListFiltersGridClass,
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
import withAuth from "@/hoc/withAuth"
import { cn } from "@/lib/utils"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
} from "@/lib/workspaceTableSort"
import {
  CheckCircle2,
  Plus,
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

function InvoicesPage() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const ws = useMemo(
    () => parseInvoicesWorkspaceUrl(searchParams),
    [searchParams],
  )
  const searchInputId = useId()
  const filtersButtonId = useId()
  const pageSizeLabelId = useId()

  const { bootstrap, loading: bootstrapLoading } = usePopWorkspace()

  const [invoices, setInvoices] = useState<InvoiceArcaTableRow[]>([])
  const [formCtx, setFormCtx] = useState<Awaited<
    ReturnType<typeof getInvoiceFormContext>
  > | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canCreate, setCanCreate] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState(ws.q)
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<InvoicesAppliedFilters>(
    defaultInvoicesFilters(),
  )
  const searchInputRef = useRef<HTMLInputElement>(null)

  const composeIdPrefix = "invoice-compose"

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
      const next = mergeInvoicesWorkspaceUrl(searchParams, patch)
      router.replace(`${pathname}?${next.toString()}`)
    },
    [pathname, router, searchParams],
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

  const activeStatusFilterId = useMemo(
    () => resolveInvoiceStatusFilterId(ws.status),
    [ws.status],
  )

  const loadTable = useCallback(async () => {
    if (!popId) return
    setLoading(true)
    const [res, ctx] = await Promise.all([
      getPopInvoicesArcaTable(popId, {
        q: ws.q,
        page: ws.page,
        pageSize: ws.pageSize,
        status: ws.status,
        regimen: ws.regimen,
        sort: ws.sort,
        ord: ws.ord,
      }),
      getInvoiceFormContext(popId),
    ])
    setLoading(false)
    if (!res.success) {
      setError(res.error || "Error")
      setInvoices(res.invoices)
      setTotalCount(res.totalCount)
      setCanCreate(res.canCreate)
      if (res.redirect) routerRef.current.replace(res.redirect)
      return
    }
    setError(null)
    setInvoices(res.invoices)
    setTotalCount(res.totalCount)
    setCanCreate(res.canCreate)
    if (ctx.success) setFormCtx(ctx)
  }, [popId, ws])

  useEffect(() => {
    void loadTable()
  }, [loadTable])

  useEffect(() => {
    if (!composeOpen || !popId) return
    let cancelled = false
    void getInvoiceFormContext(popId).then((ctx) => {
      if (cancelled || !ctx.success) return
      setFormCtx(ctx)
    })
    return () => {
      cancelled = true
    }
  }, [composeOpen, popId])

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

  const modalFiltersActiveCount = ws.regimen ? 1 : 0
  const hasFilterChips =
    ws.q.trim() !== "" || ws.status !== "" || ws.regimen !== ""
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (ws.q.trim()) count++
    if (ws.status) count++
    if (ws.regimen) count++
    return count
  }, [ws.q, ws.status, ws.regimen])

  const resultsSummary = useMemo(() => {
    if (loading && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "comprobante" : "comprobantes"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [loading, totalCount])

  const clearAllFilters = useCallback(() => {
    setSearchInput("")
    pushWs({ q: "", status: "", regimen: "", page: 1 })
    searchInputRef.current?.focus()
  }, [pushWs])

  const canEmit = formCtx?.success === true && formCtx.canCreateInvoice === true

  const hasOpenCashSession =
    formCtx?.success === true && formCtx.cashSession != null

  const cashEmitReady =
    hasOpenCashSession &&
    Boolean(formCtx?.cashSession?.hasCertificates) &&
    formCtx?.cashSession?.ptoVta != null

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
    await loadTable()
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

  const listLoading = bootstrapLoading || loading

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
          loading: listLoading,
          userName: bootstrap?.userFullName,
          userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
          userRoleLabel: bootstrap?.roleLabel ?? undefined,
          pillLabel: "ARCA / AFIP",
          headerActions: canCreate ? (
            <DataWorkspaceHeaderIconButton
              label="Nueva factura"
              headerVariant={dataWorkspaceTableListHeaderVariant}
              primary
              onClick={openCompose}
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
                    <InvoiceStatusToolbarFilter
                      value={activeStatusFilterId}
                      onChange={(id) =>
                        pushWs({
                          status: invoiceStatusFilterToQuery(id),
                          page: 1,
                        })
                      }
                    />
                  </div>

                  <div className={dataWorkspaceListFiltersPanelClass}>
                    <DataWorkspaceListFiltersDialogTrigger
                      id={filtersButtonId}
                      placeholder="Régimen"
                      activeCount={modalFiltersActiveCount}
                      expanded={filtersModalOpen}
                      onClick={() => {
                        setDraftFilters({ regimen: ws.regimen })
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
                    {ws.status ? (
                      <DataWorkspaceListFilterChip
                        label={`Estado: ${invoiceStatusLabel(ws.status)}`}
                        onRemove={() => pushWs({ status: "", page: 1 })}
                        removeAriaLabel="Quitar filtro de estado"
                      />
                    ) : null}
                    {ws.regimen ? (
                      <DataWorkspaceListFilterChip
                        label={`Régimen: ${invoiceRegimenLabel(ws.regimen)}`}
                        onRemove={() => pushWs({ regimen: "", page: 1 })}
                        removeAriaLabel="Quitar filtro de régimen"
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
            pushWs({ regimen: draftFilters.regimen, page: 1 })
            setFiltersModalOpen(false)
          }}
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
        disabled={composeSaving}
        saving={composeSaving}
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

export default withAuth(InvoicesPage)
