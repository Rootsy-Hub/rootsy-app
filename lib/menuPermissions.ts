import { POP_PAGES, type PopPageKey } from "@/lib/popPageCrudConstants"

export function getReadPermissionKeyForMenuLink(
  menuLink?: string,
): string | null {
  if (!menuLink || menuLink === "section") return null
  if (menuLink === "comandas") return "comandas:read"
  if (menuLink === "purchase-orders") {
    return POP_PAGES.purchase_orders.permissions.read
  }
  if (menuLink === "cash-registers") {
    return POP_PAGES["cash-registers"].permissions.read
  }
  if (menuLink === "current-accounts") {
    return POP_PAGES["current-accounts"].permissions.read
  }
  if (menuLink === "cobrar-servicios") {
    return POP_PAGES["cobrar-servicios"].permissions.read
  }
  if (!(menuLink in POP_PAGES)) return null
  return POP_PAGES[menuLink as PopPageKey].permissions.read
}

export function canAccessMenuItem(
  permissionKeys: readonly string[],
  menuLink?: string,
): boolean {
  if (menuLink === "comandas") {
    return (
      permissionKeys.includes("comandas:read") ||
      permissionKeys.includes("mesas:read") ||
      permissionKeys.includes("mostrador:read")
    )
  }
  const readKey = getReadPermissionKeyForMenuLink(menuLink)
  if (readKey === null) {
    return !menuLink || menuLink === "section"
  }
  return permissionKeys.includes(readKey)
}
