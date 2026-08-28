/**
 * Form controls dark en operar — mismos tokens que catalog-toolbar-control
 * (sombra · bruma · savia · colors-new).
 */

export const LAYOUTS_OPERAR_FORM_DARK = {
  surface: "color-mix(in srgb, var(--rootsy-sombra-950) 55%, transparent)",
  surfaceSunken: "color-mix(in srgb, var(--rootsy-sombra-950) 72%, transparent)",
  border: "color-mix(in srgb, var(--rootsy-sombra-border) 45%, transparent)",
  borderHover: "color-mix(in srgb, var(--rootsy-sombra-border) 65%, transparent)",
  borderFocus: "color-mix(in srgb, var(--rootsy-savia-400) 45%, transparent)",
  focusRing: "0 0 0 2px color-mix(in srgb, var(--rootsy-savia-400) 22%, transparent)",
  text: "var(--rootsy-sombra-50)",
  textMuted: "var(--rootsy-sombra-300)",
  label: "var(--rootsy-sombra-400)",
  icon: "var(--rootsy-sombra-300)",
  selectContentBg: "color-mix(in srgb, var(--rootsy-sombra-950) 88%, transparent)",
  selectItemHighlightBg: "color-mix(in srgb, var(--rootsy-savia-400) 15%, transparent)",
  selectItemHighlightText: "var(--rootsy-savia-400)",
} as const
