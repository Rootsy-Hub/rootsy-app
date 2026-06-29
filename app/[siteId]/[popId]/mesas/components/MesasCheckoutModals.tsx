"use client"

import type { MesasSaleCheckout } from "@/app/[siteId]/[popId]/mesas/useMesasSaleCheckout"
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
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  saleOpAlertDialogContent,
  saleOpDialogBody,
  saleOpDialogContentMd,
  saleOpDialogFooter,
  saleOpDialogGhostBtn,
  saleOpDialogHeader,
  saleOpDialogOptionClass,
  saleOpDialogPrimaryBtn,
  saleOpFmt,
  saleOpImporteBaseClass,
  saleOpImporteTotalClass,
} from "@/components/sale-operation/saleOperationStyles"
import { CLIENT_IVA_CONDITION_OPTIONS, type ClientIvaConditionValue } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { cn } from "@/lib/utils"
import { Banknote, Loader2, Percent, Search } from "lucide-react"

type Props = {
  checkout: MesasSaleCheckout
}

export function MesasCheckoutModals({ checkout }: Props) {
  const m = checkout.modals

  return (
    <>
      <Dialog open={m.clienteModalAbierto} onOpenChange={m.setClienteModalAbierto}>
        <DialogContent className={saleOpDialogContentMd}>
          <DialogHeader className={saleOpDialogHeader}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Cliente para esta mesa
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Buscá en el catálogo o cargá los datos manualmente para esta operación.
            </DialogDescription>
          </DialogHeader>
          <div className={saleOpDialogBody}>
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={m.busquedaClienteModal}
                onChange={(e) => m.setBusquedaClienteModal(e.target.value)}
                placeholder="Nombre del cliente…"
                className="h-11 rounded-lg pl-9"
                autoComplete="off"
              />
            </div>
            <Input
              value={m.manualNombreCliente}
              onChange={(e) => m.setManualNombreCliente(e.target.value)}
              placeholder="Nombre o razón social"
              className="mb-2 h-10 rounded-lg"
              disabled={m.clienteSeleccionado != null}
            />
            <Input
              value={m.fiscalDocVenta}
              onChange={(e) => m.setFiscalDocVenta(e.target.value)}
              placeholder="CUIT / DNI"
              className="h-10 rounded-lg"
              disabled={m.clienteSeleccionado != null}
            />
            <Select
              value={m.ventaIvaCondition || "__none__"}
              disabled={m.clienteSeleccionado != null}
              onValueChange={(v) => {
                const next = v === "__none__" ? "" : v
                m.setVentaIvaCondition(next)
                if (next) m.aplicarComprobanteDesdeIva(next as ClientIvaConditionValue)
              }}
            >
              <SelectTrigger className="mt-3 h-10 rounded-lg bg-background">
                <SelectValue placeholder="Condición IVA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin definir</SelectItem>
                {CLIENT_IVA_CONDITION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ul className="game-scroll mt-3 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border/40 bg-muted/20 p-2">
              {m.clientesFiltradosModal.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Escribí en el buscador para ver clientes.
                </li>
              ) : (
                m.clientesFiltradosModal.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={saleOpDialogOptionClass(
                        m.clienteSeleccionado?.id === c.id,
                      )}
                      onClick={() => m.seleccionarCliente(c)}
                    >
                      <span className="text-sm font-semibold">{c.name}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
          <DialogFooter className={saleOpDialogFooter}>
            {m.clienteSeleccionado ? (
              <Button
                type="button"
                variant="ghost"
                className={saleOpDialogGhostBtn}
                onClick={() => {
                  m.quitarCliente()
                  m.setClienteModalAbierto(false)
                }}
              >
                Quitar cliente
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={m.comprobanteModalAbierto} onOpenChange={m.setComprobanteModalAbierto}>
        <DialogContent className={saleOpDialogContentMd}>
          <DialogHeader className={saleOpDialogHeader}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Comprobante
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Tipo de comprobante para esta operación de mesa.
            </DialogDescription>
          </DialogHeader>
          <div className={cn(saleOpDialogBody, "overflow-y-auto")}>
            <ul className="flex flex-col gap-1.5">
              {m.comprobantePickerOptions.map((opt) => {
                const seleccionado =
                  opt.kind === "none"
                    ? m.comprobante == null
                    : m.comprobante === opt.label
                return (
                  <li key={opt.label}>
                    <button
                      type="button"
                      className={saleOpDialogOptionClass(seleccionado)}
                      onClick={() =>
                        m.elegirComprobante(opt.kind === "none" ? null : opt.label)
                      }
                    >
                      <span className="text-sm font-semibold">{opt.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
          <DialogFooter className={saleOpDialogFooter}>
            <Button
              type="button"
              className={saleOpDialogPrimaryBtn}
              onClick={() => m.setComprobanteModalAbierto(false)}
            >
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={m.pagoModalAbierto} onOpenChange={m.setPagoModalAbierto}>
        <DialogContent className={saleOpDialogContentMd}>
          <DialogHeader className={saleOpDialogHeader}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Formas de pago
            </DialogTitle>
          </DialogHeader>
          <div className={cn(saleOpDialogBody, "space-y-4 overflow-y-auto")}>
            <button
              type="button"
              className={saleOpDialogOptionClass(m.payOnClientAccount)}
              onClick={() => {
                m.setPayOnClientAccount(true)
                m.setMetodoPagoSeleccionado(null)
                m.setPagoModalAbierto(false)
              }}
            >
              {m.payOnClientAccountLabel}
            </button>
            {m.paymentMethodListItems.length > 0 ? (
              <>
                <Separator />
                <ul className="flex flex-col gap-1.5">
                  {m.paymentMethodListItems.map(({ method, groupTitle }) => (
                    <li key={method.id}>
                      <button
                        type="button"
                        className={saleOpDialogOptionClass(
                          !m.payOnClientAccount &&
                            m.metodoPagoSeleccionado?.id === method.id,
                        )}
                        onClick={() => {
                          m.setPayOnClientAccount(false)
                          m.setMetodoPagoSeleccionado({
                            id: method.id,
                            label: method.name,
                          })
                          m.setPagoModalAbierto(false)
                        }}
                      >
                        <span>
                          <span className="block text-sm font-semibold">
                            {method.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {groupTitle}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={m.descuentoModalAbierto} onOpenChange={m.setDescuentoModalAbierto}>
        <DialogContent className={saleOpDialogContentMd}>
          <DialogHeader className={saleOpDialogHeader}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Descuento en la mesa
            </DialogTitle>
          </DialogHeader>
          <div className={saleOpDialogBody}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-xl border border-foreground/10 bg-muted/50"
                onClick={() =>
                  m.setDescuentoDraftModo((x) =>
                    x === "porcentaje" ? "fijo" : "porcentaje",
                  )
                }
              >
                {m.descuentoDraftModo === "porcentaje" ? (
                  <Percent className="size-4" />
                ) : (
                  <Banknote className="size-4" />
                )}
              </button>
              <Input
                value={m.descuentoDraftTexto}
                onChange={(e) => m.setDescuentoDraftTexto(e.target.value)}
                placeholder="Valor"
                inputMode="numeric"
                className="h-11 flex-1"
              />
            </div>
            {m.descuentoDraftModo === "fijo" && m.subtotal > 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Máximo:{" "}
                <span className={saleOpImporteBaseClass}>
                  {saleOpFmt.format(m.subtotal)}
                </span>
              </p>
            ) : null}
          </div>
          <DialogFooter className={saleOpDialogFooter}>
            <Button
              type="button"
              variant="ghost"
              className={saleOpDialogGhostBtn}
              onClick={m.quitarDescuento}
            >
              Quitar descuento
            </Button>
            <Button
              type="button"
              className={saleOpDialogPrimaryBtn}
              onClick={m.aplicarDescuentoModal}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              onClick={m.limpiarPedido}
              className="bg-rose-600 hover:bg-rose-500"
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={m.confirmOpen}
        onOpenChange={(open) => {
          m.setConfirmOpen(open)
        }}
      >
        <AlertDialogContent className={saleOpAlertDialogContent}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar cobro de mesa?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  Total:{" "}
                  <span className={saleOpImporteTotalClass}>
                    {saleOpFmt.format(m.total)}
                  </span>
                </p>
                <p className="text-xs">
                  La operación se registrará como venta de mesa (canal mesa en BD próximamente).
                </p>
                {m.submitError ? (
                  <p className="text-sm text-destructive">{m.submitError}</p>
                ) : null}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={checkout.submitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={checkout.submitting}
              onClick={(e) => {
                e.preventDefault()
                void m.confirmarMesa()
              }}
              className={saleOpDialogPrimaryBtn}
            >
              {checkout.submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Procesando…
                </>
              ) : (
                "Cobrar mesa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
