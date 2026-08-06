"use client"

import type { PartialPaymentSelection, PartialPaymentUnit } from "@/lib/partialCheckoutSelection"
import { SaleFinalizeSummary } from "@/components/checkout/SaleFinalizeSummary"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import {
  CheckoutSectionLabel,
  CheckoutSectionPanel,
  CheckoutToggleCard,
} from "@/components/checkout/CheckoutFormFields"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  saleOpDialogBody,
  saleOpDialogContentMd,
  saleOpDialogHeader,
  saleOpFmt,
  saleOpImporteBaseClass,
  saleOpImporteCartClass,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import {
  DoorOpen,
  Minus,
  Plus,
  Printer,
  Split,
} from "lucide-react"

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

function PartialPaymentUnitRow({
  unit,
  qty,
  onToggle,
  onSetQty,
}: {
  unit: PartialPaymentUnit
  qty: number
  onToggle: (checked: boolean) => void
  onSetQty: (qty: number) => void
}) {
  const selected = qty > 0
  const rowTotal = unit.isAtomic
    ? unit.lineFinalTotal
    : roundLineTotal(unit, qty)
  const itemTitle = unit.detail?.trim()
    ? `${unit.label} · ${unit.detail.trim()}`
    : unit.label
  const showQuantityStepper = unit.maxSelectable > 1

  return (
    <li
      role="checkbox"
      aria-checked={selected}
      aria-label={`Seleccionar ${unit.label}`}
      tabIndex={0}
      onClick={() => onToggle(!selected)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onToggle(!selected)
        }
      }}
      className={cn(
        "flex w-full min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "border-primary/45 bg-primary/8"
          : "border-border/70 bg-muted/15 hover:border-border hover:bg-muted/30",
      )}
    >
      <span
        className={cn(
          saleOpImporteBaseClass,
          "w-5 shrink-0 text-center text-sm font-semibold tabular-nums text-muted-foreground",
        )}
        aria-hidden
      >
        {unit.maxSelectable}
      </span>

      <span
        className="min-w-0 flex-1 truncate text-sm font-semibold leading-snug text-foreground"
        title={itemTitle}
      >
        {unit.label}
      </span>

      <div
        className="flex h-7 w-23 shrink-0 items-center justify-center gap-0.5"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {showQuantityStepper ? (
          <>
            <button
              type="button"
              aria-label="Quitar uno"
              disabled={qty <= 0}
              onClick={(event) => {
                event.stopPropagation()
                onSetQty(qty - 1)
              }}
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground shadow-sm transition-colors",
                "hover:bg-muted/40 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                "disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              <Minus className="size-3.5" aria-hidden />
            </button>
            <span
              className={cn(
                saleOpImporteBaseClass,
                "min-w-5 text-center text-sm font-semibold tabular-nums",
              )}
            >
              {qty}
            </span>
            <button
              type="button"
              aria-label="Agregar uno"
              disabled={qty >= unit.maxSelectable}
              onClick={(event) => {
                event.stopPropagation()
                onSetQty(qty + 1)
              }}
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground shadow-sm transition-colors",
                "hover:bg-muted/40 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                "disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              <Plus className="size-3.5" aria-hidden />
            </button>
          </>
        ) : (
          <span
            className={cn(
              saleOpImporteBaseClass,
              "min-w-5 text-center text-sm font-semibold tabular-nums text-muted-foreground",
            )}
            aria-hidden
          >
            {qty}
          </span>
        )}
      </div>

      <span
        className={cn(
          saleOpImporteCartClass,
          "w-22 shrink-0 text-right text-sm",
        )}
      >
        {saleOpFmt.format(rowTotal)}
      </span>
    </li>
  )
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
    contextLabel === "mesa" ? "Liberar mesa al cobrar" : "Cerrar pedido al cobrar"

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

  const partialItemsList =
    partialUnits.length === 0 ? (
      <p className="rounded-xl border border-dashed border-border/70 bg-muted/10 px-3.5 py-6 text-center text-sm text-muted-foreground">
        No hay ítems pendientes de cobro.
      </p>
    ) : (
      <ul className="space-y-2">
        {partialUnits.map((unit) => (
          <PartialPaymentUnitRow
            key={unit.selectionKey}
            unit={unit}
            qty={selectionQty(partialSelection, unit)}
            onToggle={(checked) => toggleUnit(unit, checked)}
            onSetQty={(nextQty) => setUnitQty(unit, nextQty)}
          />
        ))}
      </ul>
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          saleOpDialogContentMd,
          "flex max-h-[min(92vh,720px)] flex-col gap-0 overflow-hidden p-0 transition-none duration-0",
          partialPayment && "md:max-w-[min(92vw,56rem)]",
        )}
      >
        <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Confirmar cobro de {contextLabel}
          </DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            saleOpDialogBody,
            "min-h-0 flex-1 overflow-y-auto overscroll-contain",
            partialPayment &&
              "md:relative md:overflow-hidden md:p-0 md:overflow-y-visible",
            partialPayment ? "space-y-4 md:space-y-0" : "space-y-4",
          )}
        >
          <div
            className={cn(
              "space-y-4",
              partialPayment &&
                "md:w-1/2 md:max-w-[50%] md:shrink-0 md:px-6 md:py-4",
            )}
          >
            <SaleFinalizeSummary
              total={total}
              subtotal={subtotal}
              descuentoMonto={descuentoMonto}
              hayDescuento={hayDescuento}
              partyValue={clientLabel}
              comprobanteLabel={comprobanteLabel}
              paymentLabel={paymentLabel}
            />

            <CheckoutSectionPanel className="space-y-2.5">
              <CheckoutSectionLabel>Opciones</CheckoutSectionLabel>
              <CheckoutToggleCard
                title="Cobro parcial"
                selected={partialPayment}
                onClick={() => onPartialPaymentChange(!partialPayment)}
                icon={Split}
              />
              {hasComprobante ? (
                <CheckoutToggleCard
                  title="Imprimir comprobante"
                  selected={imprimirComprobante}
                  onClick={() =>
                    onImprimirComprobanteChange(!imprimirComprobante)
                  }
                  icon={Printer}
                />
              ) : null}
              <CheckoutToggleCard
                title={closeLabel}
                selected={closeOnComplete && !partialPayment}
                disabled={partialPayment}
                onClick={() => onCloseOnCompleteChange(!closeOnComplete)}
                icon={DoorOpen}
              />
            </CheckoutSectionPanel>

            {partialPayment ? (
              <CheckoutSectionPanel className="space-y-2.5 md:hidden">
                <CheckoutSectionLabel>Ítems a cobrar</CheckoutSectionLabel>
                {partialItemsList}
              </CheckoutSectionPanel>
            ) : null}

            {submitError ? (
              <p
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive"
              >
                {submitError}
              </p>
            ) : null}
          </div>

          {partialPayment ? (
            <aside className="hidden md:absolute md:inset-y-0 md:right-0 md:flex md:w-1/2 md:flex-col md:border-l md:border-border/50 md:bg-muted/10">
              <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-5 py-4">
                <CheckoutSectionLabel>Ítems a cobrar</CheckoutSectionLabel>
                {partialItemsList}
              </div>
            </aside>
          ) : null}
        </div>

        <CheckoutDialogFooter
          className="shrink-0"
          onCancel={() => onOpenChange(false)}
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
