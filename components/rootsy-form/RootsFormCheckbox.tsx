"use client"

import { rootsFormCheckboxClass } from "@/components/rootsy-form/rootsFormStyles"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { forwardRef, type ComponentProps, type ElementRef } from "react"

type Props = ComponentProps<typeof Checkbox>

export const RootsFormCheckbox = forwardRef<
  ElementRef<typeof Checkbox>,
  Props
>(function RootsFormCheckbox({ className, ...props }, ref) {
  return (
    <Checkbox
      ref={ref}
      data-slot="roots-form-checkbox"
      className={cn(rootsFormCheckboxClass, className)}
      {...props}
    />
  )
})
