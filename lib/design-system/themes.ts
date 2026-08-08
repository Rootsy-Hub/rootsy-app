/**
 * Temas semánticos Rootsy — mapeo primitivos → roles de UI.
 * Espejo de styles/rootsy/themes/*.css
 */

import { rootsyColorHex } from "@/lib/design-system/tokens/colors"

export type RootsyThemeId = "pos" | "workspace" | "marketing" | "library"

/** @deprecated Usar "marketing" */
export type LegacyRootsyThemeId = RootsyThemeId | "landing"

export type RootsyThemeTokens = {
  id: RootsyThemeId
  label: string
  className: string
  shell: string
  surface: string
  elevated: string
  border: string
  textPrimary: string
  textSecondary: string
  action: string
  actionText: string
  accent: string
}

export const ROOTSY_THEMES: RootsyThemeTokens[] = [
  {
    id: "pos",
    label: "Mostrador POS",
    className: "rootsy-theme-pos",
    shell: rootsyColorHex("sombra", "950"),
    surface: rootsyColorHex("sombra", "600"),
    elevated: rootsyColorHex("sombra", "500"),
    border: rootsyColorHex("sombra", "border"),
    textPrimary: "#F4F8F6",
    textSecondary: rootsyColorHex("sombra", "300"),
    action: rootsyColorHex("savia", "600"),
    actionText: "#FFFFFF",
    accent: rootsyColorHex("savia", "400"),
  },
  {
    id: "workspace",
    label: "Workspace",
    className: "rootsy-theme-workspace",
    shell: rootsyColorHex("bruma", "100"),
    surface: "#FFFFFF",
    elevated: rootsyColorHex("bruma", "50"),
    border: rootsyColorHex("bruma", "200"),
    textPrimary: rootsyColorHex("bruma", "900"),
    textSecondary: rootsyColorHex("bruma", "500"),
    action: rootsyColorHex("savia", "600"),
    actionText: "#FFFFFF",
    accent: rootsyColorHex("savia", "400"),
  },
  {
    id: "marketing",
    label: "Marketing · hero",
    className: "rootsy-theme-landing",
    shell: rootsyColorHex("sombra", "900"),
    surface: rootsyColorHex("sombra", "800"),
    elevated: "#141C19",
    border: rootsyColorHex("sombra", "border"),
    textPrimary: "#FFFFFF",
    textSecondary: rootsyColorHex("sombra", "300"),
    action: rootsyColorHex("savia", "500"),
    actionText: "#FFFFFF",
    accent: rootsyColorHex("savia", "400"),
  },
  {
    id: "library",
    label: "Librería",
    className: "rootsy-theme-library",
    shell: rootsyColorHex("sombra", "700"),
    surface: rootsyColorHex("bruma", "100"),
    elevated: "#FFFFFF",
    border: rootsyColorHex("bruma", "200"),
    textPrimary: rootsyColorHex("bruma", "900"),
    textSecondary: rootsyColorHex("bruma", "500"),
    action: rootsyColorHex("savia", "600"),
    actionText: "#FFFFFF",
    accent: rootsyColorHex("savia", "400"),
  },
]

export function getRootsyTheme(id: RootsyThemeId | "landing"): RootsyThemeTokens {
  const resolved = id === "landing" ? "marketing" : id
  const theme = ROOTSY_THEMES.find((t) => t.id === resolved)
  if (!theme) throw new Error(`Unknown theme: ${id}`)
  return theme
}
