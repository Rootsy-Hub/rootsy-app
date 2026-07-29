"use client"

import type {
  TreasuryChildAccountRow,
  TreasuryFundingOption,
} from "@/app/[siteId]/[popId]/accounts/actions"
import {
  getTreasuryChildPendingBalanceAsOf,
  recordPosAcreditationForAccount,
  recordTreasurySettlementForAccount,
} from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import {
  TREASURY_CARD_STATEMENT_CHARGES_ACCOUNT_HINT,
  TREASURY_CARD_STATEMENT_CHARGES_LABEL,
  TREASURY_CARD_STATEMENT_CHARGES_SHORT_LABEL,
  TREASURY_RECONCILE_COMMISSIONS_ACCOUNT_HINT,
  TREASURY_RECONCILE_COMMISSIONS_LABEL,
  defaultTreasuryPeriodEnd,
  formatTreasuryMoneyInputValue,
  formatTreasuryShortDate,
  parseTreasuryMoneyInput,
  treasuryMoneyFmt as fmt,
} from "@/app/[siteId]/[popId]/accounts/treasuryAccountUiUtils"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Calculator, Loader2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

const lightPanel =
  "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-200 dark:bg-white dark:text-zinc-900"
const lightSurface =
  "border-zinc-200 bg-white text-zinc-900 shadow-xs dark:border-zinc-200 dark:bg-white dark:text-zinc-900"
const lightMuted = "text-zinc-500 dark:text-zinc-500"
const lightLabel = "text-zinc-700 dark:text-zinc-700"
const lightSummary = "border-zinc-100 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-50"
const lightFooter = "border-zinc-100 bg-zinc-50/90 dark:border-zinc-100 dark:bg-zinc-50/90"
const lightOutlineButton =
  "border-zinc-200 !bg-white text-zinc-800 shadow-xs hover:!bg-zinc-100 hover:!text-zinc-900 dark:border-zinc-200 dark:!bg-white dark:text-zinc-800 dark:hover:!bg-zinc-100 dark:hover:!text-zinc-900"
const lightLinkAction =
  "h-auto shrink-0 gap-1.5 px-0 py-0 text-xs font-medium !text-emerald-700 underline-offset-4 hover:!bg-transparent hover:!text-emerald-900 hover:underline disabled:pointer-events-none disabled:opacity-45 dark:!text-emerald-700 dark:hover:!bg-transparent dark:hover:!text-emerald-900"

