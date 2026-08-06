"use client"

import type { TreasuryAccountTableRow } from "@/app/[siteId]/[popId]/accounts/actions"
import {
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
} from "@/components/rootsy-dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"

type Props = {
  open: boolean
  row: TreasuryAccountTableRow | null
  busy: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onConfirm: () => void
}

export function TreasuryAccountDeleteDialog({
  open,
  row,
  busy,
  onOpenChange,
  onCancel,
  onConfirm,
}: Props) {
  const name = row?.name?.trim() || "este medio"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <RootsAlertDialogContent>
        <RootsAlertDialogPanel
          title="¿Eliminar esta cuenta?"
          description={
            <>
              Se quitará{" "}
              <strong className="font-medium text-[var(--rootsy-bruma-900)]">
                {name}
              </strong>{" "}
              de tesorería. No se borran movimientos ya registrados.
            </>
          }
        />
        <RootsAlertDialogFooter
          cancelLabel="Cancelar"
          confirmLabel={busy ? "Eliminando…" : "Eliminar"}
          onCancel={onCancel}
          onConfirm={onConfirm}
          destructive
          confirmDisabled={busy}
          className="sm:justify-between"
        />
      </RootsAlertDialogContent>
    </AlertDialog>
  )
}
