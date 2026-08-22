import { cn } from "@/lib/utils"

/** Anclado al suelo del planeta — esquina inferior izquierda. */
export const menuRootsyPresenceHostClass = cn(
  "pointer-events-none absolute z-[28]",
  "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-3",
  "md:bottom-0 md:left-5",
)

export const menuRootsyPresenceStageClass = cn(
  "relative flex flex-col items-start justify-end",
)

export const menuRootsyPresenceGroundClass = cn(
  "menu-rootsy-presence-ground pointer-events-none absolute bottom-0 left-3 z-0 hidden md:block md:left-4",
)

export const menuRootsyPresenceTriggerClass = cn(
  "menu-rootsy-presence-trigger group/rootsy pointer-events-auto relative z-[1] isolate flex items-end justify-center overflow-visible pb-1",
  "appearance-none border-0 bg-transparent p-0 shadow-none",
  "cursor-pointer transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]",
  "hover:scale-[1.02] active:scale-[0.99]",
  "outline-none focus:outline-none focus-visible:outline-none",
  "ring-0 focus:ring-0 focus-visible:ring-0",
  "disabled:pointer-events-none disabled:opacity-45",
)

export const menuRootsyPresenceImageClass = cn(
  "menu-rootsy-presence-image relative z-[1] pointer-events-none h-14 w-auto max-w-none object-contain object-bottom md:h-[10.5rem]",
  "drop-shadow-[0_10px_28px_rgba(0,0,0,0.42)]",
  "transition-[transform,filter] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]",
  "group-hover/rootsy:drop-shadow-[0_14px_34px_rgba(0,0,0,0.48)]",
)

export const menuRootsyPresencePanelClass = cn(
  "menu-rootsy-presence-panel pointer-events-auto absolute bottom-[calc(100%+0.35rem)] left-0 z-50 hidden w-[21rem] max-w-[calc(100vw-2rem)] md:block",
  "overflow-hidden rounded-2xl border border-[rgba(228,242,248,0.1)]",
  "bg-[linear-gradient(168deg,rgba(4,10,14,0.94)_0%,rgba(2,6,10,0.97)_100%)]",
  "backdrop-blur-[12px] backdrop-saturate-[1.02]",
  "shadow-[0_16px_40px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.06)]",
)

export const menuRootsyPresencePanelVoiceClass = cn(
  "text-[15px] leading-[1.55] tracking-[0.01em] text-[rgba(255,255,255,0.9)]",
  "font-normal antialiased",
)

export const menuRootsyPresenceVoiceLinkClass = cn(
  "mt-3 inline-block text-[13px] font-medium text-[rgba(196,230,248,0.88)]",
  "underline decoration-[rgba(196,230,248,0.35)] underline-offset-[3px]",
  "transition-colors duration-200",
  "hover:text-[rgba(228,242,248,0.98)] hover:decoration-[rgba(228,242,248,0.55)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,255,255,0.18)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
)

export const menuRootsyPresenceThinkingClass = cn(
  "text-[rgba(255,255,255,0.32)]",
)

export const menuRootsyPresenceVerMasClass = cn(
  "mt-3 inline-flex text-[13px] font-medium text-[rgba(196,230,248,0.88)]",
  "underline decoration-[rgba(196,230,248,0.35)] underline-offset-[3px]",
  "transition-colors duration-200",
  "hover:text-[rgba(228,242,248,0.98)] hover:decoration-[rgba(228,242,248,0.55)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,255,255,0.18)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
)

export const menuRootsyPresenceSheetBodyClass = cn(
  "rootsy-scroll-minimal min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5",
)

export const menuRootsyPresenceSheetExplanationClass = cn(
  "text-[15px] leading-[1.55] text-[rgba(255,255,255,0.88)]",
)

export const menuRootsyPresenceSheetExamplesClass = cn(
  "rounded-xl border border-[rgba(228,242,248,0.1)] bg-[rgba(255,255,255,0.04)]",
  "px-4 py-3 text-[15px] leading-[1.55] text-[rgba(228,242,248,0.92)]",
)
