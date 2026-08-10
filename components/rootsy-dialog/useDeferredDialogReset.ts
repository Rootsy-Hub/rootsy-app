"use client"

import { deferAfterDialogClose } from "@/components/rootsy-dialog/rootsDialogMotion"
import { useEffect, useRef } from "react"

/** Diferir reset de estado local hasta que termine la animación de cierre. */
export function useDeferredDialogReset(open: boolean, reset: () => void) {
  const resetRef = useRef(reset)
  resetRef.current = reset

  useEffect(() => {
    if (open) return
    return deferAfterDialogClose(() => resetRef.current())
  }, [open])
}
