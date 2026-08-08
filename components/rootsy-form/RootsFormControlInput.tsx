"use client"

import {
  getFormTextControlStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import { rootsFormControlSelectionClass } from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import { forwardRef, type ComponentProps } from "react"

type Props = ComponentProps<"input"> & {
  invalid?: boolean
  inputClassName?: string
}

export const RootsFormControlInput = forwardRef<HTMLInputElement, Props>(
  function RootsFormControlInput(
    { className, inputClassName, disabled, invalid, style, onFocus, onBlur, onMouseEnter, onMouseLeave, ...props },
    ref,
  ) {
    const { state, interactionHandlers } = useRootsFormControlInteraction({ disabled, invalid })
    const controlStyle = getFormTextControlStyle(state)

    return (
      <input
        ref={ref}
        data-slot="roots-form-control-input"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          "font-canopy placeholder:text-[var(--rootsy-bruma-500)] disabled:pointer-events-none disabled:cursor-not-allowed",
          rootsFormControlSelectionClass,
          className,
          inputClassName,
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
          interactionHandlers.onFocus()
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
