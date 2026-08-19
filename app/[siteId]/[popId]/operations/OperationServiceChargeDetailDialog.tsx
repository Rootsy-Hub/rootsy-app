"use client"

import type { OperationServiceChargeRow } from "@/app/[siteId]/[popId]/operations/actions"
import { OperationServiceChargeDetailMeta } from "@/app/[siteId]/[popId]/operations/OperationServiceChargeDetailMeta"
import { OperationServiceChargeDetailPayments } from "@/app/[siteId]/[popId]/operations/OperationServiceChargeDetailPayments"
import { ServiceChargeDetailSummaryView } from "@/app/[siteId]/[popId]/operations/ServiceChargeDetailSummaryView"
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
  charge: OperationServiceChargeRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OperationServiceChargeDetailDialog({
  charge,
  open,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={opsDialogSurfaceMd}>
        <DialogHeader className={opsDialogHeader}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            {charge ? `Detalle de ${charge.serviceName}` : "Detalle de servicio"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {charge
              ? `Detalle del servicio ${charge.serviceName} para ${charge.clientName}`
              : "Detalle de servicio"}
          </DialogDescription>
        </DialogHeader>

        {charge ? (
          <div
            className={`grid min-h-0 flex-1 items-start lg:grid-cols-[minmax(17rem,21rem)_minmax(${LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX}px,1fr)]`}
          >
            <div className="min-h-0 overflow-y-auto overscroll-contain border-b border-border/50 bg-muted/20 px-5 py-4 lg:border-b-0 lg:border-r">
              <section>
                <h3 className={opsDialogSectionTitle}>Detalles</h3>
                <OperationServiceChargeDetailMeta charge={charge} />
              </section>

              <section className="mt-6">
                <h3 className={opsDialogSectionTitle}>Cobros</h3>
                <OperationServiceChargeDetailPayments charge={charge} />
              </section>
            </div>

            <div className="px-5 py-4 lg:pl-4">
              <div
                className={`mx-auto w-full ${layoutsOperarSummaryPanelMaxWidthClass}`}
              >
                <ServiceChargeDetailSummaryView
                  charge={charge}
                  showHeading={false}
                />
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
