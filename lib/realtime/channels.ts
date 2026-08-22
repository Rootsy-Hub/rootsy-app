const DOMAIN_RE = /^[a-z][a-z0-9-]{0,62}$/
const RESOURCE_TYPE_RE = /^[a-z][a-z0-9-]{0,62}$/
const RESOURCE_ID_RE = /^[A-Za-z0-9._:-]{1,64}$/
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function parseRealtimeChannel(raw: string): string | null {
  const channel = raw.trim()
  if (channel === "presence") return channel

  if (channel.startsWith("domain:")) {
    const domain = channel.slice("domain:".length)
    return DOMAIN_RE.test(domain) ? `domain:${domain}` : null
  }

  if (channel.startsWith("resource:")) {
    const rest = channel.slice("resource:".length)
    const sep = rest.indexOf(":")
    if (sep <= 0) return null
    const type = rest.slice(0, sep)
    const id = rest.slice(sep + 1)
    if (!RESOURCE_TYPE_RE.test(type) || !RESOURCE_ID_RE.test(id)) return null
    return `resource:${type}:${id}`
  }

  if (channel.startsWith("user:")) {
    const userId = channel.slice("user:".length)
    return UUID_RE.test(userId) ? `user:${userId}` : null
  }

  return null
}

export function normalizeRealtimeChannels(channels: readonly string[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const raw of channels) {
    const channel = parseRealtimeChannel(raw)
    if (!channel || seen.has(channel)) continue
    seen.add(channel)
    out.push(channel)
  }
  return out
}
