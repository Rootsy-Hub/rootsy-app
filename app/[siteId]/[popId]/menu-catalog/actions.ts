"use server"

import { DEFAULT_SALE_SITE_ID } from "@/lib/saleInvoiceTypes"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopById, validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { createClient } from "@/utils/supabase/server"
import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import {
  effectiveArticleSalePrice,
  isArticleDiscountMode,
} from "@/lib/articleDiscount"
import {
  isPromotionScheduleActiveNow,
  scheduleDateFromDb,
  scheduleDaysFromDb,
  scheduleTimeFromDb,
} from "@/lib/promotionSchedule"
import { promotionPricingSummary } from "@/lib/promotionTypes"
import type {
  SaleCatalogCategory,
  SaleCatalogClient,
  SaleOpenCashSession,
} from "@/app/[siteId]/[popId]/sale/actions"
import { loadPriceListOverrideMap } from "@/app/[siteId]/[popId]/articles/priceListActions"
import {
  mapSaleCatalogArticleRow,
  SALE_CATALOG_ARTICLE_SELECT,
} from "@/lib/saleCatalogArticleMap"
import {
  OPERATE_CATALOG_PAGE_SIZE,
  sanitizeCatalogIlike,
  type OperateCatalogItemsFilter,
} from "@/lib/operateCatalogPage"
import { resolveOpenCashSession } from "@/lib/cashRegisterSession"
import { getTreasuryPaymentContext } from "@/lib/treasuryPaymentContext"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"

export type MenuCatalogRecipe = {
  id: string
  name: string
  description: string
  salePrice: number
  iva: number
  categoryId: string
  categoryName: string
  imageUrl: string | null
}

export type MenuCatalogArticle = {
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

export type MenuCatalogCategorySection = {
  id: "recipes" | "products" | "promotions"
  label: string
  categories: SaleCatalogCategory[]
}

export type MenuCatalogPromotionOption = {
  kind: "article" | "recipe"
  refId: string
  name: string
  salePrice: number
  iva: number
}

export type MenuCatalogPromotionSlot = {
  id: string
  label: string
  quantity: number
  options: MenuCatalogPromotionOption[]
}

export type MenuCatalogPromotion = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  promotionType: "combo" | "quantity_deal"
  pricingMode: "fixed_total" | "percent_off" | "fixed_off"
  fixedPrice: number | null
  discountMode: "porcentaje" | "fijo" | null
  discountValue: number | null
  buyQuantity: number | null
  benefitQuantity: number | null
  benefitDiscountPct: number | null
  applyBenefitTo: "cheapest" | "most_expensive" | null
  autoApply: boolean
  showInMenu: boolean
  slots: MenuCatalogPromotionSlot[]
  pricingLabel: string
}

