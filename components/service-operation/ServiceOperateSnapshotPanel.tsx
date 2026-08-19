"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import type {
  ServiceChargeCreateFieldErrors,
  ServiceChargeCreateWizardForm,
} from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import {
  layoutsOperarSummaryPanelTabBodyClass,
  layoutsOperarSummaryTotalsPlacementClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  layoutsOperarTicketProposalActionsClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { ServiceOperateChargeSnapshotContent } from "@/components/service-operation/ServiceOperateChargeSnapshotContent"
import {
  ServiceOperateSnapshotPanelTabs,
  type ServiceOperateSnapshotPanelView,
} from "@/components/service-operation/ServiceOperateSnapshotPanelTabs"
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
import { useMemo, useState } from "react"

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

type Props = {
  form: ServiceChargeCreateWizardForm
  fieldErrors: ServiceChargeCreateFieldErrors
  popId: string
  selectedService: ServiceTypeChargeOption | null
  treasuryPaymentContext: TreasuryPaymentContext | null
  suggestedComprobante: string | null
  disabled?: boolean
  saving?: boolean
  canCreate?: boolean
  confirmTitle?: string
  onFormChange: (patch: Partial<ServiceChargeCreateWizardForm>) => void
  onDiscard: () => void
  onConfirm: () => void
}

export function ServiceOperateSnapshotPanel({
  form,
  fieldErrors,
  popId,
  selectedService,
  treasuryPaymentContext,
  suggestedComprobante,
  disabled = false,
  saving = false,
  canCreate = true,
  confirmTitle,
  onFormChange,
  onDiscard,
  onConfirm,
}: Props) {
  const [snapshotView, setSnapshotView] =
    useState<ServiceOperateSnapshotPanelView>("config")

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
  const showCargoFooter = Boolean(selectedService) && snapshotView === "cargo"

  return (
    <>
      <div className="row-start-1 min-h-0 shrink-0">
        <ServiceOperateSnapshotPanelTabs
          value={snapshotView}
          onChange={setSnapshotView}
          cargoDisabled={!selectedService}
        />
      </div>

      <div
        className={cn(
          layoutsOperarSummaryPanelTabBodyClass,
          "row-start-2 min-h-0",
        )}
        data-snapshot-tab-body
        role="region"
        aria-label="Resumen del cargo"
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          {!selectedService ? (
            <div className="flex min-h-0 flex-1 flex-col" data-ticket-empty="true">
              <DataWorkspaceDetailEmptyState icon={Receipt} title="Cargo vacío" />
            </div>
          ) : (
            <ServiceOperateChargeSnapshotContent
              view={snapshotView}
              form={form}
              fieldErrors={fieldErrors}
              popId={popId}
              selectedService={selectedService}
              treasuryPaymentContext={treasuryPaymentContext}
              suggestedComprobante={suggestedComprobante}
              disabled={disabled || saving}
              onFormChange={onFormChange}
            />
          )}
        </div>

        {showCargoFooter ? (
          <div className={layoutsOperarSummaryTotalsPlacementClass} data-ticket-totals>
            <SaleOperationTotalBar
              tone="operar"
              className="w-full"
              total={amount}
              subtotal={subtotalWithAddons}
              descuentoMonto={Math.max(0, subtotalWithAddons - amount)}
              hayDescuento={hayDescuento}
              totalLabel="Total del cargo"
            />
          </div>
        ) : null}
      </div>

      {showCargoFooter ? (
        <div className={cn(layoutsOperarTicketProposalActionsClass(TICKET_PROPOSAL), "!row-start-3")}>
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
    </>
  )
}
