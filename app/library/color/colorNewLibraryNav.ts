/** Sistema de color Rootsy — mismo mapa que el handbook. */
export const COLOR_NEW_LIBRARY_ROOT = { id: "colors-new", label: "Color" } as const

export const COLOR_NEW_LIBRARY_SUBITEMS = [
  { id: "colors-new-eter", label: "Éter" },
  { id: "colors-new-bruma", label: "Luz filtrada" },
  { id: "colors-new-sombra", label: "Sombra" },
  { id: "colors-new-savia", label: "Savia" },
  { id: "colors-new-cielo", label: "Cielo" },
  { id: "colors-new-sol", label: "Sol" },
  { id: "colors-new-lava", label: "Lava" },
  { id: "colors-new-semantic", label: "Tokens" },
  { id: "colors-new-contrast", label: "Contraste" },
] as const

/** @deprecated Alias de migración. */
export const COLOR_NEW_CENIZA_ALIAS = "colors-new-sombra"
export const COLOR_NEW_LANDING_ALIAS = "colors-new-atmosphere"

export const COLOR_NEW_LIBRARY_ITEMS = [
  COLOR_NEW_LIBRARY_ROOT,
  ...COLOR_NEW_LIBRARY_SUBITEMS,
] as const

export const COLOR_NEW_LEGACY_SECTION_IDS = [
  "colors-new-themes",
  "colors-new-pairings",
  "colors-new-mundos",
  "colors-new-accents",
  "colors-new-palettes",
  "colors-new-data-viz",
  "colors-new-examples",
  "colors-new-atmosphere",
  "colors-new-landing",
  "colors-new-ceniza",
] as const

export const COLOR_NEW_SECTION_IDS = [
  ...COLOR_NEW_LIBRARY_ITEMS.map((item) => item.id),
  ...COLOR_NEW_LEGACY_SECTION_IDS,
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
      "Atmósferas (éter, luz filtrada, sombra) y funcionales (savia, cielo, sol, lava). Blanco y negro viven fuera de rampa.",
  },
  "colors-new-semantic": {
    id: "colors-new-semantic",
    title: "Tokens",
    description:
      "Fondo, superficie, elevada, borde y texto por atmósfera. Acción, foco y estados con savia, cielo, sol y lava.",
  },
  "colors-new-themes": {
    id: "colors-new-themes",
    title: "Temas",
    description: "POS, workspace, bruma oscura, marketing y librería — composiciones de las atmósferas.",
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
      "Hábitats de producto. Las atmósferas del sistema son éter, luz filtrada y sombra.",
  },
  "colors-new-contrast": {
    id: "colors-new-contrast",
    title: "Contraste",
    description: "Pares WCAG validados sobre éter, luz filtrada y sombra.",
  },
  "colors-new-accents": {
    id: "colors-new-accents",
    title: "Énfasis",
    description: "Niveles dentro de cada familia — no acentos intercambiables externos.",
  },
  "colors-new-palettes": {
    id: "colors-new-palettes",
    title: "Paletas",
    description: "Rampas de atmósfera y funcionales — éter, bruma, sombra, savia, cielo, sol y lava.",
  },
  "colors-new-data-viz": {
    id: "colors-new-data-viz",
    title: "Visualización de datos",
    description: "Savia, cielo y sombra en gráficos; sol y lava solo como funcionales.",
  },
  "colors-new-examples": {
    id: "colors-new-examples",
    title: "Ejemplos",
    description:
      "Color en UI real — formularios, listados, tiles POS, cards, banners y shell.",
  },
  "colors-new-eter": {
    id: "colors-new-eter",
    title: "Éter",
    description:
      "El afuera del planeta. Rampa neutra para chrome: header, menú y vacío. El clima no es cielo.",
  },
  "colors-new-sombra": {
    id: "colors-new-sombra",
    title: "Sotobosque · Sombra",
    description:
      "El dosel para operar. El tope es negro. El 950 es aire. La hoja es 800: rail, toolbar, cards y slots.",
  },
  "colors-new-ceniza": {
    id: "colors-new-sombra",
    title: "Sotobosque · Sombra",
    description:
      "El dosel para operar. El tope es negro. El 950 es aire. La hoja es 800: rail, toolbar, cards y slots.",
  },
  "colors-new-bruma": {
    id: "colors-new-bruma",
    title: "Sotobosque · Luz filtrada",
    description:
      "El claro para leer. Workspaces, tablas, tickets y formularios. Un solo lugar, condición de lectura.",
  },
  "colors-new-savia": {
    id: "colors-new-savia",
    title: "Savia",
    description: "Acción, foco y progreso. Rayo 500. No pinta superficies enteras.",
  },
  "colors-new-cielo": {
    id: "colors-new-cielo",
    title: "Cielo",
    description: "Información, orientación y contexto. No es éter ni un azul de plantilla.",
  },
  "colors-new-sol": {
    id: "colors-new-sol",
    title: "Sol",
    description: "Atención y aviso. Calor vivo, no otoño ni plantilla de warning.",
  },
  "colors-new-lava": {
    id: "colors-new-lava",
    title: "Lava",
    description: "Riesgo, error, bloqueo y acción destructiva. No es sol ni un rojo de dashboard.",
  },
  "colors-new-atmosphere": {
    id: "colors-new-atmosphere",
    title: "Atmósfera de marketing",
    description:
      "Composición del hero — sombra + savia + auroras blur. No es una atmósfera del sistema.",
  },
  "colors-new-landing": {
    id: "colors-new-atmosphere",
    title: "Atmósfera de marketing",
    description:
      "Composición del hero — sombra + savia + auroras blur. No es una atmósfera del sistema.",
  },
}

export function getColorNewPageMeta(sectionId: string): ColorNewPageMeta | undefined {
  const resolved = resolveColorNewSectionId(sectionId)
  return COLOR_NEW_PAGE_META[resolved] ?? COLOR_NEW_PAGE_META[sectionId]
}

export const COLOR_NEW_RELATED_LINKS = [
  { sectionId: "colors-new-eter", label: "Éter", hint: "Chrome y vacío." },
  { sectionId: "colors-new-bruma", label: "Luz filtrada", hint: "El claro para leer." },
  { sectionId: "colors-new-sombra", label: "Sombra", hint: "El dosel para operar." },
  { sectionId: "colors-new-savia", label: "Savia", hint: "Acción y foco." },
  { sectionId: "colors-new-cielo", label: "Cielo", hint: "Información." },
  { sectionId: "colors-new-sol", label: "Sol", hint: "Atención." },
  { sectionId: "colors-new-lava", label: "Lava", hint: "Riesgo." },
  { sectionId: "colors-new-semantic", label: "Tokens", hint: "Propósito, no familia." },
  { sectionId: "colors-new-contrast", label: "Contraste", hint: "Pares WCAG." },
  { sectionId: "mundos", label: "Mundos", hint: "Hábitats habitados." },
  { sectionId: "colors-new", label: "Color", hint: "Mapa del sistema." },
] as const
