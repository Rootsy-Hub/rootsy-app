"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  lightDateCalendarClass,
  lightDatePopoverContentClass,
  lightToolbarControlClass,
  lightToolbarFocusClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toISODateLocal } from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { es as esLocale } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { useMemo, useState } from "react"

function parseIsoDate(iso: string): Date | undefined {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return undefined
  const d = parseISO(iso.slice(0, 10))
  return Number.isNaN(d.getTime()) ? undefined : d
}

export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Elegí una fecha",
  className,
  prefixClassName,
  id,
  align = "start",
  light = false,
  variant = "button",
}: {
  value: string
  onChange: (iso: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  prefixClassName?: string
  id?: string
  align?: "start" | "center" | "end"
  /** Popover y calendario en tema claro (modales light, paneles de tesorería). */
  light?: boolean
  /** `field`: mismo estilo que inputs con prefijo (p. ej. montos). */
  variant?: "button" | "field"
}) {
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => parseIsoDate(value), [value])
  const displayValue = selected
    ? format(selected, "d MMM yyyy", { locale: esLocale })
    : placeholder

  const fieldTrigger = (
    <button
      type="button"
      id={id}
      disabled={disabled}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={cn(
        "flex h-11 w-full overflow-hidden rounded-md border border-input bg-background text-left shadow-xs transition-[color,box-shadow] outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        light && "border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] text-[var(--rootsy-bruma-900)] dark:border-[var(--rootsy-bruma-200)] dark:bg-[var(--rootsy-white)]",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-11 shrink-0 items-center border-r border-border/70 bg-muted/35 px-3.5 text-zinc-600 dark:text-zinc-600",
          light && "border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]",
          prefixClassName,
        )}
      >
        <CalendarIcon className="size-4 shrink-0" aria-hidden />
      </span>
      <span
        className={cn(
          "flex min-w-0 flex-1 items-center px-3 text-base",
          selected
            ? "text-foreground"
            : "text-muted-foreground",
          light && selected && "text-[var(--rootsy-bruma-900)] dark:text-[var(--rootsy-bruma-900)]",
          light && !selected && "text-[var(--rootsy-bruma-400)] dark:text-[var(--rootsy-bruma-400)]",
        )}
      >
        {displayValue}
      </span>
    </button>
  )

  const buttonTrigger = (
    <Button
      id={id}
      type="button"
      variant="outline"
      disabled={disabled}
      className={cn(
        "justify-start gap-2 px-3 font-normal",
        light && cn(lightToolbarControlClass, lightToolbarFocusClass),
        !selected && "text-muted-foreground",
        light && selected && "text-[var(--rootsy-bruma-900)] dark:text-[var(--rootsy-bruma-900)]",
        className,
      )}
    >
      <CalendarIcon className="size-4 shrink-0 opacity-60" aria-hidden />
      {displayValue}
    </Button>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === "field" ? fieldTrigger : buttonTrigger}
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side="top"
        sideOffset={8}
        collisionPadding={16}
        className={cn(
          "w-auto rounded-xl p-0 shadow-lg",
          light
            ? lightDatePopoverContentClass
            : "border border-border/80 bg-popover shadow-lg",
        )}
      >
        <div className={cn(light && "p-2", light && lightDateCalendarClass)}>
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
            className={cn(
              light ? "bg-transparent p-0" : "bg-transparent p-3",
              light &&
                "w-full min-w-0 [--cell-size:2.125rem] dark:bg-transparent",
            )}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
