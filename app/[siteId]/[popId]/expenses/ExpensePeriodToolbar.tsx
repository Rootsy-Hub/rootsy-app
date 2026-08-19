"use client"

import { RootsDefaultButton } from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  monthLabel: string
  loading: boolean
  isCurrentMonth: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

const navBtnClass = cn(
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
  "text-rootsy-bruma-500 transition-colors",
  "hover:bg-rootsy-bruma-100 hover:text-rootsy-bruma-900",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)]",
  "disabled:pointer-events-none disabled:opacity-40",
)

/** Navegación de mes — acción de sección, no isla. */
export function ExpensePeriodToolbar({
  monthLabel,
  loading,
  isCurrentMonth,
  onPrev,
  onNext,
  onToday,
}: Props) {
  return (
    <div
      className="flex flex-wrap items-center justify-end gap-2"
      role="toolbar"
      aria-label="Período de gastos"
    >
      {!isCurrentMonth ? (
        <RootsDefaultButton type="button" size="compact" onClick={onToday}>
          Mes actual
        </RootsDefaultButton>
      ) : null}
      <div
        className="inline-flex items-center rounded-xl border border-rootsy-bruma-200 bg-white p-0.5"
        role="group"
        aria-label="Navegación por mes"
      >
        <button
          type="button"
          className={navBtnClass}
          onClick={onPrev}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <div className="flex min-w-38 items-center justify-center gap-2 px-2 sm:min-w-42">
          <CalendarDays
            className="size-4 shrink-0 text-rootsy-bruma-500"
            aria-hidden
          />
          <span className="truncate font-canopy text-sm font-semibold capitalize text-rootsy-bruma-900">
            {loading ? "…" : monthLabel || "—"}
          </span>
        </div>
        <button
          type="button"
          className={navBtnClass}
          onClick={onNext}
          aria-label="Mes siguiente"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
