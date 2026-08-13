"use client"

import type { ActiveServicesStats } from "@/app/[siteId]/[popId]/active-services/actions"
import {
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueClass,
  dataWorkspaceShellCard,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  ACTIVE_SERVICES_VIEW_FILTER_LABELS,
  type ActiveServicesViewFilter,
} from "@/lib/serviceChargeTypes"
import { cn } from "@/lib/utils"

const shellCard = dataWorkspaceShellCard

type Props = {
  stats: ActiveServicesStats
  activeFilter: ActiveServicesViewFilter
  onFilterChange: (filter: ActiveServicesViewFilter) => void
}

const KPI_CONFIG: {
  filter: ActiveServicesViewFilter
  valueKey: keyof ActiveServicesStats
}[] = [
  { filter: "clients", valueKey: "activeClients" },
  { filter: "active", valueKey: "activeCharges" },
  { filter: "overdue", valueKey: "overdueCharges" },
  { filter: "cancelled", valueKey: "cancelledCharges" },
]

export function ActiveServicesKpiCards({
  stats,
  activeFilter,
  onFilterChange,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {KPI_CONFIG.map(({ filter, valueKey }) => {
        const selected = activeFilter === filter
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onFilterChange(filter)}
            className={cn(
              shellCard,
              "px-5 py-4 text-left transition-all",
              selected
                ? "ring-2 ring-[var(--rootsy-savia-500)] ring-offset-2 ring-offset-[var(--rootsy-bruma-50)]"
                : "hover:border-[var(--rootsy-savia-300)]",
            )}
          >
            <p className={dataWorkspaceEntityCardStatLabelClass}>
              {ACTIVE_SERVICES_VIEW_FILTER_LABELS[filter]}
            </p>
            <p
              className={cn(
                "mt-2 text-3xl",
                dataWorkspaceEntityCardStatValueClass,
              )}
            >
              {stats[valueKey].toLocaleString("es-AR")}
            </p>
          </button>
        )
      })}
    </div>
  )
}
