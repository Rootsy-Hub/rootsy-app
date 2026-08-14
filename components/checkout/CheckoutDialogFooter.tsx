"use client"

import { RootsDialogFooter } from "@/components/rootsy-dialog"
import {
  RootsProgressButton,
  RootsPrimaryButton,
  RootsSubtleButton,
} from "@/components/rootsy-button"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type CheckoutDialogFooterAction = {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  loadingLabel?: string
  icon?: LucideIcon
  tone?: "neutral" | "destructive"
  title?: string
}

type Props = {
  /** Cierra el modal sin confirmar (izquierda). */
  onCancel?: () => void
  cancelDisabled?: boolean
  /** Acción neutra extra a la izquierda (ej. Quitar descuento). */
  secondaryAction?: CheckoutDialogFooterAction
  /** Acción principal a la derecha (Listo, Aplicar, Confirmar…). */
  primary?: CheckoutDialogFooterAction
  className?: string
}

export function CheckoutDialogFooter({
  onCancel,
  cancelDisabled,
  secondaryAction,
  primary,
  className,
}: Props) {
  if (!onCancel && !secondaryAction && !primary) {
    return null
  }

  return (
    <RootsDialogFooter className={className}>
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {secondaryAction ? (
            <RootsSubtleButton
              type="button"
              className={cn(
                secondaryAction.tone === "destructive" &&
                  "text-rose-600 hover:bg-rose-50 hover:text-rose-700",
              )}
              disabled={secondaryAction.disabled}
              title={secondaryAction.title}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.icon ? (
                <secondaryAction.icon className="size-4" aria-hidden />
              ) : null}
              {secondaryAction.label}
            </RootsSubtleButton>
          ) : null}
          {onCancel ? (
            <RootsSubtleButton
              type="button"
              disabled={cancelDisabled}
              onClick={onCancel}
            >
              Cancelar
            </RootsSubtleButton>
          ) : null}
        </div>
        {primary ? (
          primary.loading ? (
            <RootsProgressButton
              type="button"
              semantic="primary"
              className="shrink-0"
              disabled={primary.disabled}
              loading={primary.loading}
              loadingLabel={primary.loadingLabel ?? primary.label}
              icon={primary.icon}
              title={primary.title}
              onClick={primary.onClick}
            >
              {primary.label}
            </RootsProgressButton>
          ) : (
            <RootsPrimaryButton
              type="button"
              className="shrink-0"
              disabled={primary.disabled}
              title={primary.title}
              onClick={primary.onClick}
            >
              {primary.icon ? (
                <primary.icon className="size-4" aria-hidden />
              ) : null}
              {primary.label}
            </RootsPrimaryButton>
          )
        ) : null}
      </div>
    </RootsDialogFooter>
  )
}
