"use client"

import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogFooterByVariant,
  RootsDialogHeader,
  rootsDialogDetailValueMultilineClass,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceName: string
  contractText: string
}

export function ServiceOperateContractDialog({
  open,
  onOpenChange,
  serviceName,
  contractText,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default" className="sm:max-w-lg">
        <RootsDialogHeader
          title="Contrato"
          description={`Plantilla asociada a ${serviceName.trim() || "este servicio"}.`}
        />
        <RootsDialogBody>
          <div className={rootsDialogDetailValueMultilineClass}>{contractText}</div>
        </RootsDialogBody>
        <RootsDialogFooterByVariant
          variant="single"
          confirmLabel="Cerrar"
          onClose={() => onOpenChange(false)}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
