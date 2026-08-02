"use client"

import {
  isValidMoneyInput,
  MONEY_INPUT_MAX_LEN,
} from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
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
        "space-y-4 rounded-xl border border-border/50 bg-muted/10 p-3.5",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CheckoutSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </p>
  )
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
  const segmentClass = (selected: boolean, optionDisabled: boolean) =>
    cn(
      "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      optionDisabled && "pointer-events-none opacity-45",
      selected
        ? "bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
    )

  return (
    <div
      role="group"
      aria-label="Tipo de descuento"
      className="grid grid-cols-2 gap-1 rounded-xl border border-border/70 bg-muted/15 p-1"
    >
      <button
        type="button"
        disabled={disabled}
        aria-pressed={mode === "porcentaje"}
        className={segmentClass(mode === "porcentaje", Boolean(disabled))}
        onClick={() => onChange("porcentaje")}
      >
        <Percent className="size-4" aria-hidden />
        Porcentaje
      </button>
      <button
        type="button"
        disabled={fixedAmountDisabled}
        aria-pressed={mode === "fijo"}
        className={segmentClass(mode === "fijo", Boolean(fixedAmountDisabled))}
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
        "rounded-xl border border-border/70 bg-muted/15 transition-all duration-150",
        "focus-within:border-primary/45 focus-within:ring-2 focus-within:ring-primary/20",
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
              "flex shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground",
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
                "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground shadow-sm transition-colors",
                "hover:bg-muted/40 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
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
              "min-w-0 flex-1 bg-transparent font-semibold leading-none tabular-nums tracking-tight text-foreground outline-none",
              isCompact ? "text-lg" : "text-2xl",
              "placeholder:text-muted-foreground/40",
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
                "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground shadow-sm transition-colors",
                "hover:bg-muted/40 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
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
  placeholder = "0",
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
  return (
    <CheckoutNumericValueField
      id={id}
      icon={Banknote}
      value={value}
      onChange={(raw) => {
        if (!isValidMoneyInput(raw)) return
        onChange(raw)
      }}
      placeholder={placeholder}
      suffix="$"
      inputMode="decimal"
      maxLength={MONEY_INPUT_MAX_LEN}
      ariaLabel={ariaLabel}
      autoFocus={autoFocus}
      size={size}
      hideIcon={hideIcon}
      disabled={disabled}
      className={className}
    />
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
    <p className="px-0.5 text-xs leading-snug text-muted-foreground">{children}</p>
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
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        disabled && "pointer-events-none opacity-45",
        selected
          ? "border-primary/45 bg-primary/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "border-border/70 bg-muted/15 hover:border-border hover:bg-muted/30 active:scale-[0.995]",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
          selected
            ? "bg-primary/15 text-primary"
            : "bg-muted/50 text-muted-foreground group-hover:bg-muted/70 group-hover:text-foreground",
        )}
      >
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-snug text-foreground">
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected
            ? "border-primary bg-primary"
            : "border-muted-foreground/30 bg-background",
        )}
        aria-hidden
      >
        {selected ? (
          <span className="size-2 rounded-full bg-primary-foreground" />
        ) : null}
      </span>
    </button>
  )
}
