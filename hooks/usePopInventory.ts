"use client"

import { inventorySummaryQueryOptions } from "@/lib/inventoryWorkspaceQuery"
import {
  popInventoryExpiryQueryKey,
  popInventoryLedgerAllocationsQueryKey,
  popInventoryLedgerLayersQueryKey,
  popInventoryLocationsQueryKey,
  popInventoryMovementsQueryKey,
  popInventoryRowsQueryKey,
  type PopInventoryExpiryQueryParams,
  type PopInventoryRowsQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import {
  fetchPopInventoryExpiry,
  fetchPopInventoryLedgerAllocations,
  fetchPopInventoryLedgerLayers,
  fetchPopInventoryLocations,
  fetchPopInventoryMovements,
  fetchPopInventoryRows,
  type InventoryExpiryFilter,
  type InventoryRowsView,
} from "@/lib/rootsyApi/inventoryClient"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

type EnabledOptions = {
  enabled?: boolean
}

export function usePopInventorySummary(
  popId: string | undefined,
  options?: EnabledOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  return useQuery({
    ...inventorySummaryQueryOptions(popId ?? ""),
    enabled,
  })
}

export const INVENTORY_ROWS_PAGE_SIZE = 25

export function usePopInventoryRows(
  popId: string | undefined,
  params: PopInventoryRowsQueryParams,
  options?: EnabledOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const query = useInfiniteQuery({
    queryKey: popInventoryRowsQueryKey(popId ?? "", params),
    queryFn: async ({ pageParam }) => {
      const res = await fetchPopInventoryRows(popId!, {
        view: params.view as InventoryRowsView,
        q: params.q,
        page: pageParam,
        pageSize: INVENTORY_ROWS_PAGE_SIZE,
        attention:
          params.attention === "negative" ||
          params.attention === "empty" ||
          params.attention === "below_min"
            ? params.attention
            : undefined,
      })
      if (!res.success) throw new Error(res.error)
      return res
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
    enabled,
    ...sessionListQueryOptions,
  })
  const rows = query.data?.pages.flatMap((page) => page.rows) ?? []
  const total = query.data?.pages.at(-1)?.total ?? 0
  return {
    ...query,
    rows,
    total,
    errorMessage:
      query.error instanceof Error
        ? query.error.message
        : query.error
          ? "Unexpected error"
          : null,
  }
}

export const INVENTORY_MOVEMENTS_PAGE_SIZE = 25

export function usePopInventoryMovements(
  popId: string | undefined,
  options?: EnabledOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const query = useInfiniteQuery({
    queryKey: popInventoryMovementsQueryKey(popId ?? ""),
    queryFn: async ({ pageParam }) => {
      const res = await fetchPopInventoryMovements(popId!, {
        page: pageParam,
        pageSize: INVENTORY_MOVEMENTS_PAGE_SIZE,
      })
      if (!res.success) throw new Error(res.error)
      return res
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled,
    ...sessionListQueryOptions,
  })
  const movements = query.data?.pages.flatMap((page) => page.movements) ?? []
  return {
    ...query,
    movements,
    errorMessage:
      query.error instanceof Error
        ? query.error.message
        : query.error
          ? "Unexpected error"
          : null,
  }
}

export const INVENTORY_LEDGER_PAGE_SIZE = 25
export const INVENTORY_EXPIRY_PAGE_SIZE = 25

function infiniteErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (error) return "Unexpected error"
  return null
}

export function usePopInventoryLedgerLayers(
  popId: string | undefined,
  options?: EnabledOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const query = useInfiniteQuery({
    queryKey: popInventoryLedgerLayersQueryKey(popId ?? ""),
    queryFn: async ({ pageParam }) => {
      const res = await fetchPopInventoryLedgerLayers(popId!, {
        page: pageParam,
        pageSize: INVENTORY_LEDGER_PAGE_SIZE,
      })
      if (!res.success) throw new Error(res.error)
      return res
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled,
    ...sessionListQueryOptions,
  })
  return {
    ...query,
    costLayers: query.data?.pages.flatMap((page) => page.costLayers) ?? [],
    errorMessage: infiniteErrorMessage(query.error),
  }
}

export function usePopInventoryLedgerAllocations(
  popId: string | undefined,
  options?: EnabledOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const query = useInfiniteQuery({
    queryKey: popInventoryLedgerAllocationsQueryKey(popId ?? ""),
    queryFn: async ({ pageParam }) => {
      const res = await fetchPopInventoryLedgerAllocations(popId!, {
        page: pageParam,
        pageSize: INVENTORY_LEDGER_PAGE_SIZE,
      })
      if (!res.success) throw new Error(res.error)
      return res
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled,
    ...sessionListQueryOptions,
  })
  return {
    ...query,
    layerAllocations:
      query.data?.pages.flatMap((page) => page.layerAllocations) ?? [],
    errorMessage: infiniteErrorMessage(query.error),
  }
}

export function usePopInventoryExpiry(
  popId: string | undefined,
  params: PopInventoryExpiryQueryParams,
  options?: EnabledOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const query = useInfiniteQuery({
    queryKey: popInventoryExpiryQueryKey(popId ?? "", params),
    queryFn: async ({ pageParam }) => {
      const res = await fetchPopInventoryExpiry(popId!, {
        page: pageParam,
        pageSize: INVENTORY_EXPIRY_PAGE_SIZE,
        q: params.q,
        filter: params.filter as InventoryExpiryFilter,
      })
      if (!res.success) throw new Error(res.error)
      return res
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled,
    ...sessionListQueryOptions,
  })
  return {
    ...query,
    costLayers: query.data?.pages.flatMap((page) => page.costLayers) ?? [],
    errorMessage: infiniteErrorMessage(query.error),
  }
}

export function usePopInventoryLocations(
  popId: string | undefined,
  options?: EnabledOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  return useQuery({
    queryKey: popInventoryLocationsQueryKey(popId ?? ""),
    queryFn: () => fetchPopInventoryLocations(popId!),
    enabled,
    ...sessionListQueryOptions,
  })
}
