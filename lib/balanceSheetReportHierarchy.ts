import type {
  BalanceSheetResult,
  BalanceSheetSectionRow,
} from "@/app/[siteId]/[popId]/reports/accountingActions"
import { labelForAccountingCodePrefix } from "@/lib/accountingPlanGroupLabels"

export type BalanceSheetSectionKey = "activo" | "pasivo" | "patrimonio"

export type BalanceSheetDisplayRow =
  | {
      kind: "section-header"
      section: BalanceSheetSectionKey
      label: string
    }
  | {
      kind: "group-header"
      section: BalanceSheetSectionKey
      prefix: string
      label: string
      total: number
    }
  | {
      kind: "account"
      section: BalanceSheetSectionKey
      line: BalanceSheetSectionRow
    }
  | {
      kind: "section-total"
      section: BalanceSheetSectionKey
      label: string
      total: number
    }
  | {
      kind: "balance-equation"
      totalActivo: number
      totalPasivoPatrimonioYResultado: number
      diferenciaCuadre: number
    }

const SECTION_TOTAL_LABELS: Record<BalanceSheetSectionKey, string> = {
  activo: "Total activo",
  pasivo: "Total pasivo",
  patrimonio: "Total patrimonio neto",
}

function accountGroupPrefix(code: string): string | null {
  if (code.trim() === "—") return null
  const parts = code.trim().split(".").filter(Boolean)
  if (parts.length >= 3) return `${parts[0]}.${parts[1]}.${parts[2]}`
  if (parts.length >= 2) return `${parts[0]}.${parts[1]}`
  return parts[0] ?? null
}

function groupLabel(prefix: string, lines: BalanceSheetSectionRow[]): string {
  const known = labelForAccountingCodePrefix(prefix)
  if (known) return known
  if (lines.length === 1) return lines[0]!.accountName
  return `Rubro ${prefix}`
}

function buildSectionRows(
  section: BalanceSheetSectionKey,
  label: string,
  lines: BalanceSheetSectionRow[],
  total: number,
): BalanceSheetDisplayRow[] {
  if (lines.length === 0) return []

  const rows: BalanceSheetDisplayRow[] = [
    { kind: "section-header", section, label },
  ]

  const sorted = [...lines].sort((a, b) => {
    if (a.accountCode === "—") return 1
    if (b.accountCode === "—") return -1
    return a.accountCode.localeCompare(b.accountCode, undefined, { numeric: true })
  })

  const ungrouped: BalanceSheetSectionRow[] = []
  const groups = new Map<string, BalanceSheetSectionRow[]>()

  for (const line of sorted) {
    const prefix = accountGroupPrefix(line.accountCode)
    if (!prefix) {
      ungrouped.push(line)
      continue
    }
    const bucket = groups.get(prefix) ?? []
    bucket.push(line)
    groups.set(prefix, bucket)
  }

  const groupEntries = [...groups.entries()].sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true }),
  )

  const showGroupHeaders =
    groupEntries.length > 1 ||
    groupEntries.some(([, groupLines]) => groupLines.length > 1)

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

  for (const line of ungrouped) {
    rows.push({ kind: "account", section, line })
  }

  rows.push({
    kind: "section-total",
    section,
    label: SECTION_TOTAL_LABELS[section],
    total,
  })

  return rows
}

export function buildBalanceSheetDisplayRows(
  data: BalanceSheetResult,
): BalanceSheetDisplayRow[] {
  const rows: BalanceSheetDisplayRow[] = []

  for (const section of data.sections) {
    rows.push(
      ...buildSectionRows(section.key, section.title, section.rows, section.sectionTotal),
    )
  }

  rows.push({
    kind: "balance-equation",
    totalActivo: data.totalActivo,
    totalPasivoPatrimonioYResultado: data.totalPasivoPatrimonioYResultado,
    diferenciaCuadre: data.diferenciaCuadre,
  })

  return rows
}

export function hasBalanceSheetMovement(data: BalanceSheetResult): boolean {
  return data.sections.some((section) => section.rows.length > 0)
}
