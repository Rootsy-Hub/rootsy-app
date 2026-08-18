import {
  Building2,
  CreditCard,
  Home,
  LayoutDashboard,
  Mail,
  Store,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react"

export type BackofficeNavItem = {
  id: string
  href: string
  label: string
  icon: LucideIcon
  children?: BackofficeNavItem[]
}

export const BACKOFFICE_NAV: BackofficeNavItem[] = [
  {
    id: "inicio",
    href: "/backoffice/inicio",
    label: "Inicio",
    icon: Home,
  },
  {
    id: "dashboard",
    href: "/backoffice/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "clientes",
    href: "/backoffice/clientes",
    label: "Clientes",
    icon: UserCircle,
  },
  {
    id: "usuarios",
    href: "/backoffice/usuarios",
    label: "Usuarios",
    icon: Users,
  },
  {
    id: "organizaciones",
    href: "/backoffice/organizaciones",
    label: "Organizaciones",
    icon: Building2,
  },
  {
    id: "pops",
    href: "/backoffice/pops",
    label: "Puntos de venta",
    icon: Store,
  },
  {
    id: "planes",
    href: "/backoffice/planes",
    label: "Planes",
    icon: CreditCard,
  },
  {
    id: "emails",
    href: "/backoffice/emails",
    label: "Correos",
    icon: Mail,
  },
]

function navMatches(item: BackofficeNavItem, pathname: string): boolean {
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function flattenNav(items: readonly BackofficeNavItem[]): BackofficeNavItem[] {
  return items.flatMap((item) =>
    item.children?.length ? [item, ...item.children] : [item],
  )
}

export function backofficeNavItem(pathname: string): BackofficeNavItem | null {
  const matches = flattenNav(BACKOFFICE_NAV)
    .filter((item) => navMatches(item, pathname))
    .sort((a, b) => b.href.length - a.href.length)
  return matches[0] ?? null
}
