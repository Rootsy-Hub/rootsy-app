"use client"

import {
  lightToolbarPanelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { DataWorkspaceToolbarFieldLabel } from "@/components/data-workspace/DataWorkspaceToolbarFieldLabel"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import {
  rootsFormDateCalendarClassNames,
  rootsFormDateCalendarShellClass,
  rootsFormDatePopoverContentClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover"
import {
  DATA_WORKSPACE_DATE_QUICK_PRESETS,
  dataWorkspaceDateFilterSummary,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es as esLocale } from "date-fns/locale"
import { CalendarRange } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { useEffect, useId, useMemo, useRef, useState } from "react"

const periodSelectContentClass =
  "!min-w-[14.5rem] !w-max !max-w-[min(22rem,calc(100vw-1.5rem))] [&>div:nth-child(2)]:!min-w-[14.5rem]"

const periodSelectTriggerShellClass = "w-[14.5rem] max-w-[14.5rem] shrink-0"

const periodSelectItemClass = "whitespace-nowrap"

export function DataWorkspacePeriodFilter({
  preset,
  customRange,
  onPresetChange,
  onCustomRangeChange,
  bounds,
  labelId: labelIdProp,
  triggerId: triggerIdProp,
  showActiveState = true,
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
  const isPanel = variant === "panel"
  const hideSelectLabel = isCompact || isPanel

  const [calendarOpen, setCalendarOpen] = useState(false)
  const [pendingCustomCalendar, setPendingCustomCalendar] = useState(false)
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(
    undefined,
  )
  const suppressCalendarDismissRef = useRef(false)
  const awaitingRangeEndRef = useRef(false)

  const blurTrigger = () => {
    window.requestAnimationFrame(() => {
      document.getElementById(triggerId)?.blur()
    })
  }

  const active = showActiveState && preset !== "this_month"
  const summary = useMemo(
    () => dataWorkspaceDateFilterSummary(preset, bounds),
    [preset, bounds],
  )

  const customRangeLabel =
    preset === "custom" && bounds.from && bounds.to
      ? summary
      : "Rango personalizado…"

  const queueCustomRangePicker = () => {
    setPendingCustomCalendar(true)
  }

  useEffect(() => {
    if (!pendingCustomCalendar) return

    const timer = window.setTimeout(() => {
      awaitingRangeEndRef.current = false
      setDraftRange(preset === "custom" ? customRange : undefined)
      suppressCalendarDismissRef.current = true
      setCalendarOpen(true)
      setPendingCustomCalendar(false)
      window.setTimeout(() => {
        suppressCalendarDismissRef.current = false
      }, 300)
    }, 120)

    return () => window.clearTimeout(timer)
  }, [pendingCustomCalendar, preset, customRange])

  const handlePresetChange = (value: string) => {
    if (value === "custom") {
      queueCustomRangePicker()
      return
    }

    onPresetChange(value as DataWorkspaceDatePreset)
    onCustomRangeChange(undefined)
    setCalendarOpen(false)
    blurTrigger()
  }

  const handleCustomRangeSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      setDraftRange(undefined)
      awaitingRangeEndRef.current = false
      return
    }

    if (!awaitingRangeEndRef.current) {
      setDraftRange({ from: range.from, to: undefined })
      awaitingRangeEndRef.current = true
      return
    }

    const start = draftRange?.from ?? range.from
    const end = range.to ?? range.from
    const from = start <= end ? start : end
    const to = start <= end ? end : start

    onPresetChange("custom")
    onCustomRangeChange({ from, to })
    setCalendarOpen(false)
    awaitingRangeEndRef.current = false
    blurTrigger()
  }

  const handleCalendarOpenChange = (open: boolean) => {
    if (!open && suppressCalendarDismissRef.current) return
    setCalendarOpen(open)
    if (!open) {
      setDraftRange(undefined)
      setPendingCustomCalendar(false)
      awaitingRangeEndRef.current = false
      blurTrigger()
    }
  }

  const handleSelectOpenChange = (open: boolean) => {
    if (!open) blurTrigger()
  }

  const isSelectingRangeEnd = Boolean(draftRange?.from && !draftRange?.to)

  const selectValue = preset
  const triggerLabel = summary

  const selectField = (
    <Popover open={calendarOpen} onOpenChange={handleCalendarOpenChange}>
      <PopoverAnchor asChild>
        <div
          className={cn(
            isCompact && periodSelectTriggerShellClass,
            !isCompact && "w-full min-w-0",
          )}
        >
          <RootsFormSelectField
            label="Período"
            id={triggerId}
            value={selectValue}
            onValueChange={handlePresetChange}
            onOpenChange={handleSelectOpenChange}
            placeholder="Este mes"
            valueLabel={triggerLabel}
            prefix={<CalendarRange className="size-4" aria-hidden />}
            prefixVariant="inline"
            className={cn(
              isLayout && dataWorkspaceListFiltersFieldClass(),
              hideSelectLabel && dataWorkspaceListFiltersFieldClass(true),
              isCompact && periodSelectTriggerShellClass,
              className,
            )}
            triggerClassName={cn(
              isCompact &&
                "w-full max-w-full [&_[data-slot=select-value]]:truncate",
            )}
            contentClassName={periodSelectContentClass}
          >
            {DATA_WORKSPACE_DATE_QUICK_PRESETS.map((item) => (
              <RootsFormSelectItem
                key={item.id}
                value={item.id}
                className={periodSelectItemClass}
              >
                {item.label}
              </RootsFormSelectItem>
            ))}
            <RootsFormSelectItem
              value="custom"
              className={periodSelectItemClass}
              onSelect={() => queueCustomRangePicker()}
            >
              {customRangeLabel}
            </RootsFormSelectItem>
          </RootsFormSelectField>
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="center"
        side="bottom"
        sideOffset={4}
        collisionPadding={16}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          if (suppressCalendarDismissRef.current || isSelectingRangeEnd) {
            event.preventDefault()
          }
        }}
        onPointerDownOutside={(event) => {
          if (suppressCalendarDismissRef.current || isSelectingRangeEnd) {
            event.preventDefault()
          }
        }}
        onFocusOutside={(event) => {
          if (isSelectingRangeEnd) {
            event.preventDefault()
          }
        }}
        className={cn(rootsFormDatePopoverContentClass, "p-0")}
      >
        <Calendar
          locale={esLocale}
          mode="range"
          numberOfMonths={1}
          selected={draftRange}
          onSelect={handleCustomRangeSelect}
          defaultMonth={
            draftRange?.from ??
            customRange?.from ??
            customRange?.to ??
            new Date()
          }
          className={rootsFormDateCalendarShellClass}
          classNames={rootsFormDateCalendarClassNames}
          formatters={{
            formatCaption: (date) => {
              const label = format(date, "LLLL yyyy", { locale: esLocale })
              return label.charAt(0).toUpperCase() + label.slice(1)
            },
          }}
        />
      </PopoverContent>
    </Popover>
  )

  if (isCompact || isLayout) {
    return selectField
  }

  return (
    <div className={cn(lightToolbarPanelClass, className)}>
      <DataWorkspaceToolbarFieldLabel
        htmlFor={triggerId}
        id={labelId}
        label="Período"
        meta={active ? "Activo" : undefined}
      />
      {selectField}
    </div>
  )
}
