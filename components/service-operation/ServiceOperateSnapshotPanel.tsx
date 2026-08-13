"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import type { ServiceChargeCreateWizardForm } from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import {
  layoutsOperarSummaryCartCellClass,
  layoutsOperarSummaryCartHeadingClass,
  layoutsOperarSummaryTotalsPlacementClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  layoutsOperarTicketProposalActionsClass,
  layoutsOperarTicketProposalHeaderClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { ServiceOperateChargeSnapshotContent } from "@/components/service-operation/ServiceOperateChargeSnapshotContent"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { SaleOperationActionsBar } from "@/components/sale-operation/SaleOperationActionsBar"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"
import type { ServiceDiscountMode } from "@/lib/serviceCatalogTypes"
import {
  computeChargeAmount,
} from "@/lib/serviceChargeTypes"
import { computeSelectedAddonsTotal } from "@/lib/serviceChargeAddonSelection"
import { parseMoneyInput } from "@/lib/moneyInput"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import { cn } from "@/lib/utils"
import { Receipt } from "lucide-react"
import { useMemo } from "react"

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

type Props = {
  form: ServiceChargeCreateWizardForm
  popId: string
  selectedService: ServiceTypeChargeOption | null
  treasuryPaymentContext: TreasuryPaymentContext | null
  comprobanteLabel: string
  suggestedComprobante: string | null
  disabled?: boolean
  saving?: boolean
  canCreate?: boolean
  confirmTitle?: string
  onDiscard: () => void
  onConfirm: () => void
}

export function ServiceOperateSnapshotPanel({
  form,
  popId,
  selectedService,
  treasuryPaymentContext,
  comprobanteLabel,
  suggestedComprobante,
  disabled = false,
  saving = false,
  canCreate = true,
  confirmTitle,
  onDiscard,
  onConfirm,
}: Props) {
  const discountMode: ServiceDiscountMode =
    form.discountMode === "porcentaje" || form.discountMode === "fijo"
      ? form.discountMode
      : "none"

  const discountValue =
    discountMode === "none"
      ? null
      : discountMode === "porcentaje"
        ? Number(form.discountValue.replace(/\D/g, "")) || null
        : parseMoneyInput(form.discountValue, Number.NaN)

  const unitPrice = parseMoneyInput(form.unitPrice, 0)

  const addonsTotal = useMemo(
    () =>
      selectedService
        ? computeSelectedAddonsTotal(
            selectedService.addons,
            form.selectedAddonIds,
          )
        : 0,
    [selectedService, form.selectedAddonIds],
  )

  const subtotalWithAddons = unitPrice + addonsTotal

  const amount = useMemo(
    () =>
      computeChargeAmount(
        subtotalWithAddons,
        discountMode,
        discountValue != null && Number.isFinite(discountValue)
          ? discountValue
          : null,
      ),
    [subtotalWithAddons, discountMode, discountValue],
  )

  const hayDescuento = discountMode !== "none" && amount < subtotalWithAddons

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
          layoutsOperarSummaryCartCellClass,
          "layouts-operar-scroll-minimal overflow-y-auto overscroll-contain",
        )}
        role="region"
        aria-label="Resumen del cargo"
      >
        {!selectedService ? (
          <div className="flex min-h-0 flex-1 flex-col" data-ticket-empty="true">
            <DataWorkspaceDetailEmptyState icon={Receipt} title="Cargo vacío" />
          </div>
        ) : (
          <ServiceOperateChargeSnapshotContent
            form={form}
            popId={popId}
            selectedService={selectedService}
            treasuryPaymentContext={treasuryPaymentContext}
            comprobanteLabel={comprobanteLabel}
            suggestedComprobante={suggestedComprobante}
          />
        )}
      </div>

      {selectedService ? (
        <div className={layoutsOperarTicketProposalActionsClass(TICKET_PROPOSAL)}>
          <SaleOperationActionsBar
            variant="operar"
            discardDisabled={disabled || saving}
            confirmDisabled={!canCreate || disabled || saving}
            confirmLoading={saving}
            confirmLabel="Crear cargo"
            confirmTitle={confirmTitle}
            onDiscard={onDiscard}
            onConfirm={onConfirm}
          />
        </div>
      ) : null}

      <div className={layoutsOperarSummaryTotalsPlacementClass} data-ticket-totals>
        <SaleOperationTotalBar
          tone="operar"
          className="h-full w-full"
          total={amount}
          subtotal={subtotalWithAddons}
          descuentoMonto={Math.max(0, subtotalWithAddons - amount)}
          hayDescuento={hayDescuento}
          totalLabel="Total del cargo"
        />
      </div>
    </>
  )
}
