/**
 * Spec propuestas Bloques — exploraciones estáticas solo con fundamentos Rootsy.
 * Cuentas incluyen impronta de marca (isotipo + gradiente institucional).
 */

import { rootsyColorHex, rootsySpacePx } from "@/lib/design-system"

const hx = rootsyColorHex

export type LayoutsBlocksProposalSpecRow = {
  id: string
  label: string
  entity: "cuenta" | "caja"
  sample: string
  elevationToken: string
  radiusToken: string
  typographyTokens: string
  colorTokens: string
  layoutIdea: string
}

export const LAYOUTS_BLOCKS_ACCOUNT_PROPOSAL_ROWS: LayoutsBlocksProposalSpecRow[] = [
  {
    id: "cuenta-loseta-marca",
    label: "A · Loseta",
    entity: "cuenta",
    sample: "Santander",
    elevationToken: "elevation.default-bordered",
    radiusToken: "radius.xxlarge · 22px",
    typographyTokens: "font-canopy meta · font-numeric metric.lg",
    colorTokens: "bruma-200 borde · bruma-900 texto",
    layoutIdea: "Plano con borde · cabecera isotipo + menú · saldo · pie liquidaciones.",
  },
  {
    id: "cuenta-cabecera-marca",
    label: "B · Cabecera de marca",
    entity: "cuenta",
    sample: "Mercado Pago",
    elevationToken: "elevation.raised · shadow.raised",
    radiusToken: "radius.xxlarge · 22px",
    typographyTokens: "font-canopy heading.sm · font-numeric metric.lg",
    colorTokens: "headerGradient · cuerpo blanco · menú sobre color",
    layoutIdea: "Impronta institucional arriba · cuerpo blanco con mismas métricas.",
  },
  {
    id: "cuenta-elevada-marca",
    label: "C · Elevada",
    entity: "cuenta",
    sample: "Galicia",
    elevationToken: "elevation.raised · shadow.raised",
    radiusToken: "radius.xxlarge · 22px",
    typographyTokens: "font-canopy label · font-numeric metric.lg",
    colorTokens: "blanco · bruma-200 · isotipo como acento de marca",
    layoutIdea: "Tarjeta con sombra suave · marca en isotipo · misma estructura que A.",
  },
] as const

export const LAYOUTS_BLOCKS_CASH_PROPOSAL_ROWS: LayoutsBlocksProposalSpecRow[] = [
  {
    id: "caja-banda-turno",
    label: "A · Banda de turno",
    entity: "caja",
    sample: "Caja principal · abierta / cerrada",
    elevationToken: "elevation.raised · shadow.raised",
    radiusToken: "radius.xlarge · 16px",
    typographyTokens: "font-canopy label · font-numeric metric.lg",
    colorTokens: "savia-600 / 10% banda · savia-800 estado",
    layoutIdea: "Cabecera + menú · pill estado · cobrado hero · pie fijo efectivo / CTA.",
  },
  {
    id: "caja-loseta-cerrada",
    label: "B · Loseta",
    entity: "caja",
    sample: "Mostrador sur · abierta / cerrada",
    elevationToken: "elevation.default-bordered",
    radiusToken: "radius.large · 12px",
    typographyTokens: "font-canopy meta · font-numeric metric.lg",
    colorTokens: "bruma-50 panel · savia-600 CTA",
    layoutIdea: "Loseta plana · panel hundido · pie fijo abrir / efectivo.",
  },
  {
    id: "caja-kpi-compacto",
    label: "C · KPI compacto",
    entity: "caja",
    sample: "Caja express · abierta / cerrada",
    elevationToken: "elevation.raised · shadow.raised",
    radiusToken: "radius.xlarge · 16px",
    typographyTokens: "font-canopy label · font-numeric metric.md",
    colorTokens: "bruma-50 franja KPI · savia pill abierta",
    layoutIdea: "Identidad mínima · franja KPI 2 columnas · pie fijo.",
  },
] as const

export const LAYOUTS_BLOCKS_PROPOSAL_SPEC_ROWS = [
  ...LAYOUTS_BLOCKS_ACCOUNT_PROPOSAL_ROWS,
  ...LAYOUTS_BLOCKS_CASH_PROPOSAL_ROWS,
] as const

export const LAYOUTS_BLOCKS_PROPOSAL_FOUNDATIONS = {
  contentBackground: hx("bruma", "50"),
  contentBackgroundToken: "elevation.surface.sunken · bruma-50",
  gridGapPx: rootsySpacePx("200"),
  gridGapToken: "space.200",
} as const
