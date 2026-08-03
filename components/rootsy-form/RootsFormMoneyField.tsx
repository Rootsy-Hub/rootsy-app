"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps } from "@/components/rootsy-form/rootsFormFieldContext"
import { RootsFormPrefixedInput } from "@/components/rootsy-form/RootsFormPrefixedInput"
import { useMoneyInputField } from "@/components/rootsy-form/useMoneyInputField"
import {
  formatMoneyInputForField,
  MONEY_INPUT_DISPLAY_MAX_LEN,
} from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
import { useId, type ComponentProps, type ReactNode } from "react"

type Props = {
  label: string
  id?: string
  value: string
  onChange: (value: string) => void
  prefix?: ReactNode
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
  inputClassName?: string
  formatOnBlur?: boolean
  formatValue?: (amount: number) => string
} & RootsFormFieldAssistProps &
  Pick<ComponentProps<"input">, "autoFocus">

export function RootsFormMoneyField({
  label,
  id,
  value,
  onChange,
  prefix = "$",
  placeholder = "0,00",
  disabled,
  invalid,
  hint,
  error,
  warning,
  success,
  className,
  inputClassName,
  formatOnBlur = true,
  formatValue = formatMoneyInputForField,
  autoFocus,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const controlProps = useRootsFormFieldControlProps({ invalid })

  const {
    inputRef,
    handleMouseDown,
    handleFocus,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleBlur,
  } = useMoneyInputField({
    value,
    onChange,
    formatOnBlur,
    formatValue,
  })

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
      <RootsFormPrefixedInput
        ref={inputRef}
        id={fieldId}
        prefix={prefix}
        inputMode="decimal"
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
        maxLength={MONEY_INPUT_DISPLAY_MAX_LEN}
        disabled={disabled}
        invalid={controlProps.isInvalid}
        placeholder={placeholder}
        aria-describedby={controlProps.describedBy}
        onMouseDown={handleMouseDown}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputClassName={cn(inputClassName)}
      />
    </RootsFormField>
  )
}
