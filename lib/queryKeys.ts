export function popWorkspaceBootstrapQueryKey(
  siteId: string,
  popId: string,
  userId: string,
) {
  return ["pop-workspace-bootstrap", siteId, popId, userId] as const
}

export function popBackgroundImageQueryKey(popId: string) {
  return ["pop-background-image", popId] as const
}

export function menuCatalogQueryKey(popId: string) {
  return ["menu-catalog", popId] as const
}

export function saleCatalogQueryKey(popId: string) {
  return ["sale-catalog", popId] as const
}

export function purchaseCatalogQueryKey(popId: string) {
  return ["purchase-catalog", popId] as const
}

export function saleCatalogItemsQueryKey(popId: string, filterKey: string) {
  return ["sale-catalog", popId, "items", filterKey] as const
}

export function menuCatalogItemsQueryKey(popId: string, filterKey: string) {
  return ["menu-catalog", popId, "items", filterKey] as const
}

export function purchaseCatalogItemsQueryKey(
  popId: string,
  filterKey: string,
) {
  return ["purchase-catalog", popId, "items", filterKey] as const
}

export function saleCatalogKnownArticlesQueryKey(popId: string) {
  return ["sale-catalog", popId, "known-articles"] as const
}

export function menuCatalogKnownArticlesQueryKey(popId: string) {
  return ["menu-catalog", popId, "known-articles"] as const
}

export function menuCatalogKnownRecipesQueryKey(popId: string) {
  return ["menu-catalog", popId, "known-recipes"] as const
}

export function purchaseCatalogKnownArticlesQueryKey(popId: string) {
  return ["purchase-catalog", popId, "known-articles"] as const
}

export function saleComprobanteEmitterQueryKey(
  popId: string,
  cashRegisterId?: string | null,
) {
  return ["sale-comprobante-emitter", popId, cashRegisterId ?? null] as const
}

export function userProfileQueryKey(userId: string) {
  return ["_user-profile", userId] as const
}

export function userPopIdsQueryKey(userId: string) {
  return ["_user-pop-ids", userId] as const
}

export function userPopsAccessBatchQueryKey(userId: string) {
  return ["_user-pops-access-batch", userId] as const
}

export function popAccessQueryKey(popId: string) {
  return ["_pop-access", popId] as const
}

/** @deprecated Usar popAccessQueryKey — la suscripción vive en `_pop-access`. */
export function popSubscriptionQueryKey(popId: string) {
  return popAccessQueryKey(popId)
}

export function canUserCreatePopQueryKey(userId: string) {
  return ["can-user-create-pop", userId] as const
}

export type PopClientsQueryParams = {
  page: number
  pageSize: number
  search: string
  soloActivos: boolean
  withEmail: boolean
  withTaxId: boolean
  sort: string | null
  ord: "asc" | "desc"
}

/** @deprecated Usar PopClientsQueryParams */
export type PopClientsTableQueryParams = PopClientsQueryParams

export function popClientsQueryKey(
  popId: string,
  params: PopClientsQueryParams,
) {
  return [
    "pop-clients",
    popId,
    params.page,
    params.pageSize,
    params.search.trim(),
    params.soloActivos,
    params.withEmail,
    params.withTaxId,
    params.sort,
    params.ord,
  ] as const
}

export function popClientsQueryRoot(popId: string) {
  return ["pop-clients", popId] as const
}

export type PopArticlesQueryParams = {
  page: number
  pageSize: number
  search: string
  soloActivos: boolean
  soloInactivos: boolean
  conDescuento: boolean
  sinDescuento: boolean
  conStock: boolean
  sinStock: boolean
  stockNegativo: boolean
  ventaSinStock: boolean
  categoryId: string
  itemKinds: string[]
  sort: string | null
  ord: "asc" | "desc"
}

export function popArticlesQueryKey(
  popId: string,
  params: PopArticlesQueryParams,
) {
  return [
    "pop-articles",
    popId,
    params.page,
    params.pageSize,
    params.search.trim(),
    params.soloActivos,
    params.soloInactivos,
    params.conDescuento,
    params.sinDescuento,
    params.conStock,
    params.sinStock,
    params.stockNegativo,
    params.ventaSinStock,
    params.categoryId,
    params.itemKinds.join(","),
    params.sort,
    params.ord,
  ] as const
}

export function popArticlesQueryRoot(popId: string) {
  return ["pop-articles", popId] as const
}

export type PopOperationsQueryParams = {
  view: string
  dateFrom: string | null
  dateTo: string | null
  search: string
  page: number
  pageSize: number
  sort: string | null
  ord: "asc" | "desc"
}

export function popOperationsQueryKey(
  popId: string,
  params: PopOperationsQueryParams,
) {
  return [
    "pop-operations",
    popId,
    params.view,
    params.dateFrom,
    params.dateTo,
    params.search.trim(),
    params.page,
    params.pageSize,
    params.sort,
    params.ord,
  ] as const
}

export function popOperationsQueryRoot(popId: string) {
  return ["pop-operations", popId] as const
}

export type PopInvoicesQueryParams = {
  q: string
  page: number
  pageSize: number
  status: string
  regimen: string
  sort: string | null
  ord: "asc" | "desc"
}

