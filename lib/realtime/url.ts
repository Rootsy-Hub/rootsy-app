export function popRealtimeBaseUrl(): string | null {
  const base =
    process.env.NEXT_PUBLIC_ROOTSY_REALTIME_URL?.trim() ||
    process.env.NEXT_PUBLIC_ROOTSY_API_URL?.trim() ||
    ""
  return base || null
}

export function popRealtimeWsUrl(
  popId: string,
  accessToken: string,
): string | null {
  const base = popRealtimeBaseUrl()
  if (!base) return null

  const http = base.replace(/\/$/, "")
  const ws = http.replace(/^http/i, "ws")
  const url = new URL(`${ws}/realtime/pops/${popId}`)
  url.searchParams.set("access_token", accessToken)
  return url.toString()
}
