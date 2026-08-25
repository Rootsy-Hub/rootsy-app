import { createServiceRoleClient } from "@/utils/supabase/service-role"

export const ROOTSY_PLATFORM_POP_SETTING_KEY = "rootsy_pop_id"

export type RootsyPlatformPopSource = "database" | "env"

/**
 * POP interno de Rootsy donde se registran ingresos de plataforma como operaciones
 * de servicios (suscripciones SaaS).
 */
export function getRootsyPlatformPopIdFromEnv(): string | null {
  const value = process.env.ROOTSY_POP_ID?.trim()
  if (!value) return null
  return value
}

async function readRootsyPlatformPopIdFromDatabase(): Promise<string | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("_platform_settings")
    .select("value")
    .eq("key", ROOTSY_PLATFORM_POP_SETTING_KEY)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  const value = data?.value != null ? String(data.value).trim() : ""
  if (!/^[0-9a-f-]{36}$/i.test(value)) {
    return null
  }
  return value
}

export async function resolveRootsyPlatformPopId(): Promise<{
  popId: string | null
  source: RootsyPlatformPopSource | null
}> {
  try {
    const fromDb = await readRootsyPlatformPopIdFromDatabase()
    if (fromDb) {
      return { popId: fromDb, source: "database" }
    }
  } catch {
    // Fail-open hacia env si la tabla aún no existe o hay error de lectura.
  }

  const fromEnv = getRootsyPlatformPopIdFromEnv()
  if (fromEnv) {
    return { popId: fromEnv, source: "env" }
  }

  return { popId: null, source: null }
}

export async function requireRootsyPlatformPopId(): Promise<string> {
  const { popId } = await resolveRootsyPlatformPopId()
  if (!popId) {
    throw new Error(
      "POP Rootsy no configurado. Elegilo en Uroboros → Bridge Rootsy o definí ROOTSY_POP_ID en el entorno.",
    )
  }
  return popId
}

export async function isRootsyPlatformPopConfigured(): Promise<boolean> {
  const { popId } = await resolveRootsyPlatformPopId()
  return popId != null
}

export async function saveRootsyPlatformPopIdSetting(
  popId: string,
): Promise<void> {
  const trimmed = popId.trim()
  if (!/^[0-9a-f-]{36}$/i.test(trimmed)) {
    throw new Error("POP Rootsy inválido.")
  }

  const supabase = createServiceRoleClient()
  const { data: popRow, error: popError } = await supabase
    .from("pops")
    .select("id")
    .eq("id", trimmed)
    .maybeSingle()

  if (popError) {
    throw new Error(popError.message)
  }
  if (!popRow?.id) {
    throw new Error("El POP seleccionado no existe.")
  }

  const { error } = await supabase.from("_platform_settings").upsert(
    {
      key: ROOTSY_PLATFORM_POP_SETTING_KEY,
      value: trimmed,
    },
    { onConflict: "key" },
  )

  if (error) {
    throw new Error(error.message)
  }
}
