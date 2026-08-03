"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps } from "@/components/rootsy-form/rootsFormFieldContext"
import {
  rootsFormDiscountFieldShellClass,
  rootsFormDiscountInputClass,
  rootsFormDiscountSegmentButtonClass,
  rootsFormDiscountSegmentCellClass,
  rootsFormDiscountSegmentPillClass,
  rootsFormDiscountSegmentTrackClass,
  rootsFormDiscountSuffixClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { useMoneyInputField } from "@/components/rootsy-form/useMoneyInputField"
import { usePatternInputHandlers } from "@/components/rootsy-form/usePatternInputHandlers"
import {
  formatNonNegativeIntegerInput,
  INTEGER_INPUT_MAX_LEN,
  parseNonNegativeIntegerInput,
  sanitizeNonNegativeIntegerInput,
} from "@/lib/integerInput"
import { MONEY_INPUT_DISPLAY_MAX_LEN } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
import { useId } from "react"

export type RootsFormDiscountMode = "porcentaje" | "fijo"

type Props = {
  label: string
  id?: string
  mode: RootsFormDiscountMode
  onModeChange: (mode: RootsFormDiscountMode) => void
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  fixedAmountDisabled?: boolean
  invalid?: boolean
  maxPercent?: number
  className?: string
  inputClassName?: string
} & RootsFormFieldAssistProps

export function RootsFormDiscountField({
  label,
  id,
  mode,
  onModeChange,
  value,
  onChange,
  disabled,
  fixedAmountDisabled,
  invalid,
  hint,
  error,
  warning,
  success,
  maxPercent = 100,
  className,
  inputClassName,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const controlProps = useRootsFormFieldControlProps({ invalid })
  const isPercent = mode === "porcentaje"
  const valueDisabled =
    disabled || (!isPercent && Boolean(fixedAmountDisabled))

  const moneyHandlers = useMoneyInputField({
    value,
    onChange,
  })

  const percentHandlers = usePatternInputHandlers({
    value,
    onChange,
    sanitize: sanitizeNonNegativeIntegerInput,
    formatOnBlur: (current) => {
      if (!current.trim()) return ""
      const parsed = parseNonNegativeIntegerInput(current, Number.NaN)
      if (!Number.isFinite(parsed)) return ""
      return formatNonNegativeIntegerInput(Math.min(maxPercent, parsed))
    },
  })

  const handlePercentChange = (raw: string) => {
    const sanitized = sanitizeNonNegativeIntegerInput(raw)
    if (sanitized === "") {
      onChange("")
      return
    }
    const parsed = parseNonNegativeIntegerInput(sanitized, Number.NaN)
    if (!Number.isFinite(parsed)) {
      onChange("")
      return
    }
    onChange(formatNonNegativeIntegerInput(Math.min(maxPercent, parsed)))
  }

  return (
    <RootsFormField
      label={label}
      htmlFor={fieldId}
      className={className}
      hint={hint}
      error={error}
      warning={warning}
      success={success}
      invalid={invalid}
    >
      <div
        className={cn(
          rootsFormDiscountFieldShellClass,
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <div
          role="group"
          aria-label="Tipo de descuento"
          className={rootsFormDiscountSegmentTrackClass}
        >
          <div className={rootsFormDiscountSegmentCellClass}>
            {isPercent ? (
              <span aria-hidden className={rootsFormDiscountSegmentPillClass} />
            ) : null}
            <button
              type="button"
              disabled={disabled}
              aria-pressed={isPercent}
              aria-label="Porcentaje"
              className={rootsFormDiscountSegmentButtonClass(isPercent, disabled)}
              onClick={() => onModeChange("porcentaje")}
            >
              %
            </button>
          </div>
          <div className={rootsFormDiscountSegmentCellClass}>
            {!isPercent ? (
              <span aria-hidden className={rootsFormDiscountSegmentPillClass} />
            ) : null}
            <button
              type="button"
              disabled={disabled || fixedAmountDisabled}
              aria-pressed={!isPercent}
              aria-label="Monto fijo"
              className={rootsFormDiscountSegmentButtonClass(
                !isPercent,
                disabled || fixedAmountDisabled,
              )}
              onClick={() => onModeChange("fijo")}
            >
              $
            </button>
          </div>
        </div>
        <input
          ref={isPercent ? undefined : moneyHandlers.inputRef}
          id={fieldId}
          type="text"
          inputMode={isPercent ? "numeric" : "decimal"}
          autoComplete="off"
          value={value}
          maxLength={
            isPercent ? INTEGER_INPUT_MAX_LEN : MONEY_INPUT_DISPLAY_MAX_LEN
          }
          disabled={valueDisabled}
          aria-invalid={controlProps.isInvalid}
          aria-describedby={controlProps.describedBy}
          aria-label={
            isPercent ? "Porcentaje de descuento" : "Monto fijo de descuento"
          }
          placeholder={isPercent ? "0" : "0,00"}
          className={cn(rootsFormDiscountInputClass, inputClassName)}
          onMouseDown={isPercent ? undefined : moneyHandlers.handleMouseDown}
          onChange={
            isPercent
              ? (e) => handlePercentChange(e.target.value)
              : moneyHandlers.handleChange
          }
          onFocus={
            isPercent ? percentHandlers.handleFocus : moneyHandlers.handleFocus
          }
          onBlur={
            isPercent ? percentHandlers.handleBlur : moneyHandlers.handleBlur
          }
          onKeyDown={isPercent ? undefined : moneyHandlers.handleKeyDown}
          onPaste={isPercent ? undefined : moneyHandlers.handlePaste}
        />
        <span className={rootsFormDiscountSuffixClass} aria-hidden>
          {isPercent ? "%" : "$"}
        </span>
      </div>
    </RootsFormField>
  )
}
