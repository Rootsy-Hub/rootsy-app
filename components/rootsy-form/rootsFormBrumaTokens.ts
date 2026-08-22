/**
 * Escala bruma para RootsForm — tokens globales (--rootsy-bruma-*).
 * Sirven en portales Radix (select/date) porque viven en :root.
 */

export const ROOTSY_FORM_BRUMA = {
  900: "#121417",
  700: "#334155",
  600: "#475569",
  500: "#64748B",
  400: "#94A3B8",
  300: "#CBD5E1",
  200: "#DFE4EA",
  100: "#EEF1F5",
  50: "#F4F6F9",
} as const

export const rootsFormBrumaBorderClass = "border-[color:var(--rootsy-bruma-200)]"
export const rootsFormBrumaBorderHoverClass = "hover:border-[color:var(--rootsy-bruma-300)]"
export const rootsFormBrumaBorderFocusClosedClass = "!border-[color:var(--rootsy-bruma-200)]"
export const rootsFormBrumaDividerClass = "bg-[color:var(--rootsy-bruma-200)]"
export const rootsFormBrumaBgMutedClass = "bg-[color:var(--rootsy-bruma-100)]"
export const rootsFormBrumaBgSubtleClass = "bg-[color:var(--rootsy-bruma-50)]"
/** Slot affix — bruma suave, glifo un tono más oscuro. */
export const rootsFormBrumaPrefixBgClass = "bg-[color:var(--rootsy-bruma-100)]"
export const rootsFormBrumaPrefixBorderClass = "border-[color:var(--rootsy-bruma-200)]"
export const rootsFormBrumaPrefixBorderHoverClass =
  "group-hover:border-[color:var(--rootsy-bruma-300)]"
export const rootsFormBrumaPrefixTextClass = "text-[color:var(--rootsy-bruma-600)]"
export const rootsFormBrumaPrefixTextMutedClass = "text-[color:var(--rootsy-bruma-400)]"
export const rootsFormBrumaPrefixBgMutedClass = "bg-[color:var(--rootsy-bruma-50)]"
export const rootsFormBrumaPrefixIconSvgClass = "[&_svg]:text-[color:var(--rootsy-bruma-600)]"
export const rootsFormBrumaTextClass = "text-[color:var(--rootsy-bruma-900)]"
export const rootsFormBrumaTextSecondaryClass = "text-[color:var(--rootsy-bruma-500)]"
export const rootsFormBrumaTextTertiaryClass = "text-[color:var(--rootsy-bruma-600)]"
export const rootsFormBrumaPlaceholderClass = "placeholder:text-[color:var(--rootsy-bruma-400)]"
export const rootsFormBrumaHighlightClass = "bg-[color:var(--rootsy-bruma-100)]"
export const rootsFormBrumaHighlightHoverClass = "hover:bg-[color:var(--rootsy-bruma-100)]"
export const rootsFormBrumaSelectionClass =
  "selection:!bg-[color:var(--rootsy-bruma-200)] selection:!text-[color:var(--rootsy-bruma-900)]"
export const rootsFormBrumaDisabledClass = "text-[color:var(--rootsy-bruma-300)]"
export const rootsFormBrumaTrackOffClass = "bg-[color:var(--rootsy-bruma-200)]"
export const rootsFormBrumaActiveBgClass = "active:bg-[color:var(--rootsy-bruma-50)]/70"

/** Superficie blanca en inputs editables (texto / textarea) — no heredar del shell. */
export const rootsFormTextInputSurfaceClass =
  "!bg-white hover:!bg-white focus:!bg-white focus-visible:!bg-white"

/** Label secundario — mismo rol que muted-foreground en bruma. */
export const rootsFormBrumaLabelMutedClass = rootsFormBrumaTextSecondaryClass
