"use client"

import {
  RootsAlertDialogBodyText,
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
  RootsDialogErrorBanner,
} from "@/components/rootsy-dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"

export type PriceListDeleteTarget = {
  id: string
  name: string
}

type Props = {
  open: boolean
  target: PriceListDeleteTarget | null
  banner: string | null
  busy: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onConfirmDelete: () => void
}

const nameEmphasisClass = "font-medium text-[var(--rootsy-bruma-900)]"

export function ArticlePriceListDeleteDialog({
  open,
  target,
  banner,
  busy,
  onOpenChange,
  onClose,
  onConfirmDelete,
}: Props) {
  const listName = target?.name || "seleccionada"

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (busy && !nextOpen) return
        onOpenChange(nextOpen)
      }}
    >
      <RootsAlertDialogContent nested>
        <RootsAlertDialogPanel
          title="Eliminar lista"
          description={
            <>
              ¿Eliminar la lista{" "}
              <strong className={nameEmphasisClass}>{listName}</strong>? Esta
              acción no se puede deshacer.
            </>
          }
        >
          <RootsAlertDialogBodyText>
            Los precios específicos de esta lista se van a borrar. Los
            productos van a usar Principal.
          </RootsAlertDialogBodyText>
        </RootsAlertDialogPanel>

        {banner ? (
          <RootsDialogErrorBanner className="mx-[var(--rootsy-space-400)] mb-0 mt-0">
            {banner}
          </RootsDialogErrorBanner>
        ) : null}

        <RootsAlertDialogFooter
          cancelLabel="Cancelar"
          confirmLabel={busy ? "Eliminando…" : "Eliminar"}
          destructive
          confirmDisabled={busy || !target}
          cancelDisabled={busy}
          onCancel={onClose}
          onConfirm={onConfirmDelete}
        />
      </RootsAlertDialogContent>
    </AlertDialog>
  )
}
