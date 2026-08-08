export type SaleCatalogPriceListOption = {
  id: string
  label: string
}

/** Opciones demo hasta conectar listas de precio reales del POP. */
export const SALE_CATALOG_DEFAULT_PRICE_LISTS: SaleCatalogPriceListOption[] = [
  { id: "principal", label: "Principal" },
  { id: "mayorista", label: "Mayorista" },
  { id: "delivery", label: "Delivery" },
]

export const SALE_CATALOG_DEFAULT_PRICE_LIST_ID = "principal"

export const SALE_CATALOG_PRICE_LIST_HELP =
  "Lista de precios. Al cambiarla se aplican los precios de esa lista a todos los artículos. Si un artículo no tiene precio en esa lista, se usa el de la lista principal."
