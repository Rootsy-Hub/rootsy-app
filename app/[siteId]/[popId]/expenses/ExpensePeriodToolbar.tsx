"use client"

import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import {
  getFormSelectTriggerStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import {
  rootsFormDatePopoverContentClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarRange, ChevronDownIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useId, useState } from "react"

const MONTH_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const

const MONTH_LONG = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const

const periodSelectTriggerShellClass = "w-[14.5rem] max-w-[14.5rem] shrink-0"

type Props = {
  year: number
  month1: number
  loading?: boolean
  onChange: (next: { year: number; month: number }) => void
}

export function ExpensePeriodToolbar({
  year,
  month1,
  loading,
  onChange,
}: Props) {
  const triggerId = useId()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(year)
  const { state, interactionHandlers } = useRootsFormControlInteraction()

  useEffect(() => {
    if (open) setViewYear(year)
  }, [open, year])

  const label = loading ? "…" : `${MONTH_LONG[month1 - 1]} ${year}`
  const today = new Date()
  const thisYear = today.getFullYear()
  const thisMonth = today.getMonth() + 1

  return (
    <div className={periodSelectTriggerShellClass}>
      <RootsFormField
        label="Período"
        htmlFor={triggerId}
        className={cn(
          dataWorkspaceListFiltersFieldClass(),
          periodSelectTriggerShellClass,
        )}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              id={triggerId}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-label={`Período: ${label}`}
              className={cn(
                "w-full font-canopy text-sm font-normal leading-5",
                "flex items-center gap-2 p-0 pl-3",
                "[&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left",
              )}
              style={getFormSelectTriggerStyle(state, { inlineIcon: true })}
              onMouseEnter={interactionHandlers.onMouseEnter}
              onMouseLeave={interactionHandlers.onMouseLeave}
              onFocus={interactionHandlers.onFocus}
              onBlur={interactionHandlers.onBlur}
            >
              <span
                className="inline-flex shrink-0 items-center text-[var(--rootsy-bruma-500)] [&_svg]:size-4"
                aria-hidden
              >
                <CalendarRange />
              </span>
              <span data-slot="select-value">{label}</span>
              <ChevronDownIcon
                className="mr-0 size-4 shrink-0 text-[var(--rootsy-bruma-500)]"
                aria-hidden
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={4}
            collisionPadding={16}
            className={cn(rootsFormDatePopoverContentClass, "w-[14.5rem] p-3")}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-lg text-rootsy-bruma-500 transition-colors hover:bg-rootsy-bruma-100 hover:text-rootsy-bruma-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)]"
                aria-label="Año anterior"
                onClick={() => setViewYear((current) => current - 1)}
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <p className="font-canopy text-sm font-semibold text-rootsy-bruma-900">
                {viewYear}
              </p>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-lg text-rootsy-bruma-500 transition-colors hover:bg-rootsy-bruma-100 hover:text-rootsy-bruma-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)]"
                aria-label="Año siguiente"
                onClick={() => setViewYear((current) => current + 1)}
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {MONTH_SHORT.map((short, index) => {
                const month = index + 1
                const selected = viewYear === year && month === month1
                const isCurrent = viewYear === thisYear && month === thisMonth
                return (
                  <button
                    key={short}
                    type="button"
                    aria-pressed={selected}
                    className={cn(
                      "h-8 rounded-lg font-canopy text-xs font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)]",
                      selected
                        ? "bg-[var(--rootsy-savia-600)] text-white"
                        : isCurrent
                          ? "bg-rootsy-bruma-50 text-rootsy-bruma-900 hover:bg-rootsy-bruma-100"
                          : "text-rootsy-bruma-700 hover:bg-rootsy-bruma-50 hover:text-rootsy-bruma-900",
                    )}
                    onClick={() => {
                      onChange({ year: viewYear, month })
                      setOpen(false)
                    }}
                  >
                    {short}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      </RootsFormField>
    </div>
  )
}
