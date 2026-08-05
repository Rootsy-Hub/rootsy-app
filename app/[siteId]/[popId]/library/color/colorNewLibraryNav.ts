/** Sistema de color Rootsy — navegación de la librería. */
export const COLOR_NEW_LIBRARY_ROOT = { id: "colors-new", label: "Color" } as const

export const COLOR_NEW_LIBRARY_SUBITEMS = [
  { id: "colors-new-semantic", label: "Semántica" },
  { id: "colors-new-themes", label: "Temas" },
  { id: "colors-new-pairings", label: "Complementarios" },
  { id: "colors-new-contrast", label: "Contraste" },
  { id: "colors-new-accents", label: "Énfasis" },
  { id: "colors-new-palettes", label: "Paletas" },
  { id: "colors-new-data-viz", label: "Datos" },
  { id: "colors-new-ceniza", label: "Ceniza" },
  { id: "colors-new-bruma", label: "Bruma" },
  { id: "colors-new-savia", label: "Savia" },
  { id: "colors-new-landing", label: "Landing" },
] as const

export const COLOR_NEW_LIBRARY_ITEMS = [
  COLOR_NEW_LIBRARY_ROOT,
  ...COLOR_NEW_LIBRARY_SUBITEMS,
] as const

export const COLOR_NEW_SECTION_IDS = COLOR_NEW_LIBRARY_ITEMS.map((item) => item.id)

export function isColorNewLibrarySection(sectionId: string): boolean {
  return (COLOR_NEW_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type ColorNewPageMeta = {
  id: string
  title: string
  description: string
}

export const COLOR_NEW_PAGE_META: Record<string, ColorNewPageMeta> = {
  "colors-new": {
    id: "colors-new",
    title: "Color",
    description:
      "Cuatro familias de producto — ceniza, bruma, savia y landing — con tokens, temas y complementarios.",
  },
  "colors-new-semantic": {
    id: "colors-new-semantic",
    title: "Semántica",
    description:
      "Tokens con propósito — shell, ticket, acción savia, foco y estados funcionales.",
  },
  "colors-new-themes": {
    id: "colors-new-themes",
    title: "Temas",
    description: "POS, workspace, landing y librería — composiciones de las cuatro familias.",
  },
  "colors-new-pairings": {
    id: "colors-new-pairings",
    title: "Complementarios",
    description: "Armonías de producto — ceniza+savia, split POS, bruma+workspace, landing CTA.",
  },
  "colors-new-contrast": {
    id: "colors-new-contrast",
    title: "Contraste",
    description: "Pares WCAG validados sobre ceniza, bruma y landing.",
  },
  "colors-new-accents": {
    id: "colors-new-accents",
    title: "Énfasis",
    description: "Niveles dentro de cada familia — no acentos intercambiables externos.",
  },
  "colors-new-palettes": {
    id: "colors-new-palettes",
    title: "Paletas",
    description: "Las cuatro rampas completas — única paleta oficial del sistema.",
  },
  "colors-new-data-viz": {
    id: "colors-new-data-viz",
    title: "Visualización de datos",
    description: "Savia, teal, ceniza y bruma en gráficos; ámbar/rojo solo como funcionales.",
  },
  "colors-new-ceniza": {
    id: "colors-new-ceniza",
    title: "Ceniza",
    description: "Neutros oscuros — rail, canvas, cards y toolbox POS.",
  },
  "colors-new-bruma": {
    id: "colors-new-bruma",
    title: "Bruma",
    description: "Neutros claros — ticket, tablas y workspace.",
  },
  "colors-new-savia": {
    id: "colors-new-savia",
    title: "Savia",
    description: "Verde operativo — acción, foco y totales en todo el producto.",
  },
  "colors-new-landing": {
    id: "colors-new-landing",
    title: "Landing",
    description: "Hero #080C0B, forest/meadow, CTA emerald→teal, aurora decorativa.",
  },
}

export function getColorNewPageMeta(sectionId: string): ColorNewPageMeta | undefined {
  return COLOR_NEW_PAGE_META[sectionId]
}

export const COLOR_NEW_RELATED_LINKS = [
  { sectionId: "colors-new-semantic", label: "Semántica", hint: "Tokens oficiales." },
  { sectionId: "colors-new-themes", label: "Temas", hint: "POS · workspace · landing." },
  { sectionId: "colors-new-palettes", label: "Paletas", hint: "Cuatro rampas." },
  { sectionId: "colors-new-ceniza", label: "Ceniza", hint: "Oscuro operativo." },
  { sectionId: "colors-new-savia", label: "Savia", hint: "Acción." },
  { sectionId: "colors-new", label: "Color", hint: "Visión del sistema." },
] as const
