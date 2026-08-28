/** Sección de radio — página única en fundamentos. */
export const RADIUS_LIBRARY_ROOT = { id: "radius", label: "Radios" } as const

export const RADIUS_SECTION_IDS = [RADIUS_LIBRARY_ROOT.id] as const

export function isRadiusLibrarySection(sectionId: string): boolean {
  return (RADIUS_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type RadiusPageMeta = {
  id: string
  title: string
  description: string
}

export const RADIUS_PAGE_META: Record<string, RadiusPageMeta> = {
  radius: {
    id: "radius",
    title: "Radios",
    description:
      "El radio crece con el contenedor — más cerrado en datos densos, más abierto en cards y overlay.",
  },
}

export function getRadiusPageMeta(sectionId: string): RadiusPageMeta | undefined {
  return RADIUS_PAGE_META[sectionId]
}

export const RADIUS_RELATED_LINKS = [
  { sectionId: "border", label: "Borde", hint: "Ancho de focus ring 2px." },
  { sectionId: "colors", label: "Color", hint: "Ring savia 400 en foco." },
  { sectionId: "logos", label: "Logotipos", hint: "radius.tile en logomark." },
  { sectionId: "motion", label: "Movimiento", hint: "Transición en segment controls." },
] as const
