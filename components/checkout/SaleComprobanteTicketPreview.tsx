"use client"

import {
  buildSaleComprobantePreview,
  formatSaleComprobanteActivityDate,
  formatSaleComprobanteCuit,
  formatSaleComprobanteMoney,
  formatSaleComprobanteTicketAmount,
  formatSaleComprobanteTicketDate,
  formatSaleComprobanteTicketTime,
  type BuildSaleComprobantePreviewInput,
  type SaleComprobantePreviewLine,
  type SaleComprobantePreviewModel,
} from "@/lib/saleComprobantePreview"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { cn } from "@/lib/utils"
import { saleComprobanteTicketPaperWidthClass } from "@/components/sale-operation/saleOperationStyles"
import { Loader2, QrCode } from "lucide-react"
import { useMemo } from "react"

type Props = {
  previewInput: Omit<BuildSaleComprobantePreviewInput, "emitter" | "issuedAt"> | null
  emitter: BuildSaleComprobantePreviewInput["emitter"]
  previewComprobanteLabel?: string | null
  loading?: boolean
  error?: string | null
  className?: string
}

function TicketSeparator() {
  return (
    <div className="my-1.5 border-t border-dashed border-zinc-400/70" aria-hidden />
  )
}

function TicketMetaRow({
  left,
  right,
}: {
  left: string
  right: string
}) {
  return (
    <div className="grid grid-cols-2 gap-x-2 text-[9px] leading-tight">
      <span>{left}</span>
      <span className="text-right">{right}</span>
    </div>
  )
}

function TicketLineItem({ line }: { line: SaleComprobantePreviewLine }) {
  const vatLabel = `${line.vatRate.toFixed(2)}%`

  return (
    <div className="space-y-0.5">
      <p className="text-[9px] uppercase leading-snug">{line.description}</p>
      <div className="flex items-start justify-between gap-2 text-[9px] leading-tight">
        <span className="min-w-0 shrink">
          {line.quantity} x {formatSaleComprobanteTicketAmount(line.unitListPrice)}{" "}
          ({vatLabel})
        </span>
        <span className="shrink-0 tabular-nums">
          {formatSaleComprobanteTicketAmount(line.listLineTotal)}
        </span>
      </div>
      {line.discounts.map((discount, index) => (
        <div
          key={`${discount.label}-${index}`}
          className="flex items-start justify-between gap-2 pl-1 text-[9px] leading-tight"
        >
          <span className="min-w-0 shrink uppercase">{discount.label}</span>
          <span className="shrink-0 tabular-nums">
            -{formatSaleComprobanteTicketAmount(discount.amount)}
          </span>
        </div>
      ))}
      {line.barcode ? (
        <p className="text-[8px] tabular-nums text-zinc-600">{line.barcode}</p>
      ) : null}
    </div>
  )
}

function TicketAmountRow({
  label,
  amount,
  className,
  amountClassName,
  bold = false,
}: {
  label: string
  amount: string
  className?: string
  amountClassName?: string
  bold?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-2 text-[9px] leading-tight",
        bold && "font-bold",
        className,
      )}
    >
      <span className="min-w-0 shrink uppercase">{label}</span>
      <span className={cn("shrink-0 tabular-nums", amountClassName)}>{amount}</span>
    </div>
  )
}

