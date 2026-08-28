/**
 * Atmósferas de formulario — las tres luces del handbook.
 * light → bruma · dark (POS) → receta vidrio sombra · sombra/éter → hoja 800.
 */

import { LAYOUTS_OPERAR_FORM_DARK } from "@/app/library/layouts/layoutsOperarFormTokens"

export const ROOTSY_FORM_ATMOSPHERES = ["bruma", "sombra", "eter"] as const

export type RootsFormAtmosphere = (typeof ROOTSY_FORM_ATMOSPHERES)[number]

export type RootsFormTone = "light" | "dark" | RootsFormAtmosphere

export type RootsFormStyleOptions = {
  tone?: RootsFormTone
}

export function resolveRootsFormAtmosphere(
  tone?: RootsFormTone | null,
): RootsFormAtmosphere {
  if (tone === "eter") return "eter"
  if (tone === "sombra" || tone === "dark") return "sombra"
  return "bruma"
}

export function isRootsFormAtmosphereDark(atmosphere: RootsFormAtmosphere) {
  return atmosphere !== "bruma"
}

export function isRootsFormToneDark(tone?: RootsFormTone | null) {
  return isRootsFormAtmosphereDark(resolveRootsFormAtmosphere(tone))
}

export type RootsFormAtmosphereRecipe = {
  atmosphere: RootsFormAtmosphere
  dark: boolean
  surface: string
  surfaceSunken: string
  border: string
  borderHover: string
  text: string
  textMuted: string
  label: string
  icon: string
  focus: string
  focusRing: string
  error: string
  errorText: string
  errorRing: string
  warningText: string
  successText: string
  solidFill: string
  solidInk: string
  trackOff: string
  thumbOff: string
  selectionBg: string
  selectionText: string
}

function familyVar(family: RootsFormAtmosphere, step: string) {
  return `var(--rootsy-${family}-${step})`
}

function handbookDarkRecipe(atmosphere: "sombra" | "eter"): RootsFormAtmosphereRecipe {
  const signal = "var(--rootsy-savia-500)"
  return {
    atmosphere,
    dark: true,
    surface: familyVar(atmosphere, "800"),
    surfaceSunken: familyVar(atmosphere, "900"),
    border: familyVar(atmosphere, "700"),
    borderHover: familyVar(atmosphere, "600"),
    text: familyVar(atmosphere, "50"),
    textMuted: familyVar(atmosphere, "300"),
    label: familyVar(atmosphere, "300"),
    icon: familyVar(atmosphere, "300"),
    focus: signal,
    focusRing: `0 0 0 2px color-mix(in srgb, ${signal} 28%, transparent)`,
    error: "var(--rootsy-lava-500)",
    errorText: "var(--rootsy-lava-500)",
    errorRing: "0 0 0 2px color-mix(in srgb, var(--rootsy-lava-500) 28%, transparent)",
    warningText: "var(--rootsy-sol-500)",
    successText: "var(--rootsy-savia-500)",
    solidFill: "var(--rootsy-savia-500)",
    solidInk: "var(--rootsy-savia-950)",
    trackOff: familyVar(atmosphere, "700"),
    thumbOff: familyVar(atmosphere, "50"),
    selectionBg: familyVar(atmosphere, "700"),
    selectionText: familyVar(atmosphere, "50"),
  }
}

const BRUMA_RECIPE: RootsFormAtmosphereRecipe = {
  atmosphere: "bruma",
  dark: false,
  surface: "var(--rootsy-blanco)",
  surfaceSunken: "var(--rootsy-bruma-50)",
  border: "var(--rootsy-bruma-200)",
  borderHover: "var(--rootsy-bruma-300)",
  text: "var(--rootsy-bruma-950)",
  textMuted: "var(--rootsy-bruma-700)",
  label: "var(--rootsy-bruma-700)",
  icon: "var(--rootsy-bruma-700)",
  focus: "var(--rootsy-savia-400)",
  focusRing: "0 0 0 2px color-mix(in srgb, var(--rootsy-savia-400) 45%, transparent)",
  error: "var(--rootsy-lava-500)",
  errorText: "var(--rootsy-lava-700)",
  errorRing: "0 0 0 2px color-mix(in srgb, var(--rootsy-lava-500) 25%, transparent)",
  warningText: "var(--rootsy-sol-700)",
  successText: "var(--rootsy-savia-700)",
  solidFill: "var(--rootsy-savia-500)",
  solidInk: "var(--rootsy-savia-950)",
  trackOff: "var(--rootsy-bruma-200)",
  thumbOff: "var(--rootsy-blanco)",
  selectionBg: "var(--rootsy-bruma-100)",
  selectionText: "var(--rootsy-bruma-950)",
}

const POS_DARK_RECIPE: RootsFormAtmosphereRecipe = {
  atmosphere: "sombra",
  dark: true,
  surface: LAYOUTS_OPERAR_FORM_DARK.surface,
  surfaceSunken: LAYOUTS_OPERAR_FORM_DARK.surfaceSunken,
  border: LAYOUTS_OPERAR_FORM_DARK.border,
  borderHover: LAYOUTS_OPERAR_FORM_DARK.borderHover,
  text: LAYOUTS_OPERAR_FORM_DARK.text,
  textMuted: LAYOUTS_OPERAR_FORM_DARK.textMuted,
  label: LAYOUTS_OPERAR_FORM_DARK.label,
  icon: LAYOUTS_OPERAR_FORM_DARK.icon,
  focus: LAYOUTS_OPERAR_FORM_DARK.borderFocus,
  focusRing: LAYOUTS_OPERAR_FORM_DARK.focusRing,
  error: "var(--rootsy-lava-500)",
  errorText: "var(--rootsy-lava-500)",
  errorRing: "0 0 0 2px color-mix(in srgb, var(--rootsy-lava-500) 28%, transparent)",
  warningText: "var(--rootsy-sol-500)",
  successText: "var(--rootsy-savia-500)",
  solidFill: "var(--rootsy-savia-500)",
  solidInk: "var(--rootsy-savia-950)",
  trackOff: "color-mix(in srgb, var(--rootsy-sombra-border) 55%, transparent)",
  thumbOff: "var(--rootsy-sombra-50)",
  selectionBg: "var(--rootsy-sombra-700)",
  selectionText: "var(--rootsy-sombra-50)",
}

export function getRootsFormAtmosphereRecipe(
  tone?: RootsFormTone | null,
): RootsFormAtmosphereRecipe {
  if (tone === "dark") return POS_DARK_RECIPE
  if (tone === "eter") return handbookDarkRecipe("eter")
  if (tone === "sombra") return handbookDarkRecipe("sombra")
  return BRUMA_RECIPE
}
