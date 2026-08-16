"use client"

import type { StatisticsSunburstNode } from "@/app/[siteId]/[popId]/statistics/actions"
import { dataWorkspaceBlocksSkeletonTone } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  statisticsChartAreaClass,
  statisticsEmptyTextClass,
  statisticsLosetaCardBodyClass,
  statisticsLosetaCardClass,
  statisticsSectionHeadingClassNames,
} from "@/components/statistics/statisticsWorkspaceStyles"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"

const SIZE = 360
const CENTER = SIZE / 2
const CENTER_RADIUS = 52
const RING_WIDTH = 34
const MIN_SLICE_DEGREES = 0.35

const KIND_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

type SunburstArc = {
  id: string
  label: string
  value: number
  depth: 0 | 1 | 2
  path: string
  color: string
  percentOfTotal: number
  parentLabel?: string
}

function polarPoint(radius: number, degrees: number) {
  const radians = ((degrees - 90) * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  }
}

function arcPath(
  innerRadius: number,
  outerRadius: number,
  startDegrees: number,
  endDegrees: number,
) {
  const span = endDegrees - startDegrees
  if (span <= 0) return ""
  if (span >= 359.999) {
    endDegrees = startDegrees + 359.999
  }

  const largeArc = endDegrees - startDegrees > 180 ? 1 : 0
  const startOuter = polarPoint(outerRadius, startDegrees)
  const endOuter = polarPoint(outerRadius, endDegrees)
  const startInner = polarPoint(innerRadius, endDegrees)
  const endInner = polarPoint(innerRadius, startDegrees)

  return [
    `M ${startOuter.x.toFixed(2)} ${startOuter.y.toFixed(2)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endOuter.x.toFixed(2)} ${endOuter.y.toFixed(2)}`,
    `L ${startInner.x.toFixed(2)} ${startInner.y.toFixed(2)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${endInner.x.toFixed(2)} ${endInner.y.toFixed(2)}`,
    "Z",
  ].join(" ")
}

function mixColor(baseIndex: number, mix: number) {
  const palette = KIND_COLORS
  const base = palette[baseIndex % palette.length]
  const fallback = palette[(baseIndex + 1) % palette.length]
  return `color-mix(in srgb, ${base} ${100 - mix}%, ${fallback} ${mix}%)`
}

function flattenSunburst(
  root: StatisticsSunburstNode,
  totalValue: number,
): SunburstArc[] {
  const arcs: SunburstArc[] = []

  const walk = (
    node: StatisticsSunburstNode,
    startDegrees: number,
    endDegrees: number,
    depth: 0 | 1 | 2,
    kindColorIndex: number,
    childIndex = 0,
    parentLabel?: string,
  ) => {
    const span = endDegrees - startDegrees
    if (span < MIN_SLICE_DEGREES) return

    const innerRadius = CENTER_RADIUS + depth * RING_WIDTH
    const outerRadius = innerRadius + RING_WIDTH
    const path = arcPath(innerRadius, outerRadius, startDegrees, endDegrees)
    if (!path) return

    arcs.push({
      id: node.id,
      label: node.label,
      value: node.value,
      depth,
      path,
      color:
        depth === 0
          ? KIND_COLORS[kindColorIndex % KIND_COLORS.length]
          : depth === 1
            ? mixColor(kindColorIndex, 18 + childIndex * 10)
            : mixColor(kindColorIndex, 42 + childIndex * 8),
      percentOfTotal: totalValue > 0 ? (node.value / totalValue) * 100 : 0,
      parentLabel,
    })

    const children = node.children ?? []
    if (depth >= 2 || children.length === 0) return

    const childTotal = children.reduce((acc, child) => acc + child.value, 0)
    if (childTotal <= 0) return

    let cursor = startDegrees
    children.forEach((child, index) => {
      const childSpan = (child.value / childTotal) * span
      const childEnd = cursor + childSpan
      walk(
        child,
        cursor,
        childEnd,
        (depth + 1) as 1 | 2,
        kindColorIndex,
        index,
        node.label,
      )
      cursor = childEnd
    })
  }

  const kindNodes = root.children ?? []
  const kindTotal = kindNodes.reduce((acc, node) => acc + node.value, 0)
  if (kindTotal <= 0) return arcs

  let cursor = 0
  kindNodes.forEach((kindNode, index) => {
    const span = (kindNode.value / kindTotal) * 360
    const end = cursor + span
    walk(kindNode, cursor, end, 0, index)
    cursor = end
  })

  return arcs
}

