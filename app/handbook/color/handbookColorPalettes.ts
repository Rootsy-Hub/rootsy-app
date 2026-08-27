/**
 * Paletas de color del handbook — la misma paleta que alimenta el producto.
 * Los hex se resuelven desde lib/design-system. No se inventan colores sueltos.
 */

import { ROOTSY_COLOR_RAMPS } from "@/lib/design-system/tokens/colors"

export const HANDBOOK_COLOR_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const

export type HandbookColorStepId = (typeof HANDBOOK_COLOR_STEPS)[number]

export type HandbookColorStep = {
  step: HandbookColorStepId
  hex: string
  usage: string
  identity?: boolean
}

export type HandbookColorFamily = {
  id: string
  name: string
  kind: "atmosfera" | "funcional"
  tagline: string
  description: string
  not: string
  steps: HandbookColorStep[]
}

function family(
  spec: Omit<HandbookColorFamily, "steps"> & {
    usage: Record<HandbookColorStepId, string>
    hexes: Record<HandbookColorStepId, string>
    identity: HandbookColorStepId
  },
): HandbookColorFamily {
  return {
    id: spec.id,
    name: spec.name,
    kind: spec.kind,
    tagline: spec.tagline,
    description: spec.description,
    not: spec.not,
    steps: HANDBOOK_COLOR_STEPS.map((step) => ({
      step,
      hex: spec.hexes[step],
      usage: spec.usage[step],
      identity: step === spec.identity,
    })),
  }
}

export const HANDBOOK_ETER: HandbookColorFamily = family({
  id: "eter",
  name: "Éter",
  kind: "atmosfera",
  tagline: "El cielo del mundo",
  description:
    "Noche profunda, estrellas y un horizonte de luz fría. Encabeza, contiene y abre espacio. Es el afuera del planeta: el vacío desde el que se mira el negocio.",
  not: "No es Sotobosque · Sombra (el dosel) ni cielo.",
  identity: "900",
  hexes: ROOTSY_COLOR_RAMPS.eter,
  usage: {
    "50": "Resplandor extremo del horizonte.",
    "100": "Luz fría — línea de horizonte y borde.",
    "200": "Resplandor medio sobre la noche.",
    "300": "Texto muted e iconos sobre éter profundo.",
    "400": "Acento frío — estrellas y foco sutil.",
    "500": "Tono característico de la noche abierta.",
    "600": "Superficie elevada dentro del header.",
    "700": "Vacío un poco más abierto.",
    "800": "Boca del header.",
    "900": "Centro de la banda.",
    "950": "Vacío más hondo — cierre del gradiente.",
  },
})

export const HANDBOOK_BRUMA: HandbookColorFamily = family({
  id: "bruma",
  name: "Sotobosque · Luz filtrada",
  kind: "atmosfera",
  tagline: "El claro para leer",
  description:
    "Luz que entra entre las hojas. Workspaces, tablas, tickets y formularios. Un solo lugar, condición de lectura: elegir, respirar, entrar.",
  not: "No es gris slate ni Sotobosque · Sombra.",
  identity: "100",
  hexes: ROOTSY_COLOR_RAMPS.bruma,
  usage: {
    "50": "Niebla — superficie y valle. Listado, filas, lienzo de bloques.",
    "100": "Luz — lienzo plano. Ticket, tablas, workspace.",
    "200": "Hojas — divisores hairline.",
    "300": "Claros — bordes de inputs y tabs.",
    "400": "Metadatos — solo si el contraste alcanza.",
    "500": "Encabezados secundarios.",
    "600": "Descripciones y ayudas.",
    "700": "Tronco — texto muted.",
    "800": "Texto profundo sobre tint y ayudas.",
    "900": "Texto profundo sobre el claro.",
    "950": "Raíz — texto principal.",
  },
})

export const HANDBOOK_SOMBRA: HandbookColorFamily = family({
  id: "sombra",
  name: "Sotobosque · Sombra",
  kind: "atmosfera",
  tagline: "El dosel para operar",
  description:
    "Sombra profunda del mismo bosque. Módulos operativos, concentración y densidad. El lienzo es siempre 950 — el paso más oscuro. Superficie y elevada se prenden encima; el fondo no se aclara para separar zonas.",
  not: "No es éter (el espacio) ni Luz filtrada (el claro para leer).",
  identity: "900",
  hexes: ROOTSY_COLOR_RAMPS.sombra,
  usage: {
    "50": "Texto inverso suave sobre el dosel.",
    "100": "Velo claro — labels y glows livianos.",
    "200": "Bordes claros sobre sombra profunda.",
    "300": "Texto inactivo en rail y catálogo.",
    "400": "Labels de sección.",
    "500": "Elevada — card y slot sobre el lienzo.",
    "600": "Superficie — panel sobre el fondo. No es el canvas.",
    "700": "Humedad — capas internas del dosel.",
    "800": "Musgo — hover del item activo.",
    "900": "Sombra — item activo y velos.",
    "950": "Raíz — el fondo. Siempre el paso más oscuro. Shell, rail y canvas.",
  },
})

