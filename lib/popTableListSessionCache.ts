import { isPopTableListModule } from "@/components/data-workspace/popTableListSkeletonConfig"
import {
  popArticlesQueryRoot,
  popChecksQueryRoot,
  popClientsQueryRoot,
  popCurrentAccountLedgerQueryRoot,
  popCurrentAccountPartiesQueryRoot,
  popInvoicesQueryRoot,
  popOperationsQueryRoot,
  popPromotionsQueryRoot,
  popPurchaseOrdersQueryRoot,
  popQuotesQueryRoot,
  popRecipesQueryRoot,
  popServicesQueryRoot,
  popSuppliersQueryRoot,
} from "@/lib/queryKeys"
import type { QueryClient } from "@tanstack/react-query"

function queryRootsForModule(
  popId: string,
  moduleKey: string,
): readonly (readonly unknown[])[] {
  switch (moduleKey) {
    case "clients":
      return [popClientsQueryRoot(popId)]
    case "suppliers":
      return [popSuppliersQueryRoot(popId)]
    case "articles":
      return [popArticlesQueryRoot(popId)]
    case "operations":
      return [popOperationsQueryRoot(popId)]
    case "invoices":
      return [popInvoicesQueryRoot(popId)]
    case "checks":
      return [popChecksQueryRoot(popId)]
    case "recipes":
      return [popRecipesQueryRoot(popId)]
    case "promotions":
      return [popPromotionsQueryRoot(popId)]
    case "services":
      return [popServicesQueryRoot(popId)]
    case "quotes":
      return [popQuotesQueryRoot(popId)]
    case "purchase-orders":
      return [popPurchaseOrdersQueryRoot(popId)]
    case "current-accounts":
      return [
        popCurrentAccountPartiesQueryRoot(popId),
        popCurrentAccountLedgerQueryRoot(popId),
      ]
    default:
      return []
  }
}

/** Hay datos de listado en memoria (sesión) para este módulo POP. */
export function hasPopTableListSessionCache(
  queryClient: QueryClient,
  popId: string,
  moduleKey: string,
): boolean {
  if (!popId || !moduleKey || !isPopTableListModule(moduleKey)) return false

  return queryRootsForModule(popId, moduleKey).some((root) =>
    queryClient
      .getQueriesData({ queryKey: root })
      .some(([, data]) => data !== undefined),
  )
}
