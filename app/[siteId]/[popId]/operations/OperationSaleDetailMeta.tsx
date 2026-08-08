"use client"

import type { OperationSaleDetailContext } from "@/app/[siteId]/[popId]/operations/actions"
import { OperationSaleDetailField } from "@/app/[siteId]/[popId]/operations/OperationSaleDetailField"
import {
  counterFulfillmentTypeLabel,
  formatOperationDetailMoment,
  formatOperationDetailTimestamp,
} from "@/app/[siteId]/[popId]/operations/operationSaleDetailUi"

type Props = {
  saleId: string
  context: OperationSaleDetailContext
  timeZone?: string
}

function SaleDetailIdField({ saleId }: { saleId: string }) {
  return (
    <OperationSaleDetailField label="ID">
      <span className="break-all text-[11px] leading-snug text-muted-foreground">
        {saleId}
      </span>
    </OperationSaleDetailField>
  )
}

export function OperationSaleDetailMeta({ saleId, context, timeZone }: Props) {
  if (context.channel === "table") {
    return (
      <div className="divide-y divide-border/45">
        <SaleDetailIdField saleId={saleId} />
        {context.tableLabel ? (
          <OperationSaleDetailField label="Mesa">
            {context.tableLabel}
          </OperationSaleDetailField>
        ) : null}
        <OperationSaleDetailField label="Apertura">
          {formatOperationDetailMoment(
            context.openedAt,
            context.openedByName,
            timeZone,
          )}
        </OperationSaleDetailField>
        {context.closedAt ? (
          <OperationSaleDetailField label="Cierre">
            {formatOperationDetailMoment(
              context.closedAt,
              context.closedByName,
              timeZone,
            )}
          </OperationSaleDetailField>
        ) : null}
        {context.waiterName ? (
          <OperationSaleDetailField label="Mozo">
            {context.waiterName}
          </OperationSaleDetailField>
        ) : null}
        {context.guestCount != null ? (
          <OperationSaleDetailField label="Comensales">
            {context.guestCount}
          </OperationSaleDetailField>
        ) : null}
        {context.customerName ? (
          <OperationSaleDetailField label="Cliente">
            {context.customerName}
          </OperationSaleDetailField>
        ) : null}
        {context.note ? (
          <OperationSaleDetailField label="Comentario">
            {context.note}
          </OperationSaleDetailField>
        ) : null}
      </div>
    )
  }

  if (context.channel === "counter") {
    return (
      <div className="divide-y divide-border/45">
        <SaleDetailIdField saleId={saleId} />
        {context.counterOrderLabel ? (
          <OperationSaleDetailField label="Pedido">
            {context.counterOrderLabel}
          </OperationSaleDetailField>
        ) : null}
        <OperationSaleDetailField label="Apertura">
          {formatOperationDetailMoment(
            context.openedAt,
            context.openedByName,
            timeZone,
          )}
        </OperationSaleDetailField>
        {context.closedAt ? (
          <OperationSaleDetailField label="Cierre">
            {formatOperationDetailMoment(
              context.closedAt,
              context.closedByName,
              timeZone,
            )}
          </OperationSaleDetailField>
        ) : null}
        {context.deliveredAt &&
        context.closedAt !== context.deliveredAt ? (
          <OperationSaleDetailField label="Entrega">
            {formatOperationDetailTimestamp(context.deliveredAt, timeZone)}
          </OperationSaleDetailField>
        ) : null}
        <OperationSaleDetailField label="Modalidad">
          {counterFulfillmentTypeLabel(context.fulfillmentType)}
        </OperationSaleDetailField>
        {context.fulfillmentType === "delivery" && context.deliveryAddress ? (
          <OperationSaleDetailField label="Dirección">
            {context.deliveryAddress}
          </OperationSaleDetailField>
        ) : null}
        {context.fulfillmentType === "delivery" && context.phone ? (
          <OperationSaleDetailField label="Celular">
            {context.phone}
          </OperationSaleDetailField>
        ) : null}
        {context.fulfillmentType === "delivery" && context.driverName ? (
          <OperationSaleDetailField label="Repartidor">
            {context.driverName}
          </OperationSaleDetailField>
        ) : null}
        {context.estimatedMinutes != null && context.estimatedMinutes > 0 ? (
          <OperationSaleDetailField label="Tiempo estimado">
            {context.estimatedMinutes} min
          </OperationSaleDetailField>
        ) : null}
        {context.customerName ? (
          <OperationSaleDetailField label="Cliente">
            {context.customerName}
          </OperationSaleDetailField>
        ) : null}
        {context.note ? (
          <OperationSaleDetailField label="Comentario">
            {context.note}
          </OperationSaleDetailField>
        ) : null}
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/45">
      <SaleDetailIdField saleId={saleId} />
      <OperationSaleDetailField label="Hora de la venta">
        {formatOperationDetailTimestamp(context.soldAt, timeZone)}
      </OperationSaleDetailField>
      {context.soldByName ? (
        <OperationSaleDetailField label="Usuario">
          {context.soldByName}
        </OperationSaleDetailField>
      ) : null}
      {context.customerName ? (
        <OperationSaleDetailField label="Cliente">
          {context.customerName}
        </OperationSaleDetailField>
      ) : null}
    </div>
  )
}
