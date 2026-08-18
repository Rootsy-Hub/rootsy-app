import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { validatePopAccess } from "@/lib/popHelpers"
import { permissionKeysInclude } from "@/lib/popPermissionConstants"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"

export type RequirePopActionPermission = {
  resource: string
  action: string
}

export type RequirePopActionOk = {
  ok: true
  user: { uid: string; email: string | undefined }
  keys: string[]
}

export type RequirePopActionErr = {
  ok: false
  error: string
  redirect?: string
}

export type RequirePopActionResult = RequirePopActionOk | RequirePopActionErr

/**
 * Auth + access + (opcional) un permiso, en un paso.
 * Access y permisos van en paralelo.
 */
export async function requirePopAction(
  popId: string,
  permission?: RequirePopActionPermission,
): Promise<RequirePopActionResult> {
  const user = await requireAuthenticatedUser()
  const [access, snapshot] = await Promise.all([
    validatePopAccess(popId),
    loadPopPermissionsSnapshot(popId),
  ])

  if (!access.hasAccess) {
    return {
      ok: false,
      error: access.error || "Sin acceso",
      redirect: "/home",
    }
  }
  if (!access.isActive) {
    return {
      ok: false,
      error: access.error || "Este punto de venta no está activo.",
    }
  }
  if (
    permission &&
    !permissionKeysInclude(snapshot.keys, permission.resource, permission.action)
  ) {
    return { ok: false, error: "Sin permiso." }
  }

  return { ok: true, user, keys: snapshot.keys }
}
