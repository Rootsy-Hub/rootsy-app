"use client"

import type { SaleQuoteDetail } from "@/lib/saleQuoteTypes"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote: SaleQuoteDetail | null
  formatCreatedAt: (iso: string) => string
}

export function SaleQuoteViewDialog({
  open,
  onOpenChange,
  quote,
  formatCreatedAt,
}: Props) {
  if (!quote) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Presupuesto N.º {quote.quoteNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
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
                <dt className="text-muted-foreground">Descuento</dt>
                <dd>{quote.metadata.discountLabel}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted-foreground">Fecha</dt>
              <dd>{formatCreatedAt(quote.createdAt)}</dd>
            </div>
          </dl>

          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Producto</th>
                  <th className="px-3 py-2 text-right font-medium">Cant.</th>
                  <th className="px-3 py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {(quote.metadata.lineSummaries ?? []).map((line, index) => (
                  <tr key={`${line.name}-${index}`} className="border-t">
                    <td className="px-3 py-2">{line.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {line.quantity}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatReportMoneyAr(line.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={cn("space-y-1 border-t pt-3")}>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatReportMoneyAr(quote.subtotal)}</span>
            </div>
            {quote.discountTotal > 0 ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descuento</span>
                <span>−{formatReportMoneyAr(quote.discountTotal)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatReportMoneyAr(quote.total)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
