import { createHmac, createHash, randomBytes, createCipheriv, createDecipheriv } from "node:crypto"
import { getAppBaseUrl } from "@/lib/appUrl"

export const MP_COMMERCE_CLIENT_ID_ENV = "MERCADOPAGO_COMMERCE_CLIENT_ID"
export const MP_COMMERCE_CLIENT_SECRET_ENV = "MERCADOPAGO_COMMERCE_CLIENT_SECRET"
export const MP_COMMERCE_TOKEN_KEY_ENV = "MERCADOPAGO_COMMERCE_TOKEN_KEY"
export const MP_COMMERCE_REDIRECT_URI_ENV = "MERCADOPAGO_COMMERCE_REDIRECT_URI"

export const MP_COMMERCE_OAUTH_COOKIE = "rootsy_mp_oauth"
export const MP_COMMERCE_CALLBACK_PATH = "/api/integrations/mercadopago/callback"

const MP_AUTH_URL = "https://auth.mercadopago.com/authorization"
const MP_API_BASE = "https://api.mercadopago.com"
const OAUTH_COOKIE_MAX_AGE_SEC = 10 * 60

export type PopMercadoPagoCommerceConfig = {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export function getPopMercadoPagoCommerceConfig():
  | { ok: true; config: PopMercadoPagoCommerceConfig }
  | { ok: false; error: string } {
  const clientId = process.env[MP_COMMERCE_CLIENT_ID_ENV]?.trim() || ""
  const clientSecret = process.env[MP_COMMERCE_CLIENT_SECRET_ENV]?.trim() || ""
  const redirectOverride = process.env[MP_COMMERCE_REDIRECT_URI_ENV]?.trim() || ""
  const redirectUri =
    redirectOverride || `${getAppBaseUrl()}${MP_COMMERCE_CALLBACK_PATH}`

  if (!clientId || !clientSecret) {
    return {
      ok: false,
      error:
        "Falta configurar Mercado Pago Commerce (MERCADOPAGO_COMMERCE_CLIENT_ID y CLIENT_SECRET).",
    }
  }

  return { ok: true, config: { clientId, clientSecret, redirectUri } }
}

export function isPopMercadoPagoCommerceConfigured(): boolean {
  return getPopMercadoPagoCommerceConfig().ok
}

function commerceCryptoKey(): Buffer {
  const raw = process.env[MP_COMMERCE_TOKEN_KEY_ENV]?.trim()
  if (raw) {
    if (/^[0-9a-f]{64}$/i.test(raw)) return Buffer.from(raw, "hex")
    return createHash("sha256").update(raw).digest()
  }
  const secret = process.env[MP_COMMERCE_CLIENT_SECRET_ENV]?.trim()
  if (secret) {
    return createHash("sha256").update(`rootsy-mp-commerce:${secret}`).digest()
  }
  throw new Error(
    "Falta MERCADOPAGO_COMMERCE_TOKEN_KEY o MERCADOPAGO_COMMERCE_CLIENT_SECRET.",
  )
}

export function encryptPopMercadoPagoSecret(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", commerceCryptoKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString("base64")
}

export function decryptPopMercadoPagoSecret(cipherText: string): string {
  const buf = Buffer.from(cipherText, "base64")
  if (buf.length < 28) {
    throw new Error("Secreto de Mercado Pago inválido.")
  }
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const encrypted = buf.subarray(28)
  const decipher = createDecipheriv("aes-256-gcm", commerceCryptoKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")
}

export type PopMercadoPagoOAuthState = {
  state: string
  verifier: string
  popId: string
  siteId: string
  treasuryAccountId: string
  exp: number
}

function signOAuthPayload(payload: string): string {
  return createHmac("sha256", commerceCryptoKey()).update(payload).digest("base64url")
}

export function createPopMercadoPagoOAuthState(input: {
  popId: string
  siteId: string
  treasuryAccountId: string
}): PopMercadoPagoOAuthState {
  const verifier = randomBytes(32).toString("base64url")
  return {
    state: randomBytes(16).toString("base64url"),
    verifier,
    popId: input.popId,
    siteId: input.siteId,
    treasuryAccountId: input.treasuryAccountId,
    exp: Date.now() + OAUTH_COOKIE_MAX_AGE_SEC * 1000,
  }
}

export function serializePopMercadoPagoOAuthState(
  value: PopMercadoPagoOAuthState,
): string {
  const payload = Buffer.from(JSON.stringify(value), "utf8").toString("base64url")
  return `${payload}.${signOAuthPayload(payload)}`
}

export function parsePopMercadoPagoOAuthState(
  raw: string | undefined | null,
): PopMercadoPagoOAuthState | null {
  if (!raw) return null
  const dot = raw.lastIndexOf(".")
  if (dot < 1) return null
  const payload = raw.slice(0, dot)
  const mac = raw.slice(dot + 1)
  if (signOAuthPayload(payload) !== mac) return null
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as PopMercadoPagoOAuthState
    if (
      !parsed.state ||
      !parsed.verifier ||
      !parsed.popId ||
      !parsed.siteId ||
      !parsed.treasuryAccountId
    ) {
      return null
    }
    if (parsed.exp < Date.now()) return null
    return parsed
  } catch {
    return null
  }
}

function pkceChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url")
}

