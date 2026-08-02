import { LANDING_VIEW_META, type LandingViewId } from "@/components/landing/landingViews"

type LandingSectionPlaceholderProps = {
  viewId: LandingViewId
}

export function LandingSectionPlaceholder({ viewId }: LandingSectionPlaceholderProps) {
  const meta = LANDING_VIEW_META[viewId]

  return (
    <div
      className="flex w-full min-w-0 flex-col items-center justify-center rounded-2xl border border-dashed border-meadow/25 bg-white/[0.02] px-4 py-8 text-center sm:px-6 sm:py-10"
      data-landing-section={viewId}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-meadow/80">
        {meta.label}
      </span>
      <p className="mt-2 max-w-md text-lg font-bold text-foreground">{meta.title}</p>
      {meta.tagline ? (
        <p className="mt-2 max-w-sm text-sm text-foreground/55">{meta.tagline}</p>
      ) : null}
      <p className="mt-6 text-[11px] text-foreground/35">Slot de contenido</p>
    </div>
  )
}
