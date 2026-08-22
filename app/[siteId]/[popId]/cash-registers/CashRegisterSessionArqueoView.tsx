"use client"

import type { CashRegisterSessionArqueoDetail } from "@/app/[siteId]/[popId]/cash-registers/actions"
import { CashRegisterSessionOperationsTable } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterSessionOperationsTable"
import {
  arqueoDifferenceToneClass,
  formatCashRegisterDateTime,
  formatCashRegisterMoney,
} from "@/app/[siteId]/[popId]/cash-registers/cashRegisterFormatters"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import {
  dataWorkspaceDetailBodyClass,
  dataWorkspaceDetailPanelClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceFlushBottomPanelBodyClass,
  dataWorkspaceFlushBottomPanelChromeClass,
  dataWorkspaceFlushBottomPanelClass,
  tdMoneyClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { CashRegisterArqueoPrintDocument } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterArqueoPrintDocument"
import { RootsFormSegmentField } from "@/components/rootsy-form"
import { RootsSubtleButton } from "@/components/rootsy-button"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import type { CashRegisterClosingComparisonLine } from "@/lib/cashRegisterCloseSettlement"
import { printSaleComprobanteElement } from "@/lib/saleComprobantePrint"
import { cn } from "@/lib/utils"
import { LockOpen, Printer } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

const ALL_OPERATIONS_FILTER = "__all__"

const MONEY_EPS = 0.005

function hasMoney(amount: number): boolean {
  return Math.abs(amount) >= MONEY_EPS
}

function MoneyRow({
  label,
  amount,
  tone = "default",
}: {
  label: string
  amount: number
  tone?: "default" | "positive" | "negative"
}) {
  const differenceTone =
    tone === "positive" || tone === "negative" ? tone : null

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="min-w-0 text-sm text-[var(--rootsy-bruma-500)]">
        {label}
      </span>
      <span
        className={cn(
          "shrink-0 font-numeric text-sm font-semibold tabular-nums",
          tdMoneyClass,
          differenceTone
            ? arqueoDifferenceToneClass(differenceTone)
            : "text-[var(--rootsy-bruma-900)]",
        )}
      >
        {formatCashRegisterMoney(amount)}
      </span>
    </div>
  )
}

function ColumnSideHeader({
  title,
  dateLabel,
  userLabel,
}: {
  title: string
  dateLabel: string
  userLabel: string
}) {
  return (
    <div className="space-y-1 border-b border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-5">
      <p className={dataWorkspaceEntityCardStatLabelClass}>{title}</p>
      <p className="font-canopy text-sm font-medium text-[var(--rootsy-bruma-900)]">
        {dateLabel}
      </p>
      <p className="truncate font-canopy text-sm text-[var(--rootsy-bruma-500)]">
        {userLabel}
      </p>
    </div>
  )
}

function OpenSessionClosingEmptyState() {
  return (
    <DataWorkspaceDetailEmptyState
      icon={LockOpen}
      title="El cierre se completa al cerrar la caja."
      className="min-h-56 py-10"
    />
  )
}

function filterReportedLines(
  lines: CashRegisterClosingComparisonLine[],
): CashRegisterClosingComparisonLine[] {
  return lines.filter((line) => hasMoney(line.informado))
}

function filterDifferenceLines(
  lines: CashRegisterClosingComparisonLine[],
): CashRegisterClosingComparisonLine[] {
  return lines.filter((line) => hasMoney(line.difference))
}

function resolveOperationAccountLabel(paymentMethodLabel: string): string {
  const label = paymentMethodLabel.trim()
  if (!label || label === "—") return "Sin cuenta"
  const separator = " — "
  const idx = label.lastIndexOf(separator)
  if (idx >= 0) return label.slice(idx + separator.length).trim()
  return label
}

type Props = {
  siteId: string
  popId: string
  detail: CashRegisterSessionArqueoDetail
  className?: string
}

