"use client"

import type { MesaSalon } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { SALE_OPERATION_TAB_BAR_HEIGHT_CLASS } from "@/components/sale-operation/SaleOperationPanelTabs"
import { cn } from "@/lib/utils"
import { useCallback, useLayoutEffect, useRef, useState } from "react"

type Props = {
  salons: MesaSalon[]
  activeSalonId: string
  onChange: (salonId: string) => void
  tableCounts: Record<string, { total: number; open: number }>
}

function CountPill({
  value,
  variant,
  active,
  label,
}: {
  value: number
  variant: "open" | "total"
  active: boolean
  label: string
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 py-px text-[10px] font-semibold tabular-nums leading-none",
        variant === "open"
          ? "bg-amber-400/20 text-amber-200 ring-1 ring-amber-400/25"
          : active
            ? "bg-white/12 text-white/70 ring-1 ring-white/10"
            : "bg-white/[0.06] text-white/45 ring-1 ring-white/[0.08]",
      )}
      aria-label={label}
      title={label}
    >
      {value}
    </span>
  )
}

export function MesasSalonTabs({
  salons,
  activeSalonId,
  onChange,
  tableCounts,
}: Props) {
  const sorted = [...salons].sort((a, b) => a.sortOrder - b.sortOrder)
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Partial<Record<string, HTMLButtonElement | null>>>({})
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })

  const updateIndicator = useCallback(() => {
    const container = containerRef.current
    const tab = tabRefs.current[activeSalonId]
    if (!container || !tab) return
    const cRect = container.getBoundingClientRect()
    const tRect = tab.getBoundingClientRect()
    setIndicator({
      left: tRect.left - cRect.left,
      width: tRect.width,
      ready: true,
    })
  }, [activeSalonId])

  useLayoutEffect(() => {
    updateIndicator()
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(updateIndicator)
    ro.observe(container)
    return () => ro.disconnect()
  }, [updateIndicator, sorted.length, activeSalonId])

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden border-b border-white/10",
        SALE_OPERATION_TAB_BAR_HEIGHT_CLASS,
      )}
    >
      <div
        ref={containerRef}
        className={cn(
          "relative flex h-full w-full min-w-0",
          SALE_OPERATION_TAB_BAR_HEIGHT_CLASS,
        )}
        role="tablist"
        aria-label="Salones"
      >
        <span
          className={cn(
            "pointer-events-none absolute bottom-0 left-0 h-0.5 bg-white",
            "transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
            indicator.ready ? "opacity-100" : "opacity-0",
          )}
          style={{
            width: indicator.width,
            transform: `translateX(${indicator.left}px)`,
          }}
          aria-hidden
        />

        {sorted.map((salon) => {
          const active = salon.id === activeSalonId
          const counts = tableCounts[salon.id] ?? { total: 0, open: 0 }
          const openLabel = `${counts.open} mesa${counts.open === 1 ? "" : "s"} abierta${counts.open === 1 ? "" : "s"}`
          const totalLabel = `${counts.total} mesa${counts.total === 1 ? "" : "s"} en total`

          return (
            <button
              key={salon.id}
              ref={(el) => {
                tabRefs.current[salon.id] = el
              }}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`${salon.name}. ${counts.open > 0 ? `${openLabel}. ` : ""}${totalLabel}`}
              onClick={() => onChange(salon.id)}
              className={cn(
                "relative z-10 flex h-full min-w-0 flex-1 items-center justify-center px-4 text-sm font-semibold leading-none",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20",
                active ? "text-white" : "text-white/45 hover:text-white/75",
              )}
            >
              <span className="flex min-w-0 max-w-full items-center justify-center gap-1.5">
                <span className="truncate">{salon.name}</span>
                <span className="flex shrink-0 items-center gap-1" aria-hidden>
                {counts.open > 0 ? (
                  <CountPill
                    value={counts.open}
                    variant="open"
                    active={active}
                    label={openLabel}
                  />
                ) : null}
                <CountPill
                  value={counts.total}
                  variant="total"
                  active={active}
                  label={totalLabel}
                />
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
