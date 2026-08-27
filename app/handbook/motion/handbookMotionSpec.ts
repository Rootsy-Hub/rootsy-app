/**
 * Spec de movimiento del handbook.
 * Duraciones, curvas y tokens semánticos salen de /library.
 */

import {
  MOTION_APPLYING_GUIDELINES,
  MOTION_DURATION_RANGES,
  MOTION_KEYFRAMES,
  ROOTSY_MOTION_DURATIONS,
  ROOTSY_MOTION_EASINGS,
  ROOTSY_MOTION_PROPERTIES,
  ROOTSY_MOTION_SEMANTIC,
} from "@/app/library/motion/rootsyMotionSystem"

export const HANDBOOK_MOTION_DURATIONS = ROOTSY_MOTION_DURATIONS
export const HANDBOOK_MOTION_EASINGS = ROOTSY_MOTION_EASINGS
export const HANDBOOK_MOTION_PROPERTIES = ROOTSY_MOTION_PROPERTIES
export const HANDBOOK_MOTION_SEMANTIC = ROOTSY_MOTION_SEMANTIC
export const HANDBOOK_MOTION_RANGES = MOTION_DURATION_RANGES
export const HANDBOOK_MOTION_GUIDELINES = MOTION_APPLYING_GUIDELINES
export const HANDBOOK_MOTION_KEYFRAMES = MOTION_KEYFRAMES

export const HANDBOOK_MOTION_PRINCIPLES = [
  {
    title: "Clarifica, no decora",
    detail:
      "El movimiento dice qué cambió y desde dónde. Hover es brisa; el modal, ráfaga.",
  },
  {
    title: "Tokens primero",
    detail:
      "motion.modal.enter antes de armar duration y easing sueltos.",
  },
  {
    title: "Salida más corta",
    detail:
      "Entrar con atención; salir rápido. Reduced-motion → instant o none.",
  },
] as const

export const HANDBOOK_LOADING_STATES = [
  {
    id: "skeleton",
    label: "Esqueleto",
    token: "motion.duration.medium",
    usage:
      "Opacidad en pulso, sin mover el layout. Reduced-motion deja el bloque estático.",
  },
  {
    id: "spinner",
    label: "Indicador",
    token: "motion.duration.xlong",
    usage:
      "Refresh a 16px para esperas cortas. Si tarda, un mensaje. Nunca un flash de color.",
  },
  {
    id: "blanket",
    label: "Overlay de espera",
    token: "motion.blanket.enter",
    usage:
      "Fade del backdrop. El contenido no salta de tamaño mientras carga.",
  },
] as const
