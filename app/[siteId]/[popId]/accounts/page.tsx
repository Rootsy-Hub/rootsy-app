"use client"

import {
  createTreasuryAccount,
  deleteTreasuryAccount,
  getTreasuryAccountsHub,
  updateTreasuryAccount,
  type TreasuryAccountTableRow,
  type TreasuryFundingOption,
  type UpsertTreasuryAccountInput,
} from "@/app/[siteId]/[popId]/accounts/actions"
import { TreasurySummaryDashboard } from "@/app/[siteId]/[popId]/accounts/TreasurySummaryDashboard"
import {
  addManualBankStatementLine,
  clearMovementReconciliation,
  deleteBankStatementLine,
  getTreasuryAccountDetail,
  importBankStatementCsv,
  recordTreasurySettlementForAccount,
  setMovementReconciliation,
  type BankStatementLineRow,
  type PaymentMethodMovementRow,
  type PaymentsHubSummary,
  type TreasuryAccountDetailResult,
  type TreasurySettlementRow,
} from "@/app/[siteId]/[popId]/payment-methods/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  dataWorkspaceShellCard,
  lightToolbarButtonClass,
  lightToolbarFocusClass,
  lightToolbarShellClass,
  toolbarBlockLabelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import withAuth from "@/hoc/withAuth"
import {
  TREASURY_ACCOUNT_KINDS,
  treasuryKindLabel,
  type TreasuryAccountKind,
} from "@/lib/treasuryAccountKinds"
import { getWorkspaceHeaderForPop } from "@/lib/workspaceHeaderServer"
import { cn } from "@/lib/utils"
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  History,
  Plus,
  Trash2,
  Upload,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

function formatShortDate(iso: string) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso || "—"
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(d)
}

function movementKindLabel(kind: PaymentMethodMovementRow["kind"]): string {
  switch (kind) {
    case "sale":
      return "Venta"
    case "purchase":
      return "Compra"
    case "expense":
      return "Gasto"
    case "funding_out":
      return "Resumen tarjeta"
    default:
      return "Movimiento"
  }
}

const KIND_OPTIONS = TREASURY_ACCOUNT_KINDS.map((k) => ({
  value: k.value,
  label: k.label,
}))

function defaultForm(): UpsertTreasuryAccountInput {
  return {
    name: "",
    kind: "bank",
    sortOrder: 0,
  }
}

function shiftMonth(year: number, month1: number, delta: number) {
  const d = new Date(year, month1 - 1 + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

function TreasuryPeriodToolbar({
  monthLabel,
  loading,
  isCurrentMonth,
  onPrev,
  onNext,
  onToday,
}: {
  monthLabel: string
  loading: boolean
  isCurrentMonth: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}) {
  const periodNavBtnClass = cn(
    "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
    "hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
    lightToolbarFocusClass,
  )

  return (
    <div
      className={cn(lightToolbarShellClass, "w-full shrink-0")}
      role="toolbar"
      aria-label="Período de tesorería"
    >
      <div className="flex flex-col gap-4 px-4 py-3.5 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <span className={toolbarBlockLabelClass}>Período</span>
          <p className="mt-1 text-sm leading-snug text-foreground/75">
            Flujo de caja del mes: entradas, salidas y posición por cuenta de
            tesorería.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {!isCurrentMonth ? (
            <button
              type="button"
              onClick={onToday}
              className={cn(lightToolbarButtonClass, "h-9 w-auto shrink-0 px-3")}
            >
              Mes actual
            </button>
          ) : null}
          <div
            className="inline-flex items-center rounded-lg border border-border/70 bg-background p-0.5 shadow-sm"
            role="group"
            aria-label="Navegación por mes"
          >
            <button
              type="button"
              className={periodNavBtnClass}
              onClick={onPrev}
              aria-label="Mes anterior"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <div className="flex min-w-38 items-center justify-center gap-2 px-2 sm:min-w-42">
              <CalendarDays
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="truncate text-sm font-semibold capitalize text-foreground">
                {loading ? "…" : monthLabel || "—"}
              </span>
            </div>
            <button
              type="button"
              className={periodNavBtnClass}
              onClick={onNext}
              aria-label="Mes siguiente"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TreasuryAccountFormFields({
  form,
  setForm,
  idPrefix,
  kindDisabled,
}: {
  form: UpsertTreasuryAccountInput
  setForm: Dispatch<SetStateAction<UpsertTreasuryAccountInput>>
  idPrefix: string
  kindDisabled?: boolean
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Nombre</Label>
        <Input
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          placeholder="Ej. Banco Galicia, Caja chica, Mercado Pago"
          className="bg-background"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-kind`}>Tipo de cuenta</Label>
        <select
          id={`${idPrefix}-kind`}
          value={form.kind}
          disabled={kindDisabled}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              kind: e.target.value as TreasuryAccountKind,
            }))
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {!kindDisabled ? (
          <p className="text-xs text-muted-foreground">
            Al crear la cuenta se genera automáticamente la subcuenta en el plan
            contable.
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-sort`}>Orden en listas</Label>
        <Input
          id={`${idPrefix}-sort`}
          type="number"
          value={form.sortOrder}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              sortOrder: Number(e.target.value),
            }))
          }
          className="bg-background"
        />
      </div>
    </>
  )
}

