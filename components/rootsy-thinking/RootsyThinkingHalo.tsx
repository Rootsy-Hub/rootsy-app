import "@/components/rootsy-thinking/rootsyThinkingHalo.css"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export const ROOTSY_THINKING_EXIT_MS = 520

/** Mantiene el halo montado durante la salida suave. */
export function useRootsyThinkingPresence(active: boolean) {
  const [visible, setVisible] = useState(active)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (active) {
      setExiting(false)
      setVisible(true)
      return
    }
    if (!visible) return
    setExiting(true)
    const timer = window.setTimeout(() => {
      setVisible(false)
      setExiting(false)
    }, ROOTSY_THINKING_EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [active, visible])

  return { visible, exiting }
}

type Props = {
  label: string
  id?: string
  exiting?: boolean
  /** Tres puntos que flotan. En el chat sí; en el piso de la tabla, no. */
  showDots?: boolean
  className?: string
}

/**
 * Presencia en el piso mientras Rootsy trabaja.
 * Tres elipses; los puntos son opcionales.
 */
export function RootsyThinkingHalo({
  label,
  id,
  exiting = false,
  showDots = true,
  className,
}: Props) {
  return (
    <div
      id={id}
      className={cn(
        "rootsy-thinking",
        exiting && "rootsy-thinking--exit",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      <span
        className="rootsy-thinking__glow rootsy-thinking__glow--signal"
        aria-hidden
      />
      <span
        className="rootsy-thinking__glow rootsy-thinking__glow--wash"
        aria-hidden
      />
      <span
        className="rootsy-thinking__glow rootsy-thinking__glow--core"
        aria-hidden
      />
      {showDots ? (
        <>
          <span
            className="rootsy-thinking__dot rootsy-thinking__dot--mid"
            aria-hidden
          />
          <span
            className="rootsy-thinking__dot rootsy-thinking__dot--right"
            aria-hidden
          />
          <span
            className="rootsy-thinking__dot rootsy-thinking__dot--left"
            aria-hidden
          />
        </>
      ) : null}
    </div>
  )
}
