"use client"

import { RootsBannerIcon } from "@/components/rootsy-banner/RootsBannerIcon"
import {
  getBannerActionStyle,
  getBannerContentStackStyle,
  getBannerDismissButtonStyle,
  getBannerMessageStyle,
  getBannerRowStyle,
  getBannerShellStyle,
  getBannerTitleStyle,
  resolveBannerLayout,
  resolveBannerRole,
  type BannerDensityId,
  type BannerIntentId,
  type BannerLayoutId,
  type BannerTone,
} from "@/components/rootsy-banner/rootsBannerSpecRuntime"
import {
  rootsBannerDismissRadiusClass,
  rootsBannerShellClassForVariant,
} from "@/components/rootsy-banner/rootsBannerStyles"
import { cn } from "@/lib/utils"
import { rootsySpacePx } from "@/lib/design-system"
import Link from "next/link"
import type { CSSProperties, ReactNode } from "react"

export type RootsBannerProps = {
  intent?: BannerIntentId
  tone?: BannerTone
  density?: BannerDensityId
  layout?: BannerLayoutId
  title?: string
  message?: ReactNode
  children?: ReactNode
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  onDismiss?: () => void
  dismissLabel?: string
  showIcon?: boolean
  icon?: ReactNode
  fullWidth?: boolean
  /** default = radius.large · strip = barra full-bleed sin radio externo. */
  variant?: "default" | "strip"
  className?: string
  style?: CSSProperties
}

export function RootsBanner({
  intent = "neutral",
  tone = "light",
  density = "default",
  layout,
  title,
  message,
  children,
  actionLabel,
  onAction,
  actionHref,
  onDismiss,
  dismissLabel = "Cerrar",
  showIcon = true,
  icon,
  fullWidth = false,
  variant = "default",
  className,
  style,
}: RootsBannerProps) {
  const resolvedLayout = resolveBannerLayout(layout, {
    title,
    actionLabel,
    onDismiss,
  })
  const body = message ?? children
  const rowStyle = getBannerRowStyle()
  const stackStyle = getBannerContentStackStyle()
  const isMessageOnly = resolvedLayout === "message"

  return (
    <div
      role={resolveBannerRole(intent)}
      className={cn("font-canopy", rootsBannerShellClassForVariant(variant), className)}
      style={{
        ...getBannerShellStyle(intent, density, {
          fullWidth,
          strip: variant === "strip",
          tone,
        }),
        ...style,
      }}
    >
      <div style={rowStyle}>
        {showIcon ? icon ?? <RootsBannerIcon intent={intent} tone={tone} /> : null}
        <div
          style={{
            ...rowStyle,
            flex: 1,
            minWidth: 0,
            alignItems: isMessageOnly ? "center" : "flex-start",
          }}
        >
          <div style={isMessageOnly ? { flex: 1, minWidth: 0 } : stackStyle}>
            {!isMessageOnly && title ? (
              <p style={getBannerTitleStyle(tone)}>{title}</p>
            ) : null}
            {body ? <div style={getBannerMessageStyle(intent, tone)}>{body}</div> : null}
          </div>

          {resolvedLayout === "with-action" && actionLabel ? (
            actionHref ? (
              <Link href={actionHref} style={getBannerActionStyle(intent, tone)}>
                {actionLabel}
              </Link>
            ) : (
              <button type="button" style={getBannerActionStyle(intent, tone)} onClick={onAction}>
                {actionLabel}
              </button>
            )
          ) : null}

          {resolvedLayout === "dismissible" && onDismiss ? (
            <button
              type="button"
              aria-label={dismissLabel}
              className={rootsBannerDismissRadiusClass()}
              style={getBannerDismissButtonStyle(tone)}
              onClick={onDismiss}
            >
              <svg
                viewBox="0 0 16 16"
                width={rootsySpacePx("200")}
                height={rootsySpacePx("200")}
                aria-hidden
              >
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
