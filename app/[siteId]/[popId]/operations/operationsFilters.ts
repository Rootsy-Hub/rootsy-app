import type { OperationsViewId } from "@/lib/operationsViewPreference"
import {
  PURCHASE_KIND_LABEL,
  type PurchaseKind,
} from "@/lib/purchaseKind"
import {
  SERVICE_CHARGE_BILLING_SCOPE_LABELS,
  SERVICE_CHARGE_STATUS_LABELS,
  type ServiceChargeBillingScope,
  type ServiceChargeEffectiveStatus,
} from "@/lib/serviceChargeTypes"

export const OPERATIONS_SALE_STATUS_FILTERS = [
  "completed",
  "partial",
  "cancelled",
] as const

export type OperationsSaleStatusFilter =
  (typeof OPERATIONS_SALE_STATUS_FILTERS)[number]

export const OPERATIONS_SALE_STATUS_FILTER_LABELS: Record<
  OperationsSaleStatusFilter,
  string
> = {
  completed: "Completadas",
  partial: "Parciales",
  cancelled: "Anuladas",
}

export const OPERATIONS_TABLE_SESSION_FILTERS = ["open", "closed"] as const

export type OperationsTableSessionFilter =
  (typeof OPERATIONS_TABLE_SESSION_FILTERS)[number]

export const OPERATIONS_TABLE_SESSION_FILTER_LABELS: Record<
  OperationsTableSessionFilter,
  string
> = {
  open: "Abiertas",
  closed: "Cerradas",
}

export const OPERATIONS_COUNTER_STATUS_FILTERS = [
  "preparing",
  "dispatched",
  "delivered",
  "cancelled",
] as const

export type OperationsCounterStatusFilter =
  (typeof OPERATIONS_COUNTER_STATUS_FILTERS)[number]

export const OPERATIONS_COUNTER_STATUS_FILTER_LABELS: Record<
  OperationsCounterStatusFilter,
  string
> = {
  preparing: "Preparando",
  dispatched: "Enviados",
  delivered: "Entregados",
  cancelled: "Cancelados",
}

export const OPERATIONS_COUNTER_FULFILLMENT_FILTERS = [
  "pickup",
  "delivery",
] as const

export type OperationsCounterFulfillmentFilter =
  (typeof OPERATIONS_COUNTER_FULFILLMENT_FILTERS)[number]

export const OPERATIONS_COUNTER_FULFILLMENT_FILTER_LABELS: Record<
  OperationsCounterFulfillmentFilter,
  string
> = {
  pickup: "Mostrador",
  delivery: "Delivery",
}

export const OPERATIONS_PURCHASE_KIND_FILTERS = [
  "merchandise",
  "raw_material",
  "supply",
  "mixed",
] as const satisfies readonly PurchaseKind[]

export type OperationsPurchaseKindFilter =
  (typeof OPERATIONS_PURCHASE_KIND_FILTERS)[number]

export const OPERATIONS_EXPENSE_SOURCE_FILTERS = [
  "expense_payment",
  "expense_void",
] as const

export type OperationsExpenseSourceFilter =
  (typeof OPERATIONS_EXPENSE_SOURCE_FILTERS)[number]

export const OPERATIONS_EXPENSE_SOURCE_FILTER_LABELS: Record<
  OperationsExpenseSourceFilter,
  string
> = {
  expense_payment: "Pagos",
  expense_void: "Anulaciones",
}

export const OPERATIONS_SERVICE_STATUS_FILTERS = [
  "pending",
  "partial",
  "paid",
  "overdue",
  "cancelled",
] as const satisfies readonly ServiceChargeEffectiveStatus[]

export type OperationsServiceStatusFilter =
  (typeof OPERATIONS_SERVICE_STATUS_FILTERS)[number]

export const OPERATIONS_SERVICE_SCOPE_FILTERS = [
  "one_period",
  "multi_period",
  "subscription",
] as const satisfies readonly ServiceChargeBillingScope[]

export type OperationsServiceScopeFilter =
  (typeof OPERATIONS_SERVICE_SCOPE_FILTERS)[number]

