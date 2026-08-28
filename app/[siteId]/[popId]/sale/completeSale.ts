"use server"

import type { CheckoutCheckDetails } from "@/lib/checkoutCheck"
import { RootsyApiError, rootsyApiFetch } from "@/lib/rootsyApi/server"

export type CompleteSaleLineSnapshotInput = {
  name: string
  unitPrice: number
  iva?: number
  catalogDiscountMode?: "porcentaje" | "fijo" | null
  catalogDiscountValue?: number | null
  listTotal?: number
}

export type CompleteSaleLineInput = {
  articleId?: string
  recipeId?: string
  promotionId?: string
  promotionSelections?: Array<{
    slotId: string
    kind: "article" | "recipe"
    refId: string
    name?: string
    slotLabel?: string
    listUnitPrice?: number
    slotQuantity?: number
    iva?: number
  }>
  promotionDealDiscount?: number
  promotionDealId?: string
  promotionDealName?: string
  lineGroupId?: string
  quantity: number
  snapshot: CompleteSaleLineSnapshotInput
  itemDiscountMode: "porcentaje" | "fijo"
  itemDiscountDraft: string
  suppressCatalogDiscount?: boolean
  comment?: string
}

export type CompleteSaleInput = {
  siteId: string
  lines: CompleteSaleLineInput[]
  clientId: string | null
  paymentKind?: string | null
  treasuryAccountId?: string | null
  checkDetails?: CheckoutCheckDetails | null
  payOnClientAccount?: boolean
  dueDate?: string | null
  generalDiscountMode: "porcentaje" | "fijo"
  valorDescuentoPorcentaje: number
  valorDescuentoFijo: number
  invoiceTypeLabel?: string | null
  customerIvaCondition?: string | null
  fiscalCustomer?: { name: string; taxId: string | null } | null
  tableSessionId?: string | null
  counterOrderId?: string | null
  closeTableSession?: boolean
  linkCounterOrder?: boolean
  channelOrderTotal?: number
  channelPaidAccumulated?: number
  isPartialChannelPayment?: boolean
  priceListId?: string | null
  idempotencyKey?: string
}

type CreateSaleApiOk = {
  success: true
  data: { saleId: string; replayed?: boolean }
}

function saleChannel(input: CompleteSaleInput) {
  if (input.tableSessionId) {
    return {
      type: "table" as const,
      sessionId: input.tableSessionId,
      closeOnComplete: input.closeTableSession,
      partial: input.isPartialChannelPayment,
    }
  }
  if (input.counterOrderId) {
    return {
      type: "counter" as const,
      orderId: input.counterOrderId,
      linkOnComplete: input.linkCounterOrder,
      partial: input.isPartialChannelPayment,
    }
  }
  return { type: "pos" as const }
}

export async function completeSale(
  popId: string,
  input: CompleteSaleInput,
): Promise<{ success: true; saleId: string } | { success: false; error: string }> {
  if (input.lines.length === 0) {
    return { success: false, error: "No hay ítems para cobrar." }
  }
  for (const line of input.lines) {
    if (!line.snapshot?.name?.trim()) {
      return {
        success: false,
        error: "Falta el precio congelado de una línea. Recargá el ticket.",
      }
    }
  }

  const idempotencyKey =
    input.idempotencyKey?.trim() || crypto.randomUUID()

  try {
    const res = await rootsyApiFetch<CreateSaleApiOk>(`/v1/pops/${popId}/sales`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        idempotencyKey,
        lines: input.lines,
        clientId: input.clientId,
        paymentKind: input.paymentKind,
        treasuryAccountId: input.treasuryAccountId,
        checkDetails: input.checkDetails,
        payOnClientAccount: input.payOnClientAccount,
        dueDate: input.dueDate,
        generalDiscountMode: input.generalDiscountMode,
        valorDescuentoPorcentaje: input.valorDescuentoPorcentaje,
        valorDescuentoFijo: input.valorDescuentoFijo,
        invoiceTypeLabel: input.invoiceTypeLabel,
        customerIvaCondition: input.customerIvaCondition,
        fiscalCustomer: input.fiscalCustomer,
        channel: saleChannel(input),
      }),
      signal: AbortSignal.timeout(60_000),
    })
    if (!res.success || !res.data?.saleId) {
      return { success: false, error: "No se pudo registrar la venta." }
    }
    return { success: true, saleId: res.data.saleId }
  } catch (error) {
    if (error instanceof RootsyApiError) {
      return { success: false, error: error.message }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "No se pudo registrar la venta.",
    }
  }
}
