import type { GetPopPromotionsTableInput } from "@/app/[siteId]/[popId]/promotions/actions"
import {
  beginCatalogArticleHydrate,
  catalogHydrateEpochIsCurrent,
  endCatalogArticleHydrate,
} from "@/lib/catalogRealtime/hydrateGate"
import {
  clearPromotionsHydratedMark,
  isPromotionsHydrated,
  markPromotionsHydrated,
} from "@/lib/popLocalDb/hydrateMarks"
import { promotionDumpRowToSnapshot } from "@/lib/popLocalDb/mapPromotion"
import {
  deletePromotionsNotIn,
  upsertPromotionSnapshots,
} from "@/lib/popLocalDb/promotionsRepo"
import { getOpenedPopLocalDb } from "@/lib/popLocalDb/store"
import type { PromotionSnapshot } from "@/lib/popLocalDb/types"
import { fetchPopPromotionsTable } from "@/lib/rootsyApi/promotionsClient"

export const POP_LOCAL_PROMOTIONS_PAGE_SIZE = 100

export function popLocalPromotionsHydrateInput(
  page: number,
): GetPopPromotionsTableInput {
  return {
    page,
    pageSize: POP_LOCAL_PROMOTIONS_PAGE_SIZE,
    q: "",
    soloActivos: false,
    includeSlots: true,
    promotionType: "",
    sort: "name",
    ord: "asc",
  }
}

export async function fetchSaleBoardPromotionPages(
  popId: string,
  onPage?: (rows: PromotionSnapshot[]) => void,
): Promise<PromotionSnapshot[]> {
  const promotions: PromotionSnapshot[] = []
  let page = 1
  for (;;) {
    const res = await fetchPopPromotionsTable(
      popId,
      popLocalPromotionsHydrateInput(page),
    )
    if (!res.success) throw new Error(res.error)
    const snapshots = res.promotions.flatMap((row) => {
      const snapshot = promotionDumpRowToSnapshot(row)
      return snapshot ? [snapshot] : []
    })
    promotions.push(...snapshots)
    onPage?.(snapshots)
    if (page * POP_LOCAL_PROMOTIONS_PAGE_SIZE >= res.totalCount) break
    page += 1
  }
  return promotions
}

const hydrateLocks = new Map<string, Promise<void>>()

export async function hydratePopPromotionsFromNetwork(
  popId: string,
  options?: { onProgress?: () => void },
): Promise<void> {
  const pending = hydrateLocks.get(popId)
  if (pending) return pending

  const run = (async () => {
    const handle = await getOpenedPopLocalDb(popId)
    if (isPromotionsHydrated(handle.database)) return
    const startedEpoch = beginCatalogArticleHydrate()
    try {
      const seenIds: string[] = []
      await fetchSaleBoardPromotionPages(popId, (pageRows) => {
        upsertPromotionSnapshots(handle.database, pageRows)
        for (const row of pageRows) seenIds.push(row.id)
        handle.markDirty()
        options?.onProgress?.()
      })
      if (!catalogHydrateEpochIsCurrent(startedEpoch)) return
      handle.database.transaction(() => {
        deletePromotionsNotIn(handle.database, seenIds)
      })
      if (!catalogHydrateEpochIsCurrent(startedEpoch)) return
      const hydratedAt = new Date().toISOString()
      handle.database.setMeta("promotions_last_hydrated_at", hydratedAt)
      markPromotionsHydrated(handle.database, hydratedAt)
      handle.markDirty()
      await handle.flush()
      options?.onProgress?.()
    } finally {
      endCatalogArticleHydrate(startedEpoch)
    }
  })()

  hydrateLocks.set(popId, run)
  try {
    await run
  } finally {
    hydrateLocks.delete(popId)
  }
}

export async function clearPopLocalPromotionsHydrateMark(popId: string) {
  const handle = await getOpenedPopLocalDb(popId)
  clearPromotionsHydratedMark(handle.database)
  handle.markDirty()
  await handle.flush()
}
