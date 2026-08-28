"use client"

import {
  getFormTextControlStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import { useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import {
  rootsFormControlSelectionClassForTone,
  rootsFormPlaceholderClassForTone,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import { forwardRef, type ComponentProps } from "react"

type Props = ComponentProps<"textarea"> & {
  invalid?: boolean
  textareaClassName?: string
}

export const RootsFormControlTextarea = forwardRef<HTMLTextAreaElement, Props>(
  function RootsFormControlTextarea(
    {
      className,
      textareaClassName,
      disabled,
      invalid,
      style,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref,
  ) {
    const { state, interactionHandlers } = useRootsFormControlInteraction({ disabled, invalid })
    const tone = useRootsFormControlTone()
    const controlStyle = getFormTextControlStyle(state, { multiline: true, tone })

    return (
      <textarea
        ref={ref}
        data-slot="roots-form-control-textarea"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          "resize-y font-canopy leading-relaxed disabled:pointer-events-none disabled:cursor-not-allowed",
          rootsFormPlaceholderClassForTone(tone),
          rootsFormControlSelectionClassForTone(tone),
          className,
          textareaClassName,
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
