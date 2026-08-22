import "server-only"

import { fetchPopArticlesTableServer } from "@/lib/rootsyApi/articlesServer"
import { articlesModalFiltersFromWorkspace } from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import type { ArticlesWorkspaceUrlState } from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import { getPopChecksTable } from "@/app/[siteId]/[popId]/checks/actions"
import type { ChecksWorkspaceUrlState } from "@/app/[siteId]/[popId]/checks/workspaceUrl"
import { getPopClientsTable } from "@/app/[siteId]/[popId]/clients/actions"
import type { ClientsWorkspaceUrlState } from "@/app/[siteId]/[popId]/clients/workspaceUrl"
import {
  getPopCurrentAccountLedger,
  getPopCurrentAccountParties,
} from "@/app/[siteId]/[popId]/current-accounts/actions"
import type { CurrentAccountsWorkspaceUrlState } from "@/app/[siteId]/[popId]/current-accounts/workspaceUrl"
import { getPopInvoicesArcaTable } from "@/app/[siteId]/[popId]/invoices/actions"
import type { InvoicesWorkspaceUrlState } from "@/app/[siteId]/[popId]/invoices/workspaceUrl"
import { getOperationsList } from "@/app/[siteId]/[popId]/operations/actions"
import { getPopPromotionsTable } from "@/app/[siteId]/[popId]/promotions/actions"
import type { PromotionsWorkspaceUrlState } from "@/app/[siteId]/[popId]/promotions/workspaceUrl"
import { getPurchaseOrdersTable } from "@/app/[siteId]/[popId]/purchase-orders/actions"
import { DEFAULT_PURCHASE_ORDER_TABLE_PAGE_SIZE } from "@/app/[siteId]/[popId]/purchase-orders/orderConstants"
import { DEFAULT_QUOTE_TABLE_PAGE_SIZE } from "@/app/[siteId]/[popId]/quotes/quoteConstants"
import { getSaleQuotesTable } from "@/app/[siteId]/[popId]/quotes/actions"
import { getPopServicesTable } from "@/app/[siteId]/[popId]/services/actions"
import type { ServicesWorkspaceUrlState } from "@/app/[siteId]/[popId]/services/workspaceUrl"
import { getPopSuppliersTable } from "@/app/[siteId]/[popId]/suppliers/actions"
import { computeDataWorkspaceDateBounds } from "@/lib/dataWorkspaceDateFilter"
import { prefetchPopListQuery } from "@/lib/prefetchPopListQuery"
import {
  popArticlesQueryKey,
  popChecksQueryKey,
  popClientsQueryKey,
  popCurrentAccountLedgerQueryKey,
  popCurrentAccountPartiesQueryKey,
  popInvoicesQueryKey,
  popOperationsQueryKey,
  popPromotionsQueryKey,
  popPurchaseOrdersQueryKey,
  popQuotesQueryKey,
  popServicesQueryKey,
  popSuppliersQueryKey,
  type PopClientsQueryParams,
  type PopOperationsQueryParams,
} from "@/lib/queryKeys"
import type { DehydratedState } from "@tanstack/react-query"

function clientsQueryParamsFromUrl(
  url: ClientsWorkspaceUrlState,
): PopClientsQueryParams {
  return {
    page: url.page,
    pageSize: url.pageSize,
    search: url.q,
    soloActivos: url.soloActivos,
    withEmail: url.withEmail,
    withTaxId: url.withTaxId,
    sort: url.sort,
    ord: url.ord,
  }
}

export async function prefetchPopClientsTable(
  popId: string,
  url: ClientsWorkspaceUrlState,
): Promise<DehydratedState | null> {
  const params = clientsQueryParamsFromUrl(url)
  return prefetchPopListQuery({
    queryKey: popClientsQueryKey(popId, params),
    queryFn: () => getPopClientsTable(popId, params),
  })
}

export async function prefetchPopArticlesTable(
  popId: string,
  url: ArticlesWorkspaceUrlState,
): Promise<DehydratedState | null> {
  const params = {
    page: url.page,
    pageSize: url.pageSize,
    search: url.q,
    ...articlesModalFiltersFromWorkspace(url),
    categoryId: url.categoryId,
    itemKinds: url.itemKinds,
    sort: url.sort,
    ord: url.ord,
  }
  return prefetchPopListQuery({
    queryKey: popArticlesQueryKey(popId, params),
    queryFn: () => fetchPopArticlesTableServer(popId, params),
  })
}

export async function prefetchPopInvoicesTable(
  popId: string,
  url: InvoicesWorkspaceUrlState,
): Promise<DehydratedState | null> {
  const params = {
    q: url.q,
    page: url.page,
    pageSize: url.pageSize,
    status: url.status,
    regimen: url.regimen,
    sort: url.sort,
    ord: url.ord,
  }
  return prefetchPopListQuery({
    queryKey: popInvoicesQueryKey(popId, params),
    queryFn: () => getPopInvoicesArcaTable(popId, params),
  })
}

