import "server-only"

import type { StatisticsSectionData } from "@/app/[siteId]/[popId]/statistics/actions"
import type { StatisticsSectionId } from "@/lib/statisticsCatalog"
import { rootsyApiFetch } from "@/lib/rootsyApi/server"
import {
  mergeStatisticsSectionData,
  type StatisticsSectionQuery,
} from "@/lib/rootsyApi/statisticsClient"

type ApiOk = { success: true; data: StatisticsSectionData }

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

export async function fetchStatisticsSectionSummaryServer(
  popId: string,
  sectionId: StatisticsSectionId,
  query: StatisticsSectionQuery,
): Promise<
  | { success: true; data: StatisticsSectionData }
  | { success: false; error: string }
> {
  try {
    const res = await rootsyApiFetch<ApiOk>(
      `/v1/pops/${popId}/statistics/${sectionId}/summary?${sectionSearch(query)}`,
    )
    if (!res.success) return { success: false, error: "No se pudo cargar el resumen." }
    return res
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

export async function fetchStatisticsSectionDetailsServer(
  popId: string,
  sectionId: StatisticsSectionId,
  query: StatisticsSectionQuery,
): Promise<
  | { success: true; data: StatisticsSectionData }
  | { success: false; error: string }
> {
  try {
    const res = await rootsyApiFetch<ApiOk>(
      `/v1/pops/${popId}/statistics/${sectionId}/details?${sectionSearch(query)}`,
    )
    if (!res.success) return { success: false, error: "No se pudieron cargar los detalles." }
    return res
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

export async function fetchStatisticsSectionMergedServer(
  popId: string,
  sectionId: StatisticsSectionId,
  query: StatisticsSectionQuery,
  parts: { summary?: boolean; details?: boolean } = {
    summary: true,
    details: true,
  },
): Promise<
  | { success: true; data: StatisticsSectionData }
  | { success: false; error: string }
> {
  const wantSummary = parts.summary !== false
  const wantDetails = parts.details !== false
  const [summaryRes, detailsRes] = await Promise.all([
    wantSummary
      ? fetchStatisticsSectionSummaryServer(popId, sectionId, query)
      : Promise.resolve(null),
    wantDetails
      ? fetchStatisticsSectionDetailsServer(popId, sectionId, query)
      : Promise.resolve(null),
  ])
  if (summaryRes && !summaryRes.success) return summaryRes
  if (detailsRes && !detailsRes.success) return detailsRes
  if (summaryRes && detailsRes) {
    return {
      success: true,
      data: mergeStatisticsSectionData(summaryRes.data, detailsRes.data),
    }
  }
  if (summaryRes) return summaryRes
  if (detailsRes) return detailsRes
  return { success: false, error: "Sección vacía" }
}
