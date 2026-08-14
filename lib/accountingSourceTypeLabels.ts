const ACCOUNTING_SOURCE_TYPE_LABELS: Record<string, string> = {
  sale: "Venta",
  purchase: "Compra",
  manual: "Manual",
  adjustment: "Ajuste",
  payment: "Cobro / pago",
  opening: "Apertura",
  closing: "Cierre",
  cash_register_close: "Cierre de caja (arqueo)",
  inventory_adjustment: "Ajuste de inventario",
  inventory_initial: "Stock inicial",
  expense_payment: "Pago de gasto",
  expense_void: "Anulación de gasto",
  service_charge_payment: "Cobro de servicio",
}

export function formatAccountingSourceType(sourceType: string): string {
  return ACCOUNTING_SOURCE_TYPE_LABELS[sourceType] ?? sourceType
}
