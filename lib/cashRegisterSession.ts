import type { SupabaseClient } from "@supabase/supabase-js"

export type OpenCashSessionContext = {
  sessionId: string
  cashRegisterId: string
  registerName: string
  cashTreasuryAccountId: string | null
  openedByUserId: string
}

type CashRegisterRow = {
  id: string
  name: string | null
  sort_order: number | null
  cash_treasury_account_id: string | null
}

type OpenSessionRow = {
  id: string
  cash_register_id: string
  opened_by: string
}

export async function resolveOpenCashSession(
  supabase: SupabaseClient,
  popId: string,
  userId?: string | null,
): Promise<
  | { success: true; ctx: OpenCashSessionContext }
  | { success: false; error: string }
> {
  const { data: regs, error: regErr } = await supabase
    .from("cash_registers")
    .select("id, name, sort_order, cash_treasury_account_id")
    .eq("pop_id", popId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (regErr) {
    return {
      success: false,
      error: regErr.message || "No se pudieron leer las cajas.",
    }
  }

  const { data: sessions, error: sessErr } = await supabase
    .from("cash_register_sessions")
    .select("id, cash_register_id, opened_by")
    .eq("pop_id", popId)
    .eq("status", "open")

  if (sessErr) {
    return {
      success: false,
      error: sessErr.message || "No se pudieron leer sesiones de caja.",
    }
  }

  const openByReg = new Map<string, OpenSessionRow>()
  for (const s of sessions || []) {
    openByReg.set(String(s.cash_register_id), {
      id: String(s.id),
      cash_register_id: String(s.cash_register_id),
      opened_by: String(s.opened_by),
    })
  }

  const openEntries: {
    register: CashRegisterRow
    session: OpenSessionRow
  }[] = []

  for (const r of (regs || []) as CashRegisterRow[]) {
    const session = openByReg.get(String(r.id))
    if (session) {
      openEntries.push({ register: r, session })
    }
  }

  if (openEntries.length === 0) {
    return {
      success: false,
      error:
        "No hay sesión de caja abierta. Abrí una caja desde el menú Cajas antes de vender.",
    }
  }

  const pick =
    (userId
      ? openEntries.find((e) => e.session.opened_by === userId)
      : undefined) ?? openEntries[0]

  const cashTreasuryAccountId = pick.register.cash_treasury_account_id
    ? String(pick.register.cash_treasury_account_id)
    : null

  if (!cashTreasuryAccountId) {
    return {
      success: false,
      error:
        "La caja abierta no tiene cuenta de efectivo configurada. Configurala en Cajas registradoras.",
    }
  }

  return {
    success: true,
    ctx: {
      sessionId: pick.session.id,
      cashRegisterId: String(pick.register.id),
      registerName: String(pick.register.name ?? ""),
      cashTreasuryAccountId,
      openedByUserId: pick.session.opened_by,
    },
  }
}

export async function assertCashSessionStillOpen(
  supabase: SupabaseClient,
  popId: string,
  sessionId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const { data, error } = await supabase
    .from("cash_register_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("pop_id", popId)
    .eq("status", "open")
    .maybeSingle()

  if (error) {
    return {
      success: false,
      error: error.message || "No se pudo validar la sesión de caja.",
    }
  }
  if (!data?.id) {
    return {
      success: false,
      error:
        "La sesión de caja se cerró. Abrí un turno en Cajas antes de continuar.",
    }
  }
  return { success: true }
}
