import type {
  MenuRootsyAdvice,
  MenuRootsyAllowedModule,
  MenuRootsyContext,
  MenuRootsySuggestion,
} from "@/lib/menu/menuRootsyTypes"
import { pickMenuRootsyCatalogSuggestionForPop } from "@/lib/menu/menuRootsySuggestionProfile"
import {
  formatRootsyBubbleLead,
  formatRootsyEmptyPopLead,
  scoreSuggestionDataSupport,
} from "@/lib/menu/menuRootsySuggestionVoice"
import type { PopAccessModule } from "@/app/home/homeUserDataTypes"

function pickModule(
  allowed: MenuRootsyAllowedModule[],
  keys: string[],
): MenuRootsyAllowedModule | undefined {
  for (const key of keys) {
    const match = allowed.find(
      (entry) =>
        entry.moduleKey === key ||
        entry.link === key ||
        entry.moduleKey.replace(/_/g, "-") === key,
    )
    if (match) return match
  }
  return undefined
}

function toSuggestion(mod: MenuRootsyAllowedModule): MenuRootsySuggestion {
  return {
    label: mod.label,
    href: mod.href,
    moduleKey: mod.moduleKey,
  }
}

function pickPrimaryCta(
  context: MenuRootsyContext,
  ctaModuleKeys: string[],
): MenuRootsySuggestion | null {
  const mod = pickModule(context.allModules, ctaModuleKeys)
  if (mod) return toSuggestion(mod)
  const fallback = pickModule(context.allModules, [
    "statistics",
    "sale",
    "mostrador",
    "mesas",
    "services",
    "active_services",
  ])
  return fallback ? toSuggestion(fallback) : null
}

/** Consejo de Rootsy desde catálogo rotativo — voz para iniciados. */
export function buildMenuRootsyRuleAdvice(
  context: MenuRootsyContext,
  enabledModules: readonly PopAccessModule[],
  rotationToken: string,
): MenuRootsyAdvice {
  const catalogEntry = pickMenuRootsyCatalogSuggestionForPop(
    context.popId,
    enabledModules,
    rotationToken,
    context.insights,
  )

  if (!catalogEntry) {
    return {
      title: "",
      lead: formatRootsyEmptyPopLead(context.popName, rotationToken),
      pulses: [],
      primaryCta: null,
      suggestions: [],
      source: "rules",
    }
  }

  const dataBacked =
    scoreSuggestionDataSupport(catalogEntry, context.insights) > 0
  const primaryCta = pickPrimaryCta(context, catalogEntry.ctaModuleKeys)

  return {
    title: catalogEntry.title,
    lead: formatRootsyBubbleLead(
      catalogEntry.teaser,
      context.popName,
      dataBacked,
      catalogEntry.id,
      rotationToken,
    ),
    pulses: [],
    primaryCta,
    suggestions: primaryCta ? [primaryCta] : [],
    source: "rules",
    catalogSuggestionId: catalogEntry.id,
  }
}

export function sanitizeMenuRootsyAdvice(
  raw: Pick<MenuRootsyAdvice, "lead" | "suggestions">,
  context: MenuRootsyContext,
  fallback: MenuRootsyAdvice,
): MenuRootsyAdvice {
  const allowedByKey = new Map(
    context.allModules.map((mod) => [mod.moduleKey, mod]),
  )

  const suggestions: MenuRootsySuggestion[] = []
  for (const entry of raw.suggestions) {
    if (suggestions.length >= 1) break
    const mod =
      allowedByKey.get(entry.moduleKey) ??
      context.allModules.find((item) => item.link === entry.moduleKey)
    if (!mod) continue
    suggestions.push({
      label: mod.label,
      href: mod.href,
      moduleKey: mod.moduleKey,
    })
  }

  const lead = raw.lead?.trim().slice(0, 420) || fallback.lead
  const primaryCta = suggestions[0] ?? fallback.primaryCta

  if (!primaryCta && !lead) {
    return fallback
  }

  return {
    title: fallback.title,
    lead,
    pulses: [],
    primaryCta,
    suggestions: primaryCta ? [primaryCta] : [],
    source: "ai",
    catalogSuggestionId: fallback.catalogSuggestionId,
  }
}
