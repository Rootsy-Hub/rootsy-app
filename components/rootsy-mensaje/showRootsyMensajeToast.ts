import { toast } from "@/hooks/use-toast"
import { playRootsyMensajeSound } from "@/components/rootsy-mensaje/playRootsyMensajeSound"
import {
  ROOTSY_MENSAJE_DEFAULT_PORTRAIT,
  ROOTSY_MENSAJE_TOAST_DEFAULT_PLACEMENT,
  type RootsyMensajeIntent,
  type RootsyMensajePlacement,
} from "@/components/rootsy-mensaje/rootsyMensaje"
import { ROOTSY_MENSAJE_TOAST_DURATION_MS } from "@/components/rootsy-toast/rootsyToast"
import type { ReactNode } from "react"

export type ShowRootsyMensajeToastOptions = {
  title: string
  message?: string
  intent?: RootsyMensajeIntent
  /** Esquina de la pantalla y del globo. Por defecto arriba-izquierda. */
  placement?: RootsyMensajePlacement
  portrait?: ReactNode
  portraitSrc?: string
  portraitAlt?: string
  eyebrow?: string
  statusLabel?: string
  actionLabel?: string
  onAction?: () => void
  duration?: number
  createdAt?: string
  /** Opt-in. Solo suena si se llama en el mismo click. */
  sound?: boolean
}

export function showRootsyMensajeToast(options: ShowRootsyMensajeToastOptions) {
  const duration = options.duration ?? ROOTSY_MENSAJE_TOAST_DURATION_MS

  if (options.sound) {
    playRootsyMensajeSound()
  }

  return toast({
    appearance: "mensaje",
    title: options.title,
    description: options.message,
    intent: options.intent ?? "neutral",
    placement: options.placement ?? ROOTSY_MENSAJE_TOAST_DEFAULT_PLACEMENT,
    portrait: options.portrait,
    portraitSrc: options.portrait ? undefined : (options.portraitSrc ?? ROOTSY_MENSAJE_DEFAULT_PORTRAIT),
    portraitAlt: options.portraitAlt,
    eyebrow: options.eyebrow,
    statusLabel: options.statusLabel,
    actionLabel: options.actionLabel,
    onAction: options.onAction,
    createdAt: options.createdAt,
    duration,
    dismissible: true,
  })
}
