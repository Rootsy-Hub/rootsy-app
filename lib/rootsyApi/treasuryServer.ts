import "server-only"

import type { TreasuryPeriodReportData } from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import { rootsyApiFetch } from "@/lib/rootsyApi/server"

export async function fetchTreasuryPeriodReportServer(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  | { success: true; data: TreasuryPeriodReportData }
  | { success: false; error: string }
> {
  const params = new URLSearchParams()
  if (from) params.set("from", from)
  if (to) params.set("to", to)
  const qs = params.toString()
  return rootsyApiFetch<
    | { success: true; data: TreasuryPeriodReportData }
    | { success: false; error: string }
  >(`/v1/pops/${popId}/treasury/period${qs ? `?${qs}` : ""}`)
}
