"use client"

import {
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
} from "@/components/rootsy-dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import type { ReactNode } from "react"

type Props = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  busy?: boolean
  children?: ReactNode
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ChatRootsyWriteConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busy = false,
  children,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return
        onOpenChange(next)
      }}
    >
      <RootsAlertDialogContent>
        <RootsAlertDialogPanel title={title} description={description}>
          {children}
        </RootsAlertDialogPanel>
        <RootsAlertDialogFooter
          cancelLabel="Volver"
          confirmLabel={confirmLabel}
          confirmDisabled={busy}
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
