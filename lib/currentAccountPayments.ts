import type { SupabaseClient } from "@supabase/supabase-js"

const PAYMENT_TABLES = [
  "sale_payments",
  "purchase_payments",
  "expense_payments",
  "service_charge_payments",
] as const

/** Deja de imputar el cobro/pago del cheque para reabrir la venta o compra. */
export async function reversePaymentsLinkedToCheck(
  supabase: SupabaseClient,
  popId: string,
  checkId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const reversedAt = new Date().toISOString()
  for (const table of PAYMENT_TABLES) {
    const { error } = await supabase
      .from(table)
      .update({ reversed_at: reversedAt })
      .eq("pop_id", popId)
      .eq("check_id", checkId)
      .is("reversed_at", null)
    if (error) {
      return {
        success: false,
        error: error.message || "No se pudo reabrir el comprobante del cheque.",
      }
    }
  }

  const { error: receiptErr } = await supabase
    .from("current_account_receipts")
    .delete()
    .eq("pop_id", popId)
    .eq("check_id", checkId)
  if (receiptErr) {
    return {
      success: false,
      error:
        receiptErr.message ||
        "No se pudo reabrir el comprobante de cuenta corriente.",
    }
  }

  return { success: true }
}
