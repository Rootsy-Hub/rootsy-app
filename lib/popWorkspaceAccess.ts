import { POP_PERMS, permissionKeysInclude } from "@/lib/popPermissionConstants"

export type ModuleAccessSnapshot = {
  canRead: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

function moduleAccess(
  keys: readonly string[],
  read: { resource: string; action: string },
  create: { resource: string; action: string },
  update: { resource: string; action: string },
  del: { resource: string; action: string },
): ModuleAccessSnapshot {
  return {
    canRead: permissionKeysInclude(keys, read.resource, read.action),
    canCreate: permissionKeysInclude(keys, create.resource, create.action),
    canUpdate: permissionKeysInclude(keys, update.resource, update.action),
    canDelete: permissionKeysInclude(keys, del.resource, del.action),
  }
}

export function mesasAccessFromKeys(keys: readonly string[]): ModuleAccessSnapshot {
  return moduleAccess(
    keys,
    POP_PERMS.MESAS_READ,
    POP_PERMS.MESAS_CREATE,
    POP_PERMS.MESAS_UPDATE,
    POP_PERMS.MESAS_DELETE,
  )
}

export function inventoryAccessFromKeys(
  keys: readonly string[],
): ModuleAccessSnapshot {
  return moduleAccess(
    keys,
    POP_PERMS.INVENTORY_READ,
    POP_PERMS.INVENTORY_CREATE,
    POP_PERMS.INVENTORY_UPDATE,
    POP_PERMS.INVENTORY_DELETE,
  )
}

export function settingsAccessFromKeys(keys: readonly string[]): {
  canRead: boolean
  canUpdate: boolean
} {
  return {
    canRead: permissionKeysInclude(
      keys,
      POP_PERMS.SETTINGS_READ.resource,
      POP_PERMS.SETTINGS_READ.action,
    ),
    canUpdate: permissionKeysInclude(
      keys,
      POP_PERMS.SETTINGS_UPDATE.resource,
      POP_PERMS.SETTINGS_UPDATE.action,
    ),
  }
}

export function comandasAccessFromKeys(
  keys: readonly string[],
): ModuleAccessSnapshot {
  const mesas = mesasAccessFromKeys(keys)
  const mostrador = mostradorAccessFromKeys(keys)
  return {
    canRead: mesas.canRead || mostrador.canRead,
    canCreate: mesas.canCreate || mostrador.canCreate,
    canUpdate: mesas.canUpdate || mostrador.canUpdate,
    canDelete: mesas.canDelete || mostrador.canDelete,
  }
}

export function mostradorAccessFromKeys(
  keys: readonly string[],
): ModuleAccessSnapshot {
  return moduleAccess(
    keys,
    POP_PERMS.MOSTRADOR_READ,
    POP_PERMS.MOSTRADOR_CREATE,
    POP_PERMS.MOSTRADOR_UPDATE,
    POP_PERMS.MOSTRADOR_DELETE,
  )
}

export function hrAccessFromKeys(keys: readonly string[]): { canRead: boolean } {
  return {
    canRead: permissionKeysInclude(
      keys,
      POP_PERMS.HR_READ.resource,
      POP_PERMS.HR_READ.action,
    ),
  }
}

export function operationsAccessFromKeys(
  keys: readonly string[],
): ModuleAccessSnapshot {
  return moduleAccess(
    keys,
    POP_PERMS.OPERATIONS_READ,
    POP_PERMS.OPERATIONS_CREATE,
    POP_PERMS.OPERATIONS_UPDATE,
    POP_PERMS.OPERATIONS_DELETE,
  )
}

export function clientsAccessFromKeys(
  keys: readonly string[],
): ModuleAccessSnapshot {
  return moduleAccess(
    keys,
    POP_PERMS.CLIENT_READ,
    POP_PERMS.CLIENT_CREATE,
    POP_PERMS.CLIENT_UPDATE,
    POP_PERMS.CLIENT_DELETE,
  )
}

export function articlesAccessFromKeys(
  keys: readonly string[],
): ModuleAccessSnapshot {
  return moduleAccess(
    keys,
    POP_PERMS.ARTICLE_READ,
    POP_PERMS.ARTICLE_CREATE,
    POP_PERMS.ARTICLE_UPDATE,
    POP_PERMS.ARTICLE_DELETE,
  )
}

export function suppliersAccessFromKeys(
  keys: readonly string[],
): ModuleAccessSnapshot {
  return moduleAccess(
    keys,
    POP_PERMS.SUPPLIER_READ,
    POP_PERMS.SUPPLIER_CREATE,
    POP_PERMS.SUPPLIER_UPDATE,
    POP_PERMS.SUPPLIER_DELETE,
  )
}

export function recipesAccessFromKeys(
  keys: readonly string[],
): ModuleAccessSnapshot {
  return moduleAccess(
    keys,
    POP_PERMS.RECIPE_READ,
    POP_PERMS.RECIPE_CREATE,
    POP_PERMS.RECIPE_UPDATE,
    POP_PERMS.RECIPE_DELETE,
  )
}

export function promotionsAccessFromKeys(
  keys: readonly string[],
): ModuleAccessSnapshot {
  return moduleAccess(
    keys,
    POP_PERMS.PROMOTION_READ,
    POP_PERMS.PROMOTION_CREATE,
    POP_PERMS.PROMOTION_UPDATE,
    POP_PERMS.PROMOTION_DELETE,
  )
}

export function accountsAccessFromKeys(
  keys: readonly string[],
): ModuleAccessSnapshot {
  return moduleAccess(
    keys,
    POP_PERMS.ACCOUNTS_READ,
    POP_PERMS.ACCOUNTS_CREATE,
    POP_PERMS.ACCOUNTS_UPDATE,
    POP_PERMS.ACCOUNTS_DELETE,
  )
}

export function cashRegistersAccessFromKeys(
  keys: readonly string[],
): ModuleAccessSnapshot {
  return moduleAccess(
    keys,
    POP_PERMS.CASH_REGISTER_READ,
    POP_PERMS.CASH_REGISTER_CREATE,
    POP_PERMS.CASH_REGISTER_UPDATE,
    POP_PERMS.CASH_REGISTER_DELETE,
  )
}

export function expensesAccessFromKeys(
  keys: readonly string[],
): ModuleAccessSnapshot {
  return moduleAccess(
    keys,
    POP_PERMS.EXPENSES_READ,
    POP_PERMS.EXPENSES_CREATE,
    POP_PERMS.EXPENSES_UPDATE,
    POP_PERMS.EXPENSES_DELETE,
  )
}
