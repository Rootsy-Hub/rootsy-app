"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import type { ServiceChargeCreateWizardForm } from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import { ServiceOperateChargeSnapshotContent } from "@/components/service-operation/ServiceOperateChargeSnapshotContent"
import {
  layoutsOperarSummaryCartHeadingClass,
  layoutsOperarSummaryCartListSurfaceClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  layoutsOperarTicketProposalActionsClass,
  layoutsOperarTicketProposalCartListClass,
  layoutsOperarTicketProposalHeaderClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { SaleOperationActionsBar } from "@/components/sale-operation/SaleOperationActionsBar"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import { cn } from "@/lib/utils"

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

type Props = {
  form: ServiceChargeCreateWizardForm
  selectedService: ServiceTypeChargeOption | null
  treasuryPaymentContext: TreasuryPaymentContext | null
  comprobanteLabel: string
  disabled?: boolean
  saving?: boolean
  canCreate?: boolean
  confirmTitle?: string
  onDiscard: () => void
  onConfirm: () => void
}

export function ServiceOperateSnapshotPanel({
  form,
  selectedService,
  treasuryPaymentContext,
  comprobanteLabel,
  disabled = false,
  saving = false,
  canCreate = true,
  confirmTitle,
  onDiscard,
  onConfirm,
}: Props) {
  return (
    <>
      <div
        className={cn(
          layoutsOperarTicketProposalHeaderClass(TICKET_PROPOSAL),
          "row-start-1 min-h-0 shrink-0",
        )}
      >
        <h2 className={layoutsOperarSummaryCartHeadingClass}>Resumen del cargo</h2>
      </div>

      <div
        className={cn(
          layoutsOperarSummaryCartListSurfaceClass,
          layoutsOperarTicketProposalCartListClass(TICKET_PROPOSAL),
          "row-start-2 min-h-0 overflow-y-auto overscroll-contain",
        )}
      >
        <div className="p-3">
          <ServiceOperateChargeSnapshotContent
            form={form}
            selectedService={selectedService}
            treasuryPaymentContext={treasuryPaymentContext}
            comprobanteLabel={comprobanteLabel}
          />
        </div>
      </div>

      <div className={layoutsOperarTicketProposalActionsClass(TICKET_PROPOSAL)}>
        <SaleOperationActionsBar
          variant="operar"
          discardDisabled={disabled || saving}
          confirmDisabled={!canCreate || !selectedService || disabled || saving}
          confirmLoading={saving}
          confirmLabel="Crear cargo"
          confirmTitle={confirmTitle}
          onDiscard={onDiscard}
          onConfirm={onConfirm}
        />
      </div>
    </>
  )
}