export type OperationsModalFilters = {
  saleStatus: OperationsSaleStatusFilter | ""
  saleWithDiscount: boolean
  tableSession: OperationsTableSessionFilter | ""
  counterStatus: OperationsCounterStatusFilter | ""
  counterFulfillment: OperationsCounterFulfillmentFilter | ""
  purchaseKind: OperationsPurchaseKindFilter | ""
  purchaseFiscalOnly: boolean
  expenseSource: OperationsExpenseSourceFilter | ""
  serviceStatus: OperationsServiceStatusFilter | ""
  serviceScope: OperationsServiceScopeFilter | ""
}

export type OperationsListFiltersInput = {
  saleStatus?: OperationsSaleStatusFilter
  saleWithDiscount?: boolean
  tableSession?: OperationsTableSessionFilter
  counterStatus?: OperationsCounterStatusFilter
  counterFulfillment?: OperationsCounterFulfillmentFilter
  purchaseKind?: OperationsPurchaseKindFilter
  expenseSource?: OperationsExpenseSourceFilter
  serviceStatus?: OperationsServiceStatusFilter
  serviceScope?: OperationsServiceScopeFilter
}

export function defaultOperationsModalFilters(): OperationsModalFilters {
  return {
    saleStatus: "",
    saleWithDiscount: false,
    tableSession: "",
    counterStatus: "",
    counterFulfillment: "",
    purchaseKind: "",
    purchaseFiscalOnly: false,
    expenseSource: "",
    serviceStatus: "",
    serviceScope: "",
  }
}

export function operationsFiltersPlaceholder(
  view: OperationsViewId,
): string {
  switch (view) {
    case "sales":
      return "Estado y descuento"
    case "tables":
      return "Abiertas o cerradas"
    case "counter":
      return "Estado y entrega"
    case "purchases":
      return "Tipo y fiscal"
    case "expenses":
      return "Pago o anulación"
    case "services":
      return "Estado y modalidad"
  }
}

export type OperationsFilterChip = {
  id: string
  label: string
  removeAriaLabel: string
}

function chip(
  id: string,
  label: string,
  removeAriaLabel: string,
): OperationsFilterChip {
  return { id, label, removeAriaLabel }
}

export function operationsFilterChips(
  view: OperationsViewId,
  filters: OperationsModalFilters,
): OperationsFilterChip[] {
  const chips: OperationsFilterChip[] = []
  if (view === "sales") {
    if (filters.saleStatus) {
      chips.push(
        chip(
          "saleStatus",
          `Estado: ${OPERATIONS_SALE_STATUS_FILTER_LABELS[filters.saleStatus]}`,
          "Quitar filtro de estado",
        ),
      )
    }
    if (filters.saleWithDiscount) {
      chips.push(
        chip("saleWithDiscount", "Con descuento", "Quitar filtro de descuento"),
      )
    }
    return chips
  }
  if (view === "tables") {
    if (filters.tableSession) {
      chips.push(
        chip(
          "tableSession",
          OPERATIONS_TABLE_SESSION_FILTER_LABELS[filters.tableSession],
          "Quitar filtro de mesa",
        ),
      )
    }
    return chips
  }
  if (view === "counter") {
    if (filters.counterStatus) {
      chips.push(
        chip(
          "counterStatus",
          `Estado: ${OPERATIONS_COUNTER_STATUS_FILTER_LABELS[filters.counterStatus]}`,
          "Quitar filtro de estado",
        ),
      )
    }
    if (filters.counterFulfillment) {
      chips.push(
        chip(
          "counterFulfillment",
          OPERATIONS_COUNTER_FULFILLMENT_FILTER_LABELS[
            filters.counterFulfillment
          ],
          "Quitar filtro de entrega",
        ),
      )
    }
    return chips
  }
  if (view === "purchases") {
    if (filters.purchaseKind) {
      chips.push(
        chip(
          "purchaseKind",
          `Tipo: ${PURCHASE_KIND_LABEL[filters.purchaseKind]}`,
          "Quitar filtro de tipo",
        ),
      )
    }
    if (filters.purchaseFiscalOnly) {
      chips.push(
        chip(
          "purchaseFiscalOnly",
          "Crédito fiscal",
          "Quitar filtro de crédito fiscal",
        ),
      )
    }
    return chips
  }
  if (view === "expenses") {
    if (filters.expenseSource) {
      chips.push(
        chip(
          "expenseSource",
          OPERATIONS_EXPENSE_SOURCE_FILTER_LABELS[filters.expenseSource],
          "Quitar filtro de movimiento",
        ),
      )
    }
    return chips
  }
  if (filters.serviceStatus) {
    chips.push(
      chip(
        "serviceStatus",
        `Estado: ${SERVICE_CHARGE_STATUS_LABELS[filters.serviceStatus]}`,
        "Quitar filtro de estado",
      ),
    )
  }
  if (filters.serviceScope) {
    chips.push(
      chip(
        "serviceScope",
        `Modalidad: ${SERVICE_CHARGE_BILLING_SCOPE_LABELS[filters.serviceScope]}`,
        "Quitar filtro de modalidad",
      ),
    )
  }
  return chips
}

