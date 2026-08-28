"use client"

import type { OperationPurchaseRow } from "@/app/[siteId]/[popId]/operations/actions"
import { fetchOperationPurchaseById } from "@/lib/rootsyApi/operationsClient"
import { OperationPurchaseDetailMeta } from "@/app/[siteId]/[popId]/operations/OperationPurchaseDetailMeta"
import { OperationPurchaseDetailPayments } from "@/app/[siteId]/[popId]/operations/OperationPurchaseDetailPayments"
import { PurchaseDetailTicketView } from "@/app/[siteId]/[popId]/operations/PurchaseDetailTicketView"
import { opsDialogSectionTitle } from "@/app/[siteId]/[popId]/operations/operationDialogStyles"
import {
  LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX,
  layoutsOperarSummaryPanelMaxWidthClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
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
      <RootsDialogContent
        size="twoCol"
        className={`sm:max-w-[min(92vw,calc(21rem+${LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX}px+3rem))]`}
      >
        <RootsDialogHeader
          open={open}
          title="Detalle de compra"
          description="Detalle de compra"
          descriptionHidden
        />

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
      </RootsDialogContent>
    </Dialog>
  )
}