export function TreasuryReconcileModal({
  open,
  onOpenChange,
  popId,
  motherAccountId,
  child,
  fundingAccounts,
  canSubmit,
  globalPendingBalance,
  onCompleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  motherAccountId: string
  child: TreasuryChildAccountRow
  fundingAccounts: TreasuryFundingOption[]
  canSubmit: boolean
  /** Saldo global a liquidar / pagar (no del período). */
  globalPendingBalance: number
  onCompleted: () => void | Promise<void>
}) {
  const isPos = child.childRole === "pos"
  const balanceLabel = isPos ? "Saldo a liquidar" : "Saldo a pagar"
  const adjustmentLabel = isPos
    ? TREASURY_RECONCILE_COMMISSIONS_LABEL
    : TREASURY_CARD_STATEMENT_CHARGES_LABEL
  const adjustmentHint = isPos
    ? TREASURY_RECONCILE_COMMISSIONS_ACCOUNT_HINT
    : TREASURY_CARD_STATEMENT_CHARGES_ACCOUNT_HINT

  const [banner, setBanner] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [principal, setPrincipal] = useState("")
  const [adjustment, setAdjustment] = useState("")
  const [eventDate, setEventDate] = useState(defaultTreasuryPeriodEnd())
  const [balanceAsOf, setBalanceAsOf] = useState(globalPendingBalance)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [fundingId, setFundingId] = useState("")

  const loadBalanceAsOf = useCallback(
    async (date: string) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return
      setBalanceLoading(true)
      setBalanceError(null)
      const res = await getTreasuryChildPendingBalanceAsOf(
        popId,
        child.id,
        child.childRole,
        date,
      )
      setBalanceLoading(false)
      if (!res.success) {
        setBalanceError(res.error)
        return
      }
      setBalanceAsOf(res.balance)
    },
    [popId, child.id, child.childRole],
  )

  useEffect(() => {
    if (!open) return
    setBanner(null)
    setPrincipal("")
    setAdjustment("")
    setNotes("")
    setEventDate(defaultTreasuryPeriodEnd())
    setBalanceAsOf(globalPendingBalance)
    setBalanceError(null)
    setFundingId(
      fundingAccounts.find((f) => f.id === motherAccountId)?.id ??
        fundingAccounts[0]?.id ??
        motherAccountId,
    )
  }, [open, child.id, fundingAccounts, motherAccountId, globalPendingBalance])

  useEffect(() => {
    if (!open || !eventDate) return
    void loadBalanceAsOf(eventDate)
  }, [open, eventDate, loadBalanceAsOf])

  const principalAmount = useMemo(
    () => parseTreasuryMoneyInput(principal),
    [principal],
  )
  const adjustmentAmount = useMemo(
    () => (adjustment.trim() ? parseTreasuryMoneyInput(adjustment) : 0),
    [adjustment],
  )

  const settlementTotal = useMemo(() => {
    if (!Number.isFinite(principalAmount) || !Number.isFinite(adjustmentAmount)) {
      return null
    }
    return roundMoney(principalAmount + adjustmentAmount)
  }, [principalAmount, adjustmentAmount])

  const validationError = useMemo(() => {
    if (!principal.trim()) return null
    if (!Number.isFinite(principalAmount) || principalAmount <= 0) {
      return isPos
        ? "Ingresá un monto recibido mayor a cero."
        : "Ingresá un monto de consumos a cancelar mayor a cero."
    }
    if (!Number.isFinite(adjustmentAmount) || adjustmentAmount < 0) {
      return isPos
        ? "Las comisiones no pueden ser negativas."
        : "Los cargos del resumen no pueden ser negativos."
    }
    if (isPos) {
      const total = roundMoney(principalAmount + adjustmentAmount)
      if (total > balanceAsOf + 0.001) {
        return `El total (${fmt.format(total)}) supera el ${balanceLabel.toLowerCase()} al ${formatTreasuryShortDate(eventDate)} (${fmt.format(balanceAsOf)}).`
      }
    } else if (principalAmount > balanceAsOf + 0.001) {
      return `Los consumos a cancelar superan la deuda pendiente al ${formatTreasuryShortDate(eventDate)} (${fmt.format(balanceAsOf)}).`
    }
    return null
  }, [
    principal,
    principalAmount,
    adjustmentAmount,
    isPos,
    balanceAsOf,
    balanceLabel,
    eventDate,
  ])

  const canAutofillCommissions =
    isPos &&
    balanceAsOf > 0 &&
    Number.isFinite(principalAmount) &&
    principalAmount >= 0 &&
    principalAmount <= balanceAsOf + 0.001

  const autofillCommissions = () => {
    if (!canAutofillCommissions) return
    const diff = roundMoney(Math.max(0, balanceAsOf - principalAmount))
    setAdjustment(formatTreasuryMoneyInputValue(diff))
  }

  const canSave =
    canSubmit &&
    !saving &&
    !balanceLoading &&
    !balanceError &&
    principal.trim().length > 0 &&
    Number.isFinite(principalAmount) &&
    principalAmount > 0 &&
    Number.isFinite(adjustmentAmount) &&
    adjustmentAmount >= 0 &&
    !validationError &&
    (isPos || Boolean(fundingId))

  const submit = async () => {
    if (!canSave) return
    setSaving(true)
    setBanner(null)

    const res = isPos
      ? await recordPosAcreditationForAccount(popId, {
          posTreasuryAccountId: child.id,
          motherTreasuryAccountId: motherAccountId,
          principalAmount,
          adjustmentAmount,
          creditedAt: eventDate,
          notes,
        })
      : await recordTreasurySettlementForAccount(popId, {
          cardTreasuryAccountId: child.id,
          fundingTreasuryAccountId: fundingId,
          principalAmount,
          adjustmentAmount,
          settledAt: eventDate,
          notes,
        })

    setSaving(false)
    if (!res.success) {
      setBanner(res.error)
      return
    }
    onOpenChange(false)
    await onCompleted()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden p-0 shadow-xl sm:max-w-lg",
          lightPanel,
        )}
      >
        <DialogHeader className={cn("space-y-1 border-b px-6 py-5", lightSummary)}>
          <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-900">
            {isPos ? "Liquidar POS" : "Pagar tarjeta"}
          </DialogTitle>
          <DialogDescription className={cn("text-sm", lightMuted)}>
            {child.name}
          </DialogDescription>
        </DialogHeader>

        <div className="border-b border-zinc-100 bg-white px-6 py-4 dark:border-zinc-100 dark:bg-white">
          <Field>
            <FieldLabel htmlFor="reconcile-date" className={lightLabel}>
              {isPos ? "Fecha de acreditación" : "Fecha de pago"}
            </FieldLabel>
            <DatePicker
              id="reconcile-date"
              value={eventDate}
              onChange={setEventDate}
              className={cn("w-full", lightSurface)}
            />
          </Field>
        </div>

        <div className={cn("border-b px-6 py-4", lightSummary)}>
          <p
            className={cn(
              "text-[11px] font-medium uppercase tracking-[0.12em]",
              lightMuted,
            )}
          >
            {balanceLabel} al {formatTreasuryShortDate(eventDate)}
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
            {balanceLoading ? "—" : fmt.format(balanceAsOf)}
          </p>
          {!balanceLoading &&
          Math.abs(balanceAsOf - globalPendingBalance) > 0.009 ? (
            <p className={cn("mt-1 text-xs", lightMuted)}>
              Saldo actual: {fmt.format(globalPendingBalance)}
            </p>
          ) : null}
          {balanceError ? (
            <p className="mt-2 text-xs text-red-700">{balanceError}</p>
          ) : null}
        </div>

        <div className="bg-white px-6 py-5 dark:bg-white">
          <FieldGroup className="gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(validationError && principal.trim())}>
                <FieldLabel
                  htmlFor="reconcile-principal"
                  className={lightLabel}
                >
                  {isPos ? "Monto recibido" : "Consumos a cancelar"}
                </FieldLabel>
                <InputGroup className={lightSurface}>
                  <InputGroupAddon>
                    <InputGroupText className={lightMuted}>$</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="reconcile-principal"
                    inputMode="decimal"
                    autoComplete="off"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    placeholder="0,00"
                    className="font-mono tabular-nums text-zinc-900"
                    aria-invalid={Boolean(validationError && principal.trim())}
                  />
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="reconcile-adjustment"
                  className={lightLabel}
                >
                  {adjustmentLabel}
                </FieldLabel>
                <InputGroup className={lightSurface}>
                  <InputGroupAddon>
                    <InputGroupText className={lightMuted}>$</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="reconcile-adjustment"
                    inputMode="decimal"
                    autoComplete="off"
                    value={adjustment}
                    onChange={(e) => setAdjustment(e.target.value)}
                    placeholder="0,00"
                    className="font-mono tabular-nums text-zinc-900"
                  />
                </InputGroup>
                {isPos ? (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={!canAutofillCommissions}
                    onClick={autofillCommissions}
                    title="Completar con la diferencia entre el saldo y lo recibido"
                    className={cn(lightLinkAction, "-ml-2 mt-1")}
                  >
                    <Calculator className="size-3.5" aria-hidden />
                    Calcular diferencia
                  </Button>
                ) : null}
                <FieldDescription className={cn("text-xs", lightMuted)}>
                  {adjustmentHint}
                </FieldDescription>
              </Field>
            </div>

            {settlementTotal != null && settlementTotal > 0 ? (
              <div
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm",
                  lightSummary,
                )}
              >
                <span className={lightMuted}>
                  {isPos ? "Total del POS a cerrar" : "Total a debitar del banco"}
                </span>
                <span className="font-mono font-semibold tabular-nums text-zinc-900">
                  {fmt.format(settlementTotal)}
                </span>
              </div>
            ) : null}

            {!isPos ? (
              <Field>
                <FieldLabel htmlFor="reconcile-funding" className={lightLabel}>
                  Pagado desde
                </FieldLabel>
                <Select value={fundingId} onValueChange={setFundingId}>
                  <SelectTrigger
                    id="reconcile-funding"
                    className={cn("w-full", lightSurface)}
                  >
                    <SelectValue placeholder="Elegí la cuenta de origen" />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-200 bg-white text-zinc-900 dark:border-zinc-200 dark:bg-white dark:text-zinc-900">
                    {fundingAccounts.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : null}

            <Field>
              <FieldLabel htmlFor="reconcile-notes" className={lightLabel}>
                Notas (opcional)
              </FieldLabel>
              <Textarea
                id="reconcile-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Referencia, lote de liquidación, observaciones…"
                rows={2}
                className={cn("resize-none", lightSurface)}
              />
            </Field>
          </FieldGroup>

          {validationError ? (
            <p
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {validationError}
            </p>
          ) : null}

          {banner ? (
            <p
              className={cn(
                "mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700",
                validationError && "mt-2",
              )}
              role="alert"
            >
              {banner}
            </p>
          ) : null}
        </div>

        <DialogFooter
          className={cn(
            "px-6 py-4 sm:justify-between",
            lightFooter,
          )}
        >
          <Button
            type="button"
            variant="outline"
            className={lightOutlineButton}
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            onClick={() => void submit()}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Registrando…
              </>
            ) : isPos ? (
              "Registrar liquidación"
            ) : (
              "Registrar pago"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
