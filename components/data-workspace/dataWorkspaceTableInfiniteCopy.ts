export const DATA_WORKSPACE_TABLE_INFINITE_WORLDS = [
  "articles",
  "services",
  "recipes",
  "manufacturing",
  "clients",
  "suppliers",
  "promotions",
  "quotes",
  "purchase-orders",
  "invoices",
  "checks",
  "current-accounts",
  "operations",
  "audit",
] as const

export type DataWorkspaceTableInfiniteWorld =
  (typeof DATA_WORKSPACE_TABLE_INFINITE_WORLDS)[number]

const COPY: Record<DataWorkspaceTableInfiniteWorld, string> = {
  articles: "Estoy trayendo más artículos",
  services: "Estoy trayendo más servicios",
  recipes: "Estoy trayendo más recetas",
  manufacturing: "Estoy trayendo más producciones",
  clients: "Estoy trayendo más clientes",
  suppliers: "Estoy trayendo más proveedores",
  promotions: "Estoy trayendo más promociones",
  quotes: "Estoy trayendo más presupuestos",
  "purchase-orders": "Estoy trayendo más órdenes de compra",
  invoices: "Estoy trayendo más comprobantes",
  checks: "Estoy trayendo más cheques",
  "current-accounts": "Estoy trayendo más cuentas",
  operations: "Estoy trayendo más operaciones",
  audit: "Estoy trayendo más registros",
}

const FALLBACK = "Estoy trayendo más resultados"

export function dataWorkspaceTableInfiniteCopy(
  world: DataWorkspaceTableInfiniteWorld,
) {
  return COPY[world] ?? FALLBACK
}
