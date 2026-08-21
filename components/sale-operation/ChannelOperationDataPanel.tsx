"use client"

import { Button } from "@/components/ui/button"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { RootsBanner } from "@/components/rootsy-banner"
import { getBannerIconStyle } from "@/components/rootsy-banner/rootsBannerSpecRuntime"
import {
  RootsDangerSubtleButton,
  RootsPrimaryButton,
  RootsSubtleButton,
} from "@/components/rootsy-button"
import {
  saleOpChannelDataLabel,
  saleOpChannelDataValue,
  saleOpChannelPanelHeaderMeta,
  saleOpChannelPanelHeaderTitle,
  saleOpChannelPanelScroll,
  saleOpChannelPanelSection,
  saleOpChannelStatusBadge,
  saleOpDialogPrimaryBtn,
  saleOpDialogSecondaryBtn,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

const channelOperarFooterShellClass = cn(
  "mt-auto w-full shrink-0 border-t border-[var(--layouts-operar-border-light)] bg-white",
  "px-[var(--rootsy-space-400)] py-[var(--rootsy-space-200)]",
)

export type ChannelOperarFooterAction = {
  label: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  loadingLabel?: string
  title?: string
  type?: "button" | "submit"
  variant: "primary" | "discard" | "secondary"
}

function ChannelOperarFooterButton({
  action,
  type = "button",
}: {
  action: ChannelOperarFooterAction
  type?: "button" | "submit"
}) {
  const buttonProps = {
    type: action.type ?? type,
    disabled: action.disabled,
    loading: Boolean(action.loading),
    loadingLabel: action.loadingLabel ?? action.label,
    title: action.title,
    onClick: action.onClick,
  }

  if (action.variant === "primary") {
    return <RootsPrimaryButton {...buttonProps}>{action.label}</RootsPrimaryButton>
  }
  if (action.variant === "discard") {
    return (
      <RootsDangerSubtleButton {...buttonProps}>
        {action.label}
      </RootsDangerSubtleButton>
    )
  }
  return <RootsSubtleButton {...buttonProps}>{action.label}</RootsSubtleButton>
}

/** Footer operar — botones Rootsy, no el split Descartar / Cobrar del ticket. */
export function ChannelDataOperarFooterBar({
  actions,
  className,
}: {
  actions: ChannelOperarFooterAction[]
  className?: string
}) {
  if (actions.length === 0) return null

  const primary = actions.find((action) => action.variant === "primary") ?? null
  const rest = actions.filter((action) => action !== primary)

  return (
    <div className={cn(channelOperarFooterShellClass, className)}>
      <div
        className={cn(
          "flex w-full flex-wrap items-center gap-[var(--rootsy-space-150)]",
          rest.length > 0 ? "justify-between" : "justify-end",
        )}
      >
        {rest.length > 0 ? (
          <div className="flex min-w-0 flex-wrap items-center gap-[var(--rootsy-space-150)]">
            {rest.map((action) => (
              <ChannelOperarFooterButton
                key={`${action.variant}-${action.label}`}
                action={action}
              />
            ))}
          </div>
        ) : null}
        {primary ? <ChannelOperarFooterButton action={primary} /> : null}
      </div>
    </div>
  )
}

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
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn(saleOpChannelPanelHeaderTitle, "min-w-0 truncate")}>
            {title}
          </p>
          {badge ? <div className="shrink-0">{badge}</div> : null}
        </div>
        {meta ? (
          <p className={cn(saleOpChannelPanelHeaderMeta, "mt-0.5")}>{meta}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center self-start">{actions}</div>
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
  return <RootsBanner intent="danger" layout="message" message={children} />
}

export function ChannelDataWarningBanner({ children }: { children: ReactNode }) {
  return <RootsBanner intent="warning" layout="message" message={children} />
}

export function ChannelDataHint({
  icon: Icon,
  children,
}: {
  icon?: LucideIcon
  children: ReactNode
}) {
  return (
    <RootsBanner
      intent="neutral"
      layout="message"
      density="compact"
      icon={
        Icon ? (
          <Icon
            style={{ ...getBannerIconStyle("neutral"), width: 16, height: 16 }}
            aria-hidden
          />
        ) : undefined
      }
      message={children}
    />
  )
}

export function ChannelDataEmptyState({
  icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description?: string
}) {
  return (
    <DataWorkspaceDetailEmptyState
      icon={icon}
      title={title}
      description={description}
      className="min-h-0"
    />
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
  return (
    <ChannelDataOperarFooterBar
      actions={[
        ...(onCancel
          ? [
              {
                variant: "secondary" as const,
                label: "Cancelar",
                disabled: cancelDisabled,
                onClick: onCancel,
              },
            ]
          : []),
        {
          variant: "primary",
          label: primary.label,
          disabled: primary.disabled,
          loading: primary.loading,
          loadingLabel: primary.loadingLabel,
          type: primary.type,
          onClick: primary.onClick,
        },
      ]}
    />
  )
}
