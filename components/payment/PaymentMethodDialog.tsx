"use client"

import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogErrorBanner,
  RootsDialogHeader,
  rootsDialogHeaderClass,
  rootsDialogHeaderCompactClass,
  rootsDialogTitleClass,
} from "@/components/rootsy-dialog"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { OperationPaymentKind } from "@/lib/operationPaymentKinds"
import {
  buildPaymentCheckoutSelection,
  getPaymentCheckoutDestinations,
  getPaymentCheckoutKinds,
  paymentCheckoutKindLabel,
  resolvePaymentKindSelection,
  shouldStayOpenAfterSelection,
  paymentCheckoutKindHasDestinationStep,
  type PaymentCheckoutStep,
  type PaymentFlow,
  type PaymentMethodSelection,
} from "@/lib/paymentMethodCheckout"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import { cn } from "@/lib/utils"
import {
  ArrowLeftRight,
  Banknote,
  BookOpen,
  ChevronLeft,
  CreditCard,
  Landmark,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

type Props = {
  flow: PaymentFlow
  open: boolean
  onOpenChange: (open: boolean) => void
  treasuryContext: TreasuryPaymentContext | null
  selected: PaymentMethodSelection | null
  payOnAccount: boolean
  onSelectImmediate: (selection: PaymentMethodSelection | null) => void
  onSelectAccount: () => void
  accountOptionLabel: string
  accountDescription: string
  immediateSectionTitle?: string
  cashTreasuryAccountId?: string | null
  cashRegisterName?: string | null
  cardInstallments?: string
  onCardInstallmentsChange?: (value: string) => void
  /** Oculta «Cuenta corriente» / cuenta por pagar del menú principal. */
  hideAccountOption?: boolean
  /** Abre directamente el paso de destino (p. ej. elegir terminal POS). */
  initialDestinationKind?: OperationPaymentKind | null
}

function kindIcon(kind: OperationPaymentKind) {
  switch (kind) {
    case "cash":
      return Banknote
    case "card_debit":
    case "card_credit":
      return CreditCard
    case "transfer":
      return ArrowLeftRight
    default:
      return Landmark
  }
}

function destinationIcon(kind: OperationPaymentKind) {
  switch (kind) {
    case "cash":
      return Banknote
    case "card_debit":
    case "card_credit":
      return CreditCard
    case "transfer":
      return Landmark
    default:
      return Landmark
  }
}

function AccountOptionCard({
  title,
  description,
  selected,
  onClick,
}: {
  title: string
  description: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <div className="space-y-2">
      <CheckoutOptionCard
        title={title}
        selected={selected}
        onClick={onClick}
        icon={BookOpen}
        trailing={selected ? "check" : "none"}
      />
      <p className="px-1 text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">
        {description}
      </p>
    </div>
  )
}

function paymentStepTitle(
  step: PaymentCheckoutStep,
  flow: PaymentFlow,
  pendingKind: OperationPaymentKind | null,
): string {
  if (step === "menu") return "Formas de pago"
  if (step === "installments") return "Cuotas de la tarjeta"
  return paymentCheckoutKindLabel(flow, pendingKind!)
}

export function PaymentMethodDialog({
  flow,
  open,
  onOpenChange,
  treasuryContext,
  selected,
  payOnAccount,
  onSelectImmediate,
  onSelectAccount,
  accountOptionLabel,
  accountDescription,
  immediateSectionTitle,
  cashTreasuryAccountId = null,
  cardInstallments = "1",
  onCardInstallmentsChange,
  hideAccountOption = false,
  initialDestinationKind = null,
}: Props) {
  const [step, setStep] = useState<PaymentCheckoutStep>(() =>
    initialDestinationKind ? "destination" : "menu",
  )
  const [pendingKind, setPendingKind] = useState<OperationPaymentKind | null>(
    () => initialDestinationKind ?? null,
  )
  const [stepError, setStepError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setStep(initialDestinationKind ? "destination" : "menu")
      setPendingKind(initialDestinationKind ?? null)
      setStepError(null)
      return
    }

    if (initialDestinationKind) {
      setStep("destination")
      setPendingKind(initialDestinationKind)
      setStepError(null)
      return
    }

    if (
      flow === "purchase" &&
      selected?.kind === "card_credit" &&
      !payOnAccount
    ) {
      setStep("installments")
      setPendingKind("card_credit")
    }
  }, [flow, initialDestinationKind, open, payOnAccount, selected?.kind])

  const finishSelection = useCallback(
    (option: PaymentMethodSelection) => {
      onSelectImmediate(option)
      if (shouldStayOpenAfterSelection(flow, option)) {
        setPendingKind(option.kind)
        setStep("installments")
        setStepError(null)
        return
      }
      onOpenChange(false)
    },
    [flow, onOpenChange, onSelectImmediate],
  )

  const handleKindPick = useCallback(
    (kind: OperationPaymentKind) => {
      if (!treasuryContext) return
      const result = resolvePaymentKindSelection(
        flow,
        kind,
        treasuryContext,
        cashTreasuryAccountId,
      )
      if (result.action === "error") {
        setStepError(result.message)
        return
      }
      setStepError(null)
      if (result.action === "destination") {
        setPendingKind(result.kind)
        setStep("destination")
        return
      }
      finishSelection(result.selection)
    },
    [cashTreasuryAccountId, finishSelection, flow, treasuryContext],
  )

  const handleDestinationPick = useCallback(
    (destinationId: string, destinationName: string) => {
      if (!treasuryContext || !pendingKind) return
      finishSelection(
        buildPaymentCheckoutSelection(
          flow,
          pendingKind,
          destinationId,
          treasuryContext,
          destinationName,
        ),
      )
    },
    [finishSelection, flow, pendingKind, treasuryContext],
  )

  const handleBack = useCallback(() => {
    if (initialDestinationKind) {
      onOpenChange(false)
      setStepError(null)
      return
    }

    if (step === "installments") {
      if (
        treasuryContext &&
        pendingKind &&
        paymentCheckoutKindHasDestinationStep(flow, pendingKind, treasuryContext)
      ) {
        setStep("destination")
      } else {
        setStep("menu")
        setPendingKind(null)
      }
      setStepError(null)
      return
    }
    setStep("menu")
    setPendingKind(null)
    setStepError(null)
  }, [flow, initialDestinationKind, onOpenChange, pendingKind, step, treasuryContext])

  const destinationItems = useMemo(() => {
    if (!treasuryContext || !pendingKind || step !== "destination") return []
    return getPaymentCheckoutDestinations(flow, pendingKind, treasuryContext)
  }, [flow, pendingKind, step, treasuryContext])

  const paymentKinds = getPaymentCheckoutKinds(flow)
  const sectionTitle =
    immediateSectionTitle ?? (flow === "sale" ? "Cobro inmediato" : "Pago inmediato")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent className="flex flex-col">
        {step === "menu" ? (
          <RootsDialogHeader title="Formas de pago" />
        ) : (
          <DialogHeader
            className={cn(
              rootsDialogHeaderClass,
              rootsDialogHeaderCompactClass,
              "shrink-0",
            )}
          >
            <div className="flex items-center gap-2">
              <RootsIconButton
                type="button"
                label="Volver"
                theme="workspace"
                emphasis="ghost"
                size="default"
                className="-ml-2 shrink-0"
                onClick={handleBack}
              >
                <ChevronLeft aria-hidden />
              </RootsIconButton>
              <DialogTitle className={cn(rootsDialogTitleClass, "min-w-0 flex-1")}>
                {paymentStepTitle(step, flow, pendingKind)}
              </DialogTitle>
            </div>
          </DialogHeader>
        )}

        <RootsDialogBody className="space-y-4">
          {stepError ? (
            <RootsDialogErrorBanner>{stepError}</RootsDialogErrorBanner>
          ) : null}

          {step === "menu" ? (
            <>
              <div>
                <p className="mb-2.5 px-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
                  {sectionTitle}
                </p>
                {!treasuryContext ? (
                  <p className="rounded-xl border border-dashed border-[var(--rootsy-bruma-200)] bg-white px-4 py-5 text-center text-sm text-[var(--rootsy-bruma-500)]">
                    Cargando medios de pago…
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2" role="listbox" aria-label={sectionTitle}>
                    {paymentKinds.map((kind) => {
                      const hasSubstep =
                        paymentCheckoutKindHasDestinationStep(
                          flow,
                          kind,
                          treasuryContext,
                        )
                      const isSelected =
                        !payOnAccount &&
                        selected?.kind === kind &&
                        (kind === "cash" ||
                          kind === "transfer" ||
                          selected.treasuryAccountId != null)

                      return (
                        <li key={kind}>
                          <CheckoutOptionCard
                            title={paymentCheckoutKindLabel(flow, kind)}
                            selected={isSelected}
                            onClick={() => handleKindPick(kind)}
                            icon={kindIcon(kind)}
                            trailing={
                              hasSubstep ? "chevron" : isSelected ? "check" : "none"
                            }
                          />
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <Separator className="bg-[var(--rootsy-bruma-200)]" />

              {!hideAccountOption ? (
                <AccountOptionCard
                  title={accountOptionLabel}
                  description={accountDescription}
                  selected={payOnAccount}
                  onClick={() => {
                    onSelectAccount()
                    onOpenChange(false)
                  }}
                />
              ) : null}
            </>
          ) : null}

          {step === "destination" ? (
            <ul className="flex flex-col gap-2" role="listbox">
              {destinationItems.map((dest) => {
                const Icon = destinationIcon(pendingKind!)
                const isSelected =
                  !payOnAccount &&
                  selected != null &&
                  pendingKind === selected.kind &&
                  selected.treasuryAccountId === dest.id
                return (
                  <li key={dest.id}>
                    <CheckoutOptionCard
                      title={dest.name}
                      selected={isSelected}
                      onClick={() => handleDestinationPick(dest.id, dest.name)}
                      icon={Icon}
                      trailing={isSelected ? "check" : "none"}
                    />
                  </li>
                )
              })}
            </ul>
          ) : null}

          {step === "installments" && onCardInstallmentsChange ? (
            <div className="space-y-2">
              <Label htmlFor="payment-card-installments">Cantidad de cuotas</Label>
              <Input
                id="payment-card-installments"
                inputMode="numeric"
                value={cardInstallments}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "")
                  if (!raw) {
                    onCardInstallmentsChange("")
                    return
                  }
                  onCardInstallmentsChange(
                    String(Math.min(24, Math.max(1, Number(raw)))),
                  )
                }}
                placeholder="1"
                className="h-11 rounded-xl"
                autoFocus
              />
            </div>
          ) : null}
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
