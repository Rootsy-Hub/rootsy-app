/**
 * Escala tierra Nature para RootsForm — hex explícitos para portales Radix
 * (select/date fuera de .rootsy-nature-palette).
 * @see app/.../library/color/rootsyNaturePalette.css --nature-earth-*
 */

/** Valores hex de la escala tierra (referencia). */
export const ROOTSY_FORM_EARTH = {
  900: "#292524",
  800: "#44403c",
  700: "#57534e",
  600: "#78716c",
  500: "#a8a29e",
  400: "#d6d3d1",
  200: "#e7e5e4",
  100: "#f5f5f0",
  50: "#fafaf7",
} as const

export const rootsFormEarthBorderClass = "border-[#e7e5e4]"
export const rootsFormEarthBorderHoverClass = "hover:border-[#d6d3d1]"
export const rootsFormEarthBorderFocusClosedClass = "!border-[#e7e5e4]"
export const rootsFormEarthDividerClass = "bg-[#e7e5e4]"
export const rootsFormEarthBgMutedClass = "bg-[#f5f5f0]"
export const rootsFormEarthBgSubtleClass = "bg-[#fafaf7]"
/** Slot affix — tierra suave pero legible (fondo claro, glifo un tono más oscuro). */
export const rootsFormEarthPrefixBgClass = "bg-[#f5f5f0]"
export const rootsFormEarthPrefixBorderClass = "border-[#e7e5e4]"
export const rootsFormEarthPrefixBorderHoverClass =
  "group-hover:border-[#d6d3d1]"
export const rootsFormEarthPrefixTextClass = "text-[#57534e]"
export const rootsFormEarthPrefixTextMutedClass = "text-[#a8a29e]"
export const rootsFormEarthPrefixBgMutedClass = "bg-[#fafaf7]"
export const rootsFormEarthPrefixIconSvgClass = "[&_svg]:text-[#57534e]"
export const rootsFormEarthTextClass = "text-[#292524]"
export const rootsFormEarthTextSecondaryClass = "text-[#78716c]"
export const rootsFormEarthTextTertiaryClass = "text-[#57534e]"
export const rootsFormEarthPlaceholderClass = "placeholder:text-[#a8a29e]"
export const rootsFormEarthHighlightClass = "bg-[#f5f5f0]"
export const rootsFormEarthHighlightHoverClass = "hover:bg-[#f5f5f0]"
export const rootsFormEarthSelectionClass =
  "selection:!bg-[#e7e5e4] selection:!text-[#292524]"
export const rootsFormEarthDisabledClass = "text-[#d6d3d1]"
export const rootsFormEarthTrackOffClass = "bg-[#e7e5e4]"
export const rootsFormEarthActiveBgClass = "active:bg-[#fafaf7]/70"

/** Superficie blanca en inputs editables (texto / textarea) — no heredar tierra del shell. */
export const rootsFormTextInputSurfaceClass =
  "!bg-white hover:!bg-white focus:!bg-white focus-visible:!bg-white"

/** Label secundario — mismo rol que muted-foreground en paleta tierra. */
export const rootsFormEarthLabelMutedClass = rootsFormEarthTextSecondaryClass
