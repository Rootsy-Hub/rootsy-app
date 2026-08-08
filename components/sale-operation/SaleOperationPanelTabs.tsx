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
}

type Props<T extends string> = {
  value: T
  onChange: (view: T) => void
  tabs: SaleOperationPanelTab<T>[]
  ariaLabel: string
}

export function SaleOperationPanelTabs<T extends string>({
  value,
  onChange,
  tabs,
  ariaLabel,
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

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex w-full min-w-0 shrink-0 overflow-hidden border-b border-slate-200/90 bg-white",
        SALE_OPERATION_TAB_BAR_HEIGHT_CLASS,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      <span
        className={cn(
          "pointer-events-none absolute bottom-0 left-0 h-0.5 bg-slate-900",
          "transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
          indicator.ready ? "opacity-100" : "opacity-0",
        )}
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
        }}
        aria-hidden
      />
      {tabs.map(({ id, label, icon: Icon, disabled }) => {
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
            disabled={disabled}
            onClick={() => !disabled && onChange(id)}
            className={cn(
              "relative z-10 flex h-full min-w-0 flex-1 items-center justify-center gap-1.5 px-4 text-sm font-semibold leading-none",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-300",
              disabled && "cursor-not-allowed opacity-40",
              active ? "text-slate-900" : "text-slate-500 hover:text-slate-700",
            )}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden />
            {label}
          </button>
        )
      })}
    </div>
  )
}