function TicketPreviewBody({ model }: { model: SaleComprobantePreviewModel }) {
  const timeZone = usePopTimeZone()

  return (
    <div
      className={cn(
        "mx-auto w-full bg-white px-2.5 py-3 font-mono text-zinc-900 shadow-inner ring-1 ring-zinc-200/80",
        saleComprobanteTicketPaperWidthClass,
      )}
    >
      <div className="space-y-0.5 text-center text-[9px] leading-tight">
        <p className="text-[10px] font-bold uppercase">{model.emitter.tradeName}</p>
        {model.emitter.address ? (
          <p className="uppercase">{model.emitter.address}</p>
        ) : null}
      </div>

      <TicketSeparator />

      <div className="space-y-0.5 text-[9px] leading-tight">
        <p>
          {model.emitter.razonSocial} - CUIT Nro:{" "}
          {formatSaleComprobanteCuit(model.emitter.cuit)}
        </p>
        <p>
          IIBB: {model.emitter.ingresosBrutos?.trim() || "—"}
        </p>
        <p>
          Inicio actividad comercial:{" "}
          {formatSaleComprobanteActivityDate(model.emitter.inicioActividades)}
        </p>
        {model.emitter.phone ? <p>{model.emitter.phone}</p> : null}
        {model.kind === "arca" ? (
          <p className="font-semibold uppercase">IVA Responsable Inscripto</p>
        ) : null}
      </div>

      <TicketSeparator />

      {model.kind === "arca" ? (
        <>
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase leading-tight">
              {model.title}
            </p>
            {model.receptorSubtitle ? (
              <p className="text-[9px] font-semibold uppercase">
                {model.receptorSubtitle}
              </p>
            ) : null}
          </div>

          <div className="mt-1.5 space-y-0.5">
            <TicketMetaRow
              left={`P.V. Nro.: ${model.ptoVta}`}
              right={`Nro T. ${model.cbteNro}`}
            />
            <TicketMetaRow
              left={`Fecha ${formatSaleComprobanteTicketDate(model.issuedAt, timeZone)}`}
              right={`Hora ${formatSaleComprobanteTicketTime(model.issuedAt, timeZone)}`}
            />
          </div>

          <TicketSeparator />
        </>
      ) : (
        <>
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase">{model.title}</p>
            <p className="text-[9px]">
              {formatSaleComprobanteTicketDate(model.issuedAt, timeZone)}{" "}
              {formatSaleComprobanteTicketTime(model.issuedAt, timeZone)}
            </p>
          </div>
          <TicketSeparator />
        </>
      )}

      {model.customerName !== "Consumidor final" || model.customerTaxId ? (
        <>
          <div className="space-y-0.5 text-[9px] leading-tight">
            <p>Cliente: {model.customerName}</p>
            {model.customerTaxId ? <p>Doc.: {model.customerTaxId}</p> : null}
            {model.customerIvaLabel ? (
              <p>Cond. IVA: {model.customerIvaLabel}</p>
            ) : null}
          </div>
          <TicketSeparator />
        </>
      ) : null}

      <div className="space-y-2">
        {model.lineGroups.length === 0 ? (
          <p className="text-center text-[9px] text-zinc-500">
            Sin ítems en el pedido
          </p>
        ) : (
          model.lineGroups.map((group) => (
            <div key={group.category} className="space-y-1.5">
              <p className="text-[9px] font-bold uppercase">{group.category}</p>
              {group.lines.map((line, index) => (
                <TicketLineItem
                  key={`${group.category}-${line.description}-${index}`}
                  line={line}
                />
              ))}
              {group.promotionDiscount ? (
                <div className="flex items-start justify-between gap-2 pl-1 text-[9px] leading-tight">
                  <span className="min-w-0 shrink uppercase">
                    {group.promotionDiscount.label}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    -
                    {formatSaleComprobanteTicketAmount(
                      group.promotionDiscount.amount,
                    )}
                  </span>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <TicketSeparator />

      <div className="space-y-1 text-[9px] leading-tight">
        <TicketAmountRow
          label="Subtotal sin descuentos"
          amount={formatSaleComprobanteMoney(model.subtotalSinDescuentos)}
          bold
        />

        {model.discountLines.length > 0 ? (
          <>
            <TicketSeparator />
            <p className="font-semibold uppercase">Descuentos</p>
            <div className="space-y-0.5">
              {model.discountLines.map((discount, index) => (
                <div
                  key={`${discount.label}-${index}`}
                  className="flex items-start justify-between gap-2"
                >
                  <span className="min-w-0 shrink uppercase">{discount.label}</span>
                  <span className="shrink-0 tabular-nums">
                    -{formatSaleComprobanteTicketAmount(discount.amount)}
                  </span>
                </div>
              ))}
            </div>
            <TicketSeparator />
            <TicketAmountRow
              label="Ahorro"
              amount={formatSaleComprobanteMoney(model.savings)}
              bold
            />
          </>
        ) : null}

        <TicketSeparator />

        <div className="flex items-baseline justify-between gap-2 pt-0.5">
          <span className="text-[13px] font-bold uppercase leading-none">Total</span>
          <span className="text-[13px] font-bold tabular-nums leading-none">
            {formatSaleComprobanteMoney(model.total)}
          </span>
        </div>
      </div>

      {model.total > 0 && model.kind !== "none" ? (
        <>
          <TicketSeparator />
          <div className="space-y-0.5 text-[8px] leading-snug">
            <p className="uppercase">
              Reg. transparencia fiscal al consumidor ley 27743
            </p>
            <TicketAmountRow
              label="IVA contenido"
              amount={formatSaleComprobanteTicketAmount(model.ivaContenido)}
            />
            <TicketAmountRow
              label="Otros impuestos nacionales indirectos"
              amount={formatSaleComprobanteTicketAmount(0)}
            />
            <p className="uppercase">
              Los impuestos informados son a nivel nacional
            </p>
          </div>
        </>
      ) : null}

      {model.paymentMethodLabel ? (
        <>
          <TicketSeparator />
          <div className="space-y-0.5 text-[9px] leading-tight">
            <div className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 shrink font-bold uppercase">
                Pago {model.paymentMethodLabel}
              </span>
              <span className="shrink-0 tabular-nums">
                {formatSaleComprobanteMoney(model.total)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 shrink">Suma de sus pagos</span>
              <span className="shrink-0 tabular-nums">
                {formatSaleComprobanteTicketAmount(model.total)}
              </span>
            </div>
          </div>
        </>
      ) : null}

      {model.showsFiscalFooter ? (
        <>
          <TicketSeparator />
          <div className="space-y-0.5 text-[9px] leading-tight">
            <p>
              <span className="font-semibold">CAE Nº:</span> (por generar)
            </p>
            <p>
              <span className="font-semibold">Vto. CAE:</span> —
            </p>
          </div>
          <div className="mt-2 flex flex-col items-center gap-1 text-center">
            <div className="flex h-[80px] w-[80px] items-center justify-center border border-dashed border-zinc-400 bg-zinc-50 text-zinc-500">
              <QrCode className="h-9 w-9 opacity-60" aria-hidden />
            </div>
            <p className="text-[8px] leading-snug text-zinc-600">
              QR ARCA — por generar al autorizar
            </p>
          </div>
          <TicketSeparator />
          <div className="space-y-0.5 text-center text-[7px] leading-snug text-zinc-600">
            <p>Comprobante autorizado por ARCA / AFIP</p>
            <p>Consulte validez en www.arca.gob.ar o www.afip.gob.ar</p>
          </div>
        </>
      ) : null}

      {model.footerNote ? (
        <>
          <TicketSeparator />
          <p className="text-center text-[8px] leading-snug text-zinc-600">
            {model.footerNote}
          </p>
        </>
      ) : null}

      <div
        className="mt-2 border-t border-dotted border-zinc-300 pt-1 text-center text-[7px] text-zinc-400"
        aria-hidden
      >
        · · · · · · · · · · · · · · · · · · · ·
      </div>
    </div>
  )
}

export function SaleComprobanteTicketPreview({
  previewInput,
  emitter,
  previewComprobanteLabel,
  loading = false,
  error = null,
  className,
}: Props) {
  const model = useMemo(() => {
    if (!previewInput || !emitter) return null
    return buildSaleComprobantePreview({
      ...previewInput,
      comprobanteLabel:
        previewComprobanteLabel !== undefined
          ? previewComprobanteLabel
          : previewInput.comprobanteLabel,
      emitter,
    })
  }, [previewInput, emitter, previewComprobanteLabel])

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col rounded-xl border border-border/60 bg-zinc-100/70 p-3",
        className,
      )}
    >
      <p className="mb-2 shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Vista previa
      </p>

      <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto overscroll-contain">
        {loading ? (
          <div className="flex h-full min-h-[320px] items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Cargando datos fiscales…
          </div>
        ) : error ? (
          <div className="flex h-full min-h-[320px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
            {error}
          </div>
        ) : model ? (
          <TicketPreviewBody model={model} />
        ) : (
          <div className="flex h-full min-h-[320px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
            Configurá los datos fiscales del local para ver la vista previa.
          </div>
        )}
      </div>
    </div>
  )
}

export type SaleComprobantePreviewInput = Omit<
  BuildSaleComprobantePreviewInput,
  "emitter" | "issuedAt"
> & {
  popId: string
}
