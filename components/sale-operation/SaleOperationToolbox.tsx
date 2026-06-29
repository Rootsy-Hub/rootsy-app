"use client"

import {
  saleOpFooterBandHeightClass,
  saleOpFooterBarPaddingClass,
  saleOpImporteBaseClass,
  saleOpToolboxBarClass,
  saleOpToolboxIconWrap,
  saleOpToolboxSlotClass,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { Banknote, Percent, Receipt, User } from "lucide-react"

export type SaleOperationToolboxProps = {
  clienteLabel: string
  clienteIvaLabel: string | null
  clienteDisabled?: boolean
  clienteConfigurado?: boolean
  /** Deshabilita comprobante, pago y descuento (p. ej. mesa sin sesión abierta). */
  toolbarDisabled?: boolean
  comprobanteLabel: string
  pagoLabel: string
  pagoConfigurado: boolean
  descuentoLabel: string
  hayDescuento: boolean
  onClienteClick: () => void
  onComprobanteClick: () => void
  onPagoClick: () => void
  onDescuentoClick: () => void
  className?: string
}

export function SaleOperationToolbox({
  clienteLabel,
  clienteIvaLabel,
  clienteDisabled = false,
  clienteConfigurado = false,
  toolbarDisabled = false,
  comprobanteLabel,
  pagoLabel,
  pagoConfigurado,
  descuentoLabel,
  hayDescuento,
  onClienteClick,
  onComprobanteClick,
  onPagoClick,
  onDescuentoClick,
  className,
}: SaleOperationToolboxProps) {
  return (
    <div
      role="toolbar"
      aria-label="Configuración de la operación"
      className={cn(
        "grid h-full min-h-0 grid-cols-2 gap-2 lg:grid-cols-4",
        saleOpToolboxBarClass,
        saleOpFooterBarPaddingClass,
        saleOpFooterBandHeightClass,
        className,
      )}
    >
      <button
        type="button"
        disabled={clienteDisabled || toolbarDisabled}
        onClick={onClienteClick}
        className={cn(
          saleOpToolboxSlotClass(clienteConfigurado),
          (clienteDisabled || toolbarDisabled) && "opacity-45",
        )}
        aria-label={`Cliente: ${clienteLabel}`}
      >
        <span className={saleOpToolboxIconWrap(clienteConfigurado)}>
          <User className="size-4.5 sm:size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
            Cliente
          </span>
          <span className="block truncate text-sm font-semibold leading-snug text-foreground">
            {clienteLabel}
          </span>
          {clienteIvaLabel ? (
            <span className="mt-0.5 block truncate text-[11px] font-medium text-muted-foreground">
              {clienteIvaLabel}
            </span>
          ) : null}
        </span>
      </button>

      <button
        type="button"
        disabled={toolbarDisabled}
        onClick={onComprobanteClick}
        className={cn(
          saleOpToolboxSlotClass(comprobanteLabel !== "Sin comprobante"),
          toolbarDisabled && "opacity-45",
        )}
        aria-label={`Comprobante: ${comprobanteLabel}`}
      >
        <span className={saleOpToolboxIconWrap(comprobanteLabel !== "Sin comprobante")}>
          <Receipt className="size-4.5 sm:size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
            Comprobante
          </span>
          <span className="block truncate text-sm font-semibold leading-snug text-foreground">
            {comprobanteLabel}
          </span>
        </span>
      </button>

      <button
        type="button"
        disabled={toolbarDisabled}
        onClick={onPagoClick}
        className={cn(
          saleOpToolboxSlotClass(pagoConfigurado),
          toolbarDisabled && "opacity-45",
        )}
        aria-label={`Pago: ${pagoLabel}`}
      >
        <span className={saleOpToolboxIconWrap(pagoConfigurado)}>
          <Banknote className="size-4.5 sm:size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
            Pago
          </span>
          <span className="block truncate text-sm font-semibold leading-snug text-foreground">
            {pagoLabel}
          </span>
        </span>
      </button>

      <button
        type="button"
        disabled={toolbarDisabled}
        onClick={onDescuentoClick}
        className={cn(
          saleOpToolboxSlotClass(hayDescuento),
          toolbarDisabled && "opacity-45",
        )}
        aria-label={`Descuento: ${descuentoLabel}`}
      >
        <span className={saleOpToolboxIconWrap(hayDescuento)}>
          <Percent className="size-4.5 sm:size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
            Descuento
          </span>
          <span
            className={cn(
              "block truncate text-sm font-semibold leading-snug",
              hayDescuento ? cn("text-foreground", saleOpImporteBaseClass) : "text-foreground/55",
            )}
          >
            {descuentoLabel}
          </span>
        </span>
      </button>
    </div>
  )
}
