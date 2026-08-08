/**
 * Tokens de espaciado Rootsy — fuente de verdad (TS).
 * Espejo de styles/rootsy/tokens/spacing.css
 * Base 8px · nomenclatura space.{step}
 */

export const ROOTSY_SPACING_BASE_PX = 8

export const ROOTSY_SPACE_STEPS = {
  "0": { px: 0, rem: "0rem" },
  "025": { px: 2, rem: "0.125rem" },
  "050": { px: 4, rem: "0.25rem" },
  "075": { px: 6, rem: "0.375rem" },
  "100": { px: 8, rem: "0.5rem" },
  "150": { px: 12, rem: "0.75rem" },
  "200": { px: 16, rem: "1rem" },
  "250": { px: 20, rem: "1.25rem" },
  "300": { px: 24, rem: "1.5rem" },
  "400": { px: 32, rem: "2rem" },
  "500": { px: 40, rem: "2.5rem" },
  "600": { px: 48, rem: "3rem" },
  "800": { px: 64, rem: "4rem" },
  "1000": { px: 80, rem: "5rem" },
} as const

export type RootsySpaceStep = keyof typeof ROOTSY_SPACE_STEPS

export function rootsySpaceVar(step: RootsySpaceStep | string): string {
  return `var(--rootsy-space-${step})`
}

export function rootsySpacePx(step: RootsySpaceStep): number {
  return ROOTSY_SPACE_STEPS[step].px
}
