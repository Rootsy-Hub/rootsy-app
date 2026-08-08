import { NextResponse } from "next/server"
import { handleMercadoPagoWebhook } from "@/lib/platformBilling/mercadopago/webhookHandler"
import type { MercadoPagoWebhookPayload } from "@/lib/platformBilling/mercadopago/types"

export const runtime = "nodejs"

function readQueryParam(url: URL, key: string): string | null {
  return url.searchParams.get(key)?.trim() || null
}

export async function GET() {
  return NextResponse.json({ ok: true, provider: "mercadopago" })
}

export async function POST(request: Request) {
  let body: MercadoPagoWebhookPayload

  try {
    body = (await request.json()) as MercadoPagoWebhookPayload
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const url = new URL(request.url)
  const result = await handleMercadoPagoWebhook({
    url: request.url,
    body,
    dataId: readQueryParam(url, "data.id"),
    topic: readQueryParam(url, "type"),
    signatureHeader: request.headers.get("x-signature"),
    requestId: request.headers.get("x-request-id"),
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status })
  }

  return NextResponse.json({ ok: true, message: result.message })
}
