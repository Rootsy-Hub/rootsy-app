export type StatisticsSectionId =
  | "sales"
  | "profitability"
  | "products"
  | "purchases"
  | "inventory"
  | "clients"
  | "suppliers"
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
    description: "",
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
    description: "Rentabilidad, participación y ventas por categoría",
    iconModuleKey: "stock",
    filterKeys: ["channel"],
  },
  {
    id: "purchases",
    label: "Compras",
    description: "Importes, operaciones y principales compradores",
    iconModuleKey: "purchases",
    requiresAnyModule: ["purchases"],
    filterKeys: ["supplier"],
  },
  {
    id: "inventory",
    label: "Inventario",
    description: "Stock actual, alertas y rotación de artículos",
    iconModuleKey: "inventory",
    requiresAnyModule: ["stock", "inventory"],
  },
  {
    id: "clients",
    label: "Clientes",
    description: "Activos, nuevos, recurrentes y ticket por cliente",
    iconModuleKey: "clients",
    requiresAnyModule: ["clients"],
  },
  {
    id: "suppliers",
    label: "Proveedores",
    description: "Compras, artículos y categorías por proveedor",
    iconModuleKey: "suppliers",
    requiresAnyModule: ["suppliers"],
  },
  {
    id: "finance",
    label: "Finanzas",
    description: "Ingresos, egresos, neto y margen en cuentas de tesorería",
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
