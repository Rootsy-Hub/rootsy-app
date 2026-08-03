"use client"

import {
  rootsFormAffixFieldShellClass,
  rootsFormAffixInputClass,
  rootsFormAffixPrefixClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import { forwardRef, type ComponentProps, type ReactNode } from "react"

type Props = {
  prefix: ReactNode
  id: string
  disabled?: boolean
  invalid?: boolean
  className?: string
  inputClassName?: string
} & Omit<ComponentProps<"input">, "id" | "className" | "prefix">

export const RootsFormPrefixedInput = forwardRef<HTMLInputElement, Props>(
  function RootsFormPrefixedInput(
    {
      prefix,
      id,
      disabled,
      invalid,
      className,
      inputClassName,
      ...inputProps
    },
    ref,
  ) {
    return (
      <div
        className={cn(
          rootsFormAffixFieldShellClass,
          disabled && "pointer-events-none opacity-50",
          className,
        )}
      >
        <span className={rootsFormAffixPrefixClass} aria-hidden>
          {prefix}
        </span>
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(rootsFormAffixInputClass, inputClassName)}
          {...inputProps}
        />
      </div>
    )
  },
)
