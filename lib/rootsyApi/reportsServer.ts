import "server-only"

import type { IncomeStatementResult } from "@/app/[siteId]/[popId]/reports/accountingActions"
import { rootsyApiFetch } from "@/lib/rootsyApi/server"

function periodSearch(from: string | null, to: string | null): string {
  const params = new URLSearchParams()
  if (from) params.set("from", from)
  if (to) params.set("to", to)
  return params.toString()
}

export async function fetchAccountingIncomeStatementServer(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  | { success: true; data: IncomeStatementResult }
  | { success: false; error: string }
> {
  const qs = periodSearch(from, to)
  return rootsyApiFetch(
    `/v1/pops/${popId}/reports/income-statement${qs ? `?${qs}` : ""}`,
  )
}
