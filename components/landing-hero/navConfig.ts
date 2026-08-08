/** Configuración de la landing (estructura tomada del diseño de Figma). */

export type NavItem = {
  label: string
  href: string
}

export const LANDING_NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: "Inicio", href: "#inicio" },
  { label: "Soluciones", href: "#soluciones" },
  { label: "Sobre nosotros", href: "#sobre-nosotros" },
  { label: "Planes", href: "#planes" },
]

export const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? "/login"
export const REGISTER_URL = process.env.NEXT_PUBLIC_REGISTER_URL ?? "/register"
