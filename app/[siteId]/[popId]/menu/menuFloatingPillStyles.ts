import { cn } from "@/lib/utils"

/** Cristal del header — reutilizado en navigator y dock. */
export const menuHeaderChromeClass =
  "bg-card/55 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-card/45"

export const menuHeaderBorderClass = "border-rootsy-hairline/80"

/** Altura fija compartida — header home y menú POP (80px). */
export const menuHeaderHeightClass = "h-20 shrink-0"

export const menuHeaderRowClass = cn(
  "grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,280px)_minmax(0,1fr)] items-center gap-4 px-6 sm:gap-6 sm:px-8",
)

/** Fila simple del header home — misma altura fija, layout de una sola banda. */
export const menuHeaderFlexRowClass = cn(
  "flex h-full min-h-0 items-center justify-between px-6 sm:px-8",
)

export const menuFloatingPillShellClass = cn(
  "menu-floating-pill rounded-xl border shadow-[0_8px_32px_rgba(0,0,0,0.16)]",
  menuHeaderBorderClass,
  menuHeaderChromeClass,
)

export const menuFloatingPillDotSelectedClass =
  "menu-floating-pill-dot--selected size-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.55)]"

export const menuFloatingPillDotIdleClass = "size-1.5 rounded-full bg-foreground/45"
