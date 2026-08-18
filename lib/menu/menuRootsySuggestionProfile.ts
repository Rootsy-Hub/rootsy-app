import type { PopAccessModule } from "@/app/home/homeUserDataTypes"
import {
  getMenuRootsyCatalogSuggestion,
  MENU_ROOTSY_SUGGESTION_CATALOG,
} from "@/lib/menu/menuRootsySuggestionCatalog"
import type { MenuRootsyBusinessInsights } from "@/lib/menu/menuRootsyInsightsShared"
import type {
  MenuRootsyCatalogSuggestion,
  MenuRootsySuggestionProfile,
} from "@/lib/menu/menuRootsySuggestionCatalogTypes"
import { scoreSuggestionDataSupport } from "@/lib/menu/menuRootsySuggestionVoice"

/** Semilla de rotación — por carga de página (token único). */
export function menuRootsySuggestionRotationSeed(
  popId: string,
  rotationToken: string,
): string {
  return `${popId}:${rotationToken}`
}

function hasModuleRead(
  modules: readonly PopAccessModule[],
  key: string,
): boolean {
  return modules.some((mod) => mod.key === key && mod.permissions?.read)
}

function readableModuleKeys(modules: readonly PopAccessModule[]): Set<string> {
  const keys = new Set<string>()
  for (const mod of modules) {
    if (mod.permissions?.read) keys.add(mod.key)
  }
  return keys
}

/** Perfiles activos según módulos con lectura. */
export function detectMenuRootsySuggestionProfiles(
  enabledModules: readonly PopAccessModule[],
): MenuRootsySuggestionProfile[] {
  const profiles: MenuRootsySuggestionProfile[] = []

  if (hasModuleRead(enabledModules, "mesas")) profiles.push("mesas")
  if (hasModuleRead(enabledModules, "mostrador")) profiles.push("mostrador")
  if (
    hasModuleRead(enabledModules, "active_services") ||
    hasModuleRead(enabledModules, "services")
  ) {
    profiles.push("services")
  }
  if (hasModuleRead(enabledModules, "sale")) profiles.push("sale_only")

  return profiles
}

function moduleKeyReadable(keys: Set<string>, key: string): boolean {
  if (keys.has(key)) return true
  if (key === "services" && keys.has("active_services")) return true
  if (key === "active_services" && keys.has("services")) return true
  if (key === "stock" && keys.has("articles")) return true
  if (key === "articles" && keys.has("stock")) return true
  return false
}

function suggestionAllowed(
  suggestion: MenuRootsyCatalogSuggestion,
  readableKeys: Set<string>,
): boolean {
  return suggestion.requiredModules.every((key) =>
    moduleKeyReadable(readableKeys, key),
  )
}

/** Pool filtrado por perfiles del negocio y permisos del usuario. */
export function listMenuRootsyEligibleSuggestions(
  enabledModules: readonly PopAccessModule[],
): MenuRootsyCatalogSuggestion[] {
  const profiles = detectMenuRootsySuggestionProfiles(enabledModules)
  if (profiles.length === 0) return []

  const readableKeys = readableModuleKeys(enabledModules)
  const seen = new Set<string>()
  const out: MenuRootsyCatalogSuggestion[] = []

  for (const profile of profiles) {
    for (const entry of MENU_ROOTSY_SUGGESTION_CATALOG) {
      if (entry.profile !== profile) continue
      if (seen.has(entry.id)) continue
      if (!suggestionAllowed(entry, readableKeys)) continue
      seen.add(entry.id)
      out.push(entry)
    }
  }

  return out
}

function hashPickIndex(seed: string, length: number): number {
  if (length === 0) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash % length
}

/** Sugerencia rotativa — prioriza las que tienen datos del negocio. */
export function pickMenuRootsyCatalogSuggestionForPop(
  popId: string,
  enabledModules: readonly PopAccessModule[],
  rotationToken: string,
  insights?: MenuRootsyBusinessInsights | null,
): MenuRootsyCatalogSuggestion | null {
  const pool = listMenuRootsyEligibleSuggestions(enabledModules)
  if (pool.length === 0) return null

  const ranked = pool.map((suggestion) => ({
    suggestion,
    score: scoreSuggestionDataSupport(suggestion, insights),
  }))

  const bestScore = Math.max(...ranked.map((entry) => entry.score))
  const candidates =
    bestScore > 0
      ? ranked
          .filter((entry) => entry.score === bestScore)
          .map((entry) => entry.suggestion)
      : pool

  const seed = menuRootsySuggestionRotationSeed(popId, rotationToken)
  return candidates[hashPickIndex(seed, candidates.length)] ?? null
}

export function resolveMenuRootsyCatalogSuggestion(
  id: string,
  enabledModules: readonly PopAccessModule[],
): MenuRootsyCatalogSuggestion | null {
  const suggestion = getMenuRootsyCatalogSuggestion(id)
  if (!suggestion) return null
  const readableKeys = readableModuleKeys(enabledModules)
  if (!suggestionAllowed(suggestion, readableKeys)) return null
  return suggestion
}
