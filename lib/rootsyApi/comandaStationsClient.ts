import type { ComandaStationOption } from "@/app/[siteId]/[popId]/recipes/actions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

type StationDto = {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
  categoryCount?: number
}

function mapStation(row: StationDto): ComandaStationOption {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sortOrder,
    isActive: row.isActive !== false,
  }
}

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
    error: json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchPopComandaStations(
  popId: string,
): Promise<ComandaStationOption[]> {
  const res = await fetch(`/api/pops/${popId}/comanda-stations`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<StationDto[]>
    | ApiErr
    | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    const error = json && "error" in json ? json.error : `HTTP ${res.status}`
    throw new Error(error || "No se pudieron cargar las estaciones")
  }
  return json.data.map(mapStation)
}

export async function createPopComandaStation(
  popId: string,
  name: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/comanda-stations`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  return parseMutate(res)
}

export async function updatePopComandaStation(
  popId: string,
  stationId: string,
  name: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/comanda-stations/${stationId}`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  return parseMutate(res)
}

export async function deletePopComandaStation(
  popId: string,
  stationId: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/comanda-stations/${stationId}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  return parseMutate(res)
}

export async function fetchPopComandaStationCategoryCount(
  popId: string,
  stationId: string,
): Promise<{ success: true; count: number } | { success: false; error: string }> {
  const res = await fetch(`/api/pops/${popId}/comanda-stations/${stationId}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<StationDto>
    | ApiErr
    | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    return {
      success: false,
      error: json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    }
  }
  return { success: true, count: json.data.categoryCount ?? 0 }
}
