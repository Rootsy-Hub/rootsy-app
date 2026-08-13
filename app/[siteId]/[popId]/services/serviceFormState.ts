import type {
  ServiceArticleInput,
  UpsertServiceInput,
} from "@/app/[siteId]/[popId]/services/actions"
import type { ServiceArticleFormLine } from "@/app/[siteId]/[popId]/services/components/ServiceArticlesEditor"
import {
  emptyServiceDetailsGrid,
  isServiceBillingPeriod,
  isServiceDiscountMode,
  isServiceLateInterestType,
  isServicePaymentTiming,
  normalizeServiceDetailsGrid,
  type ServiceBillingPeriod,
  type ServiceDetailsGrid,
  type ServiceDiscountMode,
  type ServiceLateInterestType,
  type ServicePaymentTiming,
} from "@/lib/serviceCatalogTypes"
import { parseNonNegativeIntegerInput } from "@/lib/integerInput"
import { formatMoneyInputForField, parseMoneyInput } from "@/lib/moneyInput"

export type ServiceUpsertWizardStep = 1 | 2 | 3 | 4

export const SERVICE_UPSERT_WIZARD_STEPS: {
  step: ServiceUpsertWizardStep
  label: string
}[] = [
  { step: 1, label: "Datos" },
  { step: 2, label: "Artículos" },
  { step: 3, label: "Detalles" },
  { step: 4, label: "Precio" },
]

export type ServiceFormState = {
  categoryId: string
  name: string
  description: string
  imageUrl: string
  articleLines: ServiceArticleFormLine[]
  detailsGrid: ServiceDetailsGrid
  contractText: string
  billingPeriod: ServiceBillingPeriod
  billingPeriodLabel: string
  defaultPrice: string
  paymentTiming: ServicePaymentTiming
  dueDaysAfter: string
  lateInterestType: ServiceLateInterestType
  lateInterestValue: string
  discountMode: ServiceDiscountMode | ""
  discountValue: string
  isActive: boolean
}

export type ServiceUpsertFieldErrors = Partial<
  Record<
    | "categoryId"
    | "name"
    | "billingPeriodLabel"
    | "defaultPrice"
    | "dueDaysAfter"
    | "lateInterestValue"
    | "discountValue"
    | "articleLines",
    string
  >
>

export function defaultServiceFormState(): ServiceFormState {
  return {
    categoryId: "",
    name: "",
    description: "",
    imageUrl: "",
    articleLines: [],
    detailsGrid: emptyServiceDetailsGrid(),
    contractText: "",
    billingPeriod: "monthly",
    billingPeriodLabel: "",
    defaultPrice: formatMoneyInputForField(0),
    paymentTiming: "end_of_period",
    dueDaysAfter: "0",
    lateInterestType: "none",
    lateInterestValue: "",
    discountMode: "",
    discountValue: "",
    isActive: true,
  }
}

export function serviceFormFromDetail(input: {
  categoryId: string | null
  name: string
  description: string
  imageUrl: string | null
  defaultPrice: number
  billingPeriod: ServiceBillingPeriod
  billingPeriodLabel: string | null
  detailsGrid: ServiceDetailsGrid
  contractText: string
  paymentTiming: ServicePaymentTiming
  dueDaysAfter: number
  lateInterestType: ServiceLateInterestType
  lateInterestValue: number | null
  discountMode: ServiceDiscountMode
  discountValue: number | null
  isActive: boolean
  articles: ServiceArticleInput[]
}): ServiceFormState {
  return {
    categoryId: input.categoryId ?? "",
    name: input.name,
    description: input.description,
    imageUrl: input.imageUrl ?? "",
    articleLines: input.articles.map((line, index) => ({
      key: `article-${index}-${line.articleId}`,
      articleId: line.articleId,
      quantity: String(line.quantity),
    })),
    detailsGrid: input.detailsGrid,
    contractText: input.contractText,
    billingPeriod: input.billingPeriod,
    billingPeriodLabel: input.billingPeriodLabel ?? "",
    defaultPrice: formatMoneyInputForField(input.defaultPrice),
    paymentTiming: isServicePaymentTiming(input.paymentTiming)
      ? input.paymentTiming
      : "end_of_period",
    dueDaysAfter: String(input.dueDaysAfter ?? 0),
    lateInterestType: input.lateInterestType,
    lateInterestValue:
      input.lateInterestValue != null ? String(input.lateInterestValue) : "",
    discountMode: input.discountMode === "none" ? "" : input.discountMode,
    discountValue:
      input.discountValue != null && input.discountMode !== "none"
        ? input.discountMode === "porcentaje"
          ? String(input.discountValue)
          : formatMoneyInputForField(input.discountValue)
        : "",
    isActive: input.isActive,
  }
}

