import type { PopAccessCache } from "@/app/home/homeUserDataTypes"
import type { MenuSectionKey } from "@/lib/menuCatalog"
import {
  buildMenuSectionsFromEnabledModules,
} from "@/lib/menuPopAccess"
import { popScopedHref } from "@/lib/popRoutes"
import type {
  MenuRootsyAllowedModule,
  MenuRootsyContext,
} from "@/lib/menu/menuRootsyTypes"

export function buildMenuRootsyContext(input: {
  popAccess: PopAccessCache
  siteId: string
  sectionKey: MenuSectionKey
  sectionTitle: string
  now?: Date
}): MenuRootsyContext {
  const { popAccess, siteId, sectionKey, sectionTitle } = input
  const now = input.now ?? new Date()
  const menuSections = buildMenuSectionsFromEnabledModules(
    popAccess.enabledModules,
  )
  const sectionItems = menuSections[sectionKey]?.items ?? []

  const allowedModules: MenuRootsyAllowedModule[] = sectionItems
    .filter((item) => item.link !== "section")
    .map((item) => ({
      moduleKey: item.moduleKey ?? item.link,
      label: item.name,
      link: item.link,
      href: popScopedHref(siteId, popAccess.pop.id, item.link),
    }))

  const trialEndsAt = popAccess.subscription.trialEndsAt
  let trialDaysLeft: number | null = null
  if (trialEndsAt) {
    const end = new Date(trialEndsAt)
    if (!Number.isNaN(end.getTime())) {
      trialDaysLeft = Math.max(
        0,
        Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      )
    }
  }

  return {
    popId: popAccess.pop.id,
    siteId,
    sectionKey,
    sectionTitle,
    popName: popAccess.pop.name,
    businessType:
      popAccess.subscription.businessTypeDisplayName ||
      popAccess.subscription.businessTypeName ||
      "Negocio",
    roleName: popAccess.isOwner
      ? "Dueño"
      : popAccess.role?.displayName?.trim() ||
        popAccess.role?.name?.trim() ||
        "Miembro",
    isOwner: popAccess.isOwner,
    hourLocal: now.getHours(),
    trialDaysLeft,
    subscriptionActive: popAccess.subscription.isActive,
    allowedModules,
  }
}

/** Módulos de toda la grilla (para validar respuestas de IA). */
export function buildMenuRootsyAllowedModuleIndex(
  popAccess: PopAccessCache,
  siteId: string,
): Map<string, MenuRootsyAllowedModule> {
  const menuSections = buildMenuSectionsFromEnabledModules(
    popAccess.enabledModules,
  )
  const index = new Map<string, MenuRootsyAllowedModule>()

  for (const section of Object.values(menuSections)) {
    for (const item of section.items) {
      if (item.link === "section") continue
      const moduleKey = item.moduleKey ?? item.link
      index.set(moduleKey, {
        moduleKey,
        label: item.name,
        link: item.link,
        href: popScopedHref(siteId, popAccess.pop.id, item.link),
      })
      index.set(item.link, index.get(moduleKey)!)
    }
  }

  return index
}
