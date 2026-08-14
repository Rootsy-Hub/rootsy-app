"use client"

import {
  getButtonAppearanceStyle,
  resolveSemanticAppearance,
  type RootsButtonSpecSize,
} from "@/components/rootsy-button/rootsButtonSpecRuntime"
import type { RootsButtonSemanticVariant } from "@/components/rootsy-button/rootsButtonStyles"
import { useRootsButtonInteraction } from "@/components/rootsy-button/useRootsButtonInteraction"
import { getButtonsUiAppearanceSurface } from "@/app/library/ui-components/buttonsUiHardcodedSpec"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  semantic?: RootsButtonSemanticVariant
  size?: RootsButtonSpecSize
  loading?: boolean
  loadingLabel?: string
  withIcon?: boolean
  children: ReactNode
}

export const RootsSemanticButton = forwardRef<HTMLButtonElement, Props>(function RootsSemanticButton(
  {
    semantic = "primary",
    size = "default",
    loading = false,
    loadingLabel,
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
  const { state, interactionHandlers } = useRootsButtonInteraction({
    disabled,
    loading,
  })
  const buttonStyle = getButtonAppearanceStyle(appearance, state, size, { withIcon })
  const surface = getButtonsUiAppearanceSurface(appearance, state)

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
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
        children
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
