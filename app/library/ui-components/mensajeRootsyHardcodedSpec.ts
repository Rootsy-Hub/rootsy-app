/**
 * Specs hardcodeadas Mensaje de Rootsy — globo de chat recibido.
 */

import {
  ROOTSY_MENSAJE_DEFAULT_PORTRAIT,
  ROOTSY_MENSAJE_EYEBROW,
  ROOTSY_MENSAJE_INTENTS,
  ROOTSY_MENSAJE_PLACEMENTS,
  type RootsyMensajeIntent,
  type RootsyMensajePlacement,
} from "@/components/rootsy-mensaje/rootsyMensaje"

export type { RootsyMensajeIntent, RootsyMensajePlacement }

export const MENSAJE_ROOTSY_INTENTS = ROOTSY_MENSAJE_INTENTS
export const MENSAJE_ROOTSY_DEFAULT_PORTRAIT = ROOTSY_MENSAJE_DEFAULT_PORTRAIT
export const MENSAJE_ROOTSY_EYEBROW = ROOTSY_MENSAJE_EYEBROW
export const MENSAJE_ROOTSY_PLACEMENTS = ROOTSY_MENSAJE_PLACEMENTS

export const MENSAJE_ROOTSY_LAYOUTS = [
  {
    id: "title-message",
    token: "mensaje.layout.title-message",
    label: "Título + mensaje",
    usage: "Cuerpo completo — Rootsy explica qué pasó y qué sigue.",
  },
  {
    id: "with-action",
    token: "mensaje.layout.with-action",
    label: "Con acción",
    usage: "Link para continuar — ver, reintentar, seguir.",
  },
  {
    id: "dismissible",
    token: "mensaje.layout.dismissible",
    label: "Descartable",
    usage: "Cerrar a mano — el retrato y el intent siguen visibles.",
  },
] as const

export const MENSAJE_ROOTSY_PORTRAITS = [
  {
    id: "src",
    token: "mensaje.portrait.src",
    label: "Imagen",
    usage: "portraitSrc — foto o ilustración recortada al círculo.",
  },
  {
    id: "slot",
    token: "mensaje.portrait.slot",
    label: "Componente",
    usage: "portrait — cualquier nodo en el mismo círculo; gana sobre src.",
  },
] as const

export const MENSAJE_ROOTSY_DEMO_COPY: Record<
  RootsyMensajeIntent,
  { title: string; message: string; action: string }
> = {
  neutral: {
    title: "Hoy el bosque está tranquilo",
    message: "Cuando quieras, arrancamos con el stock del día.",
    action: "Abrir herramientas",
  },
  info: {
    title: "Estoy actualizando precios",
    message: "Te aviso cuando la lista quede lista — no hace falta que esperes acá.",
    action: "Ver progreso",
  },
  success: {
    title: "Listo, ya está guardado",
    message: "Los precios del agua mineral ya están en el catálogo.",
    action: "Ver artículo",
  },
  warning: {
    title: "Quedan pocas medialunas",
    message: "Hay 3 unidades — ¿revisamos el inventario juntos?",
    action: "Ir a stock",
  },
  danger: {
    title: "No pude guardar el artículo",
    message: "Revisá el nombre e intentamos de nuevo. Estoy acá si hace falta.",
    action: "Reintentar",
  },
}
