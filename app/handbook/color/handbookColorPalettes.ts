/**
 * Paletas de color del handbook — referencia para auditar el producto.
 * No alimenta la aplicación. Los hex que ya existen en tokens se reutilizan;
 * los pasos faltantes y lava se definen acá como destino.
 */

import {
  ROOTSY_CIELO,
  ROOTSY_COLOR_RAMPS,
  ROOTSY_ETER,
  ROOTSY_SOL,
} from "@/lib/design-system"

const sombra = ROOTSY_COLOR_RAMPS.sombra
const bruma = ROOTSY_COLOR_RAMPS.bruma
const savia = ROOTSY_COLOR_RAMPS.savia

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
  not: "No es sombra (el bosque bajo el dosel) ni cielo de día.",
  identity: "900",
  hexes: {
    "50": "#F3F8FB",
    "100": ROOTSY_ETER["100"],
    "200": ROOTSY_ETER["200"],
    "300": "#8FB4C8",
    "400": "#5A8AA4",
    "500": "#2F5A78",
    "600": "#163848",
    "700": ROOTSY_ETER["700"],
    "800": ROOTSY_ETER["800"],
    "900": ROOTSY_ETER["900"],
    "950": ROOTSY_ETER["950"],
  },
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
  name: "Bruma",
  kind: "atmosfera",
  tagline: "El aire para leer",
  description:
    "Neblina clara de día y la misma neblina invertida de noche. Workspaces, tablas, tickets y formularios. Es el aire: no decora, deja ver.",
  not: "No es gris slate de dashboard ni sombra. Bruma oscura usa estos mismos pasos, no una familia nueva.",
  identity: "100",
  hexes: {
    "50": bruma["50"],
    "100": bruma["100"],
    "200": bruma["200"],
    "300": bruma["300"],
    "400": bruma["400"],
    "500": bruma["500"],
    "600": bruma["600"],
    "700": bruma["700"],
    "800": bruma["800"],
    "900": bruma["900"],
    "950": bruma["950"],
  },
  usage: {
    "50": "Superficie de listado y filas zebra.",
    "100": "Panel de lectura — ticket, tablas, workspace.",
    "200": "Divisores hairline.",
    "300": "Bordes de inputs y tabs.",
    "400": "Metadatos — solo si el contraste alcanza.",
    "500": "Encabezados secundarios.",
    "600": "Descripciones y ayudas.",
    "700": "Texto muted. Superficie elevada en bruma oscura.",
    "800": "Loseta y card en bruma oscura.",
    "900": "Texto principal sobre bruma clara.",
    "950": "Lienzo de bruma oscura.",
  },
})

export const HANDBOOK_SOMBRA: HandbookColorFamily = family({
  id: "sombra",
  name: "Sombra",
  kind: "atmosfera",
  tagline: "El dosel",
  description:
    "Carbón verdoso del bosque. Shells operativos, catálogos, rieles y cards bajo el dosel. Es el hábitat de la operación densa: contiene, no compite con la savia.",
  not: "No es éter (el espacio) ni bruma oscura (la neblina de noche).",
  identity: "600",
  hexes: {
    "50": "#F3F6F4",
    "100": "#E5ECE8",
    "200": "#C5D0CA",
    "300": sombra["300"],
    "400": sombra["400"],
    "500": sombra["500"],
    "600": sombra["600"],
    "700": sombra["700"],
    "800": sombra["800"],
    "900": sombra["900"],
    "950": sombra["950"],
  },
  usage: {
    "50": "Texto inverso suave sobre el dosel.",
    "100": "Velo claro — labels y glows livianos.",
    "200": "Bordes claros sobre sombra profunda.",
    "300": "Texto inactivo en rail y catálogo.",
    "400": "Labels de sección — sage muted.",
    "500": "Superficie de card.",
    "600": "Canvas del catálogo.",
    "700": "Rail y sidebar.",
    "800": "Media de card — void detrás de foto.",
    "900": "Toolbox y bandas inferiores.",
    "950": "Shell — fondo general del mostrador.",
  },
})

export const HANDBOOK_SAVIA: HandbookColorFamily = family({
  id: "savia",
  name: "Savia",
  kind: "funcional",
  tagline: "Vida que acciona",
  description:
    "El único verde con intención. Confirma, enfoca y marca éxito. Aparece poco y solo donde hay que moverse.",
  not: "No pinta superficies enteras. No reemplaza éter, bruma ni sombra.",
  identity: "600",
  hexes: {
    "50": savia["50"],
    "100": savia["100"],
    "200": savia["200"],
    "300": savia["300"],
    "400": savia["400"],
    "500": savia["500"],
    "600": savia["600"],
    "700": savia["700"],
    "800": savia["800"],
    "900": savia["900"],
    "950": savia["950"],
  },
  usage: {
    "50": "Filas pagadas y highlights suaves.",
    "100": "Badges suaves en ticket claro.",
    "200": "Iconos sobre superficies profundas.",
    "300": "Glow de cards y descuentos.",
    "400": "Foco, links y rail activo.",
    "500": "Éxito operativo y CTA de marketing.",
    "600": "CTA principal — vender, guardar, confirmar.",
    "700": "Estado pressed / hover fuerte.",
    "800": "Texto sobre tint savia 50/100.",
    "900": "Overlays y badges sobre cards oscuras.",
    "950": "Texto sobre savia 300/400.",
  },
})

