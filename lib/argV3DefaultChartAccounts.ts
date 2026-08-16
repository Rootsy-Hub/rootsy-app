/**
 * Plan de cuentas modelo Argentina (`demo_seed` arg_v3) insertado por
 * `public.ensure_pop_arg_v3_chart_accounts` al crear un POP (trigger en `pops`).
 * Mantener sincronizado con `supabase/migrations/*_pop_arg_v3_chart_seed.sql`.
 */
export type ArgV3ChartAccountType =
  | "activo_corriente"
  | "activo_no_corriente"
  | "pasivo_corriente"
  | "pasivo_no_corriente"
  | "patrimonio_neto"
  | "ingresos"
  | "costos"
  | "gastos"

export type ArgV3ChartNature = "deudora" | "acreedora"

export type ArgV3DefaultChartRow = {
  code: string
  name: string
  accountType: ArgV3ChartAccountType
  nature: ArgV3ChartNature
  level: number
}

export const ARG_V3_DEFAULT_CHART_ACCOUNTS: readonly ArgV3DefaultChartRow[] = [
  { code: "1.1.1.01", name: "Caja", accountType: "activo_corriente", nature: "deudora", level: 4 },
  { code: "1.1.1.02", name: "Bancos", accountType: "activo_corriente", nature: "deudora", level: 4 },
  {
    code: "1.1.1.03",
    name: "Tarjetas y plataformas a liquidar",
    accountType: "activo_corriente",
    nature: "deudora",
    level: 4,
  },
  { code: "1.1.1.04", name: "Otros cobros", accountType: "activo_corriente", nature: "deudora", level: 4 },
  { code: "1.1.2.01", name: "Cuentas por Cobrar", accountType: "activo_corriente", nature: "deudora", level: 4 },
  {
    code: "1.1.2.02",
    name: "Documentos por Cobrar",
    accountType: "activo_corriente",
    nature: "deudora",
    level: 4,
  },
  {
    code: "1.1.2.03",
    name: "Créditos fiscales IVA",
    accountType: "activo_corriente",
    nature: "deudora",
    level: 4,
  },
  { code: "1.1.3.01", name: "Mercaderías", accountType: "activo_corriente", nature: "deudora", level: 4 },
  {
    code: "1.1.3.02",
    name: "Productos Terminados",
    accountType: "activo_corriente",
    nature: "deudora",
    level: 4,
  },
  { code: "1.1.3.03", name: "Materias Primas", accountType: "activo_corriente", nature: "deudora", level: 4 },
  { code: "1.1.3.04", name: "Insumos", accountType: "activo_corriente", nature: "deudora", level: 4 },
  { code: "1.2.1.01", name: "Bienes de uso", accountType: "activo_no_corriente", nature: "deudora", level: 4 },
  {
    code: "1.2.1.02",
    name: "Amortización acumulada",
    accountType: "activo_no_corriente",
    nature: "acreedora",
    level: 4,
  },
  { code: "2.1.1.01", name: "Proveedores", accountType: "pasivo_corriente", nature: "acreedora", level: 4 },
  {
    code: "2.1.1.02",
    name: "Documentos a Pagar",
    accountType: "pasivo_corriente",
    nature: "acreedora",
    level: 4,
  },
  {
    code: "2.1.1.03",
    name: "Tarjetas de crédito a pagar",
    accountType: "pasivo_corriente",
    nature: "acreedora",
    level: 4,
  },
  { code: "2.1.2.01", name: "IVA a Pagar", accountType: "pasivo_corriente", nature: "acreedora", level: 4 },
  {
    code: "2.1.2.02",
    name: "Impuestos y retenciones a pagar",
    accountType: "pasivo_corriente",
    nature: "acreedora",
    level: 4,
  },
  {
    code: "2.1.2.03",
    name: "Cargas sociales a pagar",
    accountType: "pasivo_corriente",
    nature: "acreedora",
    level: 4,
  },
  {
    code: "2.2.1.01",
    name: "Préstamos bancarios",
    accountType: "pasivo_no_corriente",
    nature: "acreedora",
    level: 4,
  },
  { code: "3.1.1.01", name: "Capital social", accountType: "patrimonio_neto", nature: "acreedora", level: 4 },
  {
    code: "3.2.1.01",
    name: "Resultados no asignados",
    accountType: "patrimonio_neto",
    nature: "acreedora",
    level: 4,
  },
  {
    code: "3.2.1.02",
    name: "Ajuste por inventario inicial",
    accountType: "patrimonio_neto",
    nature: "acreedora",
    level: 4,
  },
  {
    code: "4.1.1.01",
    name: "Ventas — comercio",
    accountType: "ingresos",
    nature: "acreedora",
    level: 4,
  },
  {
    code: "4.1.1.02",
    name: "Ventas — servicios",
    accountType: "ingresos",
    nature: "acreedora",
    level: 4,
  },
  {
    code: "4.1.1.03",
    name: "Ventas — mesas",
    accountType: "ingresos",
    nature: "acreedora",
    level: 4,
  },
  {
    code: "4.1.1.04",
    name: "Ventas — mostrador",
    accountType: "ingresos",
    nature: "acreedora",
    level: 4,
  },
  { code: "4.2.1.01", name: "Otros ingresos", accountType: "ingresos", nature: "acreedora", level: 4 },
  { code: "5.1.1.01", name: "Costo de ventas", accountType: "costos", nature: "deudora", level: 4 },
  { code: "5.2.1.01", name: "Costo de producción", accountType: "costos", nature: "deudora", level: 4 },
  { code: "6.1.1.01", name: "Alquileres", accountType: "gastos", nature: "deudora", level: 4 },
  { code: "6.1.1.02", name: "Servicios públicos", accountType: "gastos", nature: "deudora", level: 4 },
  {
    code: "6.1.1.03",
    name: "Sueldos y cargas sociales",
    accountType: "gastos",
    nature: "deudora",
    level: 4,
  },
  {
    code: "6.1.1.04",
    name: "Honorarios profesionales",
    accountType: "gastos",
    nature: "deudora",
    level: 4,
  },
  {
    code: "6.1.1.05",
    name: "Diferencias de arqueo de caja",
    accountType: "gastos",
    nature: "deudora",
    level: 4,
  },
  {
    code: "6.2.1.01",
    name: "Publicidad y marketing",
    accountType: "gastos",
    nature: "deudora",
    level: 4,
  },
  {
    code: "6.2.1.02",
    name: "Comisiones y gastos comerciales",
    accountType: "gastos",
    nature: "deudora",
    level: 4,
  },
  {
    code: "6.2.1.03",
    name: "Mermas y pérdidas de inventario",
    accountType: "gastos",
    nature: "deudora",
    level: 4,
  },
  {
    code: "6.2.1.99",
    name: "Gastos generales",
    accountType: "gastos",
    nature: "deudora",
    level: 4,
  },
  {
    code: "6.3.1.01",
    name: "Intereses y gastos financieros",
    accountType: "gastos",
    nature: "deudora",
    level: 4,
  },
] as const

