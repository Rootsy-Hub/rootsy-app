"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopById, validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { siteIdsMatchClientRoute } from "@/lib/popRoutes"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { treasuryAccountOffersMercadoPagoConnection } from "@/lib/popMercadoPago"
import {
  MP_COMMERCE_OAUTH_COOKIE,
  MP_COMMERCE_OAUTH_COOKIE_OPTIONS,
  buildPopMercadoPagoAuthorizeUrl,
  createPopMercadoPagoOAuthState,
  getPopMercadoPagoCommerceConfig,
  serializePopMercadoPagoOAuthState,
} from "@/lib/popMercadoPagoCommerce"
import { createClient } from "@/utils/supabase/server"
import { createServiceRoleClient } from "@/utils/supabase/service-role"
import { cookies } from "next/headers"
import { isTreasuryAccountKind } from "@/lib/treasuryAccountKinds"

async function assertCanManageMercadoPagoConnection(
  popId: string,
  siteId: string,
  treasuryAccountId: string,
): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: string }
> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { ok: false, error: access.error || "Sin acceso" }
  }
  const snap = await loadPopPermissionsSnapshot(popId)
  if (
    !permissionKeysInclude(
      snap.keys,
      POP_PERMS.PAYMENT_METHOD_UPDATE.resource,
      POP_PERMS.PAYMENT_METHOD_UPDATE.action,
    )
  ) {
    return { ok: false, error: "Sin permiso para conectar Mercado Pago." }
  }
  const popRes = await getPopById(popId)
  if (!popRes.success) {
    return { ok: false, error: popRes.error || "No se pudo validar el punto de venta." }
  }
  if (!siteIdsMatchClientRoute(siteId, popRes.pop.siteId)) {
    return { ok: false, error: "El sitio de la URL no coincide con el punto de venta." }
  }

  const supabase = await createClient()
  const { data: account, error } = await supabase
    .from("treasury_accounts")
    .select("id, name, kind, brand_key, parent_treasury_account_id")
    .eq("id", treasuryAccountId)
    .eq("pop_id", popId)
    .maybeSingle()
  if (error || !account?.id) {
    return { ok: false, error: "Cuenta no encontrada." }
  }
  if (account.parent_treasury_account_id) {
    return { ok: false, error: "La conexión se hace en la cuenta Mercado Pago, no en un terminal." }
  }
  const kind = isTreasuryAccountKind(String(account.kind))
    ? String(account.kind)
    : "other"
  if (kind !== "wallet") {
    return { ok: false, error: "Solo se puede conectar una billetera Mercado Pago." }
  }
  if (
    !treasuryAccountOffersMercadoPagoConnection({
      kind: "wallet",
      brandKey: account.brand_key != null ? String(account.brand_key) : null,
      name: String(account.name ?? ""),
    })
  ) {
    return { ok: false, error: "Esta cuenta no es una billetera Mercado Pago." }
  }

  const user = await requireAuthenticatedUser()
  return { ok: true, userId: user.uid }
}

export async function startPopMercadoPagoConnect(
  popId: string,
  siteId: string,
  treasuryAccountId: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const gate = await assertCanManageMercadoPagoConnection(
      popId,
      siteId,
      treasuryAccountId,
    )
    if (!gate.ok) return { success: false, error: gate.error }

    const commerce = getPopMercadoPagoCommerceConfig()
    if (!commerce.ok) return { success: false, error: commerce.error }

    const oauthState = createPopMercadoPagoOAuthState({
      popId,
      siteId,
      treasuryAccountId,
    })
    const cookieStore = await cookies()
    cookieStore.set(
      MP_COMMERCE_OAUTH_COOKIE,
      serializePopMercadoPagoOAuthState(oauthState),
      MP_COMMERCE_OAUTH_COOKIE_OPTIONS,
    )

    return {
      success: true,
      url: buildPopMercadoPagoAuthorizeUrl({
        config: commerce.config,
        state: oauthState.state,
        verifier: oauthState.verifier,
      }),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function disconnectPopMercadoPago(
  popId: string,
  siteId: string,
  treasuryAccountId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const gate = await assertCanManageMercadoPagoConnection(
      popId,
      siteId,
      treasuryAccountId,
    )
    if (!gate.ok) return { success: false, error: gate.error }

    const supabase = await createClient()
    const { data: connection, error } = await supabase
      .from("pop_mercadopago_connections")
      .select("id")
      .eq("pop_id", popId)
      .eq("treasury_account_id", treasuryAccountId)
      .maybeSingle()
    if (error) {
      return { success: false, error: error.message || "No se pudo leer la conexión." }
    }
    if (!connection?.id) {
      return { success: true }
    }

    const { error: updateErr } = await supabase
      .from("pop_mercadopago_connections")
      .update({
        status: "disconnected",
        disconnected_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", connection.id)
      .eq("pop_id", popId)
    if (updateErr) {
      return {
        success: false,
        error: updateErr.message || "No se pudo desconectar Mercado Pago.",
      }
    }

    const service = createServiceRoleClient()
    await service
      .from("pop_mercadopago_connection_secrets")
      .delete()
      .eq("connection_id", connection.id)

    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
