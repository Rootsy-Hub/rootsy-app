"use client"

import { HomeWorkspaceBackdrop } from "@/components/layouts/HomeWorkspaceBackdrop"
import {
  ROOTSY_EMPTY_STATE_DEFAULT_WORLD,
  ROOTSY_EMPTY_STATE_WORLD_ICONS,
  type RootsyEmptyStateWorld,
} from "@/components/rootsy-empty-state/rootsyEmptyState"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import "@/components/rootsy-empty-state/rootsyEmptyState.css"

export type RootsyEmptyStateProps = {
  /** Ícono de la figura. Si no se pasa, usa el del mundo. */
  icon?: LucideIcon
  /** Voz: ROOTSY_EMPTY_STATE_VOICE — nombra lo que falta, en primera persona. */
  title: string
  /** Voz: un paso concreto. Si no hace falta, omitilo. */
  description?: ReactNode
  world?: RootsyEmptyStateWorld
  className?: string
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
  icon,
  title,
  description,
  world = ROOTSY_EMPTY_STATE_DEFAULT_WORLD,
  className,
}: RootsyEmptyStateProps) {
  const Icon = icon ?? ROOTSY_EMPTY_STATE_WORLD_ICONS[world]
  const figureReady = useEmptyStateFigureReady()

  return (
    <div
      role="status"
      aria-live="polite"
      data-world={world}
      className={cn("rootsy-empty-state", className)}
    >
      <div className="rootsy-empty-state__portrait">
        <span className="rootsy-empty-state__frame">
          <EmptyStateWorldFill world={world} />
          <EmptyStateOrb />
          <span className="rootsy-empty-state__figure">
            <span
              className="rootsy-empty-state__figure-layer"
              data-active={figureReady ? "true" : undefined}
            >
              <span className="rootsy-empty-state__image-slot">
                <Icon className="rootsy-empty-state__mark" strokeWidth={1.5} aria-hidden />
              </span>
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
