import type { ServiceCategoryOption } from "@/app/[siteId]/[popId]/services/actions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

type CategoryDto = {
  id: string
  name: string
  kind: "fijo" | "variable"
  sortOrder: number
}

function mapCategory(row: CategoryDto): ServiceCategoryOption {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind === "fijo" ? "fijo" : "variable",
    sortOrder: row.sortOrder ?? 0,
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
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchPopServiceCategories(
  popId: string,
): Promise<ServiceCategoryOption[]> {
  const res = await fetch(`/api/pops/${popId}/service-categories`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<CategoryDto[]>
    | ApiErr
    | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    const error = json && "error" in json ? json.error : `HTTP ${res.status}`
    throw new Error(error || "No se pudieron cargar las categorías")
  }
  return json.data.map(mapCategory)
}

export async function createPopServiceCategory(
  popId: string,
  name: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/service-categories`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ name, kind: "variable" }),
  })
  return parseMutate(res)
}

export async function updatePopServiceCategory(
  popId: string,
  categoryId: string,
  name: string,
): Promise<MutateResult> {
  const res = await fetch(
    `/api/pops/${popId}/service-categories/${categoryId}`,
    {
      method: "PATCH",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    },
  )
  return parseMutate(res)
}

export async function deletePopServiceCategory(
  popId: string,
  categoryId: string,
): Promise<MutateResult> {
  const res = await fetch(
    `/api/pops/${popId}/service-categories/${categoryId}`,
    {
      method: "DELETE",
      headers: { accept: "application/json" },
    },
  )
  return parseMutate(res)
}
