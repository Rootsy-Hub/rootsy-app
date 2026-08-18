import type { MenuSectionKey } from "@/lib/menuCatalog"

export type MenuRootsySuggestion = {
  label: string
  href: string
  moduleKey: string
}

export type MenuRootsyAdvice = {
  title: string
  lead: string
  suggestions: MenuRootsySuggestion[]
  source: "rules" | "ai"
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
}
