"use client"

import Link from "next/link"
import { useLandingNavigation } from "@/components/landing/context/LandingNavigationProvider"
import type { LandingViewId } from "@/components/landing/landingViews"
import { cn } from "@/lib/utils"

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? "/login"

const shellBase =
  "relative z-50 shrink-0 border-b border-rootsy-hairline/80 bg-background/80 backdrop-blur-xl backdrop-saturate-150"

/** Nav central del Figma, mapeada a los capítulos existentes. */
const TOP_NAV: ReadonlyArray<{ label: string; chapter: LandingViewId }> = [
  { label: "Inicio", chapter: "inicio" },
  { label: "Soluciones", chapter: "rubros" },
  { label: "Sobre nosotros", chapter: "clientes" },
  { label: "Planes", chapter: "precios" },
]

type LandingTopBarProps = {
  onHome: () => void
  sticky?: boolean
}

export function LandingTopBar({ onHome, sticky = false }: LandingTopBarProps) {
  const { activeChapter, goToChapter } = useLandingNavigation()

  return (
    <header
      className={cn(
        shellBase,
        "flex h-14 items-center sm:h-15",
        sticky && "sticky top-0 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.65)]",
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-360 items-center justify-between gap-4 px-4 sm:px-8">
        <button
          type="button"
          onClick={onHome}
          className="group inline-flex h-11 shrink-0 items-center gap-2.5 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Rootsy — inicio"
        >
          <span
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white sm:h-10 sm:w-10",
              "shadow-[0_0_24px_-6px_rgba(255,255,255,0.35)] transition duration-300 ease-out",
              "group-hover:shadow-[0_0_28px_-6px_rgba(52,211,153,0.55)]",
            )}
          >
            <span className="text-base font-black leading-none text-[#1e1e1e] sm:text-lg">
              R
            </span>
          </span>
          <span className="text-lg font-extrabold leading-none tracking-tight text-foreground sm:text-xl">
            Rootsy
          </span>
        </button>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex xl:gap-9"
          aria-label="Navegación principal"
        >
          {TOP_NAV.map(({ label, chapter }) => {
            const isActive = activeChapter === chapter
            return (
              <button
                key={chapter}
                type="button"
                onClick={() => goToChapter(chapter)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "text-sm font-medium leading-none tracking-tight transition duration-200 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/50 focus-visible:ring-offset-4 focus-visible:ring-offset-background",
                  isActive
                    ? "text-foreground"
                    : "text-foreground/65 hover:text-foreground",
                )}
              >
                {label}
              </button>
            )
          })}
        </nav>

        <Link
          href={LOGIN_URL}
          className={cn(
            "inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-white px-5 sm:h-11 sm:px-6",
            "text-sm font-bold leading-none tracking-tight text-[#080c0b] transition duration-200 ease-out",
            "hover:bg-white/90 hover:shadow-[0_0_28px_-8px_rgba(255,255,255,0.5)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          Iniciar sesión
        </Link>
      </div>
    </header>
  )
}
