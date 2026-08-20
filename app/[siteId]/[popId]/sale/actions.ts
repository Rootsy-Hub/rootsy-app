"use server"

import { DEFAULT_SALE_SITE_ID } from "@/lib/saleInvoiceTypes"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { createClient } from "@/utils/supabase/server"
import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import { loadPriceListOverrideMap } from "@/app/[siteId]/[popId]/articles/priceListActions"
import {
  mapSaleCatalogArticleRow,
  SALE_CATALOG_ARTICLE_SELECT,
} from "@/lib/saleCatalogArticleMap"
import {
  OPERATE_CATALOG_PAGE_SIZE,
  sanitizeCatalogIlike,
  type OperateCatalogItemsFilter,
  type OperateCatalogItemsPage,
} from "@/lib/operateCatalogPage"
import {
  loadMenuPromotions,
  type MenuCatalogCategorySection,
  type MenuCatalogPromotion,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { filterComboPromotionsForSale } from "@/lib/saleMenuCatalog"
import { resolveOpenCashSession } from "@/lib/cashRegisterSession"
import { fetchTreasuryPaymentContext } from "@/lib/treasuryPaymentContextLoad"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import type { CheckoutCheckDetails } from "@/lib/checkoutCheck"
import type { OperationPaymentKind } from "@/lib/operationPaymentKinds"

export type SaleCatalogPaymentOption = {
  kind: OperationPaymentKind
  treasuryAccountId: string
  label: string
  checkDetails?: CheckoutCheckDetails
}

export type SaleCatalogCategory = {
  id: string
  name: string
  sortOrder: number
}

export type SaleCatalogArticle = {
  id: string
  name: string
  description: string
  salePrice: number
  originalSalePrice?: number
  discountMode?: ArticleDiscountMode | null
  discountValue?: number | null
  iva: number
  categoryId: string
  categoryName: string
  unitOfMeasure: string
  imageUrl: string | null
  barcode?: string | null
}

export type SaleCatalogClient = {
  id: string
  name: string
  taxId: string | null
  ivaCondition: string | null
  defaultInvoiceTypeLabel: string | null
  currentAccountEnabled?: boolean
}

export type SaleCatalogPaymentMethod = SaleCatalogPaymentOption

export type SaleOpenCashSession = {
  sessionId: string
  cashRegisterId: string
  registerName: string
  cashTreasuryAccountId: string
}

export async function getSaleCatalog(popId: string): Promise<
  | {
      success: true
      popName: string
      categories: SaleCatalogCategory[]
      categorySections: MenuCatalogCategorySection[]
      articles: SaleCatalogArticle[]
      promotions: MenuCatalogPromotion[]
      quantityDeals: MenuCatalogPromotion[]
      clients: SaleCatalogClient[]
      treasuryPaymentContext: TreasuryPaymentContext | null
      canReadClients: boolean
      canReadPaymentMethods: boolean
      canCreateSale: boolean
      canReadCashRegisters: boolean
      openCashSession: SaleOpenCashSession | null
      invoiceTypeSiteId: string
    }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const snap = await loadPopPermissionsSnapshot(popId)
    const hasSaleRead = permissionKeysInclude(
      snap.keys,
      POP_PERMS.SALE_READ.resource,
      POP_PERMS.SALE_READ.action,
    )
    if (!hasSaleRead) {
      return {
        success: false,
        error:
          "Necesitás permiso de lectura de ventas (sale:read) para usar esta pantalla.",
      }
    }

    const canReadClients = hasSaleRead
    const canReadPaymentMethods = hasSaleRead
    const canReadCashRegisters = hasSaleRead
    const canCreateSale = permissionKeysInclude(
      snap.keys,
      POP_PERMS.SALE_CREATE.resource,
      POP_PERMS.SALE_CREATE.action,
    )

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const [
      popNameResult,
      catResult,
      cashResult,
      treasuryResult,
      allPromotions,
    ] = await Promise.all([
      supabase.from("pops").select("name").eq("id", popId).maybeSingle(),
      supabase
        .from("categories")
        .select("id, name, sort_order")
        .eq("pop_id", popId)
        .eq("show_in_sale", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      canReadCashRegisters
        ? resolveOpenCashSession(supabase, popId, user?.id)
        : Promise.resolve(null),
      canReadPaymentMethods
        ? fetchTreasuryPaymentContext(supabase, popId)
        : Promise.resolve(null),
      loadMenuPromotions(supabase, popId),
    ])

    if (popNameResult.error) {
      return { success: false, error: popNameResult.error.message }
    }
    if (catResult.error) {
      return { success: false, error: catResult.error.message }
    }
    if (treasuryResult && !treasuryResult.success) {
      return { success: false, error: treasuryResult.error }
    }

    const popName = popNameResult.data?.name
      ? String(popNameResult.data.name)
      : ""

    const categories: SaleCatalogCategory[] = (catResult.data || []).map(
      (c) => ({
        id: String(c.id),
        name: String(c.name ?? ""),
        sortOrder: Number(c.sort_order ?? 0) || 0,
      }),
    )
    const articles: SaleCatalogArticle[] = []

    const clients: SaleCatalogClient[] = []

    let openCashSession: SaleOpenCashSession | null = null
    if (cashResult && cashResult.success) {
      openCashSession = {
        sessionId: cashResult.ctx.sessionId,
        cashRegisterId: cashResult.ctx.cashRegisterId,
        registerName: cashResult.ctx.registerName,
        cashTreasuryAccountId: cashResult.ctx.cashTreasuryAccountId!,
      }
    }

    const treasuryPaymentContext =
      treasuryResult && treasuryResult.success ? treasuryResult.context : null

    const promotions = filterComboPromotionsForSale(
      allPromotions.filter(
        (p) => p.promotionType === "combo" && p.showInMenu,
      ),
    )
    const quantityDeals = allPromotions.filter(
      (p) => p.promotionType === "quantity_deal" && p.autoApply,
    )

    const categorySections: MenuCatalogCategorySection[] = [
      { id: "products", label: "Productos", categories },
    ]
    if (promotions.length > 0) {
      categorySections.unshift({
        id: "promotions",
        label: "Promociones",
        categories: [{ id: "all", name: "Promociones", sortOrder: 0 }],
      })
    }

    return {
      success: true,
      popName,
      categories,
      categorySections,
      articles,
      promotions,
      quantityDeals,
      clients,
      treasuryPaymentContext,
      canReadClients,
      canReadPaymentMethods,
      canCreateSale,
      canReadCashRegisters,
      openCashSession,
      invoiceTypeSiteId: DEFAULT_SALE_SITE_ID,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

async function requireSaleCatalogRead(popId: string) {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { ok: false as const, error: access.error || "Sin acceso" }
  }
  const snap = await loadPopPermissionsSnapshot(popId)
  const hasSaleRead = permissionKeysInclude(
    snap.keys,
    POP_PERMS.SALE_READ.resource,
    POP_PERMS.SALE_READ.action,
  )
  if (!hasSaleRead) {
    return {
      ok: false as const,
      error:
        "Necesitás permiso de lectura de ventas (sale:read) para usar esta pantalla.",
    }
  }
  return { ok: true as const }
}

function saleArticlesBaseQuery(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  visibleCategoryIds: string[],
) {
  let query = supabase
    .from("articles")
    .select(SALE_CATALOG_ARTICLE_SELECT)
    .eq("pop_id", popId)
    .eq("is_active", true)
    .eq("is_sellable", true)
    .eq("item_kind", "merchandise")
    .in("category_id", visibleCategoryIds)
    .order("name", { ascending: true })
    .order("id", { ascending: true })
  return query
}

export async function getSaleCatalogItemsPage(
  popId: string,
  filter: OperateCatalogItemsFilter,
  offset = 0,
): Promise<
  | { success: true; page: OperateCatalogItemsPage<SaleCatalogArticle> }
  | { success: false; error: string }
> {
  try {
    const gate = await requireSaleCatalogRead(popId)
    if (!gate.ok) return { success: false, error: gate.error }

    if (filter.section === "promotions" && !filter.search) {
      return { success: true, page: { items: [], nextOffset: null } }
    }

    const supabase = await createClient()
    const { data: catRows, error: catError } = await supabase
      .from("categories")
      .select("id")
      .eq("pop_id", popId)
      .eq("show_in_sale", true)
    if (catError) {
      return { success: false, error: catError.message }
    }
    const visibleCategoryIds = (catRows ?? []).map((row) => String(row.id))
    if (visibleCategoryIds.length === 0) {
      return { success: true, page: { items: [], nextOffset: null } }
    }

    const search = sanitizeCatalogIlike(filter.search)
    let query = saleArticlesBaseQuery(supabase, popId, visibleCategoryIds)
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,barcode.ilike.%${search}%`,
      )
    } else if (filter.section === "discounts") {
      query = query.not("discount_value", "is", null).gt("discount_value", 0)
    } else if (filter.categoryId) {
      query = query.eq("category_id", filter.categoryId)
    } else {
      return { success: true, page: { items: [], nextOffset: null } }
    }

    const from = Math.max(0, offset)
    const to = from + OPERATE_CATALOG_PAGE_SIZE
    const { data, error } = await query.range(from, to)
    if (error) {
      return { success: false, error: error.message }
    }

    const rows = (data ?? []) as Record<string, unknown>[]
    const hasMore = rows.length > OPERATE_CATALOG_PAGE_SIZE
    const pageRows = rows.slice(0, OPERATE_CATALOG_PAGE_SIZE)
    const overrides = await loadPriceListOverrideMap(
      supabase,
      popId,
      filter.priceListId,
      "article",
      pageRows.map((row) => String(row.id)),
    )
    const items = pageRows.map((row) =>
      mapSaleCatalogArticleRow(row, overrides.get(String(row.id))),
    )
    return {
      success: true,
      page: {
        items,
        nextOffset: hasMore ? from + OPERATE_CATALOG_PAGE_SIZE : null,
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

async function mapSaleArticlesWithPriceList(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  priceListId: string | undefined,
  rows: Record<string, unknown>[],
) {
  const overrides = await loadPriceListOverrideMap(
    supabase,
    popId,
    priceListId,
    "article",
    rows.map((row) => String(row.id)),
  )
  return rows.map((row) =>
    mapSaleCatalogArticleRow(row, overrides.get(String(row.id))),
  )
}

export async function getSaleCatalogArticlesByIds(
  popId: string,
  ids: string[],
  priceListId?: string,
): Promise<
  | { success: true; articles: SaleCatalogArticle[] }
  | { success: false; error: string }
> {
  try {
    const unique = [...new Set(ids.filter(Boolean))]
    if (unique.length === 0) return { success: true, articles: [] }
    const gate = await requireSaleCatalogRead(popId)
    if (!gate.ok) return { success: false, error: gate.error }
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("articles")
      .select(SALE_CATALOG_ARTICLE_SELECT)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .in("id", unique)
    if (error) return { success: false, error: error.message }
    const rows = (data ?? []) as Record<string, unknown>[]
    return {
      success: true,
      articles: await mapSaleArticlesWithPriceList(
        supabase,
        popId,
        priceListId,
        rows,
      ),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function findSaleCatalogArticleByScan(
  popId: string,
  rawQuery: string,
  priceListId?: string,
): Promise<
  | { success: true; article: SaleCatalogArticle | null }
  | { success: false; error: string }
> {
  try {
    const query = rawQuery.trim()
    if (!query) return { success: true, article: null }

    const gate = await requireSaleCatalogRead(popId)
    if (!gate.ok) return { success: false, error: gate.error }

    const supabase = await createClient()
    const { data: catRows, error: catError } = await supabase
      .from("categories")
      .select("id")
      .eq("pop_id", popId)
      .eq("show_in_sale", true)
    if (catError) {
      return { success: false, error: catError.message }
    }
    const visibleCategoryIds = (catRows ?? []).map((row) => String(row.id))
    if (visibleCategoryIds.length === 0) {
      return { success: true, article: null }
    }

    const base = saleArticlesBaseQuery(supabase, popId, visibleCategoryIds)
    const { data: barcodeRows, error: barcodeError } = await base
      .eq("barcode", query)
      .limit(2)
    if (barcodeError) {
      return { success: false, error: barcodeError.message }
    }
    if ((barcodeRows ?? []).length === 1) {
      const [article] = await mapSaleArticlesWithPriceList(
        supabase,
        popId,
        priceListId,
        [barcodeRows![0] as Record<string, unknown>],
      )
      return {
        success: true,
        article: article ?? null,
      }
    }
    if ((barcodeRows ?? []).length > 1) {
      return { success: true, article: null }
    }

    const { data: nameRows, error: nameError } = await saleArticlesBaseQuery(
      supabase,
      popId,
      visibleCategoryIds,
    )
      .ilike("name", query)
      .limit(2)
    if (nameError) {
      return { success: false, error: nameError.message }
    }
    if ((nameRows ?? []).length === 1) {
      const [article] = await mapSaleArticlesWithPriceList(
        supabase,
        popId,
        priceListId,
        [nameRows![0] as Record<string, unknown>],
      )
      return {
        success: true,
        article: article ?? null,
      }
    }
    return { success: true, article: null }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