export function popInvoicesQueryKey(
  popId: string,
  params: PopInvoicesQueryParams,
) {
  return [
    "pop-invoices",
    popId,
    params.q.trim(),
    params.page,
    params.pageSize,
    params.status,
    params.regimen,
    params.sort,
    params.ord,
  ] as const
}

export function popInvoicesQueryRoot(popId: string) {
  return ["pop-invoices", popId] as const
}

export type PopChecksQueryParams = {
  q: string
  page: number
  pageSize: number
  direction: string
  status: string
  sort: string | null
  ord: "asc" | "desc"
}

export function popChecksQueryKey(popId: string, params: PopChecksQueryParams) {
  return [
    "pop-checks",
    popId,
    params.q.trim(),
    params.page,
    params.pageSize,
    params.direction,
    params.status,
    params.sort,
    params.ord,
  ] as const
}

export function popChecksQueryRoot(popId: string) {
  return ["pop-checks", popId] as const
}

export function popSuppliersQueryKey(popId: string) {
  return ["pop-suppliers", popId] as const
}

export function popSuppliersQueryRoot(popId: string) {
  return ["pop-suppliers", popId] as const
}

export type PopRecipesQueryParams = {
  q: string
  page: number
  pageSize: number
  soloActivos: boolean
  categoryId: string
  sort: string | null
  ord: "asc" | "desc"
}

export function popRecipesQueryKey(
  popId: string,
  params: PopRecipesQueryParams,
) {
  return [
    "pop-recipes",
    popId,
    params.q.trim(),
    params.page,
    params.pageSize,
    params.soloActivos,
    params.categoryId,
    params.sort,
    params.ord,
  ] as const
}

export function popRecipesQueryRoot(popId: string) {
  return ["pop-recipes", popId] as const
}

export type PopPromotionsQueryParams = {
  q: string
  page: number
  pageSize: number
  soloActivos: boolean
  promotionType: string
  sort: string | null
  ord: "asc" | "desc"
}

export function popPromotionsQueryKey(
  popId: string,
  params: PopPromotionsQueryParams,
) {
  return [
    "pop-promotions",
    popId,
    params.q.trim(),
    params.page,
    params.pageSize,
    params.soloActivos,
    params.promotionType,
    params.sort,
    params.ord,
  ] as const
}

export function popPromotionsQueryRoot(popId: string) {
  return ["pop-promotions", popId] as const
}

export type PopServicesQueryParams = {
  q: string
  page: number
  pageSize: number
  soloActivos: boolean
  categoryId: string
  sort: string | null
  ord: "asc" | "desc"
}

export function popServicesQueryKey(
  popId: string,
  params: PopServicesQueryParams,
) {
  return [
    "pop-services",
    popId,
    params.q.trim(),
    params.page,
    params.pageSize,
    params.soloActivos,
    params.categoryId,
    params.sort,
    params.ord,
  ] as const
}

export function popServicesQueryRoot(popId: string) {
  return ["pop-services", popId] as const
}

export type PopCurrentAccountPartiesQueryParams = {
  q: string
  page: number
  pageSize: number
  direction: string
  aging: string
  sort: string | null
  ord: "asc" | "desc"
}

export function popCurrentAccountPartiesQueryKey(
  popId: string,
  params: PopCurrentAccountPartiesQueryParams,
) {
  return [
    "pop-current-account-parties",
    popId,
    params.q.trim(),
    params.page,
    params.pageSize,
    params.direction,
    params.aging,
    params.sort,
    params.ord,
  ] as const
}

export function popCurrentAccountPartiesQueryRoot(popId: string) {
  return ["pop-current-account-parties", popId] as const
}

export function popCurrentAccountLedgerQueryKey(
  popId: string,
  direction: string,
  partyId: string,
) {
  return ["pop-current-account-ledger", popId, direction, partyId] as const
}

export function popCurrentAccountLedgerQueryRoot(popId: string) {
  return ["pop-current-account-ledger", popId] as const
}

export type PopQuotesQueryParams = {
  page: number
  pageSize: number
  q: string
  dateFrom: string | null
  dateTo: string | null
}

export function popQuotesQueryKey(popId: string, params: PopQuotesQueryParams) {
  return [
    "pop-quotes",
    popId,
    params.page,
    params.pageSize,
    params.q.trim(),
    params.dateFrom,
    params.dateTo,
  ] as const
}

export function popQuotesQueryRoot(popId: string) {
  return ["pop-quotes", popId] as const
}

export type PopPurchaseOrdersQueryParams = {
  page: number
  pageSize: number
  q: string
  dateFrom: string | null
  dateTo: string | null
}

export function popPurchaseOrdersQueryKey(
  popId: string,
  params: PopPurchaseOrdersQueryParams,
) {
  return [
    "pop-purchase-orders",
    popId,
    params.page,
    params.pageSize,
    params.q.trim(),
    params.dateFrom,
    params.dateTo,
  ] as const
}

export function popPurchaseOrdersQueryRoot(popId: string) {
  return ["pop-purchase-orders", popId] as const
}

/** @deprecated Usar popClientsQueryKey */
export const popClientsTableQueryKey = popClientsQueryKey

/** @deprecated Usar popClientsQueryRoot */
export const popClientsTableQueryRoot = popClientsQueryRoot
