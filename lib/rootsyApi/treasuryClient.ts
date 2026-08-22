import type { TreasuryPeriodReportData } from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

export type TreasuryPeriodTotals = {
  accountCount: number
  closingBalance: number
  periodIn: number
  periodOut: number
}

function periodSearch(from: string | null, to: string | null): string {
  const params = new URLSearchParams()
  if (from) params.set("from", from)
  if (to) params.set("to", to)
  return params.toString()
}

async function getJson<T>(
  path: string,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const res = await fetch(path, { headers: { accept: "application/json" } })
  const json = (await res.json().catch(() => null)) as ApiOk<T> | ApiErr | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, data: json.data }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchTreasuryPeriodTotals(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  { success: true; data: TreasuryPeriodTotals } | { success: false; error: string }
> {
  return getJson<TreasuryPeriodTotals>(
    `/api/pops/${popId}/treasury/period/totals?${periodSearch(from, to)}`,
  )
}

export async function fetchTreasuryPeriodReport(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  | { success: true; data: TreasuryPeriodReportData }
  | { success: false; error: string }
> {
  return getJson<TreasuryPeriodReportData>(
    `/api/pops/${popId}/treasury/period?${periodSearch(from, to)}`,
  )
}
