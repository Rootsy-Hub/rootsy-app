import type { MenuSectionKey } from "@/lib/menuCatalog"

export const MENU_ROOTSY_IMAGES = {
  idle: "/images/contento.png",
  attentive: "/images/atento.png",
} as const

const sectionLead: Record<MenuSectionKey, string> = {
  operar:
    "Acá movés el día a día: ventas, stock, mostrador y todo lo que pasa en el piso.",
  administrar:
    "Administrás lo que sostiene el negocio: personas, stock, números y reportes.",
  configurar:
    "Configurás las bases del negocio: cuentas, ajustes e integraciones.",
}

export function getMenuRootsyPanelCopy(
  sectionKey: MenuSectionKey,
  sectionTitle: string,
): { title: string; lead: string } {
  return {
    title: sectionTitle,
    lead: sectionLead[sectionKey],
  }
}
