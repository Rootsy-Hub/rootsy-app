"use client"

import type {
  ExpenseCategoryFamily,
  ExpenseCategoryKind,
  ExpenseCategoryRow,
  ExpenseListRow,
} from "@/app/[siteId]/[popId]/expenses/actions"
import {
  mergeExpensesWorkspaceUrl,
  parseExpensesWorkspaceUrl,
} from "@/app/[siteId]/[popId]/expenses/workspaceUrl"
import { CheckUpsertFormFields } from "@/app/[siteId]/[popId]/checks/CheckUpsertFormFields"
import {
  defaultCheckCreateFormState,
  type CheckCreateFormState,
} from "@/app/[siteId]/[popId]/checks/checkFormState"
import { parseCheckoutCheckDetails } from "@/lib/checkoutCheck"
import { treasuryPaymentOptionKey } from "@/lib/treasuryPaymentOptions"
import { ExpenseCategoriesDialog } from "@/app/[siteId]/[popId]/expenses/ExpenseCategoriesDialog"
import { ExpenseKindCardsPanel } from "@/app/[siteId]/[popId]/expenses/ExpenseKindCards"
import { ExpensePageSkeleton } from "@/app/[siteId]/[popId]/expenses/ExpensePageSkeleton"
import { ExpensePeriodToolbar } from "@/app/[siteId]/[popId]/expenses/ExpensePeriodToolbar"
import { ExpenseSummaryDashboard } from "@/app/[siteId]/[popId]/expenses/ExpenseSummaryDashboard"
import {
  EXPENSE_WORLDS,
  isExpenseOperableKind,
  type ExpenseOperableKind,
} from "@/app/[siteId]/[popId]/expenses/expenseWorlds"
import {
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { RootsBanner } from "@/components/rootsy-banner"
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
  RootsFormSegmentField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextareaField,
} from "@/components/rootsy-form"
import { monthBoundsISO } from "@/lib/expenseMonth"
import { parseMoneyInput } from "@/lib/moneyInput"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePopExpensesMonth } from "@/hooks/usePopExpensesMonth"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import { popExpensesQueryRoot } from "@/lib/queryKeys"
import {
  createExpense,
  createExpenseCategory,
  deleteExpense,
  deleteExpenseCategory,
  fetchExpensePaymentContext,
  recordExpensePayment,
  voidExpense as voidExpenseAction,
} from "@/lib/rootsyApi/expensesClient"
import { buildPayPaymentOptions } from "@/lib/treasuryPaymentOptions"
import { Dialog } from "@/components/ui/dialog"
import { Plus, Tags } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useParams, usePathname, useSearchParams } from "@/lib/pop-spa/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
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


