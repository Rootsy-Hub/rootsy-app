"use client"

import {
  getFormLeadingPrefixStyle,
  getFormSelectChevronWrapStyle,
  getFormSelectTriggerStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import {
  rootsFormSelectTriggerClassForTone,
  type RootsFormSelectTone,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import * as SelectPrimitive from "@radix-ui/react-select"
import { ChevronDownIcon } from "lucide-react"
import { forwardRef, type ComponentProps, type ElementRef, type ReactNode } from "react"

type Props = ComponentProps<typeof SelectPrimitive.Trigger> & {
  prefixed?: boolean
  prefixVariant?: "sunken" | "inline"
  leadingPrefix?: ReactNode
  invalid?: boolean
  readOnly?: boolean
  tone?: RootsFormSelectTone
}

const selectValueLayoutClass = cn(
  "[&_[data-slot=select-value]]:flex [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:items-center [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left",
  "[&_[data-slot=select-value][data-placeholder]]:text-[var(--rootsy-bruma-500)]",
)

export const RootsFormSelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  Props
>(function RootsFormSelectTrigger(
  {
    className,
    style,
    children,
    prefixed = false,
    prefixVariant = "sunken",
    leadingPrefix,
    invalid,
    readOnly,
    tone = "light",
    disabled,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const inlineIcon = prefixed && prefixVariant === "inline"
  const sunkenPrefix = prefixed && prefixVariant === "sunken"
  const isLocked = Boolean(disabled || readOnly)
  const { state, interactionHandlers } = useRootsFormControlInteraction({
    disabled: disabled && !readOnly,
    readonly: readOnly,
    invalid,
  })

  const useSpecStyles = tone === "light"
  const triggerStyle = useSpecStyles
    ? getFormSelectTriggerStyle(state, {
        prefixed: sunkenPrefix,
        inlineIcon,
      })
    : undefined

  const prefixStyle =
    useSpecStyles && sunkenPrefix && leadingPrefix
      ? getFormLeadingPrefixStyle(state)
      : undefined

  const chevronWrapStyle =
    useSpecStyles && sunkenPrefix ? getFormSelectChevronWrapStyle(state) : undefined

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="roots-form-select-trigger"
      translate="no"
      disabled={isLocked}
      aria-readonly={readOnly || undefined}
      className={cn(
        useSpecStyles
          ? cn(
              "w-full font-canopy text-sm font-normal leading-5 disabled:pointer-events-none disabled:cursor-not-allowed",
              readOnly && "disabled:opacity-100",
            )
          : rootsFormSelectTriggerClassForTone(tone, prefixed, prefixVariant),
        useSpecStyles && sunkenPrefix && cn("gap-0 p-0", selectValueLayoutClass, "[&_[data-slot=select-value]]:px-3"),
        useSpecStyles && inlineIcon && cn("gap-2 p-0 pl-3", selectValueLayoutClass),
        useSpecStyles && !prefixed && selectValueLayoutClass,
        className,
      )}
      style={triggerStyle ? { ...triggerStyle, ...style } : style}
      onMouseEnter={(event) => {
        if (useSpecStyles) interactionHandlers.onMouseEnter()
        onMouseEnter?.(event)
      }}
      onMouseLeave={(event) => {
        if (useSpecStyles) interactionHandlers.onMouseLeave()
        onMouseLeave?.(event)
      }}
      onFocus={(event) => {
        if (useSpecStyles) interactionHandlers.onFocus()
        onFocus?.(event)
      }}
      onBlur={(event) => {
        if (useSpecStyles) interactionHandlers.onBlur()
        onBlur?.(event)
      }}
      {...props}
    >
      {leadingPrefix && sunkenPrefix ? (
        <span style={prefixStyle} aria-hidden>
          {leadingPrefix}
        </span>
      ) : leadingPrefix ? (
        <span className="inline-flex shrink-0 items-center text-[var(--rootsy-bruma-500)] [&_svg]:size-4" aria-hidden>
          {leadingPrefix}
        </span>
      ) : null}
      {children}
      <SelectPrimitive.Icon asChild>
        {sunkenPrefix && useSpecStyles ? (
          <span style={chevronWrapStyle}>
            <ChevronDownIcon className="size-3 shrink-0" aria-hidden />
          </span>
        ) : (
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-[var(--rootsy-bruma-500)]",
              inlineIcon ? "mr-0" : sunkenPrefix && "my-auto mr-3",
            )}
            aria-hidden
          />
        )}
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
