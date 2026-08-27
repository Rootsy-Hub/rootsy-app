/**
 * Mundos de color Rootsy — mapa de uso, no teoría.
 * Marca = sombra · bruma · savia.
 * Climas = suelo · cielo · sol · éter. No son familias de marca.
 */

import {
  ROOTSY_CIELO,
  ROOTSY_ETER,
  ROOTSY_SOL,
  ROOTSY_SUELO,
  rootsyColorHex,
} from "@/lib/design-system"

const hx = rootsyColorHex

export type RootsyColorWorldKind = "marca" | "clima" | "composicion"

export type RootsyColorWorld = {
  id: string
  name: string
  kind: RootsyColorWorldKind
  concept: string
  usedIn: string
  not: string
  token: string
  hexes: { label: string; hex: string }[]
}

export const ROOTSY_COLOR_WORLDS: RootsyColorWorld[] = [
  {
    id: "sombra",
    name: "Sombra",
    kind: "marca",
    concept: "Carbón verdoso bajo el dosel. El bosque, no el espacio.",
    usedIn: "Catálogo POS, rail, canvas, cards. Shell oscuro de Operar. Viñeta secundaria del menú.",
    not: "No es éter (header) ni suelo (footer).",
    token: "--rootsy-sombra-*",
    hexes: [
      { label: "950", hex: hx("sombra", "950") },
      { label: "800", hex: hx("sombra", "800") },
      { label: "600", hex: hx("sombra", "600") },
      { label: "400", hex: hx("sombra", "400") },
    ],
  },
  {
    id: "bruma",
    name: "Bruma",
    kind: "marca",
    concept: "Neblina matinal — aire claro para leer.",
    usedIn: "Ticket TU PEDIDO, tablas workspace, formularios, toolbar alba.",
    not: "No es gris slate ni el stone de forms viejos.",
    token: "--rootsy-bruma-*",
    hexes: [
      { label: "50", hex: hx("bruma", "50") },
      { label: "100", hex: hx("bruma", "100") },
      { label: "300", hex: hx("bruma", "300") },
      { label: "900", hex: hx("bruma", "900") },
    ],
  },
  {
    id: "bruma-oscura",
    name: "Bruma oscura",
    kind: "composicion",
    concept: "La misma neblina, de noche. Aire frío para leer.",
    usedIn: "Variante dark de cuentas, cajas y workspaces claros. Misma estructura que bruma.",
    not: "No es sombra (bosque) ni éter (espacio). No inventes una familia bruma-oscura-*.",
    token: "bruma-950 · 800 · 50 — .rootsy-theme-bruma-oscura",
    hexes: [
      { label: "950", hex: hx("bruma", "950") },
      { label: "800", hex: hx("bruma", "800") },
      { label: "700", hex: hx("bruma", "700") },
      { label: "50", hex: hx("bruma", "50") },
    ],
  },
  {
    id: "savia",
    name: "Savia",
    kind: "marca",
    concept: "Vida que acciona. El único verde con intención.",
    usedIn: "CTA, foco, lista/entregada en comandas, brote del toolbox. Ícono Operar del menú.",
    not: "No es canopy legacy ni teal de marketing como mundo de comanda.",
    token: "--rootsy-savia-*",
    hexes: [
      { label: "800", hex: hx("savia", "800") },
      { label: "600", hex: hx("savia", "600") },
      { label: "400", hex: hx("savia", "400") },
      { label: "50", hex: hx("savia", "50") },
    ],
  },
  {
    id: "suelo",
    name: "Suelo",
    kind: "clima",
    concept: "Tierra mojada — humus oliva después de la lluvia.",
    usedIn: "Footer de listados, toolbox de Operar, ícono Configurar del menú.",
    not: "No es earth de pills/forms ni sombra sola.",
    token: "--rootsy-suelo-*",
    hexes: [
      { label: "900", hex: ROOTSY_SUELO["900"] },
      { label: "800", hex: ROOTSY_SUELO["800"] },
      { label: "700", hex: ROOTSY_SUELO["700"] },
      { label: "400", hex: ROOTSY_SUELO["400"] },
    ],
  },
  {
    id: "cielo",
    name: "Cielo",
    kind: "clima",
    concept: "Azul de naturaleza vivo — cerúleo de siesta.",
    usedIn: "Comandas · enviada. Ícono Administrar del menú.",
    not: "No es éter (espacio) ni teal de info/marketing ni sky Tailwind.",
    token: "--rootsy-cielo-*",
    hexes: [
      { label: "800", hex: ROOTSY_CIELO["800"] },
      { label: "500", hex: ROOTSY_CIELO["500"] },
      { label: "200", hex: ROOTSY_CIELO["200"] },
      { label: "100", hex: ROOTSY_CIELO["100"] },
    ],
  },
  {
    id: "sol",
    name: "Sol",
    kind: "clima",
    concept: "Amarillo sol a través del dosel. Calor de cocina.",
    usedIn: "Comandas · preparando. Badge caliente del menú.",
    not: "No es warning ámbar (#D97706) ni otoño de pills.",
    token: "--rootsy-sol-*",
    hexes: [
      { label: "800", hex: ROOTSY_SOL["800"] },
      { label: "500", hex: ROOTSY_SOL["500"] },
      { label: "200", hex: ROOTSY_SOL["200"] },
      { label: "100", hex: ROOTSY_SOL["100"] },
    ],
  },
  {
    id: "eter",
    name: "Éter",
    kind: "clima",
    concept: "Espacio fuera del planeta — noche profunda, estrellas, horizonte frío.",
    usedIn: "Header reutilizable, backdrop y viñeta del menú. MenuHeaderEntity as=header.",
    not: "No es cielo de día ni sombra del catálogo.",
    token: "--rootsy-eter-*",
    hexes: [
      { label: "800", hex: ROOTSY_ETER["800"] },
      { label: "900", hex: ROOTSY_ETER["900"] },
      { label: "950", hex: ROOTSY_ETER["950"] },
      { label: "100", hex: ROOTSY_ETER["100"] },
    ],
  },
  {
    id: "sotobosque",
    name: "Sotobosque",
    kind: "composicion",
    concept: "El piso del bosque: oscuros de sombra con savia 400 prendida.",
    usedIn: "Atmósfera de producto cuando el aire es oscuro y el verde vive en el lienzo. .rootsy-theme-sotobosque.",
    not: "No es sombra (el dosel que contiene) ni una rampa sotobosque-*. No inventes hexes.",
    token: "sombra + savia 400 — .rootsy-theme-sotobosque",
    hexes: [
      { label: "sombra 950", hex: hx("sombra", "950") },
      { label: "sombra 800", hex: hx("sombra", "800") },
      { label: "savia 400", hex: hx("savia", "400") },
      { label: "sombra 50", hex: hx("sombra", "50") },
    ],
  },
  {
    id: "alba",
    name: "Alba",
    kind: "composicion",
    concept: "Umbral entre éter y el claro — el mundo se ve a través.",
    usedIn: "Toolbar de listados. Bruma sobre el header, no rampa propia.",
    not: "No inventes tokens alba-*. Es bruma + vidrio.",
    token: "bruma-100 · blur 14",
    hexes: [
      { label: "bruma 50", hex: hx("bruma", "50") },
      { label: "bruma 100", hex: hx("bruma", "100") },
      { label: "savia 400", hex: hx("savia", "400") },
    ],
  },
]

export const ROOTSY_COLOR_WORLD_DONT = [
  "Cielo ≠ éter. El día de la comanda no es el espacio del header.",
  "Sol ≠ warning. Preparando es clima; stock/pendiente es semántica UX.",
  "Suelo ≠ earth de forms. Pills y avisos van a bruma.",
  "Sombra ≠ éter. El dosel es bosque; el header es afuera del planeta.",
  "Bruma oscura ≠ sombra. La noche de leer es neblina invertida, no el catálogo bajo el dosel.",
  "Sotobosque ≠ sombra. El piso prende savia 400; el dosel contiene y no compite.",
] as const
