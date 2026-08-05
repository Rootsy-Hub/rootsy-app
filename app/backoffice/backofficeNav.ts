import {
  CreditCard,
  Store,
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
    id: "tipos",
    href: "/backoffice/tipos",
    label: "Planes de subscripción",
    icon: CreditCard,
  },
  {
    id: "pops",
    href: "/backoffice/pops",
    label: "Puntos de venta",
    icon: Store,
  },
  {
    id: "usuarios",
    href: "/backoffice/usuarios",
    label: "Usuarios",
    icon: Users,
  },
]

export function backofficeNavItem(pathname: string): BackofficeNavItem | null {
  return (
    BACKOFFICE_NAV.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? null
  )
}
