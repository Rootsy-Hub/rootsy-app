"use client"

import { rootsFormSelectItemClass } from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon } from "lucide-react"
import type { ComponentProps } from "react"

type Props = ComponentProps<typeof SelectPrimitive.Item>

export function RootsFormSelectItem({ className, children, ...props }: Props) {
  return (
    <SelectPrimitive.Item
      data-slot="roots-form-select-item"
      className={cn(rootsFormSelectItemClass, className)}
      {...props}
    >
      <SelectPrimitive.ItemText className="min-w-0 truncate">
        {children}
      </SelectPrimitive.ItemText>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex w-4 items-center justify-center text-zinc-500">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" aria-hidden />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
}
