import type {
  CreateCounterOrderInput,
  CounterOrder,
  UpdateCounterOrderInput,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import { parseTableSessionCheckout } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import type { TableSessionCheckoutSnapshot } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

type CounterOrderApi = Omit<CounterOrder, "checkout" | "isPaid"> & {
  checkout: Record<string, unknown> | null
}

function mapOrder(row: CounterOrderApi): CounterOrder {
  return {
    ...row,
    isPaid: row.saleId != null,
    checkout: row.checkout ? parseTableSessionCheckout(row.checkout) : null,
  }
}

async function parseOk<T>(
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

async function readJson(res: Response) {
  return (await res.json().catch(() => null)) as ApiOk<unknown> | ApiErr | null
}

export async function fetchCounterOrders(
  popId: string,
): Promise<
  | { success: true; orders: CounterOrder[] }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/mostrador/orders`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseOk<{ orders: CounterOrderApi[] }>(res)
  if (!parsed.success) return parsed
  return { success: true, orders: parsed.data.orders.map(mapOrder) }
}

export async function fetchCounterOrder(
  popId: string,
  orderId: string,
): Promise<
  | { success: true; order: CounterOrder | null }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/mostrador/orders/${orderId}`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseOk<{ order: CounterOrderApi | null }>(res)
  if (!parsed.success) return parsed
  return {
    success: true,
    order: parsed.data.order ? mapOrder(parsed.data.order) : null,
  }
}

export async function createCounterOrderApi(
  popId: string,
  input: CreateCounterOrderInput & {
    checkout?: TableSessionCheckoutSnapshot
  },
): Promise<
  | { success: true; order: CounterOrder }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/mostrador/orders`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(input),
  })
  const parsed = await parseOk<{ order: CounterOrderApi }>(res)
  if (!parsed.success) return parsed
  if (!parsed.data.order) {
    return { success: false, error: "No se pudo crear el pedido." }
  }
  return { success: true, order: mapOrder(parsed.data.order) }
}

export async function patchCounterOrderApi(
  popId: string,
  orderId: string,
  input: UpdateCounterOrderInput,
): Promise<
  | { success: true; order: CounterOrder }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/mostrador/orders/${orderId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(input),
  })
  const parsed = await parseOk<{ order: CounterOrderApi }>(res)
  if (!parsed.success) return parsed
  if (!parsed.data.order) {
    return { success: false, error: "No se pudo actualizar el pedido." }
  }
  return { success: true, order: mapOrder(parsed.data.order) }
}

export async function patchCounterOrderStatusApi(
  popId: string,
  orderId: string,
  status: CounterOrder["status"],
): Promise<
  | { success: true; order: CounterOrder }
  | { success: false; error: string }
> {
  const res = await fetch(
    `/api/pops/${popId}/mostrador/orders/${orderId}/status`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ status }),
    },
  )
  const parsed = await parseOk<{ order: CounterOrderApi }>(res)
  if (!parsed.success) return parsed
  if (!parsed.data.order) {
    return { success: false, error: "No se pudo actualizar el estado." }
  }
  return { success: true, order: mapOrder(parsed.data.order) }
}

export async function cancelCounterOrderApi(
  popId: string,
  orderId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const res = await fetch(
    `/api/pops/${popId}/mostrador/orders/${orderId}/cancel`,
    {
      method: "PATCH",
      headers: { accept: "application/json" },
    },
  )
  const json = await readJson(res)
  if (res.ok && json && "success" in json && json.success) {
    return { success: true }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function saveCounterOrderCheckoutApi(
  popId: string,
  orderId: string,
  checkout: TableSessionCheckoutSnapshot,
): Promise<
  | { success: true; updatedAt: string }
  | { success: false; error: string }
> {
  const res = await fetch(
    `/api/pops/${popId}/mostrador/orders/${orderId}/checkout`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ checkout }),
    },
  )
  const parsed = await parseOk<{ updatedAt: string }>(res)
  if (!parsed.success) return parsed
  return { success: true, updatedAt: parsed.data.updatedAt }
}

export async function closeCounterOrderCheckoutApi(
  popId: string,
  orderId: string,
  mode: "settle" | "release",
): Promise<{ success: true } | { success: false; error: string }> {
  const res = await fetch(
    `/api/pops/${popId}/mostrador/orders/${orderId}/close`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ mode }),
    },
  )
  const json = await readJson(res)
  if (res.ok && json && "success" in json && json.success) {
    return { success: true }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}
