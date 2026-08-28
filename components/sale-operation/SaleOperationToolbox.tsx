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
import { Banknote, Receipt, User } from "lucide-react"
import { useMemo } from "react"

export type SaleOperationToolboxProps = {
  clienteLabel: string
  clienteIvaLabel: string | null
  clienteDisabled?: boolean
  clienteConfigurado?: boolean
  /** Deshabilita comprobante y pago (p. ej. mesa sin sesión abierta). */
  toolbarDisabled?: boolean
  /** Override solo para pago (p. ej. vender sin caja abierta). */
  pagoDisabled?: boolean
  comprobanteLabel: string
  comprobanteConfigurado?: boolean
  pagoLabel: string
  pagoSubLabel?: string | null
  pagoConfigurado: boolean
  pagoIcon?: LucideIcon
  onClienteClick: () => void
  onComprobanteClick: () => void
  onPagoClick: () => void
  /** Sin piso propio — va dentro del checkout floor. */
  embedded?: boolean
  /** Solo registra los íconos mobile. El piso desktop usa otra variante. */
  registerOnly?: boolean
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
  onClienteClick,
  onComprobanteClick,
  onPagoClick,
  embedded = false,
  registerOnly = false,
  className,
}: SaleOperationToolboxProps) {
  const pagoButtonDisabled = pagoDisabled ?? toolbarDisabled
  const comprobanteListo = comprobanteConfigurado ?? comprobanteLabel !== "Sin comprobante"
  const PagoIcon = PagoIconProp ?? Banknote
  const clienteLine = layoutsOperarToolboxSlotLine("Cliente", clienteLabel, clienteConfigurado)
  const comprobanteLine = layoutsOperarToolboxSlotLine(
    "Comprobante",
    comprobanteLabel,
    comprobanteListo,
  )
  const pagoLine = layoutsOperarToolboxSlotLine("Pago", pagoLabel, pagoConfigurado)

  const mobileItems = useMemo(
    () => [
      {
        id: "cliente",
        icon: User,
        configured: clienteConfigurado,
        disabled: clienteDisabled || toolbarDisabled,
        ariaLabel: clienteIvaLabel
          ? `Cliente: ${clienteLabel}, ${clienteIvaLabel}`
          : `Cliente: ${clienteLabel}`,
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
    ],
    [
      clienteConfigurado,
      clienteDisabled,
      toolbarDisabled,
      clienteIvaLabel,
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
    ],
  )
  useRegisterOperarMobileToolbox(mobileItems)

  if (registerOnly) return null

  const toolbar = (
    <div
      role="toolbar"
      aria-label="Checkout de la venta"
      className={cn(
        layoutsOperarToolboxBandClass,
        layoutsOperarToolboxBarGrid3Class,
        embedded && "h-full divide-[var(--rootsy-sombra-800)]",
        embedded && className,
      )}
    >
      <button
        type="button"
        disabled={clienteDisabled || toolbarDisabled}
        onClick={onClienteClick}
        className={cn(
          layoutsOperarToolboxSlotClass(clienteConfigurado),
          (clienteDisabled || toolbarDisabled) && "opacity-45",
        )}
        aria-label={
          clienteIvaLabel
            ? `Cliente: ${clienteLabel}, ${clienteIvaLabel}`
            : `Cliente: ${clienteLabel}`
        }
      >
        <span className={layoutsOperarToolboxIconWrapClass(clienteConfigurado)}>
          <User className="size-5" aria-hidden />
        </span>
        <span className={layoutsOperarToolboxSlotCopyClass}>
          <span className={layoutsOperarToolboxSlotLabelClass}>1 · Cliente</span>
          <span className={layoutsOperarToolboxSlotLineClass}>{clienteLine}</span>
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
        <span className={layoutsOperarToolboxIconWrapClass(comprobanteListo)}>
          <Receipt className="size-5" aria-hidden />
        </span>
        <span className={layoutsOperarToolboxSlotCopyClass}>
          <span className={layoutsOperarToolboxSlotLabelClass}>2 · Comprobante</span>
          <span className={layoutsOperarToolboxSlotLineClass}>{comprobanteLine}</span>
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
