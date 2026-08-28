/**
 * Mundos en producto — hábitats, no paletas.
 * Distinto de Color → Mundos (rampas y mapa de uso).
 * Acá cada mundo se muestra como pantalla: fondo + piezas reales.
 */

export const ROOTSY_MUNDOS_MANIFESTO =
  "Un mundo no es un color. Es el aire donde viven los controles: éter en home y headers, bruma en cuentas y cajas, bruma oscura cuando ese mismo aire se lee de noche, suelo bajo el toolbox y el pie de tablas, sombra en el catálogo y el rail de estadísticas. Herramientas de Rootsy es el claro del chat — paisaje y cristal."

export type RootsyProductWorldId =
  | "eter"
  | "bruma"
  | "bruma-oscura"
  | "suelo"
  | "sombra"
  | "herramientas"

export type RootsyProductWorld = {
  id: RootsyProductWorldId
  name: string
  usedIn: string
  concept: string
}

export const ROOTSY_PRODUCT_WORLDS: RootsyProductWorld[] = [
  {
    id: "eter",
    name: "Éter",
    usedIn: "Home y headers reutilizables — noche neutra, fuera del planeta.",
    concept: "Espacio profundo. Vacío, estrellas, cristal sutil. No es cielo ni sombra del catálogo.",
  },
  {
    id: "bruma",
    name: "Bruma",
    usedIn: "Cuentas, cajas y workspaces claros — neblina para leer.",
    concept: "Aire matinal. Losetas blancas sobre bruma-50. No es gris slate.",
  },
  {
    id: "bruma-oscura",
    name: "Bruma oscura",
    usedIn: "Variante night de cuentas, cajas y workspaces — la misma lectura, de noche.",
    concept:
      "Neblina invertida. Losetas bruma-800 sobre bruma-950. No es sombra (bosque) ni éter (espacio).",
  },
  {
    id: "suelo",
    name: "Suelo",
    usedIn: "Toolbox de Operar y pie de layout tablas — tierra mojada.",
    concept: "Humus oliva bajo el dosel. No es earth de forms ni sombra sola.",
  },
  {
    id: "sombra",
    name: "Sombra",
    usedIn: "Catálogo de productos en Operar y sidebar de Estadísticas.",
    concept: "Carbón verdoso bajo el dosel. El bosque, no el espacio del header.",
  },
  {
    id: "herramientas",
    name: "Herramientas de Rootsy",
    usedIn: "Hilo de Rootsy en chat — paisaje y tarjeta de tarea (superficie flat).",
    concept:
      "El claro donde Rootsy trabaja. Fondo ilustrado, placa cian sobre el prado — glass con frost o flat con frost más marcado. No es éter ni savia de comanda.",
  },
]
