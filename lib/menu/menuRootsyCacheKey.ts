import { menuRootsySignalsCacheFingerprint } from "@/lib/menu/menuRootsySignalsShared"
import type { MenuRootsyContext } from "@/lib/menu/menuRootsyTypes"

/** Clave de cache — segura para cliente y servidor. */
export function buildMenuRootsyAdviceCacheKey(context: MenuRootsyContext): string {
  const moduleKeys = [...new Set(context.allowedModules.map((mod) => mod.moduleKey))]
    .sort()
    .join(",")
  const dateBucket = new Date().toISOString().slice(0, 10)
  const roleKey = context.isOwner
    ? "owner"
    : context.roleName.trim().toLowerCase().replace(/\s+/g, "-") || "member"

  return [
    context.popId,
    context.sectionKey,
    roleKey,
    moduleKeys,
    dateBucket,
    menuRootsySignalsCacheFingerprint(context.signals),
  ].join(":")
}
