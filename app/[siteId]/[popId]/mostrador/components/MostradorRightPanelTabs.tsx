"use client"

import type { MostradorRightPanelView } from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import { cn } from "@/lib/utils"
import { ClipboardList, ShoppingBag, type LucideIcon } from "lucide-react"
import { useCallback, useLayoutEffect, useRef, useState } from "react"

type TabDef = {
  id: MostradorRightPanelView
  label: string
  icon: LucideIcon
  disabled?: boolean
}

type Props = {
  value: MostradorRightPanelView
  onChange: (view: MostradorRightPanelView) => void
  cartDisabled?: boolean
}

export function MostradorRightPanelTabs({
  value,
  onChange,
  cartDisabled,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<
    Partial<Record<MostradorRightPanelView, HTMLButtonElement | null>>
  >({})
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })

  const tabs: TabDef[] = [
    { id: "detail", label: "Datos", icon: ClipboardList },
    {
      id: "cart",
      label: "Carrito",
      icon: ShoppingBag,
      disabled: cartDisabled,
    },
  ]

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
  }, [updateIndicator, cartDisabled])

  return (
    <div
      ref={containerRef}
      className="relative flex w-full shrink-0 border-b border-slate-200/90 bg-white"
      role="tablist"
      aria-label="Datos y carrito"
    >
      <span
        className={cn(
          "pointer-events-none absolute bottom-0 h-0.5 bg-slate-900",
          "transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
          indicator.ready ? "opacity-100" : "opacity-0",
        )}
        style={{ left: indicator.left, width: indicator.width }}
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
              "relative z-10 flex flex-1 items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold",
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
