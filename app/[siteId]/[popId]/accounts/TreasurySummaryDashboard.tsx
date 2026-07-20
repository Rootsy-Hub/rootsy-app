"use client"

import type { TreasuryAccountTableRow } from "@/app/[siteId]/[popId]/accounts/actions"
import type { PaymentsHubSummary } from "@/app/[siteId]/[popId]/payment-methods/actions"
import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
import { treasuryKindLabel } from "@/lib/treasuryAccountKinds"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const shellCard = dataWorkspaceShellCard

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

type AccountTreasuryRow = {
  id: string
  name: string
  kindLabel: string
  isActive: boolean
  received: number
  paidOut: number
  net: number
  ledgerBalance: number | null
  outstandingBalance: number | null
  isCardPayable: boolean
}

function computeTreasuryView(
  summary: PaymentsHubSummary | null,
  rows: TreasuryAccountTableRow[],
) {
  const received = summary?.receivedMonthTotal ?? 0
  const paidOut = summary?.paidOutMonthTotal ?? 0
  const net = summary?.netMonthTotal ?? 0
  const monthLabel = summary?.monthLabel ?? "—"

  const activeAccounts = rows.filter((r) => r.isActive)
  const accountsWithMovement = rows.filter(
    (r) => r.receivedMonthTotal > 0 || r.paidOutMonthTotal > 0,
  )

  const ledgerRows = rows.filter((r) => r.ledgerBalance != null)
  const totalLedgerBalance = roundMoney(
    ledgerRows.reduce((sum, r) => sum + (r.ledgerBalance ?? 0), 0),
  )

  const cardAccounts = rows.filter((r) => r.isCardPayable)
  const totalCardDebt = roundMoney(
    cardAccounts.reduce((sum, r) => sum + r.outstandingBalance, 0),
  )

  const accountRows: AccountTreasuryRow[] = rows
    .map((row) => ({
      id: row.id,
      name: row.name,
      kindLabel: treasuryKindLabel(row.kind),
      isActive: row.isActive,
      received: row.receivedMonthTotal,
      paidOut: row.paidOutMonthTotal,
      net: roundMoney(row.receivedMonthTotal - row.paidOutMonthTotal),
      ledgerBalance: row.ledgerBalance,
      outstandingBalance: row.isCardPayable ? row.outstandingBalance : null,
      isCardPayable: row.isCardPayable,
    }))
    .sort((a, b) => {
      const aActivity = Math.abs(a.received) + Math.abs(a.paidOut)
      const bActivity = Math.abs(b.received) + Math.abs(b.paidOut)
      return bActivity - aActivity
    })

  return {
    received,
    paidOut,
    net,
    monthLabel,
    activeCount: activeAccounts.length,
    movementCount: accountsWithMovement.length,
    totalLedgerBalance,
    hasLedgerBalance: ledgerRows.length > 0,
    totalCardDebt,
    hasCardDebt: cardAccounts.length > 0,
    accountRows,
  }
}

type Props = {
  summary: PaymentsHubSummary | null
  rows: TreasuryAccountTableRow[]
}

function FlowLine({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: string
  tone?: "inflow" | "outflow" | "neutral" | "positive" | "negative"
}) {
  const valueClass =
    tone === "inflow" || tone === "positive"
      ? "text-emerald-700"
      : tone === "outflow" || tone === "negative"
        ? "text-rose-700"
        : "text-foreground"

  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/50 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-sm font-semibold tabular-nums", valueClass)}>
        {value}
      </span>
    </div>
  )
}

