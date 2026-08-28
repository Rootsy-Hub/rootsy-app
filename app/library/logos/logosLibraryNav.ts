/** Sección de logotipos — página única en fundamentos. */
export const LOGOS_LIBRARY_ROOT = { id: "logos", label: "Logotipos" } as const

export const LOGOS_SECTION_IDS = [LOGOS_LIBRARY_ROOT.id] as const

export function isLogosLibrarySection(sectionId: string): boolean {
  return (LOGOS_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type LogosPageMeta = {
  id: string
  title: string
  description: string
}

export const LOGOS_PAGE_META: Record<string, LogosPageMeta> = {
  logos: {
    id: "logos",
    title: "Logotipos",
    description:
      "Anatomía del lockup, Rootsy, POP y persona. Acá se especifica cómo se dibuja; el handbook decide cuándo aparece.",
  },
}

export function getLogosPageMeta(sectionId: string): LogosPageMeta | undefined {
  return LOGOS_PAGE_META[sectionId]
}

export const LOGOS_RELATED_LINKS = [
  { sectionId: "colors", label: "Color", hint: "Sombra, bruma y savia para fondos de logo." },
  { sectionId: "typography", label: "Tipografía", hint: "Nombre del POP junto al logomark." },
  { sectionId: "iconography", label: "Iconografía", hint: "Tile y radio alineados al logomark." },
  { sectionId: "spacing", label: "Espaciado", hint: "Clearance mínimo alrededor del lockup." },
] as const
