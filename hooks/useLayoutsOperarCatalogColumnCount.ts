"use client"

import { layoutsOperarCatalogColumnCount } from "@/app/library/layouts/layoutsOperarStyles"
import { useEffect, useState } from "react"

function catalogContentWidth(element: HTMLElement): number {
  const style = getComputedStyle(element)
  return (
    element.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight)
  )
}

export function useLayoutsOperarCatalogColumnCount(
  modoVista: "grid" | "lista",
  container: HTMLElement | null,
) {
  const [columns, setColumns] = useState(() =>
    modoVista === "lista"
      ? 1
      : container
        ? layoutsOperarCatalogColumnCount(catalogContentWidth(container))
        : 2,
  )

  useEffect(() => {
    if (modoVista === "lista") {
      setColumns(1)
      return
    }
    if (!container) return

    const sync = () => {
      setColumns(layoutsOperarCatalogColumnCount(catalogContentWidth(container)))
    }
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(container)
    return () => observer.disconnect()
  }, [modoVista, container])

  return columns
}