export function StatisticsInventoryValueSunburstChart({
  title,
  description,
  root,
  loading,
  emptyMessage = "Sin artículos valorizados en este período",
}: {
  title: string
  description?: string
  root: StatisticsSunburstNode | null | undefined
  loading?: boolean
  emptyMessage?: string
}) {
  const { title: titleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()
  const [activeArcId, setActiveArcId] = useState<string | null>(null)

  const arcs = useMemo(
    () => (root ? flattenSunburst(root, root.value) : []),
    [root],
  )
  const activeArc = arcs.find((arc) => arc.id === activeArcId) ?? null

  return (
    <div
      className={cn(
        statisticsLosetaCardClass,
        statisticsLosetaCardBodyClass,
        "flex h-full w-full flex-col",
      )}
    >
      <div>
        <h3 className={titleClass}>{title}</h3>
        {description ? <p className={descriptionClass}>{description}</p> : null}
      </div>
      {loading ? (
        <div
          className={cn(
            statisticsChartAreaClass,
            "min-h-[360px] rounded-xl",
            dataWorkspaceBlocksSkeletonTone.box,
          )}
        />
      ) : root && arcs.length > 0 ? (
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative w-full max-w-[360px]">
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="mx-auto h-auto w-full max-w-[360px] overflow-visible"
              role="img"
              aria-label={`${title}. Total ${formatReportMoneyAr(root.value)}`}
            >
              {arcs.map((arc) => {
                const isActive = activeArcId === arc.id
                return (
                  <path
                    key={arc.id}
                    d={arc.path}
                    fill={arc.color}
                    stroke="white"
                    strokeWidth={1.25}
                    className={cn(
                      "cursor-pointer transition-opacity",
                      activeArcId && !isActive ? "opacity-45" : "opacity-100",
                    )}
                    onMouseEnter={() => setActiveArcId(arc.id)}
                    onMouseLeave={() => setActiveArcId(null)}
                    onFocus={() => setActiveArcId(arc.id)}
                    onBlur={() => setActiveArcId(null)}
                  />
                )
              })}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={CENTER_RADIUS - 2}
                fill="white"
                stroke="var(--rootsy-bruma-200)"
                strokeWidth={1}
              />
              <text
                x={CENTER}
                y={CENTER - 8}
                textAnchor="middle"
                className="fill-rootsy-bruma-500 text-[10px] font-medium uppercase tracking-[0.12em]"
              >
                Total
              </text>
              <text
                x={CENTER}
                y={CENTER + 12}
                textAnchor="middle"
                className="fill-rootsy-bruma-900 font-numeric text-[13px] font-semibold tabular-nums"
              >
                {formatReportMoneyAr(root.value)}
              </text>
            </svg>
            {activeArc ? (
              <div className="pointer-events-none absolute left-1/2 top-3 z-10 w-[min(240px,calc(100%-1rem))] -translate-x-1/2 rounded-xl border border-rootsy-bruma-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
                <p className="truncate font-medium text-rootsy-bruma-900">
                  {activeArc.label}
                </p>
                {activeArc.parentLabel ? (
                  <p className="truncate text-rootsy-bruma-500">
                    {activeArc.parentLabel}
                  </p>
                ) : null}
                <p className="mt-1 font-numeric tabular-nums text-rootsy-bruma-800">
                  {formatReportMoneyAr(activeArc.value)}
                  <span className="ml-1.5 text-rootsy-bruma-500">
                    (
                    {activeArc.percentOfTotal.toLocaleString("es-AR", {
                      maximumFractionDigits: 1,
                    })}
                    %)
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <p
          className={cn(
            statisticsEmptyTextClass,
            statisticsChartAreaClass,
            "flex min-h-[360px] items-center justify-center text-center",
          )}
        >
          {emptyMessage}
        </p>
      )}
    </div>
  )
}
