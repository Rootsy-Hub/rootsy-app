"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import {
  getFormInlineIconSearchInputStyle,
  getFormInlineIconSearchShellStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import { getFormUiInlineIconShellStyle } from "@/app/library/ui-components/formsUiHardcodedSpec"
import { useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import {
  rootsFormAffixClearButtonClassForTone,
  rootsFormControlSelectionClassForTone,
  rootsFormInlineIconPrefixClass,
  rootsFormPlaceholderClassForTone,
} from "@/components/rootsy-form/rootsFormStyles"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"
import { useId, type ComponentProps, type ReactNode, type RefObject } from "react"

const searchInputWithoutNativeClearClass =
  "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-moz-search-clear-button]:hidden"

type Props = {
  id?: string
  label?: string
  hideLabel?: boolean
  value: string
  onChange: ComponentProps<"input">["onChange"]
  onClear?: () => void
  placeholder?: string
  disabled?: boolean
  resultsSummary?: ReactNode
  className?: string
  /** `ghost` deja el cascarón sin relleno — borde e ícono siguen. */
  surface?: "solid" | "ghost"
  inputRef?: RefObject<HTMLInputElement | null>
  inputProps?: Omit<
    ComponentProps<"input">,
    "id" | "value" | "onChange" | "placeholder" | "ref" | "type" | "disabled"
  >
  clearButtonProps?: Omit<ComponentProps<"button">, "type" | "onClick" | "children">
}

export function RootsFormSearchField({
  id,
  label = "Buscar",
  hideLabel = false,
  value,
  onChange,
  onClear,
  placeholder = "Buscar…",
  disabled,
  resultsSummary,
  className,
  surface = "solid",
  inputRef,
  inputProps,
  clearButtonProps,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const hasValue = value.length > 0
  const { state, interactionHandlers } = useRootsFormControlInteraction({
    disabled,
  })
  const tone = useRootsFormControlTone()
  const styleOptions = { tone }
  const searchShellStyle = {
    ...getFormInlineIconSearchShellStyle(state, styleOptions),
    ...(surface === "ghost"
      ? { backgroundColor: "transparent", boxShadow: "none" }
      : {}),
  }
  const searchInputStyle = getFormInlineIconSearchInputStyle(state, styleOptions)
  const { iconColor } = getFormUiInlineIconShellStyle(state, styleOptions)

  return (
    <RootsFormField
      label={label}
      htmlFor={fieldId}
      className={cn(hideLabel && "[&_label]:sr-only", className)}
    >
      {resultsSummary ? (
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {resultsSummary}
        </span>
      ) : null}
      <div className="relative min-w-0 w-full">
        <div
          style={searchShellStyle}
          onMouseEnter={interactionHandlers.onMouseEnter}
          onMouseLeave={interactionHandlers.onMouseLeave}
        >
          <span
            className={rootsFormInlineIconPrefixClass}
            style={{ color: iconColor }}
            aria-hidden
          >
            <Search className="size-4" />
          </span>
          <input
            ref={inputRef}
            id={fieldId}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
            aria-label={hideLabel ? label : undefined}
            className={cn(
              "min-w-0 flex-1 bg-transparent font-canopy outline-none",
              rootsFormPlaceholderClassForTone(tone),
              rootsFormControlSelectionClassForTone(tone),
              searchInputWithoutNativeClearClass,
              hasValue && onClear && "pr-8",
            )}
            style={searchInputStyle}
            {...inputProps}
            onFocus={(event) => {
              interactionHandlers.onFocus()
              inputProps?.onFocus?.(event)
            }}
            onBlur={(event) => {
              interactionHandlers.onBlur()
              inputProps?.onBlur?.(event)
            }}
          />
        </div>
        {hasValue && onClear && !disabled ? (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            {...clearButtonProps}
            className={cn(
              rootsFormAffixClearButtonClassForTone(tone),
              "absolute right-1 top-1/2 -translate-y-1/2",
              clearButtonProps?.className,
            )}
            onMouseDown={(event) => {
              event.preventDefault()
              clearButtonProps?.onMouseDown?.(event)
            }}
            onClick={onClear}
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>
    </RootsFormField>
  )
}
