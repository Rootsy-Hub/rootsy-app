"use client"

import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import type { CheckoutOptionCardTone } from "@/components/checkout/CheckoutOptionCard"
import { RootsDialogErrorBanner } from "@/components/rootsy-dialog"
import { SalePaymentDestinationDialog } from "@/components/sale-operation/SalePaymentDestinationDialog"
import { rootsFormColumnClass } from "@/components/rootsy-form"
import {
  layoutsOperarFormDarkErrorBannerClass,
  layoutsOperarFormDarkMutedTextClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import type { OperationPaymentKind } from "@/lib/operationPaymentKinds"
import {
  buildPaymentCheckoutSelection,
  getPaymentCheckoutDestinations,
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
  Landmark,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

const SERVICE_PAYMENT_FLOW = "service_charge" as const

type PaymentPickerStep = "menu" | "destination"

export type ServiceOperatePaymentInlineNavigation = {
  title: string
  onBack: () => void
}

type Props = {
  paymentMethodKey: string
  onChange: (paymentMethodKey: string) => void
  treasuryContext: TreasuryPaymentContext | null
  disabled?: boolean
  tone?: CheckoutOptionCardTone
  showTitle?: boolean
  onSelectionComplete?: () => void
  /** Navegación de destino dentro del contenedor (modal) en lugar de un diálogo anidado. */
  inlineNavigation?: boolean
  /** true mientras el contenedor padre está abierto — resetea el paso al cerrar. */
  navigationSessionActive?: boolean
  onInlineNavigationChange?: (
    navigation: ServiceOperatePaymentInlineNavigation | null,
  ) => void
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
  tone = "dark",
  showTitle = true,
  onSelectionComplete,
  inlineNavigation = false,
  navigationSessionActive = true,
  onInlineNavigationChange,
}: Props) {
  const [pickError, setPickError] = useState<string | null>(null)
  const [step, setStep] = useState<PaymentPickerStep>("menu")
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

  const resetNavigation = useCallback(() => {
    setStep("menu")
    setPendingKind(null)
    setDestinationDialogOpen(false)
    setPickError(null)
  }, [])

  useEffect(() => {
    if (!navigationSessionActive) {
      resetNavigation()
    }
  }, [navigationSessionActive, resetNavigation])

  const applySelection = useCallback(
    (selection: PaymentMethodSelection) => {
      onChange(
        treasuryPaymentOptionKey({
          kind: selection.kind,
          treasuryAccountId: selection.treasuryAccountId,
        }),
      )
      setPickError(null)
      onSelectionComplete?.()
    },
    [onChange, onSelectionComplete],
  )

  const openDestinationForKind = useCallback(
    (kind: OperationPaymentKind) => {
      if (inlineNavigation) {
        setPendingKind(kind)
        setStep("destination")
        return
      }
      setPendingKind(kind)
      setDestinationDialogOpen(true)
    },
    [inlineNavigation],
  )

  const handleInlineBack = useCallback(() => {
    setStep("menu")
    setPendingKind(null)
    setPickError(null)
  }, [])

  useEffect(() => {
    if (!inlineNavigation || !onInlineNavigationChange) return

    if (step === "destination" && pendingKind) {
      onInlineNavigationChange({
        title: paymentCheckoutKindLabel(SERVICE_PAYMENT_FLOW, pendingKind),
        onBack: handleInlineBack,
      })
      return
    }

    onInlineNavigationChange(null)
  }, [
    handleInlineBack,
    inlineNavigation,
    onInlineNavigationChange,
    pendingKind,
    step,
  ])

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

  const handleDestinationPick = useCallback(
    (destinationId: string, destinationName: string) => {
      if (!treasuryContext || !pendingKind) return
      applySelection(
        buildPaymentCheckoutSelection(
          SERVICE_PAYMENT_FLOW,
          pendingKind,
          destinationId,
          treasuryContext,
          destinationName,
        ),
      )
    },
    [applySelection, pendingKind, treasuryContext],
  )

  const paymentKinds = getPaymentCheckoutKinds(SERVICE_PAYMENT_FLOW)

  const destinationItems = useMemo(() => {
    if (!treasuryContext || !pendingKind || step !== "destination") return []
    return getPaymentCheckoutDestinations(
      SERVICE_PAYMENT_FLOW,
      pendingKind,
      treasuryContext,
    )
  }, [pendingKind, step, treasuryContext])

  const loadingTextClass =
    tone === "dark"
      ? layoutsOperarFormDarkMutedTextClass
      : "text-[var(--rootsy-bruma-500)]"

  return (
    <div className={rootsFormColumnClass}>
      {showTitle && step === "menu" ? (
        <p
          className={cn(
            "text-xs font-medium uppercase tracking-wide",
            layoutsOperarFormDarkMutedTextClass,
          )}
        >
          Medio de pago
        </p>
      ) : null}

      {step === "menu" ? (
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
              tone={tone}
              disabled={disabled}
              onClick={() => {
                onChange("")
                setPickError(null)
                onSelectionComplete?.()
              }}
              icon={Banknote}
              trailing="none"
            />
          </li>

          {!treasuryContext ? (
            <li>
              <p className={cn("px-1 text-sm", loadingTextClass)}>
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
                    tone={tone}
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
      ) : null}

      {step === "destination" && pendingKind ? (
        <ul
          className="flex flex-col gap-2"
          role="listbox"
          aria-label={paymentCheckoutKindLabel(SERVICE_PAYMENT_FLOW, pendingKind)}
        >
          {destinationItems.map((dest) => {
            const Icon = destinationIcon(pendingKind)
            const isSelected =
              selected != null &&
              pendingKind === selected.kind &&
              selected.treasuryAccountId === dest.id

            return (
              <li key={dest.id}>
                <CheckoutOptionCard
                  title={dest.name}
                  selected={isSelected}
                  tone={tone}
                  disabled={disabled}
                  onClick={() => handleDestinationPick(dest.id, dest.name)}
                  icon={Icon}
                  trailing={isSelected ? "check" : "none"}
                />
              </li>
            )
          })}
        </ul>
      ) : null}

      {pickError ? (
        tone === "dark" ? (
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
        ) : (
          <RootsDialogErrorBanner className="mt-3">{pickError}</RootsDialogErrorBanner>
        )
      ) : null}

      {!inlineNavigation && pendingKind ? (
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
    </div>
  )
}
