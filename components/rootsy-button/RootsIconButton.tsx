"use client"

import {
  getIconButtonSpecStyle,
  resolveLegacyIconButtonSpec,
} from "@/components/rootsy-button/rootsButtonSpecRuntime"
import {
  iconButtonSize,
  type IconButtonEmphasisId,
  type IconButtonRowIntentId,
  type IconButtonSizeId,
  type IconButtonThemeId,
} from "@/app/[siteId]/[popId]/library/ui-components/buttonsUiHardcodedSpec"
import type {
  RootsIconButtonActionIntent,
  RootsIconButtonSize,
  RootsIconButtonSurface,
  RootsIconButtonTone,
} from "@/components/rootsy-button/rootsButtonStyles"
import { useRootsButtonInteraction } from "@/components/rootsy-button/useRootsButtonInteraction"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react"

export type RootsIconButtonProps = {
  label: string
  tone?: RootsIconButtonTone
  intent?: RootsIconButtonActionIntent
  surface?: RootsIconButtonSurface
  size?: RootsIconButtonSize
  theme?: IconButtonThemeId
  emphasis?: IconButtonEmphasisId
  rowIntent?: IconButtonRowIntentId
  loading?: boolean
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label">

type IconChildProps = {
  className?: string
  style?: CSSProperties
  size?: number
  width?: number
  height?: number
  "aria-hidden"?: boolean
}

function renderSizedIcon(child: ReactNode, iconPx: number): ReactNode {
  const onlyChild = Children.only(child)
  if (!isValidElement<IconChildProps>(onlyChild)) return onlyChild

  return cloneElement(onlyChild, {
    size: iconPx,
    width: iconPx,
    height: iconPx,
    className: cn(onlyChild.props.className),
    style: {
      ...(onlyChild.props.style ?? {}),
      width: iconPx,
      height: iconPx,
      minWidth: iconPx,
      minHeight: iconPx,
    },
    "aria-hidden": onlyChild.props["aria-hidden"] ?? true,
  })
}

export const RootsIconButton = forwardRef<HTMLButtonElement, RootsIconButtonProps>(
  function RootsIconButton(
    {
      label,
      tone = "light",
      intent = "edit",
      surface = "light",
      size = "default",
      theme,
      emphasis,
      rowIntent,
      loading = false,
      disabled,
      className,
      style,
      type = "button",
      children,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onMouseDown,
      onMouseUp,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onKeyDown,
      onKeyUp,
      ...rest
    },
    ref,
  ) {
    const { state, interactionHandlers } = useRootsButtonInteraction({
      disabled,
      loading,
    })

    const spec =
      theme && emphasis
        ? { kind: "theme" as const, theme, emphasis }
        : rowIntent
          ? { kind: "row" as const, rowIntent }
          : resolveLegacyIconButtonSpec({ tone, surface, intent })

    const buttonStyle =
      spec.kind === "row"
        ? getIconButtonSpecStyle({
            rowIntent: spec.rowIntent,
            sizeId: size as IconButtonSizeId,
            state,
          })
        : getIconButtonSpecStyle({
            theme: spec.theme,
            emphasis: spec.emphasis,
            sizeId: size as IconButtonSizeId,
            state,
          })

    const iconPx = iconButtonSize(size as IconButtonSizeId).iconPx

    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        disabled={disabled || loading}
        className={cn(
          "appearance-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-current",
          className,
        )}
        style={{ ...buttonStyle, ...style }}
        onMouseEnter={(event) => {
          interactionHandlers.onMouseEnter()
          onMouseEnter?.(event)
        }}
        onMouseLeave={(event) => {
          interactionHandlers.onMouseLeave()
          onMouseLeave?.(event)
        }}
        onFocus={(event) => {
          interactionHandlers.onFocus(event)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          interactionHandlers.onBlur()
          onBlur?.(event)
        }}
        onPointerDown={(event) => {
          interactionHandlers.onPointerDown()
          onPointerDown?.(event)
        }}
        onPointerUp={(event) => {
          interactionHandlers.onPointerUp()
          onPointerUp?.(event)
        }}
        onPointerCancel={(event) => {
          interactionHandlers.onPointerCancel()
          onPointerCancel?.(event)
        }}
        onKeyDown={(event) => {
          interactionHandlers.onKeyDown(event)
          onKeyDown?.(event)
        }}
        onKeyUp={(event) => {
          interactionHandlers.onKeyUp(event)
          onKeyUp?.(event)
        }}
        {...rest}
      >
        {loading ? (
          <Loader2
            className="animate-spin"
            style={{ width: iconPx, height: iconPx }}
            aria-hidden
          />
        ) : (
          renderSizedIcon(children, iconPx)
        )}
      </button>
    )
  },
)
