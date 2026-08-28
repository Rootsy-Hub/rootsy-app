"use client"

import {
  getFormCompositeInputStyle,
  getFormCompositeShellStyle,
  getFormLeadingPrefixStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import { useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import {
  rootsFormControlSelectionClassForTone,
  rootsFormPlaceholderClassForTone,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import { forwardRef, type ComponentProps, type ReactNode } from "react"

type Props = {
  prefix: ReactNode
  prefixClassName?: string
  id: string
  disabled?: boolean
  invalid?: boolean
  numeric?: boolean
  className?: string
  inputClassName?: string
} & Omit<ComponentProps<"input">, "id" | "className" | "prefix">

export const RootsFormPrefixedInput = forwardRef<HTMLInputElement, Props>(
  function RootsFormPrefixedInput(
    {
      prefix,
      prefixClassName,
      id,
      disabled,
      invalid,
      numeric = false,
      className,
      inputClassName,
      style,
      onFocus,
      onBlur,
      ...inputProps
    },
    ref,
  ) {
    const { state, interactionHandlers } = useRootsFormControlInteraction({ disabled, invalid })
    const tone = useRootsFormControlTone()
    const shellStyle = getFormCompositeShellStyle(state, { tone })
    const prefixStyle = getFormLeadingPrefixStyle(state, { numeric, tone })
    const inputStyle = getFormCompositeInputStyle(state, { numeric, tone })

    return (
      <div
        aria-invalid={invalid || undefined}
        className={cn("min-w-0", disabled && "pointer-events-none", className)}
        style={shellStyle}
        onMouseEnter={interactionHandlers.onMouseEnter}
        onMouseLeave={interactionHandlers.onMouseLeave}
      >
        <span className={prefixClassName} style={prefixStyle} aria-hidden>
          {prefix}
        </span>
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            "font-canopy disabled:cursor-not-allowed",
            rootsFormPlaceholderClassForTone(tone),
            rootsFormControlSelectionClassForTone(tone),
            inputClassName,
          )}
          style={{ ...inputStyle, ...style }}
          onFocus={(event) => {
            interactionHandlers.onFocus()
            onFocus?.(event)
          }}
          onBlur={(event) => {
            interactionHandlers.onBlur()
            onBlur?.(event)
          }}
          {...inputProps}
        />
      </div>
    )
  },
)
