type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

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

export async function fetchApprovalCodeStatus(popId: string): Promise<
  | { success: true; canSet: boolean; hasCode: boolean }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/me/approval-code`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseJson<{ canSet: boolean; hasCode: boolean }>(res)
  if (!parsed.success) return parsed
  return {
    success: true,
    canSet: Boolean(parsed.data.canSet),
    hasCode: Boolean(parsed.data.hasCode),
  }
}

export async function setApprovalCode(
  popId: string,
  code: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const res = await fetch(`/api/pops/${popId}/me/approval-code`, {
    method: "PUT",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })
  const parsed = await parseJson<unknown>(res)
  return parsed.success ? { success: true } : parsed
}

export async function clearApprovalCode(
  popId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const res = await fetch(`/api/pops/${popId}/me/approval-code`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  const parsed = await parseJson<unknown>(res)
  return parsed.success ? { success: true } : parsed
}