export const ARG_V3_CHART_CODE = {
  mercaderiasPrimary: "1.1.3.01",
  mercaderiasAlt: ["1.1.3.02", "1.1.3.03"] as const,
  otrosIngresos: "4.2.1.01",
  ventas: "4.1.1.01",
  mermasInventario: "6.2.1.03",
} as const

export const CHART_MERCADERIAS_CODES: readonly string[] = [
  ARG_V3_CHART_CODE.mercaderiasPrimary,
  ...ARG_V3_CHART_CODE.mercaderiasAlt,
]

export const CHART_INGRESO_AJUSTE_CODES: readonly string[] = [
  ARG_V3_CHART_CODE.otrosIngresos,
  ARG_V3_CHART_CODE.ventas,
]

/** Contrapartida de stock inicial (saldo de apertura, no ingreso del período). */
export const CHART_INVENTARIO_INICIAL_PATRIMONIO_CODES: readonly string[] = [
  "3.2.1.02",
  "3.2.1.01",
]

export const CHART_GASTO_MERMA_CODES: readonly string[] = [
  ARG_V3_CHART_CODE.mermasInventario,
  "6.2.1.02",
  "6.1.1.01",
]

export const CHART_IVA_PAGAR_CODES: readonly string[] = ["2.1.2.01"]

