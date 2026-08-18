"use client"

import Image from "next/image"
import { CalendarDays } from "lucide-react"
import { useLandingNavigation } from "@/components/landing/context/LandingNavigationProvider"
import { LANDING_VIEW_META } from "@/components/landing/landingViews"
import type { LandingSectionProps } from "@/components/landing/types"
import { cn } from "@/lib/utils"

const HERO_SUBTITLE =
  "Gestioná ventas, stock y caja desde la nube. Todo tu negocio en un solo lugar, en vivo y desde cualquier dispositivo."

export function LandingInicioSection({ viewId }: LandingSectionProps) {
  const { layout, goRegister, goToChapter } = useLandingNavigation()
  const meta = LANDING_VIEW_META[viewId]
  const isDesktop = layout === "desktop"

  return (
    <div
      className="flex w-full min-w-0 flex-col items-center text-center"
      aria-label={meta.label}
    >
      <h1
        className={cn(
          "rootsy-hero-rise rootsy-hero-rise-d1 text-balance font-extrabold tracking-tight text-foreground",
          "text-[2rem] leading-[1.05] sm:text-[2.75rem] lg:text-[3.5rem] lg:leading-[1.04]",
        )}
      >
        Potenciamos tu éxito.
        <br />
        Transformamos tu entorno.
      </h1>

      <p className="rootsy-hero-rise rootsy-hero-rise-d2 mt-4 max-w-xl text-pretty text-base leading-relaxed text-foreground/70 sm:mt-5 sm:text-lg">
        {HERO_SUBTITLE}
      </p>

      <div className="rootsy-hero-rise rootsy-hero-rise-d3 mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row">
        <button
          type="button"
          onClick={goRegister}
          className={cn(
            "inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-base font-bold tracking-tight text-[#000347]",
            "shadow-[0_18px_48px_-16px_rgba(255,255,255,0.45)] transition duration-200 ease-out",
            "hover:bg-white/90 hover:shadow-[0_18px_56px_-14px_rgba(52,211,153,0.55)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          Contratar
        </button>
        <button
          type="button"
          onClick={() => goToChapter("empezar")}
          className={cn(
            "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-base font-bold tracking-tight text-foreground",
            "transition duration-200 ease-out hover:border-white/25 hover:bg-white/[0.08]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <CalendarDays className="h-4.5 w-4.5 text-meadow" aria-hidden />
          Agendar una demo
        </button>
      </div>

      <div
        className={cn(
          "rootsy-hero-slide-in-right relative mt-10 w-full sm:mt-14",
          isDesktop ? "max-w-[min(100%,46rem)]" : "max-w-[min(100%,30rem)]",
        )}
      >
        <div
          className="pointer-events-none absolute -inset-x-10 -top-16 bottom-0 -z-10 rounded-[40px] blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(52,211,153,0.28), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85)] ring-1 ring-white/5">
          <Image
            src="/images/preview-rootsy.png"
            alt="Panel de Rootsy: gestión de ventas y stock en vivo"
            width={693}
            height={359}
            className="h-auto w-full"
            sizes={isDesktop ? "(max-width: 1024px) 90vw, 736px" : "90vw"}
            priority
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => goToChapter("precios")}
        className="mt-8 text-sm font-semibold text-foreground/50 transition-colors hover:text-meadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Ver planes
      </button>
    </div>
  )
}
