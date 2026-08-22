"use client"

import {
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
} from "@/components/rootsy-dialog/RootsAlertDialog"
import { RootsDialogErrorBanner } from "@/components/rootsy-dialog/RootsDialogForm"
import { useFrozenWhileClosing } from "@/components/rootsy-dialog/useFrozenWhileClosing"
import { AlertDialog } from "@/components/ui/alert-dialog"
import type { ReactNode } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  busy?: boolean
  busyConfirmLabel?: string
  error?: ReactNode | null
  confirmDisabled?: boolean
  destructive?: boolean
  onConfirm: () => void
}

export function RootsConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  busy = false,
  busyConfirmLabel,
  error,
  confirmDisabled,
  destructive = false,
  onConfirm,
}: Props) {
  const frozenTitle = useFrozenWhileClosing(open, title)
  const frozenDescription = useFrozenWhileClosing(open, description)
  const frozenError = useFrozenWhileClosing(open, error ?? null)
  const frozenConfirmLabel = useFrozenWhileClosing(
    open,
    busy ? (busyConfirmLabel ?? confirmLabel) : confirmLabel,
  )

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (busy && !nextOpen) return
        onOpenChange(nextOpen)
      }}
    >
      <RootsAlertDialogContent>
        <RootsAlertDialogPanel
          title={frozenTitle}
          description={frozenDescription}
        />
        {frozenError ? (
          <RootsDialogErrorBanner className="mx-[var(--rootsy-space-400)] mb-0 mt-0">
            {frozenError}
          </RootsDialogErrorBanner>
        ) : null}
        <RootsAlertDialogFooter
          cancelLabel={cancelLabel}
          confirmLabel={frozenConfirmLabel}
          destructive={destructive}
          confirmDisabled={busy || confirmDisabled}
          cancelDisabled={busy}
          onCancel={() => {
            if (busy) return
            onOpenChange(false)
          }}
          onConfirm={onConfirm}
        />
      </RootsAlertDialogContent>
    </AlertDialog>
  )
}
