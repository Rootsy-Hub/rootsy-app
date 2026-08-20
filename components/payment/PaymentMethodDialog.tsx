"use client"

import { CheckUpsertFormFields } from "@/app/[siteId]/[popId]/checks/CheckUpsertFormFields"
import {
  defaultCheckCreateFormState,
  type CheckCreateFormState,
} from "@/app/[siteId]/[popId]/checks/checkFormState"
import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
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
import {
  checkoutCheckDirection,
  checkoutCheckSelectionLabel,
  parseCheckoutCheckDetails,
  type CheckoutCheckDetails,
} from "@/lib/checkoutCheck"
import type { OperationPaymentKind } from "@/lib/operationPaymentKinds"
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
  shouldStayOpenAfterSelection,
  type PaymentCheckoutStep,
  type PaymentFlow,
  type PaymentMethodSelection,
} from "@/lib/paymentMethodCheckout"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import { cn } from "@/lib/utils"
import {
  Banknote,
  BookOpen,
  ChevronLeft,
  CreditCard,
  Landmark,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react"

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
  popId?: string
  defaultPartyName?: string
  defaultPartyId?: string
  /** Bloquea opciones y cierre mientras se registra el cobro o pago. */
  busy?: boolean
  /**
   * Si está, elegir un medio no cobra: queda marcado y hay que confirmar.
   * Evita un click accidental en Efectivo.
   */
  confirmLabel?: string
  /** Flecha de volver en el menú (p. ej. volver al cobro de cuenta corriente). */
  showMenuBack?: boolean
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
  if (step === "check") return "Datos del cheque"
  return paymentCheckoutKindLabel(flow, pendingKind!)
}

