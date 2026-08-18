import type { LucideIcon } from "lucide-react"
import {
  Activity,
  ArrowLeftRight,
  Banknote,
  Bell,
  BookOpen,
  Briefcase,
  Calculator,
  ClipboardList,
  Cog,
  CreditCard,
  Factory,
  FileBarChart,
  FileCheck,
  FileText,
  Home,
  Landmark,
  MessageSquare,
  Monitor,
  Package,
  PieChart,
  Printer,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  UserCog,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react"
import type { PopAccessModule } from "@/app/home/homeUserDataTypes"
import { canAccessMenuItem } from "@/lib/menuPermissions"
import { canAccessMenuItemFromPopAccess } from "@/lib/menuPopAccess"

export type MenuItemLink =
  | "sale"
  | "quotes"
  | "purchase-orders"
  | "mesas"
  | "mostrador"
  | "operations"
  | "purchases"
  | "expenses"
  | "suppliers"
  | "invoices"
  | "settings"
  | "hr"
  | "articles"
  | "clients"
  | "accounts"
  | "printers"
  | "accounting"
  | "cash-registers"
  | "inventory"
  | "recipes"
  | "services"
  | "active-services"
  | "cobrar-servicios"
  | "promotions"
  | "reports"
  | "statistics"
  | "checks"
  | "section"

/** Identificador de un acceso directo del dock (solo rutas navegables). */
export type MenuDockItemId = "home" | Exclude<MenuItemLink, "section">

export type MenuItemDef = {
  name: string
  icon: LucideIcon
  badge?: string
  link: MenuItemLink
  /** Key del módulo en el catálogo de suscripción (estable para React keys). */
  moduleKey?: string
}

export type MenuSectionDef = {
  title: string
  items: MenuItemDef[]
}

export type MenuSectionKey = keyof typeof menuSectionsRaw

export type MenuCatalogItem = {
  id: MenuDockItemId
  name: string
  icon: LucideIcon
  badge?: string
  sectionKey: MenuSectionKey
  sectionTitle: string
  link?: MenuItemLink
  href?: "home"
}

export const DEFAULT_MENU_DOCK_IDS: MenuDockItemId[] = [
  "home",
  "sale",
  "mesas",
  "articles",
  "settings",
]

export const menuSectionsRaw: Record<string, MenuSectionDef> = {
  operar: {
    title: "Operar",
    items: [
      { name: "Vender", icon: ShoppingCart, badge: "HOT", link: "sale" },
      { name: "Mostrador", icon: Monitor, link: "mostrador" },
      { name: "Mesas", icon: UtensilsCrossed, badge: "12", link: "mesas" },
      { name: "Comprar", icon: ShoppingBag, link: "purchases" },
      { name: "Gastos", icon: Receipt, link: "expenses" },
      { name: "Fabricación", icon: Factory, link: "section" },
      { name: "Stock", icon: Package, badge: "3", link: "articles" },
      { name: "Clientes", icon: Users, link: "clients" },
      { name: "Proveedores", icon: Truck, link: "suppliers" },
      { name: "Cuentas Ctes", icon: CreditCard, link: "section" },
      { name: "Promociones", icon: Sparkles, link: "promotions" },
      { name: "Recetas", icon: BookOpen, link: "recipes" },
      { name: "Servicios", icon: Briefcase, link: "services" },
      { name: "Vender servicio", icon: Banknote, badge: "NUEVO", link: "cobrar-servicios" },
      { name: "Servicios activos", icon: Activity, link: "active-services" },
    ],
  },
  administrar: {
    title: "Administrar",
    items: [
      { name: "Presupuestos", icon: FileText, link: "section" },
      { name: "Estadísticas", icon: PieChart, link: "statistics", moduleKey: "statistics" },
      { name: "Operaciones", icon: Activity, link: "operations" },
      { name: "Movimientos", icon: ArrowLeftRight, link: "section" },
      { name: "Inventario", icon: ClipboardList, link: "inventory" },
      { name: "Facturas", icon: FileBarChart, link: "invoices" },
      { name: "Reportes", icon: FileCheck, link: "reports" },
      { name: "Cheques", icon: Wallet, link: "checks" },
      { name: "Órdenes", icon: FileText, link: "section" },
    ],
  },
  configurar: {
    title: "Configurar",
    items: [
      { name: "Mensajes", icon: MessageSquare, link: "section" },
      { name: "Alertas", icon: Bell, badge: "8", link: "section" },
      { name: "Cuentas", icon: Landmark, link: "accounts" },
      { name: "Cajas", icon: Calculator, link: "cash-registers" },
      { name: "Contabilidad", icon: Landmark, link: "accounting" },
      { name: "RRHH", icon: UserCog, link: "hr" },
      { name: "Impresoras", icon: Printer, link: "printers" },
      { name: "Ajustes", icon: Cog, link: "settings" },
    ],
  },
}

const HOME_CATALOG_ITEM: MenuCatalogItem = {
  id: "home",
  name: "Inicio",
  icon: Home,
  sectionKey: "operar",
  sectionTitle: "General",
  href: "home",
}

const catalogById = new Map<MenuDockItemId, MenuCatalogItem>()

catalogById.set("home", HOME_CATALOG_ITEM)

for (const [sectionKey, section] of Object.entries(menuSectionsRaw) as Array<
  [MenuSectionKey, MenuSectionDef]
>) {
  for (const item of section.items) {
    if (item.link === "section") continue
    const id = item.link as MenuDockItemId
    if (!catalogById.has(id)) {
      catalogById.set(id, {
        id,
        name: item.name,
        icon: item.icon,
        badge: item.badge,
        sectionKey,
        sectionTitle: section.title,
        link: item.link,
      })
    }
  }
}

export function getMenuCatalogItem(
  id: MenuDockItemId,
): MenuCatalogItem | undefined {
  return catalogById.get(id)
}

export function listMenuCatalogSections(): Array<{
  title: string
  items: MenuCatalogItem[]
}> {
  const sections = new Map<string, MenuCatalogItem[]>()

  const push = (item: MenuCatalogItem) => {
    const list = sections.get(item.sectionTitle) ?? []
    list.push(item)
    sections.set(item.sectionTitle, list)
  }

  push(HOME_CATALOG_ITEM)

  for (const section of Object.values(menuSectionsRaw)) {
    for (const item of section.items) {
      if (item.link === "section") continue
      const catalogItem = getMenuCatalogItem(item.link as MenuDockItemId)
      if (catalogItem) push(catalogItem)
    }
  }

  return Array.from(sections.entries()).map(([title, items]) => ({
    title,
    items,
  }))
}

export function canUseMenuDockItem(
  id: MenuDockItemId,
  permissionKeys: readonly string[],
): boolean {
  if (id === "home") return true
  const item = getMenuCatalogItem(id)
  if (!item?.link) return false
  return canAccessMenuItem(permissionKeys, item.link)
}

export function canUseMenuDockItemFromPopAccess(
  id: MenuDockItemId,
  enabledModules: readonly PopAccessModule[],
): boolean {
  if (id === "home") return true
  const item = getMenuCatalogItem(id)
  if (!item?.link) return false
  return canAccessMenuItemFromPopAccess(enabledModules, item.link)
}

export function resolveMenuDockCatalogItems(
  ids: readonly MenuDockItemId[],
  enabledModules: readonly PopAccessModule[],
): MenuCatalogItem[] {
  const out: MenuCatalogItem[] = []
  const seen = new Set<MenuDockItemId>()
  for (const id of ids) {
    if (seen.has(id)) continue
    if (!canUseMenuDockItemFromPopAccess(id, enabledModules)) continue
    const item = getMenuCatalogItem(id)
    if (!item) continue
    seen.add(id)
    out.push(item)
  }
  return out
}

export function isMenuDockItemId(value: unknown): value is MenuDockItemId {
  return typeof value === "string" && catalogById.has(value as MenuDockItemId)
}
