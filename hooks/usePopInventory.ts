"use client"

import {
  popInventoryLedgerQueryKey,
  popInventoryLocationsQueryKey,
  popInventoryMovementsQueryKey,
  popInventoryQueryKey,
  popInventorySummaryQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import {
  fetchPopInventory,
  fetchPopInventoryLedger,
  fetchPopInventoryLocations,
  fetchPopInventoryMovements,
  fetchPopInventorySummary,
} from "@/lib/rootsyApi/inventoryClient"
import { useQuery } from "@tanstack/react-query"

type EnabledOptions = {
  enabled?: boolean
}

export function usePopInventorySummary(
  popId: string | undefined,
  options?: EnabledOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  return useQuery({
    queryKey: popInventorySummaryQueryKey(popId ?? ""),
    queryFn: () => fetchPopInventorySummary(popId!),
    enabled,
    ...sessionListQueryOptions,
  })
}

export function usePopInventory(
  popId: string | undefined,
  options?: EnabledOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  return useQuery({
    queryKey: popInventoryQueryKey(popId ?? ""),
    queryFn: () => fetchPopInventory(popId!),
    enabled,
    ...sessionListQueryOptions,
  })
}

export function usePopInventoryMovements(
  popId: string | undefined,
  options?: EnabledOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  return useQuery({
    queryKey: popInventoryMovementsQueryKey(popId ?? ""),
    queryFn: () => fetchPopInventoryMovements(popId!),
    enabled,
    ...sessionListQueryOptions,
  })
}

export function usePopInventoryLedger(
  popId: string | undefined,
  options?: EnabledOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  return useQuery({
    queryKey: popInventoryLedgerQueryKey(popId ?? ""),
    queryFn: () => fetchPopInventoryLedger(popId!),
    enabled,
    ...sessionListQueryOptions,
  })
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
