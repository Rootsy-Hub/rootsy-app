"use server"

import { validatePopAccess } from "@/lib/popHelpers"
import { createClient } from "@/utils/supabase/server"

export type PopCacheRevisions = {
  permissionsRev: number
  catalogRev: number
  popSettingsRev: number
  updatedAt: string
}

const DEFAULT_POP_CACHE_REVISIONS: PopCacheRevisions = {
  permissionsRev: 1,
  catalogRev: 1,
  popSettingsRev: 1,
  updatedAt: "",
}

type RpcPayload = {
  ok?: boolean
  error?: string
  permissions_rev?: number | string
  catalog_rev?: number | string
  pop_settings_rev?: number | string
  updated_at?: string
}

function parseRevision(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) && n >= 1 ? Math.trunc(n) : 1
}

function mapRpcPayload(payload: RpcPayload): PopCacheRevisions | null {
  if (!payload.ok) return null
  return {
    permissionsRev: parseRevision(payload.permissions_rev),
    catalogRev: parseRevision(payload.catalog_rev),
    popSettingsRev: parseRevision(payload.pop_settings_rev),
    updatedAt: String(payload.updated_at ?? ""),
  }
}

export async function fetchPopCacheRevisions(
  popId: string,
): Promise<PopCacheRevisions> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_pop_cache_revisions", {
    p_pop_id: popId,
  })

  if (error) {
    return { ...DEFAULT_POP_CACHE_REVISIONS }
  }

  const mapped = mapRpcPayload((data ?? {}) as RpcPayload)
  return mapped ?? { ...DEFAULT_POP_CACHE_REVISIONS }
}

export type PopCacheRevisionsResult =
  | { success: true; revisions: PopCacheRevisions }
  | { success: false; error: string; redirect?: string }

/** Lectura liviana para polling (Paso 3). */
export async function getPopCacheRevisions(
  popId: string,
): Promise<PopCacheRevisionsResult> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess) {
    return {
      success: false,
      error: access.error || "No tenés acceso a este punto de venta.",
      redirect: "/home",
    }
  }
  if (!access.isActive) {
    return {
      success: false,
      error:
        access.error ||
        "Este punto de venta no está activo. Actualizá tu suscripción para continuar.",
    }
  }

  const revisions = await fetchPopCacheRevisions(popId)
  return { success: true, revisions }
}
