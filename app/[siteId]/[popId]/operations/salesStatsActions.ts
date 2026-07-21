"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopById, validatePopAccess } from "@/lib/popHelpers"
import { popMenuHref, siteIdFromPopRow } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import {
  addCalendarDays,
  entryDateIsoInTimezone,
  localDateExclusiveEndTimestamp,
  localDateStartTimestamp,
  timezoneForPopLedger,
} from "@/lib/entryDateTimezone"
import {
  aggregateSaleIntoDay,
  emptyDayAggregation,
  sumDailyTotalsRows,
  type SalesPeriodStats,
} from "@/lib/saleDailyStats"
import { createClient } from "@/utils/supabase/server"

function localStatDateFromSoldAt(soldAt: string, timeZone: string): string | null {
  const d = new Date(soldAt)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat("sv-SE", { timeZone }).format(d)
}

function enumerateDatesInclusive(dateFrom: string, dateTo: string): string[] {
  const out: string[] = []
  let cursor = dateFrom
  while (cursor <= dateTo) {
    out.push(cursor)
    cursor = addCalendarDays(cursor, 1)
  }
  return out
}

export async function rebuildSalesDailyStats(
  popId: string,
  dateFrom: string,
  dateTo: string,
): Promise<{ success: true; daysProcessed: number } | { success: false; error: string }> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso" }
  }

  const perms = await loadPopPermissionsSnapshot(popId)
  const canReadStats =
    permissionKeysInclude(
      perms.keys,
      POP_PERMS.OPERATIONS_READ.resource,
      POP_PERMS.OPERATIONS_READ.action,
    ) ||
    permissionKeysInclude(
      perms.keys,
      POP_PERMS.SALE_READ.resource,
      POP_PERMS.SALE_READ.action,
    )
  if (!canReadStats) {
    return { success: false, error: "No tenés permiso para ver estadísticas de ventas." }
  }

  const popRes = await getPopById(popId)
  if (!popRes.success || !popRes.pop) {
    return { success: false, error: "Punto de operación no encontrado." }
  }

  const timeZone = timezoneForPopLedger(
    popRes.pop.country,
    siteIdFromPopRow(popRes.pop),
  )
  const supabase = await createClient()
  const dates = enumerateDatesInclusive(dateFrom, dateTo)
  let daysProcessed = 0

  for (const statDate of dates) {
    const dayStart = localDateStartTimestamp(timeZone, statDate)
    const dayEnd = localDateExclusiveEndTimestamp(timeZone, statDate)

    const { data: sales, error: salesErr } = await supabase
      .from("sales")
      .select("id, total, tax_total, metadata, line_items")
      .eq("pop_id", popId)
      .eq("status", "completed")
      .gte("sold_at", dayStart)
      .lt("sold_at", dayEnd)

    if (salesErr) {
      return {
        success: false,
        error: salesErr.message || "No se pudieron leer ventas para agregar.",
      }
    }

    const aggregation = emptyDayAggregation()
    for (const sale of sales || []) {
      aggregateSaleIntoDay(aggregation, {
        metadata: sale.metadata,
        lineItems: sale.line_items,
        total: Number(sale.total ?? 0),
        taxTotal: Number(sale.tax_total ?? 0),
      })
    }

    await supabase
      .from("sales_daily_totals")
      .delete()
      .eq("pop_id", popId)
      .eq("stat_date", statDate)
    await supabase
      .from("sales_daily_promotions")
      .delete()
      .eq("pop_id", popId)
      .eq("stat_date", statDate)
    await supabase
      .from("sales_daily_articles")
      .delete()
      .eq("pop_id", popId)
      .eq("stat_date", statDate)
    await supabase
      .from("sales_daily_recipes")
      .delete()
      .eq("pop_id", popId)
      .eq("stat_date", statDate)
    await supabase
      .from("sales_daily_discounts")
      .delete()
      .eq("pop_id", popId)
      .eq("stat_date", statDate)
    await supabase
      .from("sales_daily_article_in_promo")
      .delete()
      .eq("pop_id", popId)
      .eq("stat_date", statDate)

    if ((sales?.length ?? 0) > 0) {
      const { error: totalsErr } = await supabase.from("sales_daily_totals").insert({
        pop_id: popId,
        stat_date: statDate,
        list_subtotal: aggregation.totals.listSubtotal,
        discount_promotions: aggregation.totals.discountPromotions,
        discount_items_catalog: aggregation.totals.discountItemsCatalog,
        discount_items_manual: aggregation.totals.discountItemsManual,
        discount_general: aggregation.totals.discountGeneral,
        tax_total: aggregation.totals.taxTotal,
        total: aggregation.totals.total,
        sale_count: aggregation.totals.saleCount,
      })
      if (totalsErr) {
        return {
          success: false,
          error: totalsErr.message || "No se pudieron guardar totales diarios.",
        }
      }

      if (aggregation.promotions.length > 0) {
        const { error } = await supabase.from("sales_daily_promotions").insert(
          aggregation.promotions.map((row) => ({
            pop_id: popId,
            stat_date: statDate,
            promotion_key: row.promotionKey,
            promotion_name: row.promotionName,
            promotion_kind: row.promotionKind,
            applications: row.applications,
            discount_amount: row.discountAmount,
            revenue_amount: row.revenueAmount,
          })),
        )
        if (error) {
          return { success: false, error: error.message || "Error en promos diarias." }
        }
      }

      if (aggregation.articles.length > 0) {
        const { error } = await supabase.from("sales_daily_articles").insert(
          aggregation.articles.map((row) => ({
            pop_id: popId,
            stat_date: statDate,
            article_id: row.articleId,
            name_snapshot: row.nameSnapshot,
            quantity: row.quantity,
            list_amount: row.listAmount,
            discount_amount: row.discountAmount,
            revenue_amount: row.revenueAmount,
          })),
        )
        if (error) {
          return { success: false, error: error.message || "Error en artículos diarios." }
        }
      }

      if (aggregation.recipes.length > 0) {
        const { error } = await supabase.from("sales_daily_recipes").insert(
          aggregation.recipes.map((row) => ({
            pop_id: popId,
            stat_date: statDate,
            recipe_id: row.recipeId,
            name_snapshot: row.nameSnapshot,
            quantity: row.quantity,
            list_amount: row.listAmount,
            discount_amount: row.discountAmount,
            revenue_amount: row.revenueAmount,
          })),
        )
        if (error) {
          return { success: false, error: error.message || "Error en recetas diarias." }
        }
      }

      if (aggregation.discounts.length > 0) {
        const { error } = await supabase.from("sales_daily_discounts").insert(
          aggregation.discounts.map((row) => ({
            pop_id: popId,
            stat_date: statDate,
            discount_kind: row.discountKind,
            discount_label: row.discountLabel,
            applications: row.applications,
            discount_amount: row.discountAmount,
          })),
        )
        if (error) {
          return { success: false, error: error.message || "Error en descuentos diarios." }
        }
      }

      if (aggregation.articleInPromo.length > 0) {
        const { error } = await supabase.from("sales_daily_article_in_promo").insert(
          aggregation.articleInPromo.map((row) => ({
            pop_id: popId,
            stat_date: statDate,
            article_id: row.articleId,
            promotion_key: row.promotionKey,
            name_snapshot: row.nameSnapshot,
            quantity: row.quantity,
          })),
        )
        if (error) {
          return {
            success: false,
            error: error.message || "Error en artículos en promo diarios.",
          }
        }
      }
    }

    daysProcessed += 1
  }

  return { success: true, daysProcessed }
}

