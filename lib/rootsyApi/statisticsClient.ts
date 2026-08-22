import type { StatisticsSectionData } from "@/app/[siteId]/[popId]/statistics/actions"
import {
  statisticsSectionById,
  type StatisticsSectionId,
} from "@/lib/statisticsCatalog"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

export type StatisticsSectionQuery = {
  from: string | null
  to: string | null
  prevFrom: string | null
  prevTo: string | null
  channel?: string | null
  supplier?: string | null
}

const COMING_SOON_UNAVAILABLE: Partial<Record<StatisticsSectionId, string[]>> = {
  services: [
    "Servicios vendidos",
    "Servicios activos / vencidos",
    "Tipos de servicio",
    "Evolución de facturación",
  ],
  manufacturing: [
    "Cantidad fabricada",
    "Costos de producción",
    "Consumo de insumos",
    "Órdenes por producto",
  ],
}

export function isComingSoonStatisticsSection(
  sectionId: StatisticsSectionId,
): boolean {
  return sectionId === "services" || sectionId === "manufacturing"
}

export function buildComingSoonStatisticsSection(
  sectionId: StatisticsSectionId,
): StatisticsSectionData {
  const meta = statisticsSectionById(sectionId)
  return {
    sectionId,
    title: meta?.label ?? sectionId,
    description: meta?.description ?? "",
    comparison: [],
    evolution: [],
    hourlyEvolution: [],
    hourlyHeatmap: { days: [], hours: [], cells: [], maxValue: 0 },
    segments: [],
    rankings: [],
    unavailable: COMING_SOON_UNAVAILABLE[sectionId] ?? ["Datos no disponibles"],
  }
}

function sectionSearch(query: StatisticsSectionQuery): string {
  const params = new URLSearchParams()
  if (query.from) params.set("from", query.from)
  if (query.to) params.set("to", query.to)
  if (query.prevFrom) params.set("prevFrom", query.prevFrom)
  if (query.prevTo) params.set("prevTo", query.prevTo)
  if (query.channel) params.set("channel", query.channel)
  if (query.supplier) params.set("supplier", query.supplier)
  return params.toString()
}

async function getJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const res = await fetch(path, {
    headers: { accept: "application/json" },
    signal,
  })
  const json = (await res.json().catch(() => null)) as ApiOk<T> | ApiErr | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, data: json.data }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchStatisticsSectionSummary(
  popId: string,
  sectionId: StatisticsSectionId,
  query: StatisticsSectionQuery,
  signal?: AbortSignal,
): Promise<
  | { success: true; data: StatisticsSectionData }
  | { success: false; error: string }
> {
  return getJson<StatisticsSectionData>(
    `/api/pops/${popId}/statistics/${sectionId}/summary?${sectionSearch(query)}`,
    signal,
  )
}

export async function fetchStatisticsSectionDetails(
  popId: string,
  sectionId: StatisticsSectionId,
  query: StatisticsSectionQuery,
  signal?: AbortSignal,
): Promise<
  | { success: true; data: StatisticsSectionData }
  | { success: false; error: string }
> {
  return getJson<StatisticsSectionData>(
    `/api/pops/${popId}/statistics/${sectionId}/details?${sectionSearch(query)}`,
    signal,
  )
}

export function mergeStatisticsSectionData(
  summary: StatisticsSectionData,
  details: StatisticsSectionData,
): StatisticsSectionData {
  return {
    ...summary,
    ...details,
    comparison: summary.comparison.length ? summary.comparison : details.comparison,
    efficiencyRatios: summary.efficiencyRatios ?? details.efficiencyRatios,
    resultWaterfall: summary.resultWaterfall ?? details.resultWaterfall,
    segments: details.segments.length ? details.segments : summary.segments,
    operationalDayCloseTime:
      summary.operationalDayCloseTime ?? details.operationalDayCloseTime,
    commitmentMetrics: [
      ...(summary.commitmentMetrics ?? []),
      ...(details.commitmentMetrics ?? []),
    ],
    unavailable: details.unavailable.length
      ? details.unavailable
      : summary.unavailable,
  }
}
