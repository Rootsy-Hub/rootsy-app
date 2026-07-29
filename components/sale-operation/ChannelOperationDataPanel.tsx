"use client"

import { Button } from "@/components/ui/button"
import {
  saleOpChannelDataLabel,
  saleOpChannelDataValue,
  saleOpChannelErrorBanner,
  saleOpChannelHint,
  saleOpChannelPanelHeaderMeta,
  saleOpChannelPanelHeaderTitle,
  saleOpChannelPanelScroll,
  saleOpChannelPanelSection,
  saleOpChannelStatusBadge,
  saleOpChannelWarningBanner,
  saleOpDialogPrimaryBtn,
  saleOpDialogSecondaryBtn,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { Loader2, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

const channelFormActionBtnBase = cn(
  "h-14 w-full gap-2.5 border-0 px-4 text-[15px] font-semibold tracking-tight shadow-none transition-colors",
  "focus-visible:ring-2 focus-visible:ring-offset-0",
  "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-40",
)

export function ChannelDataPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn(saleOpChannelPanelScroll, className)}>{children}</div>
  )
}

export function ChannelDataSection({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn(saleOpChannelPanelSection, className)}>
      {children}
    </section>
  )
}

export function ChannelDataHeader({
  title,
  meta,
  badge,
  actions,
}: {
  title: ReactNode
  meta?: ReactNode
  badge?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className={saleOpChannelPanelHeaderTitle}>{title}</p>
        {meta ? <p className={cn(saleOpChannelPanelHeaderMeta, "mt-0.5")}>{meta}</p> : null}
      </div>
      {badge || actions ? (
        <div className="flex shrink-0 items-center gap-2">
          {badge}
          {actions}
        </div>
      ) : null}
    </div>
  )
}

export function ChannelDataStatusBadge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn(saleOpChannelStatusBadge, className)}>{children}</span>
  )
}

export function ChannelDataFields({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <dl className={cn("mt-3 grid gap-3", className)}>{children}</dl>
}

export function ChannelDataField({
  label,
  children,
}: {
  label: ReactNode
  children: ReactNode
}) {
  return (
    <div>
      <dt className={saleOpChannelDataLabel}>{label}</dt>
      <dd className={cn(saleOpChannelDataValue, "mt-0.5")}>{children}</dd>
    </div>
  )
}

export function ChannelDataErrorBanner({ children }: { children: ReactNode }) {
  return <p className={saleOpChannelErrorBanner}>{children}</p>
}

export function ChannelDataWarningBanner({ children }: { children: ReactNode }) {
  return <p className={saleOpChannelWarningBanner}>{children}</p>
}

export function ChannelDataHint({
  icon: Icon,
  children,
}: {
  icon?: LucideIcon
  children: ReactNode
}) {
  return (
    <p className={saleOpChannelHint}>
      {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
      {children}
    </p>
  )
}

export function ChannelDataEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border/50">
        <Icon className="size-7 stroke-[1.75]" aria-hidden />
      </div>
      <div className="max-w-[260px]">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

export function ChannelDataActions({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <ChannelDataSection className={cn("space-y-2 p-2", className)}>
      {children}
    </ChannelDataSection>
  )
}

export function ChannelDataPrimaryAction({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      className={cn(saleOpDialogPrimaryBtn, "h-10 w-full rounded-lg", className)}
      {...props}
    >
      {children}
    </Button>
  )
}

export function ChannelDataSecondaryAction({
  children,
  className,
  tone = "neutral",
  ...props
}: React.ComponentProps<typeof Button> & {
  tone?: "neutral" | "destructive"
}) {
  return (
    <Button
      type="button"
      variant="ghost-neutral"
      className={cn(
        saleOpDialogSecondaryBtn,
        "h-10 w-full rounded-lg",
        tone === "destructive" &&
          "text-rose-600 hover:bg-rose-50 hover:text-rose-700",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export function ChannelDataFormActionsBar({
  onCancel,
  cancelDisabled,
  primary,
}: {
  onCancel?: () => void
  cancelDisabled?: boolean
  primary: {
    label: string
    disabled?: boolean
    loading?: boolean
    loadingLabel?: string
    type?: "button" | "submit"
    onClick?: () => void
  }
}) {
  const hasCancel = Boolean(onCancel)

  return (
    <div
      className={cn(
        "mt-auto grid w-full shrink-0 border-t border-slate-200/90 bg-white",
        hasCancel ? "grid-cols-2" : "grid-cols-1",
      )}
    >
      {hasCancel ? (
        <button
          type="button"
          disabled={cancelDisabled}
          onClick={onCancel}
          className={cn(
            channelFormActionBtnBase,
            "inline-flex items-center justify-center rounded-none",
            "bg-white text-rose-700 hover:bg-rose-500/10 hover:text-rose-700 active:bg-rose-500/15",
            "disabled:bg-white disabled:text-slate-400 disabled:hover:bg-white disabled:active:bg-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40",
          )}
        >
          Cancelar
        </button>
      ) : null}
      <Button
        type={primary.type ?? "button"}
        disabled={primary.disabled || primary.loading}
        onClick={primary.onClick}
        className={cn(
          channelFormActionBtnBase,
          "rounded-none",
          saleOpDialogPrimaryBtn,
          "h-14 text-[15px] tracking-tight",
        )}
      >
        {primary.loading ? (
          <>
            <Loader2 className="size-[18px] shrink-0 animate-spin" aria-hidden />
            {primary.loadingLabel ?? primary.label}
          </>
        ) : (
          primary.label
        )}
      </Button>
    </div>
  )
}
