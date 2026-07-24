"use client"

import type { SaleCatalogPaymentOption } from "@/app/[siteId]/[popId]/sale/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CLIENT_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import type { OperationPaymentKind } from "@/lib/operationPaymentKinds"
import {
  buildCheckoutPaymentSelection,
  checkoutKindAvailabilityError,
  checkoutKindHasDestinationStep,
  checkoutKindLabel,
  getCheckoutDestinations,
  SALE_CHECKOUT_KINDS,
} from "@/lib/saleCheckoutPayment"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

type DialogStyles = {
  content: string
  header: string
  body: string
  footer: string
  optionClass: (selected: boolean) => string
  primaryBtn: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  treasuryContext: TreasuryPaymentContext | null
  cashTreasuryAccountId: string | null
  selected: SaleCatalogPaymentOption | null
  payOnClientAccount: boolean
  onSelectImmediate: (selection: SaleCatalogPaymentOption | null) => void
  onSelectClientAccount: () => void
  styles: DialogStyles
  clientAccountDescription?: string
}

export function SalePaymentMethodDialog({
  open,
  onOpenChange,
  treasuryContext,
  cashTreasuryAccountId,
  selected,
  payOnClientAccount,
  onSelectImmediate,
  onSelectClientAccount,
  styles,
  clientAccountDescription =
    "Entregás la mercadería ahora y registrás la deuda en Cuentas por cobrar.",
}: Props) {
  const [step, setStep] = useState<"kind" | "destination">("kind")
  const [pendingKind, setPendingKind] = useState<OperationPaymentKind | null>(
    null,
  )
  const [stepError, setStepError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setStep("kind")
      setPendingKind(null)
      setStepError(null)
    }
  }, [open])

  const finishSelection = useCallback(
    (option: SaleCatalogPaymentOption) => {
      onSelectImmediate(option)
      onOpenChange(false)
    },
    [onOpenChange, onSelectImmediate],
  )

  const handleKindPick = useCallback(
    (kind: OperationPaymentKind) => {
      if (!treasuryContext) return
      const availabilityError = checkoutKindAvailabilityError(
        kind,
        treasuryContext,
        cashTreasuryAccountId,
      )
      if (availabilityError) {
        setStepError(availabilityError)
        return
      }
      setStepError(null)

      if (kind === "cash" && cashTreasuryAccountId) {
        finishSelection(
          buildCheckoutPaymentSelection(
            "cash",
            cashTreasuryAccountId,
            treasuryContext,
          ),
        )
        return
      }

      const destinations = getCheckoutDestinations(kind, treasuryContext)
      if (destinations.length === 1) {
        finishSelection(
          buildCheckoutPaymentSelection(
            kind,
            destinations[0]!.id,
            treasuryContext,
            destinations[0]!.name,
          ),
        )
        return
      }

      if (checkoutKindHasDestinationStep(kind, treasuryContext)) {
        setPendingKind(kind)
        setStep("destination")
        return
      }

      finishSelection(
        buildCheckoutPaymentSelection(
          kind,
          destinations[0]!.id,
          treasuryContext,
          destinations[0]?.name,
        ),
      )
    },
    [cashTreasuryAccountId, finishSelection, treasuryContext],
  )

  const handleDestinationPick = useCallback(
    (destinationId: string, destinationName: string) => {
      if (!treasuryContext || !pendingKind) return
      finishSelection(
        buildCheckoutPaymentSelection(
          pendingKind,
          destinationId,
          treasuryContext,
          destinationName,
        ),
      )
    },
    [finishSelection, pendingKind, treasuryContext],
  )

  const destinationItems =
    treasuryContext && pendingKind
      ? getCheckoutDestinations(pendingKind, treasuryContext)
      : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.content}>
        <DialogHeader className={cn(styles.header, "shrink-0")}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            {step === "kind" ? "Formas de pago" : checkoutKindLabel(pendingKind!)}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {step === "kind"
              ? "Elegí cómo vas a cobrar: al contado o a cuenta corriente del cliente."
              : "Elegí la cuenta destino para este cobro."}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            styles.body,
            "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain",
          )}
        >
          {step === "destination" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground"
              onClick={() => {
                setStep("kind")
                setPendingKind(null)
                setStepError(null)
              }}
            >
              <ChevronLeft className="mr-1 size-3.5" aria-hidden />
              Volver
            </Button>
          ) : null}

          {stepError ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {stepError}
            </p>
          ) : null}

          {step === "kind" ? (
            <>
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Cuenta del cliente
                </p>
                <button
                  type="button"
                  className={styles.optionClass(payOnClientAccount)}
                  onClick={() => {
                    onSelectClientAccount()
                    onOpenChange(false)
                  }}
                >
                  {CLIENT_ACCOUNT_PAYMENT_LABEL}
                </button>
                <p className="mt-2 text-xs text-muted-foreground">
                  {clientAccountDescription}
                </p>
              </div>

              <Separator className="bg-border/60" />

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Cobro inmediato
                </p>
                <ul className="flex flex-col gap-1.5" role="listbox">
                  {SALE_CHECKOUT_KINDS.map((kind) => {
                    const isSelected =
                      !payOnClientAccount &&
                      selected?.kind === kind &&
                      (kind === "cash" ||
                        selected.treasuryAccountId != null)
                    return (
                      <li key={kind}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          className={styles.optionClass(isSelected)}
                          onClick={() => handleKindPick(kind)}
                        >
                          <span className="text-sm font-semibold">
                            {checkoutKindLabel(kind)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </>
          ) : (
            <ul className="flex flex-col gap-1.5" role="listbox">
              {destinationItems.map((dest) => {
                const isSelected =
                  !payOnClientAccount &&
                  selected != null &&
                  pendingKind === selected.kind &&
                  selected.treasuryAccountId === dest.id
                return (
                  <li key={dest.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={styles.optionClass(isSelected)}
                      onClick={() =>
                        handleDestinationPick(dest.id, dest.name)
                      }
                    >
                      <span className="text-sm font-semibold">{dest.name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {step === "kind" ? (
          <DialogFooter className={cn(styles.footer, "shrink-0")} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
