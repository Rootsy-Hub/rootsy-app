"use client"

import type { MesaSalon } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import {
  OperarCanvasToolbarCountPill,
  OperarCanvasToolbarTab,
  OperarCanvasToolbarTabs,
} from "@/components/sale-operation/OperarCanvasToolbar"

type Props = {
  salons: MesaSalon[]
  activeSalonId: string
  onChange: (salonId: string) => void
  tableCounts: Record<string, { total: number; open: number }>
  loading?: boolean
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
        const counts = tableCounts[salon.id] ?? { total: 0, open: 0 }
        const openLabel = `${counts.open} mesa${counts.open === 1 ? "" : "s"} abierta${counts.open === 1 ? "" : "s"}`
        const totalLabel = `${counts.total} mesa${counts.total === 1 ? "" : "s"} en total`

        return (
          <OperarCanvasToolbarTab
            key={salon.id}
            tabId={salon.id}
            active={active}
            onClick={() => onChange(salon.id)}
            ariaLabel={
              loading
                ? salon.name
                : `${salon.name}. ${counts.open > 0 ? `${openLabel}. ` : ""}${totalLabel}`
            }
          >
            <span className="flex min-w-0 max-w-full items-center justify-center gap-1.5">
              <span className="truncate">{salon.name}</span>
              {!loading ? (
                <span className="flex shrink-0 items-center gap-1" aria-hidden>
                  {counts.open > 0 ? (
                    <OperarCanvasToolbarCountPill
                      value={counts.open}
                      variant="open"
                      active={active}
                      label={openLabel}
                    />
                  ) : null}
                  <OperarCanvasToolbarCountPill
                    value={counts.total}
                    variant="total"
                    active={active}
                    label={totalLabel}
                  />
                </span>
              ) : null}
            </span>
          </OperarCanvasToolbarTab>
        )
      })}
    </OperarCanvasToolbarTabs>
  )
}
