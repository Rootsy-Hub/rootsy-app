"use client"

import { cn } from "@/lib/utils"
import { Check, ChevronRight } from "lucide-react"
import type { ComponentType, FocusEvent, MouseEvent } from "react"

const checkoutOptionCardFocusClass =
  "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]"

export function checkoutOptionCardShellClass(
  selected: boolean,
  disabled = false,
) {
  return cn(
    "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-150",
    checkoutOptionCardFocusClass,
    disabled && !selected && "pointer-events-none opacity-45",
    selected
      ? "border-[var(--rootsy-savia-400)] bg-[color-mix(in_srgb,var(--rootsy-savia-400)_8%,white)] ring-2 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_20%,transparent)]"
      : "border-[var(--rootsy-bruma-200)] bg-white hover:border-[var(--rootsy-bruma-300)] hover:bg-[var(--rootsy-bruma-50)] active:scale-[0.995]",
  )
}

export function checkoutOptionCardIconClass(selected: boolean) {
  return cn(
    "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
    selected
      ? "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_12%,white)] text-[var(--rootsy-savia-700)]"
      : "bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-500)] group-hover:bg-[var(--rootsy-bruma-100)] group-hover:text-[var(--rootsy-bruma-700)]",
  )
}

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
      className={checkoutOptionCardShellClass(selected, disabled)}
    >
      {Icon ? (
        <span className={checkoutOptionCardIconClass(selected)}>
          <Icon className="size-[18px]" aria-hidden />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-snug text-[var(--rootsy-bruma-900)]">
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block text-xs leading-snug text-[var(--rootsy-bruma-500)]">
            {subtitle}
          </span>
        ) : null}
      </span>
      {trailing === "check" && selected ? (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--rootsy-savia-600)] text-white">
          <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
        </span>
      ) : null}
      {trailing === "chevron" ? (
        <ChevronRight
          className={cn(
            "size-4 shrink-0",
            selected
              ? "text-[var(--rootsy-savia-600)]"
              : "text-[var(--rootsy-bruma-400)]",
          )}
          aria-hidden
        />
      ) : null}
    </button>
  )
}
