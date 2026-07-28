import { roundSaleMoney } from "@/lib/saleLineDiscount"

export type GeneralDiscountSnapshot = {
  modoDescuento: "porcentaje" | "fijo"
  valorDescuentoPorcentaje: number
  valorDescuentoFijo: number
  descuentoGeneralBloqueado?: boolean
  /** Campos legacy del bloqueo anterior (monto fijo congelado). */
  subtotalBaseDescuentoGeneral?: number
  descuentoGeneralTotalFijo?: number
}

export function isGeneralDiscountEditBlocked(input: {
  descuentoGeneralBloqueado: boolean
}): boolean {
  return input.descuentoGeneralBloqueado
}

export function computeGeneralDiscountMonto(input: {
  subtotal: number
  modoDescuento: "porcentaje" | "fijo"
  valorDescuentoPorcentaje: number
  valorDescuentoFijo: number
}): number {
  if (input.subtotal <= 0) return 0
  if (input.modoDescuento === "porcentaje") {
    return roundSaleMoney(
      input.subtotal * (input.valorDescuentoPorcentaje / 100),
    )
  }
  return roundSaleMoney(Math.min(input.valorDescuentoFijo, input.subtotal))
}

/** Restaura % original si el checkout quedó congelado como monto fijo (versión anterior). */
export function healLegacyLockedGeneralDiscount<T extends GeneralDiscountSnapshot>(
  snap: T,
): T {
  if (!snap.descuentoGeneralBloqueado) return snap
  if (snap.modoDescuento === "porcentaje" && snap.valorDescuentoPorcentaje > 0) {
    return snap
  }

  const base = snap.subtotalBaseDescuentoGeneral ?? 0
  const legacyTotal = snap.descuentoGeneralTotalFijo ?? 0
  if (base <= 0 || legacyTotal <= 0) return snap

  const pctRaw = (legacyTotal / base) * 100
  const pct =
    Math.abs(pctRaw - Math.round(pctRaw)) < 0.01
      ? Math.round(pctRaw)
      : roundSaleMoney(pctRaw)

  return {
    ...snap,
    modoDescuento: "porcentaje",
    valorDescuentoPorcentaje: pct,
    valorDescuentoFijo: 0,
  }
}

export function generalDiscountToolbarLabel(input: {
  hayDescuento: boolean
  modoDescuento: "porcentaje" | "fijo"
  valorDescuentoPorcentaje: number
  valorDescuentoFijo: number
  formatFijo: (value: number) => string
}): string {
  if (!input.hayDescuento) return "Sin descuento"
  if (input.modoDescuento === "porcentaje") {
    return `${input.valorDescuentoPorcentaje}%`
  }
  return `Fijo ${input.formatFijo(input.valorDescuentoFijo)}`
}