export function buildPopMercadoPagoAuthorizeUrl(input: {
  config: PopMercadoPagoCommerceConfig
  state: string
  verifier: string
}): string {
  const url = new URL(MP_AUTH_URL)
  url.searchParams.set("client_id", input.config.clientId)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("platform_id", "mp")
  url.searchParams.set("state", input.state)
  url.searchParams.set("redirect_uri", input.config.redirectUri)
  url.searchParams.set("code_challenge", pkceChallenge(input.verifier))
  url.searchParams.set("code_challenge_method", "S256")
  return url.toString()
}

export const MP_COMMERCE_OAUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: OAUTH_COOKIE_MAX_AGE_SEC,
}

type MercadoPagoOAuthTokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  user_id?: number | string
  public_key?: string
  scope?: string
  message?: string
  error?: string
  error_description?: string
}

export type PopMercadoPagoOAuthTokens = {
  accessToken: string
  refreshToken: string
  expiresAt: string | null
  mpUserId: string
  publicKey: string | null
  scopes: string | null
}

function parseOAuthTokenResponse(
  data: MercadoPagoOAuthTokenResponse,
): PopMercadoPagoOAuthTokens | { error: string } {
  const accessToken = String(data.access_token ?? "").trim()
  const refreshToken = String(data.refresh_token ?? "").trim()
  const mpUserId = String(data.user_id ?? "").trim()
  if (!accessToken || !refreshToken || !mpUserId) {
    return {
      error:
        data.message ||
        data.error_description ||
        data.error ||
        "Mercado Pago no devolvió las credenciales de la cuenta.",
    }
  }
  const expiresIn = Number(data.expires_in)
  const expiresAt =
    Number.isFinite(expiresIn) && expiresIn > 0
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null
  return {
    accessToken,
    refreshToken,
    expiresAt,
    mpUserId,
    publicKey: data.public_key ? String(data.public_key) : null,
    scopes: data.scope ? String(data.scope) : null,
  }
}

export async function exchangePopMercadoPagoAuthorizationCode(input: {
  config: PopMercadoPagoCommerceConfig
  code: string
  verifier: string
}): Promise<PopMercadoPagoOAuthTokens | { error: string }> {
  const response = await fetch(`${MP_API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: input.config.clientId,
      client_secret: input.config.clientSecret,
      grant_type: "authorization_code",
      code: input.code,
      redirect_uri: input.config.redirectUri,
      code_verifier: input.verifier,
    }),
  })
  const data = (await response.json().catch(() => ({}))) as MercadoPagoOAuthTokenResponse
  if (!response.ok) {
    return {
      error:
        data.message ||
        data.error_description ||
        data.error ||
        "No se pudo autorizar la cuenta de Mercado Pago.",
    }
  }
  return parseOAuthTokenResponse(data)
}

export async function refreshPopMercadoPagoAccessToken(input: {
  config: PopMercadoPagoCommerceConfig
  refreshToken: string
}): Promise<PopMercadoPagoOAuthTokens | { error: string }> {
  const response = await fetch(`${MP_API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: input.config.clientId,
      client_secret: input.config.clientSecret,
      grant_type: "refresh_token",
      refresh_token: input.refreshToken,
    }),
  })
  const data = (await response.json().catch(() => ({}))) as MercadoPagoOAuthTokenResponse
  if (!response.ok) {
    return {
      error:
        data.message ||
        data.error_description ||
        data.error ||
        "No se pudo renovar la autorización de Mercado Pago.",
    }
  }
  return parseOAuthTokenResponse(data)
}

export async function fetchMercadoPagoSellerProfile(
  accessToken: string,
): Promise<{ email: string | null } | { error: string }> {
  const response = await fetch(`${MP_API_BASE}/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  })
  if (!response.ok) {
    return { error: "No se pudo leer el usuario de Mercado Pago." }
  }
  const data = (await response.json().catch(() => ({}))) as {
    email?: string
  }
  const email = String(data.email ?? "").trim()
  return { email: email || null }
}

export function popMercadoPagoAccountReturnPath(input: {
  siteId: string
  popId: string
  treasuryAccountId: string
  result: "connected" | "error"
  error?: string
}): string {
  const url = new URL(
    `/${input.siteId}/${input.popId}/accounts/${input.treasuryAccountId}`,
    "http://local.invalid",
  )
  url.searchParams.set("mp", input.result)
  if (input.result === "error" && input.error) {
    url.searchParams.set("mp_error", input.error.slice(0, 180))
  }
  return `${url.pathname}${url.search}`
}
