"use client"

import { getButtonAppearanceStyle, getIconButtonSpecStyle } from "@/components/rootsy-button/rootsButtonSpecRuntime"
import { useRootsButtonInteraction } from "@/components/rootsy-button/useRootsButtonInteraction"
import { cn } from "@/lib/utils"
import type { ButtonsUiInteractionState } from "@/app/library/ui-components/buttonsUiHardcodedSpec"
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react"

type HomeSubtleSurface = {
  backgroundColor: string
  color: string
  border: string
  boxShadow?: string
  opacity?: number
}

/** Misma receta subtle · luz del cristal del home, no chrome POS. */
function getHomeSubtleSurface(state: ButtonsUiInteractionState): HomeSubtleSurface {
  const base: HomeSubtleSurface = {
    backgroundColor: "transparent",
    color: "rgba(255,255,255,0.72)",
    border: "1px solid transparent",
  }

  switch (state) {
    case "default":
      return base
    case "hover":
      return {
        ...base,
        backgroundColor: "rgba(255,255,255,0.08)",
        color: "rgba(255,255,255,0.96)",
      }
    case "active":
      return {
        ...base,
        backgroundColor: "rgba(255,255,255,0.12)",
        color: "#ffffff",
      }
    case "focus":
      return {
        ...base,
        boxShadow: "0 0 0 2px rgba(255,255,255,0.22)",
      }
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "loading":
      return { ...base, opacity: 0.92 }
  }
}

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
  const surface = getHomeSubtleSurface(state)

  const buttonStyle: CSSProperties = {
    ...layout,
    ...surface,
    textShadow: "0 1px 2px rgba(0,0,0,0.38)",
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

const HOME_DANGER = "#DC2626"
const HOME_DANGER_HOVER = "#EF4444"
const HOME_DANGER_ACTIVE = "#B91C1C"

function getHomeLogoutSurface(state: ButtonsUiInteractionState): HomeSubtleSurface {
  const base: HomeSubtleSurface = {
    backgroundColor: "transparent",
    color: "rgba(255,255,255,0.56)",
    border: "1px solid transparent",
  }

  switch (state) {
    case "default":
      return base
    case "hover":
      return {
        ...base,
        backgroundColor: `color-mix(in srgb, ${HOME_DANGER} 18%, transparent)`,
        color: HOME_DANGER_HOVER,
      }
    case "active":
      return {
        ...base,
        backgroundColor: `color-mix(in srgb, ${HOME_DANGER} 24%, transparent)`,
        color: HOME_DANGER_ACTIVE,
      }
    case "focus":
      return {
        ...base,
        boxShadow: "0 0 0 2px rgba(255,255,255,0.22)",
      }
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "loading":
      return { ...base, opacity: 0.92 }
  }
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
  const surface = getHomeLogoutSurface(state)

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
