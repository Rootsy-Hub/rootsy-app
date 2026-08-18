import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  CheckDirection,
  CheckSourceKind,
} from "@/lib/checkDocuments"

export type CheckoutCheckDetails = {
  checkNumber: string
  bankName: string
  issueDate: string
  dueDate: string
  partyName: string
  partyId: string
  notes: string
}

export type CheckoutCheckFlow =
  | "sale"
  | "purchase"
  | "service_charge"
  | "expense"

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function emptyCheckoutCheckDetails(): CheckoutCheckDetails {
  return {
    checkNumber: "",
    bankName: "",
    issueDate: "",
    dueDate: "",
    partyName: "",
    partyId: "",
    notes: "",
  }
}

export function checkoutCheckDirection(flow: CheckoutCheckFlow): CheckDirection {
  return flow === "purchase" || flow === "expense" ? "issued" : "received"
}

export function checkoutCheckSelectionLabel(
  details: CheckoutCheckDetails,
): string {
  const number = details.checkNumber.trim()
  const bank = details.bankName.trim()
  if (number && bank) return `Cheque ${number} · ${bank}`
  if (number) return `Cheque ${number}`
  return "Cheque"
}

export function parseCheckoutCheckDetails(
  input: unknown,
):
  | { ok: true; details: CheckoutCheckDetails }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Completá los datos del cheque." }
  }
  const raw = input as Record<string, unknown>
  const checkNumber = String(raw.checkNumber ?? "").trim()
  if (!checkNumber) {
    return { ok: false, error: "El número de cheque es obligatorio." }
  }
  const bankName = String(raw.bankName ?? "").trim()
  if (!bankName) {
    return { ok: false, error: "El banco es obligatorio." }
  }
  const issueDate = String(raw.issueDate ?? "").trim()
  const dueDate = String(raw.dueDate ?? "").trim()
  if (!isIsoDate(issueDate) || !isIsoDate(dueDate)) {
    return { ok: false, error: "Revisá las fechas de emisión y cobro." }
  }
  return {
    ok: true,
    details: {
      checkNumber,
      bankName,
      issueDate,
      dueDate,
      partyName: String(raw.partyName ?? "").trim(),
      partyId: String(raw.partyId ?? "").trim(),
      notes: String(raw.notes ?? "").trim(),
    },
  }
}

export async function resolveCheckTreasuryAccountId(
  supabase: SupabaseClient,
  popId: string,
  direction: CheckDirection,
): Promise<string | null> {
  const kind = direction === "issued" ? "check_payable" : "check_receivable"
  const { data } = await supabase
    .from("treasury_accounts")
    .select("id")
    .eq("pop_id", popId)
    .eq("kind", kind)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle()
  return data?.id ? String(data.id) : null
}

export async function insertCheckoutCheck(
  supabase: SupabaseClient,
  input: {
    popId: string
    userId: string
    direction: CheckDirection
    amount: number
    details: CheckoutCheckDetails
    sourceKind: CheckSourceKind
    sourceId?: string
  },
): Promise<{ success: true; checkId: string } | { success: false; error: string }> {
  const amount = Math.round(input.amount * 100) / 100
  if (!(amount > 0)) {
    return { success: false, error: "El importe del cheque tiene que ser mayor a cero." }
  }
  if (input.sourceKind !== "manual" && !input.sourceId) {
    return { success: false, error: "Falta el comprobante de origen del cheque." }
  }
  const partyId = input.details.partyId || null
  const partyName = input.details.partyName || null
  const { data, error } = await supabase
    .from("checks")
    .insert({
      pop_id: input.popId,
      direction: input.direction,
      check_number: input.details.checkNumber,
      bank_name: input.details.bankName,
      amount,
      issue_date: input.details.issueDate,
      due_date: input.details.dueDate,
      status: "in_portfolio",
      source_kind: input.sourceKind,
      source_id: input.sourceId || null,
      client_id: input.direction === "received" ? partyId : null,
      supplier_id: input.direction === "issued" ? partyId : null,
      drawer_name: input.direction === "received" ? partyName : null,
      payee_name: input.direction === "issued" ? partyName : null,
      notes: input.details.notes || null,
      created_by: input.userId,
    })
    .select("id")
    .single()
  if (error || !data?.id) {
    return {
      success: false,
      error: error?.message || "No se pudo registrar el cheque.",
    }
  }
  return { success: true, checkId: String(data.id) }
}

export async function deleteCheckoutCheck(
  supabase: SupabaseClient,
  checkId: string,
): Promise<void> {
  await supabase.from("checks").delete().eq("id", checkId)
}
