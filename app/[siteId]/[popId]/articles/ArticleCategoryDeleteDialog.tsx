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

type DeleteTarget = {
  id: string
  name: string
  articleCount: number | null
}

type Props = {
  open: boolean
  target: DeleteTarget | null
  banner: string | null
  busy: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onConfirmDelete: () => void
}

const nameEmphasisClass = "font-medium text-[var(--rootsy-bruma-900)]"

export function ArticleCategoryDeleteDialog({
  open,
  target,
  banner,
  busy,
  onOpenChange,
  onClose,
  onConfirmDelete,
}: Props) {
  const blocked =
    target != null && target.articleCount != null && target.articleCount > 0
  const ready = target != null && target.articleCount === 0
  const checking = target != null && target.articleCount === null
  const categoryName = target?.name || "seleccionada"
  const articleCountLabel =
    target?.articleCount === 1
      ? "1 artículo asociado"
      : `${target?.articleCount ?? 0} artículos asociados`

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
                Verificando artículos relacionados…
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
                <strong className={nameEmphasisClass}>{articleCountLabel}</strong>.
              </>
            }
          >
            <RootsAlertDialogBodyText>
              Para eliminar, desasociá esos artículos primero: cambiáles la
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
