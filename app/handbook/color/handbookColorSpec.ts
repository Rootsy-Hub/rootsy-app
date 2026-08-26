/**
 * Tokens y contraste del handbook — referencia para auditar el producto.
 * Los hex se resuelven desde las paletas. No se inventan colores sueltos.
 */

import {
  handbookColorHex,
  type HandbookColorStepId,
} from "@/app/handbook/color/handbookColorPalettes"

export type HandbookAtmosphereId = "eter" | "bruma" | "sombra"

export const HANDBOOK_ATMOSPHERE_CONTEXTS: {
  id: HandbookAtmosphereId
  name: string
  sample: string
}[] = [
  { id: "eter", name: "Éter", sample: "Header, menú, vacío." },
  { id: "bruma", name: "Bruma", sample: "Workspace, tablas, ticket." },
  { id: "sombra", name: "Sombra", sample: "Mostrador, catálogo, rail." },
]

export type HandbookAtmosphereToken = {
  id: string
  token: string
  label: string
  purpose: string
  steps: Record<HandbookAtmosphereId, HandbookColorStepId>
}

export const HANDBOOK_ATMOSPHERE_TOKENS: HandbookAtmosphereToken[] = [
  {
    id: "fondo",
    token: "--color-fondo",
    label: "Fondo",
    purpose: "Lienzo de la pantalla.",
    steps: { eter: "950", bruma: "100", sombra: "950" },
  },
  {
    id: "superficie",
    token: "--color-superficie",
    label: "Superficie",
    purpose: "Panel, canvas o ticket.",
    steps: { eter: "800", bruma: "50", sombra: "600" },
  },
  {
    id: "elevada",
    token: "--color-elevada",
    label: "Elevada",
    purpose: "Card sobre la superficie.",
    steps: { eter: "700", bruma: "50", sombra: "500" },
  },
  {
    id: "borde",
    token: "--color-borde",
    label: "Borde",
    purpose: "Divisor y contorno.",
    steps: { eter: "700", bruma: "200", sombra: "400" },
  },
  {
    id: "texto",
    token: "--color-texto",
    label: "Texto",
    purpose: "Lectura principal.",
    steps: { eter: "50", bruma: "900", sombra: "50" },
  },
  {
    id: "texto-muted",
    token: "--color-texto-muted",
    label: "Texto muted",
    purpose: "Secundario y metadatos.",
    steps: { eter: "300", bruma: "700", sombra: "300" },
  },
]

export type HandbookFunctionalToken = {
  id: string
  token: string
  label: string
  purpose: string
  familyId: string
  familyName: string
  step: HandbookColorStepId
}

export const HANDBOOK_FUNCTIONAL_TOKENS: HandbookFunctionalToken[] = [
  {
    id: "accion",
    token: "--color-accion",
    label: "Acción",
    purpose: "CTA principal — vender, guardar, confirmar.",
    familyId: "savia",
    familyName: "Savia",
    step: "600",
  },
  {
    id: "accion-hover",
    token: "--color-accion-hover",
    label: "Acción hover",
    purpose: "Pressed y hover fuerte del CTA. También el relleno si el texto del botón es chico.",
    familyId: "savia",
    familyName: "Savia",
    step: "700",
  },
  {
    id: "foco",
    token: "--color-foco",
    label: "Foco",
    purpose: "Ring, rail activo y selección. No compite con el CTA.",
    familyId: "savia",
    familyName: "Savia",
    step: "400",
  },
  {
    id: "exito",
    token: "--color-exito",
    label: "Éxito",
    purpose: "Pagado, activo, listo.",
    familyId: "savia",
    familyName: "Savia",
    step: "500",
  },
  {
    id: "informacion",
    token: "--color-informacion",
    label: "Información",
    purpose: "En curso, enviado, contexto.",
    familyId: "cielo-de-dia",
    familyName: "Cielo de día",
    step: "500",
  },
  {
    id: "atencion",
    token: "--color-atencion",
    label: "Atención",
    purpose: "Preparando, pendiente con calor. No es peligro.",
    familyId: "sol",
    familyName: "Sol",
    step: "500",
  },
  {
    id: "peligro",
    token: "--color-peligro",
    label: "Peligro",
    purpose: "Error y acciones que no se deshacen.",
    familyId: "lava",
    familyName: "Lava",
    step: "600",
  },
]

