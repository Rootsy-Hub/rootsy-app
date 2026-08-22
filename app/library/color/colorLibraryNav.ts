/** IDs viejos de Color — redirigen a colors-new en LibrarySectionView. */

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
