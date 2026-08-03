"use client"

import {
  rootsFormPrefixedSelectTriggerClass,
  rootsFormSelectTriggerClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import * as SelectPrimitive from "@radix-ui/react-select"
import { ChevronDownIcon } from "lucide-react"
import { forwardRef, type ComponentProps, type ElementRef } from "react"

type Props = ComponentProps<typeof SelectPrimitive.Trigger> & {
  prefixed?: boolean
}

export const RootsFormSelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  Props
>(function RootsFormSelectTrigger(
  { className, children, prefixed = false, ...props },
  ref,
) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="roots-form-select-trigger"
      className={cn(
        prefixed
          ? rootsFormPrefixedSelectTriggerClass
          : rootsFormSelectTriggerClass,
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-zinc-500 opacity-100",
            prefixed && "my-auto mr-3",
          )}
          aria-hidden
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
