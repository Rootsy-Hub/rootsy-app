"use client"

import { MONEY_INPUT_DISPLAY_MAX_LEN } from "@/lib/moneyInput"
import { useMoneyInputField } from "@/components/rootsy-form/useMoneyInputField"
import {
  rootsFormFieldLabelClass,
  rootsFormSegmentGroupClass,
  rootsFormSegmentOptionClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import {
  checkoutOptionCardIconClass,
  checkoutOptionCardShellClass,
} from "@/components/checkout/CheckoutOptionCard"
import { Banknote, Minus, Percent, Plus, type LucideIcon } from "lucide-react"
import type { ComponentType, ReactNode } from "react"

export type CheckoutDiscountMode = "porcentaje" | "fijo"

export function CheckoutSectionPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border border-[var(--rootsy-bruma-200)] bg-white p-3.5",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CheckoutSectionLabel({
  children,
  htmlFor,
}: {
  children: ReactNode
  htmlFor?: string
}) {
  if (htmlFor) {
    return (
      <label htmlFor={htmlFor} className={rootsFormFieldLabelClass}>
        {children}
      </label>
    )
  }

  return <p className={rootsFormFieldLabelClass}>{children}</p>
}

export function CheckoutDiscountModeSegment({
  mode,
  disabled,
  fixedAmountDisabled,
  onChange,
}: {
  mode: CheckoutDiscountMode
  disabled?: boolean
  fixedAmountDisabled?: boolean
  onChange: (mode: CheckoutDiscountMode) => void
}) {
  return (
    <div
      role="group"
      aria-label="Tipo de descuento"
      className={cn(rootsFormSegmentGroupClass, "grid-cols-2")}
    >
      <button
        type="button"
        disabled={disabled}
        aria-pressed={mode === "porcentaje"}
        className={rootsFormSegmentOptionClass(
          mode === "porcentaje",
          Boolean(disabled),
        )}
        onClick={() => onChange("porcentaje")}
      >
        <Percent className="size-4" aria-hidden />
        Porcentaje
      </button>
      <button
        type="button"
        disabled={fixedAmountDisabled}
        aria-pressed={mode === "fijo"}
        className={rootsFormSegmentOptionClass(
          mode === "fijo",
          Boolean(fixedAmountDisabled),
        )}
        onClick={() => onChange("fijo")}
      >
        <Banknote className="size-4" aria-hidden />
        Monto fijo
      </button>
    </div>
  )
}

