"use client"

import type { CashRegisterSessionArqueoDetail } from "@/app/[siteId]/[popId]/cash-registers/actions"
import { CashRegisterSessionOperationsTable } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterSessionOperationsTable"
import {
  formatCashRegisterDateTime,
  formatCashRegisterMoney,
} from "@/app/[siteId]/[popId]/cash-registers/cashRegisterFormatters"
import {
  dataWorkspaceFlushBottomShellCard,
  dataWorkspaceShellCard,
  lightToolbarFocusClass,
  tdMoneyClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import type { CashRegisterClosingComparisonLine } from "@/lib/cashRegisterCloseSettlement"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"

const sectionLabel =
  "text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground"

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
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="min-w-0 text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "shrink-0 font-mono text-sm font-semibold tabular-nums",
          tdMoneyClass,
          tone === "positive" && "text-emerald-700",
          tone === "negative" && "text-destructive",
          tone === "default" && "text-foreground",
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
    <div className="border-b border-border/60 bg-muted/15 px-4 py-3 sm:px-5">
      <p className={sectionLabel}>{title}</p>
      <p className="mt-1.5 text-sm font-medium text-foreground">{dateLabel}</p>
      <p className="mt-0.5 truncate text-sm text-muted-foreground">{userLabel}</p>
    </div>
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

function OperationsKpiStat({
  label,
  value,
  active = false,
  onClick,
}: {
  label: string
  value: string
  active?: boolean
  onClick?: () => void
}) {
  const className = cn(
    "min-w-[8.5rem] rounded-xl px-3 py-2.5 text-left transition-[color,background-color,box-shadow,opacity] duration-150",
    onClick && "cursor-pointer",
    onClick && !active && "opacity-80 hover:bg-background/55 hover:opacity-100",
    active && "bg-card shadow-sm",
    onClick && lightToolbarFocusClass,
  )

  const labelClassName = cn(
    sectionLabel,
    active ? "text-foreground" : "text-muted-foreground",
  )

  const valueClassName = cn(
    "mt-1.5 font-mono text-2xl font-bold tabular-nums tracking-tight",
    active ? "text-foreground" : "text-foreground/80",
  )

  const content = (
    <>
      <p className={labelClassName}>{label}</p>
      <p className={valueClassName}>{value}</p>
    </>
  )

  if (!onClick) {
    return <div className={className}>{content}</div>
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-pressed={active}
    >
      {content}
    </button>
  )
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

  return (
    <div className={cn("flex flex-1 flex-col gap-6", className)}>
      <section className={cn(dataWorkspaceShellCard, "shrink-0 overflow-hidden")}>
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="border-b border-border/60 lg:border-b-0 lg:border-r">
            <ColumnSideHeader
              title="Apertura"
              dateLabel={formatCashRegisterDateTime(session.openedAt, timeZone)}
              userLabel={session.openedByName ?? "—"}
            />
            <div className="space-y-0.5 px-4 py-4 sm:px-5">
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
                  <p className={cn(sectionLabel, "mb-2 mt-4")}>
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
            <div className="space-y-0.5 px-4 py-4 sm:px-5">
              {isOpen ? (
                <p className="py-2 text-sm text-muted-foreground">
                  El turno sigue abierto. Los totales reportados y las
                  diferencias aparecerán al cerrar la caja.
                </p>
              ) : reportedLines.length > 0 ? (
                <>
                  <p className={cn(sectionLabel, "mb-2")}>Totales reportados</p>
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
                <p className="py-2 text-sm text-muted-foreground">
                  Sin montos reportados al cierre.
                </p>
              )}

              {!isOpen && differenceLines.length > 0 ? (
                <>
                  <p className={cn(sectionLabel, "mb-2 mt-4")}>Diferencia</p>
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

              {!isOpen &&
              session.closedByName &&
              session.closedByUserId &&
              session.openedByUserId &&
              session.closedByUserId !== session.openedByUserId ? (
                <p className="mt-4 text-xs text-muted-foreground">
                  Cerrado por un supervisor ({session.closedByName})
                </p>
              ) : null}

              {!isOpen &&
              differenceLines.length > 0 &&
              hasAccountingEntry ? (
                <p className="mt-4 text-xs text-muted-foreground">
                  Las diferencias quedaron registradas en un asiento de cierre
                  de caja.
                </p>
              ) : null}

              {session.closingSnapshot?.note ? (
                <div className="mt-4 rounded-xl border border-border/60 bg-muted/10 px-3.5 py-3 text-sm">
                  <p className={cn(sectionLabel, "mb-1")}>Nota de cierre</p>
                  <p className="text-foreground">{session.closingSnapshot.note}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section
        className={cn(
          dataWorkspaceFlushBottomShellCard,
          "flex flex-1 flex-col",
        )}
      >
        <div className="shrink-0 border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,8.5rem),1fr))]">
            <OperationsKpiStat
              label="Operaciones"
              value={String(operationsSummary.total)}
              active={accountFilter == null}
              onClick={() => setAccountFilter(null)}
            />
            {operationsSummary.byAccount.map((item) => (
              <OperationsKpiStat
                key={item.label}
                label={item.label}
                value={String(item.count)}
                active={accountFilter === item.label}
                onClick={() => setAccountFilter(item.label)}
              />
            ))}
          </div>
        </div>
        <CashRegisterSessionOperationsTable
          siteId={siteId}
          popId={popId}
          operations={filteredOperations}
          fullWidth
        />
      </section>
    </div>
  )
}
