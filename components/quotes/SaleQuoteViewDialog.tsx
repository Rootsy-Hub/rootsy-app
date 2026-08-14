"use client"

import { PopIdentityHorizontalAddress } from "@/components/pop-identity/PopIdentityHorizontalAddress"
import { SaleQuoteLinesBreakdown } from "@/components/quotes/SaleQuoteLinesBreakdown"
import type { SaleQuoteDetail } from "@/lib/saleQuoteTypes"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type PopBrandProps = {
  name: string
  imageUrl?: string | null
  streetAddress?: string | null
  city?: string | null
  fallbackSeed?: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote: SaleQuoteDetail | null
  formatCreatedAt: (iso: string) => string
  popBrand?: PopBrandProps | null
}

export function SaleQuoteViewDialog({
  open,
  onOpenChange,
  quote,
  formatCreatedAt,
  popBrand,
}: Props) {
  if (!quote) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Presupuesto N.º {quote.quoteNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {popBrand ? (
            <PopIdentityHorizontalAddress
              name={popBrand.name}
              imageUrl={popBrand.imageUrl}
              streetAddress={popBrand.streetAddress}
              city={popBrand.city}
              fallbackSeed={popBrand.fallbackSeed}
            />
          ) : null}

          <dl className="grid gap-2">
            <div>
              <dt className="text-muted-foreground">Cliente</dt>
              <dd>{quote.customerName || "Sin cliente"}</dd>
            </div>
            {quote.customerTaxId ? (
              <div>
                <dt className="text-muted-foreground">Documento</dt>
                <dd>{quote.customerTaxId}</dd>
              </div>
            ) : null}
            {quote.metadata.comprobanteLabel ? (
              <div>
                <dt className="text-muted-foreground">Comprobante</dt>
                <dd>{quote.metadata.comprobanteLabel}</dd>
              </div>
            ) : null}
            {quote.metadata.paymentLabel ? (
              <div>
                <dt className="text-muted-foreground">Medio de pago</dt>
                <dd>{quote.metadata.paymentLabel}</dd>
              </div>
            ) : null}
            {quote.metadata.discountLabel ? (
              <div>
                <dt className="text-muted-foreground">Descuento general</dt>
                <dd>{quote.metadata.discountLabel}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted-foreground">Fecha</dt>
              <dd>{formatCreatedAt(quote.createdAt)}</dd>
            </div>
          </dl>

          <SaleQuoteLinesBreakdown
            metadata={quote.metadata}
            subtotal={quote.subtotal}
            discountTotal={quote.discountTotal}
            total={quote.total}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