export function TreasurySummaryDashboard({ summary, rows }: Props) {
  const view = useMemo(
    () => computeTreasuryView(summary, rows),
    [summary, rows],
  )

  const netTone =
    view.net > 0 ? "positive" : view.net < 0 ? "negative" : "neutral"

  const kpis = [
    {
      label: "Entró",
      value: fmt.format(view.received),
      sub: `${view.movementCount} ${view.movementCount === 1 ? "cuenta con movimiento" : "cuentas con movimiento"} · ${view.monthLabel}`,
    },
    {
      label: "Salió",
      value: fmt.format(view.paidOut),
      sub: "Egresos del período en tesorería",
    },
    {
      label: "Neto del mes",
      value: fmt.format(view.net),
      sub:
        view.net > 0
          ? "Superávit de caja"
          : view.net < 0
            ? "Déficit de caja"
            : "Sin diferencia neta",
    },
  ]

  return (
    <div className="relative flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={cn(shellCard, "px-5 py-4")}>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-2 font-mono text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cn(shellCard, "p-5")}>
          <h3 className="text-sm font-semibold text-foreground">
            Flujo del período
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Movimientos consolidados del mes en todas las cuentas
          </p>
          <div className="mt-4">
            <FlowLine label="Entradas" value={fmt.format(view.received)} tone="inflow" />
            <FlowLine label="Salidas" value={fmt.format(view.paidOut)} tone="outflow" />
            <FlowLine
              label="Resultado neto"
              value={fmt.format(view.net)}
              tone={netTone}
            />
          </div>
        </div>

        <div className={cn(shellCard, "p-5")}>
          <h3 className="text-sm font-semibold text-foreground">
            Posición de tesorería
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Saldos y pasivos vigentes al cierre del período
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-baseline justify-between gap-4 rounded-lg border border-border/60 bg-muted/15 px-4 py-3">
              <div>
                <p className="text-sm text-foreground">Cuentas activas</p>
                <p className="text-[11px] text-muted-foreground">
                  Configuradas en este POP
                </p>
              </div>
              <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                {view.activeCount}
              </span>
            </div>
            {view.hasLedgerBalance ? (
              <div className="flex items-baseline justify-between gap-4 rounded-lg border border-border/60 bg-muted/15 px-4 py-3">
                <div>
                  <p className="text-sm text-foreground">Saldo contable</p>
                  <p className="text-[11px] text-muted-foreground">
                    Suma de cuentas con saldo en libro
                  </p>
                </div>
                <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                  {fmt.format(view.totalLedgerBalance)}
                </span>
              </div>
            ) : null}
            {view.hasCardDebt ? (
              <div className="flex items-baseline justify-between gap-4 rounded-lg border border-amber-200/80 bg-amber-50/60 px-4 py-3">
                <div>
                  <p className="text-sm text-foreground">Deuda en tarjetas</p>
                  <p className="text-[11px] text-muted-foreground">
                    Resúmenes corporativos pendientes
                  </p>
                </div>
                <span className="font-mono text-lg font-semibold tabular-nums text-amber-900">
                  {fmt.format(view.totalCardDebt)}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className={cn(shellCard, "overflow-hidden")}>
        <div className="border-b border-border/80 px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">
            Movimiento por cuenta
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Entradas y salidas del mes en cada cuenta de tesorería
          </p>
        </div>

        {view.accountRows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">
            No hay cuentas configuradas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20 text-left text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Cuenta</th>
                  <th className="px-3 py-3 text-right font-medium">Entró</th>
                  <th className="px-3 py-3 text-right font-medium">Salió</th>
                  <th className="px-3 py-3 text-right font-medium">Neto</th>
                  <th className="px-5 py-3 text-right font-medium">Saldo / Deuda</th>
                </tr>
              </thead>
              <tbody>
                {view.accountRows.map((account) => (
                  <tr
                    key={account.id}
                    className={cn(
                      "border-b border-border/40 last:border-0",
                      !account.isActive && "opacity-60",
                    )}
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{account.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {account.kindLabel}
                        {!account.isActive ? " · Inactiva" : ""}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-emerald-700">
                      {account.received > 0 ? fmt.format(account.received) : "—"}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-rose-700">
                      {account.paidOut > 0 ? fmt.format(account.paidOut) : "—"}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-3 text-right font-mono font-medium tabular-nums",
                        account.net > 0
                          ? "text-emerald-700"
                          : account.net < 0
                            ? "text-rose-700"
                            : "text-muted-foreground",
                      )}
                    >
                      {fmt.format(account.net)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {account.ledgerBalance != null
                        ? fmt.format(account.ledgerBalance)
                        : account.outstandingBalance != null &&
                            account.outstandingBalance > 0
                          ? `Deuda ${fmt.format(account.outstandingBalance)}`
                          : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
