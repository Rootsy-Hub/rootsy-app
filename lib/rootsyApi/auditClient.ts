export type AuditEventRow = {
  id: string
  occurred_at: string
  expires_at: string
  resource: string
  resource_id: string | null
  action: string
  http_method: string
  path: string
  previous_state: unknown
  new_state: unknown
  requester_user_id: string | null
  approver_user_id: string | null
  requester_name: string | null
  approver_name: string | null
  execution_source: string
  kind: string | null
}

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

async function parseJson<T>(
  res: Response,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const json = (await res.json().catch(() => null)) as ApiOk<T> | ApiErr | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, data: json.data }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchPopAuditEvents(
  popId: string,
  input?: {
    page?: number
    pageSize?: number
    q?: string
    from?: string | null
    to?: string | null
    action?: string[]
    source?: string[]
    resource?: string
  },
): Promise<
  | {
      success: true
      events: AuditEventRow[]
      page: number
      pageSize: number
      total: number
    }
  | { success: false; error: string }
> {
  const params = new URLSearchParams()
  if (input?.page) params.set("page", String(input.page))
  if (input?.pageSize) params.set("pageSize", String(input.pageSize))
  const q = input?.q?.trim()
  if (q) params.set("q", q)
  if (input?.from) params.set("from", input.from)
  if (input?.to) params.set("to", input.to)
  if (input?.action && input.action.length > 0) {
    params.set("action", input.action.join(","))
  }
  if (input?.source && input.source.length > 0) {
    params.set("source", input.source.join(","))
  }
  const resource = input?.resource?.trim()
  if (resource) params.set("resource", resource)
  const query = params.toString()
  const res = await fetch(
    `/api/pops/${popId}/audit${query ? `?${query}` : ""}`,
    { headers: { accept: "application/json" } },
  )
  const parsed = await parseJson<{
    events: AuditEventRow[]
    page: number
    pageSize: number
    total: number
  }>(res)
  if (!parsed.success) return parsed
  return {
    success: true,
    events: (parsed.data.events ?? []).map((event) => ({
      ...event,
      requester_name: event.requester_name ?? null,
      approver_name: event.approver_name ?? null,
    })),
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
    total: parsed.data.total,
  }
}
