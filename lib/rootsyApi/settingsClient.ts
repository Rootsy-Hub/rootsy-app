import type {
  PopSettingsBusinessInput,
  PopSettingsFiscalInput,
  PopSettingsImagesInput,
  PopSettingsPageForm,
} from "@/app/[siteId]/[popId]/settings/actions"
import type { PopSettingsImageKind } from "@/lib/popImageStorage"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

type MutateResult = { success: true } | { success: false; error: string }

export type PopSettingsResult =
  | { success: true; form: PopSettingsPageForm; isOwner: boolean }
  | { success: false; error: string }

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

export async function fetchPopSettings(popId: string): Promise<PopSettingsResult> {
  const res = await fetch(`/api/pops/${popId}/settings`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ form: PopSettingsPageForm; isOwner: boolean }>
    | ApiErr
    | null

  if (res.ok && json && "success" in json && json.success) {
    return {
      success: true,
      form: json.data.form,
      isOwner: json.data.isOwner,
    }
  }

  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function updatePopSettingsBusiness(
  popId: string,
  input: PopSettingsBusinessInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/settings/business`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function updatePopSettingsFiscal(
  popId: string,
  input: PopSettingsFiscalInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/settings/fiscal`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function updatePopSettingsImages(
  popId: string,
  input: PopSettingsImagesInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/settings/images`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function uploadPopSettingsImage(
  popId: string,
  kind: PopSettingsImageKind,
  formData: FormData,
): Promise<{ success: true; imageUrl: string } | { success: false; error: string }> {
  const body = new FormData()
  const file = formData.get("file")
  if (file instanceof File) body.append("file", file)
  body.append("kind", kind)

  const res = await fetch(`/api/pops/${popId}/settings/image`, {
    method: "POST",
    headers: { accept: "application/json" },
    body,
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ imageUrl: string }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, imageUrl: json.data.imageUrl }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}
