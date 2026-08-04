/** Sección de borde — página única en fundamentos. */
export const BORDER_LIBRARY_ROOT = { id: "border", label: "Borde" } as const

export const BORDER_SECTION_IDS = [BORDER_LIBRARY_ROOT.id] as const

export function isBorderLibrarySection(sectionId: string): boolean {
  return (BORDER_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type BorderPageMeta = {
  id: string
  title: string
  description: string
}

export const BORDER_PAGE_META: Record<string, BorderPageMeta> = {
  border: {
    id: "border",
    title: "Borde",
    description:
      "Ancho + color — vena sutil, selección canopy y foco accesible. Siempre emparejar width con color.",
  },
}

export function getBorderPageMeta(sectionId: string): BorderPageMeta | undefined {
  return BORDER_PAGE_META[sectionId]
}

export const BORDER_RELATED_LINKS = [
  { sectionId: "radius", label: "Radio", hint: "Esquinas + focus ring radius." },
  { sectionId: "colors", label: "Color", hint: "color.border.* y contraste 3:1." },
  { sectionId: "elevation", label: "Elevación", hint: "Bordes vs sombras en cards." },
  { sectionId: "spacing", label: "Espaciado", hint: "Separadores y hairlines." },
] as const
