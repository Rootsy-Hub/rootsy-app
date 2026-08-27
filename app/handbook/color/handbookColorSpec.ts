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
export type HandbookWorldAtmosphereId = HandbookAtmosphereId | "sotobosque"

export const HANDBOOK_ATMOSPHERE_CONTEXTS: {
  id: HandbookAtmosphereId
  name: string
  sample: string
}[] = [
  { id: "eter", name: "Éter", sample: "Header, menú, vacío." },
  { id: "bruma", name: "Bruma", sample: "Workspace, tablas, ticket." },
  { id: "sombra", name: "Sombra", sample: "Mostrador, catálogo, rail." },
]

export const HANDBOOK_SOTOBOSQUE_CONTEXT = {
  id: "sotobosque" as const,
  name: "Sotobosque",
  sample: "Oscuro con savia prendida.",
}

export const HANDBOOK_WORLD_ATMOSPHERES: {
  id: HandbookWorldAtmosphereId
  name: string
  sample: string
}[] = [...HANDBOOK_ATMOSPHERE_CONTEXTS, HANDBOOK_SOTOBOSQUE_CONTEXT]

/** Sotobosque no tiene rampa. Oscuros de sombra + savia 400. */
export const HANDBOOK_SOTOBOSQUE = {
  fondo: "var(--rootsy-sotobosque-fondo)",
  superficie: "var(--rootsy-sotobosque-superficie)",
  elevada: "var(--rootsy-sotobosque-elevada)",
  borde: "var(--rootsy-sotobosque-borde)",
  texto: "var(--rootsy-sotobosque-texto)",
  "texto-muted": "var(--rootsy-sotobosque-texto-muted)",
} as const

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
    purpose: "Card sobre la superficie. En Bruma clara es blanco.",
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

export type HandbookApplicationAtmosphereId =
  | HandbookAtmosphereId
  | "bruma-noche"
  | "sotobosque"

export const HANDBOOK_APPLICATION_ATMOSPHERES: {
  id: HandbookApplicationAtmosphereId
  name: string
  sample: string
  dark: boolean
}[] = [
  { id: "eter", name: "Éter", sample: "Header, menú, vacío.", dark: true },
  { id: "bruma", name: "Bruma", sample: "Workspace, tablas, ticket.", dark: false },
  { id: "sombra", name: "Sombra", sample: "Mostrador, catálogo, rail.", dark: true },
  { id: "sotobosque", name: "Sotobosque", sample: "Oscuro con savia prendida.", dark: true },
  { id: "bruma-noche", name: "Bruma noche", sample: "Losetas invertidas.", dark: true },
]

export type HandbookFunctionalRecipe = {
  id: string
  label: string
  familyId: string
  familyName: string
  purpose: string
  /** Relleno de CTA o destructivo. Texto chico: savia 700. */
  solidFill: HandbookColorStepId
  solidText: HandbookColorStepId
  /** Estado suave: 50 + borde 200 + texto 800. Sol usa 900. */
  tintFill: HandbookColorStepId
  tintBorder: HandbookColorStepId
  tintText: HandbookColorStepId
  /** Foco, link e icono sobre oscuro. No es cuerpo en Bruma clara. */
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
    purpose: "CTA. El texto chico sube a 700.",
    solidFill: "700",
    solidText: "50",
    tintFill: "50",
    tintBorder: "200",
    tintText: "800",
    signal: "400",
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
    tintText: "800",
    signal: "400",
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
    purpose: "En curso, enviado, contexto.",
    solidFill: "600",
    solidText: "50",
    tintFill: "50",
    tintBorder: "200",
    tintText: "800",
    signal: "400",
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
    purpose: "Preparando, pendiente. Nunca texto 50 sobre 500.",
    solidFill: "700",
    solidText: "50",
    tintFill: "50",
    tintBorder: "200",
    tintText: "900",
    signal: "400",
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
    purpose: "Error y lo que no se deshace.",
    solidFill: "600",
    solidText: "50",
    tintFill: "50",
    tintBorder: "200",
    tintText: "800",
    signal: "400",
    sampleSolid: "Eliminar",
    sampleTint: "Error",
    hasSolid: true,
    hasTint: true,
  },
]

export const HANDBOOK_FUNCTIONAL_APPLICATION_RULES = [
  "Los pasos no cambian con la atmósfera. Cambia el aire debajo.",
  "Sólido: identidad (savia 700 si el texto es chico, lava 600) y texto 50.",
  "Tint: fondo 50, borde 200 y texto 800 de la misma familia. Sol usa 900.",
  "Sobre éter, sombra, sotobosque y bruma noche el tint sigue en 50: una isla clara, no un 800 de relleno.",
  "Señal sobre oscuro: paso 400 para foco, links e iconos. En Bruma clara no es cuerpo.",
] as const

export function worldAtmosphereHex(
  tokenId: "fondo" | "superficie" | "elevada" | "texto" | "texto-muted" | "borde",
  atmosphereId: HandbookWorldAtmosphereId,
): string {
  if (atmosphereId === "sotobosque") return HANDBOOK_SOTOBOSQUE[tokenId]
  const token = HANDBOOK_ATMOSPHERE_TOKENS.find((item) => item.id === tokenId)
  if (!token) throw new Error(`Unknown atmosphere token: ${tokenId}`)
  return atmosphereTokenHex(token, atmosphereId)
}

export function applicationAtmosphereHex(
  tokenId: "fondo" | "superficie" | "elevada" | "texto" | "texto-muted" | "borde",
  atmosphereId: HandbookApplicationAtmosphereId,
): string {
  if (atmosphereId === "sotobosque") return HANDBOOK_SOTOBOSQUE[tokenId]
  if (atmosphereId === "bruma-noche") {
    const step = tokenId === "texto-muted" ? HANDBOOK_BRUMA_NOCHE.muted : HANDBOOK_BRUMA_NOCHE[tokenId]
    return handbookColorHex("bruma", step)
  }
  const token = HANDBOOK_ATMOSPHERE_TOKENS.find((item) => item.id === tokenId)
  if (!token) throw new Error(`Unknown atmosphere token: ${tokenId}`)
  return atmosphereTokenHex(token, atmosphereId)
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
    label: "Bruma 900 sobre 100",
    context: "Cuerpo en workspace, tablas y ticket.",
    foreground: { familyId: "bruma", step: "900" },
    background: { familyId: "bruma", step: "100" },
    ratio: "16.3:1",
    level: "AAA",
  },
  {
    id: "bruma-texto-blanco",
    label: "Bruma 900 sobre blanco",
    context: "Cuerpo sobre papel, loseta y formulario en Bruma clara.",
    foreground: { familyId: "bruma", step: "900" },
    background: { familyId: "blanco", step: "blanco" },
    ratio: "18.7:1",
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
  "En Bruma clara el papel es --rootsy-blanco, no savia-50 ni bruma-50. Savia-50 es el inverso del CTA.",
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
