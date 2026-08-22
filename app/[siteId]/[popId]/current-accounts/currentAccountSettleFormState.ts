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

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

export function currentAccountSettleTotals(
  draft: CurrentAccountSettleDraft,
  documents: CurrentAccountOpenDocument[] = [],
): {
  applied: number
  extra: number
  surplus: number
  onAccount: number
  total: number
} {
  const remainingById = new Map(
    documents.map((document) => [document.id, document.remaining]),
  )
  const selected = new Set(draft.selectedIds)
  let applied = 0
  let surplus = 0
  for (const [documentId, raw] of Object.entries(draft.amounts)) {
    if (!selected.has(documentId)) continue
    const remaining = remainingById.get(documentId) ?? 0
    const typed = parseMoneyInput(raw, 0)
    applied = roundMoney(applied + Math.min(typed, remaining))
    surplus = roundMoney(surplus + Math.max(0, typed - remaining))
  }
  const extra = parseMoneyInput(draft.extraAmount, 0)
  const onAccount = roundMoney(extra + surplus)
  return {
    applied,
    extra,
    surplus,
    onAccount,
    total: roundMoney(applied + onAccount),
  }
}

/** El excedente sobre un comprobante pasa a cuenta. */
export function normalizeCurrentAccountSettleDraft(
  draft: CurrentAccountSettleDraft,
  documents: CurrentAccountOpenDocument[],
): CurrentAccountSettleDraft {
  const remainingById = new Map(
    documents.map((document) => [document.id, document.remaining]),
  )
  const selected = new Set(draft.selectedIds)
  const amounts = { ...draft.amounts }
  let surplus = 0
  for (const documentId of selected) {
    const remaining = remainingById.get(documentId) ?? 0
    const typed = parseMoneyInput(amounts[documentId] ?? "", 0)
    if (typed > remaining + 0.009) {
      surplus = roundMoney(surplus + (typed - remaining))
    }
    amounts[documentId] =
      remaining > 0.009 ? formatMoneyInputForField(Math.min(typed, remaining)) : ""
  }
  const extra = roundMoney(parseMoneyInput(draft.extraAmount, 0) + surplus)
  return {
    ...draft,
    amounts,
    extraAmount: extra > 0.009 ? formatMoneyInputForField(extra) : "",
  }
}
