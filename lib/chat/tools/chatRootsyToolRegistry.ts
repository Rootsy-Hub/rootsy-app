/**
 * Catálogo interno de capacidades del POP.
 * Los endpoints y tokens nunca se mandan al modelo.
 * status "enabled" = se puede ofrecer/ejecutar hoy.
 * status "documented" = listo para sumar después; escrituras quedan con confirmación.
 * La estrategia de consulta vive en chatRootsyQueryStrategy y se adjunta al leer.
 */

import {
  getChatRootsyToolStrategy,
  type ChatRootsyQueryStrategy,
} from "@/lib/chat/tools/chatRootsyQueryStrategy"

export type ChatRootsyToolKind = "read" | "write"
export type ChatRootsyToolStatus = "enabled" | "documented"
export type ChatRootsyToolDomain =
  | "sales"
  | "profitability"
  | "payables"
  | "products"
  | "purchases"
  | "inventory"
  | "clients"
  | "suppliers"
  | "operations"
  | "treasury"
  | "cash"
  | "reports"
  | "expenses"
  | "hr"
  | "manufacturing"
  | "services"
  | "settings"
  | "chat"
  | "other"

export type ChatRootsyToolParamSpec = {
  name: string
  type: "string" | "number" | "enum" | "date" | "boolean"
  values?: readonly string[]
  default?: string | number | boolean
  max?: number
  required?: boolean
}

export type ChatRootsyRegistryEntry = {
  name: string
  domain: ChatRootsyToolDomain
  module: string
  solves: string
  endpoint: string
  kind: ChatRootsyToolKind
  status: ChatRootsyToolStatus
  requiresConfirmation: boolean
  permissions: readonly string[]
  params: readonly ChatRootsyToolParamSpec[]
  responseFields: readonly string[]
  buttonLabel?: string
  resultTitle?: string
  offerPrompt?: string
  requiresRecent?: readonly string[]
  strategy?: ChatRootsyQueryStrategy
}

const PERIOD = {
  name: "period",
  type: "enum" as const,
  values: ["this_month"] as const,
  default: "this_month",
}
const LIMIT_5 = {
  name: "limit",
  type: "number" as const,
  default: 5,
  max: 5,
}

function read(
  entry: Omit<ChatRootsyRegistryEntry, "kind" | "requiresConfirmation">,
): ChatRootsyRegistryEntry {
  return { ...entry, kind: "read", requiresConfirmation: false }
}

function write(
  entry: Omit<
    ChatRootsyRegistryEntry,
    "kind" | "requiresConfirmation" | "status"
  >,
): ChatRootsyRegistryEntry {
  return {
    ...entry,
    kind: "write",
    status: "documented",
    requiresConfirmation: true,
  }
}

