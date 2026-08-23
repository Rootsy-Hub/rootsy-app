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
import { useMemo, useRef, useState } from "react"

function shortWeekdayLabel(label: string): string {
  const trimmed = label.trim()
  if (trimmed.length <= 3) return trimmed
  return trimmed.slice(0, 3)
}

const CELL_HEIGHT_PX = 10
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
  x: number
  y: number
  placement: "above" | "below"
}

function positionTooltip(
  container: HTMLDivElement,
  target: HTMLElement,
): Pick<HoveredCell, "x" | "y" | "placement"> {
  const containerRect = container.getBoundingClientRect()
  const cellRect = target.getBoundingClientRect()
  const x = cellRect.left + cellRect.width / 2 - containerRect.left
  const y = cellRect.top - containerRect.top
  const placement = y < 48 ? "below" : "above"
  return { x, y: placement === "above" ? y : y + cellRect.height, placement }
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
  const chartRef = useRef<HTMLDivElement>(null)
  const { title: titleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()

  function setHoveredCell(
    target: HTMLElement,
    cell: { dayLabel: string; hourLabel: string; value: number },
  ) {
    const container = chartRef.current
    if (!container) return
    setHovered({
      ...cell,
      ...positionTooltip(container, target),
    })
  }

  const cellValues = useMemo(() => {
    const map = new Map<string, number>()
    for (const cell of heatmap.cells) {
      map.set(`${cell.dayKey}-${cell.hourSlot}`, cell.value)
    }
    return map
  }, [heatmap.cells])

  const hasData = heatmap.cells.some((cell) => cell.value > 0)
  const hourLabelEvery = hourLabelInterval + 1

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
        <div className="relative mt-4" ref={chartRef}>
          <div className="flex gap-2 sm:gap-3">
            <div
              className="grid w-7 shrink-0 gap-0.5 font-numeric tabular-nums sm:w-9"
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

            <div className="min-w-0 flex-1">
              <div
                className="grid gap-0.5"
                style={{
                  gridTemplateColumns: `repeat(${heatmap.days.length}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(24, ${CELL_HEIGHT_PX}px)`,
                  height: GRID_HEIGHT_PX,
                }}
                role="grid"
                aria-label="Mapa de calor de ventas por día de la semana y hora"
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
                          "min-h-0 rounded-[3px] border-0 p-0 transition-shadow",
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
                        onMouseEnter={(event) =>
                          setHoveredCell(event.currentTarget, {
                            dayLabel: day.label,
                            hourLabel: hour.label,
                            value,
                          })
                        }
                        onMouseLeave={() => setHovered(null)}
                        onFocus={(event) =>
                          setHoveredCell(event.currentTarget, {
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
                className="mt-2 grid gap-0.5 font-numeric tabular-nums"
                style={{
                  gridTemplateColumns: `repeat(${heatmap.days.length}, minmax(0, 1fr))`,
                }}
                aria-hidden
              >
                {heatmap.days.map((day) => (
                  <span
                    key={day.key}
                    className="truncate text-center text-[10px] text-rootsy-bruma-600 sm:text-xs"
                    title={day.label}
                  >
                    <span className="sm:hidden">
                      {shortWeekdayLabel(day.label)}
                    </span>
                    <span className="hidden sm:inline">{day.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {hovered ? (
            <div
              className="pointer-events-none absolute z-10 rounded-lg border border-rootsy-bruma-100 bg-white px-2.5 py-1.5 text-xs shadow-sm"
              style={{
                left: hovered.x,
                top: hovered.y,
                transform:
                  hovered.placement === "above"
                    ? "translate(-50%, calc(-100% - 8px))"
                    : "translate(-50%, 8px)",
              }}
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
