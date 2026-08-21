"use client"

import { RootsConfirmDialog } from "@/components/rootsy-dialog"

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
    <RootsConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="¿Eliminar movimiento?"
      description="Se borra del libro y el saldo se recalcula. Usalo solo para correcciones."
      confirmLabel="Eliminar"
      busyConfirmLabel="Eliminando…"
      busy={busy}
      error={banner}
      destructive
      onConfirm={onConfirm}
    />
  )
}