export const CHAT_ROOTSY_TOOL_REGISTRY: readonly ChatRootsyRegistryEntry[] = [
  read({
    name: "top_sold_products",
    domain: "sales",
    module: "statistics",
    solves: "Ver los productos que más se vendieron en el período",
    endpoint: "GET /v1/pops/:popId/statistics/products/details",
    status: "enabled",
    permissions: ["statistics:read"],
    params: [PERIOD, LIMIT_5],
    responseFields: ["rank", "id", "name", "sharePercent", "sales"],
    buttonLabel: "Ver los 5 más vendidos",
    resultTitle: "5 más vendidos",
    offerPrompt:
      "La persona pidió ver los más vendidos. No inventes ranking ni cifras. Invitá breve a mirarlo con el botón. No nombres APIs, permisos ni endpoints.",
  }),
  read({
    name: "product_margins",
    domain: "profitability",
    module: "statistics",
    solves: "Ver margen, costo y ganancia de productos ya consultados",
    endpoint: "GET /v1/pops/:popId/statistics/products/details",
    status: "enabled",
    permissions: ["statistics:read"],
    params: [PERIOD, LIMIT_5],
    responseFields: ["rank", "id", "name", "sales", "cost", "profit", "marginPercent"],
    buttonLabel: "Ver margen de estos 5 productos",
    resultTitle: "Margen de estos 5",
    offerPrompt:
      "La persona preguntó por margen, costo o ganancia de esos productos. No inventes cifras. Invitá breve a mirarlo con el botón. No nombres APIs, permisos ni endpoints.",
    requiresRecent: ["top_sold_products"],
  }),
  read({
    name: "products_sales_margins_range",
    domain: "profitability",
    module: "statistics",
    solves:
      "Ver los más vendidos y su margen oficial en un rango de fechas (from/to ISO)",
    endpoint: "GET /v1/pops/:popId/statistics/products/details",
    status: "documented",
    permissions: ["statistics:read"],
    params: [
      { name: "from", type: "date", required: true },
      { name: "to", type: "date", required: true },
      LIMIT_5,
    ],
    responseFields: ["rank", "id", "name", "sales", "marginPercent", "profit"],
    buttonLabel: "Ver ventas y margen en esas fechas",
    resultTitle: "Ventas y margen",
  }),
  read({
    name: "supplier_upcoming_payments",
    domain: "payables",
    module: "current_accounts",
    solves: "Ver deudas y pagos próximos a proveedores",
    endpoint: "GET /v1/pops/:popId/current-accounts",
    status: "enabled",
    permissions: ["current_accounts:read"],
    params: [
      {
        name: "direction",
        type: "enum",
        values: ["payable"],
        default: "payable",
        required: true,
      },
      {
        name: "sort",
        type: "enum",
        values: ["overdue"],
        default: "overdue",
      },
      { name: "ord", type: "enum", values: ["desc"], default: "desc" },
      { name: "page", type: "number", default: 1 },
      { name: "pageSize", type: "number", default: 5, max: 5 },
    ],
    responseFields: ["id", "name", "balance", "overdueAmount", "openCount"],
    buttonLabel: "Ver pagos próximos a proveedores",
    resultTitle: "Pagos a proveedores",
    offerPrompt:
      "La persona preguntó por pagos o deudas a proveedores. No inventes saldos. Invitá breve a mirarlo con el botón. No nombres APIs, permisos ni endpoints.",
  }),

  read({
    name: "operational_sales_total",
    domain: "sales",
    module: "reports",
    solves: "Total vendido del período, sin listar tickets",
    endpoint: "GET /v1/pops/:popId/reports/totals",
    status: "documented",
    permissions: ["reports:read"],
    params: [
      { name: "kind", type: "enum", values: ["sales"], default: "sales" },
      PERIOD,
    ],
    responseFields: ["kind", "count", "total"],
  }),
  read({
    name: "operational_purchases_total",
    domain: "purchases",
    module: "reports",
    solves: "Total comprado del período, sin listar compras",
    endpoint: "GET /v1/pops/:popId/reports/totals",
    status: "documented",
    permissions: ["reports:read"],
    params: [
      { name: "kind", type: "enum", values: ["purchases"], default: "purchases" },
      PERIOD,
    ],
    responseFields: ["kind", "count", "total"],
  }),
  read({
    name: "operational_expenses_total",
    domain: "expenses",
    module: "reports",
    solves: "Total de gastos del período, sin listar comprobantes",
    endpoint: "GET /v1/pops/:popId/reports/totals",
    status: "documented",
    permissions: ["reports:read"],
    params: [
      { name: "kind", type: "enum", values: ["expenses"], default: "expenses" },
      PERIOD,
    ],
    responseFields: ["kind", "count", "total"],
  }),
  read({
    name: "merchandise_book_value",
    domain: "inventory",
    module: "reports",
    solves: "Valor total de mercadería según el último saldo de la cuenta Mercaderías",
    endpoint: "GET /v1/pops/:popId/reports/ledger/totals",
    status: "documented",
    permissions: ["reports:read"],
    params: [
      {
        name: "accountCode",
        type: "enum",
        values: ["1.1.3.01"],
        default: "1.1.3.01",
        required: true,
      },
    ],
    responseFields: ["accountName", "closingBalance", "nature"],
  }),
  read({
    name: "inventory_group_book_value",
    domain: "inventory",
    module: "reports",
    solves: "Saldos contables de Mercaderías, Productos terminados y Materias primas",
    endpoint: "GET /v1/pops/:popId/reports/ledger/totals",
    status: "documented",
    permissions: ["reports:read"],
    params: [],
    responseFields: ["accountCode", "accountName", "closingBalance"],
  }),
  read({
    name: "account_ledger_totals",
    domain: "reports",
    module: "reports",
    solves: "Saldo de una cuenta del plan, sin listar el mayor",
    endpoint: "GET /v1/pops/:popId/reports/ledger/totals",
    status: "documented",
    permissions: ["reports:read"],
    params: [
      { name: "accountCode", type: "string", required: true, default: "1.1.3.01" },
    ],
    responseFields: ["accountName", "closingBalance", "totalDebit", "totalCredit"],
  }),
  read({
    name: "account_ledger",
    domain: "reports",
    module: "reports",
    solves: "Movimientos de una cuenta ya identificada",
    endpoint: "GET /v1/pops/:popId/reports/ledger",
    status: "documented",
    permissions: ["reports:read"],
    params: [
      { name: "accountCode", type: "string", required: true },
      { name: "pageSize", type: "number", default: 10, max: 10 },
    ],
    responseFields: ["entryDate", "debitAmount", "creditAmount", "runningBalance"],
    requiresRecent: ["merchandise_book_value", "account_ledger_totals"],
  }),
  read({
    name: "financial_summaries",
    domain: "reports",
    module: "reports",
    solves: "Totales de activo, pasivo, ingresos, costos y gastos",
    endpoint: "GET /v1/pops/:popId/reports/summaries",
    status: "documented",
    permissions: ["reports:read"],
    params: [PERIOD],
    responseFields: ["label", "total"],
  }),
  read({
    name: "treasury_period_totals",
    domain: "treasury",
    module: "treasury",
    solves: "Cierre, entradas y salidas de tesorería del período",
    endpoint: "GET /v1/pops/:popId/treasury/period/totals",
    status: "documented",
    permissions: ["payment_methods:read"],
    params: [PERIOD],
    responseFields: ["closingBalance", "periodIn", "periodOut"],
  }),

  read({
    name: "sales_summary",
    domain: "sales",
    module: "statistics",
    solves: "Resumen de ventas del período",
    endpoint: "GET /v1/pops/:popId/statistics/sales/summary",
    status: "documented",
    permissions: ["statistics:read"],
    params: [PERIOD],
    responseFields: ["comparison", "title"],
  }),
  read({
    name: "sales_details",
    domain: "sales",
    module: "statistics",
    solves: "Detalle y evolución de ventas",
    endpoint: "GET /v1/pops/:popId/statistics/sales/details",
    status: "documented",
    permissions: ["statistics:read"],
    params: [PERIOD],
    responseFields: ["evolution", "rankings", "hourlyHeatmap"],
  }),
  read({
    name: "operations_sales",
    domain: "sales",
    module: "operations",
    solves: "Listar ventas registradas",
    endpoint: "GET /v1/pops/:popId/operations",
    status: "documented",
    permissions: ["operations:read"],
    params: [
      { name: "view", type: "enum", values: ["sales"], default: "sales" },
      { name: "from", type: "date" },
      { name: "to", type: "date" },
      { name: "pageSize", type: "number", default: 10, max: 25 },
    ],
    responseFields: ["id", "date", "total", "status"],
  }),
  read({
    name: "sale_catalog",
    domain: "sales",
    module: "sale",
    solves: "Consultar el catálogo de venta",
    endpoint: "GET /v1/pops/:popId/sale/catalog",
    status: "documented",
    permissions: ["sale:read"],
    params: [],
    responseFields: ["sections", "promotions"],
  }),

  read({
    name: "profitability_summary",
    domain: "profitability",
    module: "statistics",
    solves: "Resumen de rentabilidad del negocio",
    endpoint: "GET /v1/pops/:popId/statistics/profitability/summary",
    status: "documented",
    permissions: ["statistics:read"],
    params: [PERIOD],
    responseFields: ["comparison", "efficiencyRatios"],
  }),
  read({
    name: "finance_summary",
    domain: "treasury",
    module: "statistics",
    solves: "Resumen financiero del período",
    endpoint: "GET /v1/pops/:popId/statistics/finance/summary",
    status: "documented",
    permissions: ["statistics:read"],
    params: [PERIOD],
    responseFields: ["comparison", "title"],
  }),
  read({
    name: "clients_summary",
    domain: "clients",
    module: "statistics",
    solves: "Resumen de clientes del período",
    endpoint: "GET /v1/pops/:popId/statistics/clients/summary",
    status: "documented",
    permissions: ["statistics:read"],
    params: [PERIOD],
    responseFields: ["comparison", "rankings"],
  }),
  read({
    name: "purchases_summary",
    domain: "purchases",
    module: "statistics",
    solves: "Resumen de compras del período",
    endpoint: "GET /v1/pops/:popId/statistics/purchases/summary",
    status: "documented",
    permissions: ["statistics:read"],
    params: [PERIOD],
    responseFields: ["comparison", "title"],
  }),
  read({
    name: "inventory_stats",
    domain: "inventory",
    module: "statistics",
    solves: "Estadísticas de inventario",
    endpoint: "GET /v1/pops/:popId/statistics/inventory/summary",
    status: "documented",
    permissions: ["statistics:read"],
    params: [PERIOD],
    responseFields: ["comparison", "attention"],
  }),
  read({
    name: "suppliers_stats",
    domain: "suppliers",
    module: "statistics",
    solves: "Estadísticas de proveedores",
    endpoint: "GET /v1/pops/:popId/statistics/suppliers/summary",
    status: "documented",
    permissions: ["statistics:read"],
    params: [PERIOD],
    responseFields: ["comparison", "rankings"],
  }),
  read({
    name: "list_categories",
    domain: "products",
    module: "categories",
    solves: "Listar categorías de artículos",
    endpoint: "GET /v1/pops/:popId/categories",
    status: "documented",
    permissions: ["articles:read"],
    params: [],
    responseFields: ["id", "name"],
  }),
  read({
    name: "list_price_lists",
    domain: "products",
    module: "price_lists",
    solves: "Listar listas de precios",
    endpoint: "GET /v1/pops/:popId/price-lists",
    status: "documented",
    permissions: ["articles:read"],
    params: [],
    responseFields: ["id", "name"],
  }),
  read({
    name: "treasury_pending",
    domain: "treasury",
    module: "treasury",
    solves: "Movimientos de tesorería pendientes de una cuenta",
    endpoint:
      "GET /v1/pops/:popId/treasury/:accountId/children/:childId/pending",
    status: "documented",
    permissions: ["payment_methods:read"],
    params: [
      { name: "accountId", type: "string", required: true },
      { name: "childId", type: "string", required: true },
      { name: "pageSize", type: "number", default: 10, max: 25 },
    ],
    responseFields: ["id", "amount", "status"],
  }),
  read({
    name: "income_statement",
    domain: "profitability",
    module: "reports",
    solves: "Estado de resultados",
    endpoint: "GET /v1/pops/:popId/reports/income-statement",
    status: "documented",
    permissions: ["reports:read"],
    params: [
      { name: "from", type: "date" },
      { name: "to", type: "date" },
    ],
    responseFields: ["totalIngresos", "totalCostos", "resultadoNeto"],
  }),

  read({
    name: "supplier_payables_ledger",
    domain: "payables",
    module: "current_accounts",
    solves: "Libro de un proveedor con vencimientos",
    endpoint: "GET /v1/pops/:popId/current-accounts/parties/:partyId",
    status: "documented",
    permissions: ["current_accounts:read"],
    params: [
      { name: "partyId", type: "string", required: true },
      { name: "direction", type: "enum", values: ["payable"], default: "payable" },
    ],
    responseFields: ["partyName", "balance", "openDocuments", "overdueAmount"],
    requiresRecent: ["supplier_upcoming_payments"],
  }),
  read({
    name: "issued_checks",
    domain: "payables",
    module: "checks",
    solves: "Cheques emitidos a pagar",
    endpoint: "GET /v1/pops/:popId/checks",
    status: "documented",
    permissions: ["checks:read"],
    params: [
      { name: "direction", type: "enum", values: ["issued"], default: "issued" },
      { name: "sort", type: "enum", values: ["due_date"], default: "due_date" },
      { name: "pageSize", type: "number", default: 10, max: 25 },
    ],
    responseFields: ["id", "dueDate", "amount", "status"],
  }),
  write({
    name: "settle_supplier_account",
    domain: "payables",
    module: "current_accounts",
    solves: "Registrar un pago a un proveedor",
    endpoint: "POST /v1/pops/:popId/current-accounts/settle",
    permissions: ["current_accounts:create"],
    params: [
      { name: "partyId", type: "string", required: true },
      { name: "direction", type: "enum", values: ["payable"], default: "payable" },
    ],
    responseFields: ["success"],
  }),

  read({
    name: "list_articles",
    domain: "products",
    module: "articles",
    solves: "Listar artículos del catálogo",
    endpoint: "GET /v1/pops/:popId/articles",
    status: "documented",
    permissions: ["articles:read"],
    params: [
      { name: "q", type: "string" },
      { name: "pageSize", type: "number", default: 10, max: 25 },
    ],
    responseFields: ["id", "name", "salePrice", "isActive"],
  }),
  read({
    name: "article_detail",
    domain: "products",
    module: "articles",
    solves: "Ver un artículo",
    endpoint: "GET /v1/pops/:popId/articles/:articleId",
    status: "documented",
    permissions: ["articles:read"],
    params: [{ name: "articleId", type: "string", required: true }],
    responseFields: ["id", "name", "salePrice", "cost"],
  }),
  read({
    name: "list_recipes",
    domain: "products",
    module: "recipes",
    solves: "Listar recetas",
    endpoint: "GET /v1/pops/:popId/recipes",
    status: "documented",
    permissions: ["recipes:read"],
    params: [
      { name: "q", type: "string" },
      { name: "pageSize", type: "number", default: 10, max: 25 },
    ],
    responseFields: ["id", "name", "isActive"],
  }),
  read({
    name: "list_promotions",
    domain: "products",
    module: "promotions",
    solves: "Listar promociones",
    endpoint: "GET /v1/pops/:popId/promotions",
    status: "documented",
    permissions: ["promotions:read"],
    params: [
      { name: "q", type: "string" },
      { name: "pageSize", type: "number", default: 10, max: 25 },
    ],
    responseFields: ["id", "name", "isActive"],
  }),
  write({
    name: "create_article",
    domain: "products",
    module: "articles",
    solves: "Crear un artículo",
    endpoint: "POST /v1/pops/:popId/articles",
    permissions: ["articles:create"],
    params: [{ name: "name", type: "string", required: true }],
    responseFields: ["id"],
  }),
  write({
    name: "update_article",
    domain: "products",
    module: "articles",
    solves: "Actualizar un artículo",
    endpoint: "PATCH /v1/pops/:popId/articles/:articleId",
    permissions: ["articles:update"],
    params: [{ name: "articleId", type: "string", required: true }],
    responseFields: ["id"],
  }),
  write({
    name: "delete_article",
    domain: "products",
    module: "articles",
    solves: "Eliminar un artículo",
    endpoint: "DELETE /v1/pops/:popId/articles/:articleId",
    permissions: ["articles:delete"],
    params: [{ name: "articleId", type: "string", required: true }],
    responseFields: ["success"],
  }),

  read({
    name: "list_purchases",
    domain: "purchases",
    module: "operations",
    solves: "Listar compras",
    endpoint: "GET /v1/pops/:popId/operations",
    status: "documented",
    permissions: ["operations:read"],
    params: [
      { name: "view", type: "enum", values: ["purchases"], default: "purchases" },
      { name: "pageSize", type: "number", default: 10, max: 25 },
    ],
    responseFields: ["id", "date", "total", "supplierName"],
  }),
  read({
    name: "list_purchase_orders",
    domain: "purchases",
    module: "purchase_orders",
    solves: "Listar órdenes de compra",
    endpoint: "GET /v1/pops/:popId/purchase-orders",
    status: "documented",
    permissions: ["purchase_orders:read"],
    params: [{ name: "pageSize", type: "number", default: 10, max: 25 }],
    responseFields: ["id", "date", "total"],
  }),
  write({
    name: "create_purchase_order",
    domain: "purchases",
    module: "purchase_orders",
    solves: "Crear una orden de compra",
    endpoint: "POST /v1/pops/:popId/purchase-orders",
    permissions: ["purchase_orders:create"],
    params: [],
    responseFields: ["id"],
  }),

  read({
    name: "inventory_summary",
    domain: "inventory",
    module: "inventory",
    solves: "Resumen de stock",
    endpoint: "GET /v1/pops/:popId/inventory/summary",
    status: "documented",
    permissions: ["inventory:read"],
    params: [],
    responseFields: ["totals", "attention"],
  }),
  read({
    name: "inventory_rows",
    domain: "inventory",
    module: "inventory",
    solves: "Filas de inventario",
    endpoint: "GET /v1/pops/:popId/inventory/rows",
    status: "documented",
    permissions: ["inventory:read"],
    params: [
      { name: "q", type: "string" },
      { name: "pageSize", type: "number", default: 10, max: 25 },
    ],
    responseFields: ["articleId", "quantity", "attention"],
  }),
  read({
    name: "inventory_expiry",
    domain: "inventory",
    module: "inventory",
    solves: "Stock próximo a vencer",
    endpoint: "GET /v1/pops/:popId/inventory/expiry",
    status: "documented",
    permissions: ["inventory:read"],
    params: [{ name: "pageSize", type: "number", default: 10, max: 25 }],
    responseFields: ["articleId", "expiryDate", "quantity"],
  }),
  write({
    name: "adjust_inventory",
    domain: "inventory",
    module: "inventory",
    solves: "Ajustar stock",
    endpoint: "POST /v1/pops/:popId/inventory/adjustments",
    permissions: ["inventory:create"],
    params: [{ name: "articleId", type: "string", required: true }],
    responseFields: ["success"],
  }),

  read({
    name: "list_clients",
    domain: "clients",
    module: "clients",
    solves: "Listar clientes",
    endpoint: "GET /v1/pops/:popId/clients",
    status: "documented",
    permissions: ["clients:read"],
    params: [
      { name: "q", type: "string" },
      { name: "pageSize", type: "number", default: 10, max: 25 },
    ],
    responseFields: ["id", "name", "isActive"],
  }),
  read({
    name: "receivables",
    domain: "clients",
    module: "current_accounts",
    solves: "Cuentas a cobrar de clientes",
    endpoint: "GET /v1/pops/:popId/current-accounts",
    status: "documented",
    permissions: ["current_accounts:read"],
    params: [
      { name: "direction", type: "enum", values: ["receivable"], default: "receivable" },
      { name: "pageSize", type: "number", default: 5, max: 10 },
    ],
    responseFields: ["partyName", "balance", "overdueAmount"],
  }),
  write({
    name: "create_client",
    domain: "clients",
    module: "clients",
    solves: "Crear un cliente",
    endpoint: "POST /v1/pops/:popId/clients",
    permissions: ["clients:create"],
    params: [{ name: "name", type: "string", required: true }],
    responseFields: ["id"],
  }),

  read({
    name: "list_suppliers",
    domain: "suppliers",
    module: "suppliers",
    solves: "Listar proveedores",
    endpoint: "GET /v1/pops/:popId/suppliers/table",
    status: "documented",
    permissions: ["suppliers:read"],
    params: [
      { name: "q", type: "string" },
      { name: "pageSize", type: "number", default: 10, max: 25 },
    ],
    responseFields: ["id", "name", "isActive"],
  }),
  write({
    name: "create_supplier",
    domain: "suppliers",
    module: "suppliers",
    solves: "Crear un proveedor",
    endpoint: "POST /v1/pops/:popId/suppliers",
    permissions: ["suppliers:create"],
    params: [{ name: "name", type: "string", required: true }],
    responseFields: ["id"],
  }),

  read({
    name: "treasury_balances",
    domain: "treasury",
    module: "treasury",
    solves: "Saldos de tesorería",
    endpoint: "GET /v1/pops/:popId/treasury/balances",
    status: "documented",
    permissions: ["payment_methods:read"],
    params: [],
    responseFields: ["accountId", "name", "balance"],
  }),
  read({
    name: "cash_registers",
    domain: "cash",
    module: "cash_registers",
    solves: "Estado de cajas",
    endpoint: "GET /v1/pops/:popId/cash-registers",
    status: "documented",
    permissions: ["cash_registers:read"],
    params: [],
    responseFields: ["id", "name", "isOpen"],
  }),
  write({
    name: "open_cash_session",
    domain: "cash",
    module: "cash_registers",
    solves: "Abrir un turno de caja",
    endpoint: "POST /v1/pops/:popId/cash-registers/:registerId/sessions",
    permissions: ["cash_registers:create"],
    params: [{ name: "registerId", type: "string", required: true }],
    responseFields: ["sessionId"],
  }),

  read({
    name: "list_expenses",
    domain: "expenses",
    module: "expenses",
    solves: "Gastos del mes",
    endpoint: "GET /v1/pops/:popId/expenses",
    status: "documented",
    permissions: ["expenses:read"],
    params: [
      { name: "year", type: "number" },
      { name: "month", type: "number" },
    ],
    responseFields: ["id", "dueDate", "total", "paid"],
  }),
  write({
    name: "create_expense",
    domain: "expenses",
    module: "expenses",
    solves: "Registrar un gasto",
    endpoint: "POST /v1/pops/:popId/expenses",
    permissions: ["expenses:create"],
    params: [],
    responseFields: ["id"],
  }),

  read({
    name: "trial_balance",
    domain: "reports",
    module: "reports",
    solves: "Balance de sumas y saldos",
    endpoint: "GET /v1/pops/:popId/reports/trial-balance",
    status: "documented",
    permissions: ["reports:read"],
    params: [
      { name: "from", type: "date" },
      { name: "to", type: "date" },
    ],
    responseFields: ["accounts", "totals"],
  }),
  read({
    name: "balance_sheet",
    domain: "reports",
    module: "reports",
    solves: "Balance general",
    endpoint: "GET /v1/pops/:popId/reports/balance-sheet",
    status: "documented",
    permissions: ["reports:read"],
    params: [{ name: "asOf", type: "date" }],
    responseFields: ["assets", "liabilities", "equity"],
  }),
  read({
    name: "cash_flow",
    domain: "reports",
    module: "reports",
    solves: "Flujo de fondos",
    endpoint: "GET /v1/pops/:popId/reports/cash-flow",
    status: "documented",
    permissions: ["reports:read"],
    params: [
      { name: "from", type: "date" },
      { name: "to", type: "date" },
    ],
    responseFields: ["inflows", "outflows"],
  }),

  read({
    name: "hr_overview",
    domain: "hr",
    module: "hr",
    solves: "Resumen de personas del POP",
    endpoint: "GET /v1/pops/:popId/hr",
    status: "documented",
    permissions: ["hr:read"],
    params: [],
    responseFields: ["employees", "members"],
  }),
  write({
    name: "register_employee_payment",
    domain: "hr",
    module: "hr",
    solves: "Registrar un pago de sueldo",
    endpoint: "POST /v1/pops/:popId/hr/employees/:employeeId/payments",
    permissions: ["hr:create"],
    params: [{ name: "employeeId", type: "string", required: true }],
    responseFields: ["success"],
  }),

  read({
    name: "manufacturing_workspace",
    domain: "manufacturing",
    module: "manufacturing",
    solves: "Ver producción del período",
    endpoint: "GET /v1/pops/:popId/manufacturing",
    status: "documented",
    permissions: ["manufacturing:read"],
    params: [PERIOD],
    responseFields: ["runs", "totals"],
  }),
  write({
    name: "create_manufacturing_run",
    domain: "manufacturing",
    module: "manufacturing",
    solves: "Crear una corrida de producción",
    endpoint: "POST /v1/pops/:popId/manufacturing",
    permissions: ["manufacturing:create"],
    params: [],
    responseFields: ["id"],
  }),

  read({
    name: "list_services",
    domain: "services",
    module: "services",
    solves: "Listar servicios",
    endpoint: "GET /v1/pops/:popId/services",
    status: "documented",
    permissions: ["services:read"],
    params: [{ name: "pageSize", type: "number", default: 10, max: 25 }],
    responseFields: ["id", "name", "isActive"],
  }),
  read({
    name: "overdue_service_charges",
    domain: "services",
    module: "operations",
    solves: "Cargos de servicio vencidos",
    endpoint: "GET /v1/pops/:popId/operations",
    status: "documented",
    permissions: ["operations:read"],
    params: [
      { name: "view", type: "enum", values: ["services"], default: "services" },
      { name: "serviceStatus", type: "enum", values: ["overdue"], default: "overdue" },
    ],
    responseFields: ["id", "dueDate", "status"],
  }),

  read({
    name: "pop_settings",
    domain: "settings",
    module: "settings",
    solves: "Leer configuración del negocio",
    endpoint: "GET /v1/pops/:popId/settings",
    status: "documented",
    permissions: ["settings:read"],
    params: [],
    responseFields: ["name", "fiscal"],
  }),
  write({
    name: "update_pop_settings",
    domain: "settings",
    module: "settings",
    solves: "Cambiar datos del comercio",
    endpoint: "PATCH /v1/pops/:popId/settings/business",
    permissions: ["settings:update"],
    params: [],
    responseFields: ["success"],
  }),

  read({
    name: "chat_workspace",
    domain: "chat",
    module: "chat",
    solves: "Listar canales internos",
    endpoint: "GET /v1/pops/:popId/chat",
    status: "documented",
    permissions: ["chat:read"],
    params: [],
    responseFields: ["channels"],
  }),
  write({
    name: "send_chat_message",
    domain: "chat",
    module: "chat",
    solves: "Enviar un mensaje de canal",
    endpoint: "POST /v1/pops/:popId/chat/:channelId/messages",
    permissions: ["chat:create"],
    params: [
      { name: "channelId", type: "string", required: true },
      { name: "body", type: "string", required: true },
    ],
    responseFields: ["id"],
  }),

  read({
    name: "list_printers",
    domain: "settings",
    module: "printers",
    solves: "Listar impresoras del POP",
    endpoint: "GET /v1/pops/:popId/printers",
    status: "documented",
    permissions: ["printers:read"],
    params: [],
    responseFields: ["id", "name"],
  }),
  read({
    name: "list_comanda_stations",
    domain: "settings",
    module: "comanda_stations",
    solves: "Listar estaciones de comanda",
    endpoint: "GET /v1/pops/:popId/comanda-stations",
    status: "documented",
    permissions: ["recipes:read"],
    params: [],
    responseFields: ["id", "name"],
  }),
  read({
    name: "list_expense_categories",
    domain: "expenses",
    module: "expense_categories",
    solves: "Listar categorías de gasto",
    endpoint: "GET /v1/pops/:popId/expense-categories",
    status: "documented",
    permissions: ["expenses:read"],
    params: [],
    responseFields: ["id", "name"],
  }),
  read({
    name: "list_recipe_categories",
    domain: "products",
    module: "recipe_categories",
    solves: "Listar categorías de recetas",
    endpoint: "GET /v1/pops/:popId/recipe-categories",
    status: "documented",
    permissions: ["recipes:read"],
    params: [],
    responseFields: ["id", "name"],
  }),
  read({
    name: "list_service_categories",
    domain: "services",
    module: "service_categories",
    solves: "Listar categorías de servicios",
    endpoint: "GET /v1/pops/:popId/service-categories",
    status: "documented",
    permissions: ["services:read"],
    params: [],
    responseFields: ["id", "name"],
  }),
  read({
    name: "list_arca_sale_points",
    domain: "settings",
    module: "arca_sale_points",
    solves: "Listar puntos de venta ARCA",
    endpoint: "GET /v1/pops/:popId/arca-sale-points",
    status: "documented",
    permissions: ["invoices:read"],
    params: [],
    responseFields: ["id", "name"],
  }),
  read({
    name: "list_invoices",
    domain: "other",
    module: "invoices",
    solves: "Listar comprobantes fiscales",
    endpoint: "GET /v1/pops/:popId/invoices",
    status: "documented",
    permissions: ["invoices:read"],
    params: [{ name: "pageSize", type: "number", default: 10, max: 25 }],
    responseFields: ["id", "status", "total"],
  }),
  read({
    name: "list_quotes",
    domain: "other",
    module: "quotes",
    solves: "Listar presupuestos",
    endpoint: "GET /v1/pops/:popId/quotes",
    status: "documented",
    permissions: ["quotes:read"],
    params: [{ name: "pageSize", type: "number", default: 10, max: 25 }],
    responseFields: ["id", "date", "total"],
  }),
  write({
    name: "create_quote",
    domain: "other",
    module: "quotes",
    solves: "Crear un presupuesto",
    endpoint: "POST /v1/pops/:popId/quotes",
    permissions: ["quotes:create"],
    params: [],
    responseFields: ["id"],
  }),
]

function withStrategy(
  entry: ChatRootsyRegistryEntry,
): ChatRootsyRegistryEntry {
  return {
    ...entry,
    strategy: entry.strategy ?? getChatRootsyToolStrategy(entry.name) ?? undefined,
  }
}

export function enabledChatRootsyTools() {
  return CHAT_ROOTSY_TOOL_REGISTRY.filter((row) => row.status === "enabled").map(
    withStrategy,
  )
}

export function getChatRootsyRegistryEntry(name: string) {
  const entry = CHAT_ROOTSY_TOOL_REGISTRY.find((row) => row.name === name)
  return entry ? withStrategy(entry) : null
}
