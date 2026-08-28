"use client"

import {
  getFormSwitchThumbStyle,
  getFormSwitchTrackStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import { useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import { cn } from "@/lib/utils"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { forwardRef, type ComponentProps, type ElementRef } from "react"

type Props = ComponentProps<typeof SwitchPrimitive.Root> & {
  invalid?: boolean
}

export const RootsFormSwitch = forwardRef<
  ElementRef<typeof SwitchPrimitive.Root>,
  Props
>(function RootsFormSwitch(
  {
    className,
    style,
    disabled,
    invalid,
    checked,
    onFocus,
    onBlur,
    onMouseEnter,
    onMouseLeave,
    ...props
  },
  ref,
) {
  const { state, interactionHandlers } = useRootsFormControlInteraction({
    disabled,
    invalid,
  })
  const isOn = checked === true
  const tone = useRootsFormControlTone()
  const trackStyle = getFormSwitchTrackStyle(state, isOn, { tone })
  const thumbStyle = getFormSwitchThumbStyle(isOn, { tone })

  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="roots-form-switch"
      checked={checked}
      disabled={disabled}
      className={cn("shrink-0 ring-0", className)}
      style={{ ...trackStyle, ...style }}
      onMouseEnter={(event) => {
        interactionHandlers.onMouseEnter()
        onMouseEnter?.(event)
      }}
      onMouseLeave={(event) => {
        interactionHandlers.onMouseLeave()
        onMouseLeave?.(event)
      }}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) {
          interactionHandlers.onFocus()
        }
        onFocus?.(event)
      }}
      onBlur={(event) => {
        interactionHandlers.onBlur()
        onBlur?.(event)
      }}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="roots-form-switch-thumb"
        style={thumbStyle}
      />
    </SwitchPrimitive.Root>
  )
})
