/** Cache `user-profile` — solo nombre, apellido y foto. */
export type UserProfileCache = {
  firstName: string
  lastName: string
  imageUrl: string | null
}

/** Cache `user-pops-owner` / fila pops en `user-pops`. */
export type UserPopCacheRow = {
  id: string
  name: string
  imageUrl: string | null
  isActive: boolean
  businessTypeId: string | null
  subscriptionId: string | null
  siteId: string
  streetAddress: string | null
}

/** Rol del usuario en un POP (cache dentro de `user-pops`). */
export type UserPopRoleCache = {
  name: string
  displayName: string
  permissionGrants: string[]
}

/** Membresía activa: pop + rol validado. */
export type UserPopMembershipCache = {
  pop: UserPopCacheRow
  role: UserPopRoleCache
}
