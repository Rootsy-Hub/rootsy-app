/** Cache `_user-profile` — nombre, apellido y foto. */
export type UserProfileCache = {
  firstName: string
  lastName: string
  imageUrl: string | null
}

/** Cache `_user-pop-ids` — POPs accesibles (owner + miembro). */
export type UserPopIdsCache = string[]

export type PopAccessModulePermissions = {
  read: boolean
  create: boolean
  update: boolean
  delete: boolean
}

export type PopAccessModule = {
  key: string
  label: string
  section: "operar" | "administrar" | "configurar" | "extras"
  isExtra: boolean
  permissions: PopAccessModulePermissions | null
}

export type PopAccessLimits = {
  maxUsers: number
  maxUsersLabel: string
  maxArticles: number
  maxArticlesLabel: string
  maxOperationsPerMonth: number
  maxOperationsPerMonthLabel: string
  allModules: boolean
}

export type PopAccessSubscription = {
  status: string
  planName: string
  planDisplayName: string
  businessTypeName: string
  businessTypeDisplayName: string
  daysRemaining: number | null
  isActive: boolean
  trialEndsAt: string | null
  currentPeriodEnd: string | null
}

export type PopAccessRole = {
  name: string
  displayName: string
  permissionGrants: string[]
}

import type { PopEmisorIvaCondition } from "@/lib/saleComprobanteRules"

export type PopAccessFiscal = {
  hasValidCuit: boolean
  emisorIvaCondition: PopEmisorIvaCondition
}

/** Cache `_pop-access` por popId. */
export type PopAccessCache = {
  pop: {
    id: string
    name: string
    imageUrl: string | null
    backgroundImageUrl: string | null
    siteId: string
    streetAddress: string | null
    isActive: boolean
  }
  subscription: PopAccessSubscription
  enabledModules: PopAccessModule[]
  limits: PopAccessLimits
  fiscal: PopAccessFiscal
  isOwner: boolean
  role: PopAccessRole | null
  canEnter: boolean
  permissionsRev?: number
}

/** Cache `_user-pops-access-batch` — IDs + access de todos los POPs. */
export type UserPopsAccessBatchCache = {
  popIds: string[]
  accessByPopId: Record<string, PopAccessCache>
}

export type HomePopListItem = {
  id: string
  siteId: string
  name: string
  imageUrl: string | null
  roleName: string
  isOwner: boolean
  canEnter: boolean
  subscription: PopAccessSubscription
  enabledModules: PopAccessModule[]
  limits: PopAccessLimits
  role: PopAccessRole | null
}
