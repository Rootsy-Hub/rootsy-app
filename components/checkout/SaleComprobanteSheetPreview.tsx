"use client"

import {
  formatSaleComprobanteActivityDate,
  formatSaleComprobanteCuit,
  formatSaleComprobanteSheetAmount,
  formatSaleComprobanteSheetDate,
  formatSaleComprobanteTicketTime,
  type BuildSaleComprobantePreviewInput,
  type SaleComprobantePreviewLine,
  type SaleComprobantePreviewModel,
} from "@/lib/saleComprobantePreview"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { useSaleComprobantePreviewModel } from "@/hooks/useSaleComprobantePreviewModel"
import { SALE_COMPROBANTE_SIN_LABEL } from "@/lib/saleComprobantePicker"
import { saleComprobantePrintSurfaceClass } from "@/lib/saleComprobantePrint"
import { cn } from "@/lib/utils"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { QrCode, Receipt } from "lucide-react"
import type { ReactNode } from "react"

type Props = {
  previewInput: Omit<BuildSaleComprobantePreviewInput, "emitter" | "issuedAt"> | null
  emitter: BuildSaleComprobantePreviewInput["emitter"]
  previewComprobanteLabel?: string | null
  issuedAt?: Date
  loading?: boolean
  error?: string | null
  className?: string
}

const sheetPaperClass = cn(
  saleComprobantePrintSurfaceClass,
  "mx-auto w-full max-w-[36rem] bg-white px-7 py-7 font-canopy text-[var(--rootsy-bruma-900)] shadow-sm ring-1 ring-[var(--rootsy-bruma-200)]",
)

const metaLabelClass =
  "text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]"

const metaValueClass = "text-xs leading-snug text-[var(--rootsy-bruma-900)]"

function SheetPlaceholder({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className={cn(sheetPaperClass, "flex min-h-[22rem] flex-col items-center justify-center gap-3 px-8 text-center")}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-400)]">
        <Receipt className="h-6 w-6" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">{title}</p>
      <p className="max-w-sm text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">
        {description}
      </p>
    </div>
  )
}

function SheetAmountRow({
  label,
  amount,
  emphasis = false,
}: {
  label: string
  amount: string
  emphasis?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-6",
        emphasis
          ? "text-sm font-semibold text-[var(--rootsy-bruma-900)]"
          : "text-xs text-[var(--rootsy-bruma-700)]",
      )}
    >
      <span>{label}</span>
      <span className="tabular-nums">{amount}</span>
    </div>
  )
}

function SheetLineDiscount({
  label,
  amount,
}: {
  label: string
  amount: number
}) {
  return (
    <p className="text-[10px] leading-snug text-[var(--rootsy-bruma-500)]">
      {label} −{formatSaleComprobanteSheetAmount(amount)}
    </p>
  )
}

function SheetLineCells({
  line,
  showVatRate,
}: {
  line: SaleComprobantePreviewLine
  showVatRate: boolean
}) {
  return (
    <>
      <td className="py-2 align-top tabular-nums text-[var(--rootsy-bruma-700)]">
        {line.quantity}
      </td>
      <td className="py-2 align-top">
        <p className="leading-snug text-[var(--rootsy-bruma-900)]">
          {line.description}
        </p>
        <p className="mt-0.5 text-[10px] tabular-nums text-[var(--rootsy-bruma-500)]">
          {line.quantity} × {formatSaleComprobanteSheetAmount(line.unitListPrice)}
        </p>
        {line.discounts.map((discount, index) => (
          <SheetLineDiscount
            key={`${discount.label}-${index}`}
            label={discount.label}
            amount={discount.amount}
          />
        ))}
        {line.barcode ? (
          <p className="mt-0.5 text-[10px] tabular-nums text-[var(--rootsy-bruma-400)]">
            {line.barcode}
          </p>
        ) : null}
      </td>
      {showVatRate ? (
        <td className="py-2 align-top tabular-nums text-[var(--rootsy-bruma-500)]">
          {line.vatRate.toFixed(2)}%
        </td>
      ) : null}
      <td className="py-2 align-top text-right tabular-nums text-[var(--rootsy-bruma-900)]">
        {formatSaleComprobanteSheetAmount(line.listLineTotal)}
      </td>
    </>
  )
}

