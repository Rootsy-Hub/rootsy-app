export type SaleCatalogPriceListOption = {
  id: string
  label: string
}

/** Opciones demo hasta conectar listas de precio reales del POP. */
export const SALE_CATALOG_DEFAULT_PRICE_LISTS: SaleCatalogPriceListOption[] = [
  { id: "mostrador", label: "Mostrador" },
  { id: "mayorista", label: "Mayorista" },
  { id: "delivery", label: "Delivery" },
]

export const SALE_CATALOG_DEFAULT_PRICE_LIST_ID = "mostrador"
