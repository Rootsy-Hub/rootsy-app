import { cn } from "@/lib/utils"

export const authWorldAsideClass =
  "auth-world-aside relative flex h-full min-h-dvh flex-col justify-between p-10 xl:p-14"

/** Copy de marketing — tipografía editorial, sin caja. */
export const authMarketingPitchClass = "auth-marketing-pitch relative z-[1] max-w-[22rem]"

export const authMarketingKickerClass = cn(
  "text-[11px] font-bold uppercase tracking-[0.16em] text-rootsy-savia-300",
  "drop-shadow-[0_1px_10px_rgba(7,10,9,0.72)]",
)

export const authMarketingTitleClass = cn(
  "font-semibold tracking-tight text-white",
  "text-[1.8rem] leading-[1.15] xl:text-[2.25rem] xl:leading-[1.1]",
  "drop-shadow-[0_2px_28px_rgba(7,10,9,0.78)]",
  "[text-shadow:0_1px_3px_rgba(7,10,9,0.65)]",
)

export const authMarketingLeadClass = cn(
  "text-[0.94rem] leading-relaxed text-white/90",
  "drop-shadow-[0_1px_18px_rgba(7,10,9,0.75)]",
  "[text-shadow:0_1px_2px_rgba(7,10,9,0.55)]",
)
