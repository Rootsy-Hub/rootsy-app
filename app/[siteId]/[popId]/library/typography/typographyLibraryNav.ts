/** Raíz y subsecciones de tipografía. */
export const TYPOGRAPHY_LIBRARY_ROOT = { id: "typography", label: "Tipografía" } as const

export const TYPOGRAPHY_LIBRARY_SUBITEMS = [
  { id: "typography-applying", label: "En producto" },
  { id: "typography-typefaces", label: "Escala" },
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
      "Tres voces, una escala — texto que se lee natural, sin esfuerzo ni adornos.",
  },
  "typography-applying": {
    id: "typography-applying",
    title: "En producto",
    description:
      "Cómo se ve la tipografía en pantallas reales — jerarquía, montos y metadatos.",
  },
  "typography-typefaces": {
    id: "typography-typefaces",
    title: "Escala",
    description:
      "Familias, tamaños y pesos — la referencia técnica, sin ruido.",
  },
}

export function getTypographyPageMeta(sectionId: string): TypographyPageMeta | undefined {
  return TYPOGRAPHY_PAGE_META[sectionId]
}

export const TYPOGRAPHY_RELATED_LINKS = [
  { sectionId: "concept", label: "Concepto", hint: "Principios de marca y diseño." },
  { sectionId: "typography-applying", label: "En producto", hint: "Demos en contexto real." },
  { sectionId: "typography-typefaces", label: "Escala", hint: "Tamaños, pesos y tokens." },
  { sectionId: "spacing", label: "Espaciado", hint: "Ritmo entre bloques de texto." },
  { sectionId: "colors-new", label: "Color", hint: "Contraste y tokens de texto." },
] as const
