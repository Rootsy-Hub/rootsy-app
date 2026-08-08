"use server"

import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { getPopById, validatePopAccess } from "@/lib/popHelpers"
import { createClient } from "@/utils/supabase/server"

type AccessiblePopRow = {
  pop_id: string
  pop_name: string
  role_id: string
  role_name: string
  is_owner: boolean
}

export type WorkspaceHeaderForPopResult =
  | {
      success: true
      popName: string
      userFullName: string
      userImageUrl: string | null
      roleLabel: string
    }
  | { success: false; error: string }

/**
 * Cabecera workspace: nombre PDV, perfil (users) y rol en este POP.
 * Misma fuente que la vista previa de layout para avatar y rol consistentes.
 */
export async function getWorkspaceHeaderForPop(
  popId: string,
): Promise<WorkspaceHeaderForPopResult> {
  try {
    const accessValidation = await validatePopAccess(popId)
    if (!accessValidation.hasAccess) {
      return {
        success: false,
        error:
          accessValidation.error || "No tienes acceso a este punto de venta.",
      }
    }
    if (!accessValidation.isActive) {
      return {
        success: false,
        error:
          accessValidation.error || "Este punto de venta no está activo.",
      }
    }

    const user = await requireAuthenticatedUser()
    const supabase = await createClient()

    const [popData, popsRes, profileRes] = await Promise.all([
      getPopById(popId),
      supabase.rpc("get_user_accessible_pops", { user_id: user.uid }),
      supabase
        .from("users")
        .select("first_name, last_name, image_url")
        .eq("id", user.uid)
        .maybeSingle(),
    ])

    if (!popData.success || !popData.pop) {
      return {
        success: false,
        error: popData.error || "No se pudo cargar el punto de venta.",
      }
    }

    const accessible = (popsRes.data as AccessiblePopRow[] | null) ?? []
    const popRow = accessible.find((p) => p.pop_id === popId)
    const roleLabel = popRow?.is_owner
      ? "Dueño"
      : (popRow?.role_name?.trim() || "Miembro")

    const profile = profileRes.data
    const fn = String(profile?.first_name ?? "")
    const ln = String(profile?.last_name ?? "")
    const fullName =
      `${fn} ${ln}`.trim() ||
      user.email?.split("@")[0] ||
      "Usuario"

    return {
      success: true,
      popName: String(popData.pop.name ?? ""),
      userFullName: fullName,
      userImageUrl: profile?.image_url ?? null,
      roleLabel,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
