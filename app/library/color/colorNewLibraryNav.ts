/** Sistema de color Rootsy — navegación de la librería. */
export const COLOR_NEW_LIBRARY_ROOT = { id: "colors-new", label: "Color" } as const

export const COLOR_NEW_LIBRARY_SUBITEMS = [
  { id: "colors-new-semantic", label: "Semántica" },
  { id: "colors-new-themes", label: "Temas" },
  { id: "colors-new-pairings", label: "Complementarios" },
  { id: "colors-new-mundos", label: "Mundos" },
  { id: "colors-new-contrast", label: "Contraste" },
  { id: "colors-new-accents", label: "Énfasis" },
  { id: "colors-new-palettes", label: "Paletas" },
  { id: "colors-new-data-viz", label: "Datos" },
  { id: "colors-new-examples", label: "Ejemplos" },
  { id: "colors-new-sombra", label: "Sombra" },
  { id: "colors-new-bruma", label: "Bruma" },
  { id: "colors-new-savia", label: "Savia" },
  { id: "colors-new-atmosphere", label: "Atmósfera" },
] as const

/** @deprecated Alias de migración. */
export const COLOR_NEW_CENIZA_ALIAS = "colors-new-sombra"
export const COLOR_NEW_LANDING_ALIAS = "colors-new-atmosphere"

export const COLOR_NEW_LIBRARY_ITEMS = [
  COLOR_NEW_LIBRARY_ROOT,
  ...COLOR_NEW_LIBRARY_SUBITEMS,
] as const

export const COLOR_NEW_SECTION_IDS = [
  ...COLOR_NEW_LIBRARY_ITEMS.map((item) => item.id),
  "colors-new-ceniza",
  "colors-new-landing",
] as const

export function isColorNewLibrarySection(sectionId: string): boolean {
  return (COLOR_NEW_SECTION_IDS as readonly string[]).includes(sectionId)
}

export function resolveColorNewSectionId(sectionId: string): string {
  if (sectionId === "colors-new-ceniza") return COLOR_NEW_CENIZA_ALIAS
  if (sectionId === "colors-new-landing") return COLOR_NEW_LANDING_ALIAS
  return sectionId
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
      "Tres familias de marca — sombra, bruma y savia — más climas de mundo (suelo, cielo, sol, éter).",
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
    description: "POS, workspace, marketing y librería — composiciones de las tres familias.",
  },
  "colors-new-pairings": {
    id: "colors-new-pairings",
    title: "Complementarios",
    description:
      "Armonías de producto — sombra+savia, split POS, climas cielo/sol/éter, CTA promo.",
  },
  "colors-new-mundos": {
    id: "colors-new-mundos",
    title: "Mundos",
    description:
      "Sombra, bruma, savia, suelo, cielo, sol y éter — dónde vive cada uno y qué no es.",
  },
  "colors-new-contrast": {
    id: "colors-new-contrast",
    title: "Contraste",
    description: "Pares WCAG validados sobre sombra, bruma y hero marketing.",
  },
  "colors-new-accents": {
    id: "colors-new-accents",
    title: "Énfasis",
    description: "Niveles dentro de cada familia — no acentos intercambiables externos.",
  },
  "colors-new-palettes": {
    id: "colors-new-palettes",
    title: "Paletas",
    description: "Las tres rampas oficiales — sombra, bruma y savia — más suelo, cielo, sol y éter.",
  },
  "colors-new-data-viz": {
    id: "colors-new-data-viz",
    title: "Visualización de datos",
    description: "Savia, teal, sombra y bruma en gráficos; ámbar/rojo solo como funcionales.",
  },
  "colors-new-examples": {
    id: "colors-new-examples",
    title: "Ejemplos",
    description:
      "Color en UI real — formularios, listados, tiles POS, cards, banners y shell con tipografía, espaciado, borde, radio y elevación.",
  },
  "colors-new-sombra": {
    id: "colors-new-sombra",
    title: "Sombra",
    description:
      "Neutros oscuros con matiz bosque — bajo el dosel: rail, canvas, cards y toolbox POS.",
  },
  "colors-new-ceniza": {
    id: "colors-new-sombra",
    title: "Sombra",
    description:
      "Neutros oscuros con matiz bosque — bajo el dosel: rail, canvas, cards y toolbox POS.",
  },
  "colors-new-bruma": {
    id: "colors-new-bruma",
    title: "Bruma",
    description: "Neblina clara — ticket, tablas y workspace.",
  },
  "colors-new-savia": {
    id: "colors-new-savia",
    title: "Savia",
    description: "Verde operativo — acción, foco y totales en todo el producto.",
  },
  "colors-new-atmosphere": {
    id: "colors-new-atmosphere",
    title: "Atmósfera",
    description:
      "Composición del hero — sombra + savia + auroras blur. No es una cuarta familia de color.",
  },
  "colors-new-landing": {
    id: "colors-new-atmosphere",
    title: "Atmósfera",
    description:
      "Composición del hero — sombra + savia + auroras blur. No es una cuarta familia de color.",
  },
}

export function getColorNewPageMeta(sectionId: string): ColorNewPageMeta | undefined {
  const resolved = resolveColorNewSectionId(sectionId)
  return COLOR_NEW_PAGE_META[resolved] ?? COLOR_NEW_PAGE_META[sectionId]
}

export const COLOR_NEW_RELATED_LINKS = [
  { sectionId: "colors-new-semantic", label: "Semántica", hint: "Tokens oficiales." },
  { sectionId: "colors-new-themes", label: "Temas", hint: "POS · workspace · marketing." },
  { sectionId: "colors-new-mundos", label: "Mundos", hint: "Suelo · cielo · sol · éter." },
  { sectionId: "colors-new-palettes", label: "Paletas", hint: "Tres familias." },
  { sectionId: "colors-new-atmosphere", label: "Atmósfera", hint: "Hero marketing." },
  { sectionId: "colors-new-sombra", label: "Sombra", hint: "Bajo el dosel." },
  { sectionId: "colors-new", label: "Color", hint: "Visión del sistema." },
] as const
