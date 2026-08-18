import "server-only"

import type { PopAccessModule } from "@/app/home/homeUserDataTypes"
import {
  localDateExclusiveEndTimestamp,
  localDateStartTimestamp,
} from "@/lib/entryDateTimezone"
import {
  MENU_ROOTSY_DAY_NAMES,
  type MenuRootsyOperationalSignals,
} from "@/lib/menu/menuRootsySignalsShared"
import { canAccessMenuItemFromPopAccess } from "@/lib/menuPopAccess"
import { loadPopOperationalContext } from "@/lib/popTimezoneServer"
import { computeSummaryDateBounds } from "@/lib/summaryDateFilter"
import { createClient } from "@/utils/supabase/server"

export type { MenuRootsyOperationalSignals } from "@/lib/menu/menuRootsySignalsShared"

function hasModule(enabledModules: readonly PopAccessModule[], key: string): boolean {
  return enabledModules.some(
    (mod) => mod.key === key && mod.permissions?.read,
  )
}

function classifyStockLevel(
  quantity: number,
  minLevel: number | null,
): "below_min" | "out_of_stock" | "ok" {
  if (quantity <= 0) return "out_of_stock"
  if (minLevel != null && minLevel > 0 && quantity < minLevel) return "below_min"
  return "ok"
}

async function countOpenCashSessions(popId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("cash_register_sessions")
    .select("id", { count: "exact", head: true })
    .eq("pop_id", popId)
    .eq("status", "open")

  if (error) return 0
  return count ?? 0
}

async function countSalesToday(popId: string): Promise<number> {
  const supabase = await createClient()
  const { timeZone } = await loadPopOperationalContext(supabase, popId)
  const { from, to } = computeSummaryDateBounds("today", undefined)

  let query = supabase
    .from("sales")
    .select("id", { count: "exact", head: true })
    .eq("pop_id", popId)

  if (from) {
    query = query.gte("sold_at", localDateStartTimestamp(timeZone, from))
  }
  if (to) {
    query = query.lt("sold_at", localDateExclusiveEndTimestamp(timeZone, to))
  }

  const { count, error } = await query
  if (error) return 0
  return count ?? 0
}

async function countStockAlerts(popId: string): Promise<{
  lowStockCount: number
  outOfStockCount: number
}> {
  const supabase = await createClient()
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, min_stock_level, track_stock")
    .eq("pop_id", popId)
    .eq("is_active", true)

  if (error || !articles?.length) {
    return { lowStockCount: 0, outOfStockCount: 0 }
  }

  const tracked = articles.filter((article) => article.track_stock)
  if (tracked.length === 0) {
    return { lowStockCount: 0, outOfStockCount: 0 }
  }

  const articleIds = tracked.map((article) => String(article.id))
  const { data: movements } = await supabase
    .from("inventory_movements")
    .select("article_id, quantity_delta")
    .eq("pop_id", popId)
    .in("article_id", articleIds)

  const onHand = new Map<string, number>()
  for (const movement of movements ?? []) {
    const articleId = String(movement.article_id)
    onHand.set(
      articleId,
      (onHand.get(articleId) ?? 0) + Number(movement.quantity_delta ?? 0),
    )
  }

  let lowStockCount = 0
  let outOfStockCount = 0

  for (const article of tracked) {
    const articleId = String(article.id)
    const quantity = onHand.get(articleId) ?? 0
    const minLevel =
      article.min_stock_level != null ? Number(article.min_stock_level) : null
    const level = classifyStockLevel(quantity, minLevel)
    if (level === "out_of_stock") outOfStockCount += 1
    if (level === "below_min") lowStockCount += 1
  }

  return { lowStockCount, outOfStockCount }
}

/** Señales operativas agregadas — sin PII, solo contadores. */
export async function loadMenuRootsyOperationalSignals(
  popId: string,
  enabledModules: readonly PopAccessModule[],
  now: Date = new Date(),
): Promise<MenuRootsyOperationalSignals> {
  const dayOfWeek = MENU_ROOTSY_DAY_NAMES[now.getDay()] ?? "hoy"

  const canCash =
    hasModule(enabledModules, "cash_registers") ||
    canAccessMenuItemFromPopAccess(enabledModules, "cash-registers")
  const canSales = hasModule(enabledModules, "sale")
  const canStock =
    hasModule(enabledModules, "stock") ||
    hasModule(enabledModules, "inventory") ||
    canAccessMenuItemFromPopAccess(enabledModules, "articles") ||
    canAccessMenuItemFromPopAccess(enabledModules, "inventory")

  const [openCashRegisterCount, salesTodayCount, stockAlerts] = await Promise.all([
    canCash ? countOpenCashSessions(popId) : Promise.resolve(null),
    canSales ? countSalesToday(popId) : Promise.resolve(null),
    canStock ? countStockAlerts(popId) : Promise.resolve(null),
  ])

  return {
    dayOfWeek,
    cashRegisterOpen:
      openCashRegisterCount == null ? null : openCashRegisterCount > 0,
    openCashRegisterCount,
    salesTodayCount,
    lowStockCount: stockAlerts?.lowStockCount ?? null,
    outOfStockCount: stockAlerts?.outOfStockCount ?? null,
  }
}
