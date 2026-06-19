import type { ReactNode } from "react"
import type { LandingViewMeta } from "@/components/landing-backup/landingViews"
import { cn } from "@/lib/utils"

type LandingSceneProps = {
  meta: LandingViewMeta
  children: ReactNode
}

export function LandingScene({ meta, children }: LandingSceneProps) {
  const centered = meta.centered ?? false

  return (
    <div
      className={cn(
        "flex w-full flex-col",
        centered ? "min-h-full justify-center py-2 sm:py-6" : "py-1 sm:py-2",
      )}
    >
      <header
        className={cn(
          "shrink-0",
          centered ? "mb-7 sm:mb-9" : "mb-6 sm:mb-8",
        )}
      >
        <div
          className="mb-4 h-px w-16 bg-gradient-to-r from-meadow/80 to-transparent"
          aria-hidden
        />
        <h1 className="rootsy-landing-title-glow text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem] lg:leading-[1.1]">
          {meta.title}
        </h1>
        {meta.tagline ? (
          <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {meta.tagline}
          </p>
        ) : null}
      </header>
      <div className="min-h-0">{children}</div>
    </div>
  )
}
