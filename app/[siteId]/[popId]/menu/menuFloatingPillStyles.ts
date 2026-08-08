import { cn } from "@/lib/utils"

/** Cristal del header — reutilizado en navigator y dock. */
export const menuHeaderChromeClass =
  "bg-card/55 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-card/45"

export const menuHeaderBorderClass = "border-rootsy-hairline/80"

export const menuFloatingPillShellClass = cn(
  "menu-floating-pill rounded-xl border shadow-[0_8px_32px_rgba(0,0,0,0.16)]",
  menuHeaderBorderClass,
  menuHeaderChromeClass,
)

export const menuFloatingPillDotSelectedClass =
  "menu-floating-pill-dot--selected size-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.55)]"

export const menuFloatingPillDotIdleClass = "size-1.5 rounded-full bg-foreground/45"
