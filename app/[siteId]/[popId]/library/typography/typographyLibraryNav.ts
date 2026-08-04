/** Raíz y subsecciones de tipografía — alineadas con Atlassian Typography. */
export const TYPOGRAPHY_LIBRARY_ROOT = { id: "typography", label: "Tipografía" } as const

export const TYPOGRAPHY_LIBRARY_SUBITEMS = [
  { id: "typography-applying", label: "Aplicar tipografía" },
  { id: "typography-typefaces", label: "Tipografías y escala" },
] as const

export const TYPOGRAPHY_LIBRARY_ITEMS = [
  TYPOGRAPHY_LIBRARY_ROOT,
  ...TYPOGRAPHY_LIBRARY_SUBITEMS,
] as const

export const TYPOGRAPHY_SECTION_IDS = TYPOGRAPHY_LIBRARY_ITEMS.map((item) => item.id)

export function isTypographyLibrarySection(sectionId: string): boolean {
  return (TYPOGRAPHY_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type TypographyPageMeta = {
  id: string
  title: string
  description: string
}

export const TYPOGRAPHY_PAGE_META: Record<string, TypographyPageMeta> = {
  typography: {
    id: "typography",
    title: "Tipografía",
    description:
      "Canopy, Stream y Ledger — tres voces nature para UI, lectura y números.",
  },
  "typography-applying": {
    id: "typography-applying",
    title: "Aplicar tipografía",
    description:
      "Tokens, jerarquía, accesibilidad y guías de uso en producto.",
  },
  "typography-typefaces": {
    id: "typography-typefaces",
    title: "Tipografías y escala",
    description:
      "Familias Rootsy, escala minor third y reglas de line-height.",
  },
}

export function getTypographyPageMeta(sectionId: string): TypographyPageMeta | undefined {
  return TYPOGRAPHY_PAGE_META[sectionId]
}

export const TYPOGRAPHY_RELATED_LINKS = [
  {
    sectionId: "typography-applying",
    label: "Aplicar tipografía",
    hint: "Guías, métricas, links y accesibilidad.",
  },
  {
    sectionId: "typography-typefaces",
    label: "Tipografías y escala",
    hint: "Canopy, Stream, Ledger y escala.",
  },
  { sectionId: "typography", label: "Tipografía", hint: "Overview y estilos de texto." },
  { sectionId: "spacing", label: "Espaciado", hint: "Párrafos con Stack + space." },
  { sectionId: "colors", label: "Color", hint: "Contraste y tokens de texto." },
] as const
