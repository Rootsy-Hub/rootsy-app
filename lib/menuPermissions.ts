import { POP_PAGES, type PopPageKey } from "@/lib/popPageCrudConstants"

export function getReadPermissionKeyForMenuLink(
  menuLink?: string,
): string | null {
  if (!menuLink || menuLink === "section") return null
  if (menuLink === "comandas") return "mesas:read"
  if (!(menuLink in POP_PAGES)) return null
  return POP_PAGES[menuLink as PopPageKey].permissions.read
}

export function canAccessMenuItem(
  permissionKeys: readonly string[],
  menuLink?: string,
): boolean {
  if (menuLink === "comandas") {
    return (
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
