/** Raíz y subsecciones de color — mismo orden que Atlassian Design. */
export const COLOR_LIBRARY_ROOT = { id: "colors", label: "Color" } as const

export const COLOR_LIBRARY_SUBITEMS = [
  { id: "colors-accents", label: "Acentos" },
  { id: "colors-picker", label: "Muestras de selector" },
  { id: "colors-data-viz", label: "Visualización de datos" },
  { id: "colors-palette", label: "Paleta completa" },
] as const

export const COLOR_LIBRARY_ITEMS = [
  COLOR_LIBRARY_ROOT,
  ...COLOR_LIBRARY_SUBITEMS,
] as const

export const COLOR_SECTION_IDS = COLOR_LIBRARY_ITEMS.map((item) => item.id)

export function isColorLibrarySection(sectionId: string): boolean {
  return (COLOR_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type ColorPageMeta = {
  id: string
  title: string
  description: string
}

export const COLOR_PAGE_META: Record<string, ColorPageMeta> = {
  colors: {
    id: "colors",
    title: "Color",
    description:
      "Rootsy grita naturaleza — verde canopy en esplendor como eje, con cielo, mar, otoño, fuego, tierra y noche.",
  },
  "colors-accents": {
    id: "colors-accents",
    title: "Acentos",
    description:
      "Ocho familias nature intercambiables — mar, cielo, otoño, crepúsculo y tierra para categorizar sin competir con la marca.",
  },
  "colors-picker": {
    id: "colors-picker",
    title: "Muestras de selector",
    description:
      "Brumas, intensidades y tonos vivos cuando la persona usuaria elige color para su contenido.",
  },
  "colors-data-viz": {
    id: "colors-data-viz",
    title: "Visualización de datos",
    description:
      "Gráficos que respiran naturaleza — canopy primero, fuego solo para severidad, contraste entre vecinos.",
  },
  "colors-palette": {
    id: "colors-palette",
    title: "Paleta completa",
    description:
      "Ocho familias con rampas completas — prado bajo sol y bosque bajo luna.",
  },
}

export function getColorPageMeta(sectionId: string): ColorPageMeta | undefined {
  return COLOR_PAGE_META[sectionId]
}

export const COLOR_RELATED_LINKS = [
  {
    sectionId: "colors-accents",
    label: "Acentos",
    hint: "Mar, cielo, otoño — hojas del mismo bosque.",
  },
  {
    sectionId: "colors-picker",
    label: "Muestras de selector",
    hint: "Brumas e intensidades para elegir color.",
  },
  {
    sectionId: "colors-data-viz",
    label: "Visualización de datos",
    hint: "Canopy, mar y fuego con propósito.",
  },
  {
    sectionId: "colors-palette",
    label: "Paleta completa",
    hint: "Ocho familias — prado y noche.",
  },
  {
    sectionId: "colors",
    label: "Color",
    hint: "Manifesto, gradientes y roles.",
  },
] as const
