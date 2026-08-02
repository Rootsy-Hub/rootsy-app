"use client"

import { useLayoutEffect, useState } from "react"

/** Contenedor con scroll del layout workspace (`<main>`). */
export function useDataWorkspaceMainScrollRoot() {
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const main = document.querySelector("main")
    setScrollRoot(main instanceof HTMLElement ? main : null)
  }, [])

  return scrollRoot
}
