import type { CurrentAccountPartyRow } from "@/app/[siteId]/[popId]/current-accounts/actions"
import type { ChatRootsyToolItem } from "@/app/[siteId]/[popId]/chat/chatTypes"
import type { StatisticsSectionData } from "@/app/[siteId]/[popId]/statistics/actions"
import {
  chatRootsyCatalogIdFromRankingKey,
  chatRootsyIsCatalogUuid,
} from "@/lib/chat/chatRootsyApiQuery"
import type { ChatRootsyRecentToolUse } from "@/lib/chat/tools/chatRootsyToolTypes"

function foldLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

export function matchProductKey(
  source: { id?: string; name: string },
  data: StatisticsSectionData,
): string | null {
  if (source.id) {
    const candidates = [source.id]
    if (chatRootsyIsCatalogUuid(source.id)) {
      candidates.push(`a:${source.id}`, `r:${source.id}`, `p:${source.id}`)
    }
    for (const id of candidates) {
      if (data.productTrendByKey?.[id]) return id
      if (data.productSalesRankings?.some((row) => row.id === id)) return id
      if (data.rankings.some((row) => row.id === id)) return id
    }
  }

  const wanted = foldLabel(source.name)
  const fromOptions = data.productTrendOptions?.find(
    (row) => foldLabel(row.label) === wanted,
  )
  if (fromOptions) return fromOptions.key

  const fromSales = data.productSalesRankings?.find(
    (row) => foldLabel(row.label) === wanted,
  )
  if (fromSales?.id) return fromSales.id

  const fromProfit = data.rankings.find((row) => foldLabel(row.label) === wanted)
  return fromProfit?.id ?? null
}

function totalsFromTrend(
  data: StatisticsSectionData,
  key: string,
): { sales: number; profit: number; cost: number; marginPercent: number } | null {
  const points = data.productTrendByKey?.[key]
  if (!points?.length) return null
  const sales = points.reduce((sum, point) => sum + (point.value ?? 0), 0)
  const profit = points.reduce((sum, point) => sum + (point.profit ?? 0), 0)
  const cost = sales - profit
  return {
    sales,
    profit,
    cost,
    marginPercent: sales > 0 ? Math.round((profit / sales) * 1000) / 10 : 0,
  }
}

export function buildTopSoldItems(
  data: StatisticsSectionData,
  limit: number,
): ChatRootsyToolItem[] {
  return (data.productSalesRankings ?? []).slice(0, limit).map((row, index) => ({
    rank: row.rank || index + 1,
    id: chatRootsyCatalogIdFromRankingKey(row.id),
    name: row.label,
    sharePercent: row.value,
    sales: row.secondaryValue ?? 0,
  }))
}

export function buildMarginItems(
  data: StatisticsSectionData,
  sourceItems: ChatRootsyRecentToolUse["items"],
  limit: number,
): ChatRootsyToolItem[] {
  return sourceItems.slice(0, limit).map((source, index) => {
    const key = matchProductKey(source, data)
    const totals = key ? totalsFromTrend(data, key) : null
    const profitRow = data.rankings.find(
      (row) =>
        row.id === key || foldLabel(row.label) === foldLabel(source.name),
    )
    const salesRow = data.productSalesRankings?.find(
      (row) =>
        row.id === key || foldLabel(row.label) === foldLabel(source.name),
    )

    const sales = totals?.sales ?? salesRow?.secondaryValue ?? 0
    const profit = totals?.profit ?? profitRow?.value ?? 0
    const cost = totals?.cost ?? sales - profit
    const marginPercent =
      totals?.marginPercent ??
      (sales > 0 ? Math.round((profit / sales) * 1000) / 10 : 0)

    return {
      rank: index + 1,
      id: chatRootsyCatalogIdFromRankingKey(key ?? source.id),
      name: source.name,
      sales,
      cost,
      profit,
      marginPercent,
    }
  })
}

export function buildSupplierPaymentItems(
  parties: CurrentAccountPartyRow[],
  limit: number,
): ChatRootsyToolItem[] {
  return parties.slice(0, limit).map((row, index) => ({
    rank: index + 1,
    id: row.partyId,
    name: row.partyName,
    balance: row.balance,
    overdueAmount: row.overdueAmount,
    openCount: row.openCount,
  }))
}