export async function prefetchPopChecksTable(
  popId: string,
  url: ChecksWorkspaceUrlState,
): Promise<DehydratedState | null> {
  const params = {
    q: url.q,
    page: url.page,
    pageSize: url.pageSize,
    direction: url.direction,
    status: url.status,
    sort: url.sort,
    ord: url.ord,
  }
  return prefetchPopListQuery({
    queryKey: popChecksQueryKey(popId, params),
    queryFn: () => getPopChecksTable(popId, params),
  })
}

export async function prefetchPopPromotionsTable(
  popId: string,
  url: PromotionsWorkspaceUrlState,
): Promise<DehydratedState | null> {
  const params = {
    q: url.q,
    page: url.page,
    pageSize: url.pageSize,
    soloActivos: url.soloActivos,
    promotionType: url.promotionType,
    sort: url.sort,
    ord: url.ord,
  }
  return prefetchPopListQuery({
    queryKey: popPromotionsQueryKey(popId, params),
    queryFn: () => getPopPromotionsTable(popId, params),
  })
}

export async function prefetchPopServicesTable(
  popId: string,
  url: ServicesWorkspaceUrlState,
): Promise<DehydratedState | null> {
  const params = {
    q: url.q,
    page: url.page,
    pageSize: url.pageSize,
    soloActivos: url.soloActivos,
    categoryId: url.categoryId,
    sort: url.sort,
    ord: url.ord,
  }
  return prefetchPopListQuery({
    queryKey: popServicesQueryKey(popId, params),
    queryFn: () => getPopServicesTable(popId, params),
  })
}

export async function prefetchPopCurrentAccounts(
  popId: string,
  url: CurrentAccountsWorkspaceUrlState,
): Promise<DehydratedState | null> {
  if (url.partyId) {
    return prefetchPopListQuery({
      queryKey: popCurrentAccountLedgerQueryKey(
        popId,
        url.direction,
        url.partyId,
      ),
      queryFn: () =>
        getPopCurrentAccountLedger(popId, {
          direction: url.direction,
          partyId: url.partyId,
        }),
    })
  }

  const params = {
    q: url.q,
    page: url.page,
    pageSize: url.pageSize,
    direction: url.direction,
    aging: url.aging,
    sort: url.sort,
    ord: url.ord,
  }
  return prefetchPopListQuery({
    queryKey: popCurrentAccountPartiesQueryKey(popId, params),
    queryFn: () => getPopCurrentAccountParties(popId, params),
  })
}

export async function prefetchPopSuppliersTable(
  popId: string,
): Promise<DehydratedState | null> {
  return prefetchPopListQuery({
    queryKey: popSuppliersQueryKey(popId),
    queryFn: () => getPopSuppliersTable(popId),
  })
}

export async function prefetchPopOperationsList(
  popId: string,
): Promise<DehydratedState | null> {
  const dateBounds = computeDataWorkspaceDateBounds("this_month", undefined)
  const params: PopOperationsQueryParams = {
    view: "sales",
    dateFrom: dateBounds.from,
    dateTo: dateBounds.to,
    search: "",
    page: 1,
    pageSize: 25,
    sort: null,
    ord: "asc",
  }
  return prefetchPopListQuery({
    queryKey: popOperationsQueryKey(popId, params),
    queryFn: () => getOperationsList(popId, { ...params, view: "sales" }),
  })
}

export async function prefetchPopQuotesTable(
  popId: string,
): Promise<DehydratedState | null> {
  const dateBounds = computeDataWorkspaceDateBounds("this_month", undefined)
  const params = {
    page: 1,
    pageSize: DEFAULT_QUOTE_TABLE_PAGE_SIZE,
    q: "",
    dateFrom: dateBounds.from,
    dateTo: dateBounds.to,
  }
  return prefetchPopListQuery({
    queryKey: popQuotesQueryKey(popId, params),
    queryFn: () => getSaleQuotesTable(popId, params),
  })
}

export async function prefetchPopPurchaseOrdersTable(
  popId: string,
): Promise<DehydratedState | null> {
  const dateBounds = computeDataWorkspaceDateBounds("this_month", undefined)
  const params = {
    page: 1,
    pageSize: DEFAULT_PURCHASE_ORDER_TABLE_PAGE_SIZE,
    q: "",
    dateFrom: dateBounds.from,
    dateTo: dateBounds.to,
  }
  return prefetchPopListQuery({
    queryKey: popPurchaseOrdersQueryKey(popId, params),
    queryFn: () => getPurchaseOrdersTable(popId, params),
  })
}

