import { NextResponse } from "next/server"
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
import { rootsyApiErrorResponse } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string; accountId: string }> }

async function assertCanManageMercadoPagoConnection(
  popId: string,
  siteId: string,
  treasuryAccountId: string,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { ok: false, error: access.error || "Sin acceso", status: 403 }
  }
  const snap = await loadPopPermissionsSnapshot(popId)
  if (
    !permissionKeysInclude(
      snap.keys,
      POP_PERMS.PAYMENT_METHOD_UPDATE.resource,
      POP_PERMS.PAYMENT_METHOD_UPDATE.action,
    )
  ) {
    return {
      ok: false,
      error: "Sin permiso para conectar Mercado Pago.",
      status: 403,
    }
  }
  const popRes = await getPopById(popId)
  if (!popRes.success) {
    return {
      ok: false,
      error: popRes.error || "No se pudo validar el punto de venta.",
      status: 404,
    }
  }
  if (!siteIdsMatchClientRoute(siteId, popRes.pop.siteId)) {
    return {
      ok: false,
      error: "El sitio de la URL no coincide con el punto de venta.",
      status: 400,
    }
  }

  const supabase = await createClient()
  const { data: account, error } = await supabase
    .from("treasury_accounts")
    .select("id, name, kind, brand_key, parent_treasury_account_id")
    .eq("id", treasuryAccountId)
    .eq("pop_id", popId)
    .maybeSingle()
  if (error || !account?.id) {
    return { ok: false, error: "Cuenta no encontrada.", status: 404 }
  }
  if (account.parent_treasury_account_id) {
    return {
      ok: false,
      error: "La conexión se hace en la cuenta Mercado Pago, no en un terminal.",
      status: 400,
    }
  }
  const kind = isTreasuryAccountKind(String(account.kind))
    ? String(account.kind)
    : "other"
  if (kind !== "wallet") {
    return {
      ok: false,
      error: "Solo se puede conectar una billetera Mercado Pago.",
      status: 400,
    }
  }
  if (
    !treasuryAccountOffersMercadoPagoConnection({
      kind: "wallet",
      brandKey: account.brand_key != null ? String(account.brand_key) : null,
      name: String(account.name ?? ""),
    })
  ) {
    return {
      ok: false,
      error: "Esta cuenta no es una billetera Mercado Pago.",
      status: 400,
    }
  }

  await requireAuthenticatedUser()
  return { ok: true }
}

export async function POST(request: Request, ctx: RouteCtx) {
  try {
    const { popId, accountId } = await ctx.params
    const body = (await request.json().catch(() => null)) as {
      intent?: string
      siteId?: string
    } | null
    const intent = body?.intent
    const siteId = String(body?.siteId ?? "").trim()
    if (intent !== "connect" && intent !== "disconnect") {
      return NextResponse.json(
        { success: false, error: "Acción inválida." },
        { status: 400 },
      )
    }
    if (!siteId) {
      return NextResponse.json(
        { success: false, error: "Sitio inválido." },
        { status: 400 },
      )
    }

    const gate = await assertCanManageMercadoPagoConnection(
      popId,
      siteId,
      accountId,
    )
    if (!gate.ok) {
      return NextResponse.json(
        { success: false, error: gate.error },
        { status: gate.status },
      )
    }

    if (intent === "connect") {
      const commerce = getPopMercadoPagoCommerceConfig()
      if (!commerce.ok) {
        return NextResponse.json(
          { success: false, error: commerce.error },
          { status: 400 },
        )
      }
      const oauthState = createPopMercadoPagoOAuthState({
        popId,
        siteId,
        treasuryAccountId: accountId,
      })
      const cookieStore = await cookies()
      cookieStore.set(
        MP_COMMERCE_OAUTH_COOKIE,
        serializePopMercadoPagoOAuthState(oauthState),
        MP_COMMERCE_OAUTH_COOKIE_OPTIONS,
      )
      return NextResponse.json({
        success: true,
        url: buildPopMercadoPagoAuthorizeUrl({
          config: commerce.config,
          state: oauthState.state,
          verifier: oauthState.verifier,
        }),
      })
    }

    const supabase = await createClient()
    const { data: connection, error } = await supabase
      .from("pop_mercadopago_connections")
      .select("id")
      .eq("pop_id", popId)
      .eq("treasury_account_id", accountId)
      .maybeSingle()
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || "No se pudo leer la conexión." },
        { status: 500 },
      )
    }
    if (!connection?.id) {
      return NextResponse.json({ success: true })
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
      return NextResponse.json(
        {
          success: false,
          error: updateErr.message || "No se pudo desconectar Mercado Pago.",
        },
        { status: 500 },
      )
    }

    const service = createServiceRoleClient()
    await service
      .from("pop_mercadopago_connection_secrets")
      .delete()
      .eq("connection_id", connection.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
