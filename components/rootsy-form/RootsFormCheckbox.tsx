"use client"

import { getFormCheckboxStyle } from "@/components/rootsy-form/rootsFormSpecRuntime"
import { useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { forwardRef, type ComponentProps, type ElementRef } from "react"

type Props = ComponentProps<typeof Checkbox> & {
  invalid?: boolean
}

export const RootsFormCheckbox = forwardRef<ElementRef<typeof Checkbox>, Props>(
  function RootsFormCheckbox(
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
    const tone = useRootsFormControlTone()
    const isChecked = checked === true || checked === "indeterminate"
    const controlStyle = getFormCheckboxStyle(state, isChecked, { tone })

    return (
      <Checkbox
        ref={ref}
        data-slot="roots-form-checkbox"
        checked={checked}
        disabled={disabled}
        className={cn(
          "shrink-0 shadow-none ring-0 transition-none [&_[data-slot=checkbox-indicator]_svg]:size-2.5",
          className,
        )}
        style={{ ...controlStyle, ...style }}
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
      />
    )
  },
)
