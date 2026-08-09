"use server"

import { validatePopAccess } from "@/lib/popHelpers"
import { fetchTreasuryPaymentContext } from "@/lib/treasuryPaymentContextLoad"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import { createClient } from "@/utils/supabase/server"

export type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"

export async function getTreasuryPaymentContext(
  popId: string,
): Promise<
  | { success: true; context: TreasuryPaymentContext }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const supabase = await createClient()
    return fetchTreasuryPaymentContext(supabase, popId)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
