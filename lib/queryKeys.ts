import type { OperationsListFiltersInput } from "@/app/[siteId]/[popId]/operations/operationsFilters"

export function popAuditQueryKey(
  popId: string,
  params: {
    page: number
    pageSize: number
    q: string
    from: string | null
    to: string | null
    action: string
    source: string
  },
) {
  return ["pop-audit", popId, params] as const
}

export function popAuditQueryRoot(popId: string) {
  return ["pop-audit", popId] as const
}

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

export function menuCatalogSectionsQueryRoot(popId: string) {
  return ["menu-catalog", popId, "sections"] as const
}

export function menuCatalogSectionsQueryKey(
  popId: string,
  source: "local" | "http" = "local",
) {
  return [...menuCatalogSectionsQueryRoot(popId), source] as const
}

export function saleCatalogQueryKey(popId: string) {
  return ["sale-catalog", popId] as const
}

export function salePaymentContextQueryKey(popId: string) {
  return ["sale-catalog", popId, "payment-context"] as const
}

export function saleComprobantesQueryKey(popId: string) {
  return ["sale-catalog", popId, "comprobantes"] as const
}

export function cashRegisterOpenSessionQueryKey(popId: string) {
  return ["cash-registers", popId, "open-session"] as const
}

export function purchaseCatalogQueryKey(popId: string) {
  return ["purchase-catalog", popId] as const
}

export function saleCatalogItemsQueryKey(popId: string, filterKey: string) {
  return ["sale-catalog", popId, "items", filterKey] as const
}

/** Artículos de una categoría (sin búsqueda). Cache de sesión. */
export function saleCatalogCategoryItemsQueryKey(
  popId: string,
  section: string,
  categoryId: string | null,
  priceListId?: string,
) {
  return [
    "sale-catalog",
    popId,
    "category-items",
    section,
    categoryId ?? "",
    priceListId ?? "",
  ] as const
}

export function menuCatalogItemsQueryKey(popId: string, filterKey: string) {
  return ["menu-catalog", popId, "items", filterKey] as const
}

export function menuBoardItemsQueryRoot(popId: string) {
  return ["menu-catalog", popId, "board"] as const
}

export function menuBoardArticlesQueryKey(
  popId: string,
  categoryId: string,
  search = "",
  source: "local" | "http" = "local",
) {
  return [...menuBoardItemsQueryRoot(popId), "articles", categoryId, search.trim(), source] as const
}

export function menuBoardRecipesQueryKey(
  popId: string,
  categoryId: string,
  search = "",
  source: "local" | "http" = "local",
) {
  return [...menuBoardItemsQueryRoot(popId), "recipes", categoryId, search.trim(), source] as const
}

export function menuBoardPromotionsQueryKey(
  popId: string,
  source: "local" | "http" = "local",
) {
  return [...menuBoardItemsQueryRoot(popId), "promotions", source] as const
}

export function menuBoardPromotionSplitQueryRoot(popId: string) {
  return [...menuBoardItemsQueryRoot(popId), "promotion-split"] as const
}

export function menuBoardPromotionSplitQueryKey(
  popId: string,
  source: "local" | "http" = "local",
) {
  return [...menuBoardPromotionSplitQueryRoot(popId), source] as const
}

export function purchaseCatalogItemsQueryKey(
  popId: string,
  filterKey: string,
) {
  return ["purchase-catalog", popId, "items", filterKey] as const
}

export function saleCatalogKnownArticlesQueryKey(
  popId: string,
  priceListId?: string,
) {
  return ["sale-catalog", popId, "known-articles", priceListId ?? "principal"] as const
}

export function menuCatalogKnownArticlesQueryKey(
  popId: string,
  priceListId?: string,
) {
  return ["menu-catalog", popId, "known-articles", priceListId ?? "principal"] as const
}

export function menuCatalogKnownRecipesQueryKey(
  popId: string,
  priceListId?: string,
) {
  return ["menu-catalog", popId, "known-recipes", priceListId ?? "principal"] as const
}

export function purchaseCatalogKnownArticlesQueryKey(popId: string) {
  return ["purchase-catalog", popId, "known-articles"] as const
}

export function serviceOperateCatalogQueryKey(popId: string) {
  return ["service-operate", popId, "catalog"] as const
}

