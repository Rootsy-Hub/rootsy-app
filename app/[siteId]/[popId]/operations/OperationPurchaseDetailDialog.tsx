"use client"

import type { OperationPurchaseRow } from "@/app/[siteId]/[popId]/operations/actions"
import { OperationPurchaseDetailMeta } from "@/app/[siteId]/[popId]/operations/OperationPurchaseDetailMeta"
import { OperationPurchaseDetailPayments } from "@/app/[siteId]/[popId]/operations/OperationPurchaseDetailPayments"
import { PurchaseDetailTicketView } from "@/app/[siteId]/[popId]/operations/PurchaseDetailTicketView"
import {
  opsDialogHeader,
  opsDialogSectionTitle,
  opsDialogSurfaceMd,
} from "@/app/[siteId]/[popId]/operations/operationDialogStyles"
import {
  LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX,
  layoutsOperarSummaryPanelMaxWidthClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  purchase: OperationPurchaseRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  timeZone?: string
}

export function OperationPurchaseDetailDialog({
  purchase,
  open,
  onOpenChange,
  timeZone,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={opsDialogSurfaceMd}>
        <DialogHeader className={opsDialogHeader}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Detalle de compra
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalle de compra
          </DialogDescription>
        </DialogHeader>

        {purchase ? (
          <div className={`grid min-h-0 flex-1 items-start lg:grid-cols-[minmax(17rem,21rem)_minmax(${LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX}px,1fr)]`}>
            <div className="min-h-0 overflow-y-auto overscroll-contain border-b border-border/50 bg-muted/20 px-5 py-4 lg:border-b-0 lg:border-r">
              <section>
                <h3 className={opsDialogSectionTitle}>Detalles</h3>
                <OperationPurchaseDetailMeta
                  purchase={purchase}
                  timeZone={timeZone}
                />
              </section>

              <section className="mt-6">
                <h3 className={opsDialogSectionTitle}>
                  Pagos
                  {purchase.payments.length > 1
                    ? ` (${purchase.payments.length})`
                    : ""}
                </h3>
                <OperationPurchaseDetailPayments
                  purchase={purchase}
                  timeZone={timeZone}
                />
              </section>
            </div>

            <div className="px-5 py-4 lg:pl-4">
              <div className={`mx-auto w-full ${layoutsOperarSummaryPanelMaxWidthClass}`}>
                <PurchaseDetailTicketView purchase={purchase} showHeading={false} />
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
