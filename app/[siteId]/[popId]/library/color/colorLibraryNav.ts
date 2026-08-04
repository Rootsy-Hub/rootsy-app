/** Subsecciones de color — mismo orden que Atlassian Design. */
export const COLOR_LIBRARY_ITEMS = [
  { id: "colors", label: "Color" },
  { id: "colors-accents", label: "Acentos" },
  { id: "colors-picker", label: "Muestras de selector" },
  { id: "colors-data-viz", label: "Visualización de datos" },
  { id: "colors-palette", label: "Paleta completa" },
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
      "El color distingue la marca Rootsy y mantiene experiencias coherentes en todo el producto.",
  },
  "colors-accents": {
    id: "colors-accents",
    title: "Acentos",
    description:
      "Colores decorativos para categorizar contenido, íconos de proyecto y elecciones de la persona usuaria.",
  },
  "colors-picker": {
    id: "colors-picker",
    title: "Muestras de selector",
    description:
      "Opciones de color cuando la persona usuaria elige un tono para su contenido.",
  },
  "colors-data-viz": {
    id: "colors-data-viz",
    title: "Visualización de datos",
    description:
      "Color en gráficos, reportes y dashboards — con contraste y significado claros.",
  },
  "colors-palette": {
    id: "colors-palette",
    title: "Paleta completa",
    description:
      "Rampas de color nature Rootsy para workspace claro y mostrador oscuro.",
  },
}

export function getColorPageMeta(sectionId: string): ColorPageMeta | undefined {
  return COLOR_PAGE_META[sectionId]
}

export const COLOR_RELATED_LINKS = [
  {
    sectionId: "colors-accents",
    label: "Acentos",
    hint: "Tags, íconos y categorías sin significado fijo.",
  },
  {
    sectionId: "colors-picker",
    label: "Muestras de selector",
    hint: "Cuando la persona usuaria elige un color.",
  },
  {
    sectionId: "colors-data-viz",
    label: "Visualización de datos",
    hint: "Gráficos y reportes.",
  },
  {
    sectionId: "colors-palette",
    label: "Paleta completa",
    hint: "Rampas claro y oscuro.",
  },
  {
    sectionId: "colors",
    label: "Color",
    hint: "Roles, énfasis y anatomía.",
  },
] as const
