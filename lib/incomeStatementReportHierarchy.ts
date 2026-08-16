import type { IncomeStatementLine } from "@/app/[siteId]/[popId]/accounting/actions"

export type IncomeStatementSectionKey = "ingresos" | "costos" | "gastos"

export type IncomeStatementDisplayRow =
  | {
      kind: "section-header"
      section: IncomeStatementSectionKey
      label: string
    }
  | {
      kind: "group-header"
      section: IncomeStatementSectionKey
      prefix: string
      label: string
      total: number
    }
  | {
      kind: "account"
      section: IncomeStatementSectionKey
      line: IncomeStatementLine
    }
  | {
      kind: "section-total"
      section: IncomeStatementSectionKey
      label: string
      total: number
    }
  | {
      kind: "result-total"
      label: string
      total: number
    }

const INCOME_STATEMENT_GROUP_LABELS: Record<string, string> = {
  "4.1": "Ventas",
  "4.2": "Otros ingresos",
  "5.1": "Costo de ventas",
  "5.2": "Costo de producción",
  "6.1": "Gastos operativos",
  "6.2": "Gastos comerciales",
  "6.3": "Gastos financieros",
}

const SECTION_CONFIG: Array<{
  key: IncomeStatementSectionKey
  label: string
  totalLabel: string
  pick: (data: {
    ingresos: IncomeStatementLine[]
    costos: IncomeStatementLine[]
    gastos: IncomeStatementLine[]
    totalIngresos: number
    totalCostos: number
    totalGastos: number
  }) => { lines: IncomeStatementLine[]; total: number }
}> = [
  {
    key: "ingresos",
    label: "Ingresos",
    totalLabel: "Total ingresos",
    pick: (data) => ({ lines: data.ingresos, total: data.totalIngresos }),
  },
  {
    key: "costos",
    label: "Costos",
    totalLabel: "Total costos",
    pick: (data) => ({ lines: data.costos, total: data.totalCostos }),
  },
  {
    key: "gastos",
    label: "Gastos",
    totalLabel: "Total gastos",
    pick: (data) => ({ lines: data.gastos, total: data.totalGastos }),
  },
]

function accountGroupPrefix(code: string): string {
  const parts = code.trim().split(".").filter(Boolean)
  if (parts.length >= 2) return `${parts[0]}.${parts[1]}`
  return parts[0] ?? code
}

function groupLabel(prefix: string, lines: IncomeStatementLine[]): string {
  const known = INCOME_STATEMENT_GROUP_LABELS[prefix]
  if (known) return known
  if (lines.length === 1) return lines[0]!.accountName
  return `Rubro ${prefix}`
}

function buildSectionRows(
  section: IncomeStatementSectionKey,
  label: string,
  totalLabel: string,
  lines: IncomeStatementLine[],
  total: number,
): IncomeStatementDisplayRow[] {
  if (lines.length === 0) return []

  const rows: IncomeStatementDisplayRow[] = [
    { kind: "section-header", section, label },
  ]

  const sorted = [...lines].sort((a, b) =>
    a.accountCode.localeCompare(b.accountCode, undefined, { numeric: true }),
  )

  const groups = new Map<string, IncomeStatementLine[]>()
  for (const line of sorted) {
    const prefix = accountGroupPrefix(line.accountCode)
    const bucket = groups.get(prefix) ?? []
    bucket.push(line)
    groups.set(prefix, bucket)
  }

  const groupEntries = [...groups.entries()].sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true }),
  )

  const showGroupHeaders =
    groupEntries.length > 1 || groupEntries.some(([, groupLines]) => groupLines.length > 1)

  for (const [prefix, groupLines] of groupEntries) {
    const groupTotal = groupLines.reduce((sum, line) => sum + line.balance, 0)

    if (showGroupHeaders) {
      rows.push({
        kind: "group-header",
        section,
        prefix,
        label: groupLabel(prefix, groupLines),
        total: groupTotal,
      })
    }

    for (const line of groupLines) {
      rows.push({ kind: "account", section, line })
    }
  }

  rows.push({
    kind: "section-total",
    section,
    label: totalLabel,
    total,
  })

  return rows
}

export function buildIncomeStatementDisplayRows(data: {
  ingresos: IncomeStatementLine[]
  costos: IncomeStatementLine[]
  gastos: IncomeStatementLine[]
  totalIngresos: number
  totalCostos: number
  totalGastos: number
  resultadoNeto: number
}): IncomeStatementDisplayRow[] {
  const rows: IncomeStatementDisplayRow[] = []

  for (const section of SECTION_CONFIG) {
    const { lines, total } = section.pick(data)
    rows.push(
      ...buildSectionRows(section.key, section.label, section.totalLabel, lines, total),
    )
  }

  rows.push({
    kind: "result-total",
    label: "Resultado neto del período",
    total: data.resultadoNeto,
  })

  return rows
}

export function hasIncomeStatementMovement(data: {
  ingresos: IncomeStatementLine[]
  costos: IncomeStatementLine[]
  gastos: IncomeStatementLine[]
}): boolean {
  return data.ingresos.length > 0 || data.costos.length > 0 || data.gastos.length > 0
}
