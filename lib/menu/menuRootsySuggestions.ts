import {
  MENU_ROOTSY_FALLBACK_GROWTH_TIPS,
  menuRootsyGrowthRotationSeed,
  pickMenuRootsyGrowthOpportunity,
  type MenuRootsyGrowthOpportunity,
} from "@/lib/menu/menuRootsyInsightsShared"
import type {
  MenuRootsyAdvice,
  MenuRootsyAllowedModule,
  MenuRootsyContext,
  MenuRootsySuggestion,
} from "@/lib/menu/menuRootsyTypes"

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

function growthOpportunityPool(context: MenuRootsyContext): MenuRootsyGrowthOpportunity[] {
  const fromInsights = context.insights?.opportunities ?? []
  if (fromInsights.length > 0) return fromInsights
  return MENU_ROOTSY_FALLBACK_GROWTH_TIPS
}

function pickPrimaryOpportunity(
  context: MenuRootsyContext,
): MenuRootsyGrowthOpportunity | null {
  const pool = growthOpportunityPool(context)
  return pickMenuRootsyGrowthOpportunity(
    pool,
    menuRootsyGrowthRotationSeed(context.popId),
  )
}

function pickPrimaryCta(
  context: MenuRootsyContext,
  opportunity: MenuRootsyGrowthOpportunity | null,
): MenuRootsySuggestion | null {
  if (!opportunity) return null

  const mod = pickModule(context.allModules, opportunity.ctaModuleKeys)
  if (mod) return toSuggestion(mod)

  const fallback = pickModule(context.allModules, [
    "statistics",
    "promotions",
    "reports",
  ])
  return fallback ? toSuggestion(fallback) : null
}

function buildVoice(
  context: MenuRootsyContext,
  opportunity: MenuRootsyGrowthOpportunity | null,
  primaryCta: MenuRootsySuggestion | null,
): string {
  if (!opportunity) {
    return `Vivo acá abajo, al lado de ${context.popName}, y aprendo su ritmo todos los días. Cuando quieras, miramos juntos dónde está la próxima oportunidad de crecer.`
  }

  if (primaryCta) {
    return `${opportunity.voice} Si te pinta, podemos ver ${primaryCta.label}.`
  }

  return opportunity.voice
}

/** Consejo de Rootsy — voz propia, sin títulos ni chips. */
export function buildMenuRootsyRuleAdvice(
  context: MenuRootsyContext,
): MenuRootsyAdvice {
  const opportunity = pickPrimaryOpportunity(context)
  const primaryCta = pickPrimaryCta(context, opportunity)

  return {
    title: "",
    lead: buildVoice(context, opportunity, primaryCta),
    pulses: [],
    primaryCta,
    suggestions: primaryCta ? [primaryCta] : [],
    source: "rules",
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
    suggestions.push(toSuggestion(mod))
  }

  const lead = raw.lead?.trim().slice(0, 420) || fallback.lead
  const primaryCta = suggestions[0] ?? fallback.primaryCta

  if (!primaryCta && !lead) {
    return fallback
  }

  return {
    title: "",
    lead,
    pulses: [],
    primaryCta,
    suggestions: primaryCta ? [primaryCta] : [],
    source: "ai",
  }
}