export async function loadMenuPromotions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<MenuCatalogPromotion[]> {
  const { data: promoRows, error } = await supabase
    .from("promotions")
    .select(
      `
      id,
      name,
      description,
      image_url,
      promotion_type,
      pricing_mode,
      fixed_price,
      discount_mode,
      discount_value,
      buy_quantity,
      benefit_quantity,
      benefit_discount_pct,
      apply_benefit_to,
      auto_apply,
      show_in_menu,
      is_active,
      valid_from,
      valid_until,
      valid_time_start,
      valid_time_end,
      schedule_days
    `,
    )
    .eq("pop_id", popId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error || !promoRows?.length) return []

  const now = new Date()
  const activePromos = promoRows.filter((row) =>
    isPromotionScheduleActiveNow(
      {
        validFrom: scheduleDateFromDb(row.valid_from),
        validUntil: scheduleDateFromDb(row.valid_until),
        validTimeStart: scheduleTimeFromDb(row.valid_time_start),
        validTimeEnd: scheduleTimeFromDb(row.valid_time_end),
        scheduleDays: scheduleDaysFromDb(row.schedule_days),
      },
      now,
    ),
  )

  if (activePromos.length === 0) return []

  const promoIds = activePromos.map((r) => String(r.id))
  const { data: slotRows } = await supabase
    .from("promotion_slots")
    .select("id, promotion_id, label, quantity, sort_order")
    .eq("pop_id", popId)
    .in("promotion_id", promoIds)
    .order("sort_order", { ascending: true })

  const slotIds = (slotRows ?? []).map((s) => String(s.id))
  const { data: optRows } =
    slotIds.length > 0
      ? await supabase
          .from("promotion_slot_options")
          .select("id, promotion_slot_id, article_id, recipe_id, sort_order")
          .eq("pop_id", popId)
          .in("promotion_slot_id", slotIds)
          .order("sort_order", { ascending: true })
      : { data: [] as Record<string, unknown>[] }

  const articleIds = (optRows ?? [])
    .filter((r) => r.article_id)
    .map((r) => String(r.article_id))
  const recipeIds = (optRows ?? [])
    .filter((r) => r.recipe_id)
    .map((r) => String(r.recipe_id))

  const articleMeta = new Map<
    string,
    { name: string; salePrice: number; iva: number }
  >()
  if (articleIds.length > 0) {
    const { data } = await supabase
      .from("articles")
      .select("id, name, sale_price, iva, discount_mode, discount_value")
      .eq("pop_id", popId)
      .in("id", articleIds)
    for (const r of data ?? []) {
      const listPrice = Number(r.sale_price ?? 0) || 0
      const rawDiscountMode = r.discount_mode
      const discountMode =
        typeof rawDiscountMode === "string" &&
        isArticleDiscountMode(rawDiscountMode)
          ? rawDiscountMode
          : null
      const discountRaw = r.discount_value
      const discountValue =
        discountRaw != null && Number.isFinite(Number(discountRaw))
          ? Number(discountRaw)
          : null
      articleMeta.set(String(r.id), {
        name: String(r.name ?? ""),
        salePrice: effectiveArticleSalePrice(
          listPrice,
          discountMode,
          discountValue,
        ),
        iva: Number(r.iva ?? 0) || 0,
      })
    }
  }

  const recipeMeta = new Map<
    string,
    { name: string; salePrice: number; iva: number }
  >()
  if (recipeIds.length > 0) {
    const { data } = await supabase
      .from("recipes")
      .select("id, name, sale_price, iva")
      .eq("pop_id", popId)
      .in("id", recipeIds)
    for (const r of data ?? []) {
      recipeMeta.set(String(r.id), {
        name: String(r.name ?? ""),
        salePrice: Number(r.sale_price ?? 0) || 0,
        iva: Number(r.iva ?? 0) || 0,
      })
    }
  }

  const optsBySlot = new Map<string, MenuCatalogPromotionOption[]>()
  for (const row of optRows ?? []) {
    const slotId = String(row.promotion_slot_id)
    const list = optsBySlot.get(slotId) ?? []
    if (row.article_id) {
      const id = String(row.article_id)
      const meta = articleMeta.get(id)
      if (meta) {
        list.push({
          kind: "article",
          refId: id,
          name: meta.name,
          salePrice: meta.salePrice,
          iva: meta.iva,
        })
      }
    } else if (row.recipe_id) {
      const id = String(row.recipe_id)
      const meta = recipeMeta.get(id)
      if (meta) {
        list.push({
          kind: "recipe",
          refId: id,
          name: meta.name,
          salePrice: meta.salePrice,
          iva: meta.iva,
        })
      }
    }
    optsBySlot.set(slotId, list)
  }

  const slotsByPromo = new Map<string, MenuCatalogPromotionSlot[]>()
  for (const slot of slotRows ?? []) {
    const promoId = String(slot.promotion_id)
    const list = slotsByPromo.get(promoId) ?? []
    list.push({
      id: String(slot.id),
      label: String(slot.label ?? ""),
      quantity: Number(slot.quantity ?? 1) || 1,
      options: optsBySlot.get(String(slot.id)) ?? [],
    })
    slotsByPromo.set(promoId, list)
  }

  const result: MenuCatalogPromotion[] = []
  for (const row of activePromos) {
    const promotionType =
      String(row.promotion_type) === "quantity_deal" ? "quantity_deal" : "combo"
    const showInMenu = Boolean(row.show_in_menu)
    const autoApply = Boolean(row.auto_apply)
    if (promotionType === "combo" && !showInMenu) continue
    if (promotionType === "quantity_deal" && !autoApply && !showInMenu) continue

    const slots = slotsByPromo.get(String(row.id)) ?? []
    if (slots.every((s) => s.options.length === 0)) continue

    const applyRaw = row.apply_benefit_to
    const applyBenefitTo =
      applyRaw === "cheapest" || applyRaw === "most_expensive"
        ? applyRaw
        : null
    const pricingMode =
      String(row.pricing_mode) === "percent_off"
        ? "percent_off"
        : String(row.pricing_mode) === "fixed_off"
          ? "fixed_off"
          : "fixed_total"

    result.push({
      id: String(row.id),
      name: String(row.name ?? ""),
      description: String(row.description ?? ""),
      imageUrl:
        typeof row.image_url === "string" && row.image_url.trim()
          ? row.image_url.trim()
          : null,
      promotionType,
      pricingMode,
      fixedPrice:
        row.fixed_price != null ? Number(row.fixed_price) || 0 : null,
      discountMode:
        row.discount_mode === "porcentaje" || row.discount_mode === "fijo"
          ? row.discount_mode
          : null,
      discountValue:
        row.discount_value != null ? Number(row.discount_value) : null,
      buyQuantity:
        row.buy_quantity != null ? Number(row.buy_quantity) : null,
      benefitQuantity:
        row.benefit_quantity != null ? Number(row.benefit_quantity) : null,
      benefitDiscountPct:
        row.benefit_discount_pct != null
          ? Number(row.benefit_discount_pct)
          : null,
      applyBenefitTo,
      autoApply,
      showInMenu,
      slots,
      pricingLabel: promotionPricingSummary({
        promotionType,
        pricingMode,
        fixedPrice:
          row.fixed_price != null ? Number(row.fixed_price) || 0 : null,
        discountMode:
          row.discount_mode === "porcentaje" || row.discount_mode === "fijo"
            ? row.discount_mode
            : null,
        discountValue:
          row.discount_value != null ? Number(row.discount_value) : null,
        buyQuantity:
          row.buy_quantity != null ? Number(row.buy_quantity) : null,
        benefitQuantity:
          row.benefit_quantity != null ? Number(row.benefit_quantity) : null,
        benefitDiscountPct:
          row.benefit_discount_pct != null
            ? Number(row.benefit_discount_pct)
            : null,
        applyBenefitTo,
      }),
    })
  }

  return result
}

