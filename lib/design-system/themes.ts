/**
 * Temas semánticos Rootsy — mapeo primitivos → roles de UI.
 * Espejo de styles/rootsy/themes/*.css
 */

import { rootsyColorHex } from "@/lib/design-system/tokens/colors"

export type RootsyThemeId = "pos" | "workspace" | "landing" | "library"

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
    shell: rootsyColorHex("ceniza", "950"),
    surface: rootsyColorHex("ceniza", "600"),
    elevated: rootsyColorHex("ceniza", "500"),
    border: "#334155",
    textPrimary: "#F8FAFC",
    textSecondary: rootsyColorHex("ceniza", "300"),
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
    id: "landing",
    label: "Landing",
    className: "rootsy-theme-landing",
    shell: rootsyColorHex("landing", "950"),
    surface: rootsyColorHex("landing", "800"),
    elevated: "#141C19",
    border: rootsyColorHex("ceniza", "700"),
    textPrimary: "#FFFFFF",
    textSecondary: rootsyColorHex("ceniza", "300"),
    action: rootsyColorHex("landing", "500"),
    actionText: "#FFFFFF",
    accent: rootsyColorHex("landing", "400"),
  },
  {
    id: "library",
    label: "Librería",
    className: "rootsy-theme-library",
    shell: rootsyColorHex("ceniza", "700"),
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

export function getRootsyTheme(id: RootsyThemeId): RootsyThemeTokens {
  const theme = ROOTSY_THEMES.find((t) => t.id === id)
  if (!theme) throw new Error(`Unknown theme: ${id}`)
  return theme
}
