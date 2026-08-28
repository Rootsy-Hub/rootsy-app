import {
  getActiveServicesPageData,
  getServiceTypeChargeOptions,
} from "@/app/[siteId]/[popId]/active-services/actions"
import { getBrowserQueryClient } from "@/lib/queryClient"
import {
  serviceOperateCatalogQueryKey,
  serviceOperatePageQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import type { QueryClient } from "@tanstack/react-query"

export function serviceOperateCatalogQueryOptions(popId: string) {
  return {
    queryKey: serviceOperateCatalogQueryKey(popId),
    queryFn: async () => {
      const res = await getServiceTypeChargeOptions(popId)
      if (!res.success) throw new Error(res.error)
      return res.services
    },
    ...sessionListQueryOptions,
  }
}

export function serviceOperatePageQueryOptions(popId: string) {
  return {
    queryKey: serviceOperatePageQueryKey(popId),
    queryFn: async () => {
      const res = await getActiveServicesPageData(popId)
      if (!res.success) throw new Error(res.error)
      return res
    },
    ...sessionListQueryOptions,
  }
}

export function prefetchServiceOperateWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  return Promise.all([
    queryClient.prefetchQuery(serviceOperateCatalogQueryOptions(popId)),
    queryClient.prefetchQuery(serviceOperatePageQueryOptions(popId)),
  ]).then(() => undefined)
}
