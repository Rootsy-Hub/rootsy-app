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
      "Éter, Luz filtrada o Sombra pintan el lienzo. Encima, superficie y elevada. En Luz filtrada la elevada es blanco.",
  },
  {
    title: "Una atmósfera por pantalla",
    detail:
      "Fondo, superficie y elevada del mismo aire. No se mezcla éter con sombra.",
  },
  {
    title: "El fondo es el piso",
    detail:
      "En Sombra el lienzo es negro. El 950 es aire. La hoja es 800. No se aclara el fondo: se eleva lo que se toca.",
  },
  {
    title: "Un z por rol",
    detail:
      "El contenido vive abajo. El modal, arriba del backdrop. El toast, encima del modal.",
  },
] as const

/** Dos lienzos de Luz filtrada. El plano es tablas. El de bloques es cajas, cuentas, personas. */
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
    detail: "El papel de cada card. En Luz filtrada no es savia-50.",
  },
] as const
