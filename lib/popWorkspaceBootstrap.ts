"use server"

import { fetchPopCacheRevisions, type PopCacheRevisions } from "@/lib/popCacheRevisions"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { popMenuHref, siteIdsMatchClientRoute } from "@/lib/popRoutes"
import { createClient } from "@/utils/supabase/server"

type AccessiblePopRow = {
  pop_id: string
  pop_name: string
  role_id: string
  role_name: string
  is_owner: boolean
}

export type PopWorkspaceBootstrapData = {
  popId: string
  siteId: string
  popName: string
  hasAccess: boolean
  isPopActive: boolean
  userFullName: string
  userImageUrl: string | null
  roleLabel: string
  permissionKeys: string[]
  cacheRevisions: PopCacheRevisions
}

export type PopWorkspaceBootstrapResult =
  | { success: true; data: PopWorkspaceBootstrapData }
  | { success: false; error: string; redirect?: string }

export async function getPopWorkspaceBootstrap(
  popId: string,
  routeSiteId: string,
): Promise<PopWorkspaceBootstrapResult> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess) {
    return {
      success: false,
      error: access.error || "No tenés acceso a este punto de venta.",
      redirect: "/home",
    }
  }
  if (!access.isActive) {
    return {
      success: false,
      error:
        access.error ||
        "Este punto de venta no está activo. Actualizá tu suscripción para continuar.",
    }
  }

  const popSiteId = await getPopSiteId(popId)
  if (!popSiteId) {
    return { success: false, error: "Punto de venta no encontrado." }
  }
  if (!siteIdsMatchClientRoute(routeSiteId, popSiteId)) {
    return {
      success: false,
      error: "Ruta inválida para este punto de venta.",
      redirect: popMenuHref(popSiteId, popId),
    }
  }

  try {
    const user = await requireAuthenticatedUser()
    const supabase = await createClient()

    const [accessiblePopsRes, profileRes, permissions, cacheRevisions] =
      await Promise.all([
      supabase.rpc("get_user_accessible_pops", { user_id: user.uid }),
      supabase
        .from("users")
        .select("first_name, last_name, image_url")
        .eq("id", user.uid)
        .maybeSingle(),
      loadPopPermissionsSnapshot(popId),
      fetchPopCacheRevisions(popId),
    ])

    const accessible = (accessiblePopsRes.data as AccessiblePopRow[] | null) ?? []
    const popRow = accessible.find((row) => row.pop_id === popId)

    let popName = popRow?.pop_name?.trim() ?? ""
    if (!popName) {
      const { data: popData } = await supabase
        .from("pops")
        .select("name")
        .eq("id", popId)
        .maybeSingle()
      popName = String(popData?.name ?? "").trim()
    }

    const roleLabel = popRow?.is_owner
      ? "Dueño"
      : (popRow?.role_name?.trim() || "Miembro")

    const profile = profileRes.data
    const fn = String(profile?.first_name ?? "")
    const ln = String(profile?.last_name ?? "")
    const userFullName =
      `${fn} ${ln}`.trim() ||
      user.email?.split("@")[0] ||
      "Usuario"

    return {
      success: true,
      data: {
        popId,
        siteId: popSiteId,
        popName,
        hasAccess: true,
        isPopActive: true,
        userFullName,
        userImageUrl: profile?.image_url ?? null,
        roleLabel,
        permissionKeys: permissions.keys,
        cacheRevisions,
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
