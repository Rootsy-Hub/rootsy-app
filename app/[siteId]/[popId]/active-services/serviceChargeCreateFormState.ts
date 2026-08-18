import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import type { CheckoutCheckDetails } from "@/lib/checkoutCheck"
import type { ServiceChargeClientDraft } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeClientField"
import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import { parseNonNegativeIntegerInput } from "@/lib/integerInput"
import { parseMoneyInput } from "@/lib/moneyInput"
import {
  availableBillingScopesForService,
  billingPeriodRequiresManualPeriodEnd,
  type ServiceChargeBillingScope,
} from "@/lib/serviceChargeTypes"
import {
  isServicePaymentTiming,
  type ServicePaymentTiming,
} from "@/lib/serviceCatalogTypes"
import { validateOptionalEmailField } from "@/lib/authValidation"
import { SALE_COMPROBANTE_SIN_LABEL } from "@/lib/saleComprobantePicker"

/** Valor interno del select cuando el comprobante sigue la condición IVA del cliente. */
export const SERVICE_CHARGE_COMPROBANTE_AUTO = "__auto__"

/** Sin comprobante elegido explícitamente (distinto de aún no elegir). */
export const SERVICE_CHARGE_COMPROBANTE_NONE = "__none__"

/** Cobro pendiente — sin medio de tesorería (distinto de aún no elegir). */
export const SERVICE_CHARGE_PAYMENT_PENDING = "__pending__"

export const SERVICE_CHARGE_PAYMENT_PENDING_LABEL = "Pendiente"

export const SERVICE_CHARGE_SNAPSHOT_PLACEHOLDER = "—"

export function isServiceChargePaymentMethodChosen(paymentMethodKey: string): boolean {
  return paymentMethodKey.trim() !== ""
}

export function isServiceChargeComprobanteChosen(comprobanteLabel: string): boolean {
  return comprobanteLabel.trim() !== ""
}

export function serviceChargeComprobanteSelectValue(
  comprobanteLabel: string,
): string {
  if (comprobanteLabel === SERVICE_CHARGE_COMPROBANTE_AUTO) {
    return SERVICE_CHARGE_COMPROBANTE_AUTO
  }
  if (comprobanteLabel === SERVICE_CHARGE_COMPROBANTE_NONE) {
    return SALE_COMPROBANTE_SIN_LABEL
  }
  if (!comprobanteLabel.trim()) {
    return ""
  }
  return comprobanteLabel.trim()
}

export function serviceChargeComprobanteFromSelectValue(value: string): string {
  if (value === SERVICE_CHARGE_COMPROBANTE_AUTO) {
    return SERVICE_CHARGE_COMPROBANTE_AUTO
  }
  if (value === SALE_COMPROBANTE_SIN_LABEL) {
    return SERVICE_CHARGE_COMPROBANTE_NONE
  }
  return value
}

export function resolveServiceChargeComprobanteDisplayLabel(
  comprobanteLabel: string,
  suggestedComprobante: string | null,
): string {
  if (!isServiceChargeComprobanteChosen(comprobanteLabel)) {
    return SERVICE_CHARGE_SNAPSHOT_PLACEHOLDER
  }
  if (comprobanteLabel === SERVICE_CHARGE_COMPROBANTE_NONE) {
    return SALE_COMPROBANTE_SIN_LABEL
  }
  if (comprobanteLabel === SERVICE_CHARGE_COMPROBANTE_AUTO) {
    return suggestedComprobante
      ? `Según condición IVA (${suggestedComprobante})`
      : SALE_COMPROBANTE_SIN_LABEL
  }
  return comprobanteLabel.trim()
}

/** Etiqueta compacta para toolbox — tipo resuelto, sin «Según condición IVA». */
export function resolveServiceChargeComprobanteToolboxLabel(
  comprobanteLabel: string,
  suggestedComprobante: string | null,
): string {
  if (!isServiceChargeComprobanteChosen(comprobanteLabel)) {
    return "Elegir comprobante"
  }
  if (comprobanteLabel === SERVICE_CHARGE_COMPROBANTE_NONE) {
    return SALE_COMPROBANTE_SIN_LABEL
  }
  return (
    resolveServiceChargeComprobanteEffectiveLabel(
      comprobanteLabel,
      suggestedComprobante,
    ) ?? SALE_COMPROBANTE_SIN_LABEL
  )
}

