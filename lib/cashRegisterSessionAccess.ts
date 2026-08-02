import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"

/** Lectura, alta, edición y baja de cajas (supervisor). */
export function hasFullCashRegisterPermissions(
  keys: readonly string[],
): boolean {
  return (
    permissionKeysInclude(
      keys,
      POP_PERMS.CASH_REGISTER_READ.resource,
      POP_PERMS.CASH_REGISTER_READ.action,
    ) &&
    permissionKeysInclude(
      keys,
      POP_PERMS.CASH_REGISTER_CREATE.resource,
      POP_PERMS.CASH_REGISTER_CREATE.action,
    ) &&
    permissionKeysInclude(
      keys,
      POP_PERMS.CASH_REGISTER_UPDATE.resource,
      POP_PERMS.CASH_REGISTER_UPDATE.action,
    ) &&
    permissionKeysInclude(
      keys,
      POP_PERMS.CASH_REGISTER_DELETE.resource,
      POP_PERMS.CASH_REGISTER_DELETE.action,
    )
  )
}

export function canCloseCashRegisterSession(input: {
  currentUserId: string
  openedByUserId: string | null
  permissionKeys: readonly string[]
}): boolean {
  if (
    !permissionKeysInclude(
      input.permissionKeys,
      POP_PERMS.CASH_REGISTER_UPDATE.resource,
      POP_PERMS.CASH_REGISTER_UPDATE.action,
    )
  ) {
    return false
  }
  if (
    input.openedByUserId != null &&
    input.openedByUserId === input.currentUserId
  ) {
    return true
  }
  return hasFullCashRegisterPermissions(input.permissionKeys)
}
