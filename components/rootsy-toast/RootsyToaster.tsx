"use client"

import * as ToastPrimitives from "@radix-ui/react-toast"
import { RootsBannerIcon } from "@/components/rootsy-banner/RootsBannerIcon"
import { RootsyMensajeToast } from "@/components/rootsy-mensaje"
import {
  ROOTSY_MENSAJE_TOAST_DEFAULT_PLACEMENT,
  rootsyMensajePlacementParts,
  type RootsyMensajePlacement,
} from "@/components/rootsy-mensaje/rootsyMensaje"
import {
  ROOTSY_TOAST_DURATION_MS,
  type RootsyToastIntent,
} from "@/components/rootsy-toast/rootsyToast"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import "./rootsyToast.css"

function resolveToastIntent(intent: RootsyToastIntent | undefined, variant: string | undefined) {
  if (intent) return intent
  if (variant === "destructive") return "danger"
  return "neutral"
}

function viewportClass(placement: RootsyMensajePlacement | "top-center") {
  return `rootsy-toast-viewport is-${placement}`
}

export function RootsyToaster() {
  const { toasts } = useToast()
  const active = toasts[0]
  const mensajePlacement =
    active?.appearance === "mensaje"
      ? (active.placement ?? ROOTSY_MENSAJE_TOAST_DEFAULT_PLACEMENT)
      : undefined
  const viewportPlacement = mensajePlacement ?? "top-center"
  const swipeSide = mensajePlacement
    ? rootsyMensajePlacementParts(mensajePlacement).side
    : "right"

  return (
    <ToastPrimitives.Provider
      swipeDirection={swipeSide}
      duration={ROOTSY_TOAST_DURATION_MS}
    >
      <div className="rootsy-toast-layer rootsy-app-light">
        {toasts.map(function ({
          id,
          title,
          description,
          action,
          intent,
          dismissible,
          variant,
          className,
          appearance,
          portrait,
          portraitSrc,
          portraitAlt,
          eyebrow: _eyebrow,
          statusLabel,
          actionLabel,
          onAction,
          createdAt,
          placement,
          ...props
        }) {
          const resolvedIntent = resolveToastIntent(intent, variant)
          const showClose = dismissible || !Number.isFinite(props.duration ?? ROOTSY_TOAST_DURATION_MS)
          const closeToast = () => props.onOpenChange?.(false)
          const resolvedPlacement = placement ?? ROOTSY_MENSAJE_TOAST_DEFAULT_PLACEMENT

          if (appearance === "mensaje") {
            return (
              <ToastPrimitives.Root
                key={id}
                className={cn("rootsy-toast-mensaje", className)}
                data-intent={resolvedIntent}
                data-placement={resolvedPlacement}
                {...props}
              >
                <RootsyMensajeToast
                  intent={resolvedIntent}
                  placement={resolvedPlacement}
                  title={typeof title === "string" ? title : ""}
                  message={description}
                  portrait={portrait}
                  portraitSrc={portraitSrc}
                  portraitAlt={portraitAlt}
                  statusLabel={statusLabel}
                  actionLabel={actionLabel}
                  onAction={() => {
                    onAction?.()
                    closeToast()
                  }}
                  dismissible={showClose}
                  onDismiss={closeToast}
                  createdAt={createdAt}
                />
              </ToastPrimitives.Root>
            )
          }

          return (
            <ToastPrimitives.Root
              key={id}
              className={cn("rootsy-toast", className)}
              data-intent={resolvedIntent}
              {...props}
            >
              <RootsBannerIcon intent={resolvedIntent} />
              <div className="rootsy-toast-copy">
                {title ? (
                  <ToastPrimitives.Title className="rootsy-toast-title">{title}</ToastPrimitives.Title>
                ) : null}
                {description ? (
                  <ToastPrimitives.Description className="rootsy-toast-description">
                    {description}
                  </ToastPrimitives.Description>
                ) : null}
              </div>
              {action}
              {showClose ? (
                <ToastPrimitives.Close className="rootsy-toast-close" aria-label="Cerrar aviso">
                  <X className="size-3.5" strokeWidth={1.75} />
                </ToastPrimitives.Close>
              ) : null}
            </ToastPrimitives.Root>
          )
        })}
        <ToastPrimitives.Viewport className={viewportClass(viewportPlacement)} />
      </div>
    </ToastPrimitives.Provider>
  )
}
