"use client"

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Landmark } from "lucide-react"
import type { ReactNode } from "react"

type FieldSelectProps = {
  value: string
  onValueChange: (value: string) => void
  id?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  prefixClassName?: string
  prefixIcon?: ReactNode
  contentClassName?: string
  children: ReactNode
}

export function FieldSelect({
  value,
  onValueChange,
  id,
  placeholder,
  disabled,
  className,
  prefixClassName,
  prefixIcon,
  contentClassName,
  children,
}: FieldSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        className={cn(
          "min-h-11 w-full gap-0 overflow-hidden p-0 shadow-xs",
          "!h-11 items-stretch text-base",
          "data-[size=default]:!h-11 data-[size=sm]:!h-11",
          "data-[placeholder]:text-zinc-400 dark:data-[placeholder]:text-zinc-400",
          "[&_[data-slot=select-value]]:flex [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:items-center [&_[data-slot=select-value]]:px-3 [&_[data-slot=select-value]]:text-base [&_[data-slot=select-value]]:text-zinc-900",
          "[&>span:first-child]:shrink-0 [&>span:first-child_svg]:text-zinc-600 dark:[&>span:first-child_svg]:text-zinc-600",
          "[&>svg:last-child]:my-auto [&>svg:last-child]:mr-3 [&>svg:last-child]:size-4 [&>svg:last-child]:shrink-0 [&>svg:last-child]:self-center [&>svg:last-child]:text-zinc-500 [&>svg:last-child]:opacity-100",
          className,
        )}
      >
        <span
          className={cn(
            "flex h-full shrink-0 items-center self-stretch border-r border-border/70 bg-muted/35 px-3.5 py-0 text-zinc-600 dark:text-zinc-600",
            prefixClassName,
          )}
        >
          {prefixIcon ?? (
            <Landmark
              className="size-4 shrink-0 text-zinc-600 dark:text-zinc-600"
              aria-hidden
            />
          )}
        </span>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>{children}</SelectContent>
    </Select>
  )
}