export async function getMenuCatalog(
  popId: string,
  options?: { items?: "all" | "none" },
): Promise<
  | {
      success: true
      popName: string
      categorySections: MenuCatalogCategorySection[]
      recipes: MenuCatalogRecipe[]
      articles: MenuCatalogArticle[]
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
    const canReadMenu =
      permissionKeysInclude(
        snap.keys,
        POP_PERMS.MESAS_READ.resource,
        POP_PERMS.MESAS_READ.action,
      ) ||
      permissionKeysInclude(
        snap.keys,
        POP_PERMS.MOSTRADOR_READ.resource,
        POP_PERMS.MOSTRADOR_READ.action,
      ) ||
      permissionKeysInclude(
        snap.keys,
        POP_PERMS.SALE_READ.resource,
        POP_PERMS.SALE_READ.action,
      ) ||
      permissionKeysInclude(
        snap.keys,
        POP_PERMS.RECIPE_READ.resource,
        POP_PERMS.RECIPE_READ.action,
      )

    if (!canReadMenu) {
      return {
        success: false,
        error:
          "Sin permiso para ver el menú de Mesas o Mostrador.",
      }
    }

    const canReadClients = permissionKeysInclude(
      snap.keys,
      POP_PERMS.SALE_READ.resource,
      POP_PERMS.SALE_READ.action,
    )
    const canReadPaymentMethods = canReadClients
    const canReadCashRegisters = canReadClients
    const canCreateSale = permissionKeysInclude(
      snap.keys,
      POP_PERMS.SALE_CREATE.resource,
      POP_PERMS.SALE_CREATE.action,
    )

    const loadItems = options?.items !== "none"
    const supabase = await createClient()
    const emptyRows = { data: [] as never[], error: null }
    const [
      popRes,
      userResult,
      recipeCatResult,
      recipeResult,
      productCatResult,
      artResult,
      allPromotions,
    ] = await Promise.all([
      getPopById(popId),
      supabase.auth.getUser(),
      supabase
        .from("recipe_categories")
        .select("id, name, sort_order")
        .eq("pop_id", popId)
        .eq("is_active", true)
        .eq("show_in_menu", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      loadItems
        ? supabase
            .from("recipes")
            .select(
              `
        id,
        name,
        description,
        sale_price,
        iva,
        image_url,
        category_id,
        recipe_categories ( id, name )
      `,
            )
            .eq("pop_id", popId)
            .eq("is_active", true)
            .order("name", { ascending: true })
        : Promise.resolve(emptyRows),
      supabase
        .from("categories")
        .select("id, name, sort_order")
        .eq("pop_id", popId)
        .eq("show_in_menu", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      loadItems
        ? supabase
            .from("articles")
            .select(SALE_CATALOG_ARTICLE_SELECT)
            .eq("pop_id", popId)
            .eq("is_active", true)
            .eq("is_sellable", true)
            .eq("item_kind", "merchandise")
            .order("name", { ascending: true })
        : Promise.resolve(emptyRows),
      loadMenuPromotions(supabase, popId),
    ])

    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""
    const user = userResult.data.user

    if (recipeCatResult.error) {
      return { success: false, error: recipeCatResult.error.message }
    }
    if (recipeResult.error) {
      return { success: false, error: recipeResult.error.message }
    }
    if (productCatResult.error) {
      return { success: false, error: productCatResult.error.message }
    }
    if (artResult.error) {
      return { success: false, error: artResult.error.message }
    }

    const recipeCatRows = recipeCatResult.data
    const recipeRows = recipeResult.data
    const productCatRows = productCatResult.data
    const artRows = artResult.data

    const recipeCategories: SaleCatalogCategory[] = (recipeCatRows ?? []).map(
      (c) => ({
        id: String(c.id),
        name: String(c.name ?? ""),
        sortOrder: Number(c.sort_order ?? 0) || 0,
      }),
    )
    const visibleRecipeCategoryIds = new Set(recipeCategories.map((c) => c.id))


    const recipes: MenuCatalogRecipe[] = (recipeRows ?? [])
      .filter((row) => {
        const categoryId = String(row.category_id ?? "")
        return categoryId !== "" && visibleRecipeCategoryIds.has(categoryId)
      })
      .map((row) => {
        const cat = row.recipe_categories as { name?: string } | null
        const rawImg = row.image_url
        return {
          id: String(row.id),
          name: String(row.name ?? ""),
          description: String(row.description ?? ""),
          salePrice: Number(row.sale_price ?? 0) || 0,
          iva: Number(row.iva ?? 0) || 0,
          categoryId: String(row.category_id ?? ""),
          categoryName: cat?.name ? String(cat.name) : "—",
          imageUrl:
            typeof rawImg === "string" && rawImg.trim() !== ""
              ? rawImg.trim()
              : null,
        }
      })

    const productCategories: SaleCatalogCategory[] = (productCatRows ?? []).map(
      (c) => ({
        id: String(c.id),
        name: String(c.name ?? ""),
        sortOrder: Number(c.sort_order ?? 0) || 0,
      }),
    )
    const visibleProductCategoryIds = new Set(productCategories.map((c) => c.id))

    const articles: MenuCatalogArticle[] = (artRows ?? [])
      .filter((row) => {
        const categoryId = String(row.category_id ?? "")
        return categoryId !== "" && visibleProductCategoryIds.has(categoryId)
      })
      .map((row) => mapSaleCatalogArticleRow(row as Record<string, unknown>))

    const categorySections: MenuCatalogCategorySection[] = [
      { id: "recipes", label: "Recetas", categories: recipeCategories },
      { id: "products", label: "Productos", categories: productCategories },
    ]

    const promotions = allPromotions.filter(
      (p) => p.promotionType === "combo" && p.showInMenu,
    )
    const quantityDeals = allPromotions.filter(
      (p) => p.promotionType === "quantity_deal" && p.autoApply,
    )
    if (promotions.length > 0) {
      categorySections.unshift({
        id: "promotions",
        label: "Promociones",
        categories: [{ id: "all", name: "Promociones", sortOrder: 0 }],
      })
    }

    const clients: SaleCatalogClient[] = []

    const [cashRes, treasuryRes] = await Promise.all([
      canReadCashRegisters
        ? resolveOpenCashSession(supabase, popId, user?.id)
        : Promise.resolve(null),
      canReadPaymentMethods
        ? getTreasuryPaymentContext(popId)
        : Promise.resolve(null),
    ])

    const openCashSession: SaleOpenCashSession | null =
      cashRes && cashRes.success
        ? {
            sessionId: cashRes.ctx.sessionId,
            cashRegisterId: cashRes.ctx.cashRegisterId,
            registerName: cashRes.ctx.registerName,
            cashTreasuryAccountId: cashRes.ctx.cashTreasuryAccountId!,
          }
        : null

    if (treasuryRes && !treasuryRes.success) {
      return { success: false, error: treasuryRes.error }
    }
    const treasuryPaymentContext: TreasuryPaymentContext | null =
      treasuryRes && treasuryRes.success ? treasuryRes.context : null

    return {
      success: true,
      popName,
      categorySections,
      recipes,
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

const MENU_RECIPE_SELECT = `
  id,
  name,
  description,
  sale_price,
  iva,
  image_url,
  category_id,
  recipe_categories ( id, name )
` as const

function mapMenuRecipeRow(
  row: Record<string, unknown>,
  listPriceOverride?: number,
): MenuCatalogRecipe {
  const cat = row.recipe_categories as { name?: string } | null
  const rawImg = row.image_url
  const principal = Number(row.sale_price ?? 0) || 0
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    salePrice:
      listPriceOverride != null && Number.isFinite(listPriceOverride)
        ? listPriceOverride
        : principal,
    iva: Number(row.iva ?? 0) || 0,
    categoryId: String(row.category_id ?? ""),
    categoryName: cat?.name ? String(cat.name) : "—",
    imageUrl:
      typeof rawImg === "string" && rawImg.trim() !== "" ? rawImg.trim() : null,
  }
}

async function requireMenuCatalogRead(popId: string) {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { ok: false as const, error: access.error || "Sin acceso" }
  }
  const snap = await loadPopPermissionsSnapshot(popId)
  const canReadMenu =
    permissionKeysInclude(
      snap.keys,
      POP_PERMS.MESAS_READ.resource,
      POP_PERMS.MESAS_READ.action,
    ) ||
    permissionKeysInclude(
      snap.keys,
      POP_PERMS.MOSTRADOR_READ.resource,
      POP_PERMS.MOSTRADOR_READ.action,
    ) ||
    permissionKeysInclude(
      snap.keys,
      POP_PERMS.SALE_READ.resource,
      POP_PERMS.SALE_READ.action,
    ) ||
    permissionKeysInclude(
      snap.keys,
      POP_PERMS.RECIPE_READ.resource,
      POP_PERMS.RECIPE_READ.action,
    )
  if (!canReadMenu) {
    return {
      ok: false as const,
      error: "Sin permiso para ver el menú de Mesas o Mostrador.",
    }
  }
  return { ok: true as const }
}

export type MenuCatalogItemsPage = {
  articles: MenuCatalogArticle[]
  recipes: MenuCatalogRecipe[]
  nextOffset: number | null
}

export async function getMenuCatalogItemsPage(
  popId: string,
  filter: OperateCatalogItemsFilter,
  offset = 0,
): Promise<
  | { success: true; page: MenuCatalogItemsPage }
  | { success: false; error: string }
> {
  try {
    const gate = await requireMenuCatalogRead(popId)
    if (!gate.ok) return { success: false, error: gate.error }

    if (filter.section === "promotions" && !filter.search) {
      return {
        success: true,
        page: { articles: [], recipes: [], nextOffset: null },
      }
    }

    const supabase = await createClient()
    const search = sanitizeCatalogIlike(filter.search)
    const from = Math.max(0, offset)
    const to = from + OPERATE_CATALOG_PAGE_SIZE
    const wantArticles =
      filter.section === "products" ||
      filter.section === "all" ||
      filter.section === "discounts" ||
      Boolean(search)
    const wantRecipes =
      filter.section === "recipes" ||
      filter.section === "all" ||
      Boolean(search)

    const [productCatResult, recipeCatResult] = await Promise.all([
      wantArticles
        ? supabase
            .from("categories")
            .select("id")
            .eq("pop_id", popId)
            .eq("show_in_menu", true)
        : Promise.resolve({ data: [] as { id: string }[], error: null }),
      wantRecipes
        ? supabase
            .from("recipe_categories")
            .select("id")
            .eq("pop_id", popId)
            .eq("is_active", true)
            .eq("show_in_menu", true)
        : Promise.resolve({ data: [] as { id: string }[], error: null }),
    ])
    if (productCatResult.error) {
      return { success: false, error: productCatResult.error.message }
    }
    if (recipeCatResult.error) {
      return { success: false, error: recipeCatResult.error.message }
    }

    const visibleProductIds = (productCatResult.data ?? []).map((row) =>
      String(row.id),
    )
    const visibleRecipeIds = (recipeCatResult.data ?? []).map((row) =>
      String(row.id),
    )

    let articleHasMore = false
    let recipeHasMore = false
    let articles: MenuCatalogArticle[] = []
    let recipes: MenuCatalogRecipe[] = []

    if (wantArticles && visibleProductIds.length > 0) {
      let query = supabase
        .from("articles")
        .select(SALE_CATALOG_ARTICLE_SELECT)
        .eq("pop_id", popId)
        .eq("is_active", true)
        .eq("is_sellable", true)
        .eq("item_kind", "merchandise")
        .in("category_id", visibleProductIds)
        .order("name", { ascending: true })
        .order("id", { ascending: true })
      if (search) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%,barcode.ilike.%${search}%`,
        )
      } else if (filter.section === "discounts") {
        query = query.not("discount_value", "is", null).gt("discount_value", 0)
      } else if (filter.categoryId) {
        query = query.eq("category_id", filter.categoryId)
      }
      const { data, error } = await query.range(from, to)
      if (error) return { success: false, error: error.message }
      const rows = (data ?? []) as Record<string, unknown>[]
      articleHasMore = rows.length > OPERATE_CATALOG_PAGE_SIZE
      const pageRows = rows.slice(0, OPERATE_CATALOG_PAGE_SIZE)
      const overrides = await loadPriceListOverrideMap(
        supabase,
        popId,
        filter.priceListId,
        "article",
        pageRows.map((row) => String(row.id)),
      )
      articles = pageRows.map((row) =>
        mapSaleCatalogArticleRow(row, overrides.get(String(row.id))),
      )
    }

    if (wantRecipes && visibleRecipeIds.length > 0) {
      let query = supabase
        .from("recipes")
        .select(MENU_RECIPE_SELECT)
        .eq("pop_id", popId)
        .eq("is_active", true)
        .in("category_id", visibleRecipeIds)
        .order("name", { ascending: true })
        .order("id", { ascending: true })
      if (search) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%`,
        )
      } else if (filter.categoryId && filter.section === "recipes") {
        query = query.eq("category_id", filter.categoryId)
      }
      const { data, error } = await query.range(from, to)
      if (error) return { success: false, error: error.message }
      const rows = (data ?? []) as Record<string, unknown>[]
      recipeHasMore = rows.length > OPERATE_CATALOG_PAGE_SIZE
      const pageRows = rows.slice(0, OPERATE_CATALOG_PAGE_SIZE)
      const overrides = await loadPriceListOverrideMap(
        supabase,
        popId,
        filter.priceListId,
        "recipe",
        pageRows.map((row) => String(row.id)),
      )
      recipes = pageRows.map((row) =>
        mapMenuRecipeRow(row, overrides.get(String(row.id))),
      )
    }

    return {
      success: true,
      page: {
        articles,
        recipes,
        nextOffset:
          articleHasMore || recipeHasMore
            ? from + OPERATE_CATALOG_PAGE_SIZE
            : null,
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getMenuCatalogItemsByIds(
  popId: string,
  articleIds: string[],
  recipeIds: string[],
): Promise<
  | {
      success: true
      articles: MenuCatalogArticle[]
      recipes: MenuCatalogRecipe[]
    }
  | { success: false; error: string }
> {
  try {
    const gate = await requireMenuCatalogRead(popId)
    if (!gate.ok) return { success: false, error: gate.error }
    const supabase = await createClient()
    const uniqueArticles = [...new Set(articleIds.filter(Boolean))]
    const uniqueRecipes = [...new Set(recipeIds.filter(Boolean))]
    const [artRes, recipeRes] = await Promise.all([
      uniqueArticles.length > 0
        ? supabase
            .from("articles")
            .select(SALE_CATALOG_ARTICLE_SELECT)
            .eq("pop_id", popId)
            .in("id", uniqueArticles)
        : Promise.resolve({ data: [], error: null }),
      uniqueRecipes.length > 0
        ? supabase
            .from("recipes")
            .select(MENU_RECIPE_SELECT)
            .eq("pop_id", popId)
            .in("id", uniqueRecipes)
        : Promise.resolve({ data: [], error: null }),
    ])
    if (artRes.error) return { success: false, error: artRes.error.message }
    if (recipeRes.error) return { success: false, error: recipeRes.error.message }
    return {
      success: true,
      articles: ((artRes.data ?? []) as Record<string, unknown>[]).map(
        mapSaleCatalogArticleRow,
      ),
      recipes: ((recipeRes.data ?? []) as Record<string, unknown>[]).map(
        mapMenuRecipeRow,
      ),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function findMenuCatalogItemByScan(
  popId: string,
  rawQuery: string,
): Promise<
  | {
      success: true
      article: MenuCatalogArticle | null
      recipe: MenuCatalogRecipe | null
    }
  | { success: false; error: string }
> {
  try {
    const query = rawQuery.trim()
    if (!query) {
      return { success: true, article: null, recipe: null }
    }
    const gate = await requireMenuCatalogRead(popId)
    if (!gate.ok) return { success: false, error: gate.error }

    const supabase = await createClient()
    const { data: barcodeRows, error: barcodeError } = await supabase
      .from("articles")
      .select(SALE_CATALOG_ARTICLE_SELECT)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .eq("is_sellable", true)
      .eq("item_kind", "merchandise")
      .eq("barcode", query)
      .limit(2)
    if (barcodeError) {
      return { success: false, error: barcodeError.message }
    }
    if ((barcodeRows ?? []).length === 1) {
      return {
        success: true,
        article: mapSaleCatalogArticleRow(
          barcodeRows![0] as Record<string, unknown>,
        ),
        recipe: null,
      }
    }
    if ((barcodeRows ?? []).length > 1) {
      return { success: true, article: null, recipe: null }
    }

    const { data: articleNameRows, error: articleNameError } = await supabase
      .from("articles")
      .select(SALE_CATALOG_ARTICLE_SELECT)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .eq("is_sellable", true)
      .eq("item_kind", "merchandise")
      .ilike("name", query)
      .limit(2)
    if (articleNameError) {
      return { success: false, error: articleNameError.message }
    }
    if ((articleNameRows ?? []).length === 1) {
      return {
        success: true,
        article: mapSaleCatalogArticleRow(
          articleNameRows![0] as Record<string, unknown>,
        ),
        recipe: null,
      }
    }

    const { data: recipeNameRows, error: recipeNameError } = await supabase
      .from("recipes")
      .select(MENU_RECIPE_SELECT)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .ilike("name", query)
      .limit(2)
    if (recipeNameError) {
      return { success: false, error: recipeNameError.message }
    }
    if ((recipeNameRows ?? []).length === 1) {
      return {
        success: true,
        article: null,
        recipe: mapMenuRecipeRow(recipeNameRows![0] as Record<string, unknown>),
      }
    }
    return { success: true, article: null, recipe: null }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
