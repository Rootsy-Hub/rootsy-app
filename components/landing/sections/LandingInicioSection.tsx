"use client"

import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"
import { landingPrimaryCtaClass } from "@/components/landing/chrome/landingCtaClasses"
import { useLandingNavigation } from "@/components/landing/context/LandingNavigationProvider"
import { LANDING_VIEW_META } from "@/components/landing/landingViews"
import type { LandingSectionProps } from "@/components/landing/types"
import { cn } from "@/lib/utils"

const TRIAL_BADGE = "7 días gratis · sin tarjeta"

export function LandingInicioSection({ viewId }: LandingSectionProps) {
  const { layout, goRegister, goToChapter } = useLandingNavigation()
  const meta = LANDING_VIEW_META[viewId]
  const isDesktop = layout === "desktop"

  return (
    <div
      className={cn(
        "grid w-full min-w-0 items-center",
        isDesktop
          ? "gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-14 xl:gap-20"
          : "gap-6",
      )}
      aria-label={meta.label}
    >
      <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
        <p className="rootsy-hero-rise rootsy-hero-rise-d1 inline-flex w-fit items-center rounded-full border border-meadow/20 bg-meadow/8 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-meadow sm:text-[11px]">
          {TRIAL_BADGE}
        </p>
        <h1 className="rootsy-hero-rise rootsy-hero-rise-d2 text-balance text-[2rem] font-extrabold leading-[1.06] tracking-tight text-foreground sm:text-[2.75rem] lg:text-[3.5rem] lg:leading-[1.05]">
          Gestioná{" "}
          <span className="bg-gradient-to-r from-meadow via-teal-200 to-emerald-300 bg-clip-text text-transparent">
            en minutos
          </span>
        </h1>
        {meta.tagline ? (
          <p className="rootsy-hero-rise rootsy-hero-rise-d3 max-w-lg text-pretty text-base leading-relaxed text-foreground/75 sm:text-lg">
            {meta.tagline}
          </p>
        ) : null}
        <div className="rootsy-hero-rise rootsy-hero-rise-d4 flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            className={cn(buttonVariants({ size: "lg" }), landingPrimaryCtaClass)}
            onClick={goRegister}
          >
            Comenzar gratis
          </button>
          <button
            type="button"
            className={cn(
              buttonVariants({ size: "lg", variant: "ghost" }),
              "h-12 rounded-2xl px-6 text-foreground/70 hover:bg-white/5 hover:text-foreground",
            )}
            onClick={() => goToChapter("empezar")}
          >
            Ver los 3 pasos
          </button>
        </div>
      </div>

      <div
        className={cn(
          "rootsy-hero-slide-in-right relative flex shrink-0 justify-center",
          isDesktop ? "lg:justify-end" : "mt-2",
        )}
      >
        <div
          className={cn(
            "relative aspect-square w-full",
            isDesktop
              ? "max-w-[min(100%,380px)] sm:max-w-[400px] lg:max-w-[min(100%,460px)]"
              : "max-w-[min(100%,220px)] sm:max-w-[260px]",
          )}
        >
          <Image
            src="/rootsy-mascot.png"
            alt="Rootsy, la guía de tu negocio"
            fill
            className="pointer-events-none -scale-x-100 object-contain object-bottom motion-safe:animate-[mascot-float_6.5s_ease-in-out_infinite]"
            sizes={
              isDesktop
                ? "(max-width: 1024px) 85vw, 460px"
                : "(max-width: 640px) 70vw, 260px"
            }
            priority
            style={{
              filter:
                "drop-shadow(0 48px 64px rgba(0,0,0,0.55)) drop-shadow(0 0 56px rgba(52,211,153,0.2))",
            }}
          />
        </div>
      </div>
    </div>
  )
}
