"use client"

import type { SaleQuoteTableRow } from "@/lib/saleQuoteTypes"
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
import { Loader2 } from "lucide-react"

type Props = {
  open: boolean
  quote: SaleQuoteTableRow | null
  busy?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function SaleQuoteDeleteDialog({
  open,
  quote,
  busy = false,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
          <AlertDialogDescription>
            {quote
              ? `Se eliminará el presupuesto N.º ${quote.quoteNumber} de ${quote.customerName || "Sin cliente"}. Esta acción no se puede deshacer.`
              : "Se eliminará el presupuesto seleccionado."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
          <Button variant="destructive" disabled={busy} onClick={onConfirm}>
            {busy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Eliminando…
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
