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
