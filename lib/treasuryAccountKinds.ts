export type TreasuryAccountKind =
  | "cash"
  | "bank"
  | "wallet"
  | "card_payable"
  | "check_receivable"
  | "check_payable"
  | "other"

export const TREASURY_ACCOUNT_KINDS: {
  value: TreasuryAccountKind
  label: string
  description: string
}[] = [
  {
    value: "cash",
    label: "Efectivo",
    description: "Caja, mostrador o caja chica",
  },
  {
    value: "bank",
    label: "Banco",
    description: "Cuenta corriente o caja de ahorro",
  },
  {
    value: "wallet",
    label: "Billetera / PSP",
    description: "Mercado Pago, MODO, etc.",
  },
  {
    value: "card_payable",
    label: "Tarjeta corporativa",
    description: "Pasivo: resumen a pagar al banco",
  },
  {
    value: "check_receivable",
    label: "Cheques en cartera",
    description: "Documentos por cobrar pendientes de depósito",
  },
  {
    value: "check_payable",
    label: "Cheques a pagar",
    description: "Documentos emitidos pendientes de débito",
  },
  {
    value: "other",
    label: "Otro",
    description: "Otra cuenta de tesorería",
  },
]

/** Código padre en el plan contable para crear subcuentas. */
export const TREASURY_KIND_PARENT_CHART_CODE: Record<
  TreasuryAccountKind,
  string
> = {
  cash: "1.1.1.01",
  bank: "1.1.1.02",
  wallet: "1.1.1.04",
  card_payable: "2.1.1.03",
  check_receivable: "1.1.2.02",
  check_payable: "2.1.1.02",
  other: "1.1.1.04",
}

export function treasuryKindLabel(kind: TreasuryAccountKind | string): string {
  return (
    TREASURY_ACCOUNT_KINDS.find((k) => k.value === kind)?.label ?? "Cuenta"
  )
}

export function isTreasuryAccountKind(
  value: string,
): value is TreasuryAccountKind {
  return TREASURY_ACCOUNT_KINDS.some((k) => k.value === value)
}

export function isCheckTreasuryKind(
  kind: TreasuryAccountKind | string,
): boolean {
  return kind === "check_receivable" || kind === "check_payable"
}

/** Kinds que no se crean ni editan desde el alta de Cuentas. */
export function isSystemManagedTreasuryKind(
  kind: TreasuryAccountKind | string,
): boolean {
  return (
    kind === "card_payable" ||
    kind === "check_receivable" ||
    kind === "check_payable"
  )
}

/** Prefijos de subcuentas con saldo real (cuentas madre en la UI). */
export const TREASURY_MOTHER_CHART_PREFIXES = [
  "1.1.1.01.",
  "1.1.1.02.",
  "1.1.1.04.",
] as const

/** Cuenta operativa con saldo real (caja, banco, billetera). Excluye a liquidar y tarjetas a pagar. */
export function isMotherTreasuryAccount(chartAccountCode: string): boolean {
  const code = chartAccountCode.trim()
  if (!code) return false
  return TREASURY_MOTHER_CHART_PREFIXES.some((prefix) => code.startsWith(prefix))
}

/** Subcuenta de cobros pendientes de liquidación (1.1.1.03.xx). */
export function isSettlementReceivableChartCode(chartAccountCode: string): boolean {
  const code = chartAccountCode.trim()
  return code.startsWith("1.1.1.03.") && code !== "1.1.1.03"
}

/** Subcuenta de tarjeta / pasivo a pagar (2.1.1.03.xx). */
export function isCardPayableChartCode(chartAccountCode: string): boolean {
  const code = chartAccountCode.trim()
  return code.startsWith("2.1.1.03.") && code !== "2.1.1.03"
}
