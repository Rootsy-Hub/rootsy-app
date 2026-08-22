import type {
  CashRegistersPeriodReportData,
} from "@/app/[siteId]/[popId]/cash-registers/actions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

export type CashRegistersPeriodTotals = {
  registerCount: number
  closedCount: number
  totalCobrado: number
  netDifference: number
  sessionsWithVariance: number
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

export async function fetchCashRegistersPeriodTotals(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  | { success: true; data: CashRegistersPeriodTotals }
  | { success: false; error: string }
> {
  return getJson<CashRegistersPeriodTotals>(
    `/api/pops/${popId}/cash-registers/period/totals?${periodSearch(from, to)}`,
  )
}

export async function fetchCashRegistersPeriodReport(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  | { success: true; data: CashRegistersPeriodReportData }
  | { success: false; error: string }
> {
  return getJson<CashRegistersPeriodReportData>(
    `/api/pops/${popId}/cash-registers/period?${periodSearch(from, to)}`,
  )
}
