import {
  Building2,
  CreditCard,
  Home,
  LayoutDashboard,
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
]

export function backofficeNavItem(pathname: string): BackofficeNavItem | null {
  return (
    BACKOFFICE_NAV.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? null
  )
}
