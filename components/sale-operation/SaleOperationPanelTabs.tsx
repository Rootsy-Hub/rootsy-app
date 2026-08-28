"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { useCallback, useLayoutEffect, useRef, useState } from "react"

/** Altura compartida de tabs en Mesas / Mostrador (panel + salones). */
export const SALE_OPERATION_TAB_BAR_HEIGHT_CLASS = "h-11"

export type SaleOperationPanelTab<T extends string> = {
  id: T
  label: string
  icon: LucideIcon
  disabled?: boolean
  /** Número de pedido / mesa al lado del label. */
  suffix?: string
}

type Props<T extends string> = {
  value: T
  onChange: (view: T) => void
  tabs: SaleOperationPanelTab<T>[]
  ariaLabel: string
  /** Ticket operar (bruma) vs legacy slate/white. */
  variant?: "default" | "operar"
}

export function SaleOperationPanelTabs<T extends string>({
  value,
  onChange,
  tabs,
  ariaLabel,
  variant = "default",
}: Props<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Partial<Record<T, HTMLButtonElement | null>>>({})
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })

  const updateIndicator = useCallback(() => {
    const container = containerRef.current
    const tab = tabRefs.current[value]
    if (!container || !tab) return
    const cRect = container.getBoundingClientRect()
    const tRect = tab.getBoundingClientRect()
    setIndicator({
      left: tRect.left - cRect.left,
      width: tRect.width,
      ready: true,
    })
  }, [value])

  useLayoutEffect(() => {
    updateIndicator()
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(updateIndicator)
    ro.observe(container)
    return () => ro.disconnect()
  }, [updateIndicator, tabs])

  const isOperar = variant === "operar"

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex w-full min-w-0 shrink-0 overflow-x-hidden border-b",
        SALE_OPERATION_TAB_BAR_HEIGHT_CLASS,
        isOperar
          ? "border-[var(--layouts-operar-border-light)] bg-[var(--rootsy-bruma-100)]"
          : "border-slate-200/90 bg-white",
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      <span
        className={cn(
          "pointer-events-none absolute bottom-0 left-0 h-0.5",
          "transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
          indicator.ready ? "opacity-100" : "opacity-0",
          isOperar
            ? "bg-[var(--rootsy-savia-600)]"
            : "bg-slate-900",
        )}
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
        }}
        aria-hidden
      />
      {tabs.map(({ id, label, icon: Icon, disabled, suffix }) => {
        const active = value === id
        return (
          <button
            key={id}
            ref={(el) => {
              tabRefs.current[id] = el
            }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={suffix ? `${label} ${suffix}` : label}
            disabled={disabled}
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            onClick={() => !disabled && onChange(id)}
            className={cn(
              "relative z-10 flex h-full min-w-0 flex-1 items-center justify-center gap-1.5 px-4 text-sm font-semibold leading-5",
              "transition-colors duration-200",
              "outline-none ring-0",
              "focus:outline-none focus:ring-0 focus:shadow-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
              disabled && "cursor-not-allowed opacity-40",
              isOperar
                ? cn(
                    "focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_35%,transparent)]",
                    active
                      ? "text-[var(--rootsy-bruma-900)]"
                      : "text-[var(--rootsy-bruma-500)] hover:text-[var(--rootsy-bruma-700)]",
                  )
                : cn(
                    "focus-visible:ring-slate-300",
                    active ? "text-slate-900" : "text-slate-500 hover:text-slate-700",
                  ),
            )}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden />
            <span className="min-w-0">
              {label}
              {suffix ? (
                <span className="font-ledger font-bold tabular-nums"> {suffix}</span>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}