export function operationsModalFiltersActiveCount(
  view: OperationsViewId,
  filters: OperationsModalFilters,
): number {
  return operationsFilterChips(view, filters).length
}

export function operationsListFiltersFromModal(
  view: OperationsViewId,
  filters: OperationsModalFilters,
): OperationsListFiltersInput {
  if (view === "sales") {
    return {
      ...(filters.saleStatus ? { saleStatus: filters.saleStatus } : {}),
      ...(filters.saleWithDiscount ? { saleWithDiscount: true } : {}),
    }
  }
  if (view === "tables") {
    return filters.tableSession
      ? { tableSession: filters.tableSession }
      : {}
  }
  if (view === "counter") {
    return {
      ...(filters.counterStatus
        ? { counterStatus: filters.counterStatus }
        : {}),
      ...(filters.counterFulfillment
        ? { counterFulfillment: filters.counterFulfillment }
        : {}),
    }
  }
  if (view === "purchases") {
    return filters.purchaseKind
      ? { purchaseKind: filters.purchaseKind }
      : {}
  }
  if (view === "expenses") {
    return filters.expenseSource
      ? { expenseSource: filters.expenseSource }
      : {}
  }
  return {
    ...(filters.serviceStatus ? { serviceStatus: filters.serviceStatus } : {}),
    ...(filters.serviceScope ? { serviceScope: filters.serviceScope } : {}),
  }
}

export function operationsFiltersQueryKey(
  view: OperationsViewId,
  filters: OperationsModalFilters,
): string {
  const input = operationsListFiltersFromModal(view, filters)
  const fiscal = view === "purchases" && filters.purchaseFiscalOnly ? "1" : ""
  return [
    input.saleStatus ?? "",
    input.saleWithDiscount ? "1" : "",
    input.tableSession ?? "",
    input.counterStatus ?? "",
    input.counterFulfillment ?? "",
    input.purchaseKind ?? "",
    fiscal,
    input.expenseSource ?? "",
    input.serviceStatus ?? "",
    input.serviceScope ?? "",
  ].join("|")
}

export function saleMatchesOperationsFilters(
  sale: { status: string; discountTotal: number },
  filters: OperationsListFiltersInput | undefined,
): boolean {
  if (!filters) return true
  if (filters.saleStatus && sale.status !== filters.saleStatus) return false
  if (filters.saleWithDiscount && sale.discountTotal <= 0) return false
  return true
}

export function tableSaleMatchesOperationsFilters(
  sale: { channelClosedAt?: string | null },
  filters: OperationsListFiltersInput | undefined,
): boolean {
  if (!filters?.tableSession) return true
  const closed = Boolean(sale.channelClosedAt)
  return filters.tableSession === "closed" ? closed : !closed
}

export function counterSaleMatchesOperationsFilters(
  sale: {
    channelCounterStatus?: string | null
    channelFulfillmentType?: "pickup" | "delivery" | null
  },
  filters: OperationsListFiltersInput | undefined,
): boolean {
  if (!filters) return true
  if (
    filters.counterStatus &&
    sale.channelCounterStatus !== filters.counterStatus
  ) {
    return false
  }
  if (
    filters.counterFulfillment &&
    sale.channelFulfillmentType !== filters.counterFulfillment
  ) {
    return false
  }
  return true
}
