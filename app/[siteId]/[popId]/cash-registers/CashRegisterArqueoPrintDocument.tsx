"use client"

import type {
  CashRegisterSessionArqueoDetail,
  CashRegisterSessionOperationRow,
} from "@/app/[siteId]/[popId]/cash-registers/actions"
import { formatTreasuryMovementTime } from "@/app/[siteId]/[popId]/accounts/treasuryAccountUiUtils"
import {
  formatArqueoDifferenceDisplay,
  formatCashRegisterDateTime,
  formatCashRegisterMoney,
} from "@/app/[siteId]/[popId]/cash-registers/cashRegisterFormatters"
import { toPopCalendarDate } from "@/lib/popTimezone"
import { saleComprobantePrintSurfaceClass } from "@/lib/saleComprobantePrint"
import { cn } from "@/lib/utils"

const MONEY_EPS = 0.005

function hasMoney(amount: number): boolean {
  return Math.abs(amount) >= MONEY_EPS
}

function formatSignedMoney(amount: number): string {
  if (Math.abs(amount) < MONEY_EPS) return formatCashRegisterMoney(0)
  const formatted = formatCashRegisterMoney(Math.abs(amount))
  return amount < 0 ? `−${formatted}` : `+${formatted}`
}

function PrintMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-medium text-[var(--rootsy-bruma-900)]">
        {value}
      </p>
    </div>
  )
}

function PrintKpi({
  label,
  value,
  muted = false,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="border border-[var(--rootsy-bruma-200)] px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-numeric text-base font-semibold tabular-nums",
          muted
            ? "text-[var(--rootsy-bruma-500)]"
            : "text-[var(--rootsy-bruma-900)]",
        )}
      >
        {value}
      </p>
    </div>
  )
}

function PrintSectionTitle({ children }: { children: string }) {
  return (
    <h3 className="mb-2 border-b border-[var(--rootsy-bruma-900)] pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-900)]">
      {children}
    </h3>
  )
}

function PrintAmountRow({
  label,
  amount,
  signed = false,
}: {
  label: string
  amount: number
  signed?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-1 text-xs">
      <span className="text-[var(--rootsy-bruma-700)]">{label}</span>
      <span className="font-numeric tabular-nums text-[var(--rootsy-bruma-900)]">
        {signed ? formatSignedMoney(amount) : formatCashRegisterMoney(amount)}
      </span>
    </div>
  )
}

function formatOperationPrintAmount(row: CashRegisterSessionOperationRow): string {
  const formatted = formatCashRegisterMoney(row.amount)
  return row.kind === "withdrawal" ? `−${formatted}` : formatted
}

function formatOperationPrintTitle(row: CashRegisterSessionOperationRow): string {
  if (row.kind === "sale") {
    return row.customerLabel && row.customerLabel !== "—"
      ? `${row.operationLabel} · ${row.customerLabel}`
      : row.operationLabel
  }
  return row.operationLabel
}

function groupOperationsByDate(
  operations: CashRegisterSessionOperationRow[],
  timeZone: string,
): { dateKey: string; dateLabel: string; rows: CashRegisterSessionOperationRow[] }[] {
  const groups = new Map<string, CashRegisterSessionOperationRow[]>()
  const chronological = [...operations].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  )

  for (const operation of chronological) {
    const dateKey = toPopCalendarDate(operation.occurredAt, timeZone)
    const list = groups.get(dateKey) ?? []
    list.push(operation)
    groups.set(dateKey, list)
  }

  return [...groups.entries()].map(([dateKey, rows]) => ({
    dateKey,
    dateLabel: formatOperationGroupDate(dateKey),
    rows,
  }))
}

function formatOperationGroupDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-")
  if (!year || !month || !day) return isoDate
  return `${day}/${month}/${year}`
}

function SignatureSlot({ label }: { label: string }) {
  return (
    <div className="pt-8">
      <div className="border-t border-[var(--rootsy-bruma-400)]" />
      <p className="mt-1.5 text-center text-[10px] uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]">
        {label}
      </p>
    </div>
  )
}

