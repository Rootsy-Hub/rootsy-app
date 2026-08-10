"use client"

import {
  layoutsOperarToolboxProposalSlotLabelClass,
  layoutsOperarToolboxProposalSlotValueClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import {
  layoutsOperarToolboxBandClass,
  layoutsOperarToolboxBarClass,
  layoutsOperarToolboxIconWrapClass,
  layoutsOperarToolboxSlotClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { Banknote, Percent, Receipt, Truck } from "lucide-react"

const TOOLBOX_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL

export type PurchaseOperationToolboxProps = {
  proveedorLabel: string
  proveedorIvaLabel: string | null
  proveedorConfigurado?: boolean
  comprobanteLabel: string
  comprobanteConfigurado: boolean
  pagoLabel: string
  pagoConfigurado: boolean
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
  pagoConfigurado,
  descuentoLabel,
  hayDescuento,
  onProveedorClick,
  onComprobanteClick,
  onPagoClick,
  onDescuentoClick,
  className,
}: PurchaseOperationToolboxProps) {
  return (
    <div className={cn(layoutsOperarToolboxBandClass, className)}>
      <div
        role="toolbar"
        aria-label="Configuración de la compra"
        className={layoutsOperarToolboxBarClass}
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
          aria-label={`Pago: ${pagoLabel}`}
        >
          <span className={layoutsOperarToolboxIconWrapClass(pagoConfigurado)}>
            <Banknote className="size-4.5 sm:size-5" aria-hidden />
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
    </div>
  )
}
