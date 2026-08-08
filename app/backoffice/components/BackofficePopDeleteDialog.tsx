"use client"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type BackofficePopDeleteDialogProps = {
  open: boolean
  popName: string
  busy: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function BackofficePopDeleteDialog({
  open,
  popName,
  busy,
  error,
  onOpenChange,
  onConfirm,
}: BackofficePopDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar punto de venta?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{popName}</strong> quedará inactivo y dejará de estar
            disponible para operar. Podés reactivarlo manualmente desde la base
            de datos si hace falta.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Eliminando…" : "Eliminar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
