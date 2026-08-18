"use server"

import { getPopAccessCache } from "@/app/home/homeUserDataActions"
import type { MenuSectionKey } from "@/lib/menuCatalog"
import { getMenuRootsyAiAdviceCached } from "@/lib/menu/menuRootsyCache"
import {
  buildMenuRootsyAdvice,
  isMenuRootsyAiConfigured,
} from "@/lib/menu/menuRootsyAi"
import { buildMenuRootsyContext } from "@/lib/menu/menuRootsyContext"
import type { MenuRootsyAdvice } from "@/lib/menu/menuRootsyTypes"
import { validatePopAccess } from "@/lib/popHelpers"
import { siteIdsMatchClientRoute } from "@/lib/popRoutes"

type FetchMenuRootsyAdviceInput = {
  popId: string
  siteId: string
  sectionKey: MenuSectionKey
  sectionTitle: string
  useAi?: boolean
}

export async function fetchMenuRootsyAdvice(
  input: FetchMenuRootsyAdviceInput,
): Promise<
  | { success: true; advice: MenuRootsyAdvice }
  | { success: false; error: string }
> {
  const { popId, siteId, sectionKey, sectionTitle, useAi = true } = input

  if (!popId?.trim() || !siteId?.trim()) {
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

  const context = buildMenuRootsyContext({
    popAccess,
    siteId,
    sectionKey,
    sectionTitle,
  })

  const ruleAdvice = buildMenuRootsyAdvice(context)
  const advice =
    useAi && isMenuRootsyAiConfigured()
      ? await getMenuRootsyAiAdviceCached(context, ruleAdvice)
      : ruleAdvice

  return { success: true, advice }
}
