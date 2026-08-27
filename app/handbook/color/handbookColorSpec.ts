/**
 * Tokens y contraste del handbook — referencia para auditar el producto.
 * Los hex se resuelven desde las paletas. No se inventan colores sueltos.
 */

import {
  handbookColorHex,
  type HandbookColorRefStep,
  type HandbookColorStepId,
} from "@/app/handbook/color/handbookColorPalettes"

export type HandbookAtmosphereId = "eter" | "bruma" | "sombra"
export type HandbookWorldAtmosphereId = HandbookAtmosphereId

export const HANDBOOK_ATMOSPHERE_CONTEXTS: {
  id: HandbookAtmosphereId
  name: string
  sample: string
  body: string
  cta: string
}[] = [
  {
    id: "eter",
    name: "Éter",
    sample: "Header, menú, vacío.",
    body: "El cielo del mundo. Encabeza, contiene y abre espacio.",
    cta: "Entrar",
  },
  {
    id: "bruma",
    name: "Sotobosque · Luz filtrada",
    sample: "Workspace, tablas, ticket.",
    body: "Lectura, elección y onboarding. El claro para entrar y elegir.",
    cta: "Continuar",
  },
  {
    id: "sombra",
    name: "Sotobosque · Sombra",
    sample: "Mostrador, catálogo, rail.",
    body: "Módulos operativos, concentración y densidad.",
    cta: "Acción activa",
  },
]

export const HANDBOOK_WORLD_ATMOSPHERES = HANDBOOK_ATMOSPHERE_CONTEXTS

export type HandbookAtmosphereToken = {
  id: string
  token: string
  label: string
  purpose: string
  steps: Record<HandbookAtmosphereId, HandbookColorRefStep>
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
    purpose: "Card sobre la superficie. En Luz filtrada es blanco.",
    steps: { eter: "700", bruma: "blanco", sombra: "500" },
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
    steps: { eter: "50", bruma: "950", sombra: "50" },
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
    purpose: "Acción principal — vender, guardar, confirmar.",
    familyId: "savia",
    familyName: "Savia",
    step: "500",
  },
  {
    id: "accion-hover",
    token: "--color-accion-hover",
    label: "Acción hover",
    purpose: "Hover del rayo. Sobre el CTA, el texto es Raíz 950.",
    familyId: "savia",
    familyName: "Savia",
    step: "600",
  },
  {
    id: "foco",
    token: "--color-foco",
    label: "Foco",
    purpose: "Foco, selección y rail activo. No compite con el CTA.",
    familyId: "savia",
    familyName: "Savia",
    step: "400",
  },
  {
    id: "exito",
    token: "--color-exito",
    label: "Éxito",
    purpose: "Check, listo y progreso.",
    familyId: "savia",
    familyName: "Savia",
    step: "500",
  },
  {
    id: "informacion",
    token: "--color-informacion",
    label: "Información",
    purpose: "Información, orientación y contexto.",
    familyId: "cielo-de-dia",
    familyName: "Cielo",
    step: "500",
  },
  {
    id: "atencion",
    token: "--color-atencion",
    label: "Atención",
    purpose: "Atención, aviso y algo que requiere mirada.",
    familyId: "sol",
    familyName: "Sol",
    step: "500",
  },
  {
    id: "peligro",
    token: "--color-peligro",
    label: "Peligro",
    purpose: "Riesgo, error, bloqueo y acción destructiva.",
    familyId: "lava",
    familyName: "Lava",
    step: "500",
  },
]

export const HANDBOOK_STATUS_TINT_RULE =
  "Sobre un tint, el fondo es el 50 y el texto es el profundo (700) de la misma familia."

export type HandbookApplicationAtmosphereId = HandbookAtmosphereId

export const HANDBOOK_APPLICATION_ATMOSPHERES: {
  id: HandbookApplicationAtmosphereId
  name: string
  sample: string
  dark: boolean
}[] = [
  { id: "eter", name: "Éter", sample: "Header, menú, vacío.", dark: true },
  { id: "bruma", name: "Sotobosque · Luz filtrada", sample: "Workspace, tablas, ticket.", dark: false },
  { id: "sombra", name: "Sotobosque · Sombra", sample: "Mostrador, catálogo, rail.", dark: true },
]

export type HandbookFunctionalRecipe = {
  id: string
  label: string
  familyId: string
  familyName: string
  purpose: string
  /** Relleno de CTA o destructivo. */
  solidFill: HandbookColorStepId
  solidText: HandbookColorStepId
  /** Texto sobre el vivo: 950 de la misma familia. */
  solidTextFamilyId?: string
  /** Tint: 50 + borde 200 + profundo 700. */
  tintFill: HandbookColorStepId
  tintBorder: HandbookColorStepId
  tintText: HandbookColorStepId
  /** Vivo sobre oscuro. En Luz filtrada el ink es profundo. */
  signal: HandbookColorStepId
  sampleSolid: string
  sampleTint: string
  hasSolid: boolean
  hasTint: boolean
}

