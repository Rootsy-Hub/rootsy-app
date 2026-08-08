import { cn } from "@/lib/utils"

/** Contenedor — surco suave en el header, sin borde ni sombra. */
export const menuSearchShellClass = cn(
  "relative rounded-xl transition-colors duration-150",
  "bg-foreground/[0.045]",
  "hover:bg-foreground/[0.06]",
  "focus-within:bg-foreground/[0.075]",
)

export const menuSearchInputClass = cn(
  "h-10 w-full appearance-none bg-transparent py-0 pl-11 pr-14 text-sm leading-10",
  "border-0 shadow-none outline-none ring-0",
  "text-foreground/88 placeholder:text-foreground/28",
  "[&::-webkit-search-cancel-button]:appearance-none",
  "[&::-webkit-search-decoration]:appearance-none",
)

export const menuSearchFieldIdleClass = "cursor-text"

export const menuSearchFieldActiveClass = "cursor-text"

export const menuSearchFieldIconClass = "text-foreground/28"

export const menuSearchShortcutClass =
  "font-mono text-[10px] tracking-wide text-foreground/22"

export const menuSearchClearButtonClass = cn(
  "flex size-7 items-center justify-center rounded-full transition-colors",
  "text-foreground/32 hover:text-foreground/70",
)
