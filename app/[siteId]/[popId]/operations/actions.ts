import type { OperationsListFiltersInput } from "@/app/[siteId]/[popId]/operations/operationsFilters"
import type {
  SaleLineDisplay,
  SaleSnapshotTotals,
} from "@/lib/saleSnapshot"
import type {
  ServiceBillingPeriod,
  ServiceDiscountMode,
} from "@/lib/serviceCatalogTypes"
import type {
  ServiceChargeBillingScope,
  ServiceChargeEffectiveStatus,
  ServiceChargePaymentMode,
  ServiceChargeStoredStatus,
} from "@/lib/serviceChargeTypes"

export type OperationSaleLineItem = {
  articleId: string | null
  recipeId: string | null
  promotionId: string | null
  lineKind: "article" | "recipe" | "promotion" | null
  nameSnapshot: string
  quantity: number
  unitPrice: number
  lineTotal: number
  iva: number
  lineDiscount: number
  itemDiscountMode: "porcentaje" | "fijo" | null
  itemDiscountValue: number | null
  itemDiscountAmount: number
  lineSubtotal: number | null
  comment: string | null
  discountSource: "none" | "catalog" | "manual" | "quantity_deal" | "combo" | null
  promotionDealId: string | null
  promotionDealName: string | null
  lineGroupId: string | null
  listLineTotal: number | null
  taxBase: number | null
  taxAmount: number | null
  generalDiscountShare: number | null
  display: SaleLineDisplay | null
  promotionSnapshot: {
    listTotal?: number
    promoDiscount?: number
    components?: Array<{
      name_snapshot?: string
      quantity?: number
      article_id?: string | null
      recipe_id?: string | null
      slot_id?: string | null
    }>
  } | null
}

export type OperationSalePayment = {
  amount: number
  methodName: string
}

export type OperationSaleArcaInvoice = {
  id: string
  tipoLabel: string
  arcaCbteTipo: number
  arcaRegimen: string
  ptoVta: number
  cbteNro: string
  cbteFch: string
  docTipo: number | null
  docNro: string
  receptorRazonSocial: string
  impTotal: number
  impNeto: number
  impIva: number
  cae: string | null
  caeFchVto: string | null
  status: string
}

export type OperationSaleQuantityDealSummary = {
  promotionId: string
  promotionName: string
  discountAmount: number
}

export type OperationSaleDiscountInfo = {
  itemDiscountTotal: number
  generalDiscountAmount: number
  generalDiscountMode: "porcentaje" | "fijo" | null
  generalDiscountValue: number | null
  subtotalBeforeGeneralDiscount: number | null
  quantityDealApplications: OperationSaleQuantityDealSummary[]
}

export type OperationSaleSnapshotInfo = {
  version: number | null
  totals: SaleSnapshotTotals | null
}

export type OperationSaleChannel = "pos" | "table" | "counter"

export type OperationSaleDetailContext = {
  channel: OperationSaleChannel
  soldAt: string | null
  soldByName: string | null
  customerName: string | null
  tableLabel: string | null
  openedAt: string | null
  closedAt: string | null
  openedByName: string | null
  closedByName: string | null
  waiterName: string | null
  guestCount: number | null
  note: string | null
  counterOrderLabel: string | null
  fulfillmentType: "pickup" | "delivery" | null
  deliveryAddress: string | null
  phone: string | null
  driverName: string | null
  estimatedMinutes: number | null
  deliveredAt: string | null
}

export type OperationSaleChargeRow = {
  saleId: string
  soldAt: string
  amount: number
  methodName: string
  comprobanteLabel: string | null
  hasComprobante: boolean
  sale: OperationSaleRow
}

export type OperationSaleRow = {
  id: string
  soldAt: string
  status: string
  saleChannel: OperationSaleChannel
  /** Importe registrado en esta venta (cobro parcial o total). */
  saleAmount: number
  total: number
  subtotal: number
  taxTotal: number
  discountTotal: number
  discountInfo: OperationSaleDiscountInfo
  snapshotInfo: OperationSaleSnapshotInfo
  clientId: string | null
  customerName: string | null
  customerTaxId: string | null
  invoiceTypeLabel: string | null
  accruesOutputVat: boolean
  arcaInvoice: OperationSaleArcaInvoice | null
  currency: string
  lineItems: OperationSaleLineItem[]
  payments: OperationSalePayment[]
  paymentMethodLabel: string
  tableLabel: string | null
  /** Número visible del pedido de mostrador (ej. #12). */
  counterOrderLabel: string | null
  tableSessionId?: string | null
  counterOrderId?: string | null
  /** Total del pedido/mesa (mesas/mostrador). */
  channelOrderTotal?: number | null
  /** Total cobrado acumulado en pagos parciales. */
  channelPaidTotal?: number | null
  /** Ventas individuales agrupadas en esta fila. */
  groupedSaleIds?: string[]
  isChannelGrouped?: boolean
  soldByName: string | null
  customerIvaConditionLabel: string
  /** Mesas/mostrador: apertura de sesión o pedido. */
  channelOpenedAt?: string | null
  channelOpenedByName?: string | null
  /** Mesas: cierre de sesión (null = abierta). Mostrador: entrega o cancelación. */
  channelClosedAt?: string | null
  channelClosedByName?: string | null
  channelWaiterName?: string | null
  channelCounterStatus?: string | null
  channelFulfillmentType?: "pickup" | "delivery" | null
}

