/**
 * Mensaje de Rootsy — toast como globo recibido en el chat.
 * Retrato al lado de la colita; el intent se lee en el chip, no en un frost.
 */

import type { RootsyToastIntent } from "@/components/rootsy-toast/rootsyToast"

export type RootsyMensajeIntent = RootsyToastIntent

export const ROOTSY_MENSAJE_DEFAULT_PORTRAIT = "/rootsy/rootsy-alerta-amable.png"

export const ROOTSY_MENSAJE_SOUND_SRC = "/sounds/rootsy-notification.mp3"

export const ROOTSY_MENSAJE_EYEBROW = "Mensaje de Rootsy"

export type RootsyMensajeSide = "left" | "right"
export type RootsyMensajeEdge = "top" | "bottom"
export type RootsyMensajePlacement = `${RootsyMensajeEdge}-${RootsyMensajeSide}`

/** Globo de chat recibido — colita abajo-izquierda. */
export const ROOTSY_MENSAJE_DEFAULT_PLACEMENT: RootsyMensajePlacement = "bottom-left"

/** Toast flotante — llega desde la esquina superior izquierda. */
export const ROOTSY_MENSAJE_TOAST_DEFAULT_PLACEMENT: RootsyMensajePlacement = "top-left"

export const ROOTSY_MENSAJE_PLACEMENTS: {
  id: RootsyMensajePlacement
  token: string
  label: string
  usage: string
}[] = [
  {
    id: "top-left",
    token: "mensaje.placement.top-left",
    label: "Arriba izquierda",
    usage: "Retrato y colita a la izquierda, punta hacia arriba.",
  },
  {
    id: "top-right",
    token: "mensaje.placement.top-right",
    label: "Arriba derecha",
    usage: "Retrato y colita a la derecha, punta hacia arriba.",
  },
  {
    id: "bottom-left",
    token: "mensaje.placement.bottom-left",
    label: "Abajo izquierda",
    usage: "Como un mensaje recibido — colita abajo-izquierda.",
  },
  {
    id: "bottom-right",
    token: "mensaje.placement.bottom-right",
    label: "Abajo derecha",
    usage: "Como un mensaje propio — colita abajo-derecha.",
  },
]

export function rootsyMensajePlacementParts(
  placement: RootsyMensajePlacement = ROOTSY_MENSAJE_DEFAULT_PLACEMENT,
) {
  const [edge, side] = placement.split("-") as [RootsyMensajeEdge, RootsyMensajeSide]
  return { edge, side, placement }
}

export const ROOTSY_MENSAJE_INTENTS: {
  id: RootsyMensajeIntent
  token: string
  label: string
  status: string
  usage: string
}[] = [
  {
    id: "neutral",
    token: "mensaje.intent.neutral",
    label: "Mensaje",
    status: "Mensaje",
    usage: "Conversación, contexto, un aviso amable sin urgencia.",
  },
  {
    id: "info",
    token: "mensaje.intent.info",
    label: "Información",
    status: "En curso",
    usage: "Proceso en marcha — Rootsy cuenta qué está haciendo.",
  },
  {
    id: "success",
    token: "mensaje.intent.success",
    label: "Éxito",
    status: "Hecho",
    usage: "Confirmación — la tarea quedó lista.",
  },
  {
    id: "warning",
    token: "mensaje.intent.warning",
    label: "Advertencia",
    status: "Aviso",
    usage: "Atención requerida, sin alarma — stock, pendiente, cuidado.",
  },
  {
    id: "danger",
    token: "mensaje.intent.danger",
    label: "Alerta",
    status: "Alerta",
    usage: "Algo no se pudo completar — Rootsy pide ayuda con calma.",
  },
]
