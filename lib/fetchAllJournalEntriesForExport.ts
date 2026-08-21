import {
  getAccountingJournalEntries,
  type JournalEntrySummaryRow,
} from "@/app/[siteId]/[popId]/reports/accountingActions"

const JOURNAL_EXPORT_PAGE_SIZE = 200

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
  let offset = 0
  let totalDebit = 0
  let totalCredit = 0

  while (true) {
    const res = await getAccountingJournalEntries(popId, from, to, {
      limit: JOURNAL_EXPORT_PAGE_SIZE,
      offset,
    })
    if (!res.success) {
      return res
    }

    if (offset === 0) {
      totalDebit = res.periodTotalDebit ?? 0
      totalCredit = res.periodTotalCredit ?? 0
    }

    entries.push(...res.entries)

    if (!res.hasMore) {
      break
    }

    offset += res.entries.length
  }

  return { success: true, entries, totalDebit, totalCredit }
}
