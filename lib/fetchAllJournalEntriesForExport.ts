import type { JournalEntrySummaryRow } from "@/app/[siteId]/[popId]/reports/accountingActions"
import {
  fetchAccountingJournalEntries,
  fetchAccountingJournalTotals,
} from "@/lib/rootsyApi/reportsClient"

const JOURNAL_EXPORT_PAGE_SIZE = 100

export async function fetchAllJournalEntriesForExport(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  | {
      success: true
      entries: JournalEntrySummaryRow[]
      totalDebit: number
      totalCredit: number
    }
  | { success: false; error: string }
> {
  const entries: JournalEntrySummaryRow[] = []
  let page = 1
  let totalDebit = 0
  let totalCredit = 0

  const totals = await fetchAccountingJournalTotals(popId, from, to)
  if (!totals.success) return totals
  totalDebit = totals.periodTotalDebit
  totalCredit = totals.periodTotalCredit

  while (true) {
    const res = await fetchAccountingJournalEntries(popId, from, to, {
      page,
      pageSize: JOURNAL_EXPORT_PAGE_SIZE,
    })
    if (!res.success) {
      return res
    }

    entries.push(...res.entries)

    if (!res.hasMore) {
      break
    }

    page += 1
  }

  return { success: true, entries, totalDebit, totalCredit }
}
