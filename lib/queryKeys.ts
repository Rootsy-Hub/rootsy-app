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
  return ["user-profile", userId] as const
}

export function userPopsQueryKey(userId: string) {
  return ["user-pops", userId] as const
}

export function popSubscriptionQueryKey(popId: string) {
  return ["pop-subscription", popId] as const
}

export function canUserCreatePopQueryKey(userId: string) {
  return ["can-user-create-pop", userId] as const
}
