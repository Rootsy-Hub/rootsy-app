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
    iconModuleKey: "reports",
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
    filterKeys: ["supplier"],
  },
  {
    id: "inventory",
    label: "Inventario",
    description: "Stock actual, alertas y rotación de artículos",
    iconModuleKey: "inventory",
  },
  {
    id: "clients",
    label: "Clientes",
    description: "Activos, nuevos, recurrentes y ticket por cliente",
    iconModuleKey: "clients",
  },
  {
    id: "suppliers",
    label: "Proveedores",
    description: "Compras, artículos y categorías por proveedor",
    iconModuleKey: "suppliers",
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
    comingSoon: true,
  },
  {
    id: "manufacturing",
    label: "Fabricación",
    description: "Producción, costos e insumos consumidos",
    iconModuleKey: "manufacturing",
    comingSoon: true,
  },
]

export function statisticsSectionById(
  id: StatisticsSectionId,
): StatisticsSectionDef | undefined {
  return STATISTICS_SECTIONS.find((s) => s.id === id)
}
