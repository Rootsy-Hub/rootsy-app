"use client"

import {
  layoutsOperarToolboxBandClass,
  layoutsOperarToolboxBarGrid3Class,
  layoutsOperarToolboxIconWrapClass,
  layoutsOperarToolboxSlotClass,
  layoutsOperarToolboxSlotCopyClass,
  layoutsOperarToolboxSlotLabelClass,
  layoutsOperarToolboxSlotLine,
  layoutsOperarToolboxSlotLineClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { LayoutsOperarToolboxFloor } from "@/components/layouts-module/LayoutsOperarToolboxFloor"
import { useRegisterOperarMobileToolbox } from "@/components/layouts-module/OperarMobileToolbox"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { Banknote, Receipt, Truck } from "lucide-react"
import { useMemo } from "react"

export type PurchaseOperationToolboxProps = {
  proveedorLabel: string
  proveedorIvaLabel: string | null
  proveedorConfigurado?: boolean
  comprobanteLabel: string
  comprobanteConfigurado: boolean
  pagoLabel: string
  pagoSubLabel?: string | null
  pagoConfigurado: boolean
  pagoIcon?: LucideIcon
  onProveedorClick: () => void
  onComprobanteClick: () => void
  onPagoClick: () => void
  /** Sin piso propio — va dentro del checkout floor. */
  embedded?: boolean
  className?: string
}

export function PurchaseOperationToolbox({
  proveedorLabel,
  proveedorIvaLabel,
  proveedorConfigurado = false,
  comprobanteLabel,
  comprobanteConfigurado,
  pagoLabel,
  pagoSubLabel,
  pagoConfigurado,
  pagoIcon: PagoIconProp,
  onProveedorClick,
  onComprobanteClick,
  onPagoClick,
  embedded = false,
  className,
}: PurchaseOperationToolboxProps) {
  const PagoIcon = PagoIconProp ?? Banknote
  const proveedorLine = layoutsOperarToolboxSlotLine(
    "Proveedor",
    proveedorLabel,
    proveedorConfigurado,
  )
  const comprobanteLine = layoutsOperarToolboxSlotLine(
    "Comprobante",
    comprobanteLabel,
    comprobanteConfigurado,
  )
  const pagoLine = layoutsOperarToolboxSlotLine("Pago", pagoLabel, pagoConfigurado)

  const mobileItems = useMemo(
    () => [
      {
        id: "proveedor",
        icon: Truck,
        configured: proveedorConfigurado,
        disabled: false,
        ariaLabel: proveedorIvaLabel
          ? `Proveedor: ${proveedorLabel}, ${proveedorIvaLabel}`
          : `Proveedor: ${proveedorLabel}`,
        onClick: onProveedorClick,
      },
      {
        id: "comprobante",
        icon: Receipt,
        configured: comprobanteConfigurado,
        disabled: false,
        ariaLabel: `Comprobante: ${comprobanteLabel}`,
        onClick: onComprobanteClick,
      },
      {
        id: "pago",
        icon: PagoIcon,
        configured: pagoConfigurado,
        disabled: false,
        ariaLabel: pagoSubLabel
          ? `Pago: ${pagoLabel}, ${pagoSubLabel}`
          : `Pago: ${pagoLabel}`,
        onClick: onPagoClick,
      },
    ],
    [
      proveedorConfigurado,
      proveedorIvaLabel,
      proveedorLabel,
      onProveedorClick,
      comprobanteConfigurado,
      comprobanteLabel,
      onComprobanteClick,
      PagoIcon,
      pagoConfigurado,
      pagoSubLabel,
      pagoLabel,
      onPagoClick,
    ],
  )
  useRegisterOperarMobileToolbox(mobileItems)

  const toolbar = (
    <div
      role="toolbar"
      aria-label="Checkout de la compra"
      className={cn(
        layoutsOperarToolboxBandClass,
        layoutsOperarToolboxBarGrid3Class,
        embedded && "h-full divide-[var(--rootsy-sombra-800)]",
        embedded && className,
      )}
    >
      <button
        type="button"
        onClick={onProveedorClick}
        className={layoutsOperarToolboxSlotClass(proveedorConfigurado)}
        aria-label={
          proveedorIvaLabel
            ? `Proveedor: ${proveedorLabel}, ${proveedorIvaLabel}`
            : `Proveedor: ${proveedorLabel}`
        }
      >
        <span className={layoutsOperarToolboxIconWrapClass(proveedorConfigurado)}>
          <Truck className="size-5" aria-hidden />
        </span>
        <span className={layoutsOperarToolboxSlotCopyClass}>
          <span className={layoutsOperarToolboxSlotLabelClass}>1 · Proveedor</span>
          <span className={layoutsOperarToolboxSlotLineClass}>{proveedorLine}</span>
        </span>
      </button>

      <button
        type="button"
        onClick={onComprobanteClick}
        className={layoutsOperarToolboxSlotClass(comprobanteConfigurado)}
        aria-label={`Comprobante: ${comprobanteLabel}`}
      >
        <span className={layoutsOperarToolboxIconWrapClass(comprobanteConfigurado)}>
          <Receipt className="size-5" aria-hidden />
        </span>
        <span className={layoutsOperarToolboxSlotCopyClass}>
          <span className={layoutsOperarToolboxSlotLabelClass}>2 · Comprobante</span>
          <span className={layoutsOperarToolboxSlotLineClass}>{comprobanteLine}</span>
        </span>
      </button>

      <button
        type="button"
        onClick={onPagoClick}
        className={layoutsOperarToolboxSlotClass(pagoConfigurado)}
        aria-label={
          pagoSubLabel
            ? `Pago: ${pagoLabel}, ${pagoSubLabel}`
            : `Pago: ${pagoLabel}`
        }
      >
        <span className={layoutsOperarToolboxIconWrapClass(pagoConfigurado)}>
          <PagoIcon className="size-5" aria-hidden />
        </span>
        <span className={layoutsOperarToolboxSlotCopyClass}>
          <span className={layoutsOperarToolboxSlotLabelClass}>3 · Pago</span>
          <span className={layoutsOperarToolboxSlotLineClass}>{pagoLine}</span>
        </span>
      </button>
    </div>
  )

  if (embedded) return toolbar

  return (
    <LayoutsOperarToolboxFloor className={className}>{toolbar}</LayoutsOperarToolboxFloor>
  )
}
