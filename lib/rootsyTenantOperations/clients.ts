import { createServiceRoleClient } from "@/utils/supabase/service-role"
import { requireRootsyPlatformPopId } from "@/lib/rootsyPlatformPop"
import type {
  EnsureRootsyPlatformClientInput,
  EnsureRootsyPlatformClientResult,
} from "@/lib/rootsyTenantOperations/types"

export async function ensureRootsyPlatformClient(
  input: EnsureRootsyPlatformClientInput,
): Promise<EnsureRootsyPlatformClientResult> {
  try {
    const supabase = createServiceRoleClient()
    const rootsyPopId = requireRootsyPlatformPopId()
    const organizationId = input.organizationId.trim()

    const { data: existingLink, error: linkError } = await supabase
      .from("_organization_rootsy_clients")
      .select("client_id")
      .eq("organization_id", organizationId)
      .maybeSingle()

    if (linkError) {
      return { ok: false, error: linkError.message }
    }
    if (existingLink?.client_id) {
      return {
        ok: true,
        clientId: String(existingLink.client_id),
        created: false,
      }
    }

    let ownerEmail = input.ownerEmail?.trim() || null
    if (!ownerEmail) {
      const { data: userData, error: userError } =
        await supabase.auth.admin.getUserById(input.ownerUserId)
      if (!userError && userData.user?.email) {
        ownerEmail = userData.user.email
      }
    }

    const clientName = input.organizationName.trim() || "Cliente Rootsy"

    const { data: insertedClient, error: insertError } = await supabase
      .from("clients")
      .insert({
        pop_id: rootsyPopId,
        name: clientName,
        email: ownerEmail,
        phone: null,
        tax_id: null,
        notes: "Cliente plataforma Rootsy",
        iva_condition: null,
        address_line: null,
        default_invoice_type_label: null,
        is_active: true,
      })
      .select("id")
      .single()

    if (insertError || !insertedClient?.id) {
      return {
        ok: false,
        error: insertError?.message ?? "No se pudo crear el cliente en el POP Rootsy.",
      }
    }

    const clientId = String(insertedClient.id)
    const { error: linkInsertError } = await supabase
      .from("_organization_rootsy_clients")
      .insert({
        organization_id: organizationId,
        rootsy_pop_id: rootsyPopId,
        client_id: clientId,
      })

    if (linkInsertError) {
      return { ok: false, error: linkInsertError.message }
    }

    return { ok: true, clientId, created: true }
  } catch (error: unknown) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

export async function ensureRootsyPlatformClientBestEffort(
  input: EnsureRootsyPlatformClientInput,
): Promise<string | null> {
  const result = await ensureRootsyPlatformClient(input)
  if (!result.ok) {
    console.warn(
      "[rootsyTenantOperations] ensureRootsyPlatformClient failed:",
      result.error,
    )
    return null
  }
  return result.clientId
}
