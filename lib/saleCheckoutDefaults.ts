import {
  emptyTableSessionCheckout,
  type TableSessionCheckoutSnapshot,
} from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import {
  cashRegisterOpenSessionQueryKey,
  menuCatalogQueryKey,
  saleCatalogQueryKey,
  saleComprobantesQueryKey,
} from "@/lib/queryKeys"
import type { SaleComprobantesPayload } from "@/lib/rootsyApi/saleClient"
import {
  isAllowedSaleComprobanteLabel,
  readSavedSaleComprobante,
} from "@/lib/saleComprobantePicker"
import type { PopEmisorIvaCondition } from "@/lib/saleComprobanteRules"
import { defaultCheckoutPaymentSelection } from "@/lib/saleCheckoutPayment"
import { DEFAULT_SALE_SITE_ID } from "@/lib/saleInvoiceTypes"
import type { QueryClient } from "@tanstack/react-query"

export type SaleCheckoutFiscalDefaults = {
  invoiceTypeSiteId: string
  popEmisorIvaCondition: PopEmisorIvaCondition
  hasValidPopFiscalCuit: boolean
}

type CatalogCashCache = {
  openCashSession?: { cashTreasuryAccountId?: string | null } | null
  invoiceTypeSiteId?: string
}

export function resolveDefaultSaleComprobante(
  popId: string | undefined,
  fiscal: SaleCheckoutFiscalDefaults,
): string | null {
  if (!popId) return null
  const persisted = readSavedSaleComprobante(popId)
  if (
    persisted !== undefined &&
    isAllowedSaleComprobanteLabel(
      fiscal.invoiceTypeSiteId,
      persisted,
      fiscal.popEmisorIvaCondition,
      fiscal.hasValidPopFiscalCuit,
    )
  ) {
    return persisted
  }
  return null
}

export function buildInitialSaleCheckout(
  popId: string | undefined,
  input: {
    cashTreasuryAccountId?: string | null
    fiscal: SaleCheckoutFiscalDefaults
  },
): TableSessionCheckoutSnapshot {
  return {
    ...emptyTableSessionCheckout(
      resolveDefaultSaleComprobante(popId, input.fiscal),
    ),
    metodoPagoSeleccionado: defaultCheckoutPaymentSelection(
      input.cashTreasuryAccountId ?? null,
    ),
  }
}

export function readInitialSaleCheckoutFromCache(
  queryClient: QueryClient,
  popId: string,
  fiscalFallback?: Partial<SaleCheckoutFiscalDefaults>,
): TableSessionCheckoutSnapshot {
  const catalog =
    queryClient.getQueryData<CatalogCashCache>(menuCatalogQueryKey(popId)) ??
    queryClient.getQueryData<CatalogCashCache>(saleCatalogQueryKey(popId))
  const comprobantes = queryClient.getQueryData<SaleComprobantesPayload>(
    saleComprobantesQueryKey(popId),
  )
  const cashRegister = queryClient.getQueryData<{
    cashTreasuryAccountId?: string | null
  } | null>(cashRegisterOpenSessionQueryKey(popId))

  const fiscal: SaleCheckoutFiscalDefaults = {
    invoiceTypeSiteId:
      comprobantes?.invoiceTypeSiteId ??
      catalog?.invoiceTypeSiteId ??
      fiscalFallback?.invoiceTypeSiteId ??
      DEFAULT_SALE_SITE_ID,
    popEmisorIvaCondition:
      comprobantes?.emisorIvaCondition ??
      fiscalFallback?.popEmisorIvaCondition ??
      "responsable_inscripto",
    hasValidPopFiscalCuit:
      comprobantes?.hasValidFiscalCuit ??
      fiscalFallback?.hasValidPopFiscalCuit ??
      false,
  }

  return buildInitialSaleCheckout(popId, {
    cashTreasuryAccountId:
      catalog?.openCashSession?.cashTreasuryAccountId ??
      cashRegister?.cashTreasuryAccountId ??
      null,
    fiscal,
  })
}