export const HANDBOOK_STATUS_TINT_RULE =
  "Sobre un tint, el fondo es el paso 50 de la misma familia y el texto es el paso 800. Sol usa 900 si el 800 no alcanza."

export const HANDBOOK_BRUMA_NOCHE = {
  fondo: "950" as HandbookColorStepId,
  superficie: "800" as HandbookColorStepId,
  elevada: "700" as HandbookColorStepId,
  borde: "700" as HandbookColorStepId,
  texto: "50" as HandbookColorStepId,
  muted: "400" as HandbookColorStepId,
}

export type HandbookContrastLevel = "AAA" | "AA" | "AA grande" | "No"

export type HandbookContrastPair = {
  id: string
  label: string
  context: string
  foreground: { familyId: string; step: HandbookColorStepId }
  background: { familyId: string; step: HandbookColorStepId }
  ratio: string
  level: HandbookContrastLevel
}

export const HANDBOOK_CONTRAST_PASS: HandbookContrastPair[] = [
  {
    id: "eter-texto",
    label: "Éter 50 sobre 900",
    context: "Texto en header y menú.",
    foreground: { familyId: "eter", step: "50" },
    background: { familyId: "eter", step: "900" },
    ratio: "19.0:1",
    level: "AAA",
  },
  {
    id: "eter-muted",
    label: "Éter 300 sobre 900",
    context: "Metadatos sobre la banda.",
    foreground: { familyId: "eter", step: "300" },
    background: { familyId: "eter", step: "900" },
    ratio: "9.2:1",
    level: "AAA",
  },
  {
    id: "bruma-texto",
    label: "Bruma 900 sobre 100",
    context: "Cuerpo en workspace, tablas y ticket.",
    foreground: { familyId: "bruma", step: "900" },
    background: { familyId: "bruma", step: "100" },
    ratio: "16.3:1",
    level: "AAA",
  },
  {
    id: "bruma-muted",
    label: "Bruma 700 sobre 100",
    context: "Texto secundario en claro. El muted válido.",
    foreground: { familyId: "bruma", step: "700" },
    background: { familyId: "bruma", step: "100" },
    ratio: "9.1:1",
    level: "AAA",
  },
  {
    id: "bruma-noche-texto",
    label: "Bruma 50 sobre 950",
    context: "Cuerpo en bruma de noche.",
    foreground: { familyId: "bruma", step: "50" },
    background: { familyId: "bruma", step: "950" },
    ratio: "18.1:1",
    level: "AAA",
  },
  {
    id: "bruma-noche-muted",
    label: "Bruma 400 sobre 950",
    context: "Metadatos en bruma de noche.",
    foreground: { familyId: "bruma", step: "400" },
    background: { familyId: "bruma", step: "950" },
    ratio: "7.6:1",
    level: "AAA",
  },
  {
    id: "sombra-texto",
    label: "Sombra 50 sobre 600",
    context: "Título de producto en el catálogo.",
    foreground: { familyId: "sombra", step: "50" },
    background: { familyId: "sombra", step: "600" },
    ratio: "14.6:1",
    level: "AAA",
  },
  {
    id: "sombra-muted",
    label: "Sombra 300 sobre 600",
    context: "Labels inactivos del rail.",
    foreground: { familyId: "sombra", step: "300" },
    background: { familyId: "sombra", step: "600" },
    ratio: "6.0:1",
    level: "AA",
  },
  {
    id: "savia-cta",
    label: "Savia 50 sobre 700",
    context: "CTA con texto chico. Preferir 700 al 600.",
    foreground: { familyId: "savia", step: "50" },
    background: { familyId: "savia", step: "700" },
    ratio: "5.2:1",
    level: "AA",
  },
  {
    id: "savia-tint",
    label: "Savia 800 sobre 50",
    context: "Texto sobre tint de éxito.",
    foreground: { familyId: "savia", step: "800" },
    background: { familyId: "savia", step: "50" },
    ratio: "7.3:1",
    level: "AAA",
  },
  {
    id: "savia-foco",
    label: "Savia 400 sobre sombra 900",
    context: "Foco y links sobre el dosel.",
    foreground: { familyId: "savia", step: "400" },
    background: { familyId: "sombra", step: "900" },
    ratio: "10.2:1",
    level: "AAA",
  },
  {
    id: "cielo-tint",
    label: "Cielo 800 sobre 50",
    context: "Texto sobre tint de información.",
    foreground: { familyId: "cielo-de-dia", step: "800" },
    background: { familyId: "cielo-de-dia", step: "50" },
    ratio: "9.0:1",
    level: "AAA",
  },
  {
    id: "sol-tint",
    label: "Sol 900 sobre 50",
    context: "Texto sobre tint de atención. El 800 también pasa; el 900 es más seguro.",
    foreground: { familyId: "sol", step: "900" },
    background: { familyId: "sol", step: "50" },
    ratio: "10.7:1",
    level: "AAA",
  },
  {
    id: "lava-cta",
    label: "Lava 50 sobre 600",
    context: "Botón destructivo.",
    foreground: { familyId: "lava", step: "50" },
    background: { familyId: "lava", step: "600" },
    ratio: "6.4:1",
    level: "AA",
  },
  {
    id: "lava-tint",
    label: "Lava 800 sobre 50",
    context: "Texto sobre tint de error.",
    foreground: { familyId: "lava", step: "800" },
    background: { familyId: "lava", step: "50" },
    ratio: "12.7:1",
    level: "AAA",
  },
]

