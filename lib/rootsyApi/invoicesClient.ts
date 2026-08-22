import type {
  GetPopInvoicesArcaTableInput,
  InvoiceArcaTableRow,
  InvoiceEmitFailure,
  InvoiceEmitSuccess,
  InvoiceFormContextResult,
  InvoiceFormContextSuccess,
  InvoiceHomologacionSuccess,
} from "@/app/[siteId]/[popId]/invoices/actions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string; redirect?: string }

export type PopInvoicesTableResult =
  | {
      success: true
      invoices: InvoiceArcaTableRow[]
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
      invoices: InvoiceArcaTableRow[]
      totalCount: number
      page: number
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }

type InvoiceListData = {
  invoices: InvoiceArcaTableRow[]
  totalCount: number
  page: number
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

const EMPTY_TABLE: Omit<
  Extract<PopInvoicesTableResult, { success: false }>,
  "success" | "error" | "redirect"
> = {
  invoices: [],
  totalCount: 0,
  page: 1,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
}

export function buildInvoicesListSearch(
  input: GetPopInvoicesArcaTableInput,
): string {
  const params = new URLSearchParams()
  if (input.page) params.set("page", String(input.page))
  if (input.pageSize) params.set("pageSize", String(input.pageSize))
  const q = input.q?.trim() ?? ""
  if (q) params.set("q", q)
  const status = input.status?.trim() ?? ""
  if (status) params.set("status", status)
  if (input.cbteTipo !== undefined && input.cbteTipo !== "") {
    params.set("cbteTipo", String(input.cbteTipo))
  }
  const dateFrom = input.dateFrom?.trim() ?? ""
  if (dateFrom) params.set("dateFrom", dateFrom)
  const dateTo = input.dateTo?.trim() ?? ""
  if (dateTo) params.set("dateTo", dateTo)
  if (input.sort) params.set("sort", input.sort)
  if (input.ord && input.ord !== "asc") params.set("ord", input.ord)
  return params.toString()
}

function emptyError(error: string, redirect?: string): PopInvoicesTableResult {
  return { success: false, error, redirect, ...EMPTY_TABLE }
}

export async function fetchPopInvoicesTable(
  popId: string,
  input: GetPopInvoicesArcaTableInput,
): Promise<PopInvoicesTableResult> {
  const search = buildInvoicesListSearch(input)
  const res = await fetch(`/api/pops/${popId}/invoices?${search}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<InvoiceListData>
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

export async function fetchInvoiceFormContext(
  popId: string,
): Promise<InvoiceFormContextResult> {
  const res = await fetch(`/api/pops/${popId}/invoices/form-context`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<InvoiceFormContextSuccess>
    | InvoiceFormContextResult
    | ApiErr
    | null

  if (res.ok && json && "success" in json && json.success) {
    if ("data" in json && json.data && json.data.success) {
      return json.data
    }
    if ("cashSession" in json) return json
  }

  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    redirect: json && "redirect" in json ? json.redirect : undefined,
  }
}

async function parseEmit<T extends { success: true }>(
  res: Response,
): Promise<T | InvoiceEmitFailure> {
  const json = (await res.json().catch(() => null)) as
    | (T & { success?: boolean })
    | InvoiceEmitFailure
    | null
  if (res.ok && json && json.success) return json as T
  return {
    success: false,
    error:
      json && "error" in json && typeof json.error === "string" && json.error
        ? json.error
        : `HTTP ${res.status}`,
    ...(json && "debugFecaeSoap" in json && json.debugFecaeSoap
      ? { debugFecaeSoap: json.debugFecaeSoap }
      : {}),
  }
}

export async function createArcaInvoiceWithOpenCashRegister(
  popId: string,
  formData: FormData,
): Promise<InvoiceEmitSuccess | InvoiceEmitFailure> {
  const res = await fetch(`/api/pops/${popId}/invoices`, {
    method: "POST",
    headers: { accept: "application/json" },
    body: formData,
  })
  return parseEmit<InvoiceEmitSuccess>(res)
}

export async function testArcaInvoiceHomologacion(
  popId: string,
  formData: FormData,
): Promise<InvoiceHomologacionSuccess | InvoiceEmitFailure> {
  const res = await fetch(`/api/pops/${popId}/invoices/homologacion`, {
    method: "POST",
    headers: { accept: "application/json" },
    body: formData,
  })
  return parseEmit<InvoiceHomologacionSuccess>(res)
}