export const CHART_COSTO_VENTAS_CODES: readonly string[] = ["5.1.1.01"]

/** Fallback genérico cuando no hay cuenta por canal (POPs viejos). */
export const CHART_VENTAS_GRAVADAS_CODES: readonly string[] = [
  ARG_V3_CHART_CODE.ventas,
  "4.1.1.03",
  "4.1.1.04",
  "4.1.1.02",
]

/** Faltante de caja (gasto); fallback si el plan viejo no tiene 6.1.1.05. */
export const CHART_DIFERENCIA_ARQUEO_GASTO_CODES: readonly string[] = [
  "6.1.1.05",
  "6.2.1.02",
  "6.2.1.03",
]

/** Sobrante de caja (otros ingresos). */
export const CHART_ARQUEO_SOBRANTE_INGRESO_CODES: readonly string[] = [
  "4.2.1.01",
  "4.1.1.01",
]

export const CHART_CAJA_EFECTIVO_CODES: readonly string[] = ["1.1.1.01"]

/**
 * Categorías creadas por el usuario (no sistema): todo imputa aquí.
 * 6.2.1.99 nombre alineado al plan; si un POP viejo no la tiene, se prean alternativas.
 */
export const CHART_GASTOS_GENERALES_CODES: readonly string[] = [
  "6.2.1.99",
  "6.2.1.02",
  "6.2.1.01",
]

/** Intereses, mantenimiento e impuestos del resumen de tarjeta. */
export const CHART_GASTOS_FINANCIEROS_CODES: readonly string[] = [
  "6.3.1.01",
  ...CHART_GASTOS_GENERALES_CODES,
]

/** Comisiones e impuestos de liquidación POS. */
export const CHART_GASTOS_COMERCIALES_CODES: readonly string[] = [
  "6.2.1.02",
  "6.3.1.01",
  ...CHART_GASTOS_GENERALES_CODES,
]

export const CHART_PROVEEDORES_CODES: readonly string[] = [
  "2.1.1.01",
  "2.1.1.02",
]

/** Pasivo: saldo en cuenta corriente con proveedores (sin documentos ni tarjetas). */
export const CHART_PROVEEDORES_CC_CODES: readonly string[] = ["2.1.1.01"]

/** Activo: cheques y documentos de terceros pendientes de cobro. */
export const CHART_DOCUMENTOS_POR_COBRAR_CODES: readonly string[] = ["1.1.2.02"]

/** Pasivo: cheques y documentos emitidos pendientes de pago. */
export const CHART_DOCUMENTOS_A_PAGAR_CODES: readonly string[] = ["2.1.1.02"]

/** Pasivo: deuda con emisor de tarjeta corporativa (compras/gastos con crédito). */
export const CHART_TARJETAS_CREDITO_A_PAGAR_CODES: readonly string[] = [
  "2.1.1.03",
  "2.1.1.02",
]

/** Activo: cobros con tarjeta / plataformas por liquidar (ventas POS). */
export const CHART_CUENTAS_POR_COBRAR_CODES: readonly string[] = ["1.1.2.01"]

export const CHART_TARJETAS_COBRAR_CODES: readonly string[] = [
  "1.1.1.03",
  "1.1.1.04",
]

export const CHART_IVA_CREDITO_CODES: readonly string[] = ["1.1.2.03"]

export const CHART_MATERIAS_PRIMAS_CODES: readonly string[] = [
  "1.1.3.03",
  "1.1.3.02",
]

export const CHART_INSUMOS_CODES: readonly string[] = [
  "1.1.3.04",
  "1.1.3.03",
]

/** @deprecated Preferir CHART_GASTOS_GENERALES_CODES o mapeo por categoría sistema. */
export const CHART_EXPENSE_GENERIC_FALLBACK_CODES: readonly string[] =
  CHART_GASTOS_GENERALES_CODES
