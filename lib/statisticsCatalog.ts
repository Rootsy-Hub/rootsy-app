export type StatisticsSectionId =
  | "sales"
  | "profitability"
  | "products"
  | "channels"
  | "purchases"
  | "inventory"
  | "clients"
  | "finance"
  | "services"
  | "manufacturing"

export type StatisticsSectionDef = {
  id: StatisticsSectionId
  label: string
  description: string
  /** Si está definido, al menos uno de estos módulos debe estar habilitado. */
  requiresAnyModule?: string[]
}

export const STATISTICS_SECTIONS: StatisticsSectionDef[] = [
  {
    id: "sales",
    label: "Ventas",
    description: "Evolución, facturación, cantidad y ticket promedio",
  },
  {
    id: "profitability",
    label: "Rentabilidad",
    description: "Margen, costos, gastos y resultado",
  },
  {
    id: "products",
    label: "Productos / Rubros",
    description: "Más vendidos, facturación por producto",
  },
  {
    id: "channels",
    label: "Canales de venta",
    description: "Mostrador, mesas, POS y participación",
    requiresAnyModule: ["mesas", "mostrador", "services", "sale"],
  },
  {
    id: "purchases",
    label: "Compras",
    description: "Evolución, proveedores e importes",
    requiresAnyModule: ["purchases"],
  },
  {
    id: "inventory",
    label: "Inventario",
    description: "Movimiento, rotación y valorización",
    requiresAnyModule: ["stock", "inventory"],
  },
  {
    id: "clients",
    label: "Clientes",
    description: "Nuevos, recurrentes y facturación por cliente",
    requiresAnyModule: ["clients"],
  },
  {
    id: "finance",
    label: "Finanzas",
    description: "Ingresos, egresos y medios de pago",
  },
  {
    id: "services",
    label: "Servicios",
    description: "Servicios vendidos y evolución",
    requiresAnyModule: ["services", "active_services"],
  },
  {
    id: "manufacturing",
    label: "Fabricación",
    description: "Producción, costos e insumos",
    requiresAnyModule: ["manufacturing"],
  },
]

export function visibleStatisticsSections(
  enabledModuleKeys: readonly string[],
): StatisticsSectionDef[] {
  const keys = new Set(enabledModuleKeys)
  return STATISTICS_SECTIONS.filter((section) => {
    if (!section.requiresAnyModule?.length) return true
    return section.requiresAnyModule.some((key) => keys.has(key))
  })
}

export function statisticsSectionById(
  id: StatisticsSectionId,
): StatisticsSectionDef | undefined {
  return STATISTICS_SECTIONS.find((s) => s.id === id)
}
