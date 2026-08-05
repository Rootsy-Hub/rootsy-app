/** Concepto de marca y diseño — entrada de la librería. */
export const CONCEPT_LIBRARY_ROOT = { id: "concept", label: "Concepto" } as const

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
    title: "Concepto",
    description:
      "Rootsy — sistema de gestión online para cualquier negocio. Marca, diseño y principios del producto.",
  },
}

export function getConceptPageMeta(sectionId: string): ConceptPageMeta | undefined {
  return CONCEPT_PAGE_META[sectionId]
}

export const CONCEPT_RELATED_LINKS = [
  { sectionId: "colors-new", label: "Color", hint: "Bruma, ceniza y savia en producto." },
  { sectionId: "motion", label: "Movimiento", hint: "Animaciones con inercia natural." },
  { sectionId: "logos", label: "Logos", hint: "Identidad visual de la marca." },
  { sectionId: "spacing", label: "Espaciado", hint: "Proporciones y ritmo entre elementos." },
] as const
