"use client"

import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { usePopLocalDb } from "@/hooks/usePopLocalDb"
import {
  fetchSaleBoardPromotionPages,
  hydratePopPromotionsFromNetwork,
  listAllPromotions,
  openPopLocalDb,
  splitLocalPromotionsForMenu,
  splitLocalPromotionsForSale,
} from "@/lib/popLocalDb"
import {
  menuBoardPromotionSplitQueryKey,
  menuBoardPromotionSplitQueryRoot,
  popLocalPromotionsHydrateQueryKey,
  saleBoardPromotionsQueryKey,
  saleBoardPromotionsQueryRoot,
} from "@/lib/queryKeys"
import { useQuery, useQueryClient } from "@tanstack/react-query"

const EMPTY_COMBOS: MenuCatalogPromotion[] = []
const EMPTY_DEALS: MenuCatalogPromotion[] = []

type UseSaleBoardPromotionsOptions = {
  enabled?: boolean
  hydrate?: boolean
  /** `menu` = combos/deals de Mesas · Mostrador. Default: Vender. */
  scope?: "sale" | "menu"
}

export function useSaleBoardPromotions(
  popId: string | undefined,
  options?: UseSaleBoardPromotionsOptions,
) {
  const queryClient = useQueryClient()
  const localStatus = usePopLocalDb(popId)
  const sqliteReady = localStatus === "ready"
  const fallback = localStatus === "fallback"
  const enabled = Boolean(popId) && (options?.enabled ?? true)
  const hydrateEnabled = Boolean(popId) && (options?.hydrate ?? true)
  const scope = options?.scope ?? "sale"
  const splitPromotions =
    scope === "menu" ? splitLocalPromotionsForMenu : splitLocalPromotionsForSale
  const localKey =
    scope === "menu"
      ? menuBoardPromotionSplitQueryKey(popId ?? "", "local")
      : saleBoardPromotionsQueryKey(popId ?? "", "local")
  const httpKey =
    scope === "menu"
      ? menuBoardPromotionSplitQueryKey(popId ?? "", "http")
      : saleBoardPromotionsQueryKey(popId ?? "", "http")

  const hydrate = useQuery({
    queryKey: popLocalPromotionsHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopPromotionsFromNetwork(popId!, {
        onProgress: () => {
          void queryClient.invalidateQueries({
            queryKey:
              scope === "menu"
                ? menuBoardPromotionSplitQueryRoot(popId!)
                : saleBoardPromotionsQueryRoot(popId!),
          })
        },
      })
      return true
    },
    enabled: sqliteReady && hydrateEnabled,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  })

  const localQuery = useQuery({
    queryKey: localKey,
    queryFn: async () => {
      const handle = await openPopLocalDb(popId!)
      return splitPromotions(listAllPromotions(handle.database))
    },
    enabled: sqliteReady && enabled && (hydrate.isSuccess || hydrate.isError),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const networkQuery = useQuery({
    queryKey: httpKey,
    queryFn: async () => {
      const rows = await fetchSaleBoardPromotionPages(popId!)
      return splitPromotions(rows)
    },
    enabled: fallback && hydrateEnabled,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  })

  const data = sqliteReady ? localQuery.data : networkQuery.data
  const waitingHydrate = sqliteReady && hydrate.isLoading && !hydrate.isError
  const activeQuery = sqliteReady ? localQuery : networkQuery
  const combos = data?.combos ?? EMPTY_COMBOS
  const quantityDeals = data?.quantityDeals ?? EMPTY_DEALS
  const hydrateError =
    sqliteReady && combos.length === 0 && quantityDeals.length === 0 && hydrate.error
      ? hydrate.error instanceof Error
        ? hydrate.error.message
        : String(hydrate.error)
      : null
  const queryError =
    activeQuery.error instanceof Error
      ? activeQuery.error.message
      : activeQuery.error
        ? String(activeQuery.error)
        : null

  return {
    combos,
    quantityDeals,
    isLoading:
      localStatus === "loading" || waitingHydrate || activeQuery.isLoading,
    error: hydrateError ?? queryError,
  }
}
