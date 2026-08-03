"use client"

import type { MesasSaleCheckout } from "@/app/[siteId]/[popId]/mesas/useMesasSaleCheckout"
import { GeneralDiscountDialog } from "@/components/checkout/GeneralDiscountDialog"
import { OperationPartyPickerDialog } from "@/components/checkout/OperationPartyPickerDialog"
import { SaleComprobantePickerDialog } from "@/components/checkout/SaleComprobantePickerDialog"
import type { SaleComprobantePreviewInput } from "@/components/checkout/SaleComprobanteTicketPreview"
import { SalePaymentMethodDialog } from "@/components/sale-operation/SalePaymentMethodDialog"
import { SaleOperationCheckoutConfirmDialog } from "@/components/sale-operation/SaleOperationCheckoutConfirmDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getSaleComprobanteDisplayLabel, hasConfiguredSaleComprobante } from "@/lib/saleComprobantePicker"
import { saleOpAlertDialogContent } from "@/components/sale-operation/saleOperationStyles"
import { CLIENT_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import { useMemo } from "react"

type Props = {
  checkout: Pick<MesasSaleCheckout, "modals" | "submitting">
  confirmLabel?: string
  contextLabel?: "mesa" | "pedido"
}

export function MesasCheckoutModals({
  checkout,
  confirmLabel = "Cobrar mesa",
  contextLabel = "mesa",
}: Props) {
  const m = checkout.modals

  const confirmClientLabel =
    m.clienteSeleccionado?.name?.trim() ||
    m.manualNombreCliente.trim() ||
    m.ventaPadron.razonSocial.trim() ||
    "Sin cliente"

  const confirmComprobanteLabel = getSaleComprobanteDisplayLabel(m.comprobante)
  const confirmHasComprobante = hasConfiguredSaleComprobante(m.comprobante)
  const confirmPaymentLabel = m.payOnClientAccount
    ? m.payOnClientAccountLabel
    : m.metodoPagoSeleccionado?.label ?? "Sin forma de pago"

  const comprobantePreviewInput = useMemo((): SaleComprobantePreviewInput | null => {
    if (!m.popId) return null
    return {
      popId: m.popId,
      siteId: m.invoiceTypeSiteId,
      comprobanteLabel: m.comprobante,
      cartDisplayRows: m.cartDisplayRows,
      cartLineOverrides: {
        itemDescuentoModo: m.cartLineOverrides.itemDescuentoModo,
        itemDescuentoDraft: m.cartLineOverrides.itemDescuentoDraft,
        itemDescuentoSuprimido: m.cartLineOverrides.itemDescuentoSuprimido,
        itemComentarios: m.cartLineOverrides.itemComentarios,
      },
      subtotal: m.subtotal,
      discountAmount: m.descuentoMonto,
      total: m.checkoutTotal,
      customerName: confirmClientLabel,
      customerTaxId:
        m.clienteSeleccionado?.taxId?.trim() ||
        m.fiscalDocVenta.trim() ||
        null,
      customerIvaLabel: m.labelCondicionIva(
        m.clienteSeleccionado?.ivaCondition ?? m.ventaIvaCondition,
      ),
      paymentMethodLabel: confirmPaymentLabel,
    }
  }, [
    m.popId,
    m.invoiceTypeSiteId,
    m.comprobante,
    m.cartDisplayRows,
    m.cartLineOverrides,
    m.subtotal,
    m.descuentoMonto,
    m.checkoutTotal,
    confirmClientLabel,
    m.clienteSeleccionado?.taxId,
    m.clienteSeleccionado?.ivaCondition,
    m.fiscalDocVenta,
    m.ventaIvaCondition,
    m.labelCondicionIva,
    confirmPaymentLabel,
  ])

  return (
    <>
      <OperationPartyPickerDialog
        popId={m.popId}
        flow="sale"
        context={contextLabel}
        open={m.clienteModalAbierto}
        onOpenChange={m.setClienteModalAbierto}
        canSearchCatalog={m.canReadClients}
        manualName={m.manualNombreCliente}
        onManualNameChange={m.setManualNombreCliente}
        taxId={m.fiscalDocVenta}
        onTaxIdChange={m.setFiscalDocVenta}
        ivaCondition={m.ventaIvaCondition}
        onIvaConditionChange={m.setVentaIvaCondition}
        selected={m.clienteSeleccionado}
        padron={m.ventaPadron}
        catalogBlocked={m.clienteCatalogoBloqueado}
        onSelectCatalogParty={(party) =>
          m.seleccionarCliente({
            id: party.id,
            name: party.name,
            taxId: party.taxId ?? null,
            ivaCondition: party.ivaCondition ?? null,
            defaultInvoiceTypeLabel: party.defaultInvoiceTypeLabel ?? null,
          })
        }
        onSelectManual={m.seleccionarClienteManual}
        onClearSelection={m.quitarCliente}
        onIvaConditionApplied={m.aplicarComprobanteDesdeIva}
      />

      <SaleComprobantePickerDialog
        open={m.comprobanteModalAbierto}
        onOpenChange={m.setComprobanteModalAbierto}
        context={contextLabel}
        options={m.comprobantePickerOptions}
        value={m.comprobante}
        onSelect={m.elegirComprobante}
        previewInput={comprobantePreviewInput}
        cashRegisterId={m.openCashSession?.cashRegisterId ?? null}
      />

      <SalePaymentMethodDialog
        open={m.pagoModalAbierto}
        onOpenChange={m.setPagoModalAbierto}
        treasuryContext={m.treasuryPaymentContext}
        cashTreasuryAccountId={m.openCashSession?.cashTreasuryAccountId ?? null}
        cashRegisterName={m.openCashSession?.registerName ?? null}
        selected={m.metodoPagoSeleccionado}
        payOnClientAccount={m.payOnClientAccount}
        onSelectImmediate={(option) => {
          m.setPayOnClientAccount(false)
          m.setMetodoPagoSeleccionado(option)
        }}
        onSelectClientAccount={() => {
          m.setPayOnClientAccount(true)
          m.setMetodoPagoSeleccionado(null)
        }}
        clientAccountDescription="Registrá la deuda en Cuentas por cobrar para esta operación."
      />

      <GeneralDiscountDialog
        open={m.descuentoModalAbierto}
        onOpenChange={m.setDescuentoModalAbierto}
        context={contextLabel}
        subtotal={m.subtotal}
        draftMode={m.descuentoDraftModo}
        onDraftModeChange={m.setDescuentoDraftModo}
        draftText={m.descuentoDraftTexto}
        onDraftTextChange={m.setDescuentoDraftTexto}
        onApply={m.aplicarDescuentoModal}
        onClear={m.quitarDescuento}
        disabled={m.descuentoGeneralEditBlocked}
        disabledReason={
          m.descuentoGeneralEditBlocked
            ? "No podés modificar el descuento general porque ya hay cobros parciales registrados."
            : undefined
        }
      />

      <AlertDialog open={m.descartarConfirmOpen} onOpenChange={m.setDescartarConfirmOpen}>
        <AlertDialogContent className={saleOpAlertDialogContent}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar el pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitarán los productos y la configuración de cliente, comprobante y pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={m.descartarPedido}
              className="bg-rose-600 hover:bg-rose-500"
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SaleOperationCheckoutConfirmDialog
        open={m.confirmOpen}
        onOpenChange={m.setConfirmOpen}
        contextLabel={contextLabel}
        confirmLabel={confirmLabel}
        submitting={checkout.submitting}
        submitError={m.submitError}
        clientLabel={confirmClientLabel}
        comprobanteLabel={confirmComprobanteLabel}
        paymentLabel={confirmPaymentLabel}
        hasComprobante={confirmHasComprobante}
        imprimirComprobante={m.imprimirComprobante}
        onImprimirComprobanteChange={m.setImprimirComprobante}
        total={m.total}
        subtotal={m.confirmSubtotal}
        descuentoMonto={m.confirmDescuentoMonto}
        hayDescuento={m.confirmHayDescuento}
        partialPayment={m.partialPayment}
        onPartialPaymentChange={m.setPartialPayment}
        closeOnComplete={m.closeOnComplete}
        onCloseOnCompleteChange={m.setCloseOnComplete}
        partialUnits={m.partialPaymentUnits}
        partialSelection={m.partialSelection}
        onPartialSelectionChange={m.setPartialSelection}
        onConfirm={m.confirmarMesa}
      />
    </>
  )
}
