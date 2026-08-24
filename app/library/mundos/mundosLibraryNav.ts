/** Mundos en producto — pantallas habitadas, no rampas de color. */

export const MUNDOS_LIBRARY_ROOT = { id: "mundos", label: "Mundos" } as const

export const MUNDOS_SECTION_IDS = [MUNDOS_LIBRARY_ROOT.id] as const

export function isMundosLibrarySection(sectionId: string): boolean {
  return (MUNDOS_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type MundosPageMeta = {
  id: string
  title: string
  description: string
}

export const MUNDOS_PAGE_META: Record<string, MundosPageMeta> = {
  mundos: {
    id: "mundos",
    title: "Mundos dentro de Rootsy",
    description:
      "Cada superficie del producto es un hábitat. Acá se ven habitados — no como swatches, como pantallas.",
  },
}

export function getMundosPageMeta(sectionId: string): MundosPageMeta | undefined {
  return MUNDOS_PAGE_META[sectionId]
}

export const MUNDOS_RELATED_LINKS = [
  {
    sectionId: "colors-new-mundos",
    label: "Color · Mundos",
    hint: "Rampas y mapa de uso — no es esta galería.",
  },
  { sectionId: "layouts-operar", label: "Layout · Operar", hint: "Sombra en catálogo, suelo en toolbox." },
  { sectionId: "layouts-tables", label: "Layout · Tablas", hint: "Suelo en el pie de listados." },
  { sectionId: "colors-new", label: "Color", hint: "Sombra, bruma, savia y climas." },
] as const
