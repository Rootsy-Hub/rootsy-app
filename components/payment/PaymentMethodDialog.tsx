"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Landmark,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react"
import {
  saleOpDialogBody,
  saleOpDialogContentMd,
  saleOpDialogHeader,
} from "@/components/sale-operation/saleOperationStyles"

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

function PaymentOptionCard({
  title,
  selected,
  onClick,
  icon: Icon,
  trailing = "chevron",
}: {
  title: string
  selected: boolean
  onClick: () => void
  icon: ComponentType<{ className?: string }>
  trailing?: "chevron" | "check" | "none"
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "border-primary/45 bg-primary/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "border-border/70 bg-muted/15 hover:border-border hover:bg-muted/30 active:scale-[0.995]",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
          selected
            ? "bg-primary/15 text-primary"
            : "bg-muted/50 text-muted-foreground group-hover:bg-muted/70 group-hover:text-foreground",
        )}
      >
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-snug text-foreground">
          {title}
        </span>
      </span>
      {trailing === "check" && selected ? (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
        </span>
      ) : null}
      {trailing === "chevron" ? (
        <ChevronRight
          className={cn(
            "size-4 shrink-0 transition-transform",
            selected ? "text-primary" : "text-muted-foreground/70",
          )}
          aria-hidden
        />
      ) : null}
    </button>
  )
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
      <PaymentOptionCard
        title={title}
        selected={selected}
        onClick={onClick}
        icon={BookOpen}
        trailing={selected ? "check" : "none"}
      />
      <p className="px-1 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function StepHeader({
  step,
  pendingKind,
  flow,
  onBack,
}: {
  step: PaymentCheckoutStep
  pendingKind: OperationPaymentKind | null
  flow: PaymentFlow
  onBack: () => void
}) {
  if (step === "menu") {
    return (
      <DialogTitle className="text-base font-semibold tracking-tight">
        Formas de pago
      </DialogTitle>
    )
  }

  const title =
    step === "installments"
      ? "Cuotas de la tarjeta"
      : paymentCheckoutKindLabel(flow, pendingKind!)

  return (
    <div className="flex items-start gap-2">
      <Button
        type="button"
        variant="ghost-neutral"
        size="icon"
        className="-ml-2 size-8 shrink-0 rounded-lg"
        onClick={onBack}
        aria-label="Volver"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <DialogTitle className="min-w-0 flex-1 pt-0.5 text-base font-semibold tracking-tight">
        {title}
      </DialogTitle>
    </div>
  )
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
  cashRegisterName = null,
  cardInstallments = "1",
  onCardInstallmentsChange,
}: Props) {
  const [step, setStep] = useState<PaymentCheckoutStep>("menu")
  const [pendingKind, setPendingKind] = useState<OperationPaymentKind | null>(
    null,
  )
  const [stepError, setStepError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setStep("menu")
      setPendingKind(null)
      setStepError(null)
    }
  }, [open])

  useEffect(() => {
    if (
      open &&
      flow === "purchase" &&
      selected?.kind === "card_credit" &&
      !payOnAccount
    ) {
      setStep("installments")
      setPendingKind("card_credit")
    }
  }, [flow, open, payOnAccount, selected?.kind])

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
  }, [flow, pendingKind, step, treasuryContext])

  const destinationItems = useMemo(() => {
    if (!treasuryContext || !pendingKind || step !== "destination") return []
    return getPaymentCheckoutDestinations(flow, pendingKind, treasuryContext)
  }, [flow, pendingKind, step, treasuryContext])

  const paymentKinds = getPaymentCheckoutKinds(flow)
  const sectionTitle =
    immediateSectionTitle ?? (flow === "sale" ? "Cobro inmediato" : "Pago inmediato")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={saleOpDialogContentMd}>
        <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
          <StepHeader
            step={step}
            pendingKind={pendingKind}
            flow={flow}
            onBack={handleBack}
          />
        </DialogHeader>

        <div
          className={cn(
            saleOpDialogBody,
            "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain",
          )}
        >
          {stepError ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/25 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
            >
              {stepError}
            </p>
          ) : null}

          {step === "menu" ? (
            <>
              <div>
                <p className="mb-2.5 px-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {sectionTitle}
                </p>
                {!treasuryContext ? (
                  <p className="rounded-xl border border-dashed border-border/60 bg-muted/15 px-4 py-5 text-center text-sm text-muted-foreground">
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
                          <PaymentOptionCard
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

              <Separator className="bg-border/60" />

              <AccountOptionCard
                title={accountOptionLabel}
                description={accountDescription}
                selected={payOnAccount}
                onClick={() => {
                  onSelectAccount()
                  onOpenChange(false)
                }}
              />
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
                    <PaymentOptionCard
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
