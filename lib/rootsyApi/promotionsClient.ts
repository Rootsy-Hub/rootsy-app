import type {
  CreatePromotionInput,
  GetPopPromotionsTableInput,
  PromotionCatalogOption,
  PromotionDetail,
  PromotionTableRow,
  UpdatePromotionInput,
} from "@/app/[siteId]/[popId]/promotions/actions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string; redirect?: string }

export type PopPromotionsTableResult =
  | {
      success: true
      promotions: PromotionTableRow[]
      totalCount: number
      page: number
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
  | {
      success: false
      error: string
      redirect?: string
      promotions: PromotionTableRow[]
      totalCount: number
      page: number
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }

type PromotionListData = {
  promotions: PromotionTableRow[]
  totalCount: number
  page: number
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

const EMPTY_TABLE: Omit<
  Extract<PopPromotionsTableResult, { success: false }>,
  "success" | "error" | "redirect"
> = {
  promotions: [],
  totalCount: 0,
  page: 1,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
}

export function buildPromotionsListSearch(
  input: GetPopPromotionsTableInput,
): string {
  const params = new URLSearchParams()
  if (input.page) params.set("page", String(input.page))
  if (input.pageSize) params.set("pageSize", String(input.pageSize))
  const q = input.q?.trim() ?? ""
  if (q) params.set("q", q)
  if (input.soloActivos) params.set("soloActivos", "true")
  if (input.promotionType) params.set("promotionType", input.promotionType)
  if (input.sort) params.set("sort", input.sort)
  if (input.ord && input.ord !== "asc") params.set("ord", input.ord)
  return params.toString()
}

function emptyError(error: string, redirect?: string): PopPromotionsTableResult {
  return { success: false, error, redirect, ...EMPTY_TABLE }
}

export async function fetchPopPromotionsTable(
  popId: string,
  input: GetPopPromotionsTableInput,
): Promise<PopPromotionsTableResult> {
  const search = buildPromotionsListSearch(input)
  const res = await fetch(`/api/pops/${popId}/promotions?${search}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<PromotionListData>
    | ApiErr
    | null

  if (res.ok && json && "success" in json && json.success) {
    return { success: true, ...json.data }
  }

  return emptyError(
    json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    json && "redirect" in json ? json.redirect : undefined,
  )
}

export async function fetchPopPromotion(
  popId: string,
  promotionId: string,
): Promise<PromotionDetail> {
  const res = await fetch(`/api/pops/${popId}/promotions/${promotionId}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<PromotionDetail>
    | ApiErr
    | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    const error = json && "error" in json ? json.error : `HTTP ${res.status}`
    throw new Error(error || "No se pudo cargar la promoción")
  }
  return json.data
}

export async function fetchPromotionCatalogOptions(
  popId: string,
): Promise<PromotionCatalogOption[]> {
  const res = await fetch(`/api/pops/${popId}/promotions/catalog`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<PromotionCatalogOption[]>
    | ApiErr
    | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    const error = json && "error" in json ? json.error : `HTTP ${res.status}`
    throw new Error(error || "No se pudo cargar el catálogo")
  }
  return json.data
}

type MutateResult = { success: true } | { success: false; error: string }

async function parseMutate(res: Response): Promise<MutateResult> {
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

export async function createPopPromotion(
  popId: string,
  input: CreatePromotionInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/promotions`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function updatePopPromotion(
  popId: string,
  promotionId: string,
  input: UpdatePromotionInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/promotions/${promotionId}`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function deletePopPromotion(
  popId: string,
  promotionId: string,
  confirmationTyped: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/promotions/${promotionId}`, {
    method: "DELETE",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ confirmationTyped }),
  })
  return parseMutate(res)
}
