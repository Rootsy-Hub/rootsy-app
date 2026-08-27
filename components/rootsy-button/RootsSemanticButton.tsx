"use client"

import {
  getButtonAppearanceStyle,
  resolveSemanticAppearance,
  type RootsButtonSpecShape,
  type RootsButtonSpecSize,
} from "@/components/rootsy-button/rootsButtonSpecRuntime"
import {
  resolveRootsButtonAtmosphere,
  type RootsButtonAtmosphere,
} from "@/components/rootsy-button/rootsButtonAtmosphere"
import { useRootsButtonAtmosphere } from "@/components/rootsy-button/rootsButtonAtmosphereContext"
import type { RootsButtonSemanticVariant } from "@/components/rootsy-button/rootsButtonStyles"
import { useRootsButtonInteraction } from "@/components/rootsy-button/useRootsButtonInteraction"
import {
  getButtonsUiAppearanceSurface,
  type IconButtonThemeId,
} from "@/app/library/ui-components/buttonsUiHardcodedSpec"
import { cn } from "@/lib/utils"
import { Loader2, type LucideIcon } from "lucide-react"
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react"

export type RootsButtonIconPosition = "left" | "right"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  semantic?: RootsButtonSemanticVariant
  size?: RootsButtonSpecSize
  /** default = radius.large · pill = radius.full (cápsula). */
  shape?: RootsButtonSpecShape
  /** Luz del handbook. Si no viene, hereda del provider o de `theme`. */
  atmosphere?: RootsButtonAtmosphere
  /** @deprecated Preferí `atmosphere`. workspace = bruma · pos = sombra. */
  theme?: IconButtonThemeId
  loading?: boolean
  loadingLabel?: string
  icon?: LucideIcon
  iconPosition?: RootsButtonIconPosition
  /** @deprecated Preferí `icon`. Reserva el gap si el ícono viene en children. */
  withIcon?: boolean
  children: ReactNode
}

export const RootsSemanticButton = forwardRef<HTMLButtonElement, Props>(function RootsSemanticButton(
  {
    semantic = "primary",
    size = "default",
    shape = "default",
    atmosphere,
    theme = "workspace",
    loading = false,
    loadingLabel,
    icon: Icon,
    iconPosition = "left",
    withIcon = false,
    disabled,
    className,
    style,
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
    ...props
  },
  ref,
) {
  const appearance = resolveSemanticAppearance(semantic)
  const inheritedAtmosphere = useRootsButtonAtmosphere(atmosphere)
  const resolvedAtmosphere = resolveRootsButtonAtmosphere({
    atmosphere: inheritedAtmosphere,
    theme,
  })
  const { state, interactionHandlers } = useRootsButtonInteraction({
    disabled,
    loading,
  })
  const showIcon = Boolean(Icon) && !loading
  const buttonStyle = getButtonAppearanceStyle(appearance, state, size, {
    withIcon: withIcon || showIcon || loading,
    theme,
    shape,
    atmosphere: resolvedAtmosphere,
  })
  const surface = getButtonsUiAppearanceSurface(
    appearance,
    state,
    theme,
    resolvedAtmosphere,
  )

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      data-rootsy-appearance={appearance}
      data-rootsy-atmosphere={resolvedAtmosphere}
      className={cn(
        "font-canopy shrink-0 appearance-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          {loadingLabel ?? surface.loadingLabel ?? children}
        </>
      ) : (
        <>
          {Icon && showIcon && iconPosition === "left" ? (
            <Icon className="size-4" aria-hidden />
          ) : null}
          {children}
          {Icon && showIcon && iconPosition === "right" ? (
            <Icon className="size-4" aria-hidden />
          ) : null}
        </>
      )}
    </button>
  )
})

export const RootsPrimaryButton = forwardRef<HTMLButtonElement, Omit<Props, "semantic">>(
  function RootsPrimaryButton(props, ref) {
    return <RootsSemanticButton ref={ref} semantic="primary" {...props} />
  },
)

export const RootsSubtleButton = forwardRef<HTMLButtonElement, Omit<Props, "semantic">>(
  function RootsSubtleButton(props, ref) {
    return <RootsSemanticButton ref={ref} semantic="tertiary" {...props} />
  },
)

export const RootsDefaultButton = forwardRef<HTMLButtonElement, Omit<Props, "semantic">>(
  function RootsDefaultButton(props, ref) {
    return <RootsSemanticButton ref={ref} semantic="secondary" {...props} />
  },
)

export const RootsDangerButton = forwardRef<HTMLButtonElement, Omit<Props, "semantic">>(
  function RootsDangerButton(props, ref) {
    return <RootsSemanticButton ref={ref} semantic="destructive" {...props} />
  },
)

export const RootsDangerSubtleButton = forwardRef<HTMLButtonElement, Omit<Props, "semantic">>(
  function RootsDangerSubtleButton(props, ref) {
    return <RootsSemanticButton ref={ref} semantic="destructiveSubtle" {...props} />
  },
)

export const RootsLinkButton = forwardRef<HTMLButtonElement, Omit<Props, "semantic">>(
  function RootsLinkButton(props, ref) {
    return <RootsSemanticButton ref={ref} semantic="link" {...props} />
  },
)
