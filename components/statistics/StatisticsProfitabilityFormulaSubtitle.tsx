"use client"

import { statisticsSectionOperationalDayMetaClass } from "@/components/statistics/statisticsWorkspaceStyles"
import { Equal, Minus } from "lucide-react"

const formulaOperatorIconClass = "size-3.5 shrink-0 text-rootsy-bruma-500"

export function StatisticsProfitabilityFormulaSubtitle() {
  return (
    <div
      className={statisticsSectionOperationalDayMetaClass}
      aria-label="Ventas menos costos de ventas igual ganancia bruta menos gastos igual resultado neto"
    >
      <span>Ventas</span>
      <Minus className={formulaOperatorIconClass} aria-hidden />
      <span>Costos de ventas</span>
      <Equal className={formulaOperatorIconClass} aria-hidden />
      <span>Ganancia bruta</span>
      <Minus className={formulaOperatorIconClass} aria-hidden />
      <span>Gastos</span>
      <Equal className={formulaOperatorIconClass} aria-hidden />
      <span>Resultado neto</span>
    </div>
  )
}
