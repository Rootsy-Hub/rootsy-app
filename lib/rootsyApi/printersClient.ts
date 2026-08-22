import type {
  PopPrinterTableRow,
  UpsertPopPrinterInput,
} from "@/app/[siteId]/[popId]/printers/actions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

type MutateResult = { success: true } | { success: false; error: string }

async function parseJson<T>(
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

export async function fetchPopPrinters(
  popId: string,
): Promise<
  | { success: true; rows: PopPrinterTableRow[] }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/printers`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseJson<PopPrinterTableRow[]>(res)
  if (!parsed.success) return parsed
  return { success: true, rows: parsed.data }
}

export async function createPopPrinter(
  popId: string,
  input: UpsertPopPrinterInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/printers`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const parsed = await parseJson<PopPrinterTableRow>(res)
  return parsed.success ? { success: true } : parsed
}

export async function updatePopPrinter(
  popId: string,
  printerId: string,
  input: UpsertPopPrinterInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/printers/${printerId}`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const parsed = await parseJson<PopPrinterTableRow>(res)
  return parsed.success ? { success: true } : parsed
}

export async function deletePopPrinter(
  popId: string,
  printerId: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/printers/${printerId}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  const parsed = await parseJson<unknown>(res)
  return parsed.success ? { success: true } : parsed
}
