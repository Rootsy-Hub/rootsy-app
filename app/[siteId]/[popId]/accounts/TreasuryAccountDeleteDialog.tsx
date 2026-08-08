"use client"

import { treasuryAccountDeleteConfirmPhrase } from "@/app/[siteId]/[popId]/accounts/treasuryAccountConstants"
import {
  RootsDangerButton,
  RootsProgressButton,
  RootsSubtleButton,
  rootsButtonClassForVariant,
} from "@/components/rootsy-button"
import {
  RootsAlertDialogContent,
  RootsDialogErrorBanner,
  rootsAlertDialogContentClass,
  rootsAlertDialogDescriptionClass,
  rootsAlertDialogFooterClass,
  rootsAlertDialogTitleClass,
} from "@/components/rootsy-dialog"
import { rootsFormTextFieldClass } from "@/components/rootsy-form/rootsFormStyles"
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

type Props = {
  open: boolean
  accountName: string | null
  confirmValue: string
  banner: string | null
  busy: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onConfirmValueChange: (value: string) => void
  onConfirmDelete: () => void
  onAfterClose?: () => void
}

export function TreasuryAccountDeleteDialog({
  open,
  accountName,
  confirmValue,
  banner,
  busy,
  onOpenChange,
  onClose,
  onConfirmValueChange,
  onConfirmDelete,
  onAfterClose,
}: Props) {
  const wasOpenRef = useRef(false)
  const name = accountName?.trim() || "esta cuenta"
  const confirmPhrase = treasuryAccountDeleteConfirmPhrase(name)
  const confirmReady = confirmValue.trim() === confirmPhrase

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      return
    }
    if (!wasOpenRef.current) return
    const timer = window.setTimeout(() => {
      wasOpenRef.current = false
      onAfterClose?.()
    }, 220)
    return () => window.clearTimeout(timer)
  }, [open, onAfterClose])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <RootsAlertDialogContent>
        <div className={rootsAlertDialogContentClass}>
          <div className="flex flex-col gap-1">
            <AlertDialogTitle className={rootsAlertDialogTitleClass}>
              Eliminar {name}
            </AlertDialogTitle>
            <AlertDialogDescription className={rootsAlertDialogDescriptionClass}>
              Esta acción no se puede deshacer. Para confirmar, escribí &quot;
              <span className="select-all font-medium text-[var(--rootsy-bruma-900)]">
                {confirmPhrase}
              </span>
              &quot;. No se borran movimientos ya registrados.
            </AlertDialogDescription>
          </div>

          <Input
            autoComplete="off"
            value={confirmValue}
            onChange={(event) => onConfirmValueChange(event.target.value)}
            placeholder={confirmPhrase}
            disabled={busy}
            className={rootsFormTextFieldClass}
            aria-label={`Confirmación: ${confirmPhrase}`}
          />

          {banner ? (
            <RootsDialogErrorBanner className="mb-0">{banner}</RootsDialogErrorBanner>
          ) : null}
        </div>

        <AlertDialogFooter className={cn(rootsAlertDialogFooterClass, "sm:justify-between")}>
          <RootsSubtleButton type="button" onClick={onClose} disabled={busy}>
            Cancelar
          </RootsSubtleButton>
          {busy ? (
            <RootsProgressButton
              type="button"
              semantic="destructive"
              className={rootsButtonClassForVariant("destructive", "shrink-0")}
              loading
              loadingLabel="Eliminando…"
              disabled
            >
              Eliminar definitivamente
            </RootsProgressButton>
          ) : (
            <RootsDangerButton
              type="button"
              className="shrink-0"
              disabled={!confirmReady}
              onClick={onConfirmDelete}
            >
              Eliminar definitivamente
            </RootsDangerButton>
          )}
        </AlertDialogFooter>
      </RootsAlertDialogContent>
    </AlertDialog>
  )
}