export type OperationExpenseLedgerRow = {
  entryId: string
  expenseId: string | null
  expensePaymentId: string | null
  sourceType: "expense_payment" | "expense_void"
  operationDate: string
  operationAt: string
  amount: number
  expenseAmount: number | null
  categoryName: string
  description: string
  paymentMethodLabel: string
  recordedByName: string | null
}

export type OperationServiceChargePaymentRow = {
  id: string
  amount: number
  paidAt: string
  paymentKind: string | null
  notes: string
}

export type OperationServiceChargeRow = {
  id: string
  createdAt: string
  dueDate: string
  clientId: string
  clientName: string
  serviceTypeId: string
  serviceName: string
  billingPeriod: ServiceBillingPeriod
  billingPeriodLabel: string | null
  billingScope: ServiceChargeBillingScope
  paymentMode: ServiceChargePaymentMode
  periodCount: number
  sequenceIndex: number
  periodStart: string | null
  periodEnd: string | null
  periodDisplay: string
  unitPrice: number
  discountMode: ServiceDiscountMode
  discountValue: number | null
  discountAmount: number
  amount: number
  paidTotal: number
  balance: number
  storedStatus: ServiceChargeStoredStatus
  effectiveStatus: ServiceChargeEffectiveStatus
  cancelledAt: string | null
  notes: string
  payments: OperationServiceChargePaymentRow[]
}

export type OperationPurchaseLineItem = {
  articleId: string | null
  nameSnapshot: string
  quantity: number
  unitCost: number
  lineTotal: number
  iva: number
  itemDiscountMode: "porcentaje" | "fijo" | null
  itemDiscountValue: number | null
  itemDiscountAmount: number
  lineSubtotal: number | null
  comment: string | null
}

export type OperationPurchaseDiscountInfo = OperationSaleDiscountInfo

export type OperationPurchasePayment = {
  amount: number
  methodName: string
  paidAt: string
}

export type OperationPurchaseRow = {
  id: string
  operationDate: string
  operationAt: string
  status: string
  purchaseKind: string
  subtotal: number
  total: number
  taxTotal: number
  paidTotal: number
  supplierId: string | null
  supplierName: string
  documentNumber: string | null
  currency: string
  discountTotal: number
  discountInfo: OperationPurchaseDiscountInfo
  lineItems: OperationPurchaseLineItem[]
  payments: OperationPurchasePayment[]
  paymentMethodLabel: string
  purchasedByName: string | null
  documentKindLabel: string | null
  accruesInputVat: boolean
  supplierIvaConditionLabel: string
  vatIncludedEstimate: number | null
}

export type OperationsListView =
  | "sales"
  | "sales-report"
  | "tables"
  | "counter"
  | "purchases"
  | "expenses"
  | "services"

export type GetOperationsListInput = {
  view: OperationsListView
  dateFrom: string | null
  dateTo: string | null
  search: string
  page: number
  pageSize: number
  /** Compras con crédito fiscal (Factura A/B). */
  fiscalOnly?: boolean
  filters?: OperationsListFiltersInput
  sort?: string | null
  ord?: "asc" | "desc"
  /** `full` incluye line_items (estadísticas). El listado del módulo usa slim. */
  include?: "slim" | "full"
}

export type GetOperationsListResult =
  | {
      success: true
      popName: string
      totalCount: number
      page: number
      sales: OperationSaleRow[]
      expenseLedger: OperationExpenseLedgerRow[]
      purchases: OperationPurchaseRow[]
      serviceCharges?: OperationServiceChargeRow[]
    }
  | {
      success: false
      error: string
      redirect?: string
      popName?: string
      totalCount: number
      page: number
      sales: OperationSaleRow[]
      expenseLedger: OperationExpenseLedgerRow[]
      purchases: OperationPurchaseRow[]
      serviceCharges?: OperationServiceChargeRow[]
    }

export type OperationAccountingLineRow = {
  id: string
  accountCode: string
  accountName: string
  debitAmount: number
  creditAmount: number
  lineDescription: string | null
}

export type OperationAccountingEntryDetail = {
  id: string
  entryNumber: number
  entryDate: string
  description: string
  sourceType: string
  status: string
  totalDebit: number
  totalCredit: number
  lines: OperationAccountingLineRow[]
}
