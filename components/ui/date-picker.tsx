"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  id,
  align = "start",
}: {
  value: string
  onChange: (iso: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  id?: string
  align?: "start" | "center" | "end"
}) {
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => parseIsoDate(value), [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-start gap-2 px-3 font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0 opacity-60" aria-hidden />
          {selected
            ? format(selected, "d MMM yyyy", { locale: esLocale })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side="top"
        sideOffset={8}
        collisionPadding={16}
        className="w-auto rounded-xl border border-border/80 bg-popover p-0 shadow-lg"
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
          className="bg-transparent p-3"
        />
      </PopoverContent>
    </Popover>
  )
}
