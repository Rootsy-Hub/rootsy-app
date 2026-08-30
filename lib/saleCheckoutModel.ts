import { partyCanOperateOnCurrentAccount } from "@/lib/currentAccounts"
import {
  resolveSaleCheckoutRisk,
  type SaleCheckoutRiskReason,
} from "@/lib/saleCheckoutRisk"
import type { LucideIcon } from "lucide-react"

function formatSaleCheckoutMoney(n: number) {
  const whole = Math.round(Math.abs(n) * 100) % 100 === 0
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(n)
}

export type SaleCheckoutParty = {
  id?: string | null
  name?: string | null
  taxId?: string | null
  currentAccountEnabled?: boolean
} | null

export type SaleCheckoutToolboxModel = {
  clienteLabel: string
  clienteIvaLabel: string | null
  clienteDisabled: boolean
  clienteConfigurado: boolean
  toolbarDisabled: boolean
  comprobanteLabel: string
  comprobanteConfigurado: boolean
  pagoLabel: string
  pagoSubLabel: string | null
  pagoIcon?: LucideIcon
  pagoConfigurado: boolean
  pagoDisabled: boolean
  onClienteClick: () => void
  onComprobanteClick: () => void
  onPagoClick: () => void
}

export type SaleCheckoutActions = {
  discardDisabled?: boolean
  discardTitle?: string
  confirmDisabled?: boolean
  confirmLoading?: boolean
  confirmLabel?: string
  confirmTitle?: string
  onDiscard: () => void
  onConfirm: () => void
}

export type SaleCheckoutModel = {
  risk: SaleCheckoutRiskReason | null
  canCommit: boolean
  actions: SaleCheckoutActions
  toolbox: SaleCheckoutToolboxModel
}

export function resolveSaleCheckoutConfirmTitle(input: {
  hasItems: boolean
  paymentReady: boolean
  payOnClientAccount: boolean
  party: SaleCheckoutParty
  canCreateSale: boolean
  canReadCashRegisters: boolean
  cashOpen: boolean
}): string | undefined {
  if (!input.hasItems) return "Agregá productos al pedido."
  if (!input.paymentReady) {
    return "Elegí una forma de pago o usá cuenta corriente del cliente."
  }
  if (
    input.payOnClientAccount &&
    !partyCanOperateOnCurrentAccount(input.party)
  ) {
    return input.party?.id
      ? "Este cliente no está dado de alta en Cuentas corrientes."
      : "Elegí un cliente del catálogo para vender a cuenta corriente."
  }
  if (!input.canCreateSale) {
    return "No tenés permiso para registrar ventas."
  }
  if (!input.canReadCashRegisters) {
    return "Se requiere permiso para ver cajas y asociar la venta a una sesión."
  }
  if (!input.cashOpen) {
    return "Abrí una sesión de caja en Cajas antes de vender."
  }
  return undefined
}

export function buildSaleCheckoutModel(input: {
  hasItems: boolean
  total: number
  subtotal: number
  discountAmount: number
  paymentReady: boolean
  payOnClientAccount: boolean
  paymentKind?: string | null
  party: SaleCheckoutParty
  partyTaxId?: string | null
  comprobanteLabel: string | null | undefined
  comprobanteDisplayLabel: string
  canReadClients: boolean
  canCreateSale: boolean
  canReadCashRegisters: boolean
  cashOpen: boolean
  submitting: boolean
  clienteLabel: string
  clienteIvaLabel: string | null
  pagoLabel: string
  pagoSubLabel: string | null
  pagoIcon?: LucideIcon
  onOpenClient: () => void
  onOpenComprobante: () => void
  onOpenPago: () => void
  onDiscard: () => void
  onConfirm: () => void
}): SaleCheckoutModel {
  const risk = resolveSaleCheckoutRisk({
    payOnClientAccount: input.payOnClientAccount,
    paymentKind: input.paymentKind,
    discountAmount: input.discountAmount,
    subtotal: input.subtotal,
    comprobanteLabel: input.comprobanteLabel,
    partyTaxId: input.partyTaxId,
  })
  const confirmTitle = resolveSaleCheckoutConfirmTitle({
    hasItems: input.hasItems,
    paymentReady: input.paymentReady,
    payOnClientAccount: input.payOnClientAccount,
    party: input.party,
    canCreateSale: input.canCreateSale,
    canReadCashRegisters: input.canReadCashRegisters,
    cashOpen: input.cashOpen,
  })
  const canCommit = confirmTitle == null && !input.submitting
  const toolbox: SaleCheckoutToolboxModel = {
    clienteLabel: input.clienteLabel,
    clienteIvaLabel: input.cashOpen ? input.clienteIvaLabel : null,
    clienteDisabled: !input.canReadClients || !input.cashOpen,
    clienteConfigurado: Boolean(input.party) && input.cashOpen,
    toolbarDisabled: !input.cashOpen,
    comprobanteLabel: input.comprobanteDisplayLabel,
    comprobanteConfigurado:
      input.comprobanteDisplayLabel !== "Sin comprobante" && input.cashOpen,
    pagoLabel: input.pagoLabel,
    pagoSubLabel: input.cashOpen ? input.pagoSubLabel : null,
    pagoIcon: input.cashOpen ? input.pagoIcon : undefined,
    pagoConfigurado: input.paymentReady && input.cashOpen,
    pagoDisabled: !input.cashOpen,
    onClienteClick: input.onOpenClient,
    onComprobanteClick: input.onOpenComprobante,
    onPagoClick: input.onOpenPago,
  }

  return {
    risk,
    canCommit,
    toolbox,
    actions: {
      discardDisabled: !input.hasItems || !input.cashOpen,
      discardTitle: input.cashOpen ? undefined : "Requiere caja abierta",
      confirmDisabled: !canCommit,
      confirmLoading: input.submitting,
      confirmLabel: input.hasItems
        ? `Vender ${formatSaleCheckoutMoney(input.total)}`
        : "Vender",
      confirmTitle,
      onDiscard: input.onDiscard,
      onConfirm: input.onConfirm,
    },
  }
}