function parseArticleLines(
  lines: ServiceArticleFormLine[],
): ServiceArticleInput[] {
  return lines
    .filter((line) => line.articleId.trim())
    .map((line) => ({
      articleId: line.articleId.trim(),
      quantity: Number(line.quantity.replace(",", ".")),
    }))
    .filter((line) => Number.isFinite(line.quantity) && line.quantity > 0)
}

export function serviceFormToPayload(form: ServiceFormState): UpsertServiceInput {
  const discountMode: ServiceDiscountMode =
    form.discountMode === "porcentaje" || form.discountMode === "fijo"
      ? form.discountMode
      : "none"
  const discountValueRaw =
    discountMode === "none"
      ? null
      : discountMode === "porcentaje"
        ? parseNonNegativeIntegerInput(form.discountValue, Number.NaN)
        : parseMoneyInput(form.discountValue, Number.NaN)
  const discountValue =
    discountValueRaw != null && Number.isFinite(discountValueRaw) && discountValueRaw > 0
      ? discountValueRaw
      : null

  const lateInterestValue =
    form.lateInterestType === "simple_percent" && form.lateInterestValue.trim()
      ? Number(form.lateInterestValue.replace(",", "."))
      : null

  const dueDaysAfterParsed = parseNonNegativeIntegerInput(
    form.dueDaysAfter,
    0,
  )

  return {
    name: form.name,
    description: form.description,
    categoryId: form.categoryId,
    imageUrl: form.imageUrl.trim(),
    defaultPrice: parseMoneyInput(form.defaultPrice, 0),
    billingPeriod: form.billingPeriod,
    billingPeriodLabel: form.billingPeriodLabel,
    detailsGrid: normalizeServiceDetailsGrid(form.detailsGrid),
    contractText: form.contractText,
    paymentTiming: isServicePaymentTiming(form.paymentTiming)
      ? form.paymentTiming
      : "end_of_period",
    dueDaysAfter:
      Number.isFinite(dueDaysAfterParsed) && dueDaysAfterParsed >= 0
        ? Math.min(365, dueDaysAfterParsed)
        : 0,
    lateInterestType: form.lateInterestType,
    lateInterestValue:
      lateInterestValue != null && Number.isFinite(lateInterestValue)
        ? lateInterestValue
        : null,
    discountMode: discountValue != null ? discountMode : "none",
    discountValue,
    articles: parseArticleLines(form.articleLines),
    isActive: form.isActive,
  }
}

export function hasServiceUpsertFieldErrors(
  errors: ServiceUpsertFieldErrors,
): boolean {
  return Object.keys(errors).length > 0
}

export function validateServiceUpsertWizardStep(
  step: ServiceUpsertWizardStep,
  form: ServiceFormState,
): ServiceUpsertFieldErrors {
  const errors: ServiceUpsertFieldErrors = {}

  if (step === 1) {
    if (!form.categoryId.trim()) errors.categoryId = "Elegí una categoría."
    if (!form.name.trim()) errors.name = "Indicá el nombre del servicio."
  }

  if (step === 2) {
    for (const line of form.articleLines) {
      if (!line.articleId.trim()) continue
      const qty = Number(line.quantity.replace(",", "."))
      if (!Number.isFinite(qty) || qty <= 0) {
        errors.articleLines = "Indicá cantidades válidas para los artículos."
        break
      }
    }
  }

  if (step === 4) {
    const price = parseMoneyInput(form.defaultPrice, -1)
    if (!Number.isFinite(price) || price < 0) {
      errors.defaultPrice = "Indicá un precio válido."
    }
    if (form.billingPeriod === "custom" && !form.billingPeriodLabel.trim()) {
      errors.billingPeriodLabel = "Indicá la etiqueta del período personalizado."
    }
    const dueDaysAfter = parseNonNegativeIntegerInput(form.dueDaysAfter, Number.NaN)
    if (!Number.isFinite(dueDaysAfter) || dueDaysAfter < 0 || dueDaysAfter > 365) {
      errors.dueDaysAfter =
        "Los días de vencimiento deben estar entre 0 y 365."
    }
    if (form.lateInterestType === "simple_percent") {
      const interest = Number(form.lateInterestValue.replace(",", "."))
      if (!Number.isFinite(interest) || interest <= 0) {
        errors.lateInterestValue = "Indicá un porcentaje de interés válido."
      }
    }
    if (form.discountMode === "porcentaje" && form.discountValue.trim()) {
      const pct = parseNonNegativeIntegerInput(form.discountValue, Number.NaN)
      if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
        errors.discountValue = "El descuento debe ser entre 1 y 100%."
      }
    }
    if (form.discountMode === "fijo" && form.discountValue.trim()) {
      const fixed = parseMoneyInput(form.discountValue, Number.NaN)
      if (!Number.isFinite(fixed) || fixed <= 0) {
        errors.discountValue = "Indicá un monto de descuento válido."
      }
    }
  }

  return errors
}
