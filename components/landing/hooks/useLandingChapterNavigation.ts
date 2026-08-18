"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  LANDING_VIEW_IDS,
  isLandingViewId,
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
  const programmaticScrollRef = useRef(false)
  const programmaticTimerRef = useRef<number | null>(null)
  const activeChapterRef = useRef<LandingViewId>(activeChapter)

  useEffect(() => {
    activeChapterRef.current = activeChapter
  }, [activeChapter])

  const markProgrammaticScroll = useCallback(() => {
    programmaticScrollRef.current = true
    if (programmaticTimerRef.current != null) {
      window.clearTimeout(programmaticTimerRef.current)
    }
    programmaticTimerRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = false
      programmaticTimerRef.current = null
    }, 900)
  }, [])

  useEffect(() => {
    if (layout === null) return
    const initial = readHashChapter()
    setActiveChapter(initial)
    if (initial !== "inicio") {
      markProgrammaticScroll()
      requestAnimationFrame(() => scrollToChapter(initial))
    }
  }, [layout, markProgrammaticScroll])

  const goToChapter = useCallback(
    (id: LandingViewId) => {
      setActiveChapter(id)
      setSceneKey((k) => k + 1)
      window.history.replaceState(null, "", `#${id}`)
      markProgrammaticScroll()
      scrollToChapter(id)
    },
    [markProgrammaticScroll],
  )

  useEffect(() => {
    if (layout === null) return
    const onHashChange = () => {
      const next = readHashChapter()
      setActiveChapter(next)
      setSceneKey((k) => k + 1)
      markProgrammaticScroll()
      scrollToChapter(next)
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [layout, markProgrammaticScroll])

  useEffect(() => {
    if (layout === null) return

    const sections = LANDING_VIEW_IDS.map((id) =>
      document.getElementById(id),
    ).filter((el): el is HTMLElement => el != null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (programmaticScrollRef.current) return
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const nextId = visible[0]?.target.id
        if (
          !nextId ||
          !isLandingViewId(nextId) ||
          nextId === activeChapterRef.current
        ) {
          return
        }
        setActiveChapter(nextId)
        window.history.replaceState(null, "", `#${nextId}`)
      },
      {
        root: null,
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.16, 0.35, 0.6],
      },
    )

    for (const section of sections) observer.observe(section)
    return () => observer.disconnect()
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

  useEffect(() => {
    return () => {
      if (programmaticTimerRef.current != null) {
        window.clearTimeout(programmaticTimerRef.current)
      }
    }
  }, [])

  return { activeChapter, sceneKey, goToChapter }
}