export const HANDBOOK_FUNCTIONAL_RECIPES: HandbookFunctionalRecipe[] = [
  {
    id: "accion",
    label: "Acción",
    familyId: "savia",
    familyName: "Savia",
    purpose: "CTA. Vivo 500; el texto es Savia 950.",
    solidFill: "500",
    solidText: "950",
    tintFill: "50",
    tintBorder: "200",
    tintText: "700",
    signal: "500",
    sampleSolid: "Guardar",
    sampleTint: "Listo",
    hasSolid: true,
    hasTint: false,
  },
  {
    id: "exito",
    label: "Éxito",
    familyId: "savia",
    familyName: "Savia",
    purpose: "Pagado, activo, listo.",
    solidFill: "700",
    solidText: "50",
    tintFill: "50",
    tintBorder: "200",
    tintText: "700",
    signal: "500",
    sampleSolid: "Activo",
    sampleTint: "Pagado",
    hasSolid: false,
    hasTint: true,
  },
  {
    id: "informacion",
    label: "Información",
    familyId: "cielo-de-dia",
    familyName: "Cielo",
    purpose: "Información, orientación y contexto.",
    solidFill: "500",
    solidText: "950",
    tintFill: "50",
    tintBorder: "200",
    tintText: "700",
    signal: "500",
    sampleSolid: "Enviar",
    sampleTint: "En curso",
    hasSolid: false,
    hasTint: true,
  },
  {
    id: "atencion",
    label: "Atención",
    familyId: "sol",
    familyName: "Sol",
    purpose: "Atención, aviso y algo que requiere mirada. Nunca texto 50 sobre 500.",
    solidFill: "500",
    solidText: "950",
    tintFill: "50",
    tintBorder: "200",
    tintText: "700",
    signal: "500",
    sampleSolid: "Aviso",
    sampleTint: "Pendiente",
    hasSolid: false,
    hasTint: true,
  },
  {
    id: "peligro",
    label: "Peligro",
    familyId: "lava",
    familyName: "Lava",
    purpose: "Riesgo, error, bloqueo y acción destructiva.",
    solidFill: "500",
    solidText: "950",
    tintFill: "50",
    tintBorder: "200",
    tintText: "700",
    signal: "500",
    sampleSolid: "Eliminar",
    sampleTint: "Error",
    hasSolid: true,
    hasTint: true,
  },
]

export const HANDBOOK_FUNCTIONAL_APPLICATION_RULES = [
  "Vivo 500 pinta el relleno. El texto sobre el vivo es 950 de la misma familia.",
  "El vivo no va sobre blanco ni sobre el papel de Luz filtrada. El verde de texto, link y contorno en claro es el profundo 700.",
  "En Sombra, texto, links y contorno usan el vivo. Tint: isla 50, borde 200 y texto 700.",
  "Nunca texto 50 sobre un vivo. El primario de Savia es el mismo en las dos luces.",
] as const

export function worldAtmosphereHex(
  tokenId: "fondo" | "superficie" | "elevada" | "texto" | "texto-muted" | "borde",
  atmosphereId: HandbookWorldAtmosphereId,
): string {
  const token = HANDBOOK_ATMOSPHERE_TOKENS.find((item) => item.id === tokenId)
  if (!token) throw new Error(`Unknown atmosphere token: ${tokenId}`)
  return atmosphereTokenHex(token, atmosphereId)
}

export function applicationAtmosphereHex(
  tokenId: "fondo" | "superficie" | "elevada" | "texto" | "texto-muted" | "borde",
  atmosphereId: HandbookApplicationAtmosphereId,
): string {
  return worldAtmosphereHex(tokenId, atmosphereId)
}

export type HandbookContrastLevel = "AAA" | "AA" | "AA grande" | "No"

