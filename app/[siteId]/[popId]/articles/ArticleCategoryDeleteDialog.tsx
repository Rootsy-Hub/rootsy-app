"use client"

import {
  RootsDangerButton,
  RootsPrimaryButton,
  RootsProgressButton,
  RootsSubtleButton,
  rootsButtonClassForVariant,
  rootsButtonVariant,
} from "@/components/rootsy-button"
import { RootsDialogErrorBanner } from "@/components/rootsy-dialog"
import { rootsFormEarthTextClass } from "@/components/rootsy-form/rootsFormEarthTokens"
import { saleOpAlertDialogContent } from "@/components/sale-operation/saleOperationStyles"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
    target != null &&
    target.articleCount != null &&
    target.articleCount > 0
  const ready = target != null && target.articleCount === 0
  const checking = target != null && target.articleCount === null
  const categoryName = target?.name || "seleccionada"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={saleOpAlertDialogContent}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked ? "No se puede eliminar" : "Eliminar categoría"}
          </AlertDialogTitle>
          {checking ? (
            <AlertDialogDescription asChild>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Spinner className="size-4 shrink-0" aria-hidden />
                <span>Verificando artículos relacionados…</span>
              </div>
            </AlertDialogDescription>
          ) : blocked ? (
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                <p>
                  La categoría{" "}
                  <strong className={rootsFormEarthTextClass}>{categoryName}</strong>{" "}
                  tiene{" "}
                  <strong className={rootsFormEarthTextClass}>
                    {target?.articleCount === 1
                      ? "1 artículo relacionado"
                      : `${target?.articleCount ?? 0} artículos relacionados`}
                  </strong>
                  .
                </p>
                <p>
                  Para eliminar, cambiá la categoría de los artículos que la
                  utilizan actualmente.
                </p>
              </div>
            </AlertDialogDescription>
          ) : (
            <AlertDialogDescription asChild>
              <p className="text-sm text-muted-foreground">
                ¿Eliminar la categoría{" "}
                <strong className={rootsFormEarthTextClass}>{categoryName}</strong>
                ? Esta acción no se puede deshacer.
              </p>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {banner ? <RootsDialogErrorBanner className="mb-0">{banner}</RootsDialogErrorBanner> : null}

        <AlertDialogFooter>
          {blocked ? (
            <AlertDialogAction asChild>
              <RootsPrimaryButton type="button" onClick={onClose}>
                Entendido
              </RootsPrimaryButton>
            </AlertDialogAction>
          ) : (
            <>
              <RootsSubtleButton
                type="button"
                onClick={onClose}
                disabled={busy || checking}
              >
                Cancelar
              </RootsSubtleButton>
              {busy ? (
                <RootsProgressButton
                  type="button"
                  variant={rootsButtonVariant.destructive}
                  className={rootsButtonClassForVariant("destructive", "shrink-0")}
                  loading
                  loadingLabel="Eliminando…"
                  disabled
                >
                  Eliminar
                </RootsProgressButton>
              ) : (
                <RootsDangerButton
                  type="button"
                  disabled={!ready || checking}
                  onClick={onConfirmDelete}
                >
                  Eliminar
                </RootsDangerButton>
              )}
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
