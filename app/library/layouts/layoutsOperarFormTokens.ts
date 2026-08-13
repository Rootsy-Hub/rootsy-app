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
  text: "#f4f8f6",
  textMuted: "color-mix(in srgb, var(--rootsy-sombra-300) 55%, transparent)",
  label: "color-mix(in srgb, var(--rootsy-bruma-100) 84%, var(--rootsy-sombra-300))",
  icon: "color-mix(in srgb, var(--rootsy-sombra-300) 70%, transparent)",
  selectContentBg: "color-mix(in srgb, var(--rootsy-sombra-950) 88%, transparent)",
  selectItemHighlightBg: "color-mix(in srgb, var(--rootsy-savia-400) 15%, transparent)",
  selectItemHighlightText: "color-mix(in srgb, var(--rootsy-savia-200) 92%, white)",
} as const
