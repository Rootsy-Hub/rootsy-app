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

export type RecipeCategoryDeleteTarget = {
  id: string
  name: string
  recipeCount: number | null
}

type Props = {
  open: boolean
  target: RecipeCategoryDeleteTarget | null
  banner: string | null
  busy: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onConfirmDelete: () => void
}

const nameEmphasisClass = "font-medium text-[var(--rootsy-bruma-900)]"

export function RecipeCategoryDeleteDialog({
  open,
  target,
  banner,
  busy,
  onOpenChange,
  onClose,
  onConfirmDelete,
}: Props) {
  const blocked =
    target != null && target.recipeCount != null && target.recipeCount > 0
  const ready = target != null && target.recipeCount === 0
  const checking = target != null && target.recipeCount === null
  const categoryName = target?.name || "seleccionada"
  const recipeCountLabel =
    target?.recipeCount === 1
      ? "1 receta asociada"
      : `${target?.recipeCount ?? 0} recetas asociadas`

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
          <RootsAlertDialogPanel title="Eliminar categoría">
            <div className="flex items-center gap-2">
              <Spinner className="size-4 shrink-0" aria-hidden />
              <RootsAlertDialogBodyText>
                Verificando recetas relacionadas…
              </RootsAlertDialogBodyText>
            </div>
          </RootsAlertDialogPanel>
        ) : blocked ? (
          <RootsAlertDialogPanel
            title="No se puede eliminar"
            description={
              <>
                La categoría{" "}
                <strong className={nameEmphasisClass}>{categoryName}</strong>{" "}
                tiene{" "}
                <strong className={nameEmphasisClass}>{recipeCountLabel}</strong>.
              </>
            }
          >
            <RootsAlertDialogBodyText>
              Para eliminar, desasociá esas recetas primero: cambiáles la
              categoría.
            </RootsAlertDialogBodyText>
          </RootsAlertDialogPanel>
        ) : (
          <RootsAlertDialogPanel
            title="Eliminar categoría"
            description={
              <>
                ¿Eliminar la categoría{" "}
                <strong className={nameEmphasisClass}>{categoryName}</strong>?
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
