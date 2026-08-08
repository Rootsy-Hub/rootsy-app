import type { LandingViewMeta } from "@/components/landing/landingViews"

type LandingChapterHeaderProps = {
  meta: LandingViewMeta
}

export function LandingChapterHeader({ meta }: LandingChapterHeaderProps) {
  return (
    <header className="shrink-0 mb-7 sm:mb-9">
      <div
        className="mb-4 h-px w-16 bg-gradient-to-r from-meadow/80 to-transparent"
        aria-hidden
      />
      <h1 className="rootsy-landing-title-glow text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem] lg:leading-[1.1]">
        {meta.title}
      </h1>
      {meta.tagline ? (
        <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-foreground/75 sm:text-lg">
          {meta.tagline}
        </p>
      ) : null}
    </header>
  )
}
