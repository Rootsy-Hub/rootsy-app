"use client"

import {
  layoutsOperarToolboxProposalSlotLabelClass,
  layoutsOperarToolboxProposalSlotValueClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import {
  layoutsOperarToolboxBandClass,
  layoutsOperarToolboxBarGridClass,
  layoutsOperarToolboxIconWrapClass,
  layoutsOperarToolboxSlotClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { LayoutsOperarToolboxFloor } from "@/components/layouts-module/LayoutsOperarToolboxFloor"
import { saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import { useRegisterOperarMobileToolbox } from "@/components/layouts-module/OperarMobileToolbox"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { Banknote, Percent, Receipt, Truck } from "lucide-react"
import { useMemo } from "react"

const TOOLBOX_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL

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
  descuentoLabel: string
  hayDescuento: boolean
  onProveedorClick: () => void
  onComprobanteClick: () => void
  onPagoClick: () => void
  onDescuentoClick: () => void
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
  descuentoLabel,
  hayDescuento,
  onProveedorClick,
  onComprobanteClick,
  onPagoClick,
  onDescuentoClick,
  className,
}: PurchaseOperationToolboxProps) {
  const PagoIcon = PagoIconProp ?? Banknote

  const mobileItems = useMemo(
    () => [
      {
        id: "proveedor",
        icon: Truck,
        configured: proveedorConfigurado,
        disabled: false,
        ariaLabel: `Proveedor: ${proveedorLabel}`,
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
      {
        id: "descuento",
        icon: Percent,
        configured: hayDescuento,
        disabled: false,
        ariaLabel: `Descuento: ${descuentoLabel}`,
        onClick: onDescuentoClick,
      },
    ],
    [
      proveedorConfigurado,
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
      hayDescuento,
      descuentoLabel,
      onDescuentoClick,
    ],
  )
  useRegisterOperarMobileToolbox(mobileItems)

  return (
    <LayoutsOperarToolboxFloor className={className}>
      <div
        role="toolbar"
        aria-label="Configuración de la compra"
        className={cn(layoutsOperarToolboxBandClass, layoutsOperarToolboxBarGridClass)}
      >
        <button
          type="button"
          onClick={onProveedorClick}
          className={layoutsOperarToolboxSlotClass(proveedorConfigurado)}
          aria-label={`Proveedor: ${proveedorLabel}`}
        >
          <span className={layoutsOperarToolboxIconWrapClass(proveedorConfigurado)}>
            <Truck className="size-4.5 sm:size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className={layoutsOperarToolboxProposalSlotLabelClass(TOOLBOX_PROPOSAL)}>
              Proveedor
            </span>
            <span
              className={layoutsOperarToolboxProposalSlotValueClass(
                TOOLBOX_PROPOSAL,
                proveedorConfigurado,
              )}
            >
              {proveedorLabel}
            </span>
            {proveedorIvaLabel ? (
              <span className="mt-0.5 block truncate text-[11px] font-medium text-[color-mix(in_srgb,var(--rootsy-sombra-300)_68%,transparent)]">
                {proveedorIvaLabel}
              </span>
            ) : null}
          </span>
        </button>

        <button
          type="button"
          onClick={onComprobanteClick}
          className={layoutsOperarToolboxSlotClass(comprobanteConfigurado)}
          aria-label={`Comprobante: ${comprobanteLabel}`}
        >
          <span className={layoutsOperarToolboxIconWrapClass(comprobanteConfigurado)}>
            <Receipt className="size-4.5 sm:size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className={layoutsOperarToolboxProposalSlotLabelClass(TOOLBOX_PROPOSAL)}>
              Comprobante
            </span>
            <span
              className={layoutsOperarToolboxProposalSlotValueClass(
                TOOLBOX_PROPOSAL,
                comprobanteConfigurado,
              )}
            >
              {comprobanteLabel}
            </span>
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
            <PagoIcon className="size-4.5 sm:size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className={layoutsOperarToolboxProposalSlotLabelClass(TOOLBOX_PROPOSAL)}>
              Pago
            </span>
            <span
              className={layoutsOperarToolboxProposalSlotValueClass(
                TOOLBOX_PROPOSAL,
                pagoConfigurado,
              )}
            >
              {pagoLabel}
            </span>
            {pagoSubLabel ? (
              <span className="mt-0.5 block truncate text-[11px] font-medium text-[color-mix(in_srgb,var(--rootsy-sombra-300)_68%,transparent)]">
                {pagoSubLabel}
              </span>
            ) : null}
          </span>
        </button>

        <button
          type="button"
          onClick={onDescuentoClick}
          className={layoutsOperarToolboxSlotClass(hayDescuento)}
          aria-label={`Descuento: ${descuentoLabel}`}
        >
          <span className={layoutsOperarToolboxIconWrapClass(hayDescuento)}>
            <Percent className="size-4.5 sm:size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className={layoutsOperarToolboxProposalSlotLabelClass(TOOLBOX_PROPOSAL)}>
              Descuento
            </span>
            <span
              className={cn(
                layoutsOperarToolboxProposalSlotValueClass(TOOLBOX_PROPOSAL, hayDescuento),
                hayDescuento && saleOpImporteBaseClass,
              )}
            >
              {descuentoLabel}
            </span>
          </span>
        </button>
      </div>
    </LayoutsOperarToolboxFloor>
  )
}
