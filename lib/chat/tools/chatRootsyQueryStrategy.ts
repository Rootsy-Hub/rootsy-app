/**
 * Auditoría de fuentes: qué consultar primero para cada intención.
 * El selector usa esto; Rootsy no recibe este archivo ni endpoints.
 */

export type ChatRootsySourceKind =
  | "aggregate_balance"
  | "filtered_query"
  | "paginated_list"
  | "derived_calc"

export type ChatRootsyRelativeCost = "low" | "medium" | "high" | "avoid"

export type ChatRootsyQueryPhase = "summary" | "detail"

export type ChatRootsyQueryStrategy = {
  intent: string
  sourceKind: ChatRootsySourceKind
  defaultFilters: Record<string, string | number | boolean>
  minFields: readonly string[]
  limit?: number
  cost: ChatRootsyRelativeCost
  deepenWith?: string
  avoid: readonly string[]
  gap?: string
  phase: ChatRootsyQueryPhase
}

export type ChatRootsyBusinessIntent =
  | "sales_total"
  | "top_sold"
  | "product_margin"
  | "period_result"
  | "supplier_payables"
  | "receivables"
  | "merchandise_value"
  | "inventory_alerts"
  | "purchases_total"
  | "treasury_cash"
  | "cash_status"
  | "expenses_total"

export type ChatRootsyIntentRoute = {
  intent: ChatRootsyBusinessIntent
  preferredTool: string
  phase: ChatRootsyQueryPhase
  cost: ChatRootsyRelativeCost
  match: (text: string) => boolean
}

export type ChatRootsyQueryGap = {
  intent: string
  reason: string
  avoid: readonly string[]
}

const COST_RANK: Record<ChatRootsyRelativeCost, number> = {
  low: 0,
  medium: 1,
  high: 2,
  avoid: 9,
}

