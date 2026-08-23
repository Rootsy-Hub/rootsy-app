import type { ManufacturingWorkspaceData } from "@/app/[siteId]/[popId]/manufacturing/manufacturingTypes"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string; redirect?: string }

type MutateResult = { success: true } | { success: false; error: string }

async function parseJson<T>(
  res: Response,
): Promise<
  | { success: true; data: T }
  | { success: false; error: string; redirect?: string }
> {
  const json = (await res.json().catch(() => null)) as ApiOk<T> | ApiErr | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, data: json.data }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    redirect:
      json && "redirect" in json && typeof json.redirect === "string"
        ? json.redirect
        : undefined,
  }
}

export async function fetchManufacturingWorkspace(
  popId: string,
  input: { from: string | null; to: string | null },
): Promise<
  | { success: true; data: ManufacturingWorkspaceData }
  | { success: false; error: string; redirect?: string }
> {
  const params = new URLSearchParams()
  if (input.from) params.set("from", input.from)
  if (input.to) params.set("to", input.to)
  const search = params.toString()
  const res = await fetch(
    `/api/pops/${popId}/manufacturing${search ? `?${search}` : ""}`,
    { headers: { accept: "application/json" } },
  )
  return parseJson<ManufacturingWorkspaceData>(res)
}

export async function createManufacturingRun(
  popId: string,
  input: {
    recipeId: string
    quantity: number
    producedAt: string
    expiresAt: string | null
  },
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/manufacturing`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const json = (await res.json().catch(() => null)) as
    | { success?: boolean; error?: string }
    | null
  if (res.ok && json && json.success) return { success: true }
  return {
    success: false,
    error:
      json && typeof json.error === "string" && json.error
        ? json.error
        : `HTTP ${res.status}`,
  }
}
