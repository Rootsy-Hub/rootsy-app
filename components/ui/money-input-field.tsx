"use client"

import { useMoneyInputField } from "@/components/rootsy-form/useMoneyInputField"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  formatMoneyInputForField,
  MONEY_INPUT_DISPLAY_MAX_LEN,
} from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

type MoneyInputFieldProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
  inputClassName?: string
  prefixClassName?: string
  formatOnBlur?: boolean
  formatValue?: (amount: number) => string
  "aria-label"?: string
} & Pick<ComponentProps<"input">, "autoFocus">

export function MoneyInputField({
  id,
  value,
  onChange,
  placeholder = "0,00",
  disabled,
  invalid,
  className,
  inputClassName,
  prefixClassName,
  formatOnBlur = true,
  formatValue = formatMoneyInputForField,
  "aria-label": ariaLabel,
  autoFocus,
}: MoneyInputFieldProps) {
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
    <InputGroup
      className={cn(
        "h-11 overflow-hidden shadow-xs transition-[color,box-shadow]",
        className,
      )}
    >
      <InputGroupAddon
        align="inline-start"
        className={cn(
          "h-11 shrink-0 self-stretch border-r border-border/70 bg-muted/35 px-3.5 py-0",
          prefixClassName,
        )}
      >
        <InputGroupText className="text-sm font-semibold tabular-nums text-zinc-600 dark:text-zinc-600">
          $
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        id={id}
        inputMode="decimal"
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
        maxLength={MONEY_INPUT_DISPLAY_MAX_LEN}
        disabled={disabled}
        aria-invalid={invalid}
        aria-label={ariaLabel}
        placeholder={placeholder}
        onMouseDown={handleMouseDown}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "h-11 min-w-0 flex-1 basis-0 !w-auto px-3 font-numeric text-base tabular-nums tracking-tight",
          inputClassName,
        )}
      />
    </InputGroup>
  )
}