function SheetPreviewBody({ model }: { model: SaleComprobantePreviewModel }) {
  const timeZone = usePopTimeZone()
  const issuedDate = formatSaleComprobanteSheetDate(model.issuedAt, timeZone)
  const issuedTime = formatSaleComprobanteTicketTime(model.issuedAt, timeZone)
  const columnCount = model.showsLineVatRate ? 4 : 3

  return (
    <div className={sheetPaperClass}>
      {model.kind === "arca" ? (
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold leading-snug">
              {model.emitter.tradeName}
            </p>
            <p className="text-xs leading-snug text-[var(--rootsy-bruma-700)]">
              {model.emitter.razonSocial}
            </p>
            {model.emitter.address ? (
              <p className="text-xs leading-snug text-[var(--rootsy-bruma-500)]">
                {model.emitter.address}
              </p>
            ) : null}
            <div className="pt-1 text-[11px] leading-relaxed text-[var(--rootsy-bruma-700)]">
              <p>CUIT {formatSaleComprobanteCuit(model.emitter.cuit)}</p>
              <p>IIBB {model.emitter.ingresosBrutos?.trim() || "—"}</p>
              <p>
                Inicio de actividades{" "}
                {formatSaleComprobanteActivityDate(model.emitter.inicioActividades)}
              </p>
              {model.emitter.phone ? <p>{model.emitter.phone}</p> : null}
              <p className="font-medium">{model.emitter.ivaConditionLabel}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2 text-right">
            {model.invoiceVariant ? (
              <div className="flex size-14 flex-col items-center justify-center border border-[var(--rootsy-bruma-900)]">
                <span className="font-canopy text-2xl font-semibold leading-none">
                  {model.invoiceVariant}
                </span>
                {model.cbteCodigo ? (
                  <span className="mt-0.5 text-[8px] font-medium uppercase tracking-wide text-[var(--rootsy-bruma-500)]">
                    Cod. {model.cbteCodigo}
                  </span>
                ) : null}
              </div>
            ) : null}
            <div>
              <p className="text-sm font-semibold uppercase tracking-[-0.02em]">
                {model.title}
              </p>
              {model.receptorSubtitle ? (
                <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--rootsy-bruma-500)]">
                  {model.receptorSubtitle}
                </p>
              ) : null}
            </div>
            <div className="space-y-0.5 text-xs text-[var(--rootsy-bruma-700)]">
              <p>Punto de venta {model.ptoVta}</p>
              <p>N.º {model.cbteNro}</p>
              <p>
                {issuedDate} · {issuedTime}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[-0.02em]">
            {model.title}
          </p>
          <p className="mt-0.5 text-xs text-[var(--rootsy-bruma-700)]">
            {issuedDate} · {issuedTime}
          </p>
          {model.internalDisclaimer ? (
            <p className="mt-3 border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-3 py-2 text-left text-[11px] leading-relaxed text-[var(--rootsy-bruma-600)]">
              {model.internalDisclaimer}
            </p>
          ) : null}
        </div>
      )}

      {model.customerName !== "Consumidor final" || model.customerTaxId ? (
        <div className="mt-5 grid gap-3 border-y border-[var(--rootsy-bruma-200)] py-3 sm:grid-cols-3">
          <div>
            <p className={metaLabelClass}>Cliente</p>
            <p className={metaValueClass}>{model.customerName}</p>
          </div>
          {model.customerTaxId ? (
            <div>
              <p className={metaLabelClass}>Documento</p>
              <p className={metaValueClass}>{model.customerTaxId}</p>
            </div>
          ) : null}
          {model.kind !== "internal" && model.customerIvaLabel ? (
            <div>
              <p className={metaLabelClass}>Cond. IVA</p>
              <p className={metaValueClass}>{model.customerIvaLabel}</p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 border-t border-[var(--rootsy-bruma-200)]" />
      )}

      <table className="mt-4 w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-[var(--rootsy-bruma-200)] text-left">
            <th className={cn(metaLabelClass, "w-12 pb-2 font-medium")}>Cant.</th>
            <th className={cn(metaLabelClass, "pb-2 font-medium")}>Descripción</th>
            {model.showsLineVatRate ? (
              <th className={cn(metaLabelClass, "w-14 pb-2 font-medium")}>IVA</th>
            ) : null}
            <th className={cn(metaLabelClass, "w-24 pb-2 text-right font-medium")}>
              Importe
            </th>
          </tr>
        </thead>
        <tbody>
          {model.lineGroups.length === 0 ? (
            <tr>
              <td
                colSpan={columnCount}
                className="py-6 text-center text-[var(--rootsy-bruma-500)]"
              >
                Sin ítems en el pedido
              </td>
            </tr>
          ) : (
            model.lineGroups.map((group) => (
              <FragmentGroup
                key={group.id}
                category={group.category}
                columnCount={columnCount}
              >
                {group.lines.map((line, index) => (
                  <tr
                    key={`${group.id}-${line.description}-${index}`}
                    className="border-b border-[var(--rootsy-bruma-100)]"
                  >
                    <SheetLineCells
                      line={line}
                      showVatRate={model.showsLineVatRate}
                    />
                  </tr>
                ))}
                {group.promotionDiscount ? (
                  <tr className="border-b border-[var(--rootsy-bruma-100)]">
                    <td />
                    <td
                      colSpan={model.showsLineVatRate ? 2 : 1}
                      className="py-2 text-[var(--rootsy-bruma-500)]"
                    >
                      {group.promotionDiscount.label}
                    </td>
                    <td className="py-2 text-right tabular-nums text-[var(--rootsy-bruma-500)]">
                      −{formatSaleComprobanteSheetAmount(group.promotionDiscount.amount)}
                    </td>
                  </tr>
                ) : null}
              </FragmentGroup>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-5 ml-auto w-full max-w-[16rem] space-y-1.5">
        <SheetAmountRow
          label="Subtotal sin descuentos"
          amount={formatSaleComprobanteSheetAmount(model.subtotalSinDescuentos)}
        />

        {model.discountLines.length > 0 ? (
          <>
            <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]">
              Descuentos
            </p>
            {model.discountLines.map((discount, index) => (
              <SheetAmountRow
                key={`${discount.label}-${index}`}
                label={discount.label}
                amount={`−${formatSaleComprobanteSheetAmount(discount.amount)}`}
              />
            ))}
            <SheetAmountRow
              label="Ahorro"
              amount={formatSaleComprobanteSheetAmount(model.savings)}
            />
          </>
        ) : null}

        {model.showsVatDiscrimination && model.vatRows.length > 0
          ? model.vatRows.map((row, index) => (
              <div key={`${row.label}-${index}`} className="space-y-1.5">
                <SheetAmountRow
                  label="Neto gravado"
                  amount={formatSaleComprobanteSheetAmount(row.net)}
                />
                <SheetAmountRow
                  label={row.label}
                  amount={formatSaleComprobanteSheetAmount(row.vat)}
                />
              </div>
            ))
          : null}

        <div className="border-t border-[var(--rootsy-bruma-200)] pt-2">
          <SheetAmountRow
            label="Total"
            amount={formatSaleComprobanteSheetAmount(model.total)}
            emphasis
          />
        </div>
      </div>

      {model.total > 0 && model.showsLey27743 ? (
        <div className="mt-5 space-y-1 text-[10px] leading-relaxed text-[var(--rootsy-bruma-500)]">
          <p className="uppercase tracking-[0.04em]">
            Régimen de transparencia fiscal al consumidor · Ley 27.743
          </p>
          <SheetAmountRow
            label="IVA contenido"
            amount={formatSaleComprobanteSheetAmount(model.ivaContenido)}
          />
          <SheetAmountRow
            label="Otros impuestos nacionales indirectos"
            amount={formatSaleComprobanteSheetAmount(0)}
          />
          <p>Los impuestos informados son a nivel nacional.</p>
        </div>
      ) : null}

      {model.paymentMethodLabel ? (
        <div className="mt-5 space-y-1.5 border-t border-[var(--rootsy-bruma-200)] pt-3">
          <SheetAmountRow
            label={`Pago ${model.paymentMethodLabel}`}
            amount={formatSaleComprobanteSheetAmount(model.total)}
            emphasis
          />
          <SheetAmountRow
            label="Suma de sus pagos"
            amount={formatSaleComprobanteSheetAmount(model.total)}
          />
        </div>
      ) : null}

      {model.showsFiscalFooter ? (
        <div className="mt-6 flex items-end justify-between gap-4 border-t border-[var(--rootsy-bruma-200)] pt-4">
          <div className="space-y-1 text-xs text-[var(--rootsy-bruma-700)]">
            <p>
              <span className="font-medium">CAE N.º</span> (por generar)
            </p>
            <p>
              <span className="font-medium">Vto. CAE</span> —
            </p>
            <p className="pt-2 text-[10px] leading-relaxed text-[var(--rootsy-bruma-500)]">
              Comprobante autorizado por ARCA / AFIP. Consulte validez en
              arca.gob.ar o afip.gob.ar.
            </p>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex size-16 items-center justify-center border border-dashed border-[var(--rootsy-bruma-300)] bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-400)]">
              <QrCode className="size-8 opacity-70" aria-hidden />
            </div>
            <p className="text-[9px] text-[var(--rootsy-bruma-500)]">
              QR ARCA — por generar
            </p>
          </div>
        </div>
      ) : null}

      {model.footerNote ? (
        <p className="mt-5 text-center text-[10px] leading-relaxed text-[var(--rootsy-bruma-500)]">
          {model.footerNote}
        </p>
      ) : null}
    </div>
  )
}

function FragmentGroup({
  category,
  columnCount,
  children,
}: {
  category: string
  columnCount: number
  children: ReactNode
}) {
  return (
    <>
      <tr>
        <td
          colSpan={columnCount}
          className="pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]"
        >
          {category}
        </td>
      </tr>
      {children}
    </>
  )
}

export function SaleComprobanteSheetPreview({
  previewInput,
  emitter,
  previewComprobanteLabel,
  issuedAt,
  loading = false,
  error = null,
  className,
}: Props) {
  const { model, isSinComprobante, missingFiscalCuit } =
    useSaleComprobantePreviewModel({
      previewInput,
      emitter,
      previewComprobanteLabel,
      issuedAt,
    })

  const content =
    loading && !isSinComprobante ? (
      <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-3 py-8">
        <RootsSpinner size="default" label="Cargando datos fiscales" />
        <span className="text-sm text-[var(--rootsy-bruma-500)]">
          Cargando datos fiscales…
        </span>
      </div>
    ) : error && !isSinComprobante ? (
      <div className="flex min-h-[280px] w-full items-center justify-center px-4 text-center text-sm text-[var(--rootsy-bruma-500)]">
        {error}
      </div>
    ) : isSinComprobante ? (
      <SheetPlaceholder
        title={SALE_COMPROBANTE_SIN_LABEL}
        description="No se emitirá comprobante fiscal para esta operación."
      />
    ) : missingFiscalCuit ? (
      <SheetPlaceholder
        title="CUIT no configurado"
        description="Configurá un CUIT válido del punto de venta en Ajustes para emitir comprobantes fiscales."
      />
    ) : model ? (
      <SheetPreviewBody model={model} />
    ) : (
      <div className="flex min-h-[280px] w-full items-center justify-center px-4 text-center text-sm text-[var(--rootsy-bruma-500)]">
        Configurá los datos fiscales del local para ver la vista previa.
      </div>
    )

  return (
    <div className={cn("flex min-h-0 flex-1 items-start justify-center", className)}>
      {content}
    </div>
  )
}
