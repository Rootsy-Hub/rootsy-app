"use client"

import type { MesaSalon } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { cn } from "@/lib/utils"

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
        "inline-flex min-w-[1.375rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums leading-none",
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

  return (
    <div
      className="flex shrink-0 overflow-x-auto border-b border-white/10"
      role="tablist"
      aria-label="Salones"
    >
      {sorted.map((salon, index) => {
        const active = salon.id === activeSalonId
        const counts = tableCounts[salon.id] ?? { total: 0, open: 0 }
        const openLabel = `${counts.open} mesa${counts.open === 1 ? "" : "s"} abierta${counts.open === 1 ? "" : "s"}`
        const totalLabel = `${counts.total} mesa${counts.total === 1 ? "" : "s"} en total`

        return (
          <button
            key={salon.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${salon.name}. ${counts.open > 0 ? `${openLabel}. ` : ""}${totalLabel}`}
            onClick={() => onChange(salon.id)}
            className={cn(
              "flex min-h-[3.25rem] min-w-[8rem] flex-1 items-center gap-2.5 px-4 py-2.5 text-left transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20",
              index > 0 && "border-l border-white/10",
              active
                ? "bg-white/[0.07] text-white"
                : "text-white/45 hover:bg-white/[0.03] hover:text-white/75",
            )}
          >
            <span
              className={cn(
                "min-w-0 flex-1 text-base font-semibold leading-tight",
                active ? "text-white" : "text-white/80",
              )}
            >
              {salon.name}
            </span>
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
          </button>
        )
      })}
    </div>
  )
}
