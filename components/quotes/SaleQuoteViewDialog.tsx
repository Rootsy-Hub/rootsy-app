"use client"

import { dataWorkspaceEntityCardStatLabelClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { PopIdentityHorizontalAddress } from "@/components/pop-identity/PopIdentityHorizontalAddress"
import { SaleQuoteLinesBreakdown } from "@/components/quotes/SaleQuoteLinesBreakdown"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import type { SaleQuoteDetail } from "@/lib/saleQuoteTypes"
import { cn } from "@/lib/utils"

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

const fieldValueClass = cn(
  "mt-0.5 font-canopy text-sm leading-snug text-[var(--rootsy-bruma-900)]",
)

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
  popBrand,
}: Props) {
  if (!quote) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="wide" className="flex flex-col sm:max-w-lg">
        <RootsDialogHeader
          open={open}
          title={`Presupuesto N.º ${quote.quoteNumber}`}
        />

        <RootsDialogBody className="space-y-4">
          {popBrand ? (
            <PopIdentityHorizontalAddress
              name={popBrand.name}
              imageUrl={popBrand.imageUrl}
              streetAddress={popBrand.streetAddress}
              city={popBrand.city}
              fallbackSeed={popBrand.fallbackSeed}
            />
          ) : null}

          <dl className="grid gap-3">
            <MetaField
              label="Cliente"
              value={quote.customerName || "Sin cliente"}
            />
            {quote.customerTaxId ? (
              <MetaField label="Documento" value={quote.customerTaxId} />
            ) : null}
            {quote.metadata.comprobanteLabel ? (
              <MetaField
                label="Comprobante"
                value={quote.metadata.comprobanteLabel}
              />
            ) : null}
            {quote.metadata.paymentLabel ? (
              <MetaField
                label="Medio de pago"
                value={quote.metadata.paymentLabel}
              />
            ) : null}
            {quote.metadata.discountLabel ? (
              <MetaField
                label="Descuento general"
                value={quote.metadata.discountLabel}
              />
            ) : null}
            <MetaField label="Fecha" value={formatCreatedAt(quote.createdAt)} />
          </dl>

          <SaleQuoteLinesBreakdown
            metadata={quote.metadata}
            subtotal={quote.subtotal}
            discountTotal={quote.discountTotal}
            total={quote.total}
          />
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