export function ExpensesWorkspaceView() {
  const params = useParams()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const queryClient = useQueryClient()
  const { bootstrap, loading: bootstrapLoading, error: bootstrapError, hasPermission } =
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
    () => parseExpensesWorkspaceUrl(workspaceParams),
    [workspaceParams],
  )
  const year = ws.year
  const month1 = ws.month1

  const checkPerm = useCallback(
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
  const canCreate = checkPerm(POP_PERMS.EXPENSES_CREATE)
  const canUpdate = checkPerm(POP_PERMS.EXPENSES_UPDATE)
  const canDelete = checkPerm(POP_PERMS.EXPENSES_DELETE)

  const expensesQuery = usePopExpensesMonth(popId, year, month1, {
    enabled: Boolean(popId && siteId),
  })
  const categories = expensesQuery.data?.categories ?? []
  const rows = expensesQuery.data?.rows ?? []
  const ledgerByCategoryId = expensesQuery.data?.ledgerByCategoryId ?? {}
  const totalDue = expensesQuery.data?.progress.totalDue ?? 0
  const totalPaid = expensesQuery.data?.progress.totalPaid ?? 0
  const loading =
    expensesQuery.isPending ||
    (expensesQuery.isFetching && !expensesQuery.isFetched)
  const listBusy = expensesQuery.isFetching
  const tableError =
    expensesQuery.data?.success === false
      ? expensesQuery.data.error
      : expensesQuery.error instanceof Error
        ? expensesQuery.error.message
        : expensesQuery.error
          ? String(expensesQuery.error)
          : null
  const [actionError, setActionError] = useState<string | null>(null)
  const error = actionError ?? tableError

  const [paymentMethods, setPaymentMethods] = useState<
    ReturnType<typeof buildPayPaymentOptions>
  >([])

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)
  const [createKind, setCreateKind] = useState<ExpenseOperableKind>("variable")
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
  const [newCatKind, setNewCatKind] = useState<ExpenseOperableKind>("variable")
  const [newCatFamily, setNewCatFamily] =
    useState<ExpenseCategoryFamily>("comercializacion")
  const [catSaving, setCatSaving] = useState(false)
  const [catBanner, setCatBanner] = useState<string | null>(null)
  const [pendingCategoryCreate, setPendingCategoryCreate] = useState<{
    name: string
    kind: ExpenseOperableKind
  } | null>(null)
  const [pendingCategoryDeleteId, setPendingCategoryDeleteId] = useState<
    string | null
  >(null)
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

  const pushWs = useCallback(
    (patch: Parameters<typeof mergeExpensesWorkspaceUrl>[1]) => {
      const next = mergeExpensesWorkspaceUrl(workspaceParams, patch)
      const qs = next.toString()
      const href = qs ? `${pathname}?${qs}` : pathname
      if (typeof window !== "undefined") {
        const current = `${window.location.pathname}${window.location.search}`
        if (current !== href) {
          window.history.replaceState(window.history.state, "", href)
        }
      }
      setWorkspaceSearch(qs)
    },
    [pathname, workspaceParams],
  )

  const refreshMonth = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popExpensesQueryRoot(popId),
    })
  }, [popId, queryClient])

  const pageLoading = bootstrapLoading || loading
  const popName = bootstrap?.popName ?? ""
  const headerError = bootstrapError

  const operableCategories = useMemo(
    () =>
      activeCategories.filter((c) => isExpenseOperableKind(c.kind) && !c.readOnly),
    [activeCategories],
  )

  const categoriesForCreate = useMemo(
    () => operableCategories.filter((c) => c.kind === createKind),
    [operableCategories, createKind],
  )

  const openCreate = useCallback(
    (kind?: ExpenseCategoryKind, categoryId?: string) => {
      const chosen = categoryId
        ? operableCategories.find((c) => c.id === categoryId)
        : undefined
      const nextKind: ExpenseOperableKind = isExpenseOperableKind(chosen?.kind)
        ? chosen.kind
        : isExpenseOperableKind(kind)
          ? kind
          : operableCategories[0] &&
              isExpenseOperableKind(operableCategories[0].kind)
            ? operableCategories[0].kind
            : "variable"
      const ofKind = operableCategories.filter((c) => c.kind === nextKind)
      setCreateKind(nextKind)
      setCreateBanner(null)
      setCreateCategoryId(chosen?.id ?? ofKind[0]?.id ?? "")
      setCreateAmount("")
      setCreateExpenseDate(defaultDateInMonth(year, month1))
      setCreateDueDate("")
      setCreateDescription("")
      setCreateOpen(true)
    },
    [operableCategories, year, month1],
  )

  const onCreateKindChange = (value: string) => {
    const nextKind = isExpenseOperableKind(value) ? value : "variable"
    setCreateKind(nextKind)
    const ofKind = operableCategories.filter((c) => c.kind === nextKind)
    setCreateCategoryId(ofKind[0]?.id ?? "")
  }

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId) return
    setCreateSaving(true)
    setCreateBanner(null)
    const amount = parseMoneyInput(createAmount)
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
    await refreshMonth()
  }

  const openPay = (row: ExpenseListRow) => {
    setPayBanner(null)
    setPayExpense(row)
    const remaining = roundMoneyLocal(row.amount - row.paidTotal)
    setPayAmount(String(remaining > 0 ? remaining : ""))
    setPayDate(defaultDateInMonth(year, month1))
    setPayMethodKey("")
    setPayCheckForm(defaultCheckCreateFormState("issued"))
    setPayOpen(true)
    if (!popId) return
    void fetchExpensePaymentContext(popId).then((res) => {
      if (!res.success) {
        setPaymentMethods([])
        setPayBanner(res.error)
        return
      }
      const methods = buildPayPaymentOptions(res.context)
      setPaymentMethods(methods)
      setPayMethodKey(
        methods[0] ? treasuryPaymentOptionKey(methods[0]) : "",
      )
    })
  }

  const submitPay = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !payExpense) return
    setPaySaving(true)
    setPayBanner(null)
    const amount = parseMoneyInput(payAmount)
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
    const res = await recordExpensePayment(popId, payExpense.id, {
      amount,
      paidAt: payDate,
      paymentKind: selected?.kind ?? null,
      treasuryAccountId: selected?.treasuryAccountId ?? null,
      checkDetails,
    })
    setPaySaving(false)
    if (!res.success) {
      setPayBanner(res.error)
      return
    }
    setPayOpen(false)
    setPayExpense(null)
    await refreshMonth()
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
    await refreshMonth()
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
        setActionError(res.error)
        return
      }
      setConfirmAction(null)
      await refreshMonth()
      return
    }
    const category = confirmAction.category
    setPendingCategoryDeleteId(category.id)
    setConfirmAction(null)
    setConfirmBusy(false)
    const res = await deleteExpenseCategory(popId, category.id)
    if (!res.success) {
      setPendingCategoryDeleteId(null)
      if (catOpen) setCatBanner(res.error)
      else setActionError(res.error)
      return
    }
    await refreshMonth()
    setPendingCategoryDeleteId(null)
  }

  const submitNewCategory = async () => {
    const name = newCatName.trim()
    if (!popId || !name || catSaving) return
    const kind = newCatKind
    const family = newCatFamily
    setCatSaving(true)
    setCatBanner(null)
    setPendingCategoryCreate({ name, kind })
    setNewCatName("")
    const res = await createExpenseCategory(popId, name, kind, family)
    if (!res.success) {
      setPendingCategoryCreate(null)
      setCatSaving(false)
      setNewCatName(name)
      setCatBanner(res.error)
      return
    }
    await refreshMonth()
    setCatSaving(false)
    setPendingCategoryCreate(null)
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
                label="Nueva promesa"
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
                onClick={() => {
                  setCatBanner(null)
                  setCatOpen(true)
                }}
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
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <ExpenseSummaryDashboard
                    totalDue={totalDue}
                    totalPaid={totalPaid}
                  />
                </div>
                <ExpensePeriodToolbar
                  year={year}
                  month1={month1}
                  loading={listBusy}
                  onChange={({ year: nextYear, month }) => {
                    pushWs({ year: nextYear, month1: month })
                  }}
                />
              </div>

              <ExpenseKindCardsPanel
                categories={categories}
                rows={rows}
                ledgerByCategoryId={ledgerByCategoryId}
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
              title={EXPENSE_WORLDS[createKind].createTitle}
              description={EXPENSE_WORLDS[createKind].createHint(monthLabel)}
            />
            <RootsDialogBody className="space-y-4">
              {createBanner ? (
                <RootsDialogErrorBanner>{createBanner}</RootsDialogErrorBanner>
              ) : null}
              <RootsFormSegmentField
                label="Tipo"
                value={createKind}
                onValueChange={onCreateKindChange}
                hint={EXPENSE_WORLDS[createKind].categoryHint}
                options={[
                  { value: "fijo", label: "Fijo" },
                  { value: "variable", label: "Variable" },
                ]}
              />
              {categoriesForCreate.length === 0 ? (
                <p className="font-canopy text-xs leading-relaxed text-rootsy-bruma-500">
                  Todavía no hay categorías{" "}
                  {createKind === "fijo" ? "fijas" : "variables"}. Creá una
                  desde Categorías.
                </p>
              ) : (
                <RootsFormSelectField
                  label="Categoría"
                  value={createCategoryId}
                  onValueChange={setCreateCategoryId}
                >
                  {categoriesForCreate.map((c) => (
                    <RootsFormSelectItem key={c.id} value={c.id}>
                      {c.name}
                    </RootsFormSelectItem>
                  ))}
                </RootsFormSelectField>
              )}
              <RootsFormMoneyField
                label="Importe"
                value={createAmount}
                onChange={setCreateAmount}
              />
              <RootsFormDateField
                label="Fecha"
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
              confirmDisabled={categoriesForCreate.length === 0}
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

      <ExpenseCategoriesDialog
        open={catOpen}
        onOpenChange={(open) => {
          setCatOpen(open)
          if (!open) {
            setCatBanner(null)
            setPendingCategoryCreate(null)
            setPendingCategoryDeleteId(null)
            setCatSaving(false)
          }
        }}
        categories={categories}
        name={newCatName}
        kind={newCatKind}
        family={newCatFamily}
        saving={catSaving}
        pendingCreate={
          pendingCategoryCreate &&
          !categories.some(
            (category) =>
              category.deletedAt == null &&
              category.name === pendingCategoryCreate.name &&
              category.kind === pendingCategoryCreate.kind,
          )
            ? pendingCategoryCreate
            : null
        }
        pendingDeleteId={pendingCategoryDeleteId}
        banner={catBanner}
        canDelete={canDelete}
        onNameChange={setNewCatName}
        onKindChange={setNewCatKind}
        onFamilyChange={setNewCatFamily}
        onSubmit={() => void submitNewCategory()}
        onDelete={onDeleteCategory}
      />

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