export const HANDBOOK_CONTRAST_FAIL: HandbookContrastPair[] = [
  {
    id: "bruma-400-claro",
    label: "Bruma 400 sobre 100",
    context: "Metadatos ilegibles en ticket y tablas.",
    foreground: { familyId: "bruma", step: "400" },
    background: { familyId: "bruma", step: "100" },
    ratio: "2.3:1",
    level: "No",
  },
  {
    id: "bruma-500-cuerpo",
    label: "Bruma 500 sobre 100",
    context: "No alcanza para cuerpo. Solo texto grande.",
    foreground: { familyId: "bruma", step: "500" },
    background: { familyId: "bruma", step: "100" },
    ratio: "4.2:1",
    level: "AA grande",
  },
  {
    id: "savia-600-chico",
    label: "Savia 50 sobre 600",
    context: "CTA con texto chico. Subir a savia 700.",
    foreground: { familyId: "savia", step: "50" },
    background: { familyId: "savia", step: "600" },
    ratio: "3.6:1",
    level: "AA grande",
  },
  {
    id: "sol-500-inverso",
    label: "Sol 50 sobre 500",
    context: "Nunca texto claro sobre sol 500.",
    foreground: { familyId: "sol", step: "50" },
    background: { familyId: "sol", step: "500" },
    ratio: "2.0:1",
    level: "No",
  },
  {
    id: "cielo-500-chico",
    label: "Cielo 50 sobre 500",
    context: "Texto chico sobre cielo 500. Usar 600 o tint 50 + 800.",
    foreground: { familyId: "cielo-de-dia", step: "50" },
    background: { familyId: "cielo-de-dia", step: "500" },
    ratio: "3.4:1",
    level: "AA grande",
  },
]

export const HANDBOOK_CONTRAST_RULES = [
  "Texto normal: 4.5:1 o más. Muted en bruma clara es 700, no 400 ni 500.",
  "Texto grande o botón semibold: 3:1 alcanza. Savia 600 sirve acá; si el texto es chico, usar 700.",
  "Sobre tint funcional: fondo 50 y texto 800 de la misma familia. Sol usa 900.",
  "Nunca texto claro sobre sol 500. Nunca bruma 400 como cuerpo en claro.",
  "Bruma de noche no toma muted de sombra: el mute del dosel no es el mute de la neblina.",
] as const

export function atmosphereTokenHex(
  token: HandbookAtmosphereToken,
  atmosphereId: HandbookAtmosphereId,
): string {
  return handbookColorHex(atmosphereId, token.steps[atmosphereId])
}

export function functionalTokenHex(token: HandbookFunctionalToken): string {
  return handbookColorHex(token.familyId, token.step)
}
