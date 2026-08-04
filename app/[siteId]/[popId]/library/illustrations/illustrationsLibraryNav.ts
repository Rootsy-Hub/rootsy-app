/** Sección de ilustraciones — placeholder en fundamentos. */
export const ILLUSTRATIONS_LIBRARY_ROOT = { id: "illustrations", label: "Ilustraciones" } as const

export const ILLUSTRATIONS_SECTION_IDS = [ILLUSTRATIONS_LIBRARY_ROOT.id] as const

export function isIllustrationsLibrarySection(sectionId: string): boolean {
  return (ILLUSTRATIONS_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type IllustrationsPageMeta = {
  id: string
  title: string
  description: string
}

export const ILLUSTRATIONS_PAGE_META: Record<string, IllustrationsPageMeta> = {
  illustrations: {
    id: "illustrations",
    title: "Ilustraciones",
    description: "Spots, mascota Rootsy, low-fi UI y patrones ambient — documentación en preparación.",
  },
}

export function getIllustrationsPageMeta(sectionId: string): IllustrationsPageMeta | undefined {
  return ILLUSTRATIONS_PAGE_META[sectionId]
}
