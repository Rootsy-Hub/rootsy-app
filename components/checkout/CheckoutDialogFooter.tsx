"use client"

import { RootsProgressButton } from "@/components/rootsy-button"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
  saleOpDialogFooter,
  saleOpDialogPrimaryBtn,
  saleOpDialogSecondaryBtn,
} from "@/components/sale-operation/saleOperationStyles"
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
    <DialogFooter className={cn(saleOpDialogFooter, "shrink-0", className)}>
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {secondaryAction ? (
            <Button
              type="button"
              variant="ghost-neutral"
              className={cn(
                saleOpDialogSecondaryBtn,
                secondaryAction.tone === "destructive" &&
                  "text-rose-600 hover:bg-rose-50 hover:text-rose-700",
              )}
              disabled={secondaryAction.disabled}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.icon ? (
                <secondaryAction.icon className="size-4" aria-hidden />
              ) : null}
              {secondaryAction.label}
            </Button>
          ) : null}
          {onCancel ? (
            <Button
              type="button"
              variant="ghost-neutral"
              className={saleOpDialogSecondaryBtn}
              disabled={cancelDisabled}
              onClick={onCancel}
            >
              Cancelar
            </Button>
          ) : null}
        </div>
        {primary ? (
          <RootsProgressButton
            type="button"
            className={cn(saleOpDialogPrimaryBtn, "shrink-0")}
            disabled={primary.disabled}
            loading={primary.loading}
            loadingLabel={primary.loadingLabel ?? primary.label}
            icon={primary.icon}
            onClick={primary.onClick}
          >
            {primary.label}
          </RootsProgressButton>
        ) : null}
      </div>
    </DialogFooter>
  )
}
