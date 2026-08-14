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
  /** Clave para `getRootsModuleIcon`. */
  iconModuleKey: string
  /** Si está definido, al menos uno de estos módulos debe estar habilitado. */
  requiresAnyModule?: string[]
  /** Filtros contextuales que aplican a esta sección. */
  filterKeys?: Array<"channel" | "supplier">
  /** Sección aún sin datos reales en Rootsy. */
  comingSoon?: boolean
}

export const STATISTICS_SECTIONS: StatisticsSectionDef[] = [
  {
    id: "sales",
    label: "Ventas",
    description: "Facturación, cantidad de operaciones y ticket promedio",
    iconModuleKey: "sale",
    filterKeys: ["channel"],
  },
  {
    id: "profitability",
    label: "Rentabilidad",
    description: "Margen, costos, gastos y resultado del período",
    iconModuleKey: "accounting",
  },
  {
    id: "products",
    label: "Productos",
    description: "Artículos más vendidos y participación en ventas",
    iconModuleKey: "stock",
    filterKeys: ["channel"],
  },
  {
    id: "channels",
    label: "Canales",
    description: "Mostrador, mesas, POS y mix de ventas",
    iconModuleKey: "mesas",
    requiresAnyModule: ["mesas", "mostrador", "services", "sale"],
    filterKeys: ["channel"],
  },
  {
    id: "purchases",
    label: "Compras",
    description: "Importes, operaciones y principales proveedores",
    iconModuleKey: "purchases",
    requiresAnyModule: ["purchases"],
    filterKeys: ["supplier"],
  },
  {
    id: "inventory",
    label: "Inventario",
    description: "Movimientos de stock y artículos con mayor rotación",
    iconModuleKey: "inventory",
    requiresAnyModule: ["stock", "inventory"],
  },
  {
    id: "clients",
    label: "Clientes",
    description: "Activos, nuevos, recurrentes y ticket por cliente",
    iconModuleKey: "clients",
    requiresAnyModule: ["clients"],
    filterKeys: ["channel"],
  },
  {
    id: "finance",
    label: "Finanzas",
    description: "Ingresos, egresos, flujo neto y medios de pago",
    iconModuleKey: "accounts",
    filterKeys: ["channel"],
  },
  {
    id: "services",
    label: "Servicios",
    description: "Facturación y evolución de servicios vendidos",
    iconModuleKey: "services",
    requiresAnyModule: ["services", "active_services"],
    comingSoon: true,
  },
  {
    id: "manufacturing",
    label: "Fabricación",
    description: "Producción, costos e insumos consumidos",
    iconModuleKey: "manufacturing",
    requiresAnyModule: ["manufacturing"],
    comingSoon: true,
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
