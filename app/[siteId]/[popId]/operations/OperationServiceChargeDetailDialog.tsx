"use client"

import type { OperationServiceChargeRow } from "@/app/[siteId]/[popId]/operations/actions"
import { OperationServiceChargeDetailMeta } from "@/app/[siteId]/[popId]/operations/OperationServiceChargeDetailMeta"
import { OperationServiceChargeDetailPayments } from "@/app/[siteId]/[popId]/operations/OperationServiceChargeDetailPayments"
import { ServiceChargeDetailSummaryView } from "@/app/[siteId]/[popId]/operations/ServiceChargeDetailSummaryView"
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
      <RootsDialogContent
        size="twoCol"
        className={`sm:max-w-[min(92vw,calc(21rem+${LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX}px+3rem))]`}
      >
        <RootsDialogHeader
          open={open}
          title={charge ? `Detalle de ${charge.serviceName}` : "Detalle de servicio"}
          description={
            charge
              ? `Detalle del servicio ${charge.serviceName} para ${charge.clientName}`
              : "Detalle de servicio"
          }
          descriptionHidden
        />

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
      </RootsDialogContent>
    </Dialog>
  )
}
