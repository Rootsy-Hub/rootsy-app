/**
 * Sistema de ilustraciones Rootsy — spots, mascota y patrones ambient.
 * Alineado a sombra · bruma · savia del design system.
 */

export type IllustrationCategoryId = "spots" | "mascota" | "patrones"

export type IllustrationCategory = {
  id: IllustrationCategoryId
  label: string
  detail: string
  status: "defined" | "in-progress" | "planned"
}

export const ROOTSY_ILLUSTRATIONS_CONCEPT = {
  title: "El bosque también dibuja",
  lead:
    "Las ilustraciones Rootsy no decoran pantallas vacías: explican, acompañan y humanizan. Spots para estados y onboarding, mascota para guiar, patrones ambient para dar profundidad sin competir con los datos.",
  why: [
    "Naturalidad: trazos orgánicos y paleta sombra · bruma · savia — el dibujo pertenece al mismo parque que la UI.",
    "Simplicidad: pocas piezas reutilizables antes que un catálogo infinito — cada spot resuelve un caso concreto.",
    "Intuitivo: la mascota actúa, no posa; los patrones quedan al fondo como bruma, no como wallpaper.",
  ],
  closing:
    "Ilustración con función: orienta al usuario, no llena el vacío.",
} as const

export const ROOTSY_ILLUSTRATIONS_MANIFESTO =
  "Spots para estados claros, mascota para acompañar acciones, patrones ambient para profundidad. Misma raíz que color y tipografía — sombra, bruma y savia, nunca un catálogo genérico de clip-art."

export const ROOTSY_ILLUSTRATIONS_PRINCIPLES = [
  {
    title: "Spots con propósito",
    detail:
      "Empty states, errores y onboarding — una escena por caso, reutilizable en ticket y catálogo.",
  },
  {
    title: "Mascota que guía",
    detail:
      "La mascota Rootsy interpreta y actúa; no es logo decorativo ni avatar del usuario.",
  },
  {
    title: "Patrones al fondo",
    detail:
      "Texturas ambient en bruma o sombra — profundidad sutil, nunca compiten con cards ni tablas.",
  },
  {
    title: "Paleta de marca",
    detail:
      "Savia para vida y acción, bruma para aire, sombra para dosel — sin colores fuera del sistema.",
  },
] as const

export const ILLUSTRATION_CATEGORIES: IllustrationCategory[] = [
  {
    id: "spots",
    label: "Spots",
    detail: "Escenas puntuales — empty state, error, éxito, onboarding y ayuda contextual.",
    status: "in-progress",
  },
  {
    id: "mascota",
    label: "Mascota",
    detail: "Personaje Rootsy en acción — gestos, poses y expresiones alineadas al tono de producto.",
    status: "planned",
  },
  {
    id: "patrones",
    label: "Patrones",
    detail: "Fondos ambient y texturas orgánicas para marketing, login y superficies amplias.",
    status: "planned",
  },
]
