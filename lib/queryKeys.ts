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
  ] as const
}

export function popClientsQueryRoot(popId: string) {
  return ["pop-clients", popId] as const
}

/** @deprecated Usar popClientsQueryKey */
export const popClientsTableQueryKey = popClientsQueryKey

/** @deprecated Usar popClientsQueryRoot */
export const popClientsTableQueryRoot = popClientsQueryRoot
