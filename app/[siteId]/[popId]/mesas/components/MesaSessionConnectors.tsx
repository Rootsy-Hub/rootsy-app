"use client"

import type { MesaTable } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { mesaTableDimensions } from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import { useMemo } from "react"

type Point = { id: string; cx: number; cy: number; status: MesaTable["status"] }

type Edge = {
  x1: number
  y1: number
  x2: number
  y2: number
  status: MesaTable["status"]
  highlighted: boolean
}

function tableCenter(table: MesaTable): Point {
  const { width, height } = mesaTableDimensions(table.shape)
  return {
    id: table.id,
    cx: table.x + width / 2,
    cy: table.y + height / 2,
    status: table.status,
  }
}

function dist(a: Point, b: Point) {
  return Math.hypot(a.cx - b.cx, a.cy - b.cy)
}

/** Árbol mínimo para unir todas las mesas del grupo con el menor total de conectores. */
function buildEdges(points: Point[]): Edge[] {
  if (points.length < 2) return []

  const inTree = new Set([points[0].id])
  const remaining = new Set(points.slice(1).map((p) => p.id))
  const byId = Object.fromEntries(points.map((p) => [p.id, p])) as Record<
    string,
    Point
  >
  const pairs: Array<[string, string]> = []

  while (remaining.size > 0) {
    let bestFrom = ""
    let bestTo = ""
    let bestDist = Infinity

    for (const fromId of inTree) {
      for (const toId of remaining) {
        const d = dist(byId[fromId], byId[toId])
        if (d < bestDist) {
          bestDist = d
          bestFrom = fromId
          bestTo = toId
        }
      }
    }

    if (!bestTo) break
    pairs.push([bestFrom, bestTo])
    inTree.add(bestTo)
    remaining.delete(bestTo)
  }

  const status = points[0].status
  return pairs.map(([a, b]) => ({
    x1: byId[a].cx,
    y1: byId[a].cy,
    x2: byId[b].cx,
    y2: byId[b].cy,
    status,
    highlighted: false,
  }))
}

function strokeForStatus(
  status: MesaTable["status"],
  highlighted: boolean,
): string {
  if (status === "paying") {
    return highlighted
      ? "color-mix(in srgb, var(--rootsy-savia-teal) 95%, white)"
      : "color-mix(in srgb, var(--rootsy-savia-teal) 55%, transparent)"
  }
  return highlighted
    ? "color-mix(in srgb, var(--rootsy-savia-400) 95%, white)"
    : "color-mix(in srgb, var(--rootsy-savia-400) 50%, transparent)"
}

type Props = {
  tables: MesaTable[]
  selectedTableIds: Set<string>
  width: number
  height: number
}

export function MesaSessionConnectors({
  tables,
  selectedTableIds,
  width,
  height,
}: Props) {
  const edges = useMemo(() => {
    const bySession = new Map<string, MesaTable[]>()
    for (const table of tables) {
      if (
        (table.status === "open" || table.status === "paying") &&
        table.sessionId
      ) {
        const group = bySession.get(table.sessionId) ?? []
        group.push(table)
        bySession.set(table.sessionId, group)
      }
    }

    const all: Edge[] = []
    for (const group of bySession.values()) {
      if (group.length < 2) continue
      const points = group.map(tableCenter)
      const groupHighlighted = group.some((t) => selectedTableIds.has(t.id))
      for (const edge of buildEdges(points)) {
        all.push({ ...edge, highlighted: groupHighlighted })
      }
    }
    return all
  }, [tables, selectedTableIds])

  if (edges.length === 0) return null

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[1]"
      width={width}
      height={height}
      aria-hidden
    >
      {edges.map((edge, i) => (
        <g key={i}>
          <line
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="rgba(0,0,0,0.35)"
            strokeWidth={6}
            strokeLinecap="round"
          />
          <line
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke={strokeForStatus(edge.status, edge.highlighted)}
            strokeWidth={edge.highlighted ? 3 : 2.5}
            strokeLinecap="round"
            strokeDasharray={edge.status === "paying" ? "6 4" : undefined}
          />
        </g>
      ))}
      {edges.map((edge, i) => {
        const mx = (edge.x1 + edge.x2) / 2
        const my = (edge.y1 + edge.y2) / 2
        return (
          <circle
            key={`dot-${i}`}
            cx={mx}
            cy={my}
            r={edge.highlighted ? 4 : 3}
            fill={strokeForStatus(edge.status, edge.highlighted)}
            opacity={0.9}
          />
        )
      })}
    </svg>
  )
}
