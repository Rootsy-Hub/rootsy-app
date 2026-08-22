"use server"

import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { siteIdFromPopRow } from "@/lib/popRoutes"
import { createClient } from "@/utils/supabase/server"
import { createServiceRoleClient } from "@/utils/supabase/service-role"

export type PopInvitationPreview =
  | {
      success: true
      popName: string
      email: string
      expired: boolean
      usable: boolean
    }
  | { success: false; error: string }

export async function getPopInvitationPreview(
  token: string,
): Promise<PopInvitationPreview> {
  const t = token?.trim()
  if (!t) return { success: false, error: "Enlace inválido." }

  try {
    const admin = createServiceRoleClient()
    const { data, error } = await admin
      .from("pop_invitations")
      .select("email, expires_at, status, pops:pop_id ( name )")
      .eq("token", t)
      .maybeSingle()

    if (error || !data) {
      return { success: false, error: "Invitación no encontrada." }
    }

    const pop = data.pops as unknown as { name: string } | null
    const expired =
      Boolean(data.expires_at) && new Date(data.expires_at).getTime() < Date.now()
    const usable = data.status === "pending" && !expired

    return {
      success: true,
      popName: pop?.name?.trim() || "este local",
      email: String(data.email || "").trim().toLowerCase(),
      expired,
      usable,
    }
  } catch {
    return { success: false, error: "No se pudo leer la invitación." }
  }
}

type AcceptPayload = {
  ok?: boolean
  error?: string
  pop_id?: string
}

export async function acceptPopInvitation(
  token: string,
): Promise<
  | { success: true; popId: string; siteId: string }
  | { success: false; error: string }
> {
  const t = token?.trim()
  if (!t) return { success: false, error: "Token no válido." }

  await requireAuthenticatedUser()

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("accept_pop_invitation", {
    p_token: t,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const payload = data as AcceptPayload | null
  if (!payload?.ok) {
    const code = payload?.error ?? "unknown"
    const messages: Record<string, string> = {
      not_authenticated: "Tenés que iniciar sesión.",
      no_email: "Tu cuenta no tiene correo asociado en Auth.",
      not_found: "Invitación no encontrada, vencida o ya utilizada.",
      wrong_email:
        "Esta invitación fue enviada a otro correo. Iniciá sesión con la cuenta correcta.",
    }
    return {
      success: false,
      error: messages[code] || "No se pudo aceptar la invitación.",
    }
  }

  const popId = String(payload.pop_id)
  const { data: popRow } = await supabase
    .from("pops")
    .select("site_id, settings")
    .eq("id", popId)
    .maybeSingle()
  return {
    success: true,
    popId,
    siteId: siteIdFromPopRow({
      site_id: popRow?.site_id as string | null | undefined,
      settings: popRow?.settings,
    }),
  }
}
