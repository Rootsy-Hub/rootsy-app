import type { SupabaseClient } from "@supabase/supabase-js"

export type CashRegisterSaleChannel = "pos" | "table" | "counter"

export function parseCashRegisterSaleChannel(raw: unknown): CashRegisterSaleChannel {
  const channel = String(raw ?? "pos")
  if (channel === "table" || channel === "counter" || channel === "pos") {
    return channel
  }
  return "pos"
}

export function formatCashRegisterSaleOperationLabel(options: {
  saleChannel: CashRegisterSaleChannel
  tableLabel?: string | null
  counterOrderLabel?: string | null
}): string {
  if (options.saleChannel === "table") {
    const raw = options.tableLabel?.trim()
    if (!raw) return "Mesa"
    return /^mesa\b/i.test(raw) ? raw : `Mesa ${raw}`
  }
  if (options.saleChannel === "counter") {
    const raw = options.counterOrderLabel?.trim()?.replace(/^#/, "")
    if (!raw) return "Mostrador"
    return /^mostrador\b/i.test(raw) ? raw : `Mostrador ${raw}`
  }
  return "Venta"
}

type SaleContextSourceRow = {
  table_session_id?: string | null
  counter_order_id?: string | null
}

async function loadTableLabelsBySessionIds(
  supabase: SupabaseClient,
  popId: string,
  sessionIds: string[],
): Promise<Map<string, string>> {
  const labelsBySessionId = new Map<string, string>()
  if (sessionIds.length === 0) return labelsBySessionId

  const { data: sessions, error } = await supabase
    .from("table_sessions")
    .select("id, dining_table_id, table_session_tables ( dining_table_id )")
    .eq("pop_id", popId)
    .in("id", sessionIds)

  if (error || !sessions?.length) return labelsBySessionId

  const tableIds = new Set<string>()
  for (const session of sessions) {
    if (session.dining_table_id) {
      tableIds.add(String(session.dining_table_id))
    }
    const extras = session.table_session_tables as
      | Array<{ dining_table_id?: string }>
      | null
    for (const row of extras ?? []) {
      if (row.dining_table_id) tableIds.add(String(row.dining_table_id))
    }
  }

  if (tableIds.size === 0) return labelsBySessionId

  const { data: tables } = await supabase
    .from("dining_tables")
    .select("id, label")
    .eq("pop_id", popId)
    .in("id", [...tableIds])

  const labelByTableId = new Map<string, string>()
  for (const table of tables ?? []) {
    const label = typeof table.label === "string" ? table.label.trim() : ""
    if (label) labelByTableId.set(String(table.id), label)
  }

  for (const session of sessions) {
    const orderedTableIds = [String(session.dining_table_id)]
    const extras = session.table_session_tables as
      | Array<{ dining_table_id?: string }>
      | null
    for (const row of extras ?? []) {
      const tableId = row.dining_table_id ? String(row.dining_table_id) : ""
      if (tableId && !orderedTableIds.includes(tableId)) {
        orderedTableIds.push(tableId)
      }
    }
    const labels = orderedTableIds
      .map((tableId) => labelByTableId.get(tableId))
      .filter((label): label is string => Boolean(label))
    if (labels.length > 0) {
      labelsBySessionId.set(String(session.id), labels.join(" + "))
    }
  }

  return labelsBySessionId
}

async function loadCounterOrderLabelsByOrderIds(
  supabase: SupabaseClient,
  popId: string,
  orderIds: string[],
): Promise<Map<string, string>> {
  const labelByOrderId = new Map<string, string>()
  if (orderIds.length === 0) return labelByOrderId

  const { data, error } = await supabase
    .from("counter_orders")
    .select("id, order_number")
    .eq("pop_id", popId)
    .in("id", orderIds)

  if (error || !data?.length) return labelByOrderId

  for (const row of data) {
    const orderNumber = Number(row.order_number)
    if (!Number.isFinite(orderNumber)) continue
    labelByOrderId.set(String(row.id), String(orderNumber))
  }

  return labelByOrderId
}

export async function loadCashRegisterSaleContextLabels(
  supabase: SupabaseClient,
  popId: string,
  saleRows: SaleContextSourceRow[],
): Promise<{
  tableLabelsBySessionId: Map<string, string>
  counterOrderLabelsByOrderId: Map<string, string>
}> {
  const sessionIds = [
    ...new Set(
      saleRows
        .map((row) =>
          row.table_session_id != null ? String(row.table_session_id).trim() : "",
        )
        .filter(Boolean),
    ),
  ]
  const orderIds = [
    ...new Set(
      saleRows
        .map((row) =>
          row.counter_order_id != null ? String(row.counter_order_id).trim() : "",
        )
        .filter(Boolean),
    ),
  ]

  const [tableLabelsBySessionId, counterOrderLabelsByOrderId] = await Promise.all([
    loadTableLabelsBySessionIds(supabase, popId, sessionIds),
    loadCounterOrderLabelsByOrderIds(supabase, popId, orderIds),
  ])

  return { tableLabelsBySessionId, counterOrderLabelsByOrderId }
}
