"use client"

import {
  layoutsOperarTicketProposalActionDiscardClass,
  layoutsOperarTicketProposalActionSellClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import {
  layoutsOperarSummaryActionConfirmColClass,
  layoutsOperarSummaryActionDiscardColClass,
  layoutsOperarSummaryActionsRowClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { Button } from "@/components/ui/button"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { RootsBanner } from "@/components/rootsy-banner"
import { getBannerIconStyle } from "@/components/rootsy-banner/rootsBannerSpecRuntime"
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
import { Loader2, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

const channelOperarFooterShellClass = cn(
  "mt-auto w-full shrink-0 border-t border-[var(--layouts-operar-border-light)] bg-white",
)

const channelOperarFooterBtnBase = cn(
  "inline-flex h-full w-full items-center justify-center gap-2 border-0 px-4 text-sm font-semibold tracking-tight shadow-none transition-[background-color,color,opacity] duration-150",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0",
  "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-40",
)

const channelOperarFooterPrimaryClass = cn(
  channelOperarFooterBtnBase,
  layoutsOperarTicketProposalActionSellClass(TICKET_PROPOSAL),
  "hover:bg-[var(--rootsy-savia-500)] active:bg-[var(--rootsy-savia-700)]",
  "focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-300)_55%,transparent)]",
  "disabled:hover:bg-[var(--rootsy-savia-600)] disabled:active:bg-[var(--rootsy-savia-600)]",
)

const channelOperarFooterDiscardClass = cn(
  channelOperarFooterBtnBase,
  layoutsOperarTicketProposalActionDiscardClass(TICKET_PROPOSAL),
  "bg-transparent hover:text-rose-800 active:text-rose-900",
  "focus-visible:ring-rose-400/35",
  "disabled:text-slate-400 disabled:hover:text-slate-400",
)

const channelOperarFooterSecondaryClass = cn(
  channelOperarFooterBtnBase,
  "bg-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100",
  "focus-visible:ring-slate-300/50",
  "disabled:text-slate-400 disabled:hover:bg-transparent disabled:hover:text-slate-400",
)

export type ChannelOperarFooterAction = {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  loadingLabel?: string
  title?: string
  variant: "primary" | "discard" | "secondary"
}

function ChannelOperarFooterButton({
  action,
  className,
}: {
  action: ChannelOperarFooterAction
  className?: string
}) {
  const variantClass =
    action.variant === "primary"
      ? channelOperarFooterPrimaryClass
      : action.variant === "discard"
        ? channelOperarFooterDiscardClass
        : channelOperarFooterSecondaryClass

  return (
    <button
      type="button"
      disabled={action.disabled || action.loading}
      title={action.title}
      onClick={action.onClick}
      className={cn(variantClass, className)}
    >
      {action.loading ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          {action.loadingLabel ?? action.label}
        </>
      ) : (
        action.label
      )}
    </button>
  )
}

function buildOperarFooterRows(
  actions: ChannelOperarFooterAction[],
): Array<
  | { type: "single"; action: ChannelOperarFooterAction }
  | { type: "dual"; left: ChannelOperarFooterAction; right: ChannelOperarFooterAction }
> {
  const primary = actions.find((action) => action.variant === "primary")
  const discard = actions.find((action) => action.variant === "discard")
  const secondaries = actions.filter((action) => action.variant === "secondary")
  const rows: Array<
    | { type: "single"; action: ChannelOperarFooterAction }
    | { type: "dual"; left: ChannelOperarFooterAction; right: ChannelOperarFooterAction }
  > = []

  const pairedSecondary =
    secondaries.length === 1 && primary && !discard ? secondaries[0] : null
  const stackedSecondaries = pairedSecondary ? [] : secondaries

  for (const secondary of stackedSecondaries) {
    rows.push({ type: "single", action: secondary })
  }

  if (primary && discard) {
    rows.push({ type: "dual", left: discard, right: primary })
  } else if (primary && pairedSecondary) {
    rows.push({ type: "dual", left: pairedSecondary, right: primary })
  } else if (primary) {
    rows.push({ type: "single", action: primary })
  } else if (discard) {
    rows.push({ type: "single", action: discard })
  } else if (secondaries.length === 2) {
    rows.push({ type: "dual", left: secondaries[0], right: secondaries[1] })
  } else if (secondaries.length === 1) {
    rows.push({ type: "single", action: secondaries[0] })
  }

  return rows
}

/** Footer operar — mismo estilo que Descartar / Cobrar del ticket. */
export function ChannelDataOperarFooterBar({
  actions,
  className,
}: {
  actions: ChannelOperarFooterAction[]
  className?: string
}) {
  const rows = buildOperarFooterRows(actions)
  if (rows.length === 0) return null

  return (
    <div className={cn(channelOperarFooterShellClass, className)}>
      {rows.map((row, index) => {
        if (row.type === "single") {
          return (
            <div
              key={`${row.action.label}-${index}`}
              className={cn(
                layoutsOperarSummaryActionsRowClass,
                "grid-cols-1 border-t-0 first:border-t-0",
                index > 0 && "border-t border-[var(--layouts-operar-border-light)]",
              )}
            >
              <ChannelOperarFooterButton action={row.action} />
            </div>
          )
        }

        return (
          <div
            key={`${row.left.label}-${row.right.label}-${index}`}
            className={cn(
              layoutsOperarSummaryActionsRowClass,
              index > 0 && "border-t border-[var(--layouts-operar-border-light)]",
            )}
          >
            <div className={layoutsOperarSummaryActionDiscardColClass}>
              <ChannelOperarFooterButton action={row.left} />
            </div>
            <div className={layoutsOperarSummaryActionConfirmColClass}>
              <ChannelOperarFooterButton action={row.right} />
            </div>
          </div>
        )
      })}
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
  const hasCancel = Boolean(onCancel)

  return (
    <div className={channelOperarFooterShellClass}>
      <div
        className={cn(
          layoutsOperarSummaryActionsRowClass,
          !hasCancel && "grid-cols-1",
        )}
      >
        {hasCancel ? (
          <div className={layoutsOperarSummaryActionDiscardColClass}>
            <button
              type="button"
              disabled={cancelDisabled}
              onClick={onCancel}
              className={channelOperarFooterDiscardClass}
            >
              Cancelar
            </button>
          </div>
        ) : null}
        <div
          className={
            hasCancel
              ? layoutsOperarSummaryActionConfirmColClass
              : "col-span-full flex h-full min-h-0 min-w-0"
          }
        >
          <button
            type={primary.type ?? "button"}
            disabled={primary.disabled || primary.loading}
            onClick={primary.onClick}
            className={channelOperarFooterPrimaryClass}
          >
            {primary.loading ? (
              <>
                <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                {primary.loadingLabel ?? primary.label}
              </>
            ) : (
              primary.label
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
