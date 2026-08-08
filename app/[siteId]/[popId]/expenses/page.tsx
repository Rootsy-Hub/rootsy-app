"use client"

import {
  createExpense,
  createExpenseCategory,
  deleteExpense,
  deleteExpenseCategory,
  getExpenseMonthProgress,
  getExpensesPageData,
  listExpensesForMonth,
  recordExpensePayment,
  voidExpense as voidExpenseAction,
  type ExpenseCategoryKind,
  type ExpenseCategoryRow,
  type ExpenseListRow,
  type PaymentMethodOption,
} from "@/app/[siteId]/[popId]/expenses/actions"
import { treasuryPaymentOptionKey } from "@/lib/treasuryPaymentOptions"
import { ExpenseKindCardsPanel } from "@/app/[siteId]/[popId]/expenses/ExpenseKindCards"
import { ExpensePeriodToolbar } from "@/app/[siteId]/[popId]/expenses/ExpensePeriodToolbar"
import { ExpenseSummaryDashboard } from "@/app/[siteId]/[popId]/expenses/ExpenseSummaryDashboard"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { monthBoundsISO } from "@/lib/expenseMonth"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import withAuth from "@/hoc/withAuth"
import {
  Plus,
  Tags,
  Trash2,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

function formatIsoDate(iso: string) {
  if (!iso) return "—"
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat("es", { dateStyle: "short" }).format(d)
}

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

function defaultDateInMonth(year: number, month1: number): string {
  const { start, end } = monthBoundsISO(year, month1)
  const t = new Date()
  const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`
  if (iso >= start && iso <= end) return iso
  return end
}

function roundMoneyLocal(n: number): number {
  return Math.round(n * 100) / 100
}

function shiftMonth(year: number, month1: number, delta: number) {
  const d = new Date(year, month1 - 1 + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

function ExpensesPage() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month1, setMonth1] = useState(now.getMonth() + 1)

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  const [categories, setCategories] = useState<ExpenseCategoryRow[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>(
    [],
  )
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [rows, setRows] = useState<ExpenseListRow[]>([])
  const [listBusy, setListBusy] = useState(false)
  const [totalDue, setTotalDue] = useState(0)
  const [totalPaid, setTotalPaid] = useState(0)

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)
  const [createCategoryId, setCreateCategoryId] = useState("")
  const [createAmount, setCreateAmount] = useState("")
  const [createExpenseDate, setCreateExpenseDate] = useState("")
  const [createDueDate, setCreateDueDate] = useState("")
  const [createDescription, setCreateDescription] = useState("")

  const [payOpen, setPayOpen] = useState(false)
  const [payExpense, setPayExpense] = useState<ExpenseListRow | null>(null)
  const [payAmount, setPayAmount] = useState("")
  const [payDate, setPayDate] = useState("")
  const [payMethodKey, setPayMethodKey] = useState("")
  const [paySaving, setPaySaving] = useState(false)
  const [payBanner, setPayBanner] = useState<string | null>(null)

  const [voidOpen, setVoidOpen] = useState(false)
  const [voidTarget, setVoidTarget] = useState<ExpenseListRow | null>(null)
  const [voidReason, setVoidReason] = useState("")
  const [voidSaving, setVoidSaving] = useState(false)

  const [catOpen, setCatOpen] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatKind, setNewCatKind] = useState<ExpenseCategoryKind>("variable")
  const [catSaving, setCatSaving] = useState(false)

  const { start: monthStart, end: monthEnd } = useMemo(
    () => monthBoundsISO(year, month1),
    [year, month1],
  )

  const activeCategories = useMemo(
    () => categories.filter((c) => c.deletedAt == null),
    [categories],
  )

  const monthLabel = `${MONTH_NAMES[month1 - 1]} ${year}`

  const isCurrentMonth = useMemo(() => {
    const today = new Date()
    return year === today.getFullYear() && month1 === today.getMonth() + 1
  }, [year, month1])

  const reloadList = useCallback(async () => {
    if (!popId) return
    setListBusy(true)
    const [lr, pr] = await Promise.all([
      listExpensesForMonth(popId, year, month1),
      getExpenseMonthProgress(popId, year, month1),
    ])
    setListBusy(false)
    if (lr.success) setRows(lr.rows)
    if (pr.success) {
      setTotalDue(pr.progress.totalDue)
      setTotalPaid(pr.progress.totalPaid)
    }
  }, [popId, year, month1])

  const loadPage = useCallback(async () => {
    if (!popId) return
    setLoading(true)
    const res = await getExpensesPageData(popId)
    if (!res.success) {
      setError(res.error || "Error")
      if (res.redirect) {
        setTimeout(() => routerRef.current.push(res.redirect!), 1200)
      }
      setLoading(false)
      return
    }
    setCategories(res.categories)
    setPaymentMethods(res.paymentMethods)
    setCanCreate(res.canCreate)
    setCanUpdate(res.canUpdate)
    setCanDelete(res.canDelete)
    setError(null)
    setLoading(false)
  }, [popId])

  useEffect(() => {
    if (!popId || !siteId) {
      setLoading(false)
      setError("No se encontró el punto de venta.")
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await loadPage()
      } catch {
        if (!cancelled) setError("Error inesperado")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadPage, popId, siteId])

  const pageLoading = bootstrapLoading || loading
  const popName = bootstrap?.popName ?? ""
  const headerError = bootstrapError

  useEffect(() => {
    if (!popId || loading || error) return
    void reloadList()
  }, [popId, year, month1, loading, error, reloadList])

  const goPrevMonth = () => {
    const next = shiftMonth(year, month1, -1)
    setYear(next.year)
    setMonth1(next.month)
  }

  const goNextMonth = () => {
    const next = shiftMonth(year, month1, 1)
    setYear(next.year)
    setMonth1(next.month)
  }

  const goToday = () => {
    const today = new Date()
    setYear(today.getFullYear())
    setMonth1(today.getMonth() + 1)
  }

  const openCreate = useCallback(() => {
    setCreateBanner(null)
    setCreateCategoryId(activeCategories[0]?.id ?? "")
    setCreateAmount("")
    setCreateExpenseDate(defaultDateInMonth(year, month1))
    setCreateDueDate("")
    setCreateDescription("")
    setCreateOpen(true)
  }, [activeCategories, year, month1])

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId) return
    setCreateSaving(true)
    setCreateBanner(null)
    const amount = Number(String(createAmount).replace(",", "."))
    const res = await createExpense(popId, year, month1, {
      categoryId: createCategoryId,
      amount,
      expenseDate: createExpenseDate,
      dueDate: createDueDate.trim() || null,
      description: createDescription,
    })
    setCreateSaving(false)
    if (!res.success) {
      setCreateBanner(res.error)
      return
    }
    setCreateOpen(false)
    await reloadList()
    await loadPage()
  }

  const openPay = (row: ExpenseListRow) => {
    setPayBanner(null)
    setPayExpense(row)
    const remaining = roundMoneyLocal(row.amount - row.paidTotal)
    setPayAmount(String(remaining > 0 ? remaining : ""))
    setPayDate(defaultDateInMonth(year, month1))
    setPayMethodKey(
      paymentMethods[0] ? treasuryPaymentOptionKey(paymentMethods[0]) : "",
    )
    setPayOpen(true)
  }

  const submitPay = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !payExpense) return
    setPaySaving(true)
    setPayBanner(null)
    const amount = Number(String(payAmount).replace(",", "."))
    const selected = paymentMethods.find(
      (pm) => treasuryPaymentOptionKey(pm) === payMethodKey.trim(),
    )
    const res = await recordExpensePayment(
      popId,
      payExpense.id,
      amount,
      payDate,
      selected?.kind ?? null,
      selected?.treasuryAccountId ?? null,
    )
    setPaySaving(false)
    if (!res.success) {
      setPayBanner(res.error)
      return
    }
    setPayOpen(false)
    setPayExpense(null)
    await reloadList()
  }

  const submitVoid = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !voidTarget) return
    setVoidSaving(true)
    const res = await voidExpenseAction(popId, voidTarget.id, voidReason)
    setVoidSaving(false)
    if (!res.success) {
      return
    }
    setVoidOpen(false)
    setVoidTarget(null)
    setVoidReason("")
    await reloadList()
  }

  const onDeleteExpense = async (row: ExpenseListRow) => {
    if (!popId) return
    if (!window.confirm("¿Eliminar este gasto? Solo aplica si no tiene pagos.")) {
      return
    }
    const res = await deleteExpense(popId, row.id)
    if (!res.success) {
      window.alert(res.error)
      return
    }
    await reloadList()
  }

  const submitNewCategory = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId) return
    setCatSaving(true)
    const res = await createExpenseCategory(popId, newCatName, newCatKind)
    setCatSaving(false)
    if (!res.success) {
      window.alert(res.error)
      return
    }
    setNewCatName("")
    setCatOpen(false)
    await loadPage()
  }

  const onDeleteCategory = async (c: ExpenseCategoryRow) => {
    if (!popId) return
    if (!window.confirm(`¿Eliminar la categoría «${c.name}»?`)) return
    const res = await deleteExpenseCategory(popId, c.id)
    if (!res.success) {
      window.alert(res.error)
      return
    }
    await loadPage()
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado</p>
      </div>
    )
  }

  return (
    <>
      <DataWorkspaceModuleLayout
        siteId={siteId}
        popId={popId}
        popName={popName}
        title="Gastos"
        headerVariant={dataWorkspaceModuleHeaderVariant}
        loading={pageLoading}
        userName={bootstrap?.userFullName}
        userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
        userRoleLabel={bootstrap?.roleLabel}
        contentFlush
        mainMaxWidthClass="max-w-none"
        mainClassName="min-h-0 overflow-y-auto"
        headerActions={
          <>
            {canCreate ? (
              <DataWorkspaceHeaderIconButton
                label="Nuevo gasto"
                headerVariant={dataWorkspaceModuleHeaderVariant}
                primary
                onClick={() => openCreate()}
              >
                <Plus className="size-5" aria-hidden />
              </DataWorkspaceHeaderIconButton>
            ) : null}
            {canUpdate ? (
              <DataWorkspaceHeaderIconButton
                label="Categorías"
                headerVariant={dataWorkspaceModuleHeaderVariant}
                onClick={() => setCatOpen(true)}
              >
                <Tags className="size-5" aria-hidden />
              </DataWorkspaceHeaderIconButton>
            ) : null}
          </>
        }
      >
        <div className="relative flex w-full min-h-0 flex-1 flex-col">
          <ExpensePeriodToolbar
            monthLabel={monthLabel}
            loading={pageLoading || listBusy}
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
              <p className="text-sm text-muted-foreground">Cargando gastos…</p>
            ) : error ? (
              <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : (
              <>
                <ExpenseSummaryDashboard
                  rows={rows}
                  totalDue={totalDue}
                  totalPaid={totalPaid}
                  monthLabel={monthLabel}
                />

                <ExpenseKindCardsPanel
                  rows={rows}
                  listBusy={listBusy}
                  canCreate={canCreate}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  formatDate={formatIsoDate}
                  onPay={openPay}
                  onVoid={(row) => {
                    setVoidTarget(row)
                    setVoidReason("")
                    setVoidOpen(true)
                  }}
                  onDelete={onDeleteExpense}
                  onCreate={canCreate ? openCreate : undefined}
                />
              </>
            )}
          </div>
        </div>
      </DataWorkspaceModuleLayout>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          data-rootsy-light-shell="true"
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <form onSubmit={submitCreate}>
            <DialogHeader>
              <DialogTitle>Nuevo gasto</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              {createBanner ? (
                <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {createBanner}
                </p>
              ) : null}
              <div className="space-y-1">
                <Label>Categoría</Label>
                <select
                  required
                  className="flex h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                  value={createCategoryId}
                  onChange={(e) => setCreateCategoryId(e.target.value)}
                >
                  {activeCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.kind === "fijo" ? "Fijo" : "Variable"})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Importe</Label>
                <Input
                  required
                  inputMode="decimal"
                  className="bg-background"
                  value={createAmount}
                  onChange={(e) => setCreateAmount(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-1">
                <Label>Fecha del gasto</Label>
                <Input
                  required
                  type="date"
                  min={monthStart}
                  max={monthEnd}
                  className="bg-background"
                  value={createExpenseDate}
                  onChange={(e) => setCreateExpenseDate(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Solo fechas entre {formatIsoDate(monthStart)} y{" "}
                  {formatIsoDate(monthEnd)}.
                </p>
              </div>
              <div className="space-y-1">
                <Label>Vencimiento (opcional)</Label>
                <Input
                  type="date"
                  className="bg-background"
                  value={createDueDate}
                  onChange={(e) => setCreateDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Descripción</Label>
                <Textarea
                  className="bg-background"
                  rows={2}
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createSaving}>
                {createSaving ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent
          data-rootsy-light-shell="true"
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <form onSubmit={submitPay}>
            <DialogHeader>
              <DialogTitle>Registrar pago</DialogTitle>
            </DialogHeader>
            {payExpense ? (
              <p className="text-sm text-muted-foreground">
                {fmt.format(payExpense.amount)} · pendiente{" "}
                {fmt.format(
                  roundMoneyLocal(payExpense.amount - payExpense.paidTotal),
                )}
              </p>
            ) : null}
            <div className="grid gap-3 py-2">
              {payBanner ? (
                <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {payBanner}
                </p>
              ) : null}
              <div className="space-y-1">
                <Label>Importe</Label>
                <Input
                  required
                  inputMode="decimal"
                  className="bg-background"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Fecha de pago</Label>
                <Input
                  required
                  type="date"
                  className="bg-background"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Medio de pago (opcional)</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                  value={payMethodKey}
                  onChange={(e) => setPayMethodKey(e.target.value)}
                >
                  <option value="">—</option>
                  {paymentMethods.map((pm) => (
                    <option key={treasuryPaymentOptionKey(pm)} value={treasuryPaymentOptionKey(pm)}>
                      {pm.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setPayOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={paySaving}>
                {paySaving ? "Guardando…" : "Registrar pago"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={voidOpen} onOpenChange={setVoidOpen}>
        <DialogContent
          data-rootsy-light-shell="true"
          className="border-border bg-card text-foreground sm:max-w-md"
        >
          <form onSubmit={submitVoid}>
            <DialogHeader>
              <DialogTitle>Anular gasto</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              El gasto dejará de contar en totales. Si ya hay pagos registrados,
              permanecen en el historial.
            </p>
            <div className="py-2">
              <Label>Motivo (opcional)</Label>
              <Textarea
                className="mt-1 bg-background"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setVoidOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={voidSaving}>
                {voidSaving ? "Anulando…" : "Anular"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent
          data-rootsy-light-shell="true"
          className="border-border bg-card text-foreground sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>Categorías</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitNewCategory} className="space-y-3 border-b border-border pb-4">
            <p className="text-sm text-muted-foreground">
              Las categorías con gastos asociados se archivan (etiqueta eliminada)
              en lugar de borrarse.
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Nombre"
                className="max-w-[200px] bg-background"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
              <select
                className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                value={newCatKind}
                onChange={(e) =>
                  setNewCatKind(e.target.value as ExpenseCategoryKind)
                }
              >
                <option value="variable">Variable</option>
                <option value="fijo">Fijo</option>
              </select>
              <Button type="submit" size="sm" disabled={catSaving}>
                Agregar
              </Button>
            </div>
          </form>
          <ul className="max-h-64 space-y-2 overflow-y-auto py-2">
            {categories
              .filter((c) => c.deletedAt == null)
              .map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {c.name}{" "}
                    <span className="text-muted-foreground">
                      ({c.kind === "fijo" ? "Fijo" : "Variable"})
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => void onDeleteCategory(c)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </li>
              ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default withAuth(ExpensesPage)
