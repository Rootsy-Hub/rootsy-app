type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

export type SupplierOption = {
  id: string
  name: string
}

export async function fetchPopSupplierOptions(
  popId: string,
  options?: { q?: string },
): Promise<SupplierOption[]> {
  const params = new URLSearchParams()
  const q = options?.q?.trim()
  if (q) params.set("q", q)
  const search = params.toString()
  const res = await fetch(
    `/api/pops/${popId}/suppliers${search ? `?${search}` : ""}`,
    {
      headers: { accept: "application/json" },
    },
  )
  const json = (await res.json().catch(() => null)) as
    | ApiOk<SupplierOption[]>
    | ApiErr
    | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    const error = json && "error" in json ? json.error : `HTTP ${res.status}`
    throw new Error(error || "No se pudieron cargar los proveedores")
  }
  return json.data
}
