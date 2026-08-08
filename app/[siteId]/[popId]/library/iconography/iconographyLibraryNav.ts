/** Sección de iconografía — página única en fundamentos. */
export const ICONOGRAPHY_LIBRARY_ROOT = { id: "iconography", label: "Iconografía" } as const

export const ICONOGRAPHY_SECTION_IDS = [ICONOGRAPHY_LIBRARY_ROOT.id] as const

export function isIconographyLibrarySection(sectionId: string): boolean {
  return (ICONOGRAPHY_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type IconographyPageMeta = {
  id: string
  title: string
  description: string
}

export const ICONOGRAPHY_PAGE_META: Record<string, IconographyPageMeta> = {
  iconography: {
    id: "iconography",
    title: "Iconografía",
    description:
      "Señales SaaS — Iconsax Linear/Bold, savia en brand, tokens de tamaño y color.",
  },
}

export function getIconographyPageMeta(sectionId: string): IconographyPageMeta | undefined {
  return ICONOGRAPHY_PAGE_META[sectionId]
}

export const ICONOGRAPHY_RELATED_LINKS = [
  { sectionId: "colors", label: "Color", hint: "Tokens icon.* y contraste." },
  { sectionId: "spacing", label: "Espaciado", hint: "Padding alrededor de íconos." },
  { sectionId: "typography", label: "Tipografía", hint: "Medium weight junto a íconos." },
  { sectionId: "motion", label: "Movimiento", hint: "Chevrons y estados interactivos." },
] as const