export function CashRegisterSessionArqueoView({
  siteId,
  popId,
  detail,
  className,
}: Props) {
  const { session, closingComparison, hasAccountingEntry, operations } = detail
  const isOpen = session.status === "open"
  const timeZone = usePopTimeZone()
  const [accountFilter, setAccountFilter] = useState<string | null>(null)
  const [printing, setPrinting] = useState(false)
  const printRootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setAccountFilter(null)
  }, [operations])

  const cobrosPorCuenta = useMemo(() => {
    const rows =
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
    return rows.filter((row) => hasMoney(row.total))
  }, [session.ventasPorCuenta, session.ventasPorMedio])

  const reportedLines = useMemo(
    () => filterReportedLines(closingComparison),
    [closingComparison],
  )

  const differenceLines = useMemo(
    () => filterDifferenceLines(closingComparison),
    [closingComparison],
  )

  const operationsSummary = useMemo(() => {
    const byAccount = new Map<string, number>()
    for (const operation of operations) {
      const accountLabel = resolveOperationAccountLabel(
        operation.paymentMethodLabel,
      )
      byAccount.set(accountLabel, (byAccount.get(accountLabel) ?? 0) + 1)
    }

    return {
      total: operations.length,
      byAccount: [...byAccount.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort(
          (a, b) =>
            b.count - a.count || a.label.localeCompare(b.label, "es"),
        ),
    }
  }, [operations])

  const filteredOperations = useMemo(() => {
    if (!accountFilter) return operations
    return operations.filter(
      (operation) =>
        resolveOperationAccountLabel(operation.paymentMethodLabel) ===
        accountFilter,
    )
  }, [accountFilter, operations])

  const operationsSegmentOptions = useMemo(
    () => [
      {
        value: ALL_OPERATIONS_FILTER,
        label: `Todos (${operationsSummary.total})`,
      },
      ...operationsSummary.byAccount.map((item) => ({
        value: item.label,
        label: `${item.label} (${item.count})`,
      })),
    ],
    [operationsSummary],
  )

  const operationsSegmentValue = accountFilter ?? ALL_OPERATIONS_FILTER

  const handlePrint = async () => {
    const surface = printRootRef.current?.querySelector<HTMLElement>(
      ".sale-comprobante-print-surface",
    )
    if (!surface || printing) return
    setPrinting(true)
    try {
      await printSaleComprobanteElement(surface, "hoja")
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className={cn("relative flex flex-1 flex-col gap-6", className)}>
      <div
        ref={printRootRef}
        aria-hidden
        className="pointer-events-none h-0 w-0 overflow-hidden"
      >
        <CashRegisterArqueoPrintDocument
          detail={detail}
          timeZone={timeZone}
          printedAt={formatCashRegisterDateTime(
            new Date().toISOString(),
            timeZone,
          )}
        />
      </div>

      <section className={cn(dataWorkspaceDetailPanelClass, "shrink-0 overflow-hidden")}>
        <div className="flex items-center justify-between gap-3 border-b border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-5">
          <p className={dataWorkspaceEntityCardStatLabelClass}>
            Resumen del turno
          </p>
          <RootsSubtleButton
            type="button"
            size="compact"
            withIcon
            loading={printing}
            loadingLabel="Imprimiendo"
            onClick={() => {
              void handlePrint()
            }}
          >
            <Printer className="size-4" aria-hidden />
            Imprimir
          </RootsSubtleButton>
        </div>
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="border-b border-[var(--rootsy-bruma-200)] lg:border-b-0 lg:border-r">
            <ColumnSideHeader
              title="Apertura"
              dateLabel={formatCashRegisterDateTime(session.openedAt, timeZone)}
              userLabel={session.openedByName ?? "—"}
            />
            <div className={cn(dataWorkspaceDetailBodyClass, "space-y-0.5")}>
              {hasMoney(session.openingCash) ? (
                <MoneyRow label="Efectivo inicial" amount={session.openingCash} />
              ) : null}
              {hasMoney(session.movementDeposits) ? (
                <MoneyRow
                  label="Ingresos al cajón"
                  amount={session.movementDeposits}
                />
              ) : null}
              {hasMoney(session.movementWithdrawals) ? (
                <MoneyRow
                  label="Retiros del cajón"
                  amount={-session.movementWithdrawals}
                />
              ) : null}

              {cobrosPorCuenta.length > 0 ? (
                <>
                  <p className={cn(dataWorkspaceEntityCardStatLabelClass, "mb-2 mt-4")}>
                    Total cobrado por cuenta
                  </p>
                  <div className="space-y-0.5">
                    {cobrosPorCuenta.map((row) => (
                      <MoneyRow
                        key={row.key}
                        label={row.label}
                        amount={row.total}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div>
            <ColumnSideHeader
              title="Cierre"
              dateLabel={
                session.closedAt
                  ? formatCashRegisterDateTime(session.closedAt, timeZone)
                  : "Pendiente"
              }
              userLabel={
                session.closedByName ?? (isOpen ? "Pendiente" : "—")
              }
            />
            {isOpen ? (
              <OpenSessionClosingEmptyState />
            ) : (
            <div className={cn(dataWorkspaceDetailBodyClass, "space-y-0.5")}>
              {reportedLines.length > 0 ? (
                <>
                  <p className={cn(dataWorkspaceEntityCardStatLabelClass, "mb-2")}>
                    Totales reportados
                  </p>
                  <div className="space-y-0.5">
                    {reportedLines.map((line) => (
                      <MoneyRow
                        key={line.key}
                        label={line.label}
                        amount={line.informado}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p className="py-2 font-canopy text-sm text-[var(--rootsy-bruma-500)]">
                  Sin montos reportados al cierre.
                </p>
              )}

              {differenceLines.length > 0 ? (
                <>
                  <p className={cn(dataWorkspaceEntityCardStatLabelClass, "mb-2 mt-4")}>
                    Diferencia
                  </p>
                  <div className="space-y-0.5">
                    {differenceLines.map((line) => (
                      <MoneyRow
                        key={line.key}
                        label={line.label}
                        amount={line.difference}
                        tone={
                          line.difference > 0
                            ? "positive"
                            : line.difference < 0
                              ? "negative"
                              : "default"
                        }
                      />
                    ))}
                  </div>
                </>
              ) : null}

              {session.closedByName &&
              session.closedByUserId &&
              session.openedByUserId &&
              session.closedByUserId !== session.openedByUserId ? (
                <p className="mt-4 font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                  Cerrado por un supervisor ({session.closedByName})
                </p>
              ) : null}

              {differenceLines.length > 0 && hasAccountingEntry ? (
                <p className="mt-4 font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                  Las diferencias quedaron registradas en un asiento de cierre
                  de caja.
                </p>
              ) : null}

              {session.closingSnapshot?.note ? (
                <div className="mt-4 rounded-xl border border-[var(--rootsy-bruma-200)] bg-white px-3.5 py-3 text-sm">
                  <p className={cn(dataWorkspaceEntityCardStatLabelClass, "mb-1")}>
                    Nota de cierre
                  </p>
                  <p className="text-[var(--rootsy-bruma-900)]">
                    {session.closingSnapshot.note}
                  </p>
                </div>
              ) : null}
            </div>
            )}
          </div>
        </div>
      </section>

      <section className={dataWorkspaceFlushBottomPanelClass}>
        <div
          className={cn(
            "shrink-0 border-b border-[var(--rootsy-bruma-200)] px-4 py-4 lg:px-5",
            dataWorkspaceFlushBottomPanelChromeClass,
          )}
        >
          <RootsFormSegmentField
            label="Filtrar operaciones"
            aria-label="Filtrar operaciones por cuenta"
            layout="inline"
            value={operationsSegmentValue}
            onValueChange={(value) =>
              setAccountFilter(
                value === ALL_OPERATIONS_FILTER ? null : value,
              )
            }
            options={operationsSegmentOptions}
            className="max-w-full"
            groupClassName="!w-auto max-w-full"
          />
        </div>
        <div className={dataWorkspaceFlushBottomPanelBodyClass}>
          <CashRegisterSessionOperationsTable
            siteId={siteId}
            popId={popId}
            operations={filteredOperations}
            fullWidth
          />
        </div>
      </section>
    </div>
  )
}
