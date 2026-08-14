"use client"

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
import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  SUMMARY_DATE_PRESETS,
  summaryDateFilterSummary,
  type SummaryDatePreset,
} from "@/lib/summaryDateFilter"
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

export function SummaryPeriodToolbar({
  preset,
  customRange,
  onPresetChange,
  onCustomRangeChange,
  bounds,
  className,
}: {
  preset: SummaryDatePreset
  customRange: DateRange | undefined
  onPresetChange: (preset: SummaryDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  bounds: { from: string | null; to: string | null }
  className?: string
}) {
  const labelId = useId()
  const triggerId = useId()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [pendingCustomCalendar, setPendingCustomCalendar] = useState(false)
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(
    undefined,
  )
  const suppressCalendarDismissRef = useRef(false)
  const awaitingRangeEndRef = useRef(false)

  const summary = useMemo(
    () => summaryDateFilterSummary(preset, bounds),
    [preset, bounds],
  )

  const customRangeLabel =
    preset === "custom" && bounds.from && bounds.to
      ? summary
      : "Personalizado…"

  const blurTrigger = () => {
    window.requestAnimationFrame(() => {
      document.getElementById(triggerId)?.blur()
    })
  }

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

    onPresetChange(value as SummaryDatePreset)
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

  return (
    <div
      className={cn(
        dataWorkspaceShellCard,
        "flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5",
        className,
      )}
    >
      <div className="min-w-0">
        <p
          id={labelId}
          className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]"
        >
          Período
        </p>
        <p className="mt-0.5 text-sm font-medium text-[var(--rootsy-bruma-900)]">
          {summary}
        </p>
      </div>

      <div className={cn("relative flex shrink-0 items-center gap-2", periodSelectTriggerShellClass)}>
        <Popover open={calendarOpen} onOpenChange={handleCalendarOpenChange}>
          <PopoverAnchor asChild>
            <div className="w-full min-w-0">
              <RootsFormSelectField
                label="Período"
                id={triggerId}
                aria-labelledby={labelId}
                value={preset}
                onValueChange={handlePresetChange}
                onOpenChange={handleSelectOpenChange}
                placeholder="Este mes"
                valueLabel={summary}
                prefix={<CalendarRange className="size-4" aria-hidden />}
                prefixVariant="inline"
                triggerClassName="w-full max-w-full [&_[data-slot=select-value]]:truncate"
                contentClassName={periodSelectContentClass}
              >
                {SUMMARY_DATE_PRESETS.filter((item) => item.id !== "custom").map(
                  (item) => (
                    <RootsFormSelectItem
                      key={item.id}
                      value={item.id}
                      className={periodSelectItemClass}
                    >
                      {item.label}
                    </RootsFormSelectItem>
                  ),
                )}
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
            align="end"
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
              numberOfMonths={2}
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
      </div>
    </div>
  )
}
