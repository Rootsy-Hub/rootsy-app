import { cn } from "@/lib/utils"

/** Anclado al suelo del planeta — esquina inferior izquierda. */
export const menuRootsyPresenceHostClass = cn(
  "pointer-events-none absolute bottom-0 left-3 z-[28] sm:left-5",
)

export const menuRootsyPresenceStageClass = cn(
  "relative flex flex-col items-start justify-end",
)

export const menuRootsyPresenceGroundClass = "menu-rootsy-presence-ground"

export const menuRootsyPresenceTriggerClass = cn(
  "group/rootsy pointer-events-auto relative flex items-end justify-center overflow-visible",
  "border-0 bg-transparent p-0",
  "cursor-pointer transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]",
  "hover:scale-[1.02] active:scale-[0.99]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,255,255,0.22)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  "disabled:pointer-events-none disabled:opacity-45",
)

export const menuRootsyPresenceImageClass = cn(
  "menu-rootsy-presence-image pointer-events-none h-[8.75rem] w-auto max-w-none object-contain object-bottom sm:h-[10.5rem]",
  "drop-shadow-[0_10px_28px_rgba(0,0,0,0.42)]",
  "transition-[transform,filter] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]",
  "group-hover/rootsy:drop-shadow-[0_14px_34px_rgba(0,0,0,0.48)]",
)

export const menuRootsyPresencePanelClass = cn(
  "menu-rootsy-presence-panel pointer-events-auto absolute bottom-[calc(100%+0.35rem)] left-0 z-50 w-[19rem] max-w-[calc(100vw-2rem)]",
  "overflow-hidden rounded-xl border border-[rgba(228,242,248,0.12)]",
  "bg-[linear-gradient(168deg,rgba(4,10,14,0.96)_0%,rgba(2,6,10,0.98)_100%)]",
  "backdrop-blur-[10px] backdrop-saturate-[1.02]",
  "shadow-[0_16px_40px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.08)]",
)

export const menuRootsyPresencePanelTitleClass = cn(
  "text-[11px] font-semibold uppercase tracking-[0.1em]",
  "text-[rgba(255,255,255,0.52)]",
)

export const menuRootsyPresencePanelLeadClass = cn(
  "mt-2 text-sm leading-snug text-[rgba(255,255,255,0.88)]",
)

export const menuRootsyPresenceSuggestionsClass = cn(
  "mt-3.5 flex flex-wrap gap-2",
)

export const menuRootsyPresenceSuggestionClass = cn(
  "inline-flex items-center rounded-lg border border-[rgba(228,242,248,0.14)]",
  "bg-[linear-gradient(168deg,rgba(255,255,255,0.06)_0%,rgba(8,28,38,0.12)_100%)]",
  "px-2.5 py-1.5 text-[12px] font-medium leading-none text-[rgba(255,255,255,0.9)]",
  "transition-[background-color,border-color,transform] duration-200",
  "hover:border-[rgba(228,242,248,0.22)] hover:bg-[rgba(255,255,255,0.08)]",
  "active:scale-[0.98]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,255,255,0.18)]",
)
