import type { PopAccessCache } from "@/app/home/homeUserDataTypes"
import { POP_ACCESS_MODULE_TO_PAGE_KEY } from "@/lib/popAccessModuleMap"
import {
  allUniquePermissionKeys,
  POP_PAGES,
  type PopPageKey,
  type PopPagePermissionMap,
} from "@/lib/popPageCrudConstants"
import { permissionKeysInclude } from "@/lib/popPermissionConstants"

/** Permisos planos (`resource:action`) derivados de `_pop-access`. */
export function permissionKeysFromPopAccess(access: PopAccessCache): string[] {
  if (access.isOwner) {
    return allUniquePermissionKeys()
  }

  const keys = new Set<string>()
  for (const mod of access.enabledModules) {
    if (!mod.permissions) continue
    const pageKey = POP_ACCESS_MODULE_TO_PAGE_KEY[mod.key]
    if (!pageKey) continue
    const perms = POP_PAGES[pageKey as PopPageKey]?.permissions as
      | PopPagePermissionMap
      | undefined
    if (!perms) continue
    if (mod.permissions.read && perms.read) keys.add(perms.read)
    if (mod.permissions.create && perms.create) keys.add(perms.create)
    if (mod.permissions.update && perms.update) keys.add(perms.update)
    if (mod.permissions.delete && perms.delete) keys.add(perms.delete)
  }
  return [...keys]
}

export function hasPopAccessPermission(
  access: PopAccessCache,
  resource: string,
  action: string,
): boolean {
  return permissionKeysInclude(
    permissionKeysFromPopAccess(access),
    resource,
    action,
  )
}
