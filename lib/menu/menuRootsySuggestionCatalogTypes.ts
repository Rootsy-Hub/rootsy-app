/** Perfiles de negocio — agrupan las 20 sugerencias base de cada tipo. */
export type MenuRootsySuggestionProfile =
  | "sale_only"
  | "mostrador"
  | "mesas"
  | "services"

/** Qué datos del negocio usar para ejemplos concretos en el detalle. */
export type MenuRootsySuggestionDataKey =
  | "total_sales"
  | "sales_delta"
  | "avg_ticket"
  | "gross_margin"
  | "peak_hour"
  | "slow_hour"
  | "top_volume_product"
  | "top_profit_product"
  | "hidden_gem_product"

export type MenuRootsyCatalogSuggestion = {
  id: string
  profile: MenuRootsySuggestionProfile
  /** Texto corto en la burbuja de Rootsy — tono iniciado, sin jerga. */
  teaser: string
  title: string
  /** Explicación estática para el panel — sin datos del negocio. */
  explanation: string
  dataKeys: MenuRootsySuggestionDataKey[]
  /** Todos estos módulos deben tener lectura; si falta uno, no se muestra. */
  requiredModules: string[]
  ctaModuleKeys: string[]
}

export type MenuRootsySuggestionDetail = {
  id: string
  title: string
  /** Mensaje único de Rootsy — amistoso, con valor útil. */
  message: string
  hasDataSupport: boolean
  cta: { label: string; href: string; moduleKey: string } | null
}