function checkFormFromDetails(
  flow: PaymentFlow,
  details: CheckoutCheckDetails | undefined,
  defaultPartyName: string,
  defaultPartyId: string,
): CheckCreateFormState {
  const direction = checkoutCheckDirection(flow)
  const base = defaultCheckCreateFormState(direction)
  if (!details) {
    return {
      ...base,
      partyName: defaultPartyName,
      partyId: defaultPartyId,
    }
  }
  return {
    ...base,
    checkNumber: details.checkNumber,
    bankName: details.bankName,
    issueDate: details.issueDate || base.issueDate,
    dueDate: details.dueDate || base.dueDate,
    partyName: details.partyName || defaultPartyName,
    partyId: details.partyId || defaultPartyId,
    notes: details.notes,
  }
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
  hideAccountOption = false,
  initialDestinationKind = null,
  popId = "",
  defaultPartyName = "",
  defaultPartyId = "",
  busy = false,
  confirmLabel,
  showMenuBack = false,
}: Props) {
  const [step, setStep] = useState<PaymentCheckoutStep>(() =>
    initialDestinationKind ? "destination" : "menu",
  )
  const [pendingKind, setPendingKind] = useState<OperationPaymentKind | null>(
    () => initialDestinationKind ?? null,
  )
  const [pendingCheckSelection, setPendingCheckSelection] =
    useState<PaymentMethodSelection | null>(null)
  const [checkForm, setCheckForm] = useState<CheckCreateFormState>(() =>
    checkFormFromDetails(flow, undefined, defaultPartyName, defaultPartyId),
  )
  const [stepError, setStepError] = useState<string | null>(null)
  const [stagedSelection, setStagedSelection] =
    useState<PaymentMethodSelection | null>(null)

  useEffect(() => {
    if (!open) {
      setStep(initialDestinationKind ? "destination" : "menu")
      setPendingKind(initialDestinationKind ?? null)
      setPendingCheckSelection(null)
      setStepError(null)
      setStagedSelection(null)
      return
    }

    if (initialDestinationKind) {
      setStep("destination")
      setPendingKind(initialDestinationKind)
      setPendingCheckSelection(null)
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
    (option: PaymentMethodSelection, options?: { skipConfirm?: boolean }) => {
      if (shouldStayOpenAfterSelection(flow, option)) {
        onSelectImmediate(option)
        setPendingKind(option.kind)
        setStep("installments")
        setStepError(null)
        return
      }
      if (confirmLabel && !options?.skipConfirm) {
        setStagedSelection(option)
        setStepError(null)
        return
      }
      onSelectImmediate(option)
      onOpenChange(false)
    },
    [confirmLabel, flow, onOpenChange, onSelectImmediate],
  )

  const handleKindPick = useCallback(
    (kind: OperationPaymentKind) => {
      if (busy || !treasuryContext) return
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
        setStagedSelection(null)
        setPendingKind(result.kind)
        setStep("destination")
        return
      }
      if (result.action === "check") {
        setStagedSelection(null)
        setPendingKind("check")
        setPendingCheckSelection(result.selection)
        setCheckForm(
          checkFormFromDetails(
            flow,
            selected?.kind === "check" ? selected.checkDetails : undefined,
            defaultPartyName,
            defaultPartyId,
          ),
        )
        setStep("check")
        return
      }
      finishSelection(result.selection)
    },
    [
      busy,
      cashTreasuryAccountId,
      defaultPartyId,
      defaultPartyName,
      finishSelection,
      flow,
      selected,
      treasuryContext,
    ],
  )

  const handleDestinationPick = useCallback(
    (destinationId: string, destinationName: string) => {
      if (busy || !treasuryContext || !pendingKind) return
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
    [busy, finishSelection, flow, pendingKind, treasuryContext],
  )

  const handleBack = useCallback(() => {
    setStagedSelection(null)
    if (step === "menu" && showMenuBack) {
      onOpenChange(false)
      setStepError(null)
      return
    }
    if (initialDestinationKind) {
      onOpenChange(false)
      setStepError(null)
      return
    }

    if (step === "check") {
      setStep("menu")
      setPendingKind(null)
      setPendingCheckSelection(null)
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
  }, [
    flow,
    initialDestinationKind,
    onOpenChange,
    pendingKind,
    showMenuBack,
    step,
    treasuryContext,
  ])

  const destinationItems = useMemo(() => {
    if (!treasuryContext || !pendingKind || step !== "destination") return []
    return getPaymentCheckoutDestinations(flow, pendingKind, treasuryContext)
  }, [flow, pendingKind, step, treasuryContext])

  const handleCheckSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!pendingCheckSelection) return
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
        setStepError(parsed.error)
        return
      }
      setStepError(null)
      finishSelection(
        {
          ...pendingCheckSelection,
          label: checkoutCheckSelectionLabel(parsed.details),
          checkDetails: parsed.details,
        },
        { skipConfirm: true },
      )
    },
    [checkForm, finishSelection, pendingCheckSelection],
  )

  const activeSelection = stagedSelection ?? selected
  const paymentKinds = getPaymentCheckoutKinds(flow)
  const sectionTitle =
    immediateSectionTitle ?? (flow === "sale" ? "Cobro inmediato" : "Pago inmediato")
  const checkDescription =
    flow === "purchase"
      ? "El cheque queda como documento a pagar. El importe es el de esta compra."
      : "El cheque queda en cartera. El importe es el de esta operación."

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && busy) return
        onOpenChange(next)
      }}
    >
      <RootsDialogContent className="flex flex-col">
        {step === "menu" && !showMenuBack ? (
          <RootsDialogHeader
            title="Formas de pago"
            description={
              flow === "purchase"
                ? "Cómo vas a pagar esta compra."
                : flow === "sale"
                  ? "Cómo vas a cobrar esta venta."
                  : undefined
            }
          />
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

        {step === "check" ? (
          <RootsDialogForm onSubmit={handleCheckSubmit}>
            <RootsDialogBody className="space-y-4">
              {stepError ? (
                <RootsDialogErrorBanner>{stepError}</RootsDialogErrorBanner>
              ) : null}
              {popId ? (
                <>
                  <p className="text-sm leading-relaxed text-[var(--rootsy-bruma-500)]">
                    {checkDescription}
                  </p>
                  <CheckUpsertFormFields
                    popId={popId}
                    idPrefix="checkout-check"
                    form={checkForm}
                    setForm={setCheckForm}
                    hideAmount
                  />
                </>
              ) : (
                <RootsDialogErrorBanner>
                  No se pudo cargar el formulario del cheque.
                </RootsDialogErrorBanner>
              )}
            </RootsDialogBody>
            <RootsDialogDualActionFooter
              cancelLabel="Volver"
              onCancel={handleBack}
              confirmLabel="Usar este cheque"
              confirmType="submit"
              confirmDisabled={!popId || busy}
              confirmLoading={busy}
            />
          </RootsDialogForm>
        ) : (
        <>
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
                        paymentCheckoutKindNeedsDetailsStep(kind) ||
                        paymentCheckoutKindHasDestinationStep(
                          flow,
                          kind,
                          treasuryContext,
                        )
                      const isSelected =
                        !payOnAccount &&
                        activeSelection?.kind === kind &&
                        (kind === "cash" ||
                          kind === "transfer" ||
                          activeSelection.treasuryAccountId != null)
                      const subtitle =
                        isSelected && activeSelection
                          ? activeSelection.label
                          : paymentCheckoutKindSubtitle(flow, kind, treasuryContext, {
                              cashTreasuryAccountId,
                              cashRegisterName,
                            })

                      return (
                        <li key={kind}>
                          <CheckoutOptionCard
                            title={paymentCheckoutKindLabel(flow, kind)}
                            subtitle={subtitle}
                            selected={isSelected}
                            disabled={busy}
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
                  activeSelection != null &&
                  pendingKind === activeSelection.kind &&
                  activeSelection.treasuryAccountId === dest.id
                return (
                  <li key={dest.id}>
                    <CheckoutOptionCard
                      title={dest.name}
                      selected={isSelected}
                      disabled={busy}
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
              <Label
                htmlFor="payment-card-installments"
                className="text-[var(--rootsy-bruma-700)]"
              >
                Cantidad de cuotas
              </Label>
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
        {confirmLabel && stagedSelection ? (
          <RootsDialogDualActionFooter
            cancelLabel="Volver"
            confirmLabel={confirmLabel}
            confirmDisabled={busy}
            confirmLoading={busy}
            confirmLoadingLabel="Registrando…"
            onCancel={() => {
              if (busy) return
              setStagedSelection(null)
            }}
            onConfirm={() => {
              if (busy || !stagedSelection) return
              onSelectImmediate(stagedSelection)
            }}
          />
        ) : null}
        </>
        )}
      </RootsDialogContent>
    </Dialog>
  )
}
