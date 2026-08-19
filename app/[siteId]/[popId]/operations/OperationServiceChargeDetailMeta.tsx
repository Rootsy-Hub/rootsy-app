"use client"

import type { OperationServiceChargeRow } from "@/app/[siteId]/[popId]/operations/actions"
import {
  serviceChargePaymentModeLabel,
  serviceChargeRhythmLabel,
  serviceChargeStatusLabel,
} from "@/app/[siteId]/[popId]/operations/operationServiceChargeUi"
import { OperationSaleDetailField } from "@/app/[siteId]/[popId]/operations/OperationSaleDetailField"
import { formatIsoDateShort } from "@/lib/dataWorkspaceDateFilter"

type Props = {
  charge: OperationServiceChargeRow
}

export function OperationServiceChargeDetailMeta({ charge }: Props) {
  return (
    <div className="divide-y divide-border/45">
      <OperationSaleDetailField label="Cliente">
        {charge.clientName}
      </OperationSaleDetailField>
      <OperationSaleDetailField label="Servicio">
        {charge.serviceName}
      </OperationSaleDetailField>
      <OperationSaleDetailField label="Estado">
        {serviceChargeStatusLabel(charge)}
      </OperationSaleDetailField>
      <OperationSaleDetailField label="Ritmo">
        {serviceChargeRhythmLabel(charge)}
      </OperationSaleDetailField>
      <OperationSaleDetailField label="Cobro">
        {serviceChargePaymentModeLabel(charge)}
      </OperationSaleDetailField>
      <OperationSaleDetailField label="Período">
        {charge.periodDisplay}
      </OperationSaleDetailField>
      <OperationSaleDetailField label="Vencimiento">
        {formatIsoDateShort(charge.dueDate)}
      </OperationSaleDetailField>
      {charge.notes.trim() ? (
        <OperationSaleDetailField label="Notas">
          {charge.notes.trim()}
        </OperationSaleDetailField>
      ) : null}
      {charge.cancelledAt ? (
        <OperationSaleDetailField label="Cancelado">
          {formatIsoDateShort(charge.cancelledAt.slice(0, 10))}
        </OperationSaleDetailField>
      ) : null}
    </div>
  )
}
