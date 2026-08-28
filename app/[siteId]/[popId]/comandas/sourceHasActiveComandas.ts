import type { createClient } from "@/utils/supabase/server"

type Supabase = Awaited<ReturnType<typeof createClient>>

const ACTIVE_COMANDA_STATUSES = ["sent", "preparing", "ready", "delivered"] as const

export async function sourceHasActiveComandas(
  supabase: Supabase,
  popId: string,
  sourceKind: "table" | "counter",
  sourceId: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("comandas")
    .select("id", { count: "exact", head: true })
    .eq("pop_id", popId)
    .eq("source_kind", sourceKind)
    .eq("source_id", sourceId)
    .in("status", [...ACTIVE_COMANDA_STATUSES])
  return !error && (count ?? 0) > 0
}
