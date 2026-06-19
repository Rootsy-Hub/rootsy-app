"use client"

import {
  LANDING_NAV,
  type LandingViewId,
} from "@/components/landing-backup/landingViews"
import { cn } from "@/lib/utils"

type LandingHudRailProps = {
  active: LandingViewId
  onSelect: (id: LandingViewId) => void
}

export function LandingHudRail({ active, onSelect }: LandingHudRailProps) {
  return (
    <nav
      className="pointer-events-auto fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 lg:block"
      aria-label="Capítulos"
    >
      <ul className="flex flex-col items-center gap-2 px-1 py-2">
        {LANDING_NAV.map((item) => {
          const isActive = active === item.id
          return (
            <li key={item.id}>
              <button
                type="button"
                className={cn(
                  "group relative flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/55",
                  !isActive && "hover:bg-white/6",
                )}
                aria-label={item.label}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelect(item.id)}
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-300 ease-out",
                    isActive
                      ? "h-6 w-1.5 bg-meadow shadow-[0_0_16px_rgba(52,211,153,0.65)]"
                      : "h-1.5 w-1.5 bg-foreground/28 group-hover:bg-foreground/55",
                  )}
                  aria-hidden
                />
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg border border-white/10 bg-card/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {item.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