function findMatchingStatementLine(
  movement: PaymentMethodMovementRow,
  lines: BankStatementLineRow[],
): BankStatementLineRow | null {
  const candidates = lines.filter(
    (l) =>
      !l.reconciled &&
      l.direction === movement.direction &&
      Math.abs(l.amount - movement.amount) < 0.01,
  )
  if (candidates.length === 1) return candidates[0]
  const sameDate = candidates.filter((l) => l.lineDate === movement.date)
  if (sameDate.length === 1) return sameDate[0]
  return null
}

function AccountCard({
  row,
  canUpdate,
  canDelete,
  canSettle,
  onEdit,
  onDelete,
  onPayStatement,
  onOpenDetail,
}: {
  row: TreasuryAccountTableRow
  canUpdate: boolean
  canDelete: boolean
  canSettle: boolean
  onEdit: () => void
  onDelete: () => void
  onPayStatement?: () => void
  onOpenDetail: () => void
}) {
  return (
    <article className={cn(dataWorkspaceShellCard, "flex flex-col p-4")}>
      <button
        type="button"
        onClick={onOpenDetail}
        className="-mx-1 mb-3 rounded-lg px-1 text-left transition-colors hover:bg-muted/40"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">
              {row.name || "—"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {treasuryKindLabel(row.kind)}
              {row.isSystemDefault ? " · Predeterminada" : ""}
            </p>
          </div>
          {!row.isActive ? (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Inactivo
            </span>
          ) : null}
        </div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Entró / Salió (mes)
        </p>
        <p className="mb-1 text-2xl font-bold tabular-nums tracking-tight text-foreground">
          {fmt.format(row.receivedMonthTotal)} / {fmt.format(row.paidOutMonthTotal)}
        </p>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
          <History className="size-3.5" aria-hidden />
          Ver historial y movimientos
        </span>
      </button>
      {row.isCardPayable ? (
        <div className="mb-3 space-y-1 rounded-lg border border-amber-200/70 bg-amber-50/80 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-950/30">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-900/80 dark:text-amber-200/90">
            Deuda pendiente (resumen)
          </p>
          <p className="text-lg font-bold tabular-nums text-amber-950 dark:text-amber-100">
            {fmt.format(row.outstandingBalance)}
          </p>
          {row.ledgerBalance != null ? (
            <p className="text-xs text-amber-900/70 dark:text-amber-200/80">
              Saldo contable: {fmt.format(row.ledgerBalance)}
            </p>
          ) : null}
        </div>
      ) : row.ledgerBalance != null ? (
        <p className="mb-3 text-xs text-muted-foreground">
          Saldo contable: {fmt.format(row.ledgerBalance)}
        </p>
      ) : null}
      <p className="mb-4 truncate text-xs text-muted-foreground">
        {row.accountingAccountLabel ?? "Sin cuenta contable"}
      </p>
      {row.isCardPayable && canSettle && onPayStatement ? (
        <Button
          type="button"
          size="sm"
          className="mb-3 w-full"
          disabled={row.outstandingBalance <= 0}
          onClick={onPayStatement}
        >
          Pagar resumen
        </Button>
      ) : null}
      {canUpdate || canDelete ? (
        <div className="mt-auto flex gap-2 border-t border-border/60 pt-3">
          {canUpdate ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex-1 text-primary hover:bg-primary/10"
              onClick={onEdit}
            >
              Editar
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex-1 text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              Eliminar
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

function AccountsPage() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)
  const [popName, setPopName] = useState("")
  const [workspaceHeader, setWorkspaceHeader] = useState<{
    userFullName: string
    userImageUrl: string | null
    roleLabel: string
  } | null>(null)
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [rows, setRows] = useState<TreasuryAccountTableRow[]>([])
  const [summary, setSummary] = useState<PaymentsHubSummary | null>(null)
  const [fundingAccounts, setFundingAccounts] = useState<TreasuryFundingOption[]>(
    [],
  )
  const [canSettle, setCanSettle] = useState(false)
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState(defaultForm)

  const [editRow, setEditRow] = useState<TreasuryAccountTableRow | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editBanner, setEditBanner] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(defaultForm)

  const [deleteRow, setDeleteRow] = useState<TreasuryAccountTableRow | null>(
    null,
  )
  const [deleteBusy, setDeleteBusy] = useState(false)

  const [settleRow, setSettleRow] = useState<TreasuryAccountTableRow | null>(null)
  const [settleAmount, setSettleAmount] = useState("")
  const [settleDate, setSettleDate] = useState("")
  const [settleFundingId, setSettleFundingId] = useState("")
  const [settleNotes, setSettleNotes] = useState("")
  const [settleSaving, setSettleSaving] = useState(false)
  const [settleBanner, setSettleBanner] = useState<string | null>(null)

  const [detailRow, setDetailRow] = useState<TreasuryAccountTableRow | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailData, setDetailData] = useState<TreasuryAccountDetailResult | null>(
    null,
  )
  const [reconciliationPmId, setReconciliationPmId] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState<"movimientos" | "extracto">(
    "movimientos",
  )
  const [csvText, setCsvText] = useState("")
  const [csvImporting, setCsvImporting] = useState(false)
  const [csvBanner, setCsvBanner] = useState<string | null>(null)
  const [manualDate, setManualDate] = useState("")
  const [manualDesc, setManualDesc] = useState("")
  const [manualAmount, setManualAmount] = useState("")
  const [manualDirection, setManualDirection] = useState<"in" | "out">("out")
  const [manualSaving, setManualSaving] = useState(false)
  const [reconcileBusyKey, setReconcileBusyKey] = useState<string | null>(null)

  const loadHeader = useCallback(async () => {
    if (!popId) return
    const head = await getWorkspaceHeaderForPop(popId)
    if (!head.success) {
      setHeaderError(head.error)
      return
    }
    setHeaderError(null)
    setPopName((prev) => prev || head.popName)
    setWorkspaceHeader({
      userFullName: head.userFullName,
      userImageUrl: head.userImageUrl,
      roleLabel: head.roleLabel,
    })
  }, [popId])

  const load = useCallback(async () => {
    if (!popId || !siteId) return
    const res = await getTreasuryAccountsHub(popId, viewYear, viewMonth)
    setSummary(res.summary)
    setFundingAccounts(res.fundingAccounts)
    setCanSettle(res.canSettle)
    if (!res.success) {
      setError(res.error || "Error")
      setRows([])
      setCanCreate(false)
      setCanUpdate(false)
      setCanDelete(false)
      if (res.redirect) {
        setTimeout(() => routerRef.current.push(res.redirect!), 1200)
      }
      return
    }
    setRows(res.rows)
    setPopName(res.popName)
    setCanCreate(res.canCreate)
    setCanUpdate(res.canUpdate)
    setCanDelete(res.canDelete)
    setError(null)
  }, [popId, siteId, viewYear, viewMonth])

  useEffect(() => {
    if (!popId || !siteId) {
      setLoading(false)
      setError("No se encontró el punto de venta.")
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        await Promise.all([load(), loadHeader()])
      } catch {
        if (!cancelled) setError("Error inesperado")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [popId, siteId, load, loadHeader])

  const openCreate = () => {
    setCreateBanner(null)
    setCreateForm({ ...defaultForm() })
    setCreateOpen(true)
  }

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId) return
    setCreateSaving(true)
    setCreateBanner(null)
    const res = await createTreasuryAccount(popId, createForm)
    setCreateSaving(false)
    if (!res.success) {
      setCreateBanner(res.error)
      return
    }
    setCreateOpen(false)
    await load()
  }

  const openEdit = (row: TreasuryAccountTableRow) => {
    setEditBanner(null)
    setEditRow(row)
    setEditForm({
      name: row.name,
      kind: row.kind,
      sortOrder: row.sortOrder,
    })
  }

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !editRow) return
    setEditSaving(true)
    setEditBanner(null)
    const res = await updateTreasuryAccount(popId, editRow.id, editForm)
    setEditSaving(false)
    if (!res.success) {
      setEditBanner(res.error)
      return
    }
    setEditRow(null)
    await load()
  }

  const submitDelete = async () => {
    if (!popId || !deleteRow) return
    setDeleteBusy(true)
    const res = await deleteTreasuryAccount(popId, deleteRow.id)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteRow(null)
      return
    }
    setDeleteRow(null)
    await load()
  }

  const openDetail = useCallback(
    async (row: TreasuryAccountTableRow) => {
      if (!popId) return
      setDetailRow(row)
      setDetailTab("movimientos")
      setCsvText("")
      setCsvBanner(null)
      setDetailLoading(true)
      setDetailError(null)
      setDetailData(null)
      setReconciliationPmId(null)
      const res = await getTreasuryAccountDetail(popId, row.id)
      setDetailLoading(false)
      if (!res.success) {
        setDetailError(res.error)
        return
      }
      setDetailData(res.data)
      setReconciliationPmId(res.data.reconciliationPaymentMethodId)
      const today = new Date()
      setManualDate(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
      )
    },
    [popId],
  )

  const reloadDetail = useCallback(async () => {
    if (!popId || !detailRow) return
    setDetailLoading(true)
    setDetailError(null)
    const res = await getTreasuryAccountDetail(popId, detailRow.id)
    setDetailLoading(false)
    if (!res.success) {
      setDetailError(res.error)
      return
    }
    setDetailData(res.data)
    setReconciliationPmId(res.data.reconciliationPaymentMethodId)
    await load()
  }, [popId, detailRow, load])

  const closeDetail = () => {
    setDetailRow(null)
    setDetailData(null)
    setDetailError(null)
    setDetailTab("movimientos")
  }

  const handleImportCsv = async () => {
    if (!popId || !detailRow || !csvText.trim()) return
    setCsvImporting(true)
    setCsvBanner(null)
    const res = await importBankStatementCsv(popId, detailRow.id, csvText)
    setCsvImporting(false)
    if (!res.success) {
      setCsvBanner(res.error)
      return
    }
    const warn =
      res.warnings.length > 0
        ? ` Importadas ${res.imported} líneas con ${res.warnings.length} advertencias.`
        : ` Se importaron ${res.imported} líneas.`
    setCsvBanner(warn)
    setCsvText("")
    await reloadDetail()
  }

  const handleAddManualLine = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !detailRow) return
    setManualSaving(true)
    setCsvBanner(null)
    const res = await addManualBankStatementLine(popId, detailRow.id, {
      lineDate: manualDate,
      description: manualDesc,
      amount: Number(String(manualAmount).replace(",", ".")),
      direction: manualDirection,
    })
    setManualSaving(false)
    if (!res.success) {
      setCsvBanner(res.error)
      return
    }
    setManualDesc("")
    setManualAmount("")
    await reloadDetail()
  }

  const handleDeleteStatementLine = async (lineId: string) => {
    if (!popId) return
    const res = await deleteBankStatementLine(popId, lineId)
    if (!res.success) {
      setCsvBanner(res.error)
      return
    }
    await reloadDetail()
  }

  const handleReconcileMovement = async (m: PaymentMethodMovementRow) => {
    if (!popId || !detailRow) return
    const key = `${m.kind}:${m.movementRefId}`
    setReconcileBusyKey(key)
    const match =
      detailData?.statementLines != null
        ? findMatchingStatementLine(m, detailData.statementLines)
        : null
    const res = await setMovementReconciliation(
      popId,
      reconciliationPmId ?? detailRow.id,
      m.kind,
      m.movementRefId,
      match?.id ?? null,
    )
    setReconcileBusyKey(null)
    if (!res.success) {
      setDetailError(res.error)
      return
    }
    await reloadDetail()
  }

  const handleUnreconcileMovement = async (m: PaymentMethodMovementRow) => {
    if (!popId) return
    const key = `${m.kind}:${m.movementRefId}`
    setReconcileBusyKey(key)
    const res = await clearMovementReconciliation(
      popId,
      m.kind,
      m.movementRefId,
    )
    setReconcileBusyKey(null)
    if (!res.success) {
      setDetailError(res.error)
      return
    }
    await reloadDetail()
  }

  const openSettle = (row: TreasuryAccountTableRow) => {
    setSettleBanner(null)
    setSettleRow(row)
    setSettleAmount(
      row.outstandingBalance > 0 ? String(row.outstandingBalance) : "",
    )
    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    setSettleDate(iso)
    setSettleFundingId(fundingAccounts[0]?.id ?? "")
    setSettleNotes("")
  }

  const submitSettle = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !settleRow) return
    setSettleSaving(true)
    setSettleBanner(null)
    const amount = Number(String(settleAmount).replace(",", "."))
    const res = await recordTreasurySettlementForAccount(popId, {
      cardTreasuryAccountId: settleRow.id,
      fundingTreasuryAccountId: settleFundingId,
      amount,
      settledAt: settleDate,
      notes: settleNotes,
    })
    setSettleSaving(false)
    if (!res.success) {
      setSettleBanner(res.error)
      return
    }
    setSettleRow(null)
    await load()
  }

  const goPrevMonth = () => {
    const next = shiftMonth(viewYear, viewMonth, -1)
    setViewYear(next.year)
    setViewMonth(next.month)
  }

  const goNextMonth = () => {
    const next = shiftMonth(viewYear, viewMonth, 1)
    setViewYear(next.year)
    setViewMonth(next.month)
  }

  const goToday = () => {
    const today = new Date()
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth() + 1)
  }

  const isCurrentMonth = useMemo(() => {
    const today = new Date()
    return (
      viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1
    )
  }, [viewYear, viewMonth])

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">No se encontró el punto de venta.</p>
      </div>
    )
  }

  return (
    <>
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title="Cuentas"
      headerVariant="dark"
      loading={loading}
      userName={workspaceHeader?.userFullName}
      userAvatarSrc={workspaceHeader?.userImageUrl ?? undefined}
      userRoleLabel={workspaceHeader?.roleLabel}
      contentFlush
      mainMaxWidthClass="max-w-none"
      mainClassName="min-h-0 overflow-y-auto"
      headerActions={
        canCreate ? (
          <DataWorkspaceHeaderIconButton
            label="Nueva cuenta"
            headerVariant="dark"
            primary
            onClick={() => openCreate()}
          >
            <Plus className="size-5" aria-hidden />
          </DataWorkspaceHeaderIconButton>
        ) : null
      }
    >
      <div className="relative flex w-full min-h-0 flex-1 flex-col">
        <TreasuryPeriodToolbar
          monthLabel={summary?.monthLabel ?? ""}
          loading={loading}
          isCurrentMonth={isCurrentMonth}
          onPrev={goPrevMonth}
          onNext={goNextMonth}
          onToday={goToday}
        />

        <div className="relative flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {headerError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              Cabecera: {headerError}
            </div>
          ) : null}

          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando cuentas…</p>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : (
            <>
              <TreasurySummaryDashboard summary={summary} rows={rows} />

              <div className={cn(dataWorkspaceShellCard, "p-5")}>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Cuentas de tesorería
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Bancos, caja, billeteras y tarjetas corporativas. Cada cuenta
                    tiene su subcuenta en el plan contable.
                  </p>
                </div>
                {canCreate ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => openCreate()}
                  >
                    <Plus className="size-4" />
                    Agregar
                  </Button>
                ) : null}
              </div>

              {rows.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                  No hay cuentas configuradas.
                </p>
              ) : (
                <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {rows.map((r) => (
                    <AccountCard
                      key={r.id}
                      row={r}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      canSettle={canSettle}
                      onEdit={() => openEdit(r)}
                      onDelete={() => setDeleteRow(r)}
                      onPayStatement={
                        r.isCardPayable ? () => openSettle(r) : undefined
                      }
                      onOpenDetail={() => void openDetail(r)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className={cn(dataWorkspaceShellCard, "px-5 py-4")}>
              <p className="text-sm text-muted-foreground">
                Tocá una cuenta para ver historial, conciliar con el extracto
                bancario o, en tarjetas corporativas,{" "}
                <strong className="font-semibold text-foreground/80">
                  pagar resumen
                </strong>{" "}
                para cerrar la deuda con el banco.
              </p>
            </div>
          </>
          )}
        </div>
      </div>
    </DataWorkspaceLayout>

    <Dialog open={createOpen} onOpenChange={(o) => !o && setCreateOpen(false)}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Nueva cuenta</DialogTitle>
            <DialogDescription className="sr-only">
              Formulario para crear un medio de cobro o pago en este punto de venta.
            </DialogDescription>
          </DialogHeader>
          {createBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {createBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitCreate(e)}>
            <TreasuryAccountFormFields
              form={createForm}
              kindDisabled={false}
              setForm={setCreateForm}
              idPrefix="c"
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
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
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Editar cuenta</DialogTitle>
            <DialogDescription className="sr-only">
              Modificá nombre, tipo, uso o cuenta contable del medio seleccionado.
            </DialogDescription>
          </DialogHeader>
          {editBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {editBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitEdit(e)}>
            <TreasuryAccountFormFields
              form={editForm}
              kindDisabled={editRow?.isSystemDefault}
              setForm={setEditForm}
              idPrefix="e"
            />
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
            <DialogTitle>¿Eliminar esta cuenta?</DialogTitle>
            <DialogDescription>
              Se quitará{" "}
              <strong className="text-foreground">
                {deleteRow?.name || "este medio"}
              </strong>{" "}
              de tesorería. No se borran movimientos ya registrados.
            </DialogDescription>
          </DialogHeader>
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

      <Dialog open={settleRow !== null} onOpenChange={(o) => !o && setSettleRow(null)}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Pagar resumen de tarjeta</DialogTitle>
            <DialogDescription className="sr-only">
              Registrá el pago del resumen de tarjeta corporativa desde una cuenta de
              tesorería.
            </DialogDescription>
          </DialogHeader>
          {settleBanner ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {settleBanner}
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={(e) => void submitSettle(e)}>
            <p className="text-sm text-muted-foreground">
              Tarjeta:{" "}
              <strong className="text-foreground">{settleRow?.name}</strong>
              {settleRow ? (
                <>
                  {" "}
                  · Pendiente: {fmt.format(settleRow.outstandingBalance)}
                </>
              ) : null}
            </p>
            <div className="space-y-2">
              <Label htmlFor="settle-amount">Importe del resumen</Label>
              <Input
                id="settle-amount"
                type="number"
                min={0}
                step="0.01"
                required
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                className="bg-background font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settle-date">Fecha de pago</Label>
              <Input
                id="settle-date"
                type="date"
                required
                value={settleDate}
                onChange={(e) => setSettleDate(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settle-funding">Pagado desde</Label>
              <select
                id="settle-funding"
                required
                value={settleFundingId}
                onChange={(e) => setSettleFundingId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {fundingAccounts.length === 0 ? (
                  <option value="">Sin cuentas de pago configuradas</option>
                ) : (
                  fundingAccounts.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settle-notes">Notas (opcional)</Label>
              <Input
                id="settle-notes"
                value={settleNotes}
                onChange={(e) => setSettleNotes(e.target.value)}
                placeholder="Ej. Resumen marzo, ref. banco"
                className="bg-background"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setSettleRow(null)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={settleSaving || fundingAccounts.length === 0}
              >
                {settleSaving ? "Registrando…" : "Registrar pago"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailRow !== null}
        onOpenChange={(o) => {
          if (!o) closeDetail()
        }}
      >
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className="max-h-[90vh] overflow-y-auto border-border bg-card text-foreground sm:max-w-xl"
        >
          <DialogHeader>
            <DialogTitle className="pr-6">
              {detailRow?.name ?? "Detalle"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Historial de movimientos, conciliación bancaria y liquidaciones de la
              cuenta seleccionada.
            </DialogDescription>
          </DialogHeader>
          {detailRow ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-muted/40 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Entró (mes)
                  </p>
                  <p className="font-semibold tabular-nums">
                    {fmt.format(detailRow.receivedMonthTotal)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Salió (mes)
                  </p>
                  <p className="font-semibold tabular-nums">
                    {fmt.format(detailRow.paidOutMonthTotal)}
                  </p>
                </div>
                {detailRow.ledgerBalance != null ? (
                  <div className="rounded-lg bg-muted/40 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Saldo contable
                    </p>
                    <p className="font-semibold tabular-nums">
                      {fmt.format(detailRow.ledgerBalance)}
                    </p>
                  </div>
                ) : null}
                {detailRow.isCardPayable ? (
                  <div className="col-span-2 rounded-lg border border-amber-200/70 bg-amber-50/80 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-950/30">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-900/80">
                      Deuda pendiente del resumen
                    </p>
                    <p className="text-lg font-bold tabular-nums text-amber-950">
                      {fmt.format(detailRow.outstandingBalance)}
                    </p>
                  </div>
                ) : null}
              </div>

              {detailLoading ? (
                <p className="text-sm text-muted-foreground">Cargando historial…</p>
              ) : detailError ? (
                <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {detailError}
                </p>
              ) : detailData ? (
                <>
                  {detailData.movements.length > 0 ? (
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>
                        Entradas:{" "}
                        <strong className="text-emerald-700 dark:text-emerald-400">
                          {fmt.format(detailData.movementTotals.in)}
                        </strong>
                      </span>
                      <span>
                        Salidas:{" "}
                        <strong className="text-rose-700 dark:text-rose-400">
                          {fmt.format(detailData.movementTotals.out)}
                        </strong>
                      </span>
                      <span>
                        Neto:{" "}
                        <strong className="text-foreground">
                          {fmt.format(detailData.movementTotals.net)}
                        </strong>
                      </span>
                    </div>
                  ) : null}

                  {detailData.supportsBankReconciliation ? (
                    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs">
                      <p className="font-semibold text-foreground">
                        Conciliación bancaria
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        Movimientos:{" "}
                        <strong className="text-foreground">
                          {detailData.reconciliationSummary.movementsReconciled}
                        </strong>{" "}
                        conciliados ·{" "}
                        <strong className="text-foreground">
                          {detailData.reconciliationSummary.movementsPending}
                        </strong>{" "}
                        pendientes · Extracto:{" "}
                        <strong className="text-foreground">
                          {detailData.reconciliationSummary.statementReconciled}
                        </strong>
                        /{detailData.statementLines.length} usadas
                      </p>
                    </div>
                  ) : null}

                  {detailData.supportsBankReconciliation ? (
                    <div className="flex gap-1 rounded-lg border border-border/60 p-1">
                      <button
                        type="button"
                        className={cn(
                          "flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                          detailTab === "movimientos"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        onClick={() => setDetailTab("movimientos")}
                      >
                        Movimientos
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                          detailTab === "extracto"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        onClick={() => setDetailTab("extracto")}
                      >
                        Extracto bancario
                      </button>
                    </div>
                  ) : null}

                  {csvBanner ? (
                    <p
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm",
                        csvBanner.startsWith("Se importaron") ||
                          csvBanner.includes("Importadas")
                          ? "border-emerald-200/70 bg-emerald-50/80 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                          : "border-destructive/25 bg-destructive/5 text-destructive",
                      )}
                    >
                      {csvBanner}
                    </p>
                  ) : null}

                  {detailRow.isCardPayable &&
                  detailData.settlements.length > 0 &&
                  detailTab === "movimientos" ? (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Liquidaciones del resumen
                      </h4>
                      <ul className="max-h-36 space-y-2 overflow-y-auto rounded-lg border border-border/60 p-2">
                        {detailData.settlements.map((s: TreasurySettlementRow) => (
                          <li
                            key={s.id}
                            className="flex items-start justify-between gap-2 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="font-medium tabular-nums">
                                {fmt.format(s.amount)}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {formatShortDate(s.settledAt)}
                                {s.fundingMethodName
                                  ? ` · desde ${s.fundingMethodName}`
                                  : ""}
                                {s.notes ? ` · ${s.notes}` : ""}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {detailTab === "extracto" &&
                  detailData.supportsBankReconciliation ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="csv-import">
                          Importar CSV (fecha, descripción, importe)
                        </Label>
                        <Textarea
                          id="csv-import"
                          value={csvText}
                          onChange={(e) => setCsvText(e.target.value)}
                          placeholder={`2026-06-01,Transferencia proveedor,-1500.00\n2026-06-03,Depósito ventas,3200.50`}
                          rows={4}
                          className="font-mono text-xs"
                          disabled={!canUpdate || csvImporting}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={!canUpdate || csvImporting || !csvText.trim()}
                            onClick={() => void handleImportCsv()}
                          >
                            <Upload className="mr-1.5 size-3.5" />
                            {csvImporting ? "Importando…" : "Importar CSV"}
                          </Button>
                          <label
                            className={cn(
                              "inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                              (!canUpdate || csvImporting) &&
                                "pointer-events-none opacity-50",
                            )}
                          >
                            <input
                              type="file"
                              accept=".csv,text/csv"
                              className="sr-only"
                              disabled={!canUpdate || csvImporting}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = () => {
                                  setCsvText(String(reader.result ?? ""))
                                }
                                reader.readAsText(file)
                                e.target.value = ""
                              }}
                            />
                            Elegir archivo
                          </label>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Columnas: fecha (YYYY-MM-DD), descripción, importe
                          (negativo = salida) o débito/crédito por separado.
                        </p>
                      </div>

                      <form
                        className="space-y-3 rounded-lg border border-border/60 p-3"
                        onSubmit={(e) => void handleAddManualLine(e)}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Línea manual
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label htmlFor="manual-date" className="text-xs">
                              Fecha
                            </Label>
                            <Input
                              id="manual-date"
                              type="date"
                              required
                              value={manualDate}
                              onChange={(e) => setManualDate(e.target.value)}
                              className="h-9 bg-background text-sm"
                              disabled={!canUpdate || manualSaving}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="manual-direction" className="text-xs">
                              Sentido
                            </Label>
                            <select
                              id="manual-direction"
                              value={manualDirection}
                              onChange={(e) =>
                                setManualDirection(e.target.value as "in" | "out")
                              }
                              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                              disabled={!canUpdate || manualSaving}
                            >
                              <option value="out">Salida</option>
                              <option value="in">Entrada</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="manual-desc" className="text-xs">
                            Descripción
                          </Label>
                          <Input
                            id="manual-desc"
                            required
                            value={manualDesc}
                            onChange={(e) => setManualDesc(e.target.value)}
                            className="h-9 bg-background text-sm"
                            disabled={!canUpdate || manualSaving}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="manual-amount" className="text-xs">
                            Importe
                          </Label>
                          <Input
                            id="manual-amount"
                            type="number"
                            min={0}
                            step="0.01"
                            required
                            value={manualAmount}
                            onChange={(e) => setManualAmount(e.target.value)}
                            className="h-9 bg-background font-mono text-sm"
                            disabled={!canUpdate || manualSaving}
                          />
                        </div>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!canUpdate || manualSaving}
                        >
                          {manualSaving ? "Agregando…" : "Agregar línea"}
                        </Button>
                      </form>

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Líneas del extracto ({detailData.statementLines.length})
                          </h4>
                          {detailData.statementLines.length > 0 ? (
                            <span className="text-[10px] text-muted-foreground">
                              +{fmt.format(detailData.reconciliationSummary.statementTotalIn)}{" "}
                              / −
                              {fmt.format(detailData.reconciliationSummary.statementTotalOut)}
                            </span>
                          ) : null}
                        </div>
                        {detailData.statementLines.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                            Importá un CSV o cargá líneas manuales para comparar
                            con los movimientos de Rootsy.
                          </p>
                        ) : (
                          <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border/60">
                            {detailData.statementLines.map((line) => (
                              <li
                                key={line.id}
                                className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-2 last:border-0"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm">
                                    {line.description || "Sin descripción"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatShortDate(line.lineDate)} ·{" "}
                                    {line.source === "csv" ? "CSV" : "Manual"}
                                    {line.reconciled ? " · Conciliada" : ""}
                                  </p>
                                </div>
                                <span
                                  className={cn(
                                    "shrink-0 text-sm font-semibold tabular-nums",
                                    line.direction === "in"
                                      ? "text-emerald-700 dark:text-emerald-400"
                                      : "text-rose-700 dark:text-rose-400",
                                  )}
                                >
                                  {line.direction === "in" ? "+" : "−"}
                                  {fmt.format(line.amount)}
                                </span>
                                {canUpdate && !line.reconciled ? (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() =>
                                      void handleDeleteStatementLine(line.id)
                                    }
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ) : (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Movimientos
                    </h4>
                    {detailData.movements.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                        No hay movimientos registrados todavía.
                      </p>
                    ) : (
                      <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border/60">
                        {detailData.movements.map((m) => {
                          const busyKey = `${m.kind}:${m.movementRefId}`
                          const isBusy = reconcileBusyKey === busyKey
                          const match =
                            detailData.supportsBankReconciliation &&
                            !m.reconciled &&
                            detailData.statementLines.length > 0
                              ? findMatchingStatementLine(
                                  m,
                                  detailData.statementLines,
                                )
                              : null
                          return (
                          <li
                            key={`${m.kind}-${m.id}`}
                            className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-2 last:border-0"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {m.label}
                                {m.reconciled ? (
                                  <CheckCircle2 className="ml-1 inline size-3.5 text-emerald-600" />
                                ) : null}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {movementKindLabel(m.kind)} ·{" "}
                                {formatShortDate(m.date)}
                                {match
                                  ? " · Coincide con extracto"
                                  : null}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span
                                className={cn(
                                  "text-sm font-semibold tabular-nums",
                                  m.direction === "in"
                                    ? "text-emerald-700 dark:text-emerald-400"
                                    : "text-rose-700 dark:text-rose-400",
                                )}
                              >
                                {m.direction === "in" ? "+" : "−"}
                                {fmt.format(m.amount)}
                              </span>
                              {detailData.supportsBankReconciliation && canUpdate ? (
                                m.reconciled ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-xs"
                                    disabled={isBusy}
                                    onClick={() =>
                                      void handleUnreconcileMovement(m)
                                    }
                                  >
                                    {isBusy ? "…" : "Deshacer"}
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs"
                                    disabled={isBusy}
                                    onClick={() =>
                                      void handleReconcileMovement(m)
                                    }
                                  >
                                    {isBusy ? "…" : "Conciliar"}
                                  </Button>
                                )
                              ) : null}
                            </div>
                          </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                  )}

                  {detailTab === "movimientos" &&
                  !detailRow.isCardPayable &&
                  detailRow.ledgerBalance != null &&
                  detailData.supportsBankReconciliation ? (
                    <p className="text-xs text-muted-foreground">
                      Marcá cada movimiento como conciliado cuando aparezca en tu
                      extracto. Si hay una línea con el mismo importe y sentido, se
                      vincula automáticamente.
                    </p>
                  ) : detailTab === "movimientos" &&
                    !detailRow.isCardPayable &&
                    detailRow.ledgerBalance != null &&
                    !detailData.supportsBankReconciliation ? (
                    <p className="text-xs text-muted-foreground">
                      Compará el saldo contable con tu extracto bancario. La
                      diferencia puede deberse a movimientos aún no cargados en
                      Rootsy.
                    </p>
                  ) : null}
                </>
              ) : null}

              {detailRow.isCardPayable && canSettle ? (
                <Button
                  type="button"
                  className="w-full"
                  disabled={detailRow.outstandingBalance <= 0}
                  onClick={() => {
                    closeDetail()
                    openSettle(detailRow)
                  }}
                >
                  Pagar resumen
                </Button>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default withAuth(AccountsPage)