export const HANDBOOK_CIELO_DE_DIA: HandbookColorFamily = family({
  id: "cielo-de-dia",
  name: "Cielo de día",
  kind: "funcional",
  tagline: "Información y amplitud",
  description:
    "Cerúleo de siesta. Informa, abre y señala lo que está en curso. Es el cielo abierto del negocio, no el espacio.",
  not: "No es éter ni un azul de plantilla. No se usa como atmósfera de pantalla.",
  identity: "500",
  hexes: {
    "50": ROOTSY_CIELO["50"],
    "100": ROOTSY_CIELO["100"],
    "200": ROOTSY_CIELO["200"],
    "300": "#76BDF4",
    "400": ROOTSY_CIELO["400"],
    "500": ROOTSY_CIELO["500"],
    "600": ROOTSY_CIELO["600"],
    "700": ROOTSY_CIELO["700"],
    "800": ROOTSY_CIELO["800"],
    "900": "#062E52",
    "950": "#041A30",
  },
  usage: {
    "50": "Lavado más claro — fondos de estado.",
    "100": "Superficie de aviso informativo.",
    "200": "Veladura de header de mundo.",
    "300": "Borde suave e iconos livianos.",
    "400": "Glow e iconos.",
    "500": "Azul característico — información y en curso.",
    "600": "Acento medio.",
    "700": "Hover / pressed.",
    "800": "Texto sobre cielo 50/100.",
    "900": "Texto profundo sobre tint.",
    "950": "Umbral más hondo — casi no se usa como fondo.",
  },
})

export const HANDBOOK_SOL: HandbookColorFamily = family({
  id: "sol",
  name: "Sol",
  kind: "funcional",
  tagline: "Atención y calor",
  description:
    "Amarillo sol a través del dosel. Llama la atención y marca lo que se está preparando. Calor vivo, no otoño ni plantilla de warning.",
  not: "No es lava. No es el ámbar genérico de aviso.",
  identity: "500",
  hexes: {
    "50": ROOTSY_SOL["50"],
    "100": ROOTSY_SOL["100"],
    "200": ROOTSY_SOL["200"],
    "300": "#F5D054",
    "400": ROOTSY_SOL["400"],
    "500": ROOTSY_SOL["500"],
    "600": ROOTSY_SOL["600"],
    "700": ROOTSY_SOL["700"],
    "800": ROOTSY_SOL["800"],
    "900": "#523406",
    "950": "#2E1C04",
  },
  usage: {
    "50": "Lavado más claro — fondos de atención.",
    "100": "Superficie de estado cálido.",
    "200": "Veladura de header de mundo.",
    "300": "Borde suave e iconos livianos.",
    "400": "Glow e iconos.",
    "500": "Sol característico — atención y preparando.",
    "600": "Acento medio.",
    "700": "Hover / pressed.",
    "800": "Texto sobre sol 50/100.",
    "900": "Texto profundo sobre tint.",
    "950": "Umbral más hondo — casi no se usa como fondo.",
  },
})

export const HANDBOOK_LAVA: HandbookColorFamily = family({
  id: "lava",
  name: "Lava",
  kind: "funcional",
  tagline: "Peligro y lo que no se deshace",
  description:
    "Magma del mundo. Error, riesgo y acciones destructivas. Tiene calor de volcán, no el rojo de un dashboard.",
  not: "No es sol. No es un rojo de plantilla. No se usa para atención rutinaria.",
  identity: "600",
  hexes: {
    "50": "#FDF5F2",
    "100": "#F8E0D6",
    "200": "#F0B8A4",
    "300": "#E48868",
    "400": "#D45C38",
    "500": "#C43A18",
    "600": "#A82C12",
    "700": "#82220E",
    "800": "#58170A",
    "900": "#381008",
    "950": "#1C0805",
  },
  usage: {
    "50": "Fondo de error suave.",
    "100": "Banner y fila de riesgo.",
    "200": "Borde suave de alerta.",
    "300": "Iconos livianos sobre lava 50.",
    "400": "Hover de peligro.",
    "500": "Lava característica — señal de error.",
    "600": "Acción destructiva — eliminar, anular.",
    "700": "Pressed / hover fuerte.",
    "800": "Texto sobre lava 50/100.",
    "900": "Texto profundo sobre tint.",
    "950": "Carbón volcánico — casi no se usa como fondo.",
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

export function handbookColorHex(familyId: string, step: HandbookColorStepId): string {
  const family = HANDBOOK_COLOR_FAMILIES.find((item) => item.id === familyId)
  const found = family?.steps.find((item) => item.step === step)
  if (!found) {
    throw new Error(`Unknown handbook color: ${familyId}.${step}`)
  }
  return found.hex
}
