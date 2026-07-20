"use client"

import {
  lightToolbarButtonClass,
  lightToolbarFocusClass,
  lightToolbarShellClass,
  toolbarBlockLabelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
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

export function ExpensePeriodToolbar({
  monthLabel,
  loading,
  isCurrentMonth,
  onPrev,
  onNext,
  onToday,
}: Props) {
  const periodNavBtnClass = cn(
    "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
    "hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
    lightToolbarFocusClass,
  )

  return (
    <div
      className={cn(lightToolbarShellClass, "w-full shrink-0")}
      role="toolbar"
      aria-label="Período de gastos"
    >
      <div className="flex flex-col gap-4 px-4 py-3.5 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <span className={toolbarBlockLabelClass}>Período</span>
          <p className="mt-1 max-w-2xl text-sm leading-snug text-foreground/75">
            Los gastos se filtran por fecha de imputación. Los pagos cuentan para el
            avance aunque se registren en otro mes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {!isCurrentMonth ? (
            <button
              type="button"
              onClick={onToday}
              className={cn(lightToolbarButtonClass, "h-9 w-auto shrink-0 px-3")}
            >
              Mes actual
            </button>
          ) : null}
          <div
            className="inline-flex items-center rounded-lg border border-border/70 bg-background p-0.5 shadow-sm"
            role="group"
            aria-label="Navegación por mes"
          >
            <button
              type="button"
              className={periodNavBtnClass}
              onClick={onPrev}
              aria-label="Mes anterior"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <div className="flex min-w-38 items-center justify-center gap-2 px-2 sm:min-w-42">
              <CalendarDays
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="truncate text-sm font-semibold capitalize text-foreground">
                {loading ? "…" : monthLabel || "—"}
              </span>
            </div>
            <button
              type="button"
              className={periodNavBtnClass}
              onClick={onNext}
              aria-label="Mes siguiente"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
