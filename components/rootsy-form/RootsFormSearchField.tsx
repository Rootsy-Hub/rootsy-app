"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import {
  getFormInlineIconSearchInputStyle,
  getFormInlineIconSearchShellStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import {
  rootsFormAffixClearButtonClass,
  rootsFormControlSelectionClass,
  rootsFormInlineIconPrefixClass,
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
  inputRef?: RefObject<HTMLInputElement | null>
  inputProps?: Omit<
    ComponentProps<"input">,
    "id" | "value" | "onChange" | "placeholder" | "ref" | "type" | "disabled"
  >
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
  inputRef,
  inputProps,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const hasValue = value.length > 0
  const { state, interactionHandlers } = useRootsFormControlInteraction({
    disabled,
  })
  const searchShellStyle = getFormInlineIconSearchShellStyle(state)
  const searchInputStyle = getFormInlineIconSearchInputStyle(state)

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
          <span className={rootsFormInlineIconPrefixClass} aria-hidden>
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
              "min-w-0 flex-1 bg-transparent font-canopy placeholder:text-[var(--rootsy-bruma-500)] outline-none",
              rootsFormControlSelectionClass,
              searchInputWithoutNativeClearClass,
              hasValue && onClear && "pr-8",
            )}
            style={searchInputStyle}
            onFocus={interactionHandlers.onFocus}
            onBlur={interactionHandlers.onBlur}
            {...inputProps}
          />
        </div>
        {hasValue && onClear && !disabled ? (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            className={cn(
              rootsFormAffixClearButtonClass,
              "absolute right-1 top-1/2 -translate-y-1/2",
            )}
            onClick={onClear}
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>
    </RootsFormField>
  )
}
