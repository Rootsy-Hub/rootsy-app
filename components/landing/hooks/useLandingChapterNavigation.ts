"use client"

import { useCallback, useEffect, useState } from "react"
import {
  landingAdjacentView,
  viewFromHash,
  type LandingViewId,
} from "@/components/landing/landingViews"
import type { LandingLayoutMode } from "@/components/landing/types"

function readHashChapter(): LandingViewId {
  if (typeof window === "undefined") return "inicio"
  return viewFromHash(window.location.hash)
}

function scrollToChapter(id: LandingViewId) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function useLandingChapterNavigation(layout: LandingLayoutMode | null) {
  const [activeChapter, setActiveChapter] = useState<LandingViewId>("inicio")
  const [sceneKey, setSceneKey] = useState(0)

  useEffect(() => {
    if (layout === null) return
    const initial = readHashChapter()
    setActiveChapter(initial)
    if (layout === "mobile") {
      requestAnimationFrame(() => scrollToChapter(initial))
    }
  }, [layout])

  const goToChapter = useCallback(
    (id: LandingViewId) => {
      setActiveChapter(id)
      setSceneKey((k) => k + 1)
      window.history.replaceState(null, "", `#${id}`)
      if (layout === "mobile") {
        scrollToChapter(id)
      }
    },
    [layout],
  )

  useEffect(() => {
    if (layout === null) return
    const onHashChange = () => {
      const next = readHashChapter()
      setActiveChapter(next)
      setSceneKey((k) => k + 1)
      if (layout === "mobile") scrollToChapter(next)
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [layout])

  useEffect(() => {
    if (layout !== "desktop") return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
      const target = e.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return
      }
      e.preventDefault()
      goToChapter(landingAdjacentView(activeChapter, e.key === "ArrowLeft" ? -1 : 1))
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [layout, activeChapter, goToChapter])

  return { activeChapter, sceneKey, goToChapter }
}
