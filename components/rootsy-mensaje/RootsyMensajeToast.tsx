"use client"

import { formatChatTime } from "@/app/[siteId]/[popId]/chat/chatTypes"
import { HomeWorkspaceBackdrop } from "@/components/layouts/HomeWorkspaceBackdrop"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import {
  ROOTSY_MENSAJE_DEFAULT_PLACEMENT,
  ROOTSY_MENSAJE_DEFAULT_PORTRAIT,
  ROOTSY_MENSAJE_INTENTS,
  rootsyMensajePlacementParts,
  type RootsyMensajeIntent,
  type RootsyMensajePlacement,
} from "@/components/rootsy-mensaje/rootsyMensaje"
import "@/components/rootsy-mensaje/rootsyMensaje.css"

export type RootsyMensajeToastProps = {
  intent?: RootsyMensajeIntent
  /** Esquina del globo — retrato y colita rotan con left/right y top/bottom. */
  placement?: RootsyMensajePlacement
  /** Contenido del círculo — gana sobre portraitSrc. */
  portrait?: ReactNode
  portraitSrc?: string
  portraitAlt?: string
  title: string
  message?: ReactNode
  statusLabel?: string
  actionLabel?: string
  onAction?: () => void
  dismissible?: boolean
  onDismiss?: () => void
  createdAt?: string
  className?: string
}

function intentMeta(intent: RootsyMensajeIntent) {
  return ROOTSY_MENSAJE_INTENTS.find((item) => item.id === intent) ?? ROOTSY_MENSAJE_INTENTS[0]
}

function MensajeIntentMark({ intent }: { intent: RootsyMensajeIntent }) {
  if (intent === "success") {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (intent === "danger") {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
        <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    )
  }

  if (intent === "warning") {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 2.5L14.5 13H1.5L8 2.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M8 6.5v3M8 11h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 7v4M8 5.5h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function MensajeTail() {
  return (
    <svg className="rootsy-mensaje__tail" width="8" height="13" viewBox="0 0 8 13" aria-hidden>
      <path
        fill="currentColor"
        d="M5.188 0H0v11.193C1.2 8.4 4.1 4.6 6.467 2.568 7.688 1.207 6.959 0 5.188 0z"
      />
    </svg>
  )
}

export function RootsyMensajeToast({
  intent = "neutral",
  placement = ROOTSY_MENSAJE_DEFAULT_PLACEMENT,
  portrait,
  portraitSrc,
  portraitAlt = "Rootsy",
  title,
  message,
  statusLabel,
  actionLabel,
  onAction,
  dismissible = false,
  onDismiss,
  createdAt,
  className,
}: RootsyMensajeToastProps) {
  const meta = intentMeta(intent)
  const status = statusLabel ?? meta.status
  const timeLabel = formatChatTime(createdAt ?? new Date().toISOString())
  const { edge, side } = rootsyMensajePlacementParts(placement)

  return (
    <article
      className={cn(
        "rootsy-mensaje font-canopy",
        `is-intent-${intent}`,
        `is-side-${side}`,
        `is-edge-${edge}`,
        className,
      )}
      data-placement={placement}
    >
      <div className="rootsy-mensaje__row">
        <div className="rootsy-mensaje__avatar">
          <span className="rootsy-mensaje__avatar-frame">
            <HomeWorkspaceBackdrop className="rootsy-mensaje__eter" />
            {portrait ?? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitSrc ?? ROOTSY_MENSAJE_DEFAULT_PORTRAIT}
                alt={portraitAlt}
              />
            )}
          </span>
          <span className="rootsy-mensaje__pip" aria-hidden />
        </div>

        <div className="rootsy-mensaje__bubble">
          <div className="rootsy-mensaje__meta">
            <span className="rootsy-mensaje__intent">
              <MensajeIntentMark intent={intent} />
              {status}
            </span>
            {dismissible ? (
              <button
                type="button"
                className="rootsy-mensaje__dismiss"
                aria-label="Cerrar mensaje"
                onClick={onDismiss}
              >
                <svg viewBox="0 0 16 16" width={11} height={11} aria-hidden>
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.35"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            ) : null}
          </div>

          <p className="rootsy-mensaje__title font-canopy">
            {title}
            {!message && !actionLabel && timeLabel ? (
              <span className="rootsy-mensaje__time-pad" aria-hidden>
                {timeLabel}
              </span>
            ) : null}
          </p>
          {message ? (
            <p className="rootsy-mensaje__body font-canopy">
              {message}
              {!actionLabel && timeLabel ? (
                <span className="rootsy-mensaje__time-pad" aria-hidden>
                  {timeLabel}
                </span>
              ) : null}
            </p>
          ) : null}

          {actionLabel ? (
            <button type="button" className="rootsy-mensaje__action" onClick={onAction}>
              {actionLabel}
              {timeLabel ? (
                <span className="rootsy-mensaje__time-pad" aria-hidden>
                  {timeLabel}
                </span>
              ) : null}
            </button>
          ) : null}

          {timeLabel ? (
            <time className="rootsy-mensaje__time font-canopy" dateTime={createdAt}>
              {timeLabel}
            </time>
          ) : null}

          <MensajeTail />
        </div>
      </div>
    </article>
  )
}
