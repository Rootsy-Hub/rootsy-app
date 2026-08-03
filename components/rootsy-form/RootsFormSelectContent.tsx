"use client"

import {
  rootsFormControlTypographyClass,
  rootsFormSelectContentClass,
} from "@/components/rootsy-form/rootsFormStyles"
import {
  SelectScrollDownButton,
  SelectScrollUpButton,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import * as SelectPrimitive from "@radix-ui/react-select"
import type { ComponentProps } from "react"

type Props = ComponentProps<typeof SelectPrimitive.Content>

export function RootsFormSelectContent({
  className,
  children,
  position = "popper",
  side = "bottom",
  align = "start",
  sideOffset = 4,
  ...props
}: Props) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="roots-form-select-content"
        className={cn(
          "relative z-50 overflow-hidden bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-white",
          position === "popper" && "data-[side=bottom]:translate-y-1",
          rootsFormControlTypographyClass,
          rootsFormSelectContentClass,
          className,
        )}
        position={position}
        side={side}
        align={align}
        sideOffset={sideOffset}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-0",
            position === "popper" &&
              "w-full min-w-(--radix-select-trigger-width) scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}
