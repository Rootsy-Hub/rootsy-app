"use client"

import type { PartialPaymentSelection, PartialPaymentUnit } from "@/lib/partialCheckoutSelection"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  saleOpDialogBody,
  saleOpDialogContentMd,
  saleOpDialogHeader,
  saleOpFmt,
  saleOpImporteBaseClass,
} from "@/components/sale-operation/saleOperationStyles"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export type SaleOperationCheckoutConfirmOptions = {
  partialPayment: boolean
  partialSelection: PartialPaymentSelection
  closeOnComplete: boolean
  imprimirComprobante: boolean
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  contextLabel: "mesa" | "pedido"
  confirmLabel: string
  submitting: boolean
  submitError: string | null
  clientLabel: string
  comprobanteLabel: string
  paymentLabel: string
  hasComprobante: boolean
  imprimirComprobante: boolean
  onImprimirComprobanteChange: (value: boolean) => void
  total: number
  subtotal: number
  descuentoMonto: number
  hayDescuento: boolean
  partialPayment: boolean
  onPartialPaymentChange: (value: boolean) => void
  closeOnComplete: boolean
  onCloseOnCompleteChange: (value: boolean) => void
  partialUnits: PartialPaymentUnit[]
  partialSelection: PartialPaymentSelection
  onPartialSelectionChange: (next: PartialPaymentSelection) => void
  onConfirm: (options: SaleOperationCheckoutConfirmOptions) => void | Promise<void | boolean>
}

function selectionQty(
  selection: PartialPaymentSelection,
  unit: PartialPaymentUnit,
): number {
  const raw = selection[unit.selectionKey] ?? 0
  if (unit.isAtomic) return raw >= 1 ? 1 : 0
  return Math.min(unit.maxSelectable, Math.max(0, raw))
}

