"use client"

import { dataWorkspaceEntityCardStatLabelClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { SaleQuoteLinesBreakdown } from "@/components/quotes/SaleQuoteLinesBreakdown"
import { RootsBanner } from "@/components/rootsy-banner"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import { resolveQuoteLineGroups } from "@/lib/saleQuoteDocumentLines"
import type { SaleQuoteDetail } from "@/lib/saleQuoteTypes"
import {
  allocateUnresolvedQuoteGap,
  quoteStoredAmountGap,
  unresolvedQuoteCartItems,
} from "@/lib/saleQuoteViewGaps"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote: SaleQuoteDetail | null
  formatCreatedAt: (iso: string) => string
  refreshing?: boolean
}

const fieldValueClass = cn(
  "mt-0.5 font-canopy text-sm leading-snug text-[color:var(--rootsy-bruma-900)]",
)

const QUOTE_STATUS_LABEL: Record<SaleQuoteDetail["status"], string> = {
  active: "Activo",
  converted: "Pasado a venta",
  cancelled: "Anulado",
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={dataWorkspaceEntityCardStatLabelClass}>{label}</dt>
      <dd className={fieldValueClass}>{value}</dd>
    </div>
  )
}

export function SaleQuoteViewDialog({
  open,
  onOpenChange,
  quote,
  formatCreatedAt,
  refreshing = false,
}: Props) {
  if (!quote) return null

  const lineGroups = resolveQuoteLineGroups(quote.metadata)
  const gap = refreshing ? 0 : quoteStoredAmountGap(lineGroups, quote.subtotal)
  const allocated = allocateUnresolvedQuoteGap(
    refreshing || gap <= 0.009
      ? []
      : unresolvedQuoteCartItems(quote.checkoutSnapshot, lineGroups),
    gap,
  )
  const showGapNotice = gap > 0.009

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="wide" className="flex flex-col sm:max-w-lg">
        <RootsDialogHeader
          open={open}
          title={`Presupuesto N.º ${quote.quoteNumber}`}
          description="Registro interno. Los importes son los que se guardaron al crearlo."
        />
        {refreshing ? (
          <div
            className="h-0.5 w-full overflow-hidden bg-[color:var(--rootsy-bruma-200)]"
            aria-hidden
          >
            <div className="h-full w-1/3 animate-pulse bg-[color:var(--rootsy-savia-500)]/50" />
          </div>
        ) : null}

        <RootsDialogBody className="space-y-5">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <MetaField
              label="Cliente"
              value={quote.customerName || "Sin cliente"}
            />
            <MetaField
              label="Documento"
              value={quote.customerTaxId || "—"}
            />
            <MetaField label="Fecha" value={formatCreatedAt(quote.createdAt)} />
            <MetaField
              label="Estado"
              value={QUOTE_STATUS_LABEL[quote.status] ?? quote.status}
            />
            {quote.metadata.comprobanteLabel ? (
              <MetaField
                label="Comprobante previsto"
                value={quote.metadata.comprobanteLabel}
              />
            ) : null}
            {quote.metadata.paymentLabel ? (
              <MetaField
                label="Medio previsto"
                value={quote.metadata.paymentLabel}
              />
            ) : null}
          </dl>

          {showGapNotice ? (
            <RootsBanner
              intent="warning"
              density="compact"
              title="El detalle no cierra con el subtotal"
              message={
                allocated.items.length > 0
                  ? "Hay productos del pedido que no quedaron desglosados (a veces pasa con una promo 2x1 o un combo). El total que se vendió o se imprime sigue siendo el guardado."
                  : "El subtotal guardado incluye importes que no están desglosados en las líneas. Al vender o imprimir se usa el total guardado."
              }
            />
          ) : null}

          <SaleQuoteLinesBreakdown
            metadata={quote.metadata}
            subtotal={quote.subtotal}
            discountTotal={quote.discountTotal}
            total={quote.total}
            unresolvedItems={allocated.items}
            storedSubtotalGap={allocated.remainder}
          />
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