export function serviceOperatePageQueryKey(popId: string) {
  return ["service-operate", popId, "page"] as const
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

export function userPopsAccessBatchQueryKey(userId: string) {
  return ["_user-pops-access-batch", userId] as const
}

export function userPopsQueryKey(userId: string) {
  return ["_user-pops", userId] as const
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

export function popMesasQueryRoot(popId: string) {
  return ["pop-mesas", popId] as const
}

export function popMesasLayoutQueryKey(popId: string) {
  return ["pop-mesas", popId, "layout"] as const
}

export function popMesasSessionsQueryKey(popId: string) {
  return ["pop-mesas", popId, "sessions"] as const
}

export function popMesasSessionQueryKey(popId: string, sessionId: string) {
  return ["pop-mesas", popId, "session", sessionId] as const
}

export function popMesasReservationsQueryKey(popId: string) {
  return ["pop-mesas", popId, "reservations"] as const
}

export function popMesasReservationSettingsQueryKey(popId: string) {
  return ["pop-mesas", popId, "reservation-settings"] as const
}

export function popMesasWaitersQueryKey(popId: string) {
  return ["pop-mesas", popId, "waiters"] as const
}

export function popMostradorQueryRoot(popId: string) {
  return ["pop-mostrador", popId] as const
}

export function popMostradorOrdersQueryKey(popId: string) {
  return ["pop-mostrador", popId, "orders"] as const
}

export function popMostradorOrderQueryKey(popId: string, orderId: string) {
  return ["pop-mostrador", popId, "order", orderId] as const
}

export function popComandasQueryRoot(popId: string) {
  return ["pop-comandas", popId] as const
}

export function popComandasStationsQueryKey(popId: string) {
  return ["pop-comandas", popId, "stations"] as const
}

export function popComandasTicketsQueryRoot(popId: string) {
  return ["pop-comandas", popId, "tickets"] as const
}

export function popComandasTicketsQueryKey(popId: string, stationId: string) {
  return ["pop-comandas", popId, "tickets", stationId] as const
}

export function popHrQueryRoot(popId: string) {
  return ["pop-hr", popId] as const
}

export function popHrDashboardQueryKey(popId: string) {
  return ["pop-hr", popId, "dashboard"] as const
}

export function popCashRegistersQueryRoot(popId: string) {
  return ["pop-cash-registers", popId] as const
}

export function popCashRegistersListQueryKey(popId: string) {
  return ["pop-cash-registers", popId, "list"] as const
}

export function popCashRegistersFormContextQueryKey(popId: string) {
  return ["pop-cash-registers", popId, "form-context"] as const
}

export function popAccountsQueryRoot(popId: string) {
  return ["pop-accounts", popId] as const
}

export function popAccountsListQueryKey(popId: string) {
  return ["pop-accounts", popId, "list"] as const
}

export function popChatQueryRoot(popId: string) {
  return ["pop-chat", popId] as const
}

export function popChatWorkspaceQueryKey(popId: string) {
  return ["pop-chat", popId, "workspace"] as const
}

export function popChatChannelQueryKey(popId: string, channelId: string) {
  return ["pop-chat", popId, "channel", channelId] as const
}

export function popChatMessagesQueryKey(popId: string, channelId: string) {
  return ["pop-chat", popId, "messages", channelId] as const
}

export function popArticleQueryKey(popId: string, articleId: string) {
  return ["pop-article", popId, articleId] as const
}

export function popArticleCategoriesQueryRoot(popId: string) {
  return ["pop-article-categories", popId] as const
}

export function popArticleCategoriesQueryKey(
  popId: string,
  source: "local" | "http" = "local",
) {
  return [...popArticleCategoriesQueryRoot(popId), source] as const
}

export function saleBoardCategoriesQueryRoot(popId: string) {
  return ["categories", popId, "sale-board"] as const
}

export function saleBoardCategoriesQueryKey(
  popId: string,
  source: "local" | "http" = "local",
) {
  return [...saleBoardCategoriesQueryRoot(popId), source] as const
}

export function saleBoardArticlesQueryRoot(popId: string) {
  return ["articles", popId, "sale-board"] as const
}

export function saleBoardArticlesQueryKey(
  popId: string,
  categoryId: string,
  search = "",
  source: "local" | "http" = "local",
) {
  return [
    ...saleBoardArticlesQueryRoot(popId),
    categoryId,
    search.trim(),
    source,
  ] as const
}

export function popLocalDbQueryRoot(popId: string) {
  return ["pop-local-db", popId] as const
}

export function popLocalArticlesHydrateQueryRoot(popId: string) {
  return [...popLocalDbQueryRoot(popId), "hydrate", "articles"] as const
}

export function popLocalArticlesHydrateQueryKey(popId: string) {
  return popLocalArticlesHydrateQueryRoot(popId)
}

export function popLocalCategoriesHydrateQueryKey(popId: string) {
  return [...popLocalDbQueryRoot(popId), "hydrate", "categories"] as const
}

export function popLocalPromotionsHydrateQueryKey(popId: string) {
  return [...popLocalDbQueryRoot(popId), "hydrate", "promotions"] as const
}

export function popLocalRecipesHydrateQueryKey(popId: string) {
  return [...popLocalDbQueryRoot(popId), "hydrate", "recipes"] as const
}

export function popLocalRecipeCategoriesHydrateQueryKey(popId: string) {
  return [...popLocalDbQueryRoot(popId), "hydrate", "recipe-categories"] as const
}

export function popLocalMesasFloorHydrateQueryKey(popId: string) {
  return [...popLocalDbQueryRoot(popId), "hydrate", "mesas-floor"] as const
}

export function popLocalMostradorBoardHydrateQueryKey(popId: string) {
  return [...popLocalDbQueryRoot(popId), "hydrate", "mostrador-board"] as const
}

export function popLocalComandasBoardHydrateQueryKey(popId: string) {
  return [...popLocalDbQueryRoot(popId), "hydrate", "comandas-board"] as const
}

export function saleBoardPromotionsQueryRoot(popId: string) {
  return ["promotions", popId, "sale-board"] as const
}

export function saleBoardPromotionsQueryKey(
  popId: string,
  source: "local" | "http" = "local",
) {
  return [...saleBoardPromotionsQueryRoot(popId), source] as const
}

export function popPriceListsQueryKey(popId: string) {
  return ["pop-price-lists", popId] as const
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
  filtersKey?: string
  fiscalOnly?: boolean
  filters?: OperationsListFiltersInput
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
    params.filtersKey ?? "",
    params.fiscalOnly ? "1" : "",
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
  cbteTipo: number | "recibo_x" | ""
  dateFrom: string | null
  dateTo: string | null
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
    params.cbteTipo,
    params.dateFrom,
    params.dateTo,
    params.sort,
    params.ord,
  ] as const
}

export function popInvoicesQueryRoot(popId: string) {
  return ["pop-invoices", popId] as const
}

export function popInvoicesFormContextQueryKey(popId: string) {
  return ["pop-invoices", popId, "form-context"] as const
}

export function popArcaFiscalConfigQueryKey(popId: string) {
  return ["pop-invoices", popId, "fiscal-config"] as const
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

export type PopSuppliersQueryParams = {
  page: number
  pageSize: number
  search: string
  soloActivos: boolean
  withEmail: boolean
  withTaxId: boolean
  sort: string | null
  ord: "asc" | "desc"
}

export function popSuppliersQueryKey(
  popId: string,
  params: PopSuppliersQueryParams,
) {
  return [
    "pop-suppliers",
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

export function popRecipeQueryKey(popId: string, recipeId: string) {
  return ["pop-recipe", popId, recipeId] as const
}

export function popRecipeCategoriesQueryKey(popId: string) {
  return ["pop-recipe-categories", popId] as const
}

export function popManufacturingQueryKey(
  popId: string,
  from: string | null,
  to: string | null,
) {
  return ["pop-manufacturing", popId, from, to] as const
}

export function popManufacturingQueryRoot(popId: string) {
  return ["pop-manufacturing", popId] as const
}

export function popComandaStationsQueryKey(popId: string) {
  return ["pop-comanda-stations", popId] as const
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

export function popPromotionQueryKey(popId: string, promotionId: string) {
  return ["pop-promotion", popId, promotionId] as const
}

export function popPromotionCatalogQueryKey(popId: string) {
  return ["pop-promotion-catalog", popId] as const
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

export function popServiceQueryKey(popId: string, serviceId: string) {
  return ["pop-service", popId, serviceId] as const
}

export function popServiceCategoriesQueryKey(popId: string) {
  return ["pop-service-categories", popId] as const
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

export function popQuoteDetailQueryKey(popId: string, quoteId: string) {
  return ["pop-quotes", popId, "detail", quoteId] as const
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

export function popPurchaseOrderDetailQueryKey(popId: string, orderId: string) {
  return ["pop-purchase-orders", popId, "detail", orderId] as const
}

export function popSettingsQueryKey(popId: string) {
  return ["pop-settings", popId] as const
}

export function popPrintersQueryKey(popId: string) {
  return ["pop-printers", popId] as const
}

export function popPrintersQueryRoot(popId: string) {
  return ["pop-printers", popId] as const
}

export function popExpensesQueryKey(
  popId: string,
  year: number,
  month1: number,
) {
  return ["pop-expenses", popId, year, month1] as const
}

export function popExpensesQueryRoot(popId: string) {
  return ["pop-expenses", popId] as const
}

export type PopInventoryRowsQueryParams = {
  view: string
  q: string
  attention: string
}

export function popInventoryRowsQueryKey(
  popId: string,
  params: PopInventoryRowsQueryParams,
) {
  return ["pop-inventory", popId, "rows", params] as const
}

export function popInventorySummaryQueryKey(popId: string) {
  return ["pop-inventory", popId, "summary"] as const
}

export function popInventoryQueryRoot(popId: string) {
  return ["pop-inventory", popId] as const
}

export function popInventoryMovementsQueryKey(popId: string) {
  return ["pop-inventory", popId, "movements"] as const
}

export function popInventoryLedgerLayersQueryKey(popId: string) {
  return ["pop-inventory", popId, "ledger", "layers"] as const
}

export function popInventoryLedgerAllocationsQueryKey(popId: string) {
  return ["pop-inventory", popId, "ledger", "allocations"] as const
}

export type PopInventoryExpiryQueryParams = {
  q: string
  filter: string
}

export function popInventoryExpiryQueryKey(
  popId: string,
  params: PopInventoryExpiryQueryParams,
) {
  return ["pop-inventory", popId, "expiry", params] as const
}

export function popInventoryLocationsQueryKey(popId: string) {
  return ["pop-inventory", popId, "locations"] as const
}

/** @deprecated Usar popClientsQueryKey */
export const popClientsTableQueryKey = popClientsQueryKey

/** @deprecated Usar popClientsQueryRoot */
export const popClientsTableQueryRoot = popClientsQueryRoot
