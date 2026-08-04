"use client"

import {
  rootsFormSelectTriggerClassForTone,
  type RootsFormSelectTone,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import * as SelectPrimitive from "@radix-ui/react-select"
import { ChevronDownIcon } from "lucide-react"
import { forwardRef, type ComponentProps, type ElementRef } from "react"

type Props = ComponentProps<typeof SelectPrimitive.Trigger> & {
  prefixed?: boolean
  tone?: RootsFormSelectTone
}

export const RootsFormSelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  Props
>(function RootsFormSelectTrigger(
  { className, children, prefixed = false, tone = "light", ...props },
  ref,
) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="roots-form-select-trigger"
      className={cn(
        rootsFormSelectTriggerClassForTone(tone, prefixed),
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 opacity-100",
            tone === "dark" ? "text-[#d6d3d1]" : "text-[#78716c]",
            prefixed && "my-auto mr-3",
          )}
          aria-hidden
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
