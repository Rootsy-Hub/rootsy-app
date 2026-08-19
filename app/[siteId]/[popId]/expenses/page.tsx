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
import { CheckUpsertFormFields } from "@/app/[siteId]/[popId]/checks/CheckUpsertFormFields"
import {
  defaultCheckCreateFormState,
  type CheckCreateFormState,
} from "@/app/[siteId]/[popId]/checks/checkFormState"
import { parseCheckoutCheckDetails } from "@/lib/checkoutCheck"
import { treasuryPaymentOptionKey } from "@/lib/treasuryPaymentOptions"
import { ExpenseKindCardsPanel } from "@/app/[siteId]/[popId]/expenses/ExpenseKindCards"
import { ExpensePageSkeleton } from "@/app/[siteId]/[popId]/expenses/ExpensePageSkeleton"
import { ExpensePeriodToolbar } from "@/app/[siteId]/[popId]/expenses/ExpensePeriodToolbar"
import { ExpenseSummaryDashboard } from "@/app/[siteId]/[popId]/expenses/ExpenseSummaryDashboard"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceBlocksSection } from "@/components/data-workspace/DataWorkspaceBlocksSection"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { RootsBanner } from "@/components/rootsy-banner"
import { RootsDangerSubtleButton } from "@/components/rootsy-button"
import {
  RootsConfirmDialog,
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormDateField,
  RootsFormMoneyField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
  RootsFormTextareaField,
} from "@/components/rootsy-form"
import { monthBoundsISO } from "@/lib/expenseMonth"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Plus, Tags, Trash2 } from "lucide-react"
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
  const [payCheckForm, setPayCheckForm] = useState<CheckCreateFormState>(() =>
    defaultCheckCreateFormState("issued"),
  )
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
  const [confirmAction, setConfirmAction] = useState<
    | { kind: "delete-expense"; row: ExpenseListRow }
    | { kind: "delete-category"; category: ExpenseCategoryRow }
    | null
  >(null)
  const [confirmBusy, setConfirmBusy] = useState(false)

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
    setPayCheckForm(defaultCheckCreateFormState("issued"))
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
    let checkDetails = null
    if (selected?.kind === "check") {
      const parsed = parseCheckoutCheckDetails({
        checkNumber: payCheckForm.checkNumber,
        bankName: payCheckForm.bankName,
        issueDate: payCheckForm.issueDate,
        dueDate: payCheckForm.dueDate,
        partyName: payCheckForm.partyName,
        partyId: payCheckForm.partyId,
        notes: payCheckForm.notes,
      })
      if (!parsed.ok) {
        setPaySaving(false)
        setPayBanner(parsed.error)
        return
      }
      checkDetails = parsed.details
    }
    const res = await recordExpensePayment(
      popId,
      payExpense.id,
      amount,
      payDate,
      selected?.kind ?? null,
      selected?.treasuryAccountId ?? null,
      checkDetails,
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

  const onDeleteExpense = (row: ExpenseListRow) => {
    setConfirmAction({ kind: "delete-expense", row })
  }

  const runConfirmAction = async () => {
    if (!popId || !confirmAction) return
    setConfirmBusy(true)
    if (confirmAction.kind === "delete-expense") {
      const res = await deleteExpense(popId, confirmAction.row.id)
      setConfirmBusy(false)
      if (!res.success) {
        setError(res.error)
        return
      }
      setConfirmAction(null)
      await reloadList()
      return
    }
    const res = await deleteExpenseCategory(popId, confirmAction.category.id)
    setConfirmBusy(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setConfirmAction(null)
    await loadPage()
  }

  const submitNewCategory = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId) return
    setCatSaving(true)
    const res = await createExpenseCategory(popId, newCatName, newCatKind)
    setCatSaving(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setNewCatName("")
    setCatOpen(false)
    await loadPage()
  }

  const onDeleteCategory = (c: ExpenseCategoryRow) => {
    setConfirmAction({ kind: "delete-category", category: c })
  }

  const confirmCopy =
    confirmAction?.kind === "delete-expense"
      ? {
          title: "Eliminar gasto",
          description:
            "Solo se puede si no tiene pagos. Esta acción no se puede deshacer.",
          confirmLabel: "Eliminar",
        }
      : confirmAction?.kind === "delete-category"
        ? {
            title: "Eliminar categoría",
            description: `¿Eliminar «${confirmAction.category.name}»? Si tiene gastos, se archiva.`,
            confirmLabel: "Eliminar",
          }
        : { title: "", description: "", confirmLabel: "Confirmar" }

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
        mainClassName={dataWorkspaceBlocksPageMainClass}
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
        <div className={dataWorkspaceBlocksPageContentClass}>
          {headerError ? (
            <RootsBanner
              intent="danger"
              layout="message"
              message={`Cabecera: ${headerError}`}
            />
          ) : null}

          {pageLoading ? (
            <ExpensePageSkeleton />
          ) : error ? (
            <RootsBanner intent="danger" layout="message" message={error} />
          ) : (
            <>
              <DataWorkspaceBlocksSection
                title={monthLabel}
                description="Los gastos se filtran por fecha de imputación. Los pagos cuentan para el avance aunque se registren en otro mes."
                action={
                  <ExpensePeriodToolbar
                    monthLabel={monthLabel}
                    loading={listBusy}
                    isCurrentMonth={isCurrentMonth}
                    onPrev={goPrevMonth}
                    onNext={goNextMonth}
                    onToday={goToday}
                  />
                }
              >
                <ExpenseSummaryDashboard
                  rows={rows}
                  totalDue={totalDue}
                  totalPaid={totalPaid}
                  monthLabel={monthLabel}
                />
              </DataWorkspaceBlocksSection>

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
      </DataWorkspaceModuleLayout>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <RootsDialogContent size="default" showCloseButton={!createSaving}>
          <RootsDialogForm onSubmit={submitCreate}>
            <RootsDialogHeader
              open={createOpen}
              title="Nuevo gasto"
              description={`Imputado en ${monthLabel}.`}
            />
            <RootsDialogBody className="space-y-4">
              {createBanner ? (
                <RootsDialogErrorBanner>{createBanner}</RootsDialogErrorBanner>
              ) : null}
              <RootsFormSelectField
                label="Categoría"
                value={createCategoryId}
                onValueChange={setCreateCategoryId}
              >
                {activeCategories.map((c) => (
                  <RootsFormSelectItem key={c.id} value={c.id}>
                    {c.name} ({c.kind === "fijo" ? "Fijo" : "Variable"})
                  </RootsFormSelectItem>
                ))}
              </RootsFormSelectField>
              <RootsFormMoneyField
                label="Importe"
                value={createAmount}
                onChange={setCreateAmount}
              />
              <RootsFormDateField
                label="Fecha del gasto"
                value={createExpenseDate}
                onChange={setCreateExpenseDate}
                hint={`Entre ${formatIsoDate(monthStart)} y ${formatIsoDate(monthEnd)}.`}
              />
              <RootsFormDateField
                label="Vencimiento"
                value={createDueDate}
                onChange={setCreateDueDate}
                hint="Opcional"
              />
              <RootsFormTextareaField
                label="Descripción"
                value={createDescription}
                onChange={(event) => setCreateDescription(event.target.value)}
              />
            </RootsDialogBody>
            <RootsDialogDualActionFooter
              cancelLabel="Cancelar"
              confirmLabel="Guardar"
              confirmType="submit"
              confirmLoading={createSaving}
              confirmLoadingLabel="Guardando…"
              onCancel={() => setCreateOpen(false)}
            />
          </RootsDialogForm>
        </RootsDialogContent>
      </Dialog>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <RootsDialogContent size="default" showCloseButton={!paySaving}>
          <RootsDialogForm onSubmit={submitPay}>
            <RootsDialogHeader
              open={payOpen}
              title="Registrar pago"
              description={
                payExpense
                  ? `${fmt.format(payExpense.amount)} · pendiente ${fmt.format(roundMoneyLocal(payExpense.amount - payExpense.paidTotal))}`
                  : undefined
              }
            />
            <RootsDialogBody className="space-y-4">
              {payBanner ? (
                <RootsDialogErrorBanner>{payBanner}</RootsDialogErrorBanner>
              ) : null}
              <RootsFormMoneyField
                label="Importe"
                value={payAmount}
                onChange={setPayAmount}
              />
              <RootsFormDateField
                label="Fecha de pago"
                value={payDate}
                onChange={setPayDate}
              />
              <RootsFormSelectField
                label="Medio de pago"
                value={payMethodKey || "none"}
                onValueChange={(value) =>
                  setPayMethodKey(value === "none" ? "" : value)
                }
                hint="Opcional"
              >
                <RootsFormSelectItem value="none">Sin medio</RootsFormSelectItem>
                {paymentMethods.map((pm) => (
                  <RootsFormSelectItem
                    key={treasuryPaymentOptionKey(pm)}
                    value={treasuryPaymentOptionKey(pm)}
                  >
                    {pm.label}
                  </RootsFormSelectItem>
                ))}
              </RootsFormSelectField>
              {paymentMethods.find(
                (pm) => treasuryPaymentOptionKey(pm) === payMethodKey.trim(),
              )?.kind === "check" && popId ? (
                <CheckUpsertFormFields
                  popId={popId}
                  idPrefix="expense-check"
                  form={payCheckForm}
                  setForm={setPayCheckForm}
                  hideAmount
                />
              ) : null}
            </RootsDialogBody>
            <RootsDialogDualActionFooter
              cancelLabel="Cancelar"
              confirmLabel="Registrar pago"
              confirmType="submit"
              confirmLoading={paySaving}
              confirmLoadingLabel="Guardando…"
              onCancel={() => setPayOpen(false)}
            />
          </RootsDialogForm>
        </RootsDialogContent>
      </Dialog>

      <Dialog open={voidOpen} onOpenChange={setVoidOpen}>
        <RootsDialogContent size="default" showCloseButton={!voidSaving}>
          <RootsDialogForm onSubmit={submitVoid}>
            <RootsDialogHeader
              open={voidOpen}
              title="Anular gasto"
              description="Deja de contar en los totales. Si ya hay pagos, quedan en el historial."
            />
            <RootsDialogBody>
              <RootsFormTextareaField
                label="Motivo"
                value={voidReason}
                onChange={(event) => setVoidReason(event.target.value)}
                hint="Opcional"
              />
            </RootsDialogBody>
            <RootsDialogDualActionFooter
              cancelLabel="Cancelar"
              confirmLabel="Anular"
              confirmType="submit"
              destructive
              confirmLoading={voidSaving}
              confirmLoadingLabel="Anulando…"
              onCancel={() => setVoidOpen(false)}
            />
          </RootsDialogForm>
        </RootsDialogContent>
      </Dialog>

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <RootsDialogContent size="wide" showCloseButton={!catSaving}>
          <RootsDialogHeader
            open={catOpen}
            title="Categorías"
            description="Si ya tiene gastos, se archiva en lugar de borrarse."
          />
          <RootsDialogBody className="space-y-5">
            <RootsDialogForm onSubmit={submitNewCategory}>
              <div className="space-y-4">
                <RootsFormTextField
                  label="Nombre"
                  value={newCatName}
                  onChange={(event) => setNewCatName(event.target.value)}
                  placeholder="Alquiler, luz, insumos…"
                />
                <RootsFormSelectField
                  label="Tipo"
                  value={newCatKind}
                  onValueChange={(value) =>
                    setNewCatKind(value as ExpenseCategoryKind)
                  }
                >
                  <RootsFormSelectItem value="variable">Variable</RootsFormSelectItem>
                  <RootsFormSelectItem value="fijo">Fijo</RootsFormSelectItem>
                </RootsFormSelectField>
                <RootsDialogDualActionFooter
                  cancelLabel="Cerrar"
                  confirmLabel="Agregar"
                  confirmType="submit"
                  confirmLoading={catSaving}
                  confirmLoadingLabel="Agregando…"
                  onCancel={() => setCatOpen(false)}
                />
              </div>
            </RootsDialogForm>

            {categories.filter((c) => c.deletedAt == null).length === 0 ? (
              <p className={dataWorkspaceBlocksEmptyStateClass}>
                Todavía no hay categorías.
              </p>
            ) : (
              <ul
                className={cn(
                  dataWorkspaceEntityCardLosetaSurfaceClass,
                  "h-auto max-h-64 divide-y divide-rootsy-bruma-200 overflow-y-auto",
                )}
              >
                {categories
                  .filter((c) => c.deletedAt == null)
                  .map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-canopy text-sm font-semibold text-rootsy-bruma-900">
                          {c.name}
                        </p>
                        <p className="font-canopy text-[11px] text-rootsy-bruma-500">
                          {c.kind === "fijo" ? "Fijo" : "Variable"}
                        </p>
                      </div>
                      <RootsDangerSubtleButton
                        type="button"
                        size="compact"
                        aria-label={`Eliminar ${c.name}`}
                        onClick={() => onDeleteCategory(c)}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </RootsDangerSubtleButton>
                    </li>
                  ))}
              </ul>
            )}
          </RootsDialogBody>
        </RootsDialogContent>
      </Dialog>

      <RootsConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open && !confirmBusy) setConfirmAction(null)
        }}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={confirmCopy.confirmLabel}
        busy={confirmBusy}
        busyConfirmLabel="Procesando…"
        destructive
        onConfirm={() => void runConfirmAction()}
      />
    </>
  )
}

export default ExpensesPage
