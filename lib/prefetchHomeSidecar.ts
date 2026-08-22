import "server-only"

import type { HomeSidecar } from "@/lib/loadHomeSidecar"
import { loadHomeSidecar } from "@/lib/loadHomeSidecar"
import {
  popAccessQueryKey,
  userPopsAccessBatchQueryKey,
  userProfileQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { QueryClient, dehydrate, type DehydratedState } from "@tanstack/react-query"

function seedHomeSidecarQueryClient(sidecar: HomeSidecar): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: sessionListQueryOptions,
    },
  })

  queryClient.setQueryData(
    userProfileQueryKey(sidecar.user.id),
    sidecar.profile,
  )
  queryClient.setQueryData(
    userPopsAccessBatchQueryKey(sidecar.user.id),
    sidecar.batch,
  )
  for (const popId of sidecar.batch.popIds) {
    const access = sidecar.batch.accessByPopId[popId]
    if (access) {
      queryClient.setQueryData(popAccessQueryKey(popId), access)
    }
  }

  return queryClient
}

export async function prefetchHomeSidecar(): Promise<DehydratedState | null> {
  const sidecar = await loadHomeSidecar()
  if (!sidecar) return null
  return dehydrate(seedHomeSidecarQueryClient(sidecar))
}
