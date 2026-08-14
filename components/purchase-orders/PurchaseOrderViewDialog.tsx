"use client"

import { dataWorkspaceEntityCardStatLabelClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { PopIdentityHorizontalAddress } from "@/components/pop-identity/PopIdentityHorizontalAddress"
import { PurchaseOrderLinesBreakdown } from "@/components/purchase-orders/PurchaseOrderLinesBreakdown"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import type { PurchaseOrderDetail } from "@/lib/purchaseOrderTypes"
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
  order: PurchaseOrderDetail | null
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

export function PurchaseOrderViewDialog({
  open,
  onOpenChange,
  order,
  formatCreatedAt,
  popBrand,
}: Props) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="wide" className="flex flex-col sm:max-w-lg">
        <RootsDialogHeader
          open={open}
          title={`Orden de compra N.º ${order.orderNumber}`}
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
              label="Proveedor"
              value={order.supplierName || "Sin proveedor"}
            />
            {order.supplierTaxId ? (
              <MetaField label="Documento" value={order.supplierTaxId} />
            ) : null}
            {order.metadata.comprobanteLabel ? (
              <MetaField
                label="Comprobante"
                value={order.metadata.comprobanteLabel}
              />
            ) : null}
            {order.metadata.paymentLabel ? (
              <MetaField
                label="Medio de pago"
                value={order.metadata.paymentLabel}
              />
            ) : null}
            {order.metadata.discountLabel ? (
              <MetaField
                label="Descuento general"
                value={order.metadata.discountLabel}
              />
            ) : null}
            <MetaField label="Fecha" value={formatCreatedAt(order.createdAt)} />
          </dl>

          <PurchaseOrderLinesBreakdown
            metadata={order.metadata}
            subtotal={order.subtotal}
            discountTotal={order.discountTotal}
            total={order.total}
          />
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
