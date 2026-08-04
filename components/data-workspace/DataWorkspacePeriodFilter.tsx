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
  lightDateCalendarClass,
  lightDatePopoverContentClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  rootsFormAffixPrefixClass,
  rootsFormControlTypographyClass,
  rootsFormPrefixedDateTriggerClass,
  rootsFormPrefixedSelectTriggerClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { DataWorkspaceToolbarFieldLabel } from "@/components/data-workspace/DataWorkspaceToolbarFieldLabel"
import {
  DATA_WORKSPACE_DATE_QUICK_PRESETS,
  dataWorkspaceDateFilterSummary,
  isCompleteDateRange,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { es as esLocale } from "date-fns/locale"
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

const dateShortcutButtonClass = cn(
  "rounded-lg px-2.5 py-2 text-left text-sm text-[#44403c] transition-colors",
  "hover:bg-[#f5f5f0] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600/40",
)

const dateShortcutButtonActiveClass =
  "bg-[#f5f5f0] font-medium text-[#292524]"

const rootsFormFilterTriggerActiveClass =
  "!border-[#16704a] ring-2 ring-[#16704a]/20"

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
  /** `compact` toolbar inline; `layout` barra flush h-23 con RootsForm. */
  variant?: "panel" | "compact" | "layout"
  className?: string
}) {
  const autoLabelId = useId()
  const autoTriggerId = useId()
  const labelId = labelIdProp ?? autoLabelId
  const triggerId = triggerIdProp ?? autoTriggerId
  const isCompact = variant === "compact"
  const isLayout = variant === "layout"
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [pickerView, setPickerView] = useState<"shortcuts" | "calendar">(
    "shortcuts",
  )
  /** Rango en curso mientras el usuario elige inicio y fin en el calendario. */
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(
    undefined,
  )

  const resetDraftRange = () => {
    setDraftRange(preset === "custom" ? customRange : undefined)
  }

  const handlePopoverOpenChange = (open: boolean) => {
    setPopoverOpen(open)
    if (open) {
      resetDraftRange()
      return
    }
    setPickerView("shortcuts")
    setDraftRange(undefined)
  }

  useEffect(() => {
    if (!popoverOpen) return
    if (preset === "custom") {
      setPickerView("calendar")
    }
  }, [popoverOpen, preset])

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
    isLayout
      ? cn(
          rootsFormPrefixedDateTriggerClass,
          "cursor-pointer",
          active && rootsFormFilterTriggerActiveClass,
        )
      : dateFilterTriggerClass,
    isCompact
      ? "h-8 min-w-[12rem] max-w-[18rem] px-3 text-sm font-medium shadow-sm"
      : !isLayout && "min-w-0 shadow-xs",
    !isLayout && active && lightToolbarControlActiveClass,
  )

  const periodTrigger = isLayout ? (
    <button
      id={triggerId}
      type="button"
      className={triggerClass}
      data-state={popoverOpen ? "open" : "closed"}
      aria-expanded={popoverOpen}
      aria-haspopup="dialog"
      title={summary}
    >
      <span className={rootsFormAffixPrefixClass} aria-hidden>
        <CalendarRange className="size-4" />
      </span>
      <span
        data-slot="date-value"
        className={cn(rootsFormControlTypographyClass, "truncate")}
      >
        {summary}
      </span>
      <ChevronDown
        className={cn(
          "my-auto mr-3 size-4 shrink-0 text-[#78716c] transition-transform duration-200",
          popoverOpen && "rotate-180",
        )}
        aria-hidden
      />
    </button>
  ) : (
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
  )

  const handleCustomRangeSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      setDraftRange(undefined)
      return
    }

    setDraftRange(range)

    if (!isCompleteDateRange(range)) return

    onPresetChange("custom")
    onCustomRangeChange(range)
    setPopoverOpen(false)
  }

  const calendarSelected = popoverOpen
    ? draftRange
    : preset === "custom"
      ? customRange
      : undefined

  const filterControl = (
    <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>{periodTrigger}</PopoverTrigger>
      <PopoverContent
        align={isCompact ? "end" : "start"}
        side="bottom"
        sideOffset={isLayout ? 6 : 8}
        collisionPadding={20}
        className={cn(
          isLayout ? "z-50" : "z-[100]",
          "rounded-xl p-0",
          "w-[min(21.5rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)]",
          lightDatePopoverContentClass,
        )}
      >
        {pickerView === "calendar" ? (
          <div className="min-w-0 px-2.5 pb-3 pt-2">
            <div className={lightDateCalendarClass}>
              <Calendar
                locale={esLocale}
                mode="range"
                min={1}
                numberOfMonths={1}
                className={cn(
                  "w-full min-w-0 bg-transparent p-0",
                  isCompact ? "[--cell-size:2rem]" : "[--cell-size:2.125rem]",
                )}
                selected={calendarSelected}
                onSelect={handleCustomRangeSelect}
                defaultMonth={
                  draftRange?.from ??
                  customRange?.from ??
                  customRange?.to ??
                  new Date()
                }
              />
            </div>
          </div>
        ) : (
          <div>
            <div
              className={cn(
                "px-2 py-2",
                !isCompact && "border-b border-[#f5f5f0]",
              )}
            >
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a8a29e]">
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
                      dateShortcutButtonClass,
                      preset === "all" && dateShortcutButtonActiveClass,
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
                      dateShortcutButtonClass,
                      preset === p.id && dateShortcutButtonActiveClass,
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#f5f5f0] px-2 py-2">
              <button
                type="button"
                onClick={() => {
                  resetDraftRange()
                  setPickerView("calendar")
                }}
                className={cn(
                  "w-full",
                  dateShortcutButtonClass,
                  preset === "custom" && dateShortcutButtonActiveClass,
                )}
              >
                Rango personalizado…
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )

  if (isCompact) {
    return <div className={className}>{filterControl}</div>
  }

  if (isLayout) {
    return (
      <RootsFormField
        label="Período"
        htmlFor={triggerId}
        className={cn(dataWorkspaceListFiltersFieldClass(), className)}
      >
        {filterControl}
      </RootsFormField>
    )
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
