import "server-only"

import { getInitialAuthUser } from "@/lib/getInitialAuthUser"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { QueryClient, dehydrate, type DehydratedState } from "@tanstack/react-query"

export type PrefetchPopListQueryInput = {
  queryKey: readonly unknown[]
  queryFn: () => Promise<unknown>
}

export async function prefetchPopListQueries(
  queries: readonly PrefetchPopListQueryInput[],
): Promise<DehydratedState | null> {
  const user = await getInitialAuthUser()
  if (!user) return null

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: sessionListQueryOptions,
    },
  })

  await Promise.all(
    queries.map((query) =>
      queryClient.prefetchQuery({
        queryKey: query.queryKey,
        queryFn: query.queryFn,
        ...sessionListQueryOptions,
      }),
    ),
  )

  return dehydrate(queryClient)
}

export async function prefetchPopListQuery(
  query: PrefetchPopListQueryInput,
): Promise<DehydratedState | null> {
  return prefetchPopListQueries([query])
}
