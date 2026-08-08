"use client"

import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useCardTiltHandlers } from "@/components/landing/hooks/useCardTiltHandlers"
import { cn } from "@/lib/utils"

type LandingInteractiveTileProps = {
  active?: boolean
  onSelect?: () => void
  className?: string
  children: ReactNode
} & Pick<ComponentPropsWithoutRef<"button">, "aria-label">

export function LandingInteractiveTile({
  active = false,
  onSelect,
  className,
  children,
  "aria-label": ariaLabel,
}: LandingInteractiveTileProps) {
  const tilt = useCardTiltHandlers()
  const sharedClass = cn(
    "group rootsy-card-tilt relative w-full overflow-hidden rounded-2xl border text-left transition-[box-shadow,border-color,transform] duration-300",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
    active
      ? "border-meadow/45 bg-card/60 shadow-[0_0_40px_-12px_rgba(16,185,129,0.45)] ring-1 ring-meadow/25"
      : "border-rootsy-hairline bg-card/40 hover:border-meadow/30 hover:bg-card/55 hover:shadow-[0_0_36px_-12px_rgba(16,185,129,0.35)]",
    className,
  )

  const shine = (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl motion-reduce:hidden"
      aria-hidden
    >
      <div
        className={cn(
          "absolute top-0 h-full w-[55%] skew-x-[-16deg] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-[left,opacity] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          "left-[-60%] group-hover:left-[125%] group-hover:opacity-90",
        )}
      />
    </div>
  )

  if (onSelect) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={active}
        onClick={onSelect}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className={cn(
          sharedClass,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {shine}
        {children}
      </button>
    )
  }

  return (
    <div
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className={sharedClass}
    >
      {shine}
      {children}
    </div>
  )
}