type Props = {
  detail: CashRegisterSessionArqueoDetail
  timeZone: string
  printedAt: string
}

export function CashRegisterArqueoPrintDocument({
  detail,
  timeZone,
  printedAt,
}: Props) {
  const { session, closingComparison, hasAccountingEntry, registerName, popName } =
    detail
  const isOpen = session.status === "open"
  const efectivoEnCaja = isOpen
    ? session.efectivoTeorico
    : (session.closingSnapshot?.cash ?? session.efectivoTeorico)
  const differenceDisplay = formatArqueoDifferenceDisplay(
    isOpen ? null : session.cashArqueoDifference,
  )

  const cobrosPorCuenta =
    session.ventasPorCuenta.length > 0
      ? session.ventasPorCuenta.map((row) => ({
          key: row.key,
          label: row.label,
          total: row.total,
        }))
      : session.ventasPorMedio.map((row) => ({
          key: row.paymentKind,
          label: row.name,
          total: row.total,
        }))
  const cobrosVisibles = cobrosPorCuenta.filter((row) => hasMoney(row.total))

  const closedBySupervisor =
    Boolean(session.closedByName) &&
    Boolean(session.closedByUserId) &&
    Boolean(session.openedByUserId) &&
    session.closedByUserId !== session.openedByUserId

  return (
    <div
      className={cn(
        saleComprobantePrintSurfaceClass,
        "w-[210mm] bg-white px-8 py-8 font-canopy text-[var(--rootsy-bruma-900)]",
      )}
    >
      <header className="border-b-2 border-[var(--rootsy-bruma-900)] pb-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            {popName ? (
              <p className="text-sm font-semibold leading-snug">{popName}</p>
            ) : null}
            <p className="mt-1 text-xl font-semibold tracking-[-0.02em]">
              Arqueo de caja
            </p>
            <p className="mt-1 text-sm text-[var(--rootsy-bruma-600)]">
              {registerName} · Arqueo #{session.arqueoNumber || "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
              {isOpen ? "Turno abierto" : "Arqueo cerrado"}
            </p>
            <p className="mt-1 text-[10px] text-[var(--rootsy-bruma-500)]">
              Impreso {printedAt}
            </p>
          </div>
        </div>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3">
        <PrintMeta
          label="Apertura"
          value={formatCashRegisterDateTime(session.openedAt, timeZone)}
        />
        <PrintMeta
          label="Cajero"
          value={session.openedByName ?? "—"}
        />
        <PrintMeta
          label="Cierre"
          value={
            session.closedAt
              ? formatCashRegisterDateTime(session.closedAt, timeZone)
              : "Pendiente"
          }
        />
        <PrintMeta
          label="Cierre a cargo de"
          value={session.closedByName ?? (isOpen ? "Pendiente" : "—")}
        />
      </section>

      <section className="mt-6">
        <PrintSectionTitle>Totales</PrintSectionTitle>
        <div className="grid grid-cols-3 gap-2">
          <PrintKpi
            label="Total cobrado"
            value={formatCashRegisterMoney(session.totalCobrado)}
          />
          <PrintKpi
            label="Efectivo en caja"
            value={formatCashRegisterMoney(efectivoEnCaja)}
          />
          <PrintKpi
            label="Diferencia"
            value={differenceDisplay.text}
            muted={differenceDisplay.tone === "muted"}
          />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-8">
        <div>
          <PrintSectionTitle>Apertura y movimientos</PrintSectionTitle>
          {hasMoney(session.openingCash) ? (
            <PrintAmountRow
              label="Efectivo inicial"
              amount={session.openingCash}
            />
          ) : null}
          {hasMoney(session.movementDeposits) ? (
            <PrintAmountRow
              label="Ingresos al cajón"
              amount={session.movementDeposits}
            />
          ) : null}
          {hasMoney(session.movementWithdrawals) ? (
            <PrintAmountRow
              label="Retiros del cajón"
              amount={-session.movementWithdrawals}
              signed
            />
          ) : null}
          {!hasMoney(session.openingCash) &&
          !hasMoney(session.movementDeposits) &&
          !hasMoney(session.movementWithdrawals) ? (
            <p className="text-xs text-[var(--rootsy-bruma-500)]">
              Sin movimientos de efectivo inicial.
            </p>
          ) : null}

          {cobrosVisibles.length > 0 ? (
            <div className="mt-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]">
                Total cobrado por cuenta
              </p>
              {cobrosVisibles.map((row) => (
                <PrintAmountRow
                  key={row.key}
                  label={row.label}
                  amount={row.total}
                />
              ))}
            </div>
          ) : null}

          {session.openingNote ? (
            <div className="mt-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]">
                Nota de apertura
              </p>
              <p className="text-xs leading-relaxed text-[var(--rootsy-bruma-700)]">
                {session.openingNote}
              </p>
            </div>
          ) : null}
        </div>

        <div>
          <PrintSectionTitle>Cierre</PrintSectionTitle>
          {isOpen ? (
            <p className="text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">
              El cierre se completa al cerrar la caja. Este documento es un
              resumen preliminar del turno.
            </p>
          ) : closingComparison.length > 0 ? (
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-[var(--rootsy-bruma-200)] text-left text-[10px] uppercase tracking-[0.06em] text-[var(--rootsy-bruma-500)]">
                  <th className="py-1.5 font-medium">Concepto</th>
                  <th className="py-1.5 text-right font-medium">Esperado</th>
                  <th className="py-1.5 text-right font-medium">Informado</th>
                  <th className="py-1.5 text-right font-medium">Dif.</th>
                </tr>
              </thead>
              <tbody>
                {closingComparison.map((line) => (
                  <tr
                    key={line.key}
                    className="border-b border-[var(--rootsy-bruma-100)]"
                  >
                    <td className="py-1.5 pr-2">{line.label}</td>
                    <td className="py-1.5 text-right font-numeric tabular-nums">
                      {formatCashRegisterMoney(line.cobrado)}
                    </td>
                    <td className="py-1.5 text-right font-numeric tabular-nums">
                      {formatCashRegisterMoney(line.informado)}
                    </td>
                    <td className="py-1.5 text-right font-numeric tabular-nums">
                      {formatSignedMoney(line.difference)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-[var(--rootsy-bruma-500)]">
              Sin montos reportados al cierre.
            </p>
          )}

          {session.closingSnapshot?.note ? (
            <div className="mt-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]">
                Nota de cierre
              </p>
              <p className="text-xs leading-relaxed text-[var(--rootsy-bruma-700)]">
                {session.closingSnapshot.note}
              </p>
            </div>
          ) : null}

          {closedBySupervisor ? (
            <p className="mt-3 text-[10px] leading-relaxed text-[var(--rootsy-bruma-500)]">
              Cerrado por un supervisor ({session.closedByName}).
            </p>
          ) : null}

          {!isOpen &&
          closingComparison.some((line) => hasMoney(line.difference)) &&
          hasAccountingEntry ? (
            <p className="mt-3 text-[10px] leading-relaxed text-[var(--rootsy-bruma-500)]">
              Las diferencias quedaron registradas en un asiento de cierre de
              caja.
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-10 grid grid-cols-3 gap-8">
        <SignatureSlot label={`Cajero${session.openedByName ? ` · ${session.openedByName}` : ""}`} />
        <SignatureSlot
          label={
            session.closedByName
              ? `Cierre · ${session.closedByName}`
              : "Cierre / supervisor"
          }
        />
        <SignatureSlot label="Control" />
      </section>

      <footer className="mt-8 border-t border-[var(--rootsy-bruma-200)] pt-2 text-[9px] text-[var(--rootsy-bruma-400)]">
        Documento interno de control de caja · Generado por Rootsy
      </footer>

      <ArqueoOperationsAnnex
        operations={detail.operations}
        registerName={registerName}
        arqueoNumber={session.arqueoNumber}
        timeZone={timeZone}
      />
    </div>
  )
}

function ArqueoOperationsAnnex({
  operations,
  registerName,
  arqueoNumber,
  timeZone,
}: {
  operations: CashRegisterSessionOperationRow[]
  registerName: string
  arqueoNumber: number
  timeZone: string
}) {
  const groups = groupOperationsByDate(operations, timeZone)

  return (
    <section className="arqueo-print-page-break mt-0 pt-2">
      <div className="flex items-end justify-between gap-4 border-b-2 border-[var(--rootsy-bruma-900)] pb-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
            Anexo
          </p>
          <h3 className="mt-0.5 text-base font-semibold tracking-[-0.02em]">
            Operaciones del turno
          </h3>
        </div>
        <p className="text-[10px] text-[var(--rootsy-bruma-500)]">
          {registerName} · Arqueo #{arqueoNumber || "—"} · {operations.length}{" "}
          {operations.length === 1 ? "operación" : "operaciones"}
        </p>
      </div>

      {operations.length === 0 ? (
        <p className="mt-4 text-xs text-[var(--rootsy-bruma-500)]">
          Sin operaciones en este arqueo.
        </p>
      ) : (
        groups.map((group) => (
          <div key={group.dateKey} className="mt-4">
            {groups.length > 1 ? (
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--rootsy-bruma-500)]">
                {group.dateLabel}
              </p>
            ) : null}
            <table className="arqueo-print-table w-full border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-[var(--rootsy-bruma-200)] text-left text-[10px] uppercase tracking-[0.06em] text-[var(--rootsy-bruma-500)]">
                  <th className="w-14 py-1.5 font-medium">Hora</th>
                  <th className="py-1.5 font-medium">Operación</th>
                  <th className="w-40 py-1.5 font-medium">Medio</th>
                  <th className="w-24 py-1.5 text-right font-medium">Importe</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--rootsy-bruma-100)] align-top"
                  >
                    <td className="py-1.5 font-numeric tabular-nums text-[var(--rootsy-bruma-500)]">
                      {formatTreasuryMovementTime(row.occurredAt, timeZone)}
                    </td>
                    <td className="py-1.5 pr-3">
                      <p className="text-[var(--rootsy-bruma-900)]">
                        {formatOperationPrintTitle(row)}
                      </p>
                      {row.showLines && row.lines.length > 0 ? (
                        <ul className="mt-1 space-y-0.5">
                          {row.lines.map((line, index) => (
                            <li
                              key={`${row.id}-${line.name}-${index}`}
                              className="flex items-baseline justify-between gap-3 text-[10px] text-[var(--rootsy-bruma-500)]"
                            >
                              <span className="min-w-0">
                                {line.quantity} × {line.name}
                                {line.discountLabel
                                  ? ` · ${line.discountLabel}`
                                  : null}
                                {line.extras ? ` · ${line.extras}` : null}
                                {line.comment ? ` · ${line.comment}` : null}
                              </span>
                              <span className="shrink-0 font-numeric tabular-nums">
                                {formatCashRegisterMoney(line.lineTotal)}
                              </span>
                            </li>
                          ))}
                          {row.generalDiscountAmount > 0 ? (
                            <li className="flex items-baseline justify-between gap-3 text-[10px] text-[var(--rootsy-bruma-500)]">
                              <span>Descuento general</span>
                              <span className="font-numeric tabular-nums">
                                −{formatCashRegisterMoney(row.generalDiscountAmount)}
                              </span>
                            </li>
                          ) : null}
                        </ul>
                      ) : row.kind !== "sale" &&
                        row.detail &&
                        row.detail !== "—" ? (
                        <p className="mt-0.5 text-[10px] text-[var(--rootsy-bruma-500)]">
                          {row.detail}
                        </p>
                      ) : null}
                    </td>
                    <td className="py-1.5 pr-3 text-[var(--rootsy-bruma-700)]">
                      {row.paymentMethodLabel}
                    </td>
                    <td className="py-1.5 text-right font-numeric tabular-nums text-[var(--rootsy-bruma-900)]">
                      {formatOperationPrintAmount(row)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </section>
  )
}
