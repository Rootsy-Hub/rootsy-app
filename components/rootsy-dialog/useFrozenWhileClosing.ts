"use client"

import { ROOTS_DIALOG_EXIT_ANIMATION_MS } from "@/components/rootsy-dialog/rootsDialogMotion"
import { useLayoutEffect, useRef, useState } from "react"

/**
 * Mantiene el último valor visible mientras el diálogo cierra, para evitar
 * que títulos/descripciones cambien antes de que termine la animación.
 */
export function useFrozenWhileClosing<T>(open: boolean, value: T): T {
  const [display, setDisplay] = useState(value)
  const wasOpenRef = useRef(open)

  useLayoutEffect(() => {
    if (open) {
      wasOpenRef.current = true
      setDisplay(value)
      return
    }

    if (wasOpenRef.current) {
      wasOpenRef.current = false
      const id = window.setTimeout(() => {
        setDisplay(value)
      }, ROOTS_DIALOG_EXIT_ANIMATION_MS)
      return () => window.clearTimeout(id)
    }

    setDisplay(value)
  }, [open, value])

  return display
}
