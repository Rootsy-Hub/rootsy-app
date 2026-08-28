/** Raíz y subsecciones de motion — alineadas con Atlassian Motion. */
export const MOTION_LIBRARY_ROOT = { id: "motion", label: "Movimiento" } as const

export const MOTION_LIBRARY_SUBITEMS = [
  { id: "motion-applying", label: "Transiciones" },
] as const

export const MOTION_LIBRARY_ITEMS = [MOTION_LIBRARY_ROOT, ...MOTION_LIBRARY_SUBITEMS] as const

export const MOTION_SECTION_IDS = MOTION_LIBRARY_ITEMS.map((item) => item.id)

export function isMotionLibrarySection(sectionId: string): boolean {
  return (MOTION_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type MotionPageMeta = {
  id: string
  title: string
  description: string
}

export const MOTION_PAGE_META: Record<string, MotionPageMeta> = {
  motion: {
    id: "motion",
    title: "Movimiento",
    description:
      "Inercia creíble. Acelera y frena como un cuerpo — nunca easing de plantilla.",
  },
  "motion-applying": {
    id: "motion-applying",
    title: "Transiciones",
    description:
      "Duraciones, curvas, entradas/salidas y reduced motion.",
  },
}

export function getMotionPageMeta(sectionId: string): MotionPageMeta | undefined {
  return MOTION_PAGE_META[sectionId]
}

export const MOTION_RELATED_LINKS = [
  {
    sectionId: "motion-applying",
    label: "Transiciones",
    hint: "Duraciones, curvas, entradas y salidas.",
  },
  { sectionId: "motion", label: "Movimiento", hint: "Duración, easing y propiedades." },
  { sectionId: "spacing", label: "Espaciado", hint: "Ritmo visual complementario." },
  { sectionId: "colors", label: "Color", hint: "Transiciones de color en estados." },
] as const
