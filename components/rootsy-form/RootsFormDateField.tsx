"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import {
  rootsFormAffixPrefixClass,
  rootsFormControlTypographyClass,
  rootsFormDateCalendarClassNames,
  rootsFormDateCalendarShellClass,
  rootsFormDatePopoverContentClass,
  rootsFormDateTriggerClass,
  rootsFormPrefixedDateTriggerClass,
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
}

export function RootsFormDateField({
  label,
  id,
  value,
  onChange,
  placeholder = "Elegí una fecha",
  disabled,
  invalid,
  prefix,
  className,
  triggerClassName,
  popoverClassName,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const hasPrefix = prefix != null
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => parseRootsFormIsoDate(value), [value])
  const displayValue = selected ? formatRootsFormDisplayDate(selected) : null

  return (
    <RootsFormField label={label} htmlFor={fieldId} className={className}>
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
            aria-invalid={invalid}
            aria-haspopup="dialog"
            aria-expanded={open}
            data-state={open ? "open" : "closed"}
            className={cn(
              hasPrefix
                ? rootsFormPrefixedDateTriggerClass
                : rootsFormDateTriggerClass,
              triggerClassName,
            )}
          >
            {hasPrefix ? (
              <span className={rootsFormAffixPrefixClass} aria-hidden>
                {prefix}
              </span>
            ) : null}
            <span
              data-slot="date-value"
              data-placeholder={displayValue ? undefined : ""}
              className={cn(rootsFormControlTypographyClass, "truncate")}
            >
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
              onChange(toISODateLocal(date))
              setOpen(false)
            }}
            defaultMonth={selected}
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