export type HandbookContrastPair = {
  id: string
  label: string
  context: string
  foreground: { familyId: string; step: HandbookColorRefStep }
  background: { familyId: string; step: HandbookColorRefStep }
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
    label: "Raíz 950 sobre Luz 100",
    context: "Cuerpo en workspace, tablas y ticket.",
    foreground: { familyId: "bruma", step: "950" },
    background: { familyId: "bruma", step: "100" },
    ratio: "16.3:1",
    level: "AAA",
  },
  {
    id: "bruma-texto-blanco",
    label: "Raíz 950 sobre blanco",
    context: "Cuerpo sobre papel, loseta y formulario en Luz filtrada.",
    foreground: { familyId: "bruma", step: "950" },
    background: { familyId: "blanco", step: "blanco" },
    ratio: "18.7:1",
    level: "AAA",
  },
  {
    id: "savia-profundo-blanco",
    label: "Savia 700 sobre blanco",
    context: "Texto, link y etiqueta Identidad sobre el papel. El vivo no entra acá.",
    foreground: { familyId: "savia", step: "700" },
    background: { familyId: "blanco", step: "blanco" },
    ratio: "6.1:1",
    level: "AA",
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
    label: "Raíz 950 sobre Rayo 500",
    context: "CTA prendido. El texto sobre el rayo es Raíz, no blanco.",
    foreground: { familyId: "sombra", step: "950" },
    background: { familyId: "savia", step: "500" },
    ratio: "8.4:1",
    level: "AAA",
  },
  {
    id: "savia-tint",
    label: "Savia 800 sobre 50",
    context: "Texto sobre tint de éxito.",
    foreground: { familyId: "savia", step: "800" },
    background: { familyId: "savia", step: "50" },
    ratio: "10.1:1",
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
    id: "savia-on",
    label: "Savia 950 sobre vivo 500",
    context: "Texto del CTA. El mismo par en las dos luces.",
    foreground: { familyId: "savia", step: "950" },
    background: { familyId: "savia", step: "500" },
    ratio: "14.1:1",
    level: "AAA",
  },
  {
    id: "cielo-tint",
    label: "Cielo 700 sobre 50",
    context: "Profundo sobre tint de información.",
    foreground: { familyId: "cielo-de-dia", step: "700" },
    background: { familyId: "cielo-de-dia", step: "50" },
    ratio: "4.9:1",
    level: "AA",
  },
  {
    id: "sol-tint",
    label: "Sol 700 sobre 50",
    context: "Profundo sobre tint de atención.",
    foreground: { familyId: "sol", step: "700" },
    background: { familyId: "sol", step: "50" },
    ratio: "4.7:1",
    level: "AA",
  },
  {
    id: "lava-cta",
    label: "Lava 950 sobre vivo 500",
    context: "Texto sobre Lava vivo.",
    foreground: { familyId: "lava", step: "950" },
    background: { familyId: "lava", step: "500" },
    ratio: "5.5:1",
    level: "AA",
  },
  {
    id: "lava-tint",
    label: "Lava 700 sobre 50",
    context: "Profundo sobre tint de error.",
    foreground: { familyId: "lava", step: "700" },
    background: { familyId: "lava", step: "50" },
    ratio: "5.0:1",
    level: "AA",
  },
]

export const HANDBOOK_CONTRAST_FAIL: HandbookContrastPair[] = [
  {
    id: "savia-vivo-blanco",
    label: "Savia vivo sobre blanco",
    context: "El vivo no es texto sobre papel. Usar el profundo 700.",
    foreground: { familyId: "savia", step: "500" },
    background: { familyId: "blanco", step: "blanco" },
    ratio: "1.4:1",
    level: "No",
  },
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
    id: "savia-50-rayo",
    label: "Savia 50 sobre Rayo 500",
    context: "Blanco sobre el vivo. Usar Savia 950.",
    foreground: { familyId: "savia", step: "50" },
    background: { familyId: "savia", step: "500" },
    ratio: "1.4:1",
    level: "No",
  },
  {
    id: "sol-500-inverso",
    label: "Sol 50 sobre 500",
    context: "Nunca texto claro sobre sol 500.",
    foreground: { familyId: "sol", step: "50" },
    background: { familyId: "sol", step: "500" },
    ratio: "1.5:1",
    level: "No",
  },
  {
    id: "cielo-500-chico",
    label: "Cielo 50 sobre 500",
    context: "No es un botón con texto claro. Usar Cielo 950 sobre el vivo, o 700 sobre 50.",
    foreground: { familyId: "cielo-de-dia", step: "50" },
    background: { familyId: "cielo-de-dia", step: "500" },
    ratio: "2.2:1",
    level: "No",
  },
]

export const HANDBOOK_CONTRAST_RULES = [
  "Texto normal: 4.5:1 o más. Muted en Luz filtrada es Tronco 700, no 400 ni 500.",
  "Savia vivo no es texto sobre blanco ni sobre Luz filtrada. El verde sobre claro es el profundo 700.",
  "Sobre un vivo 500 el texto es el 950 de la misma familia.",
  "Sobre tint: fondo 50 y profundo 700. En Luz filtrada el ink es 700; en Sombra, el vivo.",
  "Nunca texto claro sobre sol o cielo 500. Nunca luz 400 como cuerpo en claro.",
  "En Luz filtrada el papel es --rootsy-blanco. Savia-50 no es el texto del CTA.",
] as const

export function atmosphereTokenHex(
  token: HandbookAtmosphereToken,
  atmosphereId: HandbookAtmosphereId,
): string {
  const step = token.steps[atmosphereId]
  if (step === "blanco") return "#FFFFFF"
  return handbookColorHex(atmosphereId, step)
}

export function functionalTokenHex(token: HandbookFunctionalToken): string {
  return handbookColorHex(token.familyId, token.step)
}

export function functionalInkHex(familyId: string, dark: boolean) {
  return handbookColorHex(familyId, dark ? "500" : "700")
}

export function functionalRecipeHex(
  recipe: HandbookFunctionalRecipe,
  step: "solidFill" | "solidText" | "tintFill" | "tintBorder" | "tintText" | "signal",
) {
  const familyId =
    step === "solidText" && recipe.solidTextFamilyId
      ? recipe.solidTextFamilyId
      : recipe.familyId
  return handbookColorHex(familyId, recipe[step])
}
