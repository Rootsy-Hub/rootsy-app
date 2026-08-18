import { unstable_cache } from "next/cache"
import { callMenuRootsyAiProvider, isMenuRootsyAiConfigured } from "@/lib/menu/menuRootsyAi"
import type { MenuRootsyAdvice, MenuRootsyContext } from "@/lib/menu/menuRootsyTypes"

const CACHE_TTL_SECONDS = 86_400

/** Una respuesta IA por negocio + sección + rol + módulos + día. */
export function buildMenuRootsyAdviceCacheKey(context: MenuRootsyContext): string {
  const moduleKeys = [...new Set(context.allowedModules.map((mod) => mod.moduleKey))]
    .sort()
    .join(",")
  const dateBucket = new Date().toISOString().slice(0, 10)
  const roleKey = context.isOwner
    ? "owner"
    : context.roleName.trim().toLowerCase().replace(/\s+/g, "-") || "member"

  return [context.popId, context.sectionKey, roleKey, moduleKeys, dateBucket].join(":")
}

export async function getMenuRootsyAiAdviceCached(
  context: MenuRootsyContext,
  fallback: MenuRootsyAdvice,
): Promise<MenuRootsyAdvice> {
  if (!isMenuRootsyAiConfigured() || context.allowedModules.length === 0) {
    return fallback
  }

  const cacheKey = buildMenuRootsyAdviceCacheKey(context)
  const contextJson = JSON.stringify(context)
  const fallbackJson = JSON.stringify(fallback)

  const readCached = unstable_cache(
    async (ctxJson: string, fbJson: string) => {
      const ctx = JSON.parse(ctxJson) as MenuRootsyContext
      const fb = JSON.parse(fbJson) as MenuRootsyAdvice
      return callMenuRootsyAiProvider(ctx, fb)
    },
    ["menu-rootsy-advice", cacheKey],
    { revalidate: CACHE_TTL_SECONDS },
  )

  return readCached(contextJson, fallbackJson)
}
