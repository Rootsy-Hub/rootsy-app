"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps, useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import {
  getFormCompositeInputStyle,
  getFormCompositeShellStyle,
  getFormDiscountModeButtonStyle,
  getFormDiscountModeGroupStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import {
  rootsFormAffixClearButtonClassForTone,
  rootsFormControlSelectionClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { layoutsOperarFormDarkPlaceholderClass } from "@/app/library/layouts/layoutsOperarStyles"
import { useMoneyInputField } from "@/components/rootsy-form/useMoneyInputField"
import { usePatternInputHandlers } from "@/components/rootsy-form/usePatternInputHandlers"
import {
  formatNonNegativeIntegerInput,
  parseNonNegativeIntegerInput,
} from "@/lib/integerInput"
import {
  formatMoneyInputForField,
  MONEY_INPUT_DISPLAY_MAX_LEN,
  parseMoneyInput,
} from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"
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

function hasClearableDiscountValue(
  value: string,
  mode: RootsFormDiscountMode,
): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (mode === "porcentaje") {
    return parseNonNegativeIntegerInput(trimmed, 0) > 0
  }
  return parseMoneyInput(trimmed, 0) > 0
}

type Props = {
  label: string
  id?: string
  mode: RootsFormDiscountMode
  onModeChange: (mode: RootsFormDiscountMode) => void
  value: string
  onChange: (value: string) => void
  onClear?: () => void
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
  onClear,
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
  const tone = useRootsFormControlTone()
  const styleOptions = { tone }
  const { state, interactionHandlers } = useRootsFormControlInteraction({ disabled, invalid })
  const shellStyle = getFormCompositeShellStyle(state, styleOptions)
  const modeGroupStyle = getFormDiscountModeGroupStyle(state, styleOptions)
  const isPercent = mode === "porcentaje"
  const valueDisabled =
    disabled || (!isPercent && Boolean(fixedAmountDisabled))
  const showClear =
    Boolean(onClear) && hasClearableDiscountValue(value, mode) && !disabled

  const moneyHandlers = useMoneyInputField({
    value,
    onChange,
    enabled: !isPercent,
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
        aria-invalid={invalid || undefined}
        className={cn("group min-w-0", disabled && "pointer-events-none opacity-50")}
        style={shellStyle}
        onMouseEnter={interactionHandlers.onMouseEnter}
        onMouseLeave={interactionHandlers.onMouseLeave}
      >
        <div
          role="group"
          aria-label="Tipo de descuento"
          className="relative z-[1]"
          style={modeGroupStyle}
        >
          <button
            type="button"
            disabled={disabled}
            aria-pressed={isPercent}
            aria-label="Porcentaje"
            style={getFormDiscountModeButtonStyle(state, isPercent, styleOptions)}
            className="focus-visible:outline-none"
            onClick={handlePercentModeSelect}
          >
            %
          </button>
          <button
            type="button"
            disabled={disabled}
            aria-pressed={!isPercent}
            aria-label="Monto fijo"
            style={getFormDiscountModeButtonStyle(state, !isPercent, styleOptions)}
            className="focus-visible:outline-none"
            onClick={handleFixedModeSelect}
          >
            $
          </button>
        </div>
        <div className="relative flex min-w-0 flex-1 items-stretch">
          <input
            ref={isPercent ? undefined : moneyHandlers.inputRef}
            id={fieldId}
            type="text"
            inputMode={isPercent ? "numeric" : "decimal"}
            autoComplete="off"
            value={isPercent ? value : moneyHandlers.inputValue}
            maxLength={isPercent ? PERCENT_INPUT_MAX_LEN : MONEY_INPUT_DISPLAY_MAX_LEN}
            disabled={valueDisabled}
            aria-invalid={controlProps.isInvalid}
            aria-describedby={controlProps.describedBy}
            aria-label={
              isPercent ? "Porcentaje de descuento" : "Monto fijo de descuento"
            }
            placeholder={isPercent ? "0" : "0,00"}
            className={cn(
              "font-canopy disabled:cursor-not-allowed",
              tone === "dark"
                ? layoutsOperarFormDarkPlaceholderClass
                : "placeholder:text-[var(--rootsy-bruma-500)]",
              rootsFormControlSelectionClass,
              showClear && "pr-10",
              inputClassName,
            )}
            style={getFormCompositeInputStyle(state, {
              numeric: true,
              hasTrailing: showClear,
              tone,
            })}
            onMouseDown={isPercent ? undefined : moneyHandlers.handleMouseDown}
            onChange={
              isPercent
                ? (e) => handlePercentChange(e.target.value)
                : moneyHandlers.handleChange
            }
            onFocus={(event) => {
              interactionHandlers.onFocus()
              if (isPercent) {
                percentHandlers.handleFocus(event)
              } else {
                moneyHandlers.handleFocus(event)
              }
            }}
            onBlur={() => {
              interactionHandlers.onBlur()
              if (isPercent) {
                percentHandlers.handleBlur()
              } else {
                moneyHandlers.handleBlur()
              }
            }}
            onKeyDown={isPercent ? undefined : moneyHandlers.handleKeyDown}
            onPaste={isPercent ? handlePercentPaste : moneyHandlers.handlePaste}
          />
          {showClear ? (
            <button
              type="button"
              aria-label="Borrar descuento"
              className={rootsFormAffixClearButtonClassForTone(tone)}
              onClick={onClear}
            >
              <XIcon className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </RootsFormField>
  )
}
