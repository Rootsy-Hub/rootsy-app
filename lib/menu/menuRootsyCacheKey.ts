import {
  menuRootsyGrowthRotationSeed,
  menuRootsyInsightsCacheFingerprint,
} from "@/lib/menu/menuRootsyInsightsShared"
import type { MenuRootsyContext } from "@/lib/menu/menuRootsyTypes"

/** Clave de cache — independiente del reinado; rota consejo por día. */
export function buildMenuRootsyAdviceCacheKey(context: MenuRootsyContext): string {
  const moduleKeys = [...new Set(context.allModules.map((mod) => mod.moduleKey))]
    .sort()
    .join(",")
  const roleKey = context.isOwner
    ? "owner"
    : context.roleName.trim().toLowerCase().replace(/\s+/g, "-") || "member"
  const rotationSeed = menuRootsyGrowthRotationSeed(context.popId)
  const insightsFingerprint = context.insights
    ? menuRootsyInsightsCacheFingerprint(context.insights)
    : "no-insights"

  return [
    context.popId,
    roleKey,
    moduleKeys,
    rotationSeed,
    insightsFingerprint,
  ].join(":")
}
