"use client"

import { rootsFormSwitchTrackClass } from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { forwardRef, type ComponentProps, type ElementRef } from "react"

type Props = ComponentProps<typeof SwitchPrimitive.Root>

export const RootsFormSwitch = forwardRef<
  ElementRef<typeof SwitchPrimitive.Root>,
  Props
>(function RootsFormSwitch({ className, ...props }, ref) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="roots-form-switch"
      className={cn(rootsFormSwitchTrackClass, className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="roots-form-switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.18)] ring-1 ring-black/5",
          "transition-transform duration-200 ease-out will-change-transform",
          "data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-5",
        )}
      />
    </SwitchPrimitive.Root>
  )
})
