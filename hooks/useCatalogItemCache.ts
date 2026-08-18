"use client"

import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

export function useCatalogItemCache<T extends { id: string }>(
  queryKey: readonly unknown[],
) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey,
    queryFn: async () => [] as T[],
    initialData: [] as T[],
    enabled: false,
    ...sessionListQueryOptions,
  })

  const merge = useCallback(
    (rows: T[]) => {
      if (rows.length === 0) return
      queryClient.setQueryData<T[]>(queryKey, (prev = []) => {
        const map = new Map((prev ?? []).map((row) => [row.id, row]))
        let changed = false
        for (const row of rows) {
          if (map.get(row.id) !== row) {
            map.set(row.id, row)
            changed = true
          }
        }
        return changed ? [...map.values()] : prev
      })
    },
    // queryKey se hashea en Query; no hace falta identidad referencial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, queryKey[0], queryKey[1], queryKey[2], queryKey[3]],
  )

  return { items: query.data ?? [], merge }
}
