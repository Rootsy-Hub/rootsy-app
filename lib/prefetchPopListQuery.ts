import "server-only"

import { getInitialAuthUser } from "@/lib/getInitialAuthUser"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { QueryClient, dehydrate, type DehydratedState } from "@tanstack/react-query"

export type PrefetchPopListQueryInput = {
  queryKey: readonly unknown[]
  queryFn: () => Promise<unknown>
}

export type PrefetchPopInfiniteListQueryInput = {
  queryKey: readonly unknown[]
  queryFn: (page: number) => Promise<unknown>
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

export async function prefetchPopInfiniteListQuery(
  query: PrefetchPopInfiniteListQueryInput & {
    initialPageParam?: number
  },
): Promise<DehydratedState | null> {
  const user = await getInitialAuthUser()
  if (!user) return null

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: sessionListQueryOptions,
    },
  })

  const initialPageParam =
    Number.isFinite(query.initialPageParam) && (query.initialPageParam ?? 0) > 0
      ? Math.floor(query.initialPageParam as number)
      : 1

  await queryClient.prefetchInfiniteQuery({
    queryKey: query.queryKey,
    initialPageParam,
    queryFn: ({ pageParam }) => query.queryFn(Number(pageParam) || initialPageParam),
    ...sessionListQueryOptions,
  })

  return dehydrate(queryClient)
}
