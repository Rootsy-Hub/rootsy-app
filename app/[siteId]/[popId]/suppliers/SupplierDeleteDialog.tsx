"use client"

import { supplierDeleteConfirmPhrase } from "@/app/[siteId]/[popId]/suppliers/supplierConstants"
import {
  RootsDangerButton,
  RootsProgressButton,
  RootsSubtleButton,
  rootsButtonClassForVariant,
  rootsButtonVariant,
} from "@/components/rootsy-button"
import {
  RootsAlertDialogContent,
  RootsDialogErrorBanner,
} from "@/components/rootsy-dialog"
import { rootsFormTextFieldClass } from "@/components/rootsy-form/rootsFormStyles"
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState } from "react"

type Props = {
  open: boolean
  supplierName: string
  confirmValue: string
  banner: string | null
  busy: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onConfirmValueChange: (value: string) => void
  onConfirmDelete: () => void
  onAfterClose?: () => void
}

export function SupplierDeleteDialog({
  open,
  supplierName,
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
  const [mounted, setMounted] = useState(open)
  const name = supplierName.trim() || "este proveedor"
  const confirmPhrase = supplierDeleteConfirmPhrase(name)
  const confirmReady = confirmValue.trim() === confirmPhrase

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      setMounted(true)
      return
    }
    if (!wasOpenRef.current) return
    const timer = window.setTimeout(() => {
      wasOpenRef.current = false
      setMounted(false)
      onAfterClose?.()
    }, 220)
    return () => window.clearTimeout(timer)
  }, [open, onAfterClose])

  if (!mounted) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <RootsAlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar {name}</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Para confirmar, escribí (
            {confirmPhrase}) abajo.
          </AlertDialogDescription>
        </AlertDialogHeader>

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

        <AlertDialogFooter>
          <RootsSubtleButton type="button" onClick={onClose} disabled={busy}>
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
