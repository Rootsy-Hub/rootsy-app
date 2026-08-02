"use client"

import {
  articleFormControlShellClass,
  articleFormInlineAddonClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import {
  formatMoneyInputForField,
  isValidMoneyInput,
  moneyInputToEditable,
  MONEY_INPUT_MAX_LEN,
  parseMoneyInput,
} from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
import type { FocusEvent } from "react"

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  "aria-label": string
}

export function ArticleFormMoneyField({
  id,
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: Props) {
  const handleChange = (raw: string) => {
    if (!isValidMoneyInput(raw)) return
    onChange(raw)
  }

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const editable = moneyInputToEditable(value)
    if (editable !== value) {
      onChange(editable)
    }
    requestAnimationFrame(() => {
      input.select()
    })
  }

  const handleBlur = () => {
    if (!value.trim()) return
    const parsed = parseMoneyInput(value, Number.NaN)
    if (Number.isFinite(parsed)) {
      onChange(formatMoneyInputForField(parsed))
    }
  }

  return (
    <div
      className={cn(
        articleFormControlShellClass,
        "flex items-stretch overflow-hidden p-0",
        disabled && "opacity-60",
      )}
    >
      <span
        aria-hidden
        className={cn(articleFormInlineAddonClass, "border-r")}
      >
        $
      </span>
      <label htmlFor={id} className="sr-only">
        {ariaLabel}
      </label>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        value={value}
        maxLength={MONEY_INPUT_MAX_LEN}
        placeholder="0,00"
        aria-label={ariaLabel}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="min-w-0 flex-1 bg-transparent px-3.5 text-sm font-numeric tabular-nums text-foreground outline-none placeholder:text-muted-foreground/70"
      />
    </div>
  )
}
