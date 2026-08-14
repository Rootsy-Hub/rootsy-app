"use client"

import { SummaryPeriodToolbar } from "@/components/summary/SummaryPeriodToolbar"
import type { StatisticsFilters } from "@/app/[siteId]/[popId]/statistics/actions"
import {
  dataWorkspaceShellCard,
  dataWorkspaceEntityCardStatLabelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import type { SummaryDatePreset } from "@/lib/summaryDateFilter"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

const CHANNEL_OPTIONS = ["POS", "Mostrador", "Mesas"]

export function StatisticsFiltersToolbar({
  preset,
  customRange,
  bounds,
  compareEnabled,
  filters,
  onPresetChange,
  onCustomRangeChange,
  onCompareEnabledChange,
  onFiltersChange,
}: {
  preset: SummaryDatePreset
  customRange: DateRange | undefined
  bounds: { from: string | null; to: string | null }
  compareEnabled: boolean
  filters: StatisticsFilters
  onPresetChange: (preset: SummaryDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  onCompareEnabledChange: (value: boolean) => void
  onFiltersChange: (filters: StatisticsFilters) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <SummaryPeriodToolbar
        preset={preset}
        customRange={customRange}
        onPresetChange={onPresetChange}
        onCustomRangeChange={onCustomRangeChange}
        bounds={bounds}
      />

      <div className={cn(dataWorkspaceShellCard, "p-4 sm:p-5")}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={dataWorkspaceEntityCardStatLabelClass}>Comparación</p>
            <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--rootsy-bruma-900)]">
              <input
                type="checkbox"
                checked={compareEnabled}
                onChange={(e) => onCompareEnabledChange(e.target.checked)}
                className="size-4 rounded border-[var(--rootsy-bruma-300)] text-[var(--rootsy-savia-600)] focus:ring-[var(--rootsy-savia-400)]"
              />
              Comparar con período anterior
            </label>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <RootsFormSelectField
              label="Canal"
              value={filters.channel ?? "all"}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  channel: value === "all" ? null : value,
                })
              }
            >
              <RootsFormSelectItem value="all">Todos</RootsFormSelectItem>
              {CHANNEL_OPTIONS.map((option) => (
                <RootsFormSelectItem key={option} value={option}>
                  {option}
                </RootsFormSelectItem>
              ))}
            </RootsFormSelectField>

            {[
              { key: "seller", label: "Vendedor" },
              { key: "client", label: "Cliente" },
              { key: "supplier", label: "Proveedor" },
              { key: "product", label: "Producto" },
              { key: "category", label: "Categoría" },
              { key: "paymentMethod", label: "Medio de pago" },
            ].map((field) => (
              <RootsFormSelectField
                key={field.key}
                label={field.label}
                value="all"
                disabled
                placeholder="Próximamente"
                onValueChange={() => {}}
              >
                <RootsFormSelectItem value="all">Próximamente</RootsFormSelectItem>
              </RootsFormSelectField>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
