/** Overview de la librería — el criterio vive en el handbook. */
export const CONCEPT_LIBRARY_ROOT = { id: "concept", label: "Overview" } as const

export const CONCEPT_SECTION_IDS = [CONCEPT_LIBRARY_ROOT.id] as const

export function isConceptLibrarySection(sectionId: string): boolean {
  return (CONCEPT_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type ConceptPageMeta = {
  id: string
  title: string
  description: string
}

export const CONCEPT_PAGE_META: Record<string, ConceptPageMeta> = {
  concept: {
    id: "concept",
    title: "Overview",
    description:
      "La librería especifica cómo se dibuja lo que el Handbook decide. Tokens, componentes y patrones vivos.",
  },
}

export function getConceptPageMeta(sectionId: string): ConceptPageMeta | undefined {
  return CONCEPT_PAGE_META[sectionId]
}

export const CONCEPT_RELATED_LINKS = [
  { sectionId: "colors-new", label: "Color", hint: "Atmósferas y funcionales." },
  { sectionId: "typography", label: "Tipografía", hint: "Familias, escala y jerarquías." },
  { sectionId: "spacing", label: "Espaciado", hint: "Escala, densidad y proporciones." },
  { sectionId: "mundos", label: "Mundos", hint: "Superficies habitadas." },
  { sectionId: "grid", label: "Layout", hint: "Grillas, contenedores y breakpoints." },
] as const
