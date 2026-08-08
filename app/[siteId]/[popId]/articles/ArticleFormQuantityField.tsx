"use client"

import {
  articleFormControlShellClass,
  articleFormInlineAddonClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import {
  clampNonNegativeIntegerInput,
  formatNonNegativeIntegerInput,
  INTEGER_INPUT_MAX_LEN,
  isValidNonNegativeIntegerInput,
  parseNonNegativeIntegerInput,
} from "@/lib/integerInput"
import { cn } from "@/lib/utils"
import type { FocusEvent } from "react"

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  max?: number
  placeholder?: string
  suffix?: string
  "aria-label": string
}

export function ArticleFormQuantityField({
  id,
  value,
  onChange,
  disabled,
  max = 10000,
  placeholder = "0",
  suffix = "uds.",
  "aria-label": ariaLabel,
}: Props) {
  const handleChange = (raw: string) => {
    if (!isValidNonNegativeIntegerInput(raw)) return
    if (raw === "") {
      onChange("")
      return
    }
    onChange(clampNonNegativeIntegerInput(raw, max))
  }

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    requestAnimationFrame(() => {
      input.select()
    })
  }

  const handleBlur = () => {
    if (!value.trim()) {
      onChange("")
      return
    }
    const parsed = parseNonNegativeIntegerInput(value, Number.NaN)
    if (Number.isFinite(parsed)) {
      onChange(formatNonNegativeIntegerInput(Math.min(max, parsed)))
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
      <label htmlFor={id} className="sr-only">
        {ariaLabel}
      </label>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        value={value}
        maxLength={INTEGER_INPUT_MAX_LEN}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="min-w-0 flex-1 bg-transparent px-3.5 text-sm font-numeric tabular-nums text-foreground outline-none placeholder:text-muted-foreground/70"
      />
      {suffix ? (
        <span
          aria-hidden
          className={cn(articleFormInlineAddonClass, "border-l")}
        >
          {suffix}
        </span>
      ) : null}
    </div>
  )
}
