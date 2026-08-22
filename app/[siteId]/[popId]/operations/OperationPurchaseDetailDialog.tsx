"use client"

import type { OperationPurchaseRow } from "@/app/[siteId]/[popId]/operations/actions"
import { fetchOperationPurchaseById } from "@/lib/rootsyApi/operationsClient"
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
import { useEffect, useState } from "react"

type Props = {
  purchase: OperationPurchaseRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  popId?: string
  timeZone?: string
}

export function OperationPurchaseDetailDialog({
  purchase,
  open,
  onOpenChange,
  popId,
  timeZone,
}: Props) {
  const [detail, setDetail] = useState<OperationPurchaseRow | null>(null)
  const resolved = detail ?? purchase

  useEffect(() => {
    if (!open || !purchase?.id || !popId) {
      setDetail(null)
      return
    }
    if ((purchase.lineItems?.length ?? 0) > 0) {
      setDetail(purchase)
      return
    }
    let cancelled = false
    void fetchOperationPurchaseById(popId, purchase.id).then((res) => {
      if (cancelled) return
      if (res.success) setDetail(res.purchase)
    })
    return () => {
      cancelled = true
    }
  }, [open, purchase, popId])

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

        {resolved ? (
          <div className={`grid min-h-0 flex-1 items-start lg:grid-cols-[minmax(17rem,21rem)_minmax(${LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX}px,1fr)]`}>
            <div className="min-h-0 overflow-y-auto overscroll-contain border-b border-border/50 bg-muted/20 px-5 py-4 lg:border-b-0 lg:border-r">
              <section>
                <h3 className={opsDialogSectionTitle}>Detalles</h3>
                <OperationPurchaseDetailMeta
                  purchase={resolved}
                  timeZone={timeZone}
                />
              </section>

              <section className="mt-6">
                <h3 className={opsDialogSectionTitle}>
                  Pagos
                  {resolved.payments.length > 1
                    ? ` (${resolved.payments.length})`
                    : ""}
                </h3>
                <OperationPurchaseDetailPayments
                  purchase={resolved}
                  timeZone={timeZone}
                />
              </section>
            </div>

            <div className="px-5 py-4 lg:pl-4">
              <div className={`mx-auto w-full ${layoutsOperarSummaryPanelMaxWidthClass}`}>
                <PurchaseDetailTicketView purchase={resolved} showHeading={false} />
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
