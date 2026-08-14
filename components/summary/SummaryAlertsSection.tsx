"use client"

import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
import type { SummaryAlertItem } from "@/app/[siteId]/[popId]/summary/actions"
import { cn } from "@/lib/utils"
import { AlertTriangle, Bell, Info } from "lucide-react"

const severityStyles = {
  warning: "text-amber-700 bg-amber-50 border-amber-200/80",
  danger: "text-red-700 bg-red-50 border-red-200/80",
  info: "text-[var(--rootsy-bruma-700)] bg-[var(--rootsy-bruma-50)] border-[var(--rootsy-bruma-200)]",
} as const

function AlertIcon({ severity }: { severity: SummaryAlertItem["severity"] }) {
  if (severity === "danger") return <AlertTriangle className="size-4 shrink-0" />
  if (severity === "warning") return <Bell className="size-4 shrink-0" />
  return <Info className="size-4 shrink-0" />
}

export function SummaryAlertsSection({
  alerts,
  loading,
}: {
  alerts: SummaryAlertItem[]
  loading?: boolean
}) {
  const placeholderAlerts: SummaryAlertItem[] = [
    { label: "Vencimientos", value: "—", severity: "info" },
    { label: "Cuentas por cobrar vencidas", value: "—", severity: "info" },
    { label: "Cuentas por pagar vencidas", value: "—", severity: "info" },
    { label: "Cheques próximos a vencer", value: "—", severity: "info" },
    { label: "Servicios vencidos", value: "—", severity: "info" },
    { label: "Diferencias de caja", value: "—", severity: "info" },
  ]

  const merged = [
    ...alerts,
    ...placeholderAlerts.filter(
      (p) => !alerts.some((a) => a.label === p.label),
    ),
  ]

  return (
    <div className={cn(dataWorkspaceShellCard, "p-4 sm:p-5")}>
      <h2 className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
        Alertas y pendientes
      </h2>
      <p className="mt-0.5 text-[11px] text-[var(--rootsy-bruma-500)]">
        Acciones que requieren atención
      </p>

      {loading ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="h-12 animate-pulse rounded-xl bg-[var(--rootsy-bruma-50)]"
            />
          ))}
        </ul>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {merged.map((alert) => (
            <li
              key={alert.label}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5",
                severityStyles[alert.severity],
              )}
            >
              <span className="flex min-w-0 items-center gap-2 text-xs font-medium">
                <AlertIcon severity={alert.severity} />
                <span className="truncate">{alert.label}</span>
              </span>
              <span className="shrink-0 font-numeric text-xs font-semibold tabular-nums">
                {alert.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
