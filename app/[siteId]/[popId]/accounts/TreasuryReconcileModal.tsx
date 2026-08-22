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
  TREASURY_CARD_OTHER_CHARGES_LABEL,
  TREASURY_CARD_STATEMENT_CHARGES_ACCOUNT_HINT,
  TREASURY_CARD_STATEMENT_CHARGES_LABEL,
  TREASURY_RECONCILE_COMMISSIONS_ACCOUNT_HINT,
  TREASURY_RECONCILE_COMMISSIONS_LABEL,
  formatTreasuryMovementAmount,
  defaultTreasuryPeriodEnd,
  formatTreasuryMoneyInputValue,
  formatTreasuryShortDate,
  parseTreasuryMoneyInput,
  treasuryMoneyFmt as fmt,
} from "@/app/[siteId]/[popId]/accounts/treasuryAccountUiUtils"
import { RootsLinkButton } from "@/components/rootsy-button"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormDateField,
  RootsFormMoneyField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextareaField,
  rootsFormBrumaTextSecondaryClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Calculator } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

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
      <RootsDialogContent size="wide">
        <RootsDialogHeader
          open={open}
          title={isPos ? "Liquidar POS" : "Pagar tarjeta"}
          description={child.name}
        />
        <RootsDialogBody className="space-y-4">
          <RootsFormDateField
            label={isPos ? "Fecha de acreditación" : "Fecha de pago"}
            id="reconcile-date"
            value={eventDate}
            onChange={setEventDate}
          />

          <div className="rounded-xl border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-3 py-3">
            <p
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.12em]",
                rootsFormBrumaTextSecondaryClass,
              )}
            >
              {balanceLabel} al {formatTreasuryShortDate(eventDate)}
            </p>
            <p className="mt-1 font-numeric text-3xl font-bold tabular-nums tracking-tight text-[var(--rootsy-bruma-900)]">
              {balanceLoading ? "—" : fmt.format(balanceAsOf)}
            </p>
            {!balanceLoading &&
            Math.abs(balanceAsOf - globalPendingBalance) > 0.009 ? (
              <p className={cn("mt-1 text-xs", rootsFormBrumaTextSecondaryClass)}>
                Saldo actual: {fmt.format(globalPendingBalance)}
              </p>
            ) : null}
            {balanceError ? (
              <p className="mt-2 text-xs text-[#dc2626]">{balanceError}</p>
            ) : null}
          </div>

          <div className={rootsFormTwoColRowClass}>
            <RootsFormMoneyField
              label={isPos ? "Monto recibido" : "Consumos a cancelar"}
              id="reconcile-principal"
              value={principal}
              onChange={setPrincipal}
              invalid={Boolean(validationError && principal.trim())}
              formatValue={formatTreasuryMoneyInputValue}
            />
            <RootsFormMoneyField
              label={adjustmentLabel}
              id="reconcile-adjustment"
              value={adjustment}
              onChange={setAdjustment}
              formatValue={formatTreasuryMoneyInputValue}
              hint={adjustmentHint}
            />
          </div>

          {isPos ? (
            <RootsLinkButton
              type="button"
              disabled={!canAutofillCommissions}
              onClick={autofillCommissions}
              title="Completar con la diferencia entre el saldo y lo recibido"
              className="h-auto gap-1.5 px-0 py-0"
            >
              <Calculator className="size-3.5" aria-hidden />
              Calcular diferencia
            </RootsLinkButton>
          ) : null}

          {principal.trim() &&
          Number.isFinite(principalAmount) &&
          principalAmount > 0 ? (
            <div className="space-y-2 rounded-xl border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-3 py-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className={cn("min-w-0 leading-snug", rootsFormBrumaTextSecondaryClass)}>
                  {isPos ? "Liquidación" : "Pago de consumos"}
                </span>
                <span className="shrink-0 font-numeric tabular-nums text-[var(--rootsy-bruma-900)]">
                  {isPos
                    ? fmt.format(roundMoney(principalAmount + adjustmentAmount))
                    : formatTreasuryMovementAmount("out", principalAmount)}
                </span>
              </div>
              {Number.isFinite(adjustmentAmount) && adjustmentAmount > 0 ? (
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("min-w-0 leading-snug", rootsFormBrumaTextSecondaryClass)}>
                    {isPos
                      ? TREASURY_RECONCILE_COMMISSIONS_LABEL
                      : TREASURY_CARD_OTHER_CHARGES_LABEL}
                  </span>
                  <span className="shrink-0 font-numeric tabular-nums text-[var(--rootsy-bruma-900)]">
                    {formatTreasuryMovementAmount("out", adjustmentAmount)}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          {!isPos ? (
            <RootsFormSelectField
              label="Pagado desde"
              id="reconcile-funding"
              value={fundingId}
              onValueChange={setFundingId}
              placeholder="Elegí la cuenta de origen"
            >
              {fundingAccounts.map((f) => (
                <RootsFormSelectItem key={f.id} value={f.id}>
                  {f.name}
                </RootsFormSelectItem>
              ))}
            </RootsFormSelectField>
          ) : null}

          <RootsFormTextareaField
            label="Notas (opcional)"
            id="reconcile-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Referencia, lote de liquidación, observaciones…"
            rows={2}
          />

          {validationError ? (
            <RootsDialogErrorBanner>{validationError}</RootsDialogErrorBanner>
          ) : null}
          {banner ? (
            <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner>
          ) : null}
        </RootsDialogBody>
        <RootsDialogDualActionFooter
          onCancel={() => onOpenChange(false)}
          onConfirm={() => void submit()}
          confirmLabel={isPos ? "Registrar liquidación" : "Registrar pago"}
          confirmLoadingLabel="Registrando…"
          confirmDisabled={!canSave}
          confirmLoading={saving}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