export const CHAT_ROOTSY_TOOL_STRATEGIES: Record<string, ChatRootsyQueryStrategy> =
  {
    operational_sales_total: {
      intent: "Cuánto se vendió en el período",
      sourceKind: "aggregate_balance",
      defaultFilters: { kind: "sales", period: "this_month" },
      minFields: ["kind", "count", "total"],
      cost: "low",
      deepenWith: "sales_summary",
      avoid: ["operations_sales", "sale_catalog", "list_invoices"],
      phase: "summary",
    },
    sales_summary: {
      intent: "Ventas del período contra el anterior",
      sourceKind: "filtered_query",
      defaultFilters: { period: "this_month" },
      minFields: ["comparison", "title"],
      cost: "medium",
      deepenWith: "top_sold_products",
      avoid: ["operations_sales", "sale_catalog"],
      phase: "summary",
    },
    top_sold_products: {
      intent: "Qué productos se vendieron más",
      sourceKind: "filtered_query",
      defaultFilters: { period: "this_month", limit: 5 },
      minFields: ["rank", "id", "name", "sharePercent", "sales"],
      limit: 5,
      cost: "high",
      deepenWith: "product_margins",
      avoid: ["list_articles", "operations_sales", "sale_catalog"],
      phase: "detail",
    },
    sales_details: {
      intent: "Evolución y canales de venta",
      sourceKind: "filtered_query",
      defaultFilters: { period: "this_month" },
      minFields: ["evolution", "rankings"],
      cost: "high",
      avoid: ["operations_sales"],
      phase: "detail",
    },
    product_margins: {
      intent: "Margen de productos ya consultados",
      sourceKind: "derived_calc",
      defaultFilters: { period: "this_month", limit: 5 },
      minFields: ["rank", "id", "name", "sales", "cost", "profit", "marginPercent"],
      limit: 5,
      cost: "high",
      avoid: ["list_articles", "profitability_summary", "income_statement"],
      phase: "detail",
    },
    products_sales_margins_range: {
      intent:
        "Más vendidos y su margen en un rango de fechas, con los campos oficiales de statistics/products/details",
      sourceKind: "filtered_query",
      defaultFilters: { limit: 5 },
      minFields: ["rank", "id", "name", "sales", "marginPercent", "profit"],
      limit: 5,
      cost: "high",
      avoid: ["list_articles", "top_sold_products", "product_margins"],
      gap: "Falta habilitarla. top_sold_products y product_margins solo aceptan este mes, no from/to.",
      phase: "detail",
    },
    operational_purchases_total: {
      intent: "Cuánto se compró en el período",
      sourceKind: "aggregate_balance",
      defaultFilters: { kind: "purchases", period: "this_month" },
      minFields: ["kind", "count", "total"],
      cost: "low",
      deepenWith: "purchases_summary",
      avoid: ["list_purchases", "list_purchase_orders"],
      phase: "summary",
    },
    purchases_summary: {
      intent: "Compras del período contra el anterior",
      sourceKind: "filtered_query",
      defaultFilters: { period: "this_month" },
      minFields: ["comparison", "title"],
      cost: "medium",
      deepenWith: "list_purchases",
      avoid: ["list_purchase_orders", "list_articles"],
      phase: "summary",
    },
    operational_expenses_total: {
      intent: "Total de gastos del período",
      sourceKind: "aggregate_balance",
      defaultFilters: { kind: "expenses", period: "this_month" },
      minFields: ["kind", "count", "total"],
      cost: "low",
      deepenWith: "list_expenses",
      avoid: ["list_expense_categories", "income_statement"],
      phase: "summary",
    },
    merchandise_book_value: {
      intent: "Valor total de mercadería",
      sourceKind: "aggregate_balance",
      defaultFilters: { accountCode: "1.1.3.01" },
      minFields: ["accountName", "closingBalance"],
      cost: "low",
      deepenWith: "account_ledger",
      avoid: [
        "list_articles",
        "inventory_rows",
        "inventory_summary",
        "inventory_stats",
      ],
      phase: "summary",
    },
    inventory_group_book_value: {
      intent: "Valor contable del grupo de inventario (mercadería, PT y MP)",
      sourceKind: "derived_calc",
      defaultFilters: {},
      minFields: ["accountCode", "accountName", "closingBalance"],
      limit: 3,
      cost: "medium",
      deepenWith: "inventory_summary",
      avoid: ["inventory_rows", "inventory_stats", "list_articles"],
      gap: "No hay un total oficial de 1.1.3.* en un solo campo. Son tres saldos de mayor: 1.1.3.01, 1.1.3.02 y 1.1.3.03. No sumar stock × costo.",
      phase: "summary",
    },
    inventory_summary: {
      intent: "Alertas y conteo de stock",
      sourceKind: "filtered_query",
      defaultFilters: {},
      minFields: ["articleCount", "articlesWithStock", "redCount", "belowMinCount"],
      cost: "high",
      deepenWith: "inventory_rows",
      avoid: ["inventory_stats", "list_articles"],
      gap: "inventoryValue de este endpoint lee el mayor, pero también recorre todos los artículos. Para el valor, usar merchandise_book_value.",
      phase: "summary",
    },
    inventory_stats: {
      intent: "Estadísticas operativas de stock",
      sourceKind: "derived_calc",
      defaultFilters: { period: "this_month" },
      minFields: ["comparison"],
      cost: "avoid",
      avoid: ["merchandise_book_value"],
      gap: "Valoriza stock × costo de referencia. No es el saldo contable de Mercaderías.",
      phase: "detail",
    },
    inventory_rows: {
      intent: "Qué artículos tienen stock o alerta",
      sourceKind: "paginated_list",
      defaultFilters: { pageSize: 10 },
      minFields: ["articleId", "quantity", "attention"],
      limit: 10,
      cost: "high",
      avoid: ["list_articles"],
      phase: "detail",
    },
    income_statement: {
      intent: "Resultado del período (ingresos, costos, gastos)",
      sourceKind: "filtered_query",
      defaultFilters: { period: "this_month" },
      minFields: ["totalIngresos", "totalCostos", "totalGastos", "resultadoNeto"],
      cost: "medium",
      deepenWith: "profitability_summary",
      avoid: ["sales_summary", "operational_sales_total", "list_expenses"],
      phase: "summary",
    },
    profitability_summary: {
      intent: "Rentabilidad operativa del período",
      sourceKind: "filtered_query",
      defaultFilters: { period: "this_month" },
      minFields: ["comparison", "efficiencyRatios"],
      cost: "medium",
      deepenWith: "product_margins",
      avoid: ["income_statement"],
      gap: "No es el estado de resultados contable. No mezclar ambos números.",
      phase: "summary",
    },
    financial_summaries: {
      intent: "Totales de activo, pasivo, ingresos, costos y gastos",
      sourceKind: "aggregate_balance",
      defaultFilters: { period: "this_month" },
      minFields: ["label", "total"],
      cost: "medium",
      deepenWith: "trial_balance",
      avoid: ["balance_sheet", "chart_of_accounts"],
      phase: "summary",
    },
    account_ledger_totals: {
      intent: "Saldo de una cuenta del plan",
      sourceKind: "aggregate_balance",
      defaultFilters: { accountCode: "1.1.3.01" },
      minFields: ["accountName", "closingBalance", "totalDebit", "totalCredit"],
      cost: "low",
      deepenWith: "account_ledger",
      avoid: ["trial_balance", "chart_of_accounts"],
      phase: "summary",
    },
    account_ledger: {
      intent: "Movimientos de una cuenta",
      sourceKind: "paginated_list",
      defaultFilters: { accountCode: "1.1.3.01", pageSize: 10 },
      minFields: ["entryDate", "debitAmount", "creditAmount", "runningBalance"],
      limit: 10,
      cost: "high",
      avoid: ["trial_balance", "journal"],
      phase: "detail",
    },
    trial_balance: {
      intent: "Sumas y saldos de todas las cuentas",
      sourceKind: "filtered_query",
      defaultFilters: { period: "this_month" },
      minFields: ["accountCode", "accountName", "balance"],
      cost: "high",
      avoid: ["account_ledger_totals"],
      phase: "detail",
    },
    balance_sheet: {
      intent: "Balance general a una fecha",
      sourceKind: "filtered_query",
      defaultFilters: {},
      minFields: ["totalActivo", "totalPasivo", "sections"],
      cost: "high",
      avoid: ["financial_summaries"],
      phase: "detail",
    },
    supplier_upcoming_payments: {
      intent: "A quién se le debe y qué está vencido",
      sourceKind: "paginated_list",
      defaultFilters: {
        direction: "payable",
        sort: "overdue",
        ord: "desc",
        page: 1,
        pageSize: 5,
      },
      minFields: ["id", "name", "balance", "overdueAmount", "openCount"],
      limit: 5,
      cost: "medium",
      deepenWith: "supplier_payables_ledger",
      avoid: ["list_purchases", "issued_checks", "list_suppliers"],
      gap: "El listado no trae un gran total a pagar. No sumar solo la página.",
      phase: "summary",
    },
    receivables: {
      intent: "Quién nos debe",
      sourceKind: "paginated_list",
      defaultFilters: { direction: "receivable", pageSize: 5 },
      minFields: ["partyName", "balance", "overdueAmount"],
      limit: 5,
      cost: "medium",
      avoid: ["operations_sales", "list_clients"],
      gap: "No hay un total a cobrar oficial en un solo campo.",
      phase: "summary",
    },
    issued_checks: {
      intent: "Cheques emitidos a vencer",
      sourceKind: "paginated_list",
      defaultFilters: { direction: "issued", sort: "due_date", pageSize: 10 },
      minFields: ["id", "dueDate", "amount", "status"],
      limit: 10,
      cost: "medium",
      avoid: ["supplier_upcoming_payments"],
      phase: "detail",
    },
    treasury_balances: {
      intent: "Saldos actuales de tesorería",
      sourceKind: "aggregate_balance",
      defaultFilters: {},
      minFields: ["accountId", "name", "balance"],
      cost: "low",
      deepenWith: "treasury_period_totals",
      avoid: ["cash_registers", "account_ledger_totals", "cash_flow"],
      phase: "summary",
    },
    treasury_period_totals: {
      intent: "Entradas, salidas y cierre de tesorería del período",
      sourceKind: "aggregate_balance",
      defaultFilters: { period: "this_month" },
      minFields: ["closingBalance", "periodIn", "periodOut"],
      cost: "medium",
      deepenWith: "treasury_pending",
      avoid: ["cash_flow", "cash_registers"],
      phase: "summary",
    },
    cash_registers: {
      intent: "Si las cajas están abiertas",
      sourceKind: "paginated_list",
      defaultFilters: {},
      minFields: ["id", "name", "isOpen"],
      cost: "low",
      avoid: ["treasury_balances"],
      gap: "No es el dinero en caja. Para el saldo, treasury_balances o la cuenta 1.1.1.01.",
      phase: "summary",
    },
    finance_summary: {
      intent: "Ingresos y egresos de tesorería en estadísticas",
      sourceKind: "filtered_query",
      defaultFilters: { period: "this_month" },
      minFields: ["comparison", "title"],
      cost: "medium",
      avoid: ["treasury_balances", "income_statement"],
      gap: "Es flujo operativo de tesorería, no el estado de resultados.",
      phase: "summary",
    },
  }

