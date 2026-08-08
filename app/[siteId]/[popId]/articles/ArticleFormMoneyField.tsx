"use client"

import {
  articleFormControlShellClass,
  articleFormInlineAddonClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import { useMoneyInputField } from "@/components/rootsy-form/useMoneyInputField"
import { MONEY_INPUT_DISPLAY_MAX_LEN } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"

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
  const {
    inputRef,
    handleMouseDown,
    handleFocus,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleBlur,
  } = useMoneyInputField({ value, onChange })

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
        ref={inputRef}
        id={id}
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        value={value}
        maxLength={MONEY_INPUT_DISPLAY_MAX_LEN}
        placeholder="0,00"
        aria-label={ariaLabel}
        onMouseDown={handleMouseDown}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="min-w-0 flex-1 bg-transparent px-3.5 text-sm font-numeric tabular-nums text-foreground outline-none placeholder:text-muted-foreground/70"
      />
    </div>
  )
}
