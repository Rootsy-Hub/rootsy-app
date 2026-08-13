"use client"

import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import { SalePaymentDestinationDialog } from "@/components/sale-operation/SalePaymentDestinationDialog"
import {
  layoutsOperarFormDarkErrorBannerClass,
  layoutsOperarFormDarkMutedTextClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import type { OperationPaymentKind } from "@/lib/operationPaymentKinds"
import {
  buildPaymentCheckoutSelection,
  getPaymentCheckoutKinds,
  paymentCheckoutKindHasDestinationStep,
  paymentCheckoutKindLabel,
  paymentCheckoutKindSubtitle,
  resolvePaymentKindSelection,
  type PaymentMethodSelection,
} from "@/lib/paymentMethodCheckout"
import {
  parseTreasuryPaymentOptionKey,
  treasuryPaymentOptionKey,
  type TreasuryPaymentContext,
} from "@/lib/treasuryPaymentOptions"
import { cn } from "@/lib/utils"
import {
  ArrowLeftRight,
  Banknote,
  CircleAlert,
  CreditCard,
} from "lucide-react"
import { useCallback, useMemo, useState } from "react"

const SERVICE_PAYMENT_FLOW = "service_charge" as const

type Props = {
  paymentMethodKey: string
  onChange: (paymentMethodKey: string) => void
  treasuryContext: TreasuryPaymentContext | null
  disabled?: boolean
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
      return Banknote
  }
}

function selectionFromPaymentMethodKey(
  key: string,
  treasuryContext: TreasuryPaymentContext,
): PaymentMethodSelection | null {
  const parsed = parseTreasuryPaymentOptionKey(key)
  if (!parsed) return null
  return buildPaymentCheckoutSelection(
    SERVICE_PAYMENT_FLOW,
    parsed.kind,
    parsed.treasuryAccountId,
    treasuryContext,
  )
}

export function ServiceOperatePaymentFields({
  paymentMethodKey,
  onChange,
  treasuryContext,
  disabled = false,
}: Props) {
  const [pickError, setPickError] = useState<string | null>(null)
  const [destinationDialogOpen, setDestinationDialogOpen] = useState(false)
  const [pendingKind, setPendingKind] = useState<OperationPaymentKind | null>(
    null,
  )

  const selected = useMemo(
    () =>
      paymentMethodKey && treasuryContext
        ? selectionFromPaymentMethodKey(paymentMethodKey, treasuryContext)
        : null,
    [paymentMethodKey, treasuryContext],
  )

  const selectedKind = selected?.kind ?? null

  const applySelection = useCallback(
    (selection: PaymentMethodSelection) => {
      onChange(
        treasuryPaymentOptionKey({
          kind: selection.kind,
          treasuryAccountId: selection.treasuryAccountId,
        }),
      )
      setPickError(null)
    },
    [onChange],
  )

  const openDestinationForKind = useCallback((kind: OperationPaymentKind) => {
    setPendingKind(kind)
    setDestinationDialogOpen(true)
  }, [])

  const handleKindPick = useCallback(
    (kind: OperationPaymentKind) => {
      if (disabled || !treasuryContext) return

      if (
        selectedKind === kind &&
        paymentCheckoutKindHasDestinationStep(
          SERVICE_PAYMENT_FLOW,
          kind,
          treasuryContext,
        )
      ) {
        openDestinationForKind(kind)
        return
      }

      const result = resolvePaymentKindSelection(
        SERVICE_PAYMENT_FLOW,
        kind,
        treasuryContext,
      )

      if (result.action === "error") {
        setPickError(result.message)
        return
      }

      setPickError(null)

      if (result.action === "destination") {
        openDestinationForKind(result.kind)
        return
      }

      applySelection(result.selection)
    },
    [applySelection, disabled, openDestinationForKind, selectedKind, treasuryContext],
  )

  const paymentKinds = getPaymentCheckoutKinds(SERVICE_PAYMENT_FLOW)

  return (
    <>
      <p
        className={cn(
          "text-xs font-medium uppercase tracking-wide",
          layoutsOperarFormDarkMutedTextClass,
        )}
      >
        Medio de pago
      </p>

      <ul
        className="flex flex-col gap-2"
        role="listbox"
        aria-label="Medios de pago"
      >
        <li>
          <CheckoutOptionCard
            title="Sin definir"
            subtitle="Podés cobrarlo más adelante desde Servicios activos"
            selected={!paymentMethodKey}
            tone="dark"
            disabled={disabled}
            onClick={() => {
              onChange("")
              setPickError(null)
            }}
            icon={Banknote}
            trailing="none"
          />
        </li>

        {!treasuryContext ? (
          <li>
            <p className={cn("px-1 text-sm", layoutsOperarFormDarkMutedTextClass)}>
              Cargando medios de pago…
            </p>
          </li>
        ) : (
          paymentKinds.map((kind) => {
            const hasSubstep = paymentCheckoutKindHasDestinationStep(
              SERVICE_PAYMENT_FLOW,
              kind,
              treasuryContext,
            )
            const isSelected = selectedKind === kind
            const subtitle =
              isSelected && selected
                ? selected.label
                : paymentCheckoutKindSubtitle(
                    SERVICE_PAYMENT_FLOW,
                    kind,
                    treasuryContext,
                  )

            return (
              <li key={kind}>
                <CheckoutOptionCard
                  title={paymentCheckoutKindLabel(SERVICE_PAYMENT_FLOW, kind)}
                  subtitle={subtitle}
                  selected={isSelected}
                  tone="dark"
                  disabled={disabled}
                  onClick={() => handleKindPick(kind)}
                  icon={kindIcon(kind)}
                  trailing={
                    hasSubstep ? "chevron" : isSelected ? "check" : "none"
                  }
                />
              </li>
            )
          })
        )}
      </ul>

      {pickError ? (
        <div
          className={cn(layoutsOperarFormDarkErrorBannerClass, "mt-3")}
          role="alert"
        >
          <CircleAlert
            className="size-5 shrink-0 self-center text-[#fca5a5]"
            aria-hidden
          />
          <span className="min-w-0 flex-1 text-sm">{pickError}</span>
        </div>
      ) : null}

      {pendingKind ? (
        <SalePaymentDestinationDialog
          key={pendingKind}
          flow={SERVICE_PAYMENT_FLOW}
          open={destinationDialogOpen}
          onOpenChange={setDestinationDialogOpen}
          kind={pendingKind}
          treasuryContext={treasuryContext}
          selected={selected}
          onSelect={applySelection}
        />
      ) : null}
    </>
  )
}
