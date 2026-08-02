"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, Leaf } from "lucide-react"
import {
  LANDING_NAV,
  LANDING_VIEW_META,
  landingAdjacentView,
  landingSectionIndex,
  type LandingViewId,
} from "@/components/landing-backup/landingViews"
import { cn } from "@/lib/utils"

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? "/login"
const REGISTER_URL = "/register"

type LandingHudProps = {
  active: LandingViewId
  onSelect: (id: LandingViewId) => void
  onHome: () => void
}

export function LandingHudTop({ active, onHome }: Pick<LandingHudProps, "active" | "onHome">) {
  const meta = LANDING_VIEW_META[active]
  const index = landingSectionIndex(active)
  const total = LANDING_NAV.length
  const progress = (index / total) * 100

  return (
    <header className="relative z-50 shrink-0 border-b border-rootsy-hairline/70">
      <div className="flex h-14 w-full items-center gap-4 px-4 sm:h-[3.75rem] sm:gap-6 sm:px-8 lg:pr-20">
        <button
          type="button"
          onClick={onHome}
          className="group flex shrink-0 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070a09]"
          aria-label="Rootsy — inicio"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-meadow/10 ring-1 ring-meadow/25 transition group-hover:bg-meadow/16">
            <Leaf className="h-5 w-5 text-meadow" aria-hidden />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Rootsy
            </span>
            <span className="hidden text-[11px] text-foreground/45 sm:block">
              El mundo dentro de tu negocio
            </span>
          </span>
        </button>

        <div className="hidden min-w-0 flex-1 sm:block">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-meadow">
              {meta.label}
            </span>
            <span className="text-[11px] tabular-nums tracking-widest text-foreground/40">
              {String(index).padStart(2, "0")}/{String(total).padStart(2, "0")}
            </span>
          </div>
          <div
            className="mt-2 h-0.5 overflow-hidden rounded-full bg-white/[0.06]"
            role="progressbar"
            aria-valuenow={index}
            aria-valuemin={1}
            aria-valuemax={total}
          >
            <div
              className="h-full rounded-full bg-meadow/90 transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <span className="ml-auto text-[11px] font-bold tabular-nums tracking-widest text-foreground/40 sm:hidden">
          {String(index).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
      </div>
    </header>
  )
}

export function LandingHudDock({
  active,
  onSelect,
  isHome = false,
}: Pick<LandingHudProps, "active" | "onSelect"> & { isHome?: boolean }) {
  const meta = LANDING_VIEW_META[active]
  const prev = landingAdjacentView(active, -1)
  const next = landingAdjacentView(active, 1)

  return (
    <footer className="relative z-50 shrink-0 border-t border-rootsy-hairline/70">
      <div
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3 sm:px-8 lg:pr-20",
          isHome ? "justify-between" : "flex-col gap-2.5 sm:flex-row sm:justify-between",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:justify-start">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rootsy-hairline/80 text-foreground/60 transition hover:border-meadow/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/50"
            aria-label={`Anterior: ${LANDING_VIEW_META[prev].label}`}
            onClick={() => onSelect(prev)}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <p className="min-w-0 truncate px-1 text-center text-sm font-semibold text-foreground/90 sm:max-w-[14rem] sm:text-left">
            {meta.label}
          </p>
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rootsy-hairline/80 text-foreground/60 transition hover:border-meadow/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/50"
            aria-label={`Siguiente: ${LANDING_VIEW_META[next].label}`}
            onClick={() => onSelect(next)}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {isHome ? (
          <p className="hidden shrink-0 text-[10px] uppercase tracking-[0.18em] text-foreground/35 lg:block">
            ← → Explorar capítulos
          </p>
        ) : (
          <div className="flex w-full shrink-0 gap-2 sm:w-auto">
            <Link
              href={LOGIN_URL}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-rootsy-hairline/80 px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/65 transition hover:text-foreground sm:min-w-[8.5rem] sm:flex-none"
            >
              Ingresar
            </Link>
            <Link
              href={REGISTER_URL}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-emerald-400/35 bg-gradient-to-br from-emerald-500 to-teal-500 px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_28px_-8px_rgba(16,185,129,0.45)] sm:min-w-[8.5rem] sm:flex-none"
            >
              Probar gratis
            </Link>
          </div>
        )}
      </div>
    </footer>
  )
}
