import { eterHeaderMutedClass, eterHeaderTitleClass } from "@/lib/eter/eterChrome"
import { cn } from "@/lib/utils"

/** Campo de búsqueda — cristal de éter, incrustado en el header. */
export const menuSearchShellClass = cn(
  "relative overflow-hidden rounded-xl border",
  "border-[color-mix(in_srgb,var(--rootsy-eter-100)_14%,transparent)]",
  "bg-[linear-gradient(165deg,rgba(255,255,255,0.05)_0%,color-mix(in_srgb,var(--rootsy-eter-950)_40%,transparent)_100%)]",
  "backdrop-blur-md backdrop-saturate-[1.12]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  "transition-[border-color,background-color,box-shadow] duration-300",
  "hover:border-[color-mix(in_srgb,var(--rootsy-eter-100)_22%,transparent)]",
  "focus-within:border-[color-mix(in_srgb,var(--rootsy-eter-100)_28%,transparent)]",
  "focus-within:bg-[linear-gradient(165deg,rgba(255,255,255,0.07)_0%,color-mix(in_srgb,var(--rootsy-eter-950)_48%,transparent)_100%)]",
  "focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.12)]",
)

export const menuSearchInputClass = cn(
  "h-10 w-full appearance-none bg-transparent py-0 pl-11 pr-14 text-sm leading-10",
  "border-0 shadow-none outline-none ring-0",
  eterHeaderTitleClass,
  "font-normal",
  "placeholder:text-[color-mix(in_srgb,var(--rootsy-eter-100)_36%,transparent)]",
  "[&::-webkit-search-cancel-button]:appearance-none",
  "[&::-webkit-search-decoration]:appearance-none",
)

export const menuSearchFieldIdleClass = "cursor-text"

export const menuSearchFieldActiveClass = "cursor-text"

export const menuSearchFieldIconClass = eterHeaderMutedClass

export const menuSearchShortcutClass = cn(
  "font-mono text-[10px] tracking-wide",
  "text-[color-mix(in_srgb,var(--rootsy-eter-100)_28%,transparent)]",
)

export const menuSearchClearButtonClass = cn(
  "flex size-7 items-center justify-center rounded-full transition-colors",
  eterHeaderMutedClass,
  "hover:text-white/88",
)
