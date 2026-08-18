"use server"

import { getPopAccessCache } from "@/app/home/homeUserDataActions"
import type { MenuSectionKey } from "@/lib/menuCatalog"
import { buildMenuRootsyAdvice } from "@/lib/menu/menuRootsyAi"
import { buildMenuRootsyContext } from "@/lib/menu/menuRootsyContext"
import { loadMenuRootsyOperationalSignals } from "@/lib/menu/menuRootsySignals"
import { loadMenuRootsyBusinessInsights } from "@/lib/menu/menuRootsyInsights"
import { buildMenuRootsyDetailMessage } from "@/lib/menu/menuRootsySuggestionVoice"
import { resolveMenuRootsyCatalogSuggestion } from "@/lib/menu/menuRootsySuggestionProfile"
import type { MenuRootsyAdvice } from "@/lib/menu/menuRootsyTypes"
import type { MenuRootsySuggestionDetail } from "@/lib/menu/menuRootsySuggestionCatalogTypes"
import { validatePopAccess } from "@/lib/popHelpers"
import { siteIdsMatchClientRoute } from "@/lib/popRoutes"

type FetchMenuRootsyAdviceInput = {
  popId: string
  siteId: string
  sectionKey: MenuSectionKey
  sectionTitle: string
  rotationToken: string
}

export async function fetchMenuRootsyAdvice(
  input: FetchMenuRootsyAdviceInput,
): Promise<
  | { success: true; advice: MenuRootsyAdvice }
  | { success: false; error: string }
> {
  const { popId, siteId, sectionKey, sectionTitle, rotationToken } = input

  if (!popId?.trim() || !siteId?.trim() || !rotationToken?.trim()) {
    return { success: false, error: "Parámetros inválidos" }
  }

  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso" }
  }

  const popAccess = await getPopAccessCache(popId)
  if (!popAccess?.canEnter) {
    return { success: false, error: "No se pudo cargar el acceso al negocio" }
  }

  if (!siteIdsMatchClientRoute(siteId, popAccess.pop.siteId)) {
    return { success: false, error: "Sitio inválido para este negocio" }
  }

  const [signals, insights] = await Promise.all([
    loadMenuRootsyOperationalSignals(popId, popAccess.enabledModules),
    loadMenuRootsyBusinessInsights(
      popId,
      popAccess.enabledModules,
      popAccess.pop.name,
    ),
  ])

  const context = buildMenuRootsyContext({
    popAccess,
    siteId,
    sectionKey,
    sectionTitle,
    signals,
    insights,
  })

  const advice = buildMenuRootsyAdvice(
    context,
    popAccess.enabledModules,
    rotationToken,
  )

  return { success: true, advice }
}

type FetchMenuRootsySuggestionDetailInput = {
  popId: string
  siteId: string
  suggestionId: string
  sectionKey: MenuSectionKey
  sectionTitle: string
}

export async function fetchMenuRootsySuggestionDetail(
  input: FetchMenuRootsySuggestionDetailInput,
): Promise<
  | { success: true; detail: MenuRootsySuggestionDetail }
  | { success: false; error: string }
> {
  const { popId, siteId, suggestionId, sectionKey, sectionTitle } = input

  if (!popId?.trim() || !siteId?.trim() || !suggestionId?.trim()) {
    return { success: false, error: "Parámetros inválidos" }
  }

  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso" }
  }

  const popAccess = await getPopAccessCache(popId)
  if (!popAccess?.canEnter) {
    return { success: false, error: "No se pudo cargar el acceso al negocio" }
  }

  if (!siteIdsMatchClientRoute(siteId, popAccess.pop.siteId)) {
    return { success: false, error: "Sitio inválido para este negocio" }
  }

  const suggestion = resolveMenuRootsyCatalogSuggestion(
    suggestionId,
    popAccess.enabledModules,
  )
  if (!suggestion) {
    return { success: false, error: "Sugerencia no disponible" }
  }

  const insights = await loadMenuRootsyBusinessInsights(
    popId,
    popAccess.enabledModules,
    popAccess.pop.name,
  )

  const context = buildMenuRootsyContext({
    popAccess,
    siteId,
    sectionKey,
    sectionTitle,
    insights,
  })

  const { message, hasDataSupport } = buildMenuRootsyDetailMessage(
    context.popName,
    suggestion,
    insights,
  )

  const moduleIndex = context.allModules
  let cta: MenuRootsySuggestionDetail["cta"] = null
  for (const key of suggestion.ctaModuleKeys) {
    const mod = moduleIndex.find(
      (entry) => entry.moduleKey === key || entry.link === key,
    )
    if (mod) {
      cta = {
        label: mod.label,
        href: mod.href,
        moduleKey: mod.moduleKey,
      }
      break
    }
  }

  return {
    success: true,
    detail: {
      id: suggestion.id,
      title: suggestion.title,
      message,
      hasDataSupport,
      cta,
    },
  }
}

export async function fetchMenuRootsySignals(
  popId: string,
): Promise<
  | { success: true; signals: Awaited<ReturnType<typeof loadMenuRootsyOperationalSignals>> }
  | { success: false; error: string }
> {
  if (!popId?.trim()) {
    return { success: false, error: "Parámetros inválidos" }
  }

  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso" }
  }

  const popAccess = await getPopAccessCache(popId)
  if (!popAccess?.canEnter) {
    return { success: false, error: "No se pudo cargar el acceso al negocio" }
  }

  const signals = await loadMenuRootsyOperationalSignals(
    popId,
    popAccess.enabledModules,
  )

  return { success: true, signals }
}
