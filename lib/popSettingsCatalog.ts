import { Building2, ImageIcon, Receipt, type LucideIcon } from "lucide-react"

export type PopSettingsSectionId = "business" | "fiscal" | "images"

export type PopSettingsSectionDef = {
  id: PopSettingsSectionId
  label: string
  description: string
  icon: LucideIcon
}

export const POP_SETTINGS_SECTIONS: PopSettingsSectionDef[] = [
  {
    id: "business",
    label: "Datos del negocio",
    description: "Nombre, contacto, ubicación y día operativo del punto.",
    icon: Building2,
  },
  {
    id: "fiscal",
    label: "Datos fiscales",
    description: "CUIT, razón social y datos para facturar en este POP.",
    icon: Receipt,
  },
  {
    id: "images",
    label: "Imágenes del negocio",
    description: "Logo del menú, tickets y fondo de la pantalla principal.",
    icon: ImageIcon,
  },
]

export function visiblePopSettingsSections(): PopSettingsSectionDef[] {
  return POP_SETTINGS_SECTIONS
}

export function popSettingsSectionById(
  sectionId: PopSettingsSectionId,
): PopSettingsSectionDef | undefined {
  return POP_SETTINGS_SECTIONS.find((section) => section.id === sectionId)
}
