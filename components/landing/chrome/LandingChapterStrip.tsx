"use client"

import { useEffect, useRef } from "react"
import { LANDING_NAV } from "@/components/landing/landingViews"
import { useLandingNavigation } from "@/components/landing/context/LandingNavigationProvider"
import type { LandingViewId } from "@/components/landing/landingViews"
import { cn } from "@/lib/utils"

const shellBase =
  "shrink-0 border-t border-rootsy-hairline/80 bg-background/80 backdrop-blur-xl backdrop-saturate-150"

export function LandingChapterStrip() {
  const { activeChapter, goToChapter } = useLandingNavigation()
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const activeEl = scroller.querySelector<HTMLElement>(
      '[data-chapter-active="true"]',
    )
    activeEl?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    })
  }, [activeChapter])

  return (
    <nav
      className={cn(shellBase, "flex h-19 items-center sm:h-20")}
      aria-label="Capítulos"
    >
      <div
        ref={scrollerRef}
        className={cn(
          "mx-auto flex h-full w-full max-w-360 items-center gap-2 overflow-x-auto px-4 rootsy-scroll-minimal sm:gap-2.5 sm:px-8",
          "justify-center scroll-smooth snap-x snap-mandatory",
        )}
      >
        {LANDING_NAV.map(({ id, label }) => (
          <ChapterCard
            key={id}
            id={id}
            label={label}
            active={id === activeChapter}
            onSelect={goToChapter}
          />
        ))}
      </div>
    </nav>
  )
}

function ChapterCard({
  id,
  label,
  active,
  onSelect,
}: {
  id: LandingViewId
  label: string
  active: boolean
  onSelect: (id: LandingViewId) => void
}) {
  return (
    <button
      type="button"
      data-chapter={id}
      data-chapter-active={active ? "true" : undefined}
      onClick={() => onSelect(id)}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-11 min-w-21 shrink-0 snap-center items-center justify-center rounded-xl border px-3 transition duration-200 ease-out motion-safe:hover:scale-[1.04] motion-safe:active:scale-[0.97] sm:min-w-22",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? cn(
              "border-meadow/50 bg-linear-to-b from-emerald-500/22 to-teal-600/8",
              "text-meadow shadow-[0_-3px_0_0] shadow-meadow",
            )
          : cn(
              "border-rootsy-hairline/70 bg-white/3 text-foreground/75",
              "hover:border-meadow/30 hover:bg-white/6 hover:text-foreground",
            ),
      )}
    >
      <span className="text-[11px] font-bold uppercase leading-none tracking-[0.08em]">
        {label}
      </span>
    </button>
  )
}
