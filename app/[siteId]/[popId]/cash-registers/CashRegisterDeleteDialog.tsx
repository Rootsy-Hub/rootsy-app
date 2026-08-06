"use client"

import {
  RootsAlertDialogBodyText,
  RootsAlertDialogContent,
  RootsAlertDialogPanel,
  RootsDialogErrorBanner,
} from "@/components/rootsy-dialog"
import {
  RootsDangerButton,
  RootsProgressButton,
  RootsSubtleButton,
} from "@/components/rootsy-button"
import { AlertDialog, AlertDialogFooter } from "@/components/ui/alert-dialog"
import { rootsAlertDialogFooterClass } from "@/components/rootsy-dialog/rootsDialogProductStyles"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  registerName: string | null
  banner: string | null
  busy: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onConfirm: () => void
}

export function CashRegisterDeleteDialog({
  open,
  registerName,
  banner,
  busy,
  onOpenChange,
  onCancel,
  onConfirm,
}: Props) {
  const name = registerName?.trim() || "esta caja"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <RootsAlertDialogContent>
        <RootsAlertDialogPanel
          title="¿Eliminar caja?"
          description="Esta acción no se puede deshacer."
        >
          <RootsAlertDialogBodyText>
            Se eliminará <strong className="font-medium text-[var(--rootsy-bruma-900)]">{name}</strong>{" "}
            y su historial. La caja debe estar cerrada.
          </RootsAlertDialogBodyText>
          {banner ? (
            <RootsDialogErrorBanner className="mb-0">{banner}</RootsDialogErrorBanner>
          ) : null}
        </RootsAlertDialogPanel>
        <AlertDialogFooter className={cn(rootsAlertDialogFooterClass, "sm:justify-between")}>
          <RootsSubtleButton type="button" onClick={onCancel} disabled={busy}>
            Cancelar
          </RootsSubtleButton>
          {busy ? (
            <RootsProgressButton
              type="button"
              semantic="destructive"
              loading
              loadingLabel="Eliminando…"
              disabled
              className="shrink-0"
            >
              Eliminar
            </RootsProgressButton>
          ) : (
            <RootsDangerButton type="button" onClick={onConfirm} className="shrink-0">
              Eliminar
            </RootsDangerButton>
          )}
        </AlertDialogFooter>
      </RootsAlertDialogContent>
    </AlertDialog>
  )
}
