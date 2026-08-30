"use client"

import { usePopLocalDb } from "@/hooks/usePopLocalDb"
import { usePopOperateCapabilities } from "@/hooks/usePopOperateCapabilities"
import {
  buildCatalogAvailabilityContext,
  type CatalogAvailabilityContext,
} from "@/lib/catalogAvailabilityContext"
import { openPopLocalDb } from "@/lib/popLocalDb"
import { catalogAvailabilityQueryKey } from "@/lib/queryKeys"
import { useQuery } from "@tanstack/react-query"

export function useCatalogAvailabilityContext(
  popId: string | undefined,
): CatalogAvailabilityContext | null {
  const localStatus = usePopLocalDb(popId)
  const { caps, ready } = usePopOperateCapabilities()
  const sqliteReady = localStatus === "ready"
  const enabled =
    Boolean(popId) && sqliteReady && ready && caps.recipeAvailability

  const query = useQuery({
    queryKey: catalogAvailabilityQueryKey(popId ?? ""),
    queryFn: async () => {
      const handle = await openPopLocalDb(popId!)
      return buildCatalogAvailabilityContext(handle.database)
    },
    enabled,
    staleTime: 5_000,
    refetchOnWindowFocus: false,
  })

  return query.data ?? null
}
