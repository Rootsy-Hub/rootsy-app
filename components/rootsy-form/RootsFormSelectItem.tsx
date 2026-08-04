"use client"

import {
  rootsFormSelectItemClassForTone,
  type RootsFormSelectTone,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon } from "lucide-react"
import type { ComponentProps } from "react"

type Props = ComponentProps<typeof SelectPrimitive.Item> & {
  tone?: RootsFormSelectTone
}

export function RootsFormSelectItem({
  className,
  children,
  tone = "light",
  ...props
}: Props) {
  return (
    <SelectPrimitive.Item
      data-slot="roots-form-select-item"
      className={cn(rootsFormSelectItemClassForTone(tone), className)}
      {...props}
    >
      <SelectPrimitive.ItemText className="min-w-0 truncate">
        {children}
      </SelectPrimitive.ItemText>
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 right-3 flex w-4 items-center justify-center",
          tone === "dark" ? "text-emerald-300/90" : "text-zinc-500",
        )}
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" aria-hidden />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
}
