"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  open: boolean
  banner: string | null
  busy: boolean
  onClose: () => void
  onConfirm: () => void
}

export function InventoryDeleteMovementDialog({
  open,
  banner,
  busy,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        data-rootsy-light-shell="true"
        showCloseButton
        className="border-border bg-card text-foreground sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>¿Eliminar movimiento?</DialogTitle>
        </DialogHeader>
        {banner ? (
          <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {banner}
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          Se borra del libro y el saldo se recalcula. Usalo solo para
          correcciones.
        </p>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
