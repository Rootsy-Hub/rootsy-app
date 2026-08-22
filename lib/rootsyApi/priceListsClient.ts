import type { SalePriceList } from "@/lib/salePriceLists"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

type MutateResult = { success: true } | { success: false; error: string }

async function parseMutate(res: Response): Promise<MutateResult> {
  const json = (await res.json().catch(() => null)) as
    | ApiOk<unknown>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchPopPriceLists(popId: string): Promise<SalePriceList[]> {
  const res = await fetch(`/api/pops/${popId}/price-lists`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<SalePriceList[]>
    | ApiErr
    | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    const error = json && "error" in json ? json.error : `HTTP ${res.status}`
    throw new Error(error || "No se pudieron cargar las listas de precios")
  }
  return json.data
}

export async function createPopPriceList(
  popId: string,
  name: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/price-lists`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  return parseMutate(res)
}

export async function updatePopPriceList(
  popId: string,
  listId: string,
  name: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/price-lists/${listId}`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  return parseMutate(res)
}

export async function deletePopPriceList(
  popId: string,
  listId: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/price-lists/${listId}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  return parseMutate(res)
}
