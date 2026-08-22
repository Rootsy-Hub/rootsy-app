import type {
  CreateSaleQuoteInput,
  GetSaleQuotesTableInput,
} from "@/app/[siteId]/[popId]/quotes/actions"
import type { SaleQuoteDetail, SaleQuoteTableRow } from "@/lib/saleQuoteTypes"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

export type PopQuotesTableResult =
  | {
      success: true
      rows: SaleQuoteTableRow[]
      totalCount: number
      page: number
    }
  | {
      success: false
      error: string
      rows: SaleQuoteTableRow[]
      totalCount: number
      page: number
    }

type QuoteListData = {
  rows: SaleQuoteTableRow[]
  totalCount: number
  page: number
}

const EMPTY_TABLE: Omit<
  Extract<PopQuotesTableResult, { success: false }>,
  "success" | "error"
> = {
  rows: [],
  totalCount: 0,
  page: 1,
}

export function buildQuotesListSearch(input: GetSaleQuotesTableInput): string {
  const params = new URLSearchParams()
  if (input.page) params.set("page", String(input.page))
  if (input.pageSize) params.set("pageSize", String(input.pageSize))
  const q = input.q?.trim() ?? ""
  if (q) params.set("q", q)
  const dateFrom = input.dateFrom?.trim() ?? ""
  if (dateFrom) params.set("dateFrom", dateFrom)
  const dateTo = input.dateTo?.trim() ?? ""
  if (dateTo) params.set("dateTo", dateTo)
  return params.toString()
}

function emptyError(error: string): PopQuotesTableResult {
  return { success: false, error, ...EMPTY_TABLE }
}

export async function fetchPopQuotesTable(
  popId: string,
  input: GetSaleQuotesTableInput,
): Promise<PopQuotesTableResult> {
  const search = buildQuotesListSearch(input)
  const res = await fetch(`/api/pops/${popId}/quotes?${search}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<QuoteListData>
    | ApiErr
    | null

  if (res.ok && json && "success" in json && json.success) {
    return { success: true, ...json.data }
  }

  return emptyError(
    json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  )
}

export async function fetchSaleQuoteDetail(
  popId: string,
  quoteId: string,
): Promise<
  { success: true; quote: SaleQuoteDetail } | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/quotes/${quoteId}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ quote: SaleQuoteDetail }>
    | ApiErr
    | null

  if (res.ok && json && "success" in json && json.success) {
    return { success: true, quote: json.data.quote }
  }

  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

type MutateResult =
  | { success: true; quoteId?: string; quoteNumber?: number }
  | { success: false; error: string }

async function parseMutate(res: Response): Promise<MutateResult> {
  const json = (await res.json().catch(() => null)) as
    | {
        success?: boolean
        error?: string
        quoteId?: string
        quoteNumber?: number
      }
    | null
  if (res.ok && json && json.success) {
    return {
      success: true,
      quoteId: json.quoteId,
      quoteNumber: json.quoteNumber,
    }
  }
  return {
    success: false,
    error:
      json && typeof json.error === "string" && json.error
        ? json.error
        : `HTTP ${res.status}`,
  }
}

export async function createSaleQuote(
  popId: string,
  input: CreateSaleQuoteInput,
): Promise<
  | { success: true; quoteId: string; quoteNumber: number }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/quotes`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const parsed = await parseMutate(res)
  if (!parsed.success) return parsed
  return {
    success: true,
    quoteId: parsed.quoteId ?? "",
    quoteNumber: parsed.quoteNumber ?? 0,
  }
}

export async function deleteSaleQuote(
  popId: string,
  quoteId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const res = await fetch(`/api/pops/${popId}/quotes/${quoteId}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  const parsed = await parseMutate(res)
  if (!parsed.success) return parsed
  return { success: true }
}