export async function getSalesPeriodStats(
  popId: string,
  dateFrom: string,
  dateTo: string,
): Promise<
  | { success: true; stats: SalesPeriodStats; needsRebuild: boolean }
  | { success: false; error: string; redirect?: string }
> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso" }
  }

  const perms = await loadPopPermissionsSnapshot(popId)
  const popRes = await getPopById(popId)
  const canReadStats =
    permissionKeysInclude(
      perms.keys,
      POP_PERMS.OPERATIONS_READ.resource,
      POP_PERMS.OPERATIONS_READ.action,
    ) ||
    permissionKeysInclude(
      perms.keys,
      POP_PERMS.SALE_READ.resource,
      POP_PERMS.SALE_READ.action,
    )
  if (!canReadStats) {
    const siteId =
      popRes.success && popRes.pop ? siteIdFromPopRow(popRes.pop) : "arg"
    return {
      success: false,
      error: "No tenés permiso para ver estadísticas de ventas.",
      redirect: popMenuHref(siteId, popId),
    }
  }

  const supabase = await createClient()

  const { data: totalRows, error: totalsErr } = await supabase
    .from("sales_daily_totals")
    .select("*")
    .eq("pop_id", popId)
    .gte("stat_date", dateFrom)
    .lte("stat_date", dateTo)

  if (totalsErr) {
    return {
      success: false,
      error: totalsErr.message || "No se pudieron cargar estadísticas.",
    }
  }

  const parsedTotals = (totalRows || []).map((row) => ({
    listSubtotal: Number(row.list_subtotal ?? 0),
    discountPromotions: Number(row.discount_promotions ?? 0),
    discountItemsCatalog: Number(row.discount_items_catalog ?? 0),
    discountItemsManual: Number(row.discount_items_manual ?? 0),
    discountGeneral: Number(row.discount_general ?? 0),
    taxTotal: Number(row.tax_total ?? 0),
    total: Number(row.total ?? 0),
    saleCount: Number(row.sale_count ?? 0),
  }))

  const needsRebuild = parsedTotals.length === 0

  const { data: promoRows } = await supabase
    .from("sales_daily_promotions")
    .select("*")
    .eq("pop_id", popId)
    .gte("stat_date", dateFrom)
    .lte("stat_date", dateTo)

  const promoMap = new Map<
    string,
    SalesPeriodStats["topPromotions"][number]
  >()
  for (const row of promoRows || []) {
    const key = String(row.promotion_key)
    const existing = promoMap.get(key)
    const next = {
      promotionKey: key,
      promotionName: String(row.promotion_name ?? ""),
      promotionKind:
        row.promotion_kind === "combo"
          ? ("combo" as const)
          : ("quantity_deal" as const),
      applications: Number(row.applications ?? 0),
      discountAmount: Number(row.discount_amount ?? 0),
      revenueAmount: Number(row.revenue_amount ?? 0),
    }
    if (existing) {
      existing.applications += next.applications
      existing.discountAmount += next.discountAmount
      existing.revenueAmount += next.revenueAmount
    } else {
      promoMap.set(key, next)
    }
  }

  const { data: articleRows } = await supabase
    .from("sales_daily_articles")
    .select("*")
    .eq("pop_id", popId)
    .gte("stat_date", dateFrom)
    .lte("stat_date", dateTo)

  const articleMap = new Map<string, SalesPeriodStats["topArticles"][number]>()
  for (const row of articleRows || []) {
    const articleId = String(row.article_id)
    const existing = articleMap.get(articleId)
    const next = {
      articleId,
      nameSnapshot: String(row.name_snapshot ?? ""),
      quantity: Number(row.quantity ?? 0),
      revenueAmount: Number(row.revenue_amount ?? 0),
    }
    if (existing) {
      existing.quantity += next.quantity
      existing.revenueAmount += next.revenueAmount
    } else {
      articleMap.set(articleId, next)
    }
  }

  const totals = sumDailyTotalsRows(parsedTotals)
  const topPromotions = [...promoMap.values()]
    .sort((a, b) => b.revenueAmount - a.revenueAmount)
    .slice(0, 5)
  const topArticles = [...articleMap.values()]
    .sort((a, b) => b.revenueAmount - a.revenueAmount)
    .slice(0, 5)

  return {
    success: true,
    needsRebuild,
    stats: {
      ...totals,
      dateFrom,
      dateTo,
      topPromotions,
      topArticles,
    },
  }
}

export async function rebuildSalesDailyStatsForToday(
  popId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const popRes = await getPopById(popId)
  if (!popRes.success || !popRes.pop) {
    return { success: false, error: "Punto de operación no encontrado." }
  }
  const timeZone = timezoneForPopLedger(
    popRes.pop.country,
    siteIdFromPopRow(popRes.pop),
  )
  const today = entryDateIsoInTimezone(timeZone)
  const res = await rebuildSalesDailyStats(popId, today, today)
  if (!res.success) return res
  return { success: true }
}

export { localStatDateFromSoldAt }
