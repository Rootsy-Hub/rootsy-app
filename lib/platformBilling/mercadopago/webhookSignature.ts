import { createHmac, timingSafeEqual } from "node:crypto"

function normalizeDataId(dataId: string | null | undefined): string | null {
  if (!dataId?.trim()) return null
  const trimmed = dataId.trim()
  return /^[a-z0-9-]+$/i.test(trimmed) ? trimmed.toLowerCase() : trimmed
}

function parseSignatureHeader(
  signatureHeader: string | null | undefined,
): { ts: string | null; v1: string | null } {
  if (!signatureHeader?.trim()) {
    return { ts: null, v1: null }
  }

  const parts = signatureHeader.split(",").map((part) => part.trim())
  let ts: string | null = null
  let v1: string | null = null

  for (const part of parts) {
    const [key, value] = part.split("=", 2)
    if (!key || value == null) continue
    if (key === "ts") ts = value
    if (key === "v1") v1 = value
  }

  return { ts, v1 }
}

function buildManifest(input: {
  dataId: string | null
  requestId: string | null
  ts: string | null
}): string {
  const segments: string[] = []
  if (input.dataId) segments.push(`id:${input.dataId}`)
  if (input.requestId) segments.push(`request-id:${input.requestId}`)
  if (input.ts) segments.push(`ts:${input.ts}`)
  return `${segments.join(";")};`
}

export function verifyMercadoPagoWebhookSignature(input: {
  dataId?: string | null
  requestId?: string | null
  signatureHeader?: string | null
  secret?: string | null
}): boolean {
  const secret = input.secret?.trim()
  if (!secret) return false

  const { ts, v1 } = parseSignatureHeader(input.signatureHeader)
  if (!ts || !v1) return false

  const manifest = buildManifest({
    dataId: normalizeDataId(input.dataId),
    requestId: input.requestId?.trim() || null,
    ts,
  })

  const expected = createHmac("sha256", secret).update(manifest).digest("hex")

  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(v1, "utf8"),
    )
  } catch {
    return false
  }
}
