"use client"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
  saleOpDialogFooter,
  saleOpDialogPrimaryBtn,
  saleOpDialogSecondaryBtn,
} from "@/components/sale-operation/saleOperationStyles"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type CheckoutDialogFooterAction = {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  loadingLabel?: string
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
              className={saleOpDialogSecondaryBtn}
              disabled={secondaryAction.disabled}
              onClick={secondaryAction.onClick}
            >
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
          <Button
            type="button"
            className={cn(saleOpDialogPrimaryBtn, "shrink-0")}
            disabled={primary.disabled || primary.loading}
            onClick={primary.onClick}
          >
            {primary.loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {primary.loadingLabel ?? primary.label}
              </>
            ) : (
              primary.label
            )}
          </Button>
        ) : null}
      </div>
    </DialogFooter>
  )
}
