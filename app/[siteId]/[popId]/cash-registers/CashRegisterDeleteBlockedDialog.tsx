"use client"

import {
  RootsAlertDialogBodyText,
  RootsAlertDialogContent,
  RootsAlertDialogPanel,
  rootsAlertDialogFooterClass,
} from "@/components/rootsy-dialog"
import { RootsPrimaryButton } from "@/components/rootsy-button"
import { AlertDialog, AlertDialogFooter } from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  registerName: string | null
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export function CashRegisterDeleteBlockedDialog({
  open,
  registerName,
  onOpenChange,
  onClose,
}: Props) {
  const name = registerName?.trim() || "esta caja"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <RootsAlertDialogContent>
        <RootsAlertDialogPanel
          title="No se puede eliminar la caja"
          description="Hay un turno abierto."
        >
          <RootsAlertDialogBodyText>
            Cerrá el turno de <strong className="font-medium text-[var(--rootsy-bruma-900)]">{name}</strong>{" "}
            antes de eliminarla.
          </RootsAlertDialogBodyText>
        </RootsAlertDialogPanel>
        <AlertDialogFooter className={cn(rootsAlertDialogFooterClass, "sm:justify-end")}>
          <RootsPrimaryButton type="button" onClick={onClose}>
            Entendido
          </RootsPrimaryButton>
        </AlertDialogFooter>
      </RootsAlertDialogContent>
    </AlertDialog>
  )
}
