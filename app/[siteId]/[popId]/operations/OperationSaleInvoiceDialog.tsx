"use client"

import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import {
  SaleComprobanteTicketPreview,
  type SaleComprobantePreviewInput,
} from "@/components/checkout/SaleComprobanteTicketPreview"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import "@/app/library/layouts/layoutsOperarTheme.css"
import {
  layoutsOperarBodyScopeClass,
  layoutsOperarScrollMinimalClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import { useSaleComprobanteEmitterContext } from "@/hooks/useSaleComprobanteEmitterContext"
import { saleComprobanteLabel } from "@/lib/operationSaleComprobante"
import { buildSaleDetailCartDisplayRows } from "@/lib/saleDetailCartDisplay"
import { useMemo } from "react"

const EMPTY_CART_OVERRIDES = {
  itemDescuentoModo: {},
  itemDescuentoDraft: {},
  itemDescuentoSuprimido: {},
  itemComentarios: {},
}

function saleToComprobantePreviewInput(
  sale: OperationSaleRow,
  popId: string,
  siteId: string,
): SaleComprobantePreviewInput {
  return {
    popId,
    siteId,
    comprobanteLabel: sale.invoiceTypeLabel,
    cartDisplayRows: buildSaleDetailCartDisplayRows(sale.lineItems),
    cartLineOverrides: EMPTY_CART_OVERRIDES,
    subtotal: sale.subtotal,
    discountAmount: sale.discountTotal,
    total: sale.total,
    customerName: sale.customerName ?? "",
    customerTaxId: sale.customerTaxId,
    customerIvaLabel: sale.customerIvaConditionLabel,
    paymentMethodLabel: sale.paymentMethodLabel,
  }
}

type Props = {
  sale: OperationSaleRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  siteId: string
  popId: string
  nested?: boolean
}

export function OperationSaleInvoiceDialog({
  sale,
  open,
  onOpenChange,
  siteId,
  popId,
  nested = false,
}: Props) {
  const { emitter, loading, error } = useSaleComprobanteEmitterContext(
    popId,
    open && sale != null,
  )

  const previewInput = useMemo(() => {
    if (!sale) return null
    return saleToComprobantePreviewInput(sale, popId, siteId)
  }, [sale, popId, siteId])

  const issuedAt = useMemo(() => {
    if (!sale?.soldAt) return undefined
    const date = new Date(sale.soldAt)
    return Number.isNaN(date.getTime()) ? undefined : date
  }, [sale?.soldAt])

  const tipo = sale ? saleComprobanteLabel(sale) : "—"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent
        size="wide"
        nested={nested}
        className={cn("rootsy-theme-pos", layoutsOperarBodyScopeClass)}
      >
        <RootsDialogHeader
          open={open}
          title="Comprobante"
          description={tipo !== "—" ? tipo : "Sin tipo fiscal registrado"}
        />
        <RootsDialogBody className={layoutsOperarScrollMinimalClass}>
          <SaleComprobanteTicketPreview
            previewInput={previewInput}
            emitter={emitter}
            previewComprobanteLabel={sale?.invoiceTypeLabel ?? null}
            issuedAt={issuedAt}
            loading={loading}
            error={error}
            framed={false}
          />
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
