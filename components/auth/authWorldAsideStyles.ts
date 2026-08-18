import { cn } from "@/lib/utils"

export const authWorldAsideClass =
  "auth-world-aside relative flex h-full min-h-dvh flex-col justify-between p-10 xl:p-14"

/** Nota de información — panel holográfico del valle. */
export const authWorldAsideNoteClass = "auth-world-aside-note relative z-[1] max-w-[22rem]"

export const authWorldAsideNoteContentClass = "auth-world-aside-note-content relative z-[1]"

export const authWorldAsideWorldLineClass = cn(
  "text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(56,189,248,0.95)]",
)

export const authWorldAsideTitleClass = cn(
  "font-semibold tracking-[-0.02em] text-[rgba(12,45,58,0.94)]",
  "text-[1.65rem] leading-[1.16] xl:text-[2rem] xl:leading-[1.12]",
)

export const authWorldAsideLeadClass = cn(
  "text-[0.92rem] leading-relaxed text-[rgba(15,58,78,0.78)]",
)
