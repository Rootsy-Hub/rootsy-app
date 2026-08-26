"use client"

import { HomeWorkspaceBackdrop } from "@/components/layouts/HomeWorkspaceBackdrop"
import {
  ROOTSY_EMPTY_STATE_DEFAULT_IMAGE,
  ROOTSY_EMPTY_STATE_DEFAULT_WORLD,
  type RootsyEmptyStateWorld,
} from "@/components/rootsy-empty-state/rootsyEmptyState"
import {
  ROOTSY_ELSEWHERE_LABEL,
  useRootsyPortraitSlot,
  type RootsyPortraitSlot,
} from "@/components/rootsy-empty-state/rootsyPortraitPresence"
import { cn } from "@/lib/utils"
import { useEffect, useState, type ReactNode } from "react"
import "@/components/rootsy-empty-state/rootsyEmptyState.css"

export type RootsyEmptyStateProps = {
  imageSrc?: string
  /**
   * Contenido del círculo. Gana sobre imageSrc.
   * Si Rootsy está en otro lado, se ignora y se muestran los tres puntos.
   */
  image?: ReactNode
  /** Voz: ROOTSY_EMPTY_STATE_VOICE — nombra lo que falta, en primera persona. */
  title: string
  /** Voz: un paso concreto. Si no hace falta, omitilo. */
  description?: ReactNode
  world?: RootsyEmptyStateWorld
  imageAlt?: string
  className?: string
  /**
   * Superficie de producto. Reclama el retrato según toast → catálogo → pedido.
   * En la galería no se pasa: siempre se muestra el retrato.
   */
  slot?: RootsyPortraitSlot
  /** Forzar retrato o continuación. Si no se pasa, lo decide `slot`. */
  presence?: "portrait" | "elsewhere"
}

function EmptyStateWorldFill({ world }: { world: RootsyEmptyStateWorld }) {
  if (world === "eter") {
    return <HomeWorkspaceBackdrop className="rootsy-empty-state__eter" />
  }

  return (
    <span
      className={cn("rootsy-empty-state__world", `rootsy-empty-state__world--${world}`)}
      aria-hidden
    />
  )
}

function EmptyStateOrb() {
  return (
    <span className="rootsy-empty-state__orb" aria-hidden>
      <span className="rootsy-empty-state__orb-spin" />
      <span className="rootsy-empty-state__orb-blob is-a" />
      <span className="rootsy-empty-state__orb-blob is-b" />
    </span>
  )
}

/** Tres puntos quietos sobre un orb de luz — la conversación sigue en otro lado. */
export function RootsyEmptyStateEllipsis({
  label = "Rootsy está en otro lado",
  withOrb = true,
}: {
  label?: string
  /** El retrato ya pinta el orb; adentro del empty state se omite. */
  withOrb?: boolean
}) {
  return (
    <span className="rootsy-empty-state__ellipsis" title={label} aria-hidden>
      {withOrb ? <EmptyStateOrb /> : null}
      <span className="rootsy-empty-state__ellipsis-marks">
        <span className="rootsy-empty-state__ellipsis-dot" />
        <span className="rootsy-empty-state__ellipsis-dot" />
        <span className="rootsy-empty-state__ellipsis-dot" />
      </span>
    </span>
  )
}

function useEmptyStateFigureReady() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      setReady(true)
      return
    }

    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return ready
}

export function RootsyEmptyState({
  imageSrc = ROOTSY_EMPTY_STATE_DEFAULT_IMAGE,
  image,
  title,
  description,
  world = ROOTSY_EMPTY_STATE_DEFAULT_WORLD,
  imageAlt = "",
  className,
  slot,
  presence,
}: RootsyEmptyStateProps) {
  const claimed = useRootsyPortraitSlot(slot)
  const resolvedPresence =
    presence ?? (slot ? (claimed.showPortrait ? "portrait" : "elsewhere") : "portrait")
  const toward = claimed.elsewhereToward
  const elsewhereLabel = toward ? ROOTSY_ELSEWHERE_LABEL[toward] : "Rootsy está en otro lado"
  const showEllipsis = resolvedPresence === "elsewhere"
  const figureReady = useEmptyStateFigureReady()

  return (
    <div
      role="status"
      aria-live="polite"
      data-world={world}
      data-presence={resolvedPresence}
      data-slot={slot}
      className={cn("rootsy-empty-state", className)}
    >
      <div className="rootsy-empty-state__portrait">
        <span className="rootsy-empty-state__frame">
          <EmptyStateWorldFill world={world} />
          <EmptyStateOrb />
          <span className="rootsy-empty-state__figure">
            <span
              className="rootsy-empty-state__figure-layer"
              data-active={figureReady && !showEllipsis ? "true" : undefined}
              aria-hidden={showEllipsis}
            >
              {image ? (
                <span className="rootsy-empty-state__image-slot">{image}</span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className="rootsy-empty-state__image"
                />
              )}
            </span>
            <span
              className="rootsy-empty-state__figure-layer"
              data-active={figureReady && showEllipsis ? "true" : undefined}
              aria-hidden={!showEllipsis}
            >
              <RootsyEmptyStateEllipsis label={elsewhereLabel} withOrb={false} />
            </span>
          </span>
        </span>
      </div>
      <div className="rootsy-empty-state__copy">
        <p className="rootsy-empty-state__title font-canopy">{title}</p>
        {description ? (
          <p className="rootsy-empty-state__description font-canopy">{description}</p>
        ) : null}
      </div>
    </div>
  )
}