export function CheckoutNumericValueField({
  id,
  icon: Icon,
  value,
  onChange,
  placeholder = "0",
  suffix,
  disabled,
  inputMode = "numeric",
  maxLength,
  ariaLabel,
  autoFocus,
  size = "default",
  hideIcon = false,
  className,
  onDecrease,
  onIncrease,
  decreaseDisabled,
  increaseDisabled,
}: {
  id: string
  icon: ComponentType<{ className?: string }>
  value: string
  onChange: (raw: string) => void
  placeholder?: string
  suffix?: string
  disabled?: boolean
  inputMode?: "numeric" | "decimal" | "text"
  maxLength?: number
  ariaLabel: string
  autoFocus?: boolean
  size?: "default" | "compact"
  hideIcon?: boolean
  className?: string
  onDecrease?: () => void
  onIncrease?: () => void
  decreaseDisabled?: boolean
  increaseDisabled?: boolean
}) {
  const showStepper = onDecrease != null || onIncrease != null
  const isCompact = size === "compact"

  const selectAll = (target: HTMLInputElement) => {
    target.select()
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--rootsy-bruma-200)] bg-white transition-all duration-150",
        "focus-within:border-[var(--rootsy-savia-400)] focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_20%,transparent)]",
        disabled && "opacity-50",
        className,
      )}
    >
      <label htmlFor={id} className="sr-only">
        {ariaLabel}
      </label>
      <div
        className={cn(
          "flex items-center gap-3",
          isCompact ? "px-2.5 py-2" : "px-3.5 py-3",
        )}
      >
        {!hideIcon ? (
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-500)]",
              isCompact ? "size-8" : "size-10",
            )}
          >
            <Icon className={cn(isCompact ? "size-4" : "size-[18px]")} aria-hidden />
          </span>
        ) : null}
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center",
            showStepper ? "gap-2" : "",
          )}
        >
          {onDecrease ? (
            <button
              type="button"
              disabled={disabled || decreaseDisabled}
              aria-label={`Disminuir ${ariaLabel.toLowerCase()}`}
              onClick={onDecrease}
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--rootsy-bruma-200)] bg-white text-[var(--rootsy-bruma-500)] shadow-sm transition-colors",
                "hover:bg-[var(--rootsy-bruma-50)] hover:text-[var(--rootsy-bruma-900)]",
                "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
                "disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              <Minus className="size-4" aria-hidden />
            </button>
          ) : null}
          <input
            id={id}
            type="text"
            inputMode={inputMode}
            autoComplete="off"
            autoFocus={autoFocus}
            disabled={disabled}
            value={value}
            maxLength={maxLength}
            onFocus={(e) => selectAll(e.currentTarget)}
            onClick={(e) => selectAll(e.currentTarget)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "min-w-0 flex-1 bg-transparent font-semibold leading-none tabular-nums tracking-tight text-[var(--rootsy-bruma-900)] outline-none",
              isCompact ? "text-lg" : "text-2xl",
              "placeholder:text-[var(--rootsy-bruma-400)]",
              showStepper && "text-center",
            )}
          />
          {onIncrease ? (
            <button
              type="button"
              disabled={disabled || increaseDisabled}
              aria-label={`Aumentar ${ariaLabel.toLowerCase()}`}
              onClick={onIncrease}
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--rootsy-bruma-200)] bg-white text-[var(--rootsy-bruma-500)] shadow-sm transition-colors",
                "hover:bg-[var(--rootsy-bruma-50)] hover:text-[var(--rootsy-bruma-900)]",
                "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
                "disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              <Plus className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
        {suffix ? (
          <span
            className={cn(
              "shrink-0 font-semibold tabular-nums text-muted-foreground",
              isCompact ? "text-base" : "text-lg",
            )}
            aria-hidden
          >
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function CheckoutMoneyValueField({
  id,
  value,
  onChange,
  placeholder = "0,00",
  disabled,
  ariaLabel,
  autoFocus,
  size = "default",
  hideIcon = false,
  className,
}: {
  id: string
  value: string
  onChange: (raw: string) => void
  placeholder?: string
  disabled?: boolean
  ariaLabel: string
  autoFocus?: boolean
  size?: "default" | "compact"
  hideIcon?: boolean
  className?: string
}) {
  const isCompact = size === "compact"
  const {
    inputRef,
    inputValue,
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
        "rounded-xl border border-[var(--rootsy-bruma-200)] bg-white transition-all duration-150",
        "focus-within:border-[var(--rootsy-savia-400)] focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_20%,transparent)]",
        disabled && "opacity-50",
        className,
      )}
    >
      <label htmlFor={id} className="sr-only">
        {ariaLabel}
      </label>
      <div
        className={cn(
          "flex items-center gap-3",
          isCompact ? "px-2.5 py-2" : "px-3.5 py-3",
        )}
      >
        {!hideIcon ? (
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg bg-[var(--rootsy-bruma-50)] font-semibold tabular-nums text-[var(--rootsy-bruma-500)]",
              isCompact ? "size-8 text-base" : "size-10 text-lg",
            )}
            aria-hidden
          >
            $
          </span>
        ) : null}
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFocus}
          disabled={disabled}
          value={inputValue}
          maxLength={MONEY_INPUT_DISPLAY_MAX_LEN}
          onMouseDown={handleMouseDown}
          onFocus={handleFocus}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={cn(
            "min-w-0 flex-1 bg-transparent font-semibold leading-none tabular-nums tracking-tight text-[var(--rootsy-bruma-900)] outline-none",
            isCompact ? "text-lg" : "text-2xl",
            "placeholder:text-[var(--rootsy-bruma-400)]",
          )}
        />
      </div>
    </div>
  )
}

export function CheckoutQuantityPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex justify-center rounded-xl border border-border/70 bg-muted/15 px-3 py-3.5",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CheckoutFieldHint({ children }: { children: ReactNode }) {
  return (
    <p className="px-0.5 text-xs leading-snug text-[var(--rootsy-bruma-500)]">{children}</p>
  )
}

export function CheckoutToggleCard({
  title,
  subtitle,
  selected,
  disabled,
  onClick,
  icon: Icon,
}: {
  title: string
  subtitle?: string
  selected: boolean
  disabled?: boolean
  onClick: () => void
  icon: LucideIcon
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={checkoutOptionCardShellClass(selected, disabled)}
    >
      <span className={checkoutOptionCardIconClass(selected)}>
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-snug text-[var(--rootsy-bruma-900)]">
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block text-xs leading-snug text-[var(--rootsy-bruma-500)]">
            {subtitle}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected
            ? "border-[var(--rootsy-savia-600)] bg-[var(--rootsy-savia-600)]"
            : "border-[var(--rootsy-bruma-300)] bg-white",
        )}
        aria-hidden
      >
        {selected ? (
          <span className="size-2 rounded-full bg-white" />
        ) : null}
      </span>
    </button>
  )
}
