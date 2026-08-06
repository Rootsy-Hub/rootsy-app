"use client"

import {
  rootsFormControlTypographyClass,
  rootsFormSelectContentClassForTone,
  type RootsFormSelectTone,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import * as SelectPrimitive from "@radix-ui/react-select"
import type { ComponentProps } from "react"

type Props = ComponentProps<typeof SelectPrimitive.Content> & {
  tone?: RootsFormSelectTone
}

export function RootsFormSelectContent({
  className,
  children,
  position = "popper",
  side = "bottom",
  align = "start",
  sideOffset = 4,
  tone = "light",
  ...props
}: Props) {
  const isDark = tone === "dark"

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="roots-form-select-content"
        translate="no"
        className={cn(
          "relative z-50 overflow-hidden",
          !isDark && "bg-white dark:bg-white",
          position === "popper" && "data-[side=bottom]:translate-y-1",
          !isDark && rootsFormControlTypographyClass,
          rootsFormSelectContentClassForTone(tone),
          className,
        )}
        position={position}
        side={side}
        align={align}
        sideOffset={sideOffset}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            "p-0",
            position === "popper" &&
              "w-full min-w-(--radix-select-trigger-width) scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}