export function resolveServiceChargeComprobanteSnapshotLabel(
  comprobanteLabel: string,
  suggestedComprobante: string | null,
): string {
  return resolveServiceChargeComprobanteDisplayLabel(
    comprobanteLabel,
    suggestedComprobante,
  )
}

export function resolveServiceChargeComprobanteEffectiveLabel(
  comprobanteLabel: string,
  suggestedComprobante: string | null,
): string | null {
  if (comprobanteLabel === SERVICE_CHARGE_COMPROBANTE_NONE) {
    return null
  }
  if (comprobanteLabel === SERVICE_CHARGE_COMPROBANTE_AUTO) {
    return suggestedComprobante
  }
  const trimmed = comprobanteLabel.trim()
  return trimmed || null
}

export function serviceChargeHasComprobante(
  comprobanteLabel: string,
  suggestedComprobante: string | null,
): boolean {
  return (
    resolveServiceChargeComprobanteEffectiveLabel(
      comprobanteLabel,
      suggestedComprobante,
    ) != null
  )
}

export type ServiceChargeCreateWizardStep = 1 | 2 | 3

export const SERVICE_CHARGE_CREATE_WIZARD_STEPS: {
  step: ServiceChargeCreateWizardStep
  label: string
}[] = [
  { step: 1, label: "Servicio" },
  { step: 2, label: "Configuración" },
  { step: 3, label: "Facturación" },
]

export type ServiceChargeCreateFieldErrors = {
  client?: string
  clientManualName?: string
  clientEmail?: string
  serviceTypeId?: string
  billingScope?: string
  periodCount?: string
  periodStartDate?: string
  periodEndDate?: string
  paymentTiming?: string
  dueDaysAfter?: string
  unitPrice?: string
  discountValue?: string
  paymentMethodKey?: string
  comprobanteLabel?: string
}

export type ServiceChargeCreateWizardForm = {
  clientDraft: ServiceChargeClientDraft
  serviceTypeId: string
  billingScope: ServiceChargeBillingScope
  periodCount: string
  periodStartDate: string
  periodEndDate: string
  paymentTiming: ServicePaymentTiming
  dueDaysAfter: string
  unitPrice: string
  discountMode: "" | ArticleDiscountMode
  discountValue: string
  paymentMethodKey: string
  checkDetails: CheckoutCheckDetails | null
  comprobanteLabel: string
  /** Emitir comprobante fiscal al crear el cargo. */
  issueInvoiceOnCreate: boolean
  printInvoiceOnCreate: boolean
  emailInvoiceToClient: boolean
  notes: string
  selectedAddonIds: string[]
  oneTimeAddonIds: string[]
}

export function hasServiceChargeCreateFieldErrors(
  errors: ServiceChargeCreateFieldErrors,
): boolean {
  return Object.keys(errors).length > 0
}

