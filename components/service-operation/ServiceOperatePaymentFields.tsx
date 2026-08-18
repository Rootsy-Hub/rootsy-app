"use client"

import { RootsPrimaryButton } from "@/components/rootsy-button"
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
import { CheckUpsertFormFields } from "@/app/[siteId]/[popId]/checks/CheckUpsertFormFields"
import {
  defaultCheckCreateFormState,
  type CheckCreateFormState,
} from "@/app/[siteId]/[popId]/checks/checkFormState"
import {
  checkoutCheckSelectionLabel,
  parseCheckoutCheckDetails,
  type CheckoutCheckDetails,
} from "@/lib/checkoutCheck"
import {
  buildPaymentCheckoutSelection,
  getPaymentCheckoutDestinations,
  getPaymentCheckoutKinds,
  paymentCheckoutKindHasDestinationStep,
  paymentCheckoutKindIcon,
  paymentCheckoutKindLabel,
  paymentCheckoutKindNeedsDetailsStep,
  paymentCheckoutKindSubtitle,
  resolvePaymentKindSelection,
  type PaymentMethodSelection,
} from "@/lib/paymentMethodCheckout"
import {
  parseTreasuryPaymentOptionKey,
  treasuryPaymentOptionKey,
  type TreasuryPaymentContext,
} from "@/lib/treasuryPaymentOptions"
import {
  SERVICE_CHARGE_PAYMENT_PENDING,
  SERVICE_CHARGE_PAYMENT_PENDING_LABEL,
} from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import { cn } from "@/lib/utils"
import {
  Banknote,
  CircleAlert,
  Clock3,
  CreditCard,
  Landmark,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

const SERVICE_PAYMENT_FLOW = "service_charge" as const

type PaymentPickerStep = "menu" | "destination" | "check"

export type ServiceOperatePaymentInlineNavigation = {
  title: string
  onBack: () => void
}

type Props = {
  paymentMethodKey: string
  onChange: (
    paymentMethodKey: string,
    checkDetails?: CheckoutCheckDetails | null,
  ) => void
  treasuryContext: TreasuryPaymentContext | null
  popId?: string
  defaultPartyName?: string
  defaultPartyId?: string
  checkDetails?: CheckoutCheckDetails | null
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
  return paymentCheckoutKindIcon(kind)
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
  popId = "",
  defaultPartyName = "",
  defaultPartyId = "",
  checkDetails = null,
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
  const [pendingCheckSelection, setPendingCheckSelection] =
    useState<PaymentMethodSelection | null>(null)
  const [checkForm, setCheckForm] = useState<CheckCreateFormState>(() => ({
    ...defaultCheckCreateFormState("received"),
    partyName: defaultPartyName,
    partyId: defaultPartyId,
  }))

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
    setPendingCheckSelection(null)
    setDestinationDialogOpen(false)
    setPickError(null)
  }, [])

  useEffect(() => {
    if (!navigationSessionActive) {
      resetNavigation()
    }
  }, [navigationSessionActive, resetNavigation])

  const applySelection = useCallback(
    (
      selection: PaymentMethodSelection,
      nextCheckDetails: CheckoutCheckDetails | null = null,
    ) => {
      onChange(
        treasuryPaymentOptionKey({
          kind: selection.kind,
          treasuryAccountId: selection.treasuryAccountId,
        }),
        nextCheckDetails,
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
    setPendingCheckSelection(null)
    setPickError(null)
  }, [])

  useEffect(() => {
    if (!inlineNavigation || !onInlineNavigationChange) return

    if ((step === "destination" || step === "check") && pendingKind) {
      onInlineNavigationChange({
        title:
          step === "check"
            ? "Datos del cheque"
            : paymentCheckoutKindLabel(SERVICE_PAYMENT_FLOW, pendingKind),
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

      if (selectedKind === kind && kind === "check") {
        const result = resolvePaymentKindSelection(
          SERVICE_PAYMENT_FLOW,
          kind,
          treasuryContext,
        )
        if (result.action === "check") {
          setPendingKind("check")
          setPendingCheckSelection(result.selection)
          setCheckForm({
            ...defaultCheckCreateFormState("received"),
            ...(checkDetails ?? {}),
            amount: "",
            direction: "received",
            partyName: checkDetails?.partyName || defaultPartyName,
            partyId: checkDetails?.partyId || defaultPartyId,
          })
          setStep("check")
        }
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

      if (result.action === "check") {
        setPendingKind("check")
        setPendingCheckSelection(result.selection)
        setCheckForm({
          ...defaultCheckCreateFormState("received"),
          ...(checkDetails ?? {}),
          amount: "",
          direction: "received",
          partyName: checkDetails?.partyName || defaultPartyName,
          partyId: checkDetails?.partyId || defaultPartyId,
        })
        setStep("check")
        return
      }

      applySelection(result.selection, null)
    },
    [
      applySelection,
      checkDetails,
      defaultPartyId,
      defaultPartyName,
      disabled,
      openDestinationForKind,
      selectedKind,
      treasuryContext,
    ],
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
              title={SERVICE_CHARGE_PAYMENT_PENDING_LABEL}
              subtitle="Podés cobrarlo más adelante"
              selected={paymentMethodKey === SERVICE_CHARGE_PAYMENT_PENDING}
              tone={tone}
              disabled={disabled}
              onClick={() => {
                onChange(SERVICE_CHARGE_PAYMENT_PENDING)
                setPickError(null)
                onSelectionComplete?.()
              }}
              icon={Clock3}
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
              const hasSubstep =
                paymentCheckoutKindNeedsDetailsStep(kind) ||
                paymentCheckoutKindHasDestinationStep(
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

      {step === "check" && pendingCheckSelection ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            const parsed = parseCheckoutCheckDetails({
              checkNumber: checkForm.checkNumber,
              bankName: checkForm.bankName,
              issueDate: checkForm.issueDate,
              dueDate: checkForm.dueDate,
              partyName: checkForm.partyName,
              partyId: checkForm.partyId,
              notes: checkForm.notes,
            })
            if (!parsed.ok) {
              setPickError(parsed.error)
              return
            }
            applySelection(
              {
                ...pendingCheckSelection,
                label: checkoutCheckSelectionLabel(parsed.details),
                checkDetails: parsed.details,
              },
              parsed.details,
            )
            setStep("menu")
            setPendingKind(null)
            setPendingCheckSelection(null)
          }}
        >
          {popId ? (
            <CheckUpsertFormFields
              popId={popId}
              idPrefix="service-operate-check"
              form={checkForm}
              setForm={setCheckForm}
              hideAmount
            />
          ) : (
            <RootsDialogErrorBanner>
              No se pudo cargar el formulario del cheque.
            </RootsDialogErrorBanner>
          )}
          <RootsPrimaryButton type="submit" disabled={disabled || !popId}>
            Usar este cheque
          </RootsPrimaryButton>
        </form>
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
