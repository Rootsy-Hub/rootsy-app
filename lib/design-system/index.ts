/**
 * Rootsy Design System — entrada única para tokens y temas.
 * CSS: styles/rootsy/rootsy.css (importado en app/globals.css)
 * Docs: app/.../library/ re-exporta o extiende estos tokens.
 */

export {
  ROOTSY_COLOR_RAMPS,
  ROOTSY_COLOR_SEMANTIC,
  ROOTSY_SUELO,
  ROOTSY_CIELO,
  ROOTSY_SOL,
  ROOTSY_ETER,
  ROOTSY_ATMOSPHERE,
  rootsyColorHex,
  rootsyColorVar,
  type RootsyColorFamily,
} from "@/lib/design-system/tokens/colors"

export {
  ROOTSY_FONT_FAMILIES,
  ROOTSY_FONT_WEIGHTS,
  ROOTSY_TEXT_STYLES,
  ROOTSY_TYPE_SCALE,
  rootsyTextVar,
} from "@/lib/design-system/tokens/typography"

export {
  ROOTSY_SPACE_STEPS,
  ROOTSY_SPACING_BASE_PX,
  rootsySpacePx,
  rootsySpaceVar,
  type RootsySpaceStep,
} from "@/lib/design-system/tokens/spacing"

export {
  ROOTSY_THEMES,
  getRootsyTheme,
  type RootsyThemeId,
  type RootsyThemeTokens,
} from "@/lib/design-system/themes"
