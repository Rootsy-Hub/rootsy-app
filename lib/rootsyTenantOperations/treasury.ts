import { createServiceRoleClient } from "@/utils/supabase/service-role"
import { fetchTreasuryPaymentContext } from "@/lib/treasuryPaymentContextLoad"
import { requireRootsyPlatformPopId } from "@/lib/rootsyPlatformPop"

export async function resolveMercadoPagoTreasuryAccountId(): Promise<
  string | null
> {
  const popId = await requireRootsyPlatformPopId()
  const supabase = createServiceRoleClient()
  const context = await fetchTreasuryPaymentContext(supabase, popId)
  if (!context.success) {
    return null
  }

  const { bankTreasuryAccounts, posTreasuryAccounts, defaultCashTreasuryAccountId } =
    context.context

  if (bankTreasuryAccounts[0]?.id) {
    return bankTreasuryAccounts[0].id
  }
  if (posTreasuryAccounts[0]?.id) {
    return posTreasuryAccounts[0].id
  }
  return defaultCashTreasuryAccountId
}
