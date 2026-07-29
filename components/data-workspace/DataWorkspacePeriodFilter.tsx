"use client"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  lightToolbarControlActiveClass,
  lightToolbarFocusClass,
  lightToolbarPanelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceToolbarFieldLabel } from "@/components/data-workspace/DataWorkspaceToolbarFieldLabel"
import {
  DATA_WORKSPACE_DATE_QUICK_PRESETS,
  dataWorkspaceDateFilterSummary,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { es as esLocale } from "date-fns/locale"
import { isSameDay } from "date-fns"
import { CalendarRange, ChevronDown } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { useEffect, useId, useMemo, useState } from "react"

const lightToolbarControlClass =
  "h-11 w-full max-w-full rounded-md border-border/60 bg-muted/25 text-sm text-foreground shadow-sm transition-[color,background-color,border-color,box-shadow] duration-150 hover:bg-muted/40"

const dateFilterTriggerClass = cn(
  lightToolbarControlClass,
  "justify-between gap-2 px-3 font-normal",
  lightToolbarFocusClass,
)

const datePopoverContentClass =
  "border border-zinc-200/90 bg-white text-zinc-950 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"

const dateCalendarLightClass =
  "[&_.rdp-month]:w-full min-w-0 [&_.rdp-month_grid]:w-full [&_.rdp-month_grid]:table-fixed"

export function DataWorkspacePeriodFilter({
  preset,
  customRange,
  onPresetChange,
  onCustomRangeChange,
  bounds,
  labelId: labelIdProp,
  triggerId: triggerIdProp,
  showActiveState = true,
  hideAllPreset = false,
  variant = "panel",
  className,
}: {
  preset: DataWorkspaceDatePreset
  customRange: DateRange | undefined
  onPresetChange: (preset: DataWorkspaceDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  bounds: { from: string | null; to: string | null }
  labelId?: string
  triggerId?: string
  /** Si es false, el período no se resalta como filtro activo (p. ej. siempre hay uno elegido). */
  showActiveState?: boolean
  /** Oculta la opción «Todas las fechas». */
  hideAllPreset?: boolean
  /** `compact` para toolbar inline sin panel ni etiqueta. */
  variant?: "panel" | "compact"
  className?: string
}) {
  const autoLabelId = useId()
  const autoTriggerId = useId()
  const labelId = labelIdProp ?? autoLabelId
  const triggerId = triggerIdProp ?? autoTriggerId
  const isCompact = variant === "compact"
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [compactView, setCompactView] = useState<"shortcuts" | "calendar">(
    "shortcuts",
  )

  useEffect(() => {
    if (!popoverOpen) {
      setCompactView("shortcuts")
      return
    }
    if (isCompact && preset === "custom") {
      setCompactView("calendar")
    }
  }, [popoverOpen, isCompact, preset])

  const active = showActiveState && preset !== "all"
  const summary = useMemo(
    () => dataWorkspaceDateFilterSummary(preset, bounds),
    [preset, bounds],
  )

  const clear = () => {
    onPresetChange("all")
    onCustomRangeChange(undefined)
  }

  const triggerClass = cn(
    dateFilterTriggerClass,
    isCompact
      ? "h-8 min-w-[12rem] max-w-[18rem] px-3 text-sm font-medium shadow-sm"
      : "min-w-0 shadow-xs",
    active && lightToolbarControlActiveClass,
  )

  const handleCustomRangeSelect = (range: DateRange | undefined) => {
    onPresetChange("custom")
    onCustomRangeChange(range)
    if (
      range?.from &&
      range?.to &&
      !isSameDay(range.from, range.to)
    ) {
      setPopoverOpen(false)
    }
  }

  const filterControl = (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          id={triggerId}
          type="button"
          variant="outline"
          size={isCompact ? "sm" : "default"}
          className={triggerClass}
          aria-expanded={popoverOpen}
          aria-haspopup="dialog"
          aria-labelledby={isCompact ? undefined : labelId}
          title={summary}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            <CalendarRange
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-left text-foreground">
              {summary}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              popoverOpen && "rotate-180",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={isCompact ? "end" : "start"}
        side="bottom"
        sideOffset={8}
        collisionPadding={20}
        className={cn(
          "z-[100] rounded-xl p-0",
          "w-[min(21.5rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)]",
          datePopoverContentClass,
        )}
      >
        {isCompact && compactView === "calendar" ? (
          <div className="min-w-0 px-2.5 pb-3 pt-2">
            <div className={dateCalendarLightClass}>
              <Calendar
                locale={esLocale}
                mode="range"
                min={1}
                numberOfMonths={1}
                className="w-full min-w-0 bg-transparent p-0 [--cell-size:2rem]"
                selected={preset === "custom" ? customRange : undefined}
                onSelect={handleCustomRangeSelect}
                defaultMonth={
                  customRange?.from ?? customRange?.to ?? new Date()
                }
              />
            </div>
          </div>
        ) : (
          <div>
            <div
              className={cn(
                "px-2 py-2",
                !isCompact && "border-b border-zinc-100 dark:border-zinc-800",
              )}
            >
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Atajos
              </p>
              <div
                className={cn(
                  "gap-0.5",
                  isCompact ? "grid grid-cols-2" : "flex flex-col",
                )}
              >
                {!hideAllPreset ? (
                  <button
                    type="button"
                    onClick={() => {
                      clear()
                      setPopoverOpen(false)
                    }}
                    className={cn(
                      "rounded-lg px-2.5 py-2 text-left text-sm text-zinc-800 transition-colors dark:text-zinc-200",
                      "hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600/40 dark:hover:bg-zinc-800",
                      preset === "all" &&
                        "bg-zinc-100 font-medium text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50",
                      isCompact && "col-span-2",
                    )}
                  >
                    Todas las fechas
                  </button>
                ) : null}
                {DATA_WORKSPACE_DATE_QUICK_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onPresetChange(p.id)
                      onCustomRangeChange(undefined)
                      setPopoverOpen(false)
                    }}
                    className={cn(
                      "rounded-lg px-2.5 py-2 text-left text-sm text-zinc-800 transition-colors dark:text-zinc-200",
                      "hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600/40 dark:hover:bg-zinc-800",
                      preset === p.id &&
                        "bg-zinc-100 font-medium text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {isCompact ? (
              <div className="border-t border-zinc-100 px-2 py-2 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCompactView("calendar")}
                  className={cn(
                    "w-full rounded-lg px-2.5 py-2 text-left text-sm text-zinc-800 transition-colors dark:text-zinc-200",
                    "hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600/40 dark:hover:bg-zinc-800",
                    preset === "custom" &&
                      "bg-zinc-100 font-medium text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50",
                  )}
                >
                  Rango personalizado…
                </button>
              </div>
            ) : (
              <div className="min-w-0 border-t border-zinc-100 px-2.5 pb-3 pt-2 dark:border-zinc-800">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Rango personalizado
                </p>
                <div className={dateCalendarLightClass}>
                  <Calendar
                    locale={esLocale}
                    mode="range"
                    min={1}
                    numberOfMonths={1}
                    className="w-full min-w-0 bg-transparent p-0 [--cell-size:2.125rem]"
                    selected={preset === "custom" ? customRange : undefined}
                    onSelect={handleCustomRangeSelect}
                    defaultMonth={
                      customRange?.from ?? customRange?.to ?? new Date()
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )

  if (isCompact) {
    return <div className={className}>{filterControl}</div>
  }

  return (
    <div className={cn(lightToolbarPanelClass, className)}>
      <DataWorkspaceToolbarFieldLabel
        id={labelId}
        label="Período"
        meta={active ? "Activo" : undefined}
      />
      {filterControl}
    </div>
  )
}
