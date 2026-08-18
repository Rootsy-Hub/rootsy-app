import { NextResponse } from "next/server"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopById, validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { siteIdsMatchClientRoute } from "@/lib/popRoutes"
import {
  MP_COMMERCE_OAUTH_COOKIE,
  encryptPopMercadoPagoSecret,
  exchangePopMercadoPagoAuthorizationCode,
  fetchMercadoPagoSellerProfile,
  getPopMercadoPagoCommerceConfig,
  parsePopMercadoPagoOAuthState,
  popMercadoPagoAccountReturnPath,
} from "@/lib/popMercadoPagoCommerce"
import { createClient } from "@/utils/supabase/server"
import { createServiceRoleClient } from "@/utils/supabase/service-role"
import { cookies } from "next/headers"

export const runtime = "nodejs"

function redirectToAccount(
  request: Request,
  path: string,
): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.url))
  response.cookies.delete(MP_COMMERCE_OAUTH_COOKIE)
  return response
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")?.trim() || ""
  const state = url.searchParams.get("state")?.trim() || ""
  const mpError =
    url.searchParams.get("error_description")?.trim() ||
    url.searchParams.get("error")?.trim() ||
    ""

  const cookieStore = await cookies()
  const rawCookie = cookieStore.get(MP_COMMERCE_OAUTH_COOKIE)?.value
  const oauthState = parsePopMercadoPagoOAuthState(rawCookie)

  if (!oauthState) {
    return redirectToAccount(request, "/pops")
  }

  const returnTo = (result: "connected" | "error", error?: string) =>
    redirectToAccount(
      request,
      popMercadoPagoAccountReturnPath({
        siteId: oauthState.siteId,
        popId: oauthState.popId,
        treasuryAccountId: oauthState.treasuryAccountId,
        result,
        error,
      }),
    )

  if (mpError) {
    return returnTo("error", mpError)
  }
  if (!code || !state || state !== oauthState.state) {
    return returnTo("error", "La autorización de Mercado Pago no es válida o venció.")
  }

  const access = await validatePopAccess(oauthState.popId)
  if (!access.hasAccess || !access.isActive) {
    return returnTo("error", access.error || "Sin acceso")
  }
  const snap = await loadPopPermissionsSnapshot(oauthState.popId)
  if (
    !permissionKeysInclude(
      snap.keys,
      POP_PERMS.PAYMENT_METHOD_UPDATE.resource,
      POP_PERMS.PAYMENT_METHOD_UPDATE.action,
    )
  ) {
    return returnTo("error", "Sin permiso para conectar Mercado Pago.")
  }
  const popRes = await getPopById(oauthState.popId)
  if (
    !popRes.success ||
    !popRes.pop ||
    !siteIdsMatchClientRoute(oauthState.siteId, popRes.pop.siteId)
  ) {
    return returnTo("error", "El sitio no coincide con el punto de venta.")
  }

  const commerce = getPopMercadoPagoCommerceConfig()
  if (!commerce.ok) return returnTo("error", commerce.error)

  const tokens = await exchangePopMercadoPagoAuthorizationCode({
    config: commerce.config,
    code,
    verifier: oauthState.verifier,
  })
  if ("error" in tokens) return returnTo("error", tokens.error)

  const profile = await fetchMercadoPagoSellerProfile(tokens.accessToken)
  const email = "email" in profile ? profile.email : null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) {
    return returnTo("error", "Sesión requerida. Volvé a conectar Mercado Pago.")
  }

  const { data: existing } = await supabase
    .from("pop_mercadopago_connections")
    .select("id")
    .eq("pop_id", oauthState.popId)
    .eq("treasury_account_id", oauthState.treasuryAccountId)
    .maybeSingle()

  const now = new Date().toISOString()
  const connectionFields = {
    pop_id: oauthState.popId,
    treasury_account_id: oauthState.treasuryAccountId,
    status: "connected",
    mp_user_id: tokens.mpUserId,
    mp_email: email,
    connected_at: now,
    disconnected_at: null,
    last_error: null,
  }

  let connectionId = existing?.id ? String(existing.id) : ""
  if (connectionId) {
    const { error: updateErr } = await supabase
      .from("pop_mercadopago_connections")
      .update(connectionFields)
      .eq("id", connectionId)
      .eq("pop_id", oauthState.popId)
    if (updateErr) return returnTo("error", updateErr.message)
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from("pop_mercadopago_connections")
      .insert({
        ...connectionFields,
        created_by: user.id,
      })
      .select("id")
      .single()
    if (insertErr || !inserted?.id) {
      if (insertErr?.message?.includes("idx_pop_mp_connections_user_connected")) {
        return returnTo(
          "error",
          "Esa cuenta de Mercado Pago ya está conectada en otra billetera de este punto.",
        )
      }
      return returnTo(
        "error",
        insertErr?.message || "No se pudo guardar la conexión.",
      )
    }
    connectionId = String(inserted.id)
  }

  try {
    const service = createServiceRoleClient()
    const { error: secretErr } = await service
      .from("pop_mercadopago_connection_secrets")
      .upsert({
        connection_id: connectionId,
        access_token_cipher: encryptPopMercadoPagoSecret(tokens.accessToken),
        refresh_token_cipher: encryptPopMercadoPagoSecret(tokens.refreshToken),
        token_expires_at: tokens.expiresAt,
        mp_public_key: tokens.publicKey,
        scopes: tokens.scopes,
      })
    if (secretErr) {
      await supabase
        .from("pop_mercadopago_connections")
        .update({
          status: "expired",
          last_error: "No se pudieron guardar las credenciales.",
        })
        .eq("id", connectionId)
      return returnTo("error", "Se autorizó Mercado Pago pero no se pudieron guardar las credenciales.")
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "No se pudieron guardar las credenciales."
    return returnTo("error", message)
  }

  return returnTo("connected")
}
