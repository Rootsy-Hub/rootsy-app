import type { CurrentAccountOpenDocument } from "@/app/[siteId]/[popId]/current-accounts/actions"
import { formatMoneyInputForField, parseMoneyInput } from "@/lib/moneyInput"

export type CurrentAccountSettleDraft = {
  paidAt: string
  extraAmount: string
  notes: string
  selectedIds: string[]
  amounts: Record<string, string>
}

function todayIso(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
}

export function emptyCurrentAccountSettleDraft(): CurrentAccountSettleDraft {
  return {
    paidAt: todayIso(),
    extraAmount: "",
    notes: "",
    selectedIds: [],
    amounts: {},
  }
}

export function initCurrentAccountSettleDraft(
  documents: CurrentAccountOpenDocument[],
): CurrentAccountSettleDraft {
  const amounts: Record<string, string> = {}
  const selectedIds: string[] = []
  for (const document of documents) {
    if (document.remaining <= 0.009) continue
    selectedIds.push(document.id)
    amounts[document.id] = formatMoneyInputForField(document.remaining)
  }
  return {
    paidAt: todayIso(),
    extraAmount: "",
    notes: "",
    selectedIds,
    amounts,
  }
}

export function currentAccountSettleTotals(
  draft: CurrentAccountSettleDraft,
  documents: CurrentAccountOpenDocument[] = [],
): {
  applied: number
  extra: number
  total: number
} {
  const remainingById = new Map(
    documents.map((document) => [document.id, document.remaining]),
  )
  const selected = new Set(draft.selectedIds)
  let applied = 0
  for (const [documentId, raw] of Object.entries(draft.amounts)) {
    if (!selected.has(documentId)) continue
    const remaining = remainingById.get(documentId) ?? 0
    const amount = Math.min(parseMoneyInput(raw, 0), remaining)
    applied = Math.round((applied + amount) * 100) / 100
  }
  const extra = parseMoneyInput(draft.extraAmount, 0)
  return {
    applied,
    extra,
    total: Math.round((applied + extra) * 100) / 100,
  }
}
