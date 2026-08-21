import {
  isMenuDockItemId,
  type MenuDockItemId,
} from "@/lib/menuCatalog"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

type DockDto = {
  popId: string
  userId: string
  dockItemIds: string[]
  createdAt: string
  updatedAt: string
}

function dockPath(popId: string) {
  return `/api/pops/${popId}/dock`
}

function parseDockItemIds(raw: unknown): MenuDockItemId[] {
  if (!Array.isArray(raw)) return []
  const out: MenuDockItemId[] = []
  const seen = new Set<MenuDockItemId>()
  for (const entry of raw) {
    const id = entry === "active-services" ? "operations" : entry
    if (!isMenuDockItemId(id) || seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

async function parseApiResponse<T>(
  res: Response,
): Promise<
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string }
> {
  const json = (await res.json().catch(() => null)) as ApiOk<T> | ApiErr | null
  if (res.ok && json && "success" in json && json.success) {
    return { ok: true, status: res.status, data: json.data }
  }
  const error =
    json && "error" in json && json.error ? json.error : `HTTP ${res.status}`
  return { ok: false, status: res.status, error }
}

async function mutateDock(popId: string, method: "POST" | "PATCH", dockItemIds: readonly string[]) {
  const res = await fetch(dockPath(popId), {
    method,
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ dockItemIds }),
  })
  return parseApiResponse<DockDto>(res)
}

export async function fetchPopDock(
  popId: string,
): Promise<MenuDockItemId[] | null> {
  const res = await fetch(dockPath(popId), {
    headers: { accept: "application/json" },
  })
  const parsed = await parseApiResponse<DockDto>(res)
  if (!parsed.ok) {
    if (parsed.status === 404) return null
    throw new Error(parsed.error || "Error al cargar el dock")
  }
  const ids = parseDockItemIds(parsed.data.dockItemIds)
  return ids.length > 0 ? ids : null
}

export async function savePopDock(
  popId: string,
  dockItemIds: readonly MenuDockItemId[],
): Promise<{ success: boolean }> {
  const patched = await mutateDock(popId, "PATCH", dockItemIds)
  if (patched.ok) return { success: true }
  if (patched.status !== 404) return { success: false }

  const created = await mutateDock(popId, "POST", dockItemIds)
  if (created.ok) return { success: true }
  if (created.status !== 409) return { success: false }

  const retried = await mutateDock(popId, "PATCH", dockItemIds)
  return { success: retried.ok }
}

export async function deletePopDock(popId: string): Promise<{ success: boolean }> {
  const res = await fetch(dockPath(popId), {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  const parsed = await parseApiResponse<unknown>(res)
  if (parsed.ok || parsed.status === 404) return { success: true }
  return { success: false }
}
