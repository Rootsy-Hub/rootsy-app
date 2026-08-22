export type ArcaSalePoint = {
  id: string
  ptoVta: number
  expiresAt: string | null
  crtUploadedAt: string | null
  keyUploadedAt: string | null
  csrUploadedAt: string | null
  configured: boolean
  daysUntilExpiry: number | null
}

export type ArcaFiscalConfig = {
  fiscalCuit: string | null
  fiscalRazonSocial: string | null
  salePoints: ArcaSalePoint[]
  canCreate: boolean
  canUpdate: boolean
}

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string; redirect?: string }

export type ArcaFiscalConfigResult =
  | { success: true } & ArcaFiscalConfig
  | {
      success: false
      error: string
      redirect?: string
      fiscalCuit: null
      fiscalRazonSocial: null
      salePoints: ArcaSalePoint[]
      canCreate: false
      canUpdate: false
    }

const EMPTY_CONFIG = {
  fiscalCuit: null,
  fiscalRazonSocial: null,
  salePoints: [],
  canCreate: false,
  canUpdate: false,
} as const

function mutateError(res: Response, json: ApiErr | null): string {
  return json && json.error ? json.error : `HTTP ${res.status}`
}

export async function fetchArcaFiscalConfig(
  popId: string,
): Promise<ArcaFiscalConfigResult> {
  const res = await fetch(`/api/pops/${popId}/arca-sale-points`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<ArcaFiscalConfig>
    | ApiErr
    | null

  if (res.ok && json && "success" in json && json.success) {
    return { success: true, ...json.data }
  }

  return {
    success: false,
    error: mutateError(res, json && "error" in json ? json : null),
    redirect: json && "redirect" in json ? json.redirect : undefined,
    ...EMPTY_CONFIG,
  }
}

type CreateOk = ApiOk<ArcaSalePoint> & { csrPem?: string | null }

export async function createArcaSalePoint(
  popId: string,
  ptoVta: number,
): Promise<
  | { success: true; salePoint: ArcaSalePoint; csrPem: string | null }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/arca-sale-points`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ ptoVta }),
  })
  const json = (await res.json().catch(() => null)) as CreateOk | ApiErr | null
  if (res.ok && json && "success" in json && json.success) {
    return {
      success: true,
      salePoint: json.data,
      csrPem: json.csrPem ?? null,
    }
  }
  return {
    success: false,
    error: mutateError(res, json && "error" in json ? json : null),
  }
}

export async function downloadArcaSalePointCsr(
  popId: string,
  salePointId: string,
): Promise<{ success: true; csrPem: string } | { success: false; error: string }> {
  const res = await fetch(
    `/api/pops/${popId}/arca-sale-points/${salePointId}/csr`,
    { headers: { accept: "application/json" } },
  )
  const json = (await res.json().catch(() => null)) as
    | { success: true; csrPem: string }
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, csrPem: json.csrPem }
  }
  return {
    success: false,
    error: mutateError(res, json && "error" in json ? json : null),
  }
}

export async function updateArcaSalePoint(
  popId: string,
  salePointId: string,
  input: {
    ptoVta: number
    expiresAt: string | null
    crtFile: File | null
    keyFile?: File | null
  },
): Promise<
  | { success: true; salePoint: ArcaSalePoint }
  | { success: false; error: string }
> {
  const form = new FormData()
  form.set("ptoVta", String(input.ptoVta))
  if (input.expiresAt) form.set("expiresAt", input.expiresAt)
  if (input.crtFile) form.set("crt", input.crtFile)
  if (input.keyFile) form.set("key", input.keyFile)

  const res = await fetch(
    `/api/pops/${popId}/arca-sale-points/${salePointId}`,
    {
      method: "PATCH",
      headers: { accept: "application/json" },
      body: form,
    },
  )
  const json = (await res.json().catch(() => null)) as
    | ApiOk<ArcaSalePoint>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, salePoint: json.data }
  }
  return {
    success: false,
    error: mutateError(res, json && "error" in json ? json : null),
  }
}
