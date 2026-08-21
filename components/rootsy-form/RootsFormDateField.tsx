"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps, useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import {
  getFormDateTriggerStyle,
  getFormDateValueStyle,
  getFormLeadingPrefixStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import {
  rootsFormDateCalendarClassNames,
  rootsFormDateCalendarShellClass,
  rootsFormDatePopoverContentClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toISODateLocal } from "@/lib/dataWorkspaceDateFilter"
import {
  formatRootsFormDisplayDate,
  formatRootsFormDisplayDateCompact,
  parseRootsFormIsoDate,
} from "@/lib/rootsFormDateFormat"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es as esLocale } from "date-fns/locale"
import { useId, useMemo, useRef, useState, type ReactNode } from "react"

type Props = {
  label: string
  id?: string
  value: string
  onChange: (iso: string) => void
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  prefix?: ReactNode
  className?: string
  triggerClassName?: string
  popoverClassName?: string
  /** `compact` → "11 ago 2026" para espacios angostos. */
  displayFormat?: "long" | "compact"
  /** ISO `yyyy-MM-dd`. Deshabilita días anteriores en el calendario. */
  minDate?: string
} & RootsFormFieldAssistProps

export function RootsFormDateField({
  label,
  id,
  value,
  onChange,
  placeholder = "Elegí una fecha",
  disabled,
  invalid,
  hint,
  labelInfo,
  error,
  warning,
  success,
  prefix,
  className,
  triggerClassName,
  popoverClassName,
  displayFormat = "long",
  minDate,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const hasPrefix = prefix != null
  const triggerRef = useRef<HTMLButtonElement>(null)
  const controlProps = useRootsFormFieldControlProps({ invalid })
  const tone = useRootsFormControlTone()
  const { state, interactionHandlers } = useRootsFormControlInteraction({
    disabled,
    invalid: controlProps.isInvalid,
  })
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => parseRootsFormIsoDate(value), [value])
  const minDay = useMemo(() => {
    if (!minDate || !/^\d{4}-\d{2}-\d{2}$/.test(minDate)) return undefined
    const [year, month, day] = minDate.split("-").map(Number)
    const local = new Date(year, month - 1, day)
    return Number.isNaN(local.getTime()) ? undefined : local
  }, [minDate])
  const displayValue = selected
    ? displayFormat === "compact"
      ? formatRootsFormDisplayDateCompact(selected)
      : formatRootsFormDisplayDate(selected)
    : null
  const triggerStyle = getFormDateTriggerStyle(state, { prefixed: hasPrefix, tone })
  const prefixStyle = hasPrefix ? getFormLeadingPrefixStyle(state, { tone }) : undefined
  const valueStyle = getFormDateValueStyle(state, {
    prefixed: hasPrefix,
    placeholder: !displayValue,
    tone,
  })

  return (
    <RootsFormField
      label={label}
      htmlFor={fieldId}
      className={className}
      hint={hint}
      labelInfo={labelInfo}
      error={error}
      warning={warning}
      success={success}
      invalid={invalid}
    >
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) {
            requestAnimationFrame(() => triggerRef.current?.blur())
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            id={fieldId}
            type="button"
            disabled={disabled}
            aria-invalid={controlProps.isInvalid}
            aria-describedby={controlProps.describedBy}
            aria-haspopup="dialog"
            aria-expanded={open}
            data-state={open ? "open" : "closed"}
            className={cn(
              "w-full font-canopy text-sm font-normal leading-5 disabled:pointer-events-none disabled:cursor-not-allowed",
              triggerClassName,
            )}
            style={triggerStyle}
            onMouseEnter={interactionHandlers.onMouseEnter}
            onMouseLeave={interactionHandlers.onMouseLeave}
            onFocus={interactionHandlers.onFocus}
            onBlur={interactionHandlers.onBlur}
          >
            {hasPrefix ? (
              <span style={prefixStyle} aria-hidden>
                {prefix}
              </span>
            ) : null}
            <span data-slot="date-value" data-placeholder={displayValue ? undefined : ""} style={valueStyle}>
              {displayValue ?? placeholder}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={4}
          className={cn(rootsFormDatePopoverContentClass, popoverClassName)}
        >
          <Calendar
            mode="single"
            locale={esLocale}
            selected={selected}
            onSelect={(date) => {
              if (!date) return
              if (minDay && date < minDay) return
              onChange(toISODateLocal(date))
              setOpen(false)
            }}
            defaultMonth={selected}
            startMonth={minDay}
            disabled={minDay ? { before: minDay } : undefined}
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
    </RootsFormField>
  )
}
