"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps } from "@/components/rootsy-form/rootsFormFieldContext"
import {
  rootsFormAffixFieldShellClass,
  rootsFormAffixInputClass,
  rootsFormDiscountModeButtonClass,
  rootsFormDiscountModePrefixClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { useMoneyInputField } from "@/components/rootsy-form/useMoneyInputField"
import { usePatternInputHandlers } from "@/components/rootsy-form/usePatternInputHandlers"
import {
  formatNonNegativeIntegerInput,
  parseNonNegativeIntegerInput,
} from "@/lib/integerInput"
import { formatMoneyInputForField, MONEY_INPUT_DISPLAY_MAX_LEN } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
import { useId, type ClipboardEvent } from "react"

export type RootsFormDiscountMode = "porcentaje" | "fijo"

const PERCENT_INPUT_MAX_LEN = 3

function sanitizePercentInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, PERCENT_INPUT_MAX_LEN)
}

function normalizePercentInput(raw: string, maxPercent: number): string {
  const sanitized = sanitizePercentInput(raw)
  if (sanitized === "") return ""
  const parsed = parseNonNegativeIntegerInput(sanitized, Number.NaN)
  if (!Number.isFinite(parsed)) return ""
  return formatNonNegativeIntegerInput(Math.min(maxPercent, parsed))
}

function percentValueFromModeSwitch(
  currentValue: string,
  maxPercent: number,
): string {
  const whole = currentValue.includes(",")
    ? (currentValue.split(",")[0] ?? "")
    : currentValue
  return normalizePercentInput(whole, maxPercent)
}

function fixedAmountValueFromModeSwitch(currentValue: string): string {
  const trimmed = currentValue.trim()
  if (!trimmed) return ""
  const parsed = parseNonNegativeIntegerInput(trimmed, Number.NaN)
  if (!Number.isFinite(parsed)) return ""
  return formatMoneyInputForField(parsed)
}

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
    sanitize: sanitizePercentInput,
    formatOnBlur: (current) => normalizePercentInput(current, maxPercent),
  })

  const handlePercentChange = (raw: string) => {
    onChange(normalizePercentInput(raw, maxPercent))
  }

  const handlePercentPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    handlePercentChange(e.clipboardData.getData("text"))
  }

  const handlePercentModeSelect = () => {
    if (!isPercent) {
      onChange(percentValueFromModeSwitch(value, maxPercent))
    }
    onModeChange("porcentaje")
  }

  const handleFixedModeSelect = () => {
    if (isPercent) {
      onChange(fixedAmountValueFromModeSwitch(value))
    }
    onModeChange("fijo")
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
          rootsFormAffixFieldShellClass,
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <div
          role="group"
          aria-label="Tipo de descuento"
          className={rootsFormDiscountModePrefixClass}
        >
          <button
            type="button"
            disabled={disabled}
            aria-pressed={isPercent}
            aria-label="Porcentaje"
            className={rootsFormDiscountModeButtonClass(isPercent, disabled)}
            onClick={handlePercentModeSelect}
          >
            %
          </button>
          <button
            type="button"
            disabled={disabled || fixedAmountDisabled}
            aria-pressed={!isPercent}
            aria-label="Monto fijo"
            className={rootsFormDiscountModeButtonClass(
              !isPercent,
              disabled || fixedAmountDisabled,
            )}
            onClick={handleFixedModeSelect}
          >
            $
          </button>
        </div>
        <input
          ref={isPercent ? undefined : moneyHandlers.inputRef}
          id={fieldId}
          type="text"
          inputMode={isPercent ? "numeric" : "decimal"}
          autoComplete="off"
          value={value}
          maxLength={isPercent ? PERCENT_INPUT_MAX_LEN : MONEY_INPUT_DISPLAY_MAX_LEN}
          disabled={valueDisabled}
          aria-invalid={controlProps.isInvalid}
          aria-describedby={controlProps.describedBy}
          aria-label={
            isPercent ? "Porcentaje de descuento" : "Monto fijo de descuento"
          }
          placeholder={isPercent ? "0" : "0,00"}
          className={cn(rootsFormAffixInputClass, inputClassName)}
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
          onPaste={isPercent ? handlePercentPaste : moneyHandlers.handlePaste}
        />
      </div>
    </RootsFormField>
  )
}
