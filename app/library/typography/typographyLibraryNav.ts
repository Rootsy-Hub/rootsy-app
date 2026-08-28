/** Raíz y subsecciones de tipografía. */
export const TYPOGRAPHY_LIBRARY_ROOT = { id: "typography", label: "Tipografía" } as const

export const TYPOGRAPHY_LIBRARY_SUBITEMS = [
  { id: "typography-typefaces", label: "Familias y escala" },
  { id: "typography-applying", label: "Jerarquías" },
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
      "Inter en chrome y montos. Nunito Sans en la prosa. La escala es corta y parte de 16px.",
  },
  "typography-applying": {
    id: "typography-applying",
    title: "Jerarquías",
    description:
      "Título, contexto, cuerpo, dato. Cómo conviven en una pantalla real.",
  },
  "typography-typefaces": {
    id: "typography-typefaces",
    title: "Familias y escala",
    description:
      "Familias, tamaños y pesos — la referencia técnica, sin px sueltos.",
  },
}

export function getTypographyPageMeta(sectionId: string): TypographyPageMeta | undefined {
  return TYPOGRAPHY_PAGE_META[sectionId]
}

export const TYPOGRAPHY_RELATED_LINKS = [
  { sectionId: "concept", label: "Overview", hint: "Cómo usar la librería." },
  { sectionId: "typography-typefaces", label: "Familias y escala", hint: "Tamaños, pesos y tokens." },
  { sectionId: "typography-applying", label: "Jerarquías", hint: "Título, contexto, cuerpo, dato." },
  { sectionId: "spacing", label: "Espaciado", hint: "Ritmo entre bloques de texto." },
  { sectionId: "colors-new", label: "Color", hint: "Contraste y tokens de texto." },
] as const