export function SaleOperationCheckoutConfirmDialog({
  open,
  onOpenChange,
  contextLabel,
  confirmLabel,
  submitting,
  submitError,
  clientLabel,
  comprobanteLabel,
  paymentLabel,
  hasComprobante,
  imprimirComprobante,
  onImprimirComprobanteChange,
  total,
  subtotal,
  descuentoMonto,
  hayDescuento,
  partialPayment,
  onPartialPaymentChange,
  closeOnComplete,
  onCloseOnCompleteChange,
  partialUnits,
  partialSelection,
  onPartialSelectionChange,
  onConfirm,
}: Props) {
  const closeLabel =
    contextLabel === "mesa" ? "Cerrar mesa al cobrar" : "Cerrar pedido al cobrar"

  const selectedCount = partialUnits.filter(
    (u) => selectionQty(partialSelection, u) > 0,
  ).length

  const canConfirm = !partialPayment || selectedCount > 0

  const setUnitQty = (unit: PartialPaymentUnit, nextQty: number) => {
    const clamped = unit.isAtomic
      ? nextQty >= 1
        ? 1
        : 0
      : Math.max(0, Math.min(unit.maxSelectable, nextQty))
    onPartialSelectionChange({
      ...partialSelection,
      [unit.selectionKey]: clamped,
    })
  }

  const toggleUnit = (unit: PartialPaymentUnit, checked: boolean) => {
    if (unit.isAtomic) {
      setUnitQty(unit, checked ? 1 : 0)
      return
    }
    setUnitQty(unit, checked ? unit.maxSelectable : 0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-rootsy-light-shell="true"
        className={cn(
          saleOpDialogContentMd,
          "flex max-h-[min(92vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
        )}
      >
        <DialogHeader className={cn(saleOpDialogHeader, "shrink-0 border-b border-border/50")}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            ¿Confirmar cobro de {contextLabel}?
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Revisá el total y las opciones antes de registrar la venta.
          </DialogDescription>
        </DialogHeader>

        <div className={cn(saleOpDialogBody, "min-h-0 flex-1 space-y-3 overflow-y-auto")}>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800/70">
                Total a cobrar ahora
              </p>
              {(hayDescuento || descuentoMonto > 0) && partialPayment ? (
                <p className="mt-0.5 text-xs text-emerald-900/60">
                  Subtotal {saleOpFmt.format(subtotal)}
                  {descuentoMonto > 0
                    ? ` · Desc. −${saleOpFmt.format(descuentoMonto)}`
                    : null}
                </p>
              ) : null}
            </div>
            <p
              className={cn(
                saleOpImporteBaseClass,
                "text-2xl font-bold text-emerald-900",
              )}
            >
              {saleOpFmt.format(total)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-lg border border-border/70 bg-muted/25 px-3 py-2.5 sm:grid-cols-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Cliente
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                {clientLabel}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Comprobante
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                {comprobanteLabel}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Forma de pago
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                {paymentLabel}
              </p>
            </div>
          </div>

          {hasComprobante ? (
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/70 bg-background px-3 py-2.5 transition-colors hover:bg-muted/30">
              <Checkbox
                checked={imprimirComprobante}
                onCheckedChange={(v) => onImprimirComprobanteChange(v === true)}
                className="mt-0.5"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium">Imprimir comprobante</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  Al confirmar, se enviará a imprimir el {comprobanteLabel.toLowerCase()}.
                </span>
              </span>
            </label>
          ) : null}

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/70 bg-background px-3 py-2.5 transition-colors hover:bg-muted/30">
            <Checkbox
              checked={partialPayment}
              onCheckedChange={(v) => onPartialPaymentChange(v === true)}
              className="mt-0.5"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium">Cobro parcial</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                Elegí qué ítems cobrar ahora. Las promos se cobran completas.
              </span>
            </span>
          </label>

          {partialPayment ? (
            <div className="overflow-hidden rounded-lg border border-border/70">
              <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_5.5rem] gap-2 border-b border-border/60 bg-muted/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Ítem</span>
                <span className="text-center">Cant.</span>
                <span className="text-right">Importe</span>
              </div>
              <ul className="divide-y divide-border/50">
                {partialUnits.length === 0 ? (
                  <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No hay ítems pendientes de cobro.
                  </li>
                ) : (
                  partialUnits.map((unit) => {
                    const qty = selectionQty(partialSelection, unit)
                    const selected = qty > 0
                    const rowTotal = unit.isAtomic
                      ? unit.lineFinalTotal
                      : roundLineTotal(unit, qty)
                    return (
                      <li
                        key={unit.selectionKey}
                        className={cn(
                          "grid grid-cols-[minmax(0,1fr)_4.5rem_5.5rem] items-center gap-2 px-3 py-2.5",
                          selected && "bg-emerald-50/50",
                        )}
                      >
                        <label className="flex min-w-0 cursor-pointer items-start gap-2">
                          <Checkbox
                            checked={selected}
                            onCheckedChange={(v) => toggleUnit(unit, v === true)}
                            className="mt-0.5 shrink-0"
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium leading-snug">
                              {unit.label}
                            </span>
                            {unit.detail ? (
                              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                {unit.detail}
                              </span>
                            ) : null}
                            {unit.isAtomic ? (
                              <span className="mt-0.5 block text-[10px] font-medium uppercase text-emerald-700">
                                Promo · se cobra completa
                              </span>
                            ) : null}
                          </span>
                        </label>

                        <div className="flex justify-center">
                          {unit.isAtomic ? (
                            <span className="text-sm tabular-nums text-muted-foreground">
                              {unit.maxSelectable}
                            </span>
                          ) : (
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                aria-label="Quitar uno"
                                disabled={qty <= 0}
                                onClick={() => setUnitQty(unit, qty - 1)}
                                className="inline-flex size-6 items-center justify-center rounded border border-border/70 text-muted-foreground hover:bg-muted disabled:opacity-40"
                              >
                                <Minus className="size-3" />
                              </button>
                              <Input
                                value={String(qty)}
                                onChange={(e) => {
                                  const n = Number.parseInt(e.target.value, 10)
                                  setUnitQty(unit, Number.isFinite(n) ? n : 0)
                                }}
                                className="h-6 w-8 px-0 text-center text-xs tabular-nums"
                                inputMode="numeric"
                              />
                              <button
                                type="button"
                                aria-label="Agregar uno"
                                disabled={qty >= unit.maxSelectable}
                                onClick={() => setUnitQty(unit, qty + 1)}
                                className="inline-flex size-6 items-center justify-center rounded border border-border/70 text-muted-foreground hover:bg-muted disabled:opacity-40"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        <span className="text-right text-sm font-medium tabular-nums text-slate-800">
                          {saleOpFmt.format(rowTotal)}
                        </span>
                      </li>
                    )
                  })
                )}
              </ul>
            </div>
          ) : null}

          <label
            className={cn(
              "flex items-start gap-3 rounded-lg border border-border/70 bg-background px-3 py-2.5",
              partialPayment
                ? "cursor-not-allowed opacity-45"
                : "cursor-pointer hover:bg-muted/30",
            )}
          >
            <Checkbox
              checked={closeOnComplete && !partialPayment}
              disabled={partialPayment}
              onCheckedChange={(v) => onCloseOnCompleteChange(v === true)}
              className="mt-0.5"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium">{closeLabel}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                {partialPayment
                  ? "No disponible mientras haya un cobro parcial pendiente."
                  : `Al confirmar, se libera la ${contextLabel} automáticamente.`}
              </span>
            </span>
          </label>

          {submitError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {submitError}
            </p>
          ) : null}
        </div>

        <CheckoutDialogFooter
          className="shrink-0 border-t border-border/50 bg-muted/20"
          cancelDisabled={submitting}
          primary={{
            label: confirmLabel,
            onClick: () =>
              void onConfirm({
                partialPayment,
                partialSelection,
                closeOnComplete: partialPayment ? false : closeOnComplete,
                imprimirComprobante: hasComprobante && imprimirComprobante,
              }),
            disabled: submitting || !canConfirm,
            loading: submitting,
            loadingLabel: "Procesando…",
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function roundLineTotal(unit: PartialPaymentUnit, qty: number): number {
  if (unit.unitFinalPrice != null) {
    return Math.round(unit.unitFinalPrice * qty * 100) / 100
  }
  if (unit.maxSelectable > 0) {
    return Math.round((unit.lineFinalTotal / unit.maxSelectable) * qty * 100) / 100
  }
  return unit.lineFinalTotal
}
