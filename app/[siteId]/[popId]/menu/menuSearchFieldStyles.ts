import { menuRealmLightMutedClass, menuRealmLightStaticClass } from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"

/** Campo de búsqueda — cristal del reinado, incrustado en el header. */
export const menuSearchShellClass = cn(
  "relative overflow-hidden rounded-xl border",
  "border-[rgba(228,242,248,0.14)]",
  "bg-[linear-gradient(165deg,rgba(255,255,255,0.05)_0%,rgba(8,28,38,0.08)_100%)]",
  "backdrop-blur-md backdrop-saturate-[1.12]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  "transition-[border-color,background-color,box-shadow] duration-300",
  "hover:border-[rgba(228,242,248,0.22)]",
  "focus-within:border-[rgba(228,242,248,0.28)]",
  "focus-within:bg-[linear-gradient(165deg,rgba(255,255,255,0.07)_0%,rgba(8,28,38,0.1)_100%)]",
  "focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.12)]",
)

export const menuSearchInputClass = cn(
  "h-10 w-full appearance-none bg-transparent py-0 pl-11 pr-14 text-sm leading-10",
  "border-0 shadow-none outline-none ring-0",
  menuRealmLightStaticClass,
  "placeholder:text-[rgba(255,255,255,0.36)]",
  "[&::-webkit-search-cancel-button]:appearance-none",
  "[&::-webkit-search-decoration]:appearance-none",
)

export const menuSearchFieldIdleClass = "cursor-text"

export const menuSearchFieldActiveClass = "cursor-text"

export const menuSearchFieldIconClass = menuRealmLightMutedClass

export const menuSearchShortcutClass = cn(
  "font-mono text-[10px] tracking-wide",
  "text-[rgba(255,255,255,0.28)]",
)

export const menuSearchClearButtonClass = cn(
  "flex size-7 items-center justify-center rounded-full transition-colors",
  menuRealmLightMutedClass,
  "hover:text-[rgba(255,255,255,0.88)]",
)
