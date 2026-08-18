import {
  menuRootsyGrowthRotationSeed,
  pickMenuRootsyGrowthOpportunity,
  type MenuRootsyGrowthOpportunity,
} from "@/lib/menu/menuRootsyInsightsShared"
import {
  buildGuaranteedMetricOpportunity,
  insightsHasDisplayableData,
  isMetaGenericVoice,
  textContainsNumericData,
} from "@/lib/menu/menuRootsyVoice"
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
  const insights = context.insights
  const fromInsights = (insights?.opportunities ?? []).filter(
    (entry) => !isMetaGenericVoice(entry.voice),
  )
  if (fromInsights.length > 0) return fromInsights

  if (insights && insightsHasDisplayableData(insights)) {
    const guaranteed = buildGuaranteedMetricOpportunity(insights, context.popName)
    if (guaranteed) return [guaranteed]
  }

  return []
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

function voiceMentionsModule(voice: string, label: string): boolean {
  return voice.toLowerCase().includes(label.trim().toLowerCase())
}

function appendSoftCta(voice: string, cta: MenuRootsySuggestion): string {
  if (voiceMentionsModule(voice, cta.label)) return voice
  return `${voice} Cuando quieras, en ${cta.label} lo exploramos juntos.`
}

function buildNoDataVoice(context: MenuRootsyContext): string {
  return `Todavía no tengo ventas cargadas ${context.insights?.periodLabel ?? "este mes"} para armar una mejora concreta en ${context.popName}. Apenas haya movimiento, te digo qué empujar.`
}

function buildVoice(
  context: MenuRootsyContext,
  opportunity: MenuRootsyGrowthOpportunity | null,
  primaryCta: MenuRootsySuggestion | null,
): string {
  if (!opportunity) {
    if (context.insights && insightsHasDisplayableData(context.insights)) {
      const guaranteed = buildGuaranteedMetricOpportunity(
        context.insights,
        context.popName,
      )
      if (guaranteed) {
        return primaryCta
          ? appendSoftCta(guaranteed.voice, primaryCta)
          : guaranteed.voice
      }
    }

    return buildNoDataVoice(context)
  }

  const voice = primaryCta
    ? appendSoftCta(opportunity.voice, primaryCta)
    : opportunity.voice

  return voice
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

  const insightsHaveData =
    context.insights != null && insightsHasDisplayableData(context.insights)

  if (
    insightsHaveData &&
    (isMetaGenericVoice(lead) ||
      (!textContainsNumericData(lead) && textContainsNumericData(fallback.lead)))
  ) {
    return fallback
  }

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
