"use client"

import * as ToastPrimitives from "@radix-ui/react-toast"
import { RootsBannerIcon } from "@/components/rootsy-banner/RootsBannerIcon"
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

export function RootsyToaster() {
  const { toasts } = useToast()

  return (
    <ToastPrimitives.Provider swipeDirection="right" duration={ROOTSY_TOAST_DURATION_MS}>
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
          ...props
        }) {
          const resolvedIntent = resolveToastIntent(intent, variant)
          const showClose = dismissible || !Number.isFinite(props.duration ?? ROOTSY_TOAST_DURATION_MS)

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
        <ToastPrimitives.Viewport className="rootsy-toast-viewport" />
      </div>
    </ToastPrimitives.Provider>
  )
}
