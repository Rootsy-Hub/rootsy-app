import type { MenuSectionKey } from "@/lib/menuCatalog"
import type { MenuRootsyBusinessInsights } from "@/lib/menu/menuRootsyInsightsShared"
import type { MenuRootsyOperationalSignals } from "@/lib/menu/menuRootsySignalsShared"

export type MenuRootsySuggestion = {
  label: string
  href: string
  moduleKey: string
}

export type MenuRootsyPulseTone = "neutral" | "ok" | "warn" | "alert"

export type MenuRootsyPulse = {
  id: "sales" | "margin" | "peak" | "ticket"
  label: string
  tone: MenuRootsyPulseTone
  /** Pulso visual cuando requiere atención. */
  attention: boolean
}

export type MenuRootsyAdvice = {
  title: string
  lead: string
  pulses: MenuRootsyPulse[]
  primaryCta: MenuRootsySuggestion | null
  suggestions: MenuRootsySuggestion[]
  source: "rules" | "ai"
  /** ID en el catálogo de sugerencias rotativas. */
  catalogSuggestionId?: string
}

export type MenuRootsyAllowedModule = {
  moduleKey: string
  label: string
  link: string
  href: string
}

export type MenuRootsyContext = {
  popId: string
  siteId: string
  sectionKey: MenuSectionKey
  sectionTitle: string
  popName: string
  businessType: string
  roleName: string
  isOwner: boolean
  hourLocal: number
  trialDaysLeft: number | null
  subscriptionActive: boolean
  allowedModules: MenuRootsyAllowedModule[]
  /** Todos los módulos habilitados del POP — para CTAs de crecimiento. */
  allModules: MenuRootsyAllowedModule[]
  signals: MenuRootsyOperationalSignals
  insights: MenuRootsyBusinessInsights | null
}
