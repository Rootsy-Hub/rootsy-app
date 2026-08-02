"use client"

import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { tdMoneyClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  formatArcaCbteFch,
  saleComprobanteLabel,
  saleHasComprobante,
} from "@/lib/operationSaleComprobante"
import { cn } from "@/lib/utils"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const INVOICE_STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  pending_afip: "Pendiente AFIP",
  authorized: "Autorizada",
  rejected: "Rechazada",
  cancelled: "Anulada",
}

function invoiceStatusLabel(status: string) {
  return INVOICE_STATUS_LABEL[status] ?? status
}

const opsDialogLight = "rootsy-app-light text-foreground"
const opsDialogSurfaceLg = cn(
  opsDialogLight,
  "gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-2xl ring-1 ring-black/[0.04] sm:max-w-lg",
  "max-h-[min(90vh,720px)] flex flex-col overflow-hidden",
)
const opsDialogHeader =
  "shrink-0 space-y-1.5 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"
const opsDialogBody =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4"

type Props = {
  sale: OperationSaleRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OperationSaleInvoiceDialog({
  sale,
  open,
  onOpenChange,
}: Props) {
  if (!sale) return null

  const inv = sale.arcaInvoice
  const tipo = saleComprobanteLabel(sale)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={opsDialogSurfaceLg}>
        <DialogHeader className={opsDialogHeader}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Comprobante
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {tipo !== "—" ? tipo : "Sin tipo fiscal registrado"}
          </DialogDescription>
        </DialogHeader>
        <div className={opsDialogBody}>
          {!saleHasComprobante(sale) ? (
            <p className="text-sm text-muted-foreground">
              Esta venta no tiene comprobante fiscal asociado.
            </p>
          ) : inv ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Punto / Nº
                  </p>
                  <p
                    className={cn(
                      "text-sm font-medium text-foreground",
                      tdMoneyClass,
                    )}
                  >
                    {inv.ptoVta} — {inv.cbteNro}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Fecha cbte.
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatArcaCbteFch(inv.cbteFch)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Receptor
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {inv.receptorRazonSocial || sale.customerName || "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Doc. receptor
                  </p>
                  <p className="text-sm font-medium tabular-nums text-foreground">
                    {inv.docTipo != null ? `Tipo ${inv.docTipo}` : "—"}{" "}
                    {inv.docNro || sale.customerTaxId || ""}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Neto
                  </p>
                  <p className={cn("text-sm font-medium", tdMoneyClass)}>
                    {fmt.format(inv.impNeto)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    IVA
                  </p>
                  <p className={cn("text-sm font-medium", tdMoneyClass)}>
                    {fmt.format(inv.impIva)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total
                  </p>
                  <p
                    className={cn(
                      "text-sm font-semibold text-primary",
                      tdMoneyClass,
                    )}
                  >
                    {fmt.format(inv.impTotal)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  CAE
                </p>
                <p className="text-sm text-foreground">
                  {inv.cae ?? "—"}
                </p>
                {inv.caeFchVto ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Vto. {formatArcaCbteFch(inv.caeFchVto)}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  Estado: {invoiceStatusLabel(inv.status)}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tipo seleccionado en venta
                </p>
                <p className="text-sm font-medium text-foreground">
                  {sale.invoiceTypeLabel}
                </p>
              </div>
              {sale.accruesOutputVat ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Aún no hay comprobante electrónico autorizado en ARCA para
                    esta venta. Los importes del comprobante interno son:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Neto
                      </p>
                      <p className={cn("text-sm font-medium", tdMoneyClass)}>
                        {fmt.format(sale.subtotal)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        IVA
                      </p>
                      <p className={cn("text-sm font-medium", tdMoneyClass)}>
                        {fmt.format(sale.taxTotal)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Total
                      </p>
                      <p
                        className={cn(
                          "text-sm font-semibold text-primary",
                          tdMoneyClass,
                        )}
                      >
                        {fmt.format(sale.total)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Esta venta no registra IVA fiscal. El importe total es:
                  </p>
                  <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Total
                    </p>
                    <p
                      className={cn(
                        "text-sm font-semibold text-primary",
                        tdMoneyClass,
                      )}
                    >
                      {fmt.format(sale.total)}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