export const HANDBOOK_SAVIA: HandbookColorFamily = family({
  id: "savia",
  name: "Savia",
  kind: "funcional",
  tagline: "Acción, foco y progreso",
  description:
    "Acción principal, foco, selección, check y progreso. Rayo 500, igual de prendido en Luz filtrada y en Sombra.",
  not: "No pinta superficies enteras. El vivo no es texto sobre blanco ni sobre Luz filtrada: ahí va el profundo 700. Sobre el vivo, el texto es Savia 950.",
  identity: "500",
  hexes: ROOTSY_COLOR_RAMPS.savia,
  usage: {
    "50": "Chip y tint sobre Luz filtrada.",
    "100": "Badges suaves en ticket claro.",
    "200": "Borde del tint.",
    "300": "Glow de cards y descuentos.",
    "400": "Foco y rail activo.",
    "500": "Vivo — relleno de acción y progreso. No es texto sobre blanco.",
    "600": "Hover del vivo.",
    "700": "Profundo — texto y links sobre Luz filtrada.",
    "800": "Texto profundo sobre tint si el 700 no alcanza.",
    "900": "Overlays sobre cards oscuras.",
    "950": "Texto sobre Savia vivo.",
  },
})

export const HANDBOOK_CIELO_DE_DIA: HandbookColorFamily = family({
  id: "cielo-de-dia",
  name: "Cielo",
  kind: "funcional",
  tagline: "Información y contexto",
  description:
    "Información, orientación y contexto. Es el cielo abierto del negocio, no el espacio.",
  not: "No es éter ni un azul de plantilla. No se usa como atmósfera de pantalla.",
  identity: "500",
  hexes: ROOTSY_COLOR_RAMPS.cielo,
  usage: {
    "50": "Lavado más claro — fondos de estado.",
    "100": "Superficie de aviso informativo.",
    "200": "Borde suave del tint.",
    "300": "Iconos livianos.",
    "400": "Señal intermedia sobre oscuro.",
    "500": "Vivo — relleno de información.",
    "600": "Hover del vivo.",
    "700": "Profundo — texto y links sobre Luz filtrada.",
    "800": "Texto profundo sobre tint si el 700 no alcanza.",
    "900": "Overlays sobre cards oscuras.",
    "950": "Texto sobre Cielo vivo.",
  },
})

export const HANDBOOK_SOL: HandbookColorFamily = family({
  id: "sol",
  name: "Sol",
  kind: "funcional",
  tagline: "Atención y aviso",
  description:
    "Atención, aviso y algo que requiere mirada. Calor vivo, no otoño ni plantilla de warning.",
  not: "No es lava. No es el ámbar genérico de aviso.",
  identity: "500",
  hexes: ROOTSY_COLOR_RAMPS.sol,
  usage: {
    "50": "Lavado más claro — fondos de atención.",
    "100": "Superficie de estado cálido.",
    "200": "Veladura de header de mundo.",
    "300": "Borde suave e iconos livianos.",
    "400": "Señal intermedia sobre oscuro.",
    "500": "Vivo — relleno de atención.",
    "600": "Hover del vivo.",
    "700": "Profundo — texto y links sobre Luz filtrada.",
    "800": "Texto profundo sobre tint si el 700 no alcanza.",
    "900": "Overlays sobre cards oscuras.",
    "950": "Texto sobre Sol vivo.",
  },
})

export const HANDBOOK_LAVA: HandbookColorFamily = family({
  id: "lava",
  name: "Lava",
  kind: "funcional",
  tagline: "Riesgo y lo que no se deshace",
  description:
    "Riesgo, error, bloqueo y acción destructiva. Tiene calor de volcán, no el rojo de un dashboard.",
  not: "No es sol. No es un rojo de plantilla. No se usa para atención rutinaria.",
  identity: "500",
  hexes: ROOTSY_COLOR_RAMPS.lava,
  usage: {
    "50": "Fondo de error suave.",
    "100": "Banner y fila de riesgo.",
    "200": "Borde suave de alerta.",
    "300": "Iconos livianos sobre lava 50.",
    "400": "Señal intermedia sobre oscuro.",
    "500": "Vivo — relleno de riesgo y crítico.",
    "600": "Hover del vivo.",
    "700": "Profundo — texto y links sobre Luz filtrada.",
    "800": "Texto profundo sobre tint si el 700 no alcanza.",
    "900": "Overlays sobre cards oscuras.",
    "950": "Texto sobre Lava vivo.",
  },
})

export const HANDBOOK_ATMOSPHERES: HandbookColorFamily[] = [
  HANDBOOK_ETER,
  HANDBOOK_BRUMA,
  HANDBOOK_SOMBRA,
]

export const HANDBOOK_FUNCTIONAL_COLORS: HandbookColorFamily[] = [
  HANDBOOK_SAVIA,
  HANDBOOK_CIELO_DE_DIA,
  HANDBOOK_SOL,
  HANDBOOK_LAVA,
]

export const HANDBOOK_COLOR_FAMILIES: HandbookColorFamily[] = [
  ...HANDBOOK_ATMOSPHERES,
  ...HANDBOOK_FUNCTIONAL_COLORS,
]

export type HandbookColorRefStep = HandbookColorStepId | "blanco"

/** Luz de Bruma clara. Fuera de la rampa. Documentada en Color → Blanco. */
export const HANDBOOK_BLANCO = {
  id: "blanco",
  token: "--rootsy-blanco",
  hex: "#FFFFFF",
  usage: "Papel de Luz filtrada. --color-elevada, losetas, formularios y overlay. No pinta éter ni Sotobosque · Sombra.",
} as const

export function handbookColorHex(familyId: string, step: HandbookColorRefStep): string {
  if (familyId === "blanco" || step === "blanco") return "#FFFFFF"
  const family = HANDBOOK_COLOR_FAMILIES.find((item) => item.id === familyId)
  const found = family?.steps.find((item) => item.step === step)
  if (!found) {
    throw new Error(`Unknown handbook color: ${familyId}.${step}`)
  }
  return found.hex
}
