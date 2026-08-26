import { ROOTSY_MENSAJE_DEFAULT_PORTRAIT } from "@/components/rootsy-mensaje/rootsyMensaje"

export type RootsyEmptyStateWorld =
  | "eter"
  | "bruma"
  | "suelo"
  | "sombra"
  | "herramientas"

export const ROOTSY_EMPTY_STATE_DEFAULT_IMAGE = ROOTSY_MENSAJE_DEFAULT_PORTRAIT

export const ROOTSY_EMPTY_STATE_DEFAULT_WORLD: RootsyEmptyStateWorld = "sombra"

export const ROOTSY_EMPTY_STATE_WORLDS: {
  id: RootsyEmptyStateWorld
  label: string
  usage: string
}[] = [
  { id: "eter", label: "Éter", usage: "Home y headers — noche sideral." },
  { id: "bruma", label: "Bruma", usage: "Pedido de Operar, cuentas y cajas." },
  { id: "suelo", label: "Suelo", usage: "Toolbox de Operar y pie de tablas." },
  { id: "sombra", label: "Sombra", usage: "Catálogo de productos en Operar." },
  { id: "herramientas", label: "Herramientas", usage: "Hilo de Rootsy en chat." },
]

export type RootsyEmptyStateCopy = {
  title: string
  description?: string
}

/**
 * Voz de Rootsy en empty states.
 *
 * Rootsy habla en primera persona, español argentino moderado, corto y cálido.
 * No es un sistema, ni un consultor, ni un chiste. Nunca infantil ni corporativo.
 *
 * Título: nombra lo que falta, en voz de quien está al lado.
 * Descripción (opcional): un paso concreto. “Yo” hace, no “se debe”.
 *
 * En Operar, catálogo (sombra) y pedido (bruma) son la misma conversación
 * leída de izquierda a derecha. No repetir el mismo hallazgo en los dos lados.
 *
 * Un solo retrato a la vez. Gana el toast, después el catálogo, después el pedido.
 * El copy sigue en cada lado; el que cede muestra tres puntos: la conversación sigue.
 *
 * Sí, juntos: “No tenemos productos en Bebidas.” → “El pedido espera.”
 * No: dos veces “Acá no hay…” / “Pedido vacío.”
 */
export const ROOTSY_EMPTY_STATE_VOICE = {
  person: "primera persona",
  language: "español argentino moderado — sin lunfardo ni frases hechas",
  tone: "cálido, claro, natural — nunca infantil, bobo ni corporativo",
  title: "Nombra lo que falta, como quien está al lado.",
  description: "Un paso concreto. Rootsy hace, no instruye.",
  conversation:
    "Catálogo y pedido se leen como un solo turno: primero lo que falta, después dónde espera.",
  presence:
    "Un solo retrato. Toast, después catálogo, después pedido. El resto muestra tres puntos: sigo hablando en otro lado.",
  examples: {
    yes: "No tenemos productos en Bebidas. El pedido espera.",
    no: "No tenemos productos. No hay nada en el pedido.",
  },
} as const

export function rootsyEmptyStateCatalogIdleCopy(categoryName?: string): RootsyEmptyStateCopy {
  const name = categoryName?.trim()
  if (!name) {
    return {
      title: "No tenemos productos.",
      description: "Activalos o agregalos en Artículos.",
    }
  }
  return {
    title: `No tenemos productos en ${name}.`,
    description: "Activalos o agregalos en Artículos.",
  }
}

export const ROOTSY_EMPTY_STATE_COPY = {
  catalog: {
    idle: {
      title: "No tenemos productos.",
      description: "Activalos o agregalos en Artículos.",
    },
    search: {
      title: "No encontré productos.",
      description: "¿Probamos otra búsqueda?",
    },
  },
  ticket: {
    order: {
      title: "El pedido espera.",
    },
    purchase: {
      title: "La compra espera.",
    },
    service: {
      title: "El cargo espera.",
      description: "Elegí un servicio y lo armo yo.",
    },
  },
} as const satisfies {
  catalog: { idle: RootsyEmptyStateCopy; search: RootsyEmptyStateCopy }
  ticket: {
    order: RootsyEmptyStateCopy
    purchase: RootsyEmptyStateCopy
    service: RootsyEmptyStateCopy
  }
}
