"use client"

import { useEffect, useState } from "react"

function isScrollAtCeiling(root: HTMLElement) {
  return root.scrollTop <= 1
}

function isScrollAtFloor(root: HTMLElement) {
  return root.scrollHeight - root.scrollTop - root.clientHeight <= 1
}

/** El velo vive solo mientras hay más catálogo en esa dirección. */
export function useCatalogScrollFade(root: HTMLElement | null) {
  const [atCeiling, setAtCeiling] = useState(true)
  const [atFloor, setAtFloor] = useState(true)

  useEffect(() => {
    if (!root) {
      setAtCeiling(true)
      setAtFloor(true)
      return
    }

    const update = () => {
      setAtCeiling(isScrollAtCeiling(root))
      setAtFloor(isScrollAtFloor(root))
    }
    update()
    root.addEventListener("scroll", update, { passive: true })

    const observer = new ResizeObserver(update)
    observer.observe(root)
    const inner = root.firstElementChild
    if (inner) observer.observe(inner)

    return () => {
      root.removeEventListener("scroll", update)
      observer.disconnect()
    }
  }, [root])

  return { atCeiling, atFloor }
}