export const CHAT_ROOTSY_QUERY_GAPS: readonly ChatRootsyQueryGap[] = [
  {
    intent: "Total a pagar o a cobrar en un solo número",
    reason:
      "GET current-accounts calcula todos los partidos internamente y solo pagina filas. No expone un gran total. Sumar la página de 5 mentiría.",
    avoid: ["operations", "list_purchases", "list_clients"],
  },
  {
    intent: "Valor físico del stock (cantidad × costo)",
    reason:
      "statistics/inventory lo calcula, pero no es el saldo oficial. El valor de mercadería es el mayor de 1.1.3.01. No inventar un recálculo.",
    avoid: ["inventory_rows", "list_articles", "inventory_stats"],
  },
  {
    intent: "Estadísticas de servicios o fabricación",
    reason:
      "GET statistics/services y manufacturing están como placeholder vacío. No hay resumen confiable.",
    avoid: ["list_services", "manufacturing_workspace"],
  },
  {
    intent: "Arqueo: caja física versus saldo contable",
    reason:
      "No hay un indicador único. Caja operativa es treasury/balances; caja contable es el mayor 1.1.1.01; cash-registers solo dice si el turno está abierto.",
    avoid: ["cash_registers"],
  },
  {
    intent: "Margen de un producto suelto sin contexto",
    reason:
      "El margen oficial de un set sale de statistics/products/details sobre ítems ya vistos. Sin ese resultado reciente no hay fuente barata y fiable.",
    avoid: ["list_articles", "profitability_summary"],
  },
  {
    intent:
      "Artículos con menos margen que más se vendieron entre dos fechas (ej. 5 y 8 de agosto)",
    reason:
      "El endpoint oficial es GET statistics/products/details con from/to. Hoy no hay herramienta habilitada que acepte esas fechas ni que devuelva ventas y margen juntos. No usar this_month ni inventar un ranking.",
    avoid: ["top_sold_products", "product_margins", "list_articles"],
  },
]

