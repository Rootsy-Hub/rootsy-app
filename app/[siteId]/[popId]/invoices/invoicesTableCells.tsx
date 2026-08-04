"use client"

import type { InvoiceArcaTableRow } from "@/app/[siteId]/[popId]/invoices/actions"
import {
  formatInvoiceCbteFch,
  invoiceJsonPretty,
  invoiceMoneyFormatter,
  invoiceRegimenLabel,
  invoiceShortId,
  invoiceStatusLabel,
  invoiceStatusPillVariant,
} from "@/app/[siteId]/[popId]/invoices/invoiceConstants"
import {
  invoiceTableCaeColumnClass,
  invoiceTableDateColumnClass,
  invoiceTableExpandColumnClass,
  invoiceTableNumberColumnClass,
  invoiceTableReceptorColumnClass,
  invoiceTableStatusColumnClass,
  invoiceTableTotalColumnClass,
  invoiceTableTypeColumnClass,
  INVOICE_TABLE_COLUMN_COUNT,
} from "@/app/[siteId]/[popId]/invoices/invoicesTableLayout"
import {
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableLayoutCellStackClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { rootsIconButtonActionClass } from "@/components/rootsy-button"
import { RootsNaturePill } from "@/components/rootsy-pill"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"
import { TableCell } from "@/components/ui/table"

const primaryClass = cn(
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableNatureTextPrimaryClass,
)

const secondaryClass = cn(
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableNatureTextSecondaryClass,
)

export function InvoiceTableExpandCell({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  return (
    <TableCell
      className={cn(
        invoiceTableExpandColumnClass,
        workspaceTableLayoutBodyCellClass,
        "px-2",
      )}
    >
      <button
        type="button"
        className={rootsIconButtonActionClass({ intent: "neutral", size: "compact" })}
        aria-expanded={open}
        aria-label={
          open ? "Ocultar detalle del comprobante" : "Ver detalle del comprobante"
        }
        onClick={onToggle}
      >
        {open ? (
          <ChevronDown className="size-4" aria-hidden />
        ) : (
          <ChevronRight className="size-4" aria-hidden />
        )}
      </button>
    </TableCell>
  )
}

export function InvoiceTableTypeCell({ row }: { row: InvoiceArcaTableRow }) {
  return (
    <TableCell
      className={cn(
        invoiceTableTypeColumnClass,
        "min-w-0",
        workspaceTableLayoutBodyCellClass,
      )}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <p className={cn(primaryClass, "truncate")} title={row.tipoLabel}>
          {row.tipoLabel}
        </p>
        <p className={cn(secondaryClass, "truncate")}>
          Cbte. {row.arcaCbteTipo}
        </p>
      </div>
    </TableCell>
  )
}

export function InvoiceTableDateCell({ row }: { row: InvoiceArcaTableRow }) {
  const label = formatInvoiceCbteFch(row.cbteFch)

  return (
    <TableCell
      className={cn(invoiceTableDateColumnClass, workspaceTableLayoutBodyCellClass)}
    >
      <p className={cn(primaryClass, "truncate tabular-nums")} title={label}>
        {label}
      </p>
    </TableCell>
  )
}

export function InvoiceTableNumberCell({ row }: { row: InvoiceArcaTableRow }) {
  const label = `${row.ptoVta} — ${row.cbteNro}`

  return (
    <TableCell
      className={cn(invoiceTableNumberColumnClass, workspaceTableLayoutBodyCellClass)}
    >
      <p className={cn(primaryClass, "truncate tabular-nums")} title={label}>
        {label}
      </p>
    </TableCell>
  )
}

export function InvoiceTableReceptorCell({ row }: { row: InvoiceArcaTableRow }) {
  const label = row.receptorRazonSocial.trim() || "—"

  return (
    <TableCell
      className={cn(
        invoiceTableReceptorColumnClass,
        "min-w-0",
        workspaceTableLayoutBodyCellClass,
      )}
    >
      <p className={cn(primaryClass, "truncate")} title={label}>
        {label}
      </p>
    </TableCell>
  )
}

export function InvoiceTableTotalCell({ row }: { row: InvoiceArcaTableRow }) {
  const label = invoiceMoneyFormatter.format(row.impTotal)

  return (
    <TableCell
      className={cn(
        invoiceTableTotalColumnClass,
        workspaceTableLayoutBodyCellClass,
        "text-right",
      )}
    >
      <p
        className={cn(workspaceTableNatureMoneyClass, "truncate")}
        title={label}
      >
        {label}
      </p>
    </TableCell>
  )
}

export function InvoiceTableCaeCell({ row }: { row: InvoiceArcaTableRow }) {
  const label = row.cae ?? "—"

  return (
    <TableCell
      className={cn(
        invoiceTableCaeColumnClass,
        "min-w-0",
        workspaceTableLayoutBodyCellClass,
      )}
    >
      <p className={cn(secondaryClass, "truncate")} title={label}>
        {label}
      </p>
    </TableCell>
  )
}

export function InvoiceTableStatusCell({ row }: { row: InvoiceArcaTableRow }) {
  const label = invoiceStatusLabel(row.status)

  return (
    <TableCell
      className={cn(invoiceTableStatusColumnClass, workspaceTableLayoutBodyCellClass)}
    >
      <RootsNaturePill variant={invoiceStatusPillVariant(row.status)} title={label}>
        {label}
      </RootsNaturePill>
    </TableCell>
  )
}

export function InvoiceTableExpandedDetailRow({
  row,
}: {
  row: InvoiceArcaTableRow
}) {
  return (
    <TableCell colSpan={INVOICE_TABLE_COLUMN_COUNT} className="p-0">
      <div className="space-y-4 border-t border-[var(--wt-border)] bg-[var(--wt-surface-stripe)] px-4 py-4 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[var(--wt-border)] bg-[var(--wt-surface)] px-3 py-2">
            <p className={cn(secondaryClass, "text-[10px] font-semibold uppercase tracking-wider")}>
              Régimen
            </p>
            <p className={cn(primaryClass, "mt-0.5 text-sm")}>
              {invoiceRegimenLabel(row.arcaRegimen)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--wt-border)] bg-[var(--wt-surface)] px-3 py-2">
            <p className={cn(secondaryClass, "text-[10px] font-semibold uppercase tracking-wider")}>
              Venta (id)
            </p>
            <p
              className={cn(primaryClass, "mt-0.5 text-sm")}
              title={row.saleId ?? undefined}
            >
              {invoiceShortId(row.saleId)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--wt-border)] bg-[var(--wt-surface)] px-3 py-2">
            <p className={cn(secondaryClass, "text-[10px] font-semibold uppercase tracking-wider")}>
              Doc. receptor
            </p>
            <p className={cn(primaryClass, "mt-0.5 text-sm tabular-nums")}>
              {row.docTipo != null ? `Tipo ${row.docTipo}` : "—"}{" "}
              {row.docNro || ""}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--wt-border)] bg-[var(--wt-surface)] px-3 py-2">
            <p className={cn(secondaryClass, "text-[10px] font-semibold uppercase tracking-wider")}>
              Moneda / cotiz.
            </p>
            <p className={cn(primaryClass, "mt-0.5 text-sm")}>
              {row.monId}{" "}
              <span className="tabular-nums">{row.monCotiz}</span>
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[var(--wt-border)] bg-[var(--wt-surface)] px-3 py-2">
            <p className={cn(secondaryClass, "text-[10px] font-semibold uppercase tracking-wider")}>
              Neto
            </p>
            <p className={cn(primaryClass, "mt-0.5 text-sm tabular-nums")}>
              {invoiceMoneyFormatter.format(row.impNeto)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--wt-border)] bg-[var(--wt-surface)] px-3 py-2">
            <p className={cn(secondaryClass, "text-[10px] font-semibold uppercase tracking-wider")}>
              IVA
            </p>
            <p className={cn(primaryClass, "mt-0.5 text-sm tabular-nums")}>
              {invoiceMoneyFormatter.format(row.impIva)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--wt-border)] bg-[var(--wt-surface)] px-3 py-2">
            <p className={cn(secondaryClass, "text-[10px] font-semibold uppercase tracking-wider")}>
              Tributos
            </p>
            <p className={cn(primaryClass, "mt-0.5 text-sm tabular-nums")}>
              {invoiceMoneyFormatter.format(row.impTrib)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--wt-border)] bg-[var(--wt-surface)] px-3 py-2">
            <p className={cn(secondaryClass, "text-[10px] font-semibold uppercase tracking-wider")}>
              Vto. CAE
            </p>
            <p className={cn(primaryClass, "mt-0.5 text-sm tabular-nums")}>
              {row.caeFchVto ? formatInvoiceCbteFch(row.caeFchVto) : "—"}
            </p>
          </div>
        </div>

        {row.arcaResultado || row.arcaObservaciones ? (
          <div className="rounded-lg border border-[var(--wt-border)] bg-[var(--wt-surface)] px-3 py-2">
            <p className={cn(secondaryClass, "mb-1 text-[10px] font-semibold uppercase tracking-wider")}>
              Resultado AFIP
            </p>
            {row.arcaResultado ? (
              <p className={cn(primaryClass, "text-sm")}>{row.arcaResultado}</p>
            ) : null}
            {row.arcaObservaciones ? (
              <p className={cn(secondaryClass, "mt-1 whitespace-pre-wrap text-sm")}>
                {row.arcaObservaciones}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-2">
          <div>
            <p className={cn(secondaryClass, "mb-1 text-xs font-semibold uppercase tracking-wider")}>
              Payload solicitud
            </p>
            <pre className="max-h-48 overflow-auto rounded-lg border border-[var(--wt-border)] bg-[var(--wt-surface)] p-3 text-[10px] leading-relaxed text-[var(--wt-text-secondary)]">
              {invoiceJsonPretty(row.payloadRequest)}
            </pre>
          </div>
          <div>
            <p className={cn(secondaryClass, "mb-1 text-xs font-semibold uppercase tracking-wider")}>
              Payload respuesta
            </p>
            <pre className="max-h-48 overflow-auto rounded-lg border border-[var(--wt-border)] bg-[var(--wt-surface)] p-3 text-[10px] leading-relaxed text-[var(--wt-text-secondary)]">
              {invoiceJsonPretty(row.payloadResponse)}
            </pre>
          </div>
        </div>
      </div>
    </TableCell>
  )
}
