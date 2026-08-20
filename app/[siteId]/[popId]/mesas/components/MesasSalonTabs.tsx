"use client"

import type { MesaSalon, MesaTableStatus } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { mesaStatusLabel } from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import { mesasSalonStatusCountPillClass } from "@/app/[siteId]/[popId]/mesas/mesasOperarStyles"
import {
  OperarCanvasToolbarTab,
  OperarCanvasToolbarTabs,
} from "@/components/sale-operation/OperarCanvasToolbar"
import {
  operarCanvasToolbarCountPillBaseClass,
  operarCanvasToolbarCountPillWideClass,
} from "@/components/sale-operation/operarCanvasToolbarStyles"
import { cn } from "@/lib/utils"

export type MesasSalonStatusCounts = {
  free: number
  open: number
  paying: number
  reserved: number
}

const SALON_STATUS_ORDER: MesaTableStatus[] = [
  "free",
  "open",
  "paying",
  "reserved",
]

type Props = {
  salons: MesaSalon[]
  activeSalonId: string
  onChange: (salonId: string) => void
  tableCounts: Record<string, MesasSalonStatusCounts>
  loading?: boolean
}

function statusCountLabel(status: MesaTableStatus, count: number): string {
  const noun = count === 1 ? "mesa" : "mesas"
  const adjective = mesaStatusLabel(status).toLowerCase()
  const plural =
    count === 1
      ? adjective
      : adjective.endsWith("a")
        ? `${adjective}s`
        : adjective
  return `${count} ${noun} ${plural}`
}

function salonCountsSummary(counts: MesasSalonStatusCounts): string {
  return SALON_STATUS_ORDER.filter((status) => counts[status] > 0)
    .map((status) => statusCountLabel(status, counts[status]))
    .join(". ")
}

function MesasSalonStatusPill({
  status,
  value,
}: {
  status: MesaTableStatus
  value: number
}) {
  const label = statusCountLabel(status, value)

  return (
    <span
      className={cn(
        operarCanvasToolbarCountPillBaseClass,
        String(value).length > 1 && operarCanvasToolbarCountPillWideClass,
        mesasSalonStatusCountPillClass(status),
      )}
      aria-label={label}
      title={label}
    >
      {value}
    </span>
  )
}

export function MesasSalonTabs({
  salons,
  activeSalonId,
  onChange,
  tableCounts,
  loading = false,
}: Props) {
  const sorted = [...salons].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <OperarCanvasToolbarTabs
      value={activeSalonId}
      ariaLabel="Salones"
    >
      {sorted.map((salon) => {
        const active = salon.id === activeSalonId
        const counts = tableCounts[salon.id] ?? {
          free: 0,
          open: 0,
          paying: 0,
          reserved: 0,
        }
        const summary = salonCountsSummary(counts)

        return (
          <OperarCanvasToolbarTab
            key={salon.id}
            tabId={salon.id}
            active={active}
            onClick={() => onChange(salon.id)}
            ariaLabel={
              loading || !summary ? salon.name : `${salon.name}. ${summary}`
            }
          >
            <span className="flex min-w-0 max-w-full items-center justify-center gap-1.5">
              <span className="truncate">{salon.name}</span>
              {!loading ? (
                <span className="flex shrink-0 items-center gap-1" aria-hidden>
                  {SALON_STATUS_ORDER.map((status) =>
                    counts[status] > 0 ? (
                      <MesasSalonStatusPill
                        key={status}
                        status={status}
                        value={counts[status]}
                      />
                    ) : null,
                  )}
                </span>
              ) : null}
            </span>
          </OperarCanvasToolbarTab>
        )
      })}
    </OperarCanvasToolbarTabs>
  )
}
