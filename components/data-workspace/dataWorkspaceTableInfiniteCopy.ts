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

const END_COPY: Record<DataWorkspaceTableInfiniteWorld, string> = {
  articles:
    "Hasta acá. No me queda ningún artículo más para mostrar.",
  services:
    "Hasta acá. No me queda ningún servicio más para mostrar.",
  recipes:
    "Hasta acá. No me queda ninguna receta más para mostrar.",
  manufacturing:
    "Hasta acá. No me queda ninguna producción más para mostrar.",
  clients:
    "Hasta acá. No me queda ningún cliente más para mostrar.",
  suppliers:
    "Hasta acá. No me queda ningún proveedor más para mostrar.",
  promotions:
    "Hasta acá. No me queda ninguna promoción más para mostrar.",
  quotes:
    "Hasta acá. No me queda ningún presupuesto más para mostrar.",
  "purchase-orders":
    "Hasta acá. No me queda ninguna orden de compra más para mostrar.",
  invoices:
    "Hasta acá. No me queda ningún comprobante más para mostrar.",
  checks: "Hasta acá. No me queda ningún cheque más para mostrar.",
  "current-accounts":
    "Hasta acá. No me queda ninguna cuenta más para mostrar.",
  operations:
    "Hasta acá. No me queda ninguna operación más para mostrar.",
  audit: "Hasta acá. No me queda ningún registro más para mostrar.",
}

const END_FALLBACK = "Hasta acá. No me queda nada más para mostrar."

/** Copy del bloque pensando (DataWorkspaceTableInfiniteThinkingCopy). */

export function dataWorkspaceTableInfiniteCopy(
  world: DataWorkspaceTableInfiniteWorld,
) {
  return COPY[world] ?? FALLBACK
}

export function dataWorkspaceTableInfiniteEndCopy(
  world: DataWorkspaceTableInfiniteWorld,
) {
  return END_COPY[world] ?? END_FALLBACK
}
