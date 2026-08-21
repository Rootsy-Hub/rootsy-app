import type { HomePopListItem, UserProfileCache } from "@/app/home/homeUserDataTypes"
import { mePopToHomeItem } from "@/app/home/homeUserDataResolve"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

type MeProfileDto = {
  firstName: string
  lastName: string
  imageUrl: string | null
  canCreatePop: boolean
}

type MePopDto = {
  id: string
  siteId: string
  name: string
  imageUrl: string | null
  backgroundImageUrl: string | null
  streetAddress: string | null
  isOwner: boolean
  roleName: string
  isActive: boolean
  canEnter: boolean
  permissions: string[]
  dockItemIds: string[]
  subscription: {
    isActive: boolean
    status: string
    planDisplayName: string
    daysRemaining: number | null
  }
}

async function getApiJson<T>(path: string): Promise<T> {
  const res = await fetch(path)
  const json = (await res.json().catch(() => null)) as ApiOk<T> | ApiErr | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    const error = json && "error" in json ? json.error : `HTTP ${res.status}`
    throw new Error(error || "Error al cargar")
  }
  return json.data
}

export async function fetchMeProfile(): Promise<UserProfileCache> {
  const data = await getApiJson<MeProfileDto>("/api/me")
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    imageUrl: data.imageUrl,
    canCreatePop: data.canCreatePop === true,
  }
}

export async function fetchMePops(): Promise<HomePopListItem[]> {
  const data = await getApiJson<MePopDto[]>("/api/me/pops")
  return data.map(mePopToHomeItem)
}
