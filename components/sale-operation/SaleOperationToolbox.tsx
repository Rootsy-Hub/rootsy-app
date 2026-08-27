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
  layoutsOperarToolboxSlotMetaClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { LayoutsOperarToolboxFloor } from "@/components/layouts-module/LayoutsOperarToolboxFloor"
import { saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import { useRegisterOperarMobileToolbox } from "@/components/layouts-module/OperarMobileToolbox"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { Banknote, Percent, Receipt, User } from "lucide-react"
import { useMemo } from "react"

const TOOLBOX_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL

export type SaleOperationToolboxProps = {
  clienteLabel: string
  clienteIvaLabel: string | null
  clienteDisabled?: boolean
  clienteConfigurado?: boolean
  /** Deshabilita comprobante, pago y descuento (p. ej. mesa sin sesión abierta). */
  toolbarDisabled?: boolean
  /** Override solo para pago (p. ej. vender sin caja abierta). */
  pagoDisabled?: boolean
  comprobanteLabel: string
  comprobanteConfigurado?: boolean
  pagoLabel: string
  pagoSubLabel?: string | null
  pagoConfigurado: boolean
  pagoIcon?: LucideIcon
  descuentoLabel: string
  hayDescuento: boolean
  descuentoDisabled?: boolean
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
  pagoDisabled,
  comprobanteLabel,
  comprobanteConfigurado,
  pagoLabel,
  pagoSubLabel,
  pagoConfigurado,
  pagoIcon: PagoIconProp,
  descuentoLabel,
  hayDescuento,
  descuentoDisabled = false,
  onClienteClick,
  onComprobanteClick,
  onPagoClick,
  onDescuentoClick,
  className,
}: SaleOperationToolboxProps) {
  const pagoButtonDisabled = pagoDisabled ?? toolbarDisabled
  const comprobanteListo = comprobanteConfigurado ?? comprobanteLabel !== "Sin comprobante"
  const PagoIcon = PagoIconProp ?? Banknote

  const mobileItems = useMemo(
    () => [
      {
        id: "cliente",
        icon: User,
        configured: clienteConfigurado,
        disabled: clienteDisabled || toolbarDisabled,
        ariaLabel: `Cliente: ${clienteLabel}`,
        onClick: onClienteClick,
      },
      {
        id: "comprobante",
        icon: Receipt,
        configured: comprobanteListo,
        disabled: toolbarDisabled,
        ariaLabel: `Comprobante: ${comprobanteLabel}`,
        onClick: onComprobanteClick,
      },
      {
        id: "pago",
        icon: PagoIcon,
        configured: pagoConfigurado,
        disabled: pagoButtonDisabled,
        ariaLabel: pagoSubLabel
          ? `Pago: ${pagoLabel}, ${pagoSubLabel}`
          : `Pago: ${pagoLabel}`,
        onClick: onPagoClick,
      },
      {
        id: "descuento",
        icon: Percent,
        configured: hayDescuento,
        disabled: toolbarDisabled || descuentoDisabled,
        ariaLabel: `Descuento: ${descuentoLabel}${descuentoDisabled ? " (bloqueado)" : ""}`,
        onClick: onDescuentoClick,
      },
    ],
    [
      clienteConfigurado,
      clienteDisabled,
      toolbarDisabled,
      clienteLabel,
      onClienteClick,
      comprobanteListo,
      comprobanteLabel,
      onComprobanteClick,
      PagoIcon,
      pagoConfigurado,
      pagoButtonDisabled,
      pagoSubLabel,
      pagoLabel,
      onPagoClick,
      hayDescuento,
      descuentoDisabled,
      descuentoLabel,
      onDescuentoClick,
    ],
  )
  useRegisterOperarMobileToolbox(mobileItems)

  return (
    <LayoutsOperarToolboxFloor className={className}>
      <div
        role="toolbar"
        aria-label="Configuración de la operación"
        className={cn(layoutsOperarToolboxBandClass, layoutsOperarToolboxBarGridClass)}
      >
        <button
          type="button"
          disabled={clienteDisabled || toolbarDisabled}
          onClick={onClienteClick}
          className={cn(
            layoutsOperarToolboxSlotClass(clienteConfigurado),
            (clienteDisabled || toolbarDisabled) && "opacity-45",
          )}
          aria-label={`Cliente: ${clienteLabel}`}
        >
          <span className={layoutsOperarToolboxIconWrapClass(clienteConfigurado)}>
            <User className="size-4.5 sm:size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className={layoutsOperarToolboxProposalSlotLabelClass(TOOLBOX_PROPOSAL)}>
              Cliente
            </span>
            <span
              className={layoutsOperarToolboxProposalSlotValueClass(
                TOOLBOX_PROPOSAL,
                clienteConfigurado,
              )}
            >
              {clienteLabel}
            </span>
            {clienteIvaLabel ? (
              <span className={layoutsOperarToolboxSlotMetaClass}>
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
            layoutsOperarToolboxSlotClass(comprobanteListo),
            toolbarDisabled && "opacity-45",
          )}
          aria-label={`Comprobante: ${comprobanteLabel}`}
        >
          <span
            className={layoutsOperarToolboxIconWrapClass(comprobanteListo)}
          >
            <Receipt className="size-4.5 sm:size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className={layoutsOperarToolboxProposalSlotLabelClass(TOOLBOX_PROPOSAL)}>
              Comprobante
            </span>
            <span
              className={layoutsOperarToolboxProposalSlotValueClass(
                TOOLBOX_PROPOSAL,
                comprobanteListo,
              )}
            >
              {comprobanteLabel}
            </span>
          </span>
        </button>

        <button
          type="button"
          disabled={pagoButtonDisabled}
          onClick={onPagoClick}
          className={cn(
            layoutsOperarToolboxSlotClass(pagoConfigurado),
            pagoButtonDisabled && "opacity-45",
          )}
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
              <span className={layoutsOperarToolboxSlotMetaClass}>
                {pagoSubLabel}
              </span>
            ) : null}
          </span>
        </button>

        <button
          type="button"
          disabled={toolbarDisabled || descuentoDisabled}
          onClick={onDescuentoClick}
          className={cn(
            layoutsOperarToolboxSlotClass(hayDescuento),
            (toolbarDisabled || descuentoDisabled) && "opacity-45",
          )}
          aria-label={`Descuento: ${descuentoLabel}${descuentoDisabled ? " (bloqueado)" : ""}`}
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