function foldIntentText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[¿?¡!,.;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export const CHAT_ROOTSY_INTENT_ROUTES: readonly ChatRootsyIntentRoute[] = [
  {
    intent: "sales_total",
    preferredTool: "operational_sales_total",
    phase: "summary",
    cost: "low",
    match: (text) =>
      /\b(cuanto|cuanta|total) (se )?vend/.test(text) ||
      /\bventas (del |de )?(mes|periodo|hoy)\b/.test(text) ||
      /\bfacturacion\b/.test(text),
  },
  {
    intent: "top_sold",
    preferredTool: "top_sold_products",
    phase: "detail",
    cost: "high",
    match: (text) =>
      /\bmas vendid/.test(text) ||
      /\btop\s*(5|cinco|productos|ventas)\b/.test(text) ||
      /\bque se vende mas\b/.test(text) ||
      /\bproductos? (con )?mas ventas\b/.test(text) ||
      /\branking (de )?(productos|ventas)\b/.test(text),
  },
  {
    intent: "product_margin",
    preferredTool: "product_margins",
    phase: "detail",
    cost: "high",
    match: (text) =>
      /\b(margen|margenes|rentabilidad|rentable)\b/.test(text) ||
      /\b(costo|costos|ganancia|ganancias)\b/.test(text) ||
      /\bcuanto ganan\b/.test(text),
  },
  {
    intent: "period_result",
    preferredTool: "income_statement",
    phase: "summary",
    cost: "medium",
    match: (text) =>
      /\b(estado de resultados|resultado (del )?(mes|periodo|neto))\b/.test(text) ||
      /\b(ganancia|perdida) (del )?(negocio|mes|periodo)\b/.test(text),
  },
  {
    intent: "supplier_payables",
    preferredTool: "supplier_upcoming_payments",
    phase: "summary",
    cost: "medium",
    match: (text) =>
      /\bpagos? proximos?\b/.test(text) ||
      /\b(deudas?|saldos?) (a |de |con )?(los )?proveedores?\b/.test(text) ||
      /\bproveedores? (a pagar|vencid|deud)/.test(text) ||
      /\b(pagos?|pagar) (a |de |para )?(los )?proveedores?\b/.test(text) ||
      /\bcuentas? (corrientes? )?(a )?pagar\b/.test(text) ||
      /\bvencimientos? (a |de )?(los )?proveedores?\b/.test(text),
  },
  {
    intent: "receivables",
    preferredTool: "receivables",
    phase: "summary",
    cost: "medium",
    match: (text) =>
      /\b(deudas?|saldos?) (de |de los )?clientes\b/.test(text) ||
      /\b(cuentas? (a )?cobrar|quien nos debe)\b/.test(text),
  },
  {
    intent: "merchandise_value",
    preferredTool: "merchandise_book_value",
    phase: "summary",
    cost: "low",
    match: (text) =>
      /\bvalor (total )?(de )?(la )?mercader/.test(text) ||
      /\b(cuanto|cuanta) (vale|hay) (la )?mercader/.test(text) ||
      /\b(saldo|valor) (de |del )?(la )?(cuenta )?mercader/.test(text) ||
      /\bvalor (del |de )?(el )?inventario\b/.test(text) ||
      /\bstock valorizado\b/.test(text),
  },
  {
    intent: "inventory_alerts",
    preferredTool: "inventory_summary",
    phase: "summary",
    cost: "high",
    match: (text) =>
      /\b(stock (bajo|minimo)|sin stock|faltantes?|alertas? de (stock|inventario))\b/.test(
        text,
      ),
  },
  {
    intent: "purchases_total",
    preferredTool: "operational_purchases_total",
    phase: "summary",
    cost: "low",
    match: (text) =>
      /\b(cuanto|cuanta|total) (se )?compr/.test(text) ||
      /\bcompras (del |de )?(mes|periodo)\b/.test(text),
  },
  {
    intent: "treasury_cash",
    preferredTool: "treasury_balances",
    phase: "summary",
    cost: "low",
    match: (text) =>
      /\b(saldo|cuanto hay) (en )?(caja|banco|tesoreria)\b/.test(text) ||
      /\btesoreria\b/.test(text),
  },
  {
    intent: "cash_status",
    preferredTool: "cash_registers",
    phase: "summary",
    cost: "low",
    match: (text) =>
      /\b(caja (abierta|cerrada)|turnos? de caja|esta abierta la caja)\b/.test(
        text,
      ),
  },
  {
    intent: "expenses_total",
    preferredTool: "operational_expenses_total",
    phase: "summary",
    cost: "low",
    match: (text) =>
      /\b(cuanto|cuanta|total) (se )?gasto\b/.test(text) ||
      /\bgastos (del |de )?(mes|periodo)\b/.test(text),
  },
]

export function getChatRootsyToolStrategy(name: string) {
  return CHAT_ROOTSY_TOOL_STRATEGIES[name] ?? null
}

export function matchChatRootsyIntents(body: string): ChatRootsyIntentRoute[] {
  const text = foldIntentText(body)
  if (!text) return []
  return CHAT_ROOTSY_INTENT_ROUTES.filter((route) => route.match(text))
}

export function rankChatRootsyIntentRoutes(
  routes: readonly ChatRootsyIntentRoute[],
): ChatRootsyIntentRoute[] {
  return [...routes].sort((left, right) => {
    if (left.phase !== right.phase) {
      return left.phase === "summary" ? -1 : 1
    }
    return COST_RANK[left.cost] - COST_RANK[right.cost]
  })
}

export function strategyAvoidsTool(toolName: string, otherName: string) {
  return getChatRootsyToolStrategy(toolName)?.avoid.includes(otherName) ?? false
}
