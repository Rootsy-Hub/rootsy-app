"use client"

import {
  dataWorkspaceEntityCardLosetaSurfaceClass,
  workspaceTableNatureStockWarningClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function ProgressTrack({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-rootsy-bruma-100">
      <div
        className="h-full rounded-full bg-[var(--rootsy-savia-600)] transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

type Props = {
  totalDue: number
  totalPaid: number
}

export function ExpenseSummaryDashboard({ totalDue, totalPaid }: Props) {
  const pendingAmount = Math.max(0, roundMoney(totalDue - totalPaid))
  const progressPct =
    totalDue > 0
      ? Math.min(100, Math.round((totalPaid / totalDue) * 1000) / 10)
      : 0

  return (
    <article
      className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto px-5 py-4")}
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-canopy text-sm font-semibold text-rootsy-bruma-900">
            Cuánto ya salió
          </h3>
          <p className="font-canopy text-[11px] text-rootsy-bruma-500">
            De todo lo comprometido este mes. Un pago de otro mes también cuenta
            acá.
          </p>
        </div>
        <span className="font-numeric text-lg font-semibold tabular-nums text-[var(--rootsy-savia-700)]">
          {progressPct}%
        </span>
      </div>

      <ProgressTrack pct={progressPct} />

      <p className="mt-3 font-canopy text-xs text-rootsy-bruma-500">
        <span className="font-numeric tabular-nums text-[var(--rootsy-savia-700)]">
          {fmt.format(totalPaid)}
        </span>
        {" pagado"}
        {" · "}
        <span
          className={cn(
            "font-numeric tabular-nums",
            pendingAmount > 0 && workspaceTableNatureStockWarningClass,
          )}
        >
          {fmt.format(pendingAmount)}
        </span>
        {" pendiente"}
      </p>
    </article>
  )
}
