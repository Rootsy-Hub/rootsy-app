"use client"

import { getButtonAppearanceStyle, getIconButtonSpecStyle } from "@/components/rootsy-button/rootsButtonSpecRuntime"
import { useRootsButtonInteraction } from "@/components/rootsy-button/useRootsButtonInteraction"
import {
  eterHeaderTextShadow,
  getEterDangerSurface,
  getEterSubtleSurface,
} from "@/lib/eter/eterChrome"
import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react"

type HomeSubtleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  withIcon?: boolean
  children: ReactNode
}

export function HomeSubtleButton({
  withIcon = false,
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
  ...props
}: HomeSubtleButtonProps) {
  const { state, interactionHandlers } = useRootsButtonInteraction({ disabled })
  const layout = getButtonAppearanceStyle("subtle", state, "compact", { withIcon })
  const surface = getEterSubtleSurface(state)

  const buttonStyle: CSSProperties = {
    ...layout,
    ...surface,
    textShadow: eterHeaderTextShadow,
    ...style,
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "font-canopy shrink-0 appearance-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      style={buttonStyle}
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
      {...props}
    >
      {children}
    </button>
  )
}

type HomeLogoutButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  children: ReactNode
}

export function HomeLogoutButton({
  label,
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
  ...props
}: HomeLogoutButtonProps) {
  const { state, interactionHandlers } = useRootsButtonInteraction({ disabled })
  const layout = getIconButtonSpecStyle({
    rowIntent: "destructive",
    sizeId: "default",
    state,
  })
  const surface = getEterDangerSurface(state)

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "appearance-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-current [&_svg]:size-5",
        className,
      )}
      style={{ ...layout, ...surface, ...style }}
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
      {...props}
    >
      {children}
    </button>
  )
}
