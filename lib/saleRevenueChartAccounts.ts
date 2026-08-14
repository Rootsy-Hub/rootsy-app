import { ARG_V3_CHART_CODE } from "@/lib/argV3DefaultChartAccounts"
import type { CashRegisterSaleChannel } from "@/lib/cashRegisterSaleContextLabels"

/** Ingresos por venta directa (comercio / POS). */
export const CHART_VENTAS_POS_CODES: readonly string[] = [
  ARG_V3_CHART_CODE.ventas,
]

/** Ingresos por ventas en mesas. */
export const CHART_VENTAS_MESAS_CODES: readonly string[] = [
  "4.1.1.03",
  ARG_V3_CHART_CODE.ventas,
]

/** Ingresos por ventas en mostrador. */
export const CHART_VENTAS_MOSTRADOR_CODES: readonly string[] = [
  "4.1.1.04",
  ARG_V3_CHART_CODE.ventas,
]

/** Ingresos por cobros de servicios. */
export const CHART_VENTAS_SERVICIOS_CODES: readonly string[] = [
  "4.1.1.02",
  ARG_V3_CHART_CODE.ventas,
]

/** Cuenta genérica histórica usada antes de separar por canal. */
export const CHART_VENTAS_LEGACY_GENERIC_CODES: readonly string[] = [
  ARG_V3_CHART_CODE.ventas,
]

export function chartVentasCodesForSaleChannel(
  channel: CashRegisterSaleChannel,
): readonly string[] {
  if (channel === "table") return CHART_VENTAS_MESAS_CODES
  if (channel === "counter") return CHART_VENTAS_MOSTRADOR_CODES
  return CHART_VENTAS_POS_CODES
}
