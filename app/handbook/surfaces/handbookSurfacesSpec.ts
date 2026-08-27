/**
 * Spec de superficies del handbook.
 * Fondos salen de las atmósferas. Capas, del z-index de /library.
 * Borde, radios y elevación tienen página propia.
 */

import { ROOTSY_ELEVATION_Z_INDEX } from "@/app/library/elevation/rootsyElevationSystem"
import {
  HANDBOOK_ATMOSPHERE_TOKENS,
  HANDBOOK_WORLD_ATMOSPHERES,
} from "@/app/handbook/color/handbookColorSpec"

export const HANDBOOK_SURFACE_ATMOSPHERES = HANDBOOK_WORLD_ATMOSPHERES
export const HANDBOOK_SURFACE_TOKENS = HANDBOOK_ATMOSPHERE_TOKENS.filter((token) =>
  ["fondo", "superficie", "elevada"].includes(token.id),
)
export const HANDBOOK_Z_INDEX = ROOTSY_ELEVATION_Z_INDEX

export const HANDBOOK_SURFACE_PRINCIPLES = [
  {
    title: "El aire primero",
    detail:
      "Éter, bruma, sombra o sotobosque pintan el lienzo. Encima, superficie y elevada. En Bruma clara la elevada es blanco.",
  },
  {
    title: "Una atmósfera por pantalla",
    detail:
      "Fondo, superficie y elevada del mismo aire. No se mezcla éter con sombra.",
  },
  {
    title: "Un z por rol",
    detail:
      "El contenido vive abajo. El modal, arriba del backdrop. El toast, encima del modal.",
  },
] as const

/** Dos lienzos de bruma. El plano es tablas. El de bloques es cajas, cuentas, personas. */
export const HANDBOOK_SURFACE_LIENZOS = [
  {
    id: "lienzo-plano",
    name: "Lienzo plano",
    token: "bruma-100",
    product: "data-workspace-tables-atmosphere",
    use: "Listados tabla",
  },
  {
    id: "lienzo-de-bloques",
    name: "Lienzo de bloques",
    token: "bruma-50",
    product: "data-workspace-blocks-atmosphere",
    use: "Cajas, cuentas, personas, reportes",
  },
  {
    id: "lienzo-de-bloques-noche",
    name: "Lienzo de bloques · noche",
    token: "bruma-950",
    product: "data-workspace-blocks-atmosphere-bruma-oscura",
    use: "Losetas en bruma oscura",
  },
] as const

export const HANDBOOK_BLOCKS_ATMOSPHERE_LAYERS = [
  {
    role: "Valle",
    value: "--color-superficie · bruma-50",
    detail: "El lienzo de bloques. No es el bruma-100 de las tablas.",
  },
  {
    role: "Loseta",
    value: "--color-elevada · blanco",
    detail: "El papel de cada card. En Bruma clara no es savia-50.",
  },
  {
    role: "Noche",
    value: "bruma-950",
    detail: "El mismo valle, invertido. Sin foto ni planeta.",
  },
] as const
