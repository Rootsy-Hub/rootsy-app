/**
 * Temas semánticos Rootsy — mapeo primitivos → roles de UI.
 * Espejo de styles/rootsy/themes/*.css
 * Los pasos salen del handbook: atmósfera por contexto, funcionales fijos.
 */

import { rootsyColorHex } from "@/lib/design-system/tokens/colors"

export type RootsyThemeId = "pos" | "workspace" | "bruma-oscura" | "marketing" | "library"

/** @deprecated Usar "marketing" */
export type LegacyRootsyThemeId = RootsyThemeId | "landing"

export type RootsyThemeTokens = {
  id: RootsyThemeId
  label: string
  className: string
  fondo: string
  superficie: string
  elevada: string
  borde: string
  texto: string
  textoMuted: string
  accion: string
  accionHover: string
  foco: string
  /** @deprecated Usar fondo */
  shell: string
  /** @deprecated Usar superficie */
  surface: string
  /** @deprecated Usar elevada */
  elevated: string
  /** @deprecated Usar borde */
  border: string
  /** @deprecated Usar texto */
  textPrimary: string
  /** @deprecated Usar textoMuted */
  textSecondary: string
  /** @deprecated Usar accion */
  action: string
  actionText: string
  /** @deprecated Usar foco */
  accent: string
}

function themeTokens(spec: {
  id: RootsyThemeId
  label: string
  className: string
  atmosphere: "eter" | "bruma" | "sombra" | "bruma-noche"
}): RootsyThemeTokens {
  const steps =
    spec.atmosphere === "eter"
      ? { fondo: "950", superficie: "800", elevada: "700", borde: "700", texto: "50", muted: "300", family: "eter" as const }
      : spec.atmosphere === "sombra"
        ? { fondo: "950", superficie: "600", elevada: "500", borde: "400", texto: "50", muted: "300", family: "sombra" as const }
        : spec.atmosphere === "bruma-noche"
          ? { fondo: "950", superficie: "800", elevada: "700", borde: "700", texto: "50", muted: "400", family: "bruma" as const }
          : { fondo: "100", superficie: "50", elevada: "50", borde: "200", texto: "900", muted: "700", family: "bruma" as const }

  const fondo = rootsyColorHex(steps.family, steps.fondo)
  const superficie = rootsyColorHex(steps.family, steps.superficie)
  const elevada = rootsyColorHex(steps.family, steps.elevada)
  const borde = rootsyColorHex(steps.family, steps.borde)
  const texto = rootsyColorHex(steps.family, steps.texto)
  const textoMuted = rootsyColorHex(steps.family, steps.muted)
  const accion = rootsyColorHex("savia", "600")
  const accionHover = rootsyColorHex("savia", "700")
  const foco = rootsyColorHex("savia", "400")
  const actionText = rootsyColorHex("savia", "50")

  return {
    id: spec.id,
    label: spec.label,
    className: spec.className,
    fondo,
    superficie,
    elevada,
    borde,
    texto,
    textoMuted,
    accion,
    accionHover,
    foco,
    shell: fondo,
    surface: superficie,
    elevated: elevada,
    border: borde,
    textPrimary: texto,
    textSecondary: textoMuted,
    action: accion,
    actionText,
    accent: foco,
  }
}

export const ROOTSY_THEMES: RootsyThemeTokens[] = [
  themeTokens({
    id: "pos",
    label: "Mostrador POS",
    className: "rootsy-theme-pos",
    atmosphere: "sombra",
  }),
  themeTokens({
    id: "workspace",
    label: "Workspace",
    className: "rootsy-theme-workspace",
    atmosphere: "bruma",
  }),
  themeTokens({
    id: "bruma-oscura",
    label: "Bruma oscura",
    className: "rootsy-theme-bruma-oscura",
    atmosphere: "bruma-noche",
  }),
  themeTokens({
    id: "marketing",
    label: "Marketing · hero",
    className: "rootsy-theme-landing",
    atmosphere: "eter",
  }),
  themeTokens({
    id: "library",
    label: "Librería",
    className: "rootsy-theme-library",
    atmosphere: "bruma",
  }),
]

export function getRootsyTheme(id: RootsyThemeId | "landing"): RootsyThemeTokens {
  const resolved = id === "landing" ? "marketing" : id
  const theme = ROOTSY_THEMES.find((t) => t.id === resolved)
  if (!theme) throw new Error(`Unknown theme: ${id}`)
  return theme
}
