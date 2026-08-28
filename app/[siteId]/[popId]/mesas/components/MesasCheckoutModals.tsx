"use client"

import type { MesasSaleCheckout } from "@/app/[siteId]/[popId]/mesas/useMesasSaleCheckout"
import { GeneralDiscountDialog } from "@/components/checkout/GeneralDiscountDialog"
import { OperationPartyPickerDialog } from "@/components/checkout/OperationPartyPickerDialog"
import { SaleComprobantePickerDialog } from "@/components/checkout/SaleComprobantePickerDialog"
import type { SaleComprobantePreviewInput } from "@/components/checkout/SaleComprobanteTicketPreview"
import { SaleFinalizeDialog } from "@/components/checkout/SaleFinalizeDialog"
import { SalePaymentMethodDialog } from "@/components/sale-operation/SalePaymentMethodDialog"
import { ComandaSendDialog } from "@/components/sale-operation/ComandaSendDialog"
import { RootsConfirmDialog } from "@/components/rootsy-dialog/RootsConfirmDialog"
import { partyCanOperateOnCurrentAccount } from "@/lib/currentAccounts"
import { getSaleComprobanteDisplayLabel, hasConfiguredSaleComprobante } from "@/lib/saleComprobantePicker"
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

  const closeOnCompleteLabel =
    contextLabel === "mesa" ? "Liberar mesa al cobrar" : "Cerrar pedido al cobrar"

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
        canCreateClient={m.canCreateClient}
        manualName={m.manualNombreCliente}
        onManualNameChange={m.setManualNombreCliente}
        taxId={m.fiscalDocVenta}
        onTaxIdChange={m.setFiscalDocVenta}
        email={m.ventaEmail}
        onEmailChange={m.setVentaEmail}
        ivaCondition={m.ventaIvaCondition}
        onIvaConditionChange={m.setVentaIvaCondition}
        selected={m.clienteSeleccionado}
        catalogBlocked={m.clienteCatalogoBloqueado}
        onSelectCatalogParty={(party) =>
          m.seleccionarCliente({
            id: party.id,
            name: party.name,
            taxId: party.taxId ?? null,
            ivaCondition: party.ivaCondition ?? null,
            defaultInvoiceTypeLabel: party.defaultInvoiceTypeLabel ?? null,
            currentAccountEnabled: party.currentAccountEnabled === true,
          })
        }
        onConfirmManual={m.confirmarClienteManual}
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
        emitter={m.comprobanteEmitter}
      />

      <SalePaymentMethodDialog
        open={m.pagoModalAbierto}
        onOpenChange={m.setPagoModalAbierto}
        treasuryContext={m.treasuryPaymentContext}
        cashTreasuryAccountId={m.openCashSession?.cashTreasuryAccountId ?? null}
        cashRegisterName={m.openCashSession?.registerName ?? null}
        selected={m.metodoPagoSeleccionado}
        payOnClientAccount={m.payOnClientAccount}
        popId={m.popId}
        defaultPartyName={m.clienteSeleccionado?.name ?? ""}
        defaultPartyId={
          m.clienteSeleccionado && !m.clienteSeleccionado.manual
            ? m.clienteSeleccionado.id ?? ""
            : ""
        }
        onSelectImmediate={(option) => {
          m.setPayOnClientAccount(false)
          m.setMetodoPagoSeleccionado(option)
        }}
        onSelectClientAccount={() => {
          m.setPayOnClientAccount(true)
          m.setMetodoPagoSeleccionado(null)
        }}
        clientAccountDescription="Registrá la deuda en Cuentas por cobrar para esta operación."
        hideAccountOption={!partyCanOperateOnCurrentAccount(m.clienteSeleccionado)}
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

      <ComandaSendDialog
        open={m.comandasOpen}
        onOpenChange={m.setComandasOpen}
        contextLabel={contextLabel}
        items={m.pendingComandaItems}
        loading={m.comandasLoading}
        submitting={m.comandasSubmitting}
        submitError={m.comandasError}
        onConfirm={m.enviarComandas}
      />

      <RootsConfirmDialog
        open={m.descartarConfirmOpen}
        onOpenChange={m.setDescartarConfirmOpen}
        title="¿Descartar el pedido?"
        description="Se quitarán los productos y la configuración de cliente, comprobante y pago."
        confirmLabel="Descartar"
        destructive
        onConfirm={m.descartarPedido}
      />

      <SaleFinalizeDialog
        open={m.confirmOpen}
        onOpenChange={m.setConfirmOpen}
        title={`Confirmar cobro de ${contextLabel}`}
        confirmLabel={confirmLabel}
        submitting={checkout.submitting}
        submitError={m.submitError}
        total={m.total}
        subtotal={m.confirmSubtotal}
        descuentoMonto={m.confirmDescuentoMonto}
        hayDescuento={m.confirmHayDescuento}
        partyValue={confirmClientLabel}
        comprobanteLabel={confirmComprobanteLabel}
        paymentLabel={confirmPaymentLabel}
        channelCheckout={{
          closeOnCompleteLabel,
          partialPayment: m.partialPayment,
          onPartialPaymentChange: m.setPartialPayment,
          closeOnComplete: m.closeOnComplete,
          onCloseOnCompleteChange: m.setCloseOnComplete,
          imprimirComprobante: m.imprimirComprobante,
          onImprimirComprobanteChange: m.setImprimirComprobante,
          hasComprobante: confirmHasComprobante,
          partialUnits: m.partialPaymentUnits,
          partialSelection: m.partialSelection,
          onPartialSelectionChange: m.setPartialSelection,
        }}
        onConfirm={() =>
          void m.confirmarMesa({
            partialPayment: m.partialPayment,
            partialSelection: m.partialSelection,
            closeOnComplete: m.partialPayment ? false : m.closeOnComplete,
            imprimirComprobante: confirmHasComprobante && m.imprimirComprobante,
          })
        }
      />
    </>
  )
}
