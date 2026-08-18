import { MENU_ROOTSY_CATALOG_MESAS } from "@/lib/menu/menuRootsyCatalogMesas"
import { MENU_ROOTSY_CATALOG_MOSTRADOR } from "@/lib/menu/menuRootsyCatalogMostrador"
import { MENU_ROOTSY_CATALOG_SALE_ONLY } from "@/lib/menu/menuRootsyCatalogSaleOnly"
import { MENU_ROOTSY_CATALOG_SERVICES } from "@/lib/menu/menuRootsyCatalogServices"
import type {
  MenuRootsyCatalogSuggestion,
  MenuRootsySuggestionProfile,
} from "@/lib/menu/menuRootsySuggestionCatalogTypes"

export const MENU_ROOTSY_SUGGESTION_CATALOG: MenuRootsyCatalogSuggestion[] = [
  ...MENU_ROOTSY_CATALOG_SALE_ONLY,
  ...MENU_ROOTSY_CATALOG_MOSTRADOR,
  ...MENU_ROOTSY_CATALOG_MESAS,
  ...MENU_ROOTSY_CATALOG_SERVICES,
]

const CATALOG_BY_ID = new Map(
  MENU_ROOTSY_SUGGESTION_CATALOG.map((entry) => [entry.id, entry]),
)

const PROFILE_CATALOG: Record<
  MenuRootsySuggestionProfile,
  MenuRootsyCatalogSuggestion[]
> = {
  sale_only: MENU_ROOTSY_CATALOG_SALE_ONLY,
  mostrador: MENU_ROOTSY_CATALOG_MOSTRADOR,
  mesas: MENU_ROOTSY_CATALOG_MESAS,
  services: MENU_ROOTSY_CATALOG_SERVICES,
}

export function getMenuRootsyCatalogSuggestion(
  id: string,
): MenuRootsyCatalogSuggestion | null {
  return CATALOG_BY_ID.get(id) ?? null
}

export function getMenuRootsyCatalogForProfile(
  profile: MenuRootsySuggestionProfile,
): MenuRootsyCatalogSuggestion[] {
  return PROFILE_CATALOG[profile]
}
