"use client"

import {
  dataWorkspaceBlocksSkeletonTone,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  statisticsEmptyTextClass,
  statisticsLosetaCardBodyClass,
  statisticsLosetaCardClass,
  statisticsSectionHeadingClassNames,
} from "@/components/statistics/statisticsWorkspaceStyles"
import type { StatisticsHourlyHeatmap } from "@/app/[siteId]/[popId]/statistics/actions"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"

const CELL_HEIGHT_PX = 8
const CELL_GAP_PX = 2
const GRID_HEIGHT_PX = 24 * CELL_HEIGHT_PX + 23 * CELL_GAP_PX

function formatHeatmapValue(
  value: number,
  valueFormat: "money" | "number",
): string {
  if (valueFormat === "money") return formatReportMoneyAr(value)
  return value.toLocaleString("es-AR")
}

function heatmapCellBackground(value: number, maxValue: number): string {
  if (value <= 0 || maxValue <= 0) {
    return "var(--rootsy-bruma-50)"
  }
  const ratio = value / maxValue
  const mix = Math.round(12 + ratio * 88)
  return `color-mix(in srgb, var(--chart-1) ${mix}%, var(--rootsy-bruma-50))`
}

type HoveredCell = {
  dayLabel: string
  hourLabel: string
  value: number
}

export function StatisticsHourlyHeatmap({
  title = "Mapa horario",
  description,
  heatmap,
  loading,
  valueFormat = "money",
  hourLabelInterval = 2,
  emptyMessage = "Sin ventas por hora en este período",
}: {
  title?: string
  description?: string
  heatmap: StatisticsHourlyHeatmap
  loading?: boolean
  valueFormat?: "money" | "number"
  hourLabelInterval?: number
  emptyMessage?: string
}) {
  const [hovered, setHovered] = useState<HoveredCell | null>(null)
  const { title: titleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()

  const cellValues = useMemo(() => {
    const map = new Map<string, number>()
    for (const cell of heatmap.cells) {
      map.set(`${cell.dayKey}-${cell.hourSlot}`, cell.value)
    }
    return map
  }, [heatmap.cells])

  const hasData = heatmap.cells.some((cell) => cell.value > 0)
  const dayLabelEvery = Math.max(
    1,
    Math.ceil(heatmap.days.length / 10),
  )
  const hourLabelEvery = hourLabelInterval + 1
  const minGridWidth = Math.max(heatmap.days.length * 12, 120)

  return (
    <div
      className={cn(
        statisticsLosetaCardClass,
        statisticsLosetaCardBodyClass,
        "flex h-full flex-col overflow-visible",
      )}
    >
      <div>
        <h3 className={titleClass}>{title}</h3>
        {description ? <p className={descriptionClass}>{description}</p> : null}
      </div>

      {loading ? (
        <div
          className={cn(
            "mt-4 min-h-[220px] rounded-xl",
            dataWorkspaceBlocksSkeletonTone.box,
          )}
        />
      ) : hasData ? (
        <div className="relative mt-4 min-h-[220px]">
          <div className="flex gap-2">
            <div
              className="grid w-9 shrink-0 gap-[2px] font-numeric tabular-nums"
              style={{
                gridTemplateRows: `repeat(24, ${CELL_HEIGHT_PX}px)`,
                height: GRID_HEIGHT_PX,
              }}
              aria-hidden
            >
              {heatmap.hours.map((hour, index) => (
                <span
                  key={hour.slot}
                  className={cn(
                    "self-center text-[10px] leading-none text-rootsy-bruma-500",
                    index % hourLabelEvery !== 0 && "opacity-0",
                  )}
                >
                  {hour.label}
                </span>
              ))}
            </div>

            <div className="min-w-0 flex-1 overflow-x-auto pb-1">
              <div
                className="grid gap-[2px]"
                style={{
                  gridTemplateColumns: `repeat(${heatmap.days.length}, minmax(10px, 1fr))`,
                  gridTemplateRows: `repeat(24, ${CELL_HEIGHT_PX}px)`,
                  minWidth: minGridWidth,
                  height: GRID_HEIGHT_PX,
                }}
                role="grid"
                aria-label="Mapa de calor de ventas por día y hora"
              >
                {heatmap.hours.map((hour) =>
                  heatmap.days.map((day) => {
                    const value =
                      cellValues.get(`${day.key}-${hour.slot}`) ?? 0
                    return (
                      <button
                        key={`${day.key}-${hour.slot}`}
                        type="button"
                        role="gridcell"
                        className={cn(
                          "rounded-[2px] border-0 p-0 transition-shadow",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rootsy-savia-600",
                          hovered?.dayLabel === day.label &&
                            hovered?.hourLabel === hour.label &&
                            "ring-1 ring-rootsy-savia-700",
                        )}
                        style={{
                          backgroundColor: heatmapCellBackground(
                            value,
                            heatmap.maxValue,
                          ),
                        }}
                        aria-label={`${day.label} ${hour.label}: ${formatHeatmapValue(value, valueFormat)}`}
                        onMouseEnter={() =>
                          setHovered({
                            dayLabel: day.label,
                            hourLabel: hour.label,
                            value,
                          })
                        }
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() =>
                          setHovered({
                            dayLabel: day.label,
                            hourLabel: hour.label,
                            value,
                          })
                        }
                        onBlur={() => setHovered(null)}
                      />
                    )
                  }),
                )}
              </div>

              <div
                className="mt-1.5 grid gap-[2px] font-numeric tabular-nums"
                style={{
                  gridTemplateColumns: `repeat(${heatmap.days.length}, minmax(10px, 1fr))`,
                  minWidth: minGridWidth,
                }}
                aria-hidden
              >
                {heatmap.days.map((day, index) => (
                  <span
                    key={day.key}
                    className={cn(
                      "text-center text-[10px] text-rootsy-bruma-500",
                      index % dayLabelEvery !== 0 && "opacity-0",
                    )}
                  >
                    {day.label.slice(0, 2)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {hovered ? (
            <div
              className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-lg border border-rootsy-bruma-100 bg-white px-2.5 py-1.5 text-xs shadow-sm"
              role="status"
            >
              <p className="font-medium text-rootsy-bruma-900">
                {hovered.dayLabel} · {hovered.hourLabel}
              </p>
              <p className="font-numeric tabular-nums text-rootsy-bruma-600">
                {formatHeatmapValue(hovered.value, valueFormat)}
              </p>
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-rootsy-bruma-500">
            <span>Menos</span>
            <div
              className="h-2 w-20 rounded-full"
              style={{
                background:
                  "linear-gradient(to right, var(--rootsy-bruma-50), var(--chart-1))",
              }}
              aria-hidden
            />
            <span>Más</span>
          </div>
        </div>
      ) : (
        <p
          className={cn(
            statisticsEmptyTextClass,
            "mt-4 flex min-h-[220px] items-center justify-center text-center",
          )}
        >
          {emptyMessage}
        </p>
      )}
    </div>
  )
}
