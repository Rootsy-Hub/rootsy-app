import type {
  ComandaSendPeel,
  ComandaSourceKind,
  ComandaStation,
  ComandaStatus,
  ComandaTicket,
  ComandaVoidPeel,
  PendingComandaItem,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"

type ApiErr = { success: false; error?: string }

async function readJson(res: Response) {
  return (await res.json().catch(() => null)) as Record<string, unknown> | null
}

function fail(
  json: Record<string, unknown> | null,
  status: number,
): { success: false; error: string } {
  const error =
    json && typeof json.error === "string" && json.error
      ? json.error
      : `HTTP ${status}`
  return { success: false, error }
}

async function apiGet(popId: string, path: string) {
  return fetch(`/api/pops/${popId}/comandas/${path}`, {
    headers: { accept: "application/json" },
  })
}

async function apiSend(
  popId: string,
  path: string,
  method: "POST" | "PATCH",
  body?: unknown,
) {
  return fetch(`/api/pops/${popId}/comandas/${path}`, {
    method,
    headers: {
      accept: "application/json",
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export async function fetchComandaStations(
  popId: string,
): Promise<
  | { success: true; stations: ComandaStation[] }
  | { success: false; error: string }
> {
  const res = await apiGet(popId, "stations")
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true, stations: json.stations as ComandaStation[] }
}

export async function fetchComandas(
  popId: string,
  stationId: string,
): Promise<
  | { success: true; tickets: ComandaTicket[] }
  | { success: false; error: string }
> {
  const res = await fetch(
    `/api/pops/${popId}/comandas?stationId=${encodeURIComponent(stationId)}`,
    { headers: { accept: "application/json" } },
  )
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true, tickets: json.tickets as ComandaTicket[] }
}

export async function fetchPendingComandasForSource(
  popId: string,
  sourceKind: ComandaSourceKind,
  sourceId: string,
): Promise<
  | { success: true; items: PendingComandaItem[] }
  | { success: false; error: string }
> {
  const params = new URLSearchParams({ sourceKind, sourceId })
  const res = await apiGet(popId, `pending?${params.toString()}`)
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true, items: json.items as PendingComandaItem[] }
}

export async function moveComandaStatusApi(
  popId: string,
  ticketId: string,
  status: ComandaStatus,
): Promise<
  | { success: true; ticket: ComandaTicket }
  | { success: false; error: string }
> {
  const res = await apiSend(popId, `${ticketId}/status`, "PATCH", { status })
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true, ticket: json.ticket as ComandaTicket }
}

export async function sendComandaBatchApi(
  popId: string,
  input: {
    sourceKind: ComandaSourceKind
    sourceId: string
    quantities: Record<string, number>
    stationComments: Record<string, string>
  },
): Promise<
  | { success: true; sentCartLineIds: string[]; peels: ComandaSendPeel[] }
  | { success: false; error: string }
> {
  const res = await apiSend(popId, "send", "POST", input)
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return {
    success: true,
    sentCartLineIds: json.sentCartLineIds as string[],
    peels: json.peels as ComandaSendPeel[],
  }
}

export async function voidComandaBatchApi(
  popId: string,
  input: {
    sourceKind: ComandaSourceKind
    sourceId: string
    parentCartLineId: string
    parentVoidQuantity: number
    parentRemainderQuantity: number
    quantities: Record<string, number>
    comment: string
  },
): Promise<
  | { success: true; voidedCartLineIds: string[]; peels: ComandaVoidPeel[] }
  | { success: false; error: string }
> {
  const res = await apiSend(popId, "void", "POST", input)
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return {
    success: true,
    voidedCartLineIds: json.voidedCartLineIds as string[],
    peels: json.peels as ComandaVoidPeel[],
  }
}
