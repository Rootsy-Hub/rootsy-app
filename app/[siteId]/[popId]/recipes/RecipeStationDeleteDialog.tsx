"use client"

import {
  RootsAlertDialogBodyText,
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
  RootsDialogErrorBanner,
} from "@/components/rootsy-dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"

export type RecipeStationDeleteTarget = {
  id: string
  name: string
  categoryCount: number | null
}

type Props = {
  open: boolean
  target: RecipeStationDeleteTarget | null
  banner: string | null
  busy: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onConfirmDelete: () => void
}

const nameEmphasisClass = "font-medium text-[var(--rootsy-bruma-900)]"

export function RecipeStationDeleteDialog({
  open,
  target,
  banner,
  busy,
  onOpenChange,
  onClose,
  onConfirmDelete,
}: Props) {
  const blocked =
    target != null && target.categoryCount != null && target.categoryCount > 0
  const ready = target != null && target.categoryCount === 0
  const checking = target != null && target.categoryCount === null
  const stationName = target?.name || "seleccionada"
  const categoryCountLabel =
    target?.categoryCount === 1
      ? "1 categoría asociada"
      : `${target?.categoryCount ?? 0} categorías asociadas`

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (busy && !nextOpen) return
        onOpenChange(nextOpen)
      }}
    >
      <RootsAlertDialogContent nested>
        {checking ? (
          <RootsAlertDialogPanel title="Eliminar estación">
            <div className="flex items-center gap-2">
              <Spinner className="size-4 shrink-0" aria-hidden />
              <RootsAlertDialogBodyText>
                Verificando categorías relacionadas…
              </RootsAlertDialogBodyText>
            </div>
          </RootsAlertDialogPanel>
        ) : blocked ? (
          <RootsAlertDialogPanel
            title="No se puede eliminar"
            description={
              <>
                La estación{" "}
                <strong className={nameEmphasisClass}>{stationName}</strong>{" "}
                tiene{" "}
                <strong className={nameEmphasisClass}>{categoryCountLabel}</strong>.
              </>
            }
          >
            <RootsAlertDialogBodyText>
              Para eliminar, desasociá esas categorías primero: cambiáles la
              comanda.
            </RootsAlertDialogBodyText>
          </RootsAlertDialogPanel>
        ) : (
          <RootsAlertDialogPanel
            title="Eliminar estación"
            description={
              <>
                ¿Eliminar la estación{" "}
                <strong className={nameEmphasisClass}>{stationName}</strong>?
                Esta acción no se puede deshacer.
              </>
            }
          />
        )}

        {banner ? (
          <RootsDialogErrorBanner className="mx-[var(--rootsy-space-400)] mb-0 mt-0">
            {banner}
          </RootsDialogErrorBanner>
        ) : null}

        {blocked ? (
          <RootsAlertDialogFooter
            hideCancel
            confirmLabel="Entendido"
            onConfirm={onClose}
          />
        ) : (
          <RootsAlertDialogFooter
            cancelLabel="Cancelar"
            confirmLabel={busy ? "Eliminando…" : "Eliminar"}
            destructive
            confirmDisabled={busy || checking || !ready}
            cancelDisabled={busy || checking}
            onCancel={onClose}
            onConfirm={onConfirmDelete}
          />
        )}
      </RootsAlertDialogContent>
    </AlertDialog>
  )
}
