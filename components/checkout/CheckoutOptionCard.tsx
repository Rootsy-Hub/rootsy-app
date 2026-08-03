"use client"

import { cn } from "@/lib/utils"
import { Check, ChevronRight } from "lucide-react"
import type { ComponentType, FocusEvent, MouseEvent } from "react"

type Props = {
  title: string
  subtitle?: string
  selected: boolean
  disabled?: boolean
  onClick: () => void
  onMouseEnter?: (event: MouseEvent<HTMLButtonElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLButtonElement>) => void
  onFocus?: (event: FocusEvent<HTMLButtonElement>) => void
  onBlur?: (event: FocusEvent<HTMLButtonElement>) => void
  icon?: ComponentType<{ className?: string }>
  trailing?: "chevron" | "check" | "none"
}

export function CheckoutOptionCard({
  title,
  subtitle,
  selected,
  disabled = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  icon: Icon,
  trailing = "none",
}: Props) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        disabled && !selected && "pointer-events-none opacity-45",
        selected
          ? "border-primary/45 bg-primary/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "border-border/70 bg-muted/15 hover:border-border hover:bg-muted/30 active:scale-[0.995]",
      )}
    >
      {Icon ? (
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
            selected
              ? "bg-primary/15 text-primary"
              : "bg-muted/50 text-muted-foreground group-hover:bg-muted/70 group-hover:text-foreground",
          )}
        >
          <Icon className="size-[18px]" aria-hidden />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-snug text-foreground">
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </span>
      {trailing === "check" && selected ? (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
        </span>
      ) : null}
      {trailing === "chevron" ? (
        <ChevronRight
          className={cn(
            "size-4 shrink-0",
            selected ? "text-primary" : "text-muted-foreground/70",
          )}
          aria-hidden
        />
      ) : null}
    </button>
  )
}
