"use client"

import { getIconButtonSpecStyle } from "@/components/rootsy-button/rootsButtonSpecRuntime"
import { useRootsButtonInteraction } from "@/components/rootsy-button/useRootsButtonInteraction"
import type { RootsIconButtonSize } from "@/components/rootsy-button/rootsButtonStyles"
import {
  eterHeaderTextShadow,
  getEterDangerSurface,
  getEterPrimarySurface,
  getEterSubtleSurface,
} from "@/lib/eter/eterChrome"
import { iconButtonSize, type IconButtonSizeId } from "@/app/library/ui-components/buttonsUiHardcodedSpec"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Children,
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react"

type EterIconIntent = "subtle" | "primary" | "danger"

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> & {
  label: string
  size?: RootsIconButtonSize
  intent?: EterIconIntent
  href?: string
  children: ReactNode
}

export function EterIconButton({
  label,
  size = "default",
  intent = "subtle",
  href,
  disabled,
  className,
  style,
  children,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  ...rest
}: Props) {
  const { state, interactionHandlers } = useRootsButtonInteraction({ disabled })
  const layout = getIconButtonSpecStyle({
    theme: "workspace",
    emphasis: "ghost",
    sizeId: size as IconButtonSizeId,
    state,
  })
  const surface =
    intent === "danger"
      ? getEterDangerSurface(state)
      : intent === "primary"
        ? getEterPrimarySurface(state)
        : getEterSubtleSurface(state)
  const iconPx = iconButtonSize(size as IconButtonSizeId).iconPx
  const child = Children.only(children)
  const content = isValidElement<{
    className?: string
    style?: CSSProperties
    size?: number
    width?: number
    height?: number
    "aria-hidden"?: boolean
  }>(child)
    ? cloneElement(child, {
        size: iconPx,
        width: iconPx,
        height: iconPx,
        className: cn(child.props.className),
        style: {
          ...(child.props.style ?? {}),
          width: iconPx,
          height: iconPx,
          minWidth: iconPx,
          minHeight: iconPx,
        },
        "aria-hidden": child.props["aria-hidden"] ?? true,
      })
    : child

  const chromeStyle: CSSProperties = {
    ...layout,
    ...surface,
    textShadow: eterHeaderTextShadow,
    ...style,
  }
  const chromeClass = cn(
    "appearance-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-current",
    disabled && href && "pointer-events-none opacity-40",
    className,
  )
  const handlers = {
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      interactionHandlers.onMouseEnter()
      onMouseEnter?.(event as MouseEvent<HTMLButtonElement>)
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      interactionHandlers.onMouseLeave()
      onMouseLeave?.(event as MouseEvent<HTMLButtonElement>)
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      interactionHandlers.onFocus(event as FocusEvent<HTMLButtonElement>)
      onFocus?.(event as FocusEvent<HTMLButtonElement>)
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      interactionHandlers.onBlur()
      onBlur?.(event as FocusEvent<HTMLButtonElement>)
    },
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      interactionHandlers.onPointerDown()
      onPointerDown?.(event as PointerEvent<HTMLButtonElement>)
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      interactionHandlers.onPointerUp()
      onPointerUp?.(event as PointerEvent<HTMLButtonElement>)
    },
    onPointerCancel: (event: PointerEvent<HTMLElement>) => {
      interactionHandlers.onPointerCancel()
      onPointerCancel?.(event as PointerEvent<HTMLButtonElement>)
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      interactionHandlers.onKeyDown(event as KeyboardEvent<HTMLButtonElement>)
      onKeyDown?.(event as KeyboardEvent<HTMLButtonElement>)
    },
    onKeyUp: (event: KeyboardEvent<HTMLElement>) => {
      interactionHandlers.onKeyUp(event as KeyboardEvent<HTMLButtonElement>)
      onKeyUp?.(event as KeyboardEvent<HTMLButtonElement>)
    },
  }

  if (href && !disabled) {
    return (
      <Link
        href={href}
        aria-label={label}
        title={label}
        className={chromeClass}
        style={chromeStyle}
        {...handlers}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={chromeClass}
      style={chromeStyle}
      {...handlers}
      {...rest}
    >
      {content}
    </button>
  )
}
