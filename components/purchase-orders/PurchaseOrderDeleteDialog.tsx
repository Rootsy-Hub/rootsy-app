"use client"

import type { PurchaseOrderTableRow } from "@/lib/purchaseOrderTypes"
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
  order: PurchaseOrderTableRow | null
  busy?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function PurchaseOrderDeleteDialog({
  open,
  order,
  busy = false,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar orden de compra?</AlertDialogTitle>
          <AlertDialogDescription>
            {order
              ? `Se eliminará la orden N.º ${order.orderNumber} de ${order.supplierName || "Sin proveedor"}. Esta acción no se puede deshacer.`
              : "Se eliminará la orden de compra seleccionada."}
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