export function validateServiceChargeCreateWizardStep(
  step: ServiceChargeCreateWizardStep,
  form: ServiceChargeCreateWizardForm,
  options: {
    canReadClients: boolean
    canCreateClient: boolean
    hasServices: boolean
    selectedService: ServiceTypeChargeOption | null
  },
): ServiceChargeCreateFieldErrors {
  const errors: ServiceChargeCreateFieldErrors = {}

  if (step === 1) {
    if (!options.hasServices) {
      errors.serviceTypeId = "No hay servicios activos en el catálogo."
    } else if (!form.serviceTypeId.trim()) {
      errors.serviceTypeId = "Elegí un servicio del catálogo."
    }
    return errors
  }

  if (step === 2) {
    const draft = form.clientDraft
    if (!draft.catalogClient?.id) {
      if (!draft.manualName.trim()) {
        if (!options.canReadClients && !options.canCreateClient) {
          errors.client =
            "Sin permiso para buscar ni crear clientes. Pedí acceso a la cartera."
        } else if (options.canReadClients) {
          errors.client =
            "Elegí un cliente de la cartera o completá los datos manualmente."
        } else {
          errors.clientManualName = "Indicá el nombre o razón social del cliente."
        }
      }
    }

    const clientEmailError = validateOptionalEmailField(draft.email)
    if (clientEmailError) {
      errors.clientEmail = clientEmailError
    }

    const service = options.selectedService
    if (!service) {
      errors.serviceTypeId = "Elegí un servicio del catálogo."
      return errors
    }
    const allowedScopes = availableBillingScopesForService(service.billingPeriod)
    if (!allowedScopes.includes(form.billingScope)) {
      errors.billingScope =
        "El alcance elegido no aplica a la periodicidad del servicio."
    }
    if (form.billingScope === "multi_period") {
      const count = Number(form.periodCount.replace(/\D/g, ""))
      if (!Number.isFinite(count) || count < 1 || count > 120) {
        errors.periodCount = "La cantidad de períodos debe ser entre 1 y 120."
      }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.periodStartDate.trim())) {
      errors.periodStartDate = "Indicá una fecha de inicio del período válida."
    }
    if (billingPeriodRequiresManualPeriodEnd(service.billingPeriod)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(form.periodEndDate.trim())) {
        errors.periodEndDate = "Indicá una fecha de fin del período válida."
      } else if (form.periodEndDate.trim() < form.periodStartDate.trim()) {
        errors.periodEndDate =
          "El fin del período no puede ser anterior al inicio."
      }
    }
    const unitPrice = parseMoneyInput(form.unitPrice, Number.NaN)
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      errors.unitPrice = "Indicá un precio unitario válido."
    }
    if (form.discountMode === "porcentaje" && form.discountValue.trim()) {
      const pct = Number(form.discountValue.replace(/\D/g, ""))
      if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
        errors.discountValue = "El descuento debe ser entre 1 y 100 %."
      }
    }
    if (form.discountMode === "fijo" && form.discountValue.trim()) {
      const fixed = parseMoneyInput(form.discountValue, Number.NaN)
      if (!Number.isFinite(fixed) || fixed < 0) {
        errors.discountValue = "Indicá un descuento fijo válido."
      }
    }
    return errors
  }

  if (step === 3) {
    if (!isServicePaymentTiming(form.paymentTiming)) {
      errors.paymentTiming = "Indicá cuándo se paga."
    }
    const dueDaysAfter = parseNonNegativeIntegerInput(form.dueDaysAfter, Number.NaN)
    if (!Number.isFinite(dueDaysAfter) || dueDaysAfter < 0 || dueDaysAfter > 365) {
      errors.dueDaysAfter = "El vencimiento debe estar entre 0 y 365 días."
    }
    return errors
  }

  return errors
}

export function validateServiceChargeOperateForm(
  form: ServiceChargeCreateWizardForm,
  options: {
    canReadClients: boolean
    canCreateClient: boolean
    hasServices: boolean
    selectedService: ServiceTypeChargeOption | null
  },
): ServiceChargeCreateFieldErrors {
  const errors: ServiceChargeCreateFieldErrors = {}
  for (let step = 1 as ServiceChargeCreateWizardStep; step <= 3; step++) {
    Object.assign(
      errors,
      validateServiceChargeCreateWizardStep(step, form, options),
    )
  }
  if (!options.selectedService) {
    errors.serviceTypeId = "Elegí un servicio del catálogo."
  }
  return errors
}

const SERVICE_CHARGE_STEP_2_ERROR_KEYS = [
  "client",
  "clientManualName",
  "clientEmail",
  "billingScope",
  "periodCount",
  "periodStartDate",
  "periodEndDate",
  "unitPrice",
  "discountValue",
] as const satisfies readonly (keyof ServiceChargeCreateFieldErrors)[]

const SERVICE_CHARGE_STEP_3_ERROR_KEYS = [
  "paymentTiming",
  "dueDaysAfter",
] as const satisfies readonly (keyof ServiceChargeCreateFieldErrors)[]

function fieldErrorMessages(
  errors: ServiceChargeCreateFieldErrors,
  keys: readonly (keyof ServiceChargeCreateFieldErrors)[],
): string[] {
  return keys.flatMap((key) => {
    const message = errors[key]
    return message?.trim() ? [message.trim()] : []
  })
}

export function serviceChargeStep2ErrorMessages(
  errors: ServiceChargeCreateFieldErrors,
): string[] {
  return fieldErrorMessages(errors, SERVICE_CHARGE_STEP_2_ERROR_KEYS)
}

export function serviceChargeStep3ErrorMessages(
  errors: ServiceChargeCreateFieldErrors,
): string[] {
  return fieldErrorMessages(errors, SERVICE_CHARGE_STEP_3_ERROR_KEYS)
}
