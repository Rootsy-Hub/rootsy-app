"use server"

import { createInitialStockLedgerForArticle } from "@/app/[siteId]/[popId]/inventory/actions"
import { articleDeleteConfirmPhrase } from "@/app/[siteId]/[popId]/articles/articleConstants"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import {
  getPopById,
  getPopSiteId,
  validatePopAccess,
} from "@/lib/popHelpers"
import { popMenuHref } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { resolveWorkspaceTableListOrder } from "@/lib/workspaceTableSort"
import { isAllowedArticleIvaRate } from "@/lib/articleIva"
import {
  ARTICLE_IMAGE_STORAGE_BUCKET,
  buildArticleImageFileName,
  buildArticleImageStoragePath,
} from "@/lib/articleImageStorage"
import type { ArticleItemKind } from "@/lib/articleItemKind"
import {
  ARTICLE_ITEM_KINDS,
  defaultIsSellableForKind,
  isArticleItemKind,
  isValidStoredUnitOfMeasure,
  normalizeStoredUnitOfMeasure,
} from "@/lib/articleItemKind"
import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import type { ArticleCostLineInput } from "@/lib/articleCosts"
import { primarySaleUnitCostFromCosts } from "@/lib/articleCosts"
import { activeCostCountByArticleIds } from "@/lib/articleCostQueries"
import {
  normalizeArticleBarcode,
  normalizeArticleSku,
  validateArticleBarcodeInput,
} from "@/lib/articleIdentifiers"
import { syncArticleCosts } from "@/app/[siteId]/[popId]/articles/articleCostsActions"
import {
  ARTICLE_TABLE_PAGE_SIZES,
  DEFAULT_ARTICLE_TABLE_PAGE_SIZE,
} from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import { isArticleDiscountMode } from "@/lib/articleDiscount"
import { createClient } from "@/utils/supabase/server"

export type ArticleTableRow = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  brand: string
  sku: string | null
  barcode: string | null
  itemKind: ArticleItemKind
  unitOfMeasure: string
  isSellable: boolean
  defaultWastePct: number | null
  minStockLevel: number | null
  salePrice: number
  iva: number
  discountMode: ArticleDiscountMode | null
  discountValue: number | null
  categoryId: string
  categoryName: string
  isActive: boolean
  allowNegativeStock: boolean
  stockOnHand: number
  activeCostCount: number
}

export type ArticleSupplierOption = {
  id: string
  name: string
}

export type ArticleCategoryOption = {
  id: string
  name: string
  itemKind: ArticleItemKind
  sortOrder: number
  showInSale: boolean
}

export type CategoryLayoutUpdate = {
  id: string
  sortOrder: number
  showInSale: boolean
}

export type ArticleItemFieldsInput = {
  itemKind: ArticleItemKind
  unitOfMeasure: string
  isSellable: boolean
  defaultWastePct: number | null
  minStockLevel: number | null
}

export type UpdatePopArticleInput = {
  name: string
  description: string
  imageUrl: string
  brand: string
  sku: string
  barcode: string
  salePrice: number
  iva: number
  categoryId: string
  isActive: boolean
  discountMode: ArticleDiscountMode | null
  discountValue: number | null
  allowNegativeStock: boolean
  costs?: ArticleCostLineInput[]
} & ArticleItemFieldsInput

export type CreatePopArticleInput = UpdatePopArticleInput & {
  siteId?: string
  initialStockQuantity?: number | null
  costs?: ArticleCostLineInput[]
}

function parseOptionalPct(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0 || n > 100) return null
  return Math.round(n * 100) / 100
}

function parseOptionalQty(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

function validateArticleKindFields(
  input: ArticleItemFieldsInput,
): { ok: true } | { ok: false; error: string } {
  if (!isArticleItemKind(input.itemKind)) {
    return { ok: false, error: "Tipo de ítem inválido." }
  }
  if (!isValidStoredUnitOfMeasure(input.unitOfMeasure)) {
    return { ok: false, error: "Unidad de medida inválida." }
  }
  return { ok: true }
}

function parseStockQty(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 1e6) / 1e6
}

async function stockOnHandByArticleIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  articleIds: string[],
): Promise<Map<string, number>> {
  const out = new Map<string, number>()
  if (articleIds.length === 0) return out

  const { data, error } = await supabase
    .from("inventory_movements")
    .select("article_id, quantity_delta")
    .eq("pop_id", popId)
    .in("article_id", articleIds)

  if (error) return out

  for (const row of data ?? []) {
    const id = String(row.article_id)
    out.set(id, (out.get(id) ?? 0) + parseStockQty(row.quantity_delta))
  }

  for (const [id, qty] of out) {
    out.set(id, Math.round(qty * 1e6) / 1e6)
  }

  return out
}

function articleRowFromDb(row: Record<string, unknown>): ArticleTableRow {
  const cat = row.categories as unknown as { name?: string } | null
  const rawImg = row.image_url
  const imageUrl =
    typeof rawImg === "string" && rawImg.trim() !== "" ? rawImg.trim() : null
  const rawKind = String(row.item_kind ?? "merchandise")
  const itemKind = isArticleItemKind(rawKind) ? rawKind : "merchandise"
  const rawUom = String(row.unit_of_measure ?? "unidad")
  const unitOfMeasure = normalizeStoredUnitOfMeasure(rawUom)
  const wasteRaw = row.default_waste_pct
  const minRaw = row.min_stock_level
  const rawDiscountMode = row.discount_mode
  const discountMode =
    typeof rawDiscountMode === "string" && isArticleDiscountMode(rawDiscountMode)
      ? rawDiscountMode
      : null
  const discountRaw = row.discount_value
  const discountValue =
    discountRaw != null && Number.isFinite(Number(discountRaw))
      ? Number(discountRaw)
      : null
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    imageUrl,
    brand: String(row.brand ?? ""),
    sku: row.sku != null && String(row.sku).trim() ? String(row.sku).trim() : null,
    barcode:
      row.barcode != null && String(row.barcode).trim()
        ? String(row.barcode).trim()
        : null,
    itemKind,
    unitOfMeasure,
    isSellable: Boolean(row.is_sellable),
    defaultWastePct:
      wasteRaw != null && Number.isFinite(Number(wasteRaw))
        ? Number(wasteRaw)
        : null,
    minStockLevel:
      minRaw != null && Number.isFinite(Number(minRaw)) ? Number(minRaw) : null,
    salePrice: Number(row.sale_price ?? 0) || 0,
    iva: Number(row.iva ?? 0) || 0,
    discountMode,
    discountValue,
    categoryId: String(row.category_id ?? ""),
    categoryName: cat?.name ? String(cat.name) : "—",
    isActive: Boolean(row.is_active),
    allowNegativeStock: Boolean(row.allow_negative_stock),
    stockOnHand: 0,
    activeCostCount: 0,
  }
}

function articleDbPayloadFromInput(input: UpdatePopArticleInput) {
  const isSellable = defaultIsSellableForKind(input.itemKind)
  return {
    item_kind: input.itemKind,
    unit_of_measure: input.unitOfMeasure.trim(),
    is_sellable: isSellable,
    default_waste_pct: input.defaultWastePct,
    min_stock_level: input.minStockLevel,
    track_stock: true,
    brand: input.brand.trim(),
    sku: normalizeArticleSku(input.sku),
    barcode:
      input.itemKind === "merchandise"
        ? normalizeArticleBarcode(input.barcode)
        : null,
    discount_mode: input.discountMode,
    discount_value: input.discountValue,
    allow_negative_stock:
      input.itemKind === "merchandise" ? input.allowNegativeStock : false,
  }
}

function normalizeIdentifierFields(
  input: UpdatePopArticleInput,
): { ok: true; sku: string | null; barcode: string | null } | { ok: false; error: string } {
  const sku = normalizeArticleSku(input.sku)
  if (input.itemKind !== "merchandise") {
    return { ok: true, sku, barcode: null }
  }
  const barcodeRes = validateArticleBarcodeInput(input.barcode)
  if (!barcodeRes.ok) return barcodeRes
  return { ok: true, sku, barcode: barcodeRes.value }
}

function normalizeCatalogFields(
  input: UpdatePopArticleInput,
):
  | {
      ok: true
      fields: Pick<
        UpdatePopArticleInput,
        "brand" | "discountMode" | "discountValue"
      >
    }
  | { ok: false; error: string } {
  const brand = input.brand.trim()

  if (input.itemKind !== "merchandise") {
    return {
      ok: true,
      fields: {
        brand,
        discountMode: null,
        discountValue: null,
      },
    }
  }

  let discountMode = input.discountMode
  let discountValue = input.discountValue
  if (discountMode && (discountValue == null || discountValue <= 0)) {
    return { ok: false, error: "Indicá el monto o porcentaje del descuento." }
  }
  if (!discountMode || discountValue == null || discountValue <= 0) {
    discountMode = null
    discountValue = null
  } else if (discountMode === "porcentaje" && discountValue > 100) {
    return { ok: false, error: "El descuento porcentual no puede superar 100 %." }
  }

  return {
    ok: true,
    fields: { brand, discountMode, discountValue },
  }
}

export async function getPopArticleSupplierOptions(popId: string): Promise<
  | { success: true; suppliers: ArticleSupplierOption[] }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.ARTICLE_READ.resource,
        POP_PERMS.ARTICLE_READ.action,
      )
    ) {
      return {
        success: false,
        error: "Sin permiso para ver proveedores en este punto de venta.",
      }
    }
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("suppliers")
      .select("id, name")
      .eq("pop_id", popId)
      .eq("is_active", true)
      .order("name", { ascending: true })
    if (error) {
      return { success: false, error: error.message }
    }
    return {
      success: true,
      suppliers: (data ?? []).map((r) => ({
        id: String(r.id),
        name: String(r.name ?? ""),
      })),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getPopArticleCategories(
  popId: string,
  itemKind?: ArticleItemKind,
): Promise<
  | { success: true; categories: ArticleCategoryOption[] }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.ARTICLE_READ.resource,
        POP_PERMS.ARTICLE_READ.action,
      )
    ) {
      return {
        success: false,
        error: "Sin permiso para ver categorías en este punto de venta.",
      }
    }
    const supabase = await createClient()
    let q = supabase
      .from("categories")
      .select("id, name, item_kind, sort_order, show_in_sale")
      .eq("pop_id", popId)
      .order("show_in_sale", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
    if (itemKind) {
      q = q.eq("item_kind", itemKind)
    }
    const { data, error } = await q
    if (error) {
      return { success: false, error: error.message }
    }
    const categories: ArticleCategoryOption[] = (data || []).map((c) => {
      const rawKind = String(c.item_kind ?? "merchandise")
      return {
        id: String(c.id),
        name: String(c.name ?? ""),
        itemKind: isArticleItemKind(rawKind) ? rawKind : "merchandise",
        sortOrder: Number(c.sort_order ?? 0) || 0,
        showInSale: c.show_in_sale !== false,
      }
    })
    return { success: true, categories }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function updatePopArticle(
  popId: string,
  articleId: string,
  input: UpdatePopArticleInput,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.ARTICLE_UPDATE.resource,
        POP_PERMS.ARTICLE_UPDATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para editar artículos." }
    }
    const name = input.name.trim()
    if (!name) {
      return { success: false, error: "El nombre no puede quedar vacío." }
    }
    const kindCheck = validateArticleKindFields(input)
    if (!kindCheck.ok) {
      return { success: false, error: kindCheck.error }
    }
    const salePrice = Number(input.salePrice)
    const iva = Number(input.iva)
    if (!Number.isFinite(salePrice) || salePrice < 0) {
      return { success: false, error: "Precio inválido." }
    }
    if (!Number.isFinite(iva) || iva < 0) {
      return { success: false, error: "IVA inválido." }
    }
    const siteIdForIva = (await getPopSiteId(popId)) ?? "arg"
    if (!isAllowedArticleIvaRate(siteIdForIva, iva)) {
      return { success: false, error: "Elegí un tipo de IVA válido." }
    }
    if (input.itemKind === "merchandise" && salePrice <= 0) {
      return {
        success: false,
        error: "Indicá un precio de venta mayor que cero para mercadería.",
      }
    }
    const categoryId = input.categoryId.trim()
    if (!categoryId) {
      return { success: false, error: "Elegí una categoría." }
    }

    const supabase = await createClient()
    const { data: catRow, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (catErr || !catRow?.id) {
      return { success: false, error: "Categoría inválida." }
    }
    const imageUrl = input.imageUrl.trim()
    const catalogNorm = normalizeCatalogFields(input)
    if (!catalogNorm.ok) {
      return { success: false, error: catalogNorm.error }
    }
    const idFields = normalizeIdentifierFields(input)
    if (!idFields.ok) {
      return { success: false, error: idFields.error }
    }
    const { brand, discountMode, discountValue } = catalogNorm.fields

    const { error } = await supabase
      .from("articles")
      .update({
        name,
        description: input.description.trim(),
        image_url: imageUrl ? imageUrl : null,
        sale_price: input.itemKind === "merchandise" ? salePrice : 0,
        iva,
        category_id: categoryId,
        is_active: input.isActive,
        ...articleDbPayloadFromInput({
          ...input,
          brand,
          sku: idFields.sku ?? "",
          barcode: idFields.barcode ?? "",
          discountMode,
          discountValue,
        }),
      })
      .eq("id", articleId)
      .eq("pop_id", popId)

    if (error) {
      return { success: false, error: error.message || "No se pudo guardar." }
    }

    if (input.costs != null) {
      const syncCosts = await syncArticleCosts(
        supabase,
        popId,
        articleId,
        input.costs,
      )
      if (!syncCosts.ok) {
        return { success: false, error: syncCosts.error }
      }
    }

    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function createPopArticle(
  popId: string,
  input: CreatePopArticleInput,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.ARTICLE_CREATE.resource,
        POP_PERMS.ARTICLE_CREATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para crear artículos." }
    }
    const name = input.name.trim()
    if (!name) {
      return { success: false, error: "El nombre no puede quedar vacío." }
    }
    const kindCheck = validateArticleKindFields(input)
    if (!kindCheck.ok) {
      return { success: false, error: kindCheck.error }
    }
    const salePrice = Number(input.salePrice)
    const iva = Number(input.iva)
    if (!Number.isFinite(salePrice) || salePrice < 0) {
      return { success: false, error: "Precio inválido." }
    }
    if (!Number.isFinite(iva) || iva < 0) {
      return { success: false, error: "IVA inválido." }
    }
    const siteIdForIva =
      typeof input.siteId === "string" && input.siteId.trim()
        ? input.siteId.trim()
        : (await getPopSiteId(popId)) ?? "arg"
    if (!isAllowedArticleIvaRate(siteIdForIva, iva)) {
      return { success: false, error: "Elegí un tipo de IVA válido." }
    }
    if (input.itemKind === "merchandise" && salePrice <= 0) {
      return {
        success: false,
        error: "Indicá un precio de venta mayor que cero para mercadería.",
      }
    }
    const categoryId = input.categoryId.trim()
    if (!categoryId) {
      return { success: false, error: "Elegí una categoría." }
    }

    const supabase = await createClient()
    const { data: catRow, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (catErr || !catRow?.id) {
      return { success: false, error: "Categoría inválida." }
    }
    const costLines = input.costs ?? []
    const rawInitial = input.initialStockQuantity
    const initialQty = rawInitial == null ? 0 : Number(rawInitial)
    const wantsInitial =
      Number.isFinite(initialQty) &&
      Number.isInteger(initialQty) &&
      initialQty > 0
    let siteIdForStock = ""
    let initialUnitCostSaleUom: number | null = null
    if (wantsInitial) {
      if (initialQty < 1 || initialQty > 10000) {
        return {
          success: false,
          error: "El stock inicial debe ser un entero entre 1 y 10000.",
        }
      }
      initialUnitCostSaleUom = primarySaleUnitCostFromCosts(costLines)
      if (initialUnitCostSaleUom == null || initialUnitCostSaleUom <= 0) {
        return {
          success: false,
          error:
            "Para registrar stock inicial agregá al menos un costo activo con precio mayor que cero.",
        }
      }
      siteIdForStock = typeof input.siteId === "string" ? input.siteId.trim() : ""
      if (!siteIdForStock) {
        return { success: false, error: "No se pudo validar el sitio del punto de venta." }
      }
    }

    const imageUrlInsert = input.imageUrl.trim()
    const catalogNorm = normalizeCatalogFields(input)
    if (!catalogNorm.ok) {
      return { success: false, error: catalogNorm.error }
    }
    const idFields = normalizeIdentifierFields(input)
    if (!idFields.ok) {
      return { success: false, error: idFields.error }
    }
    const { brand, discountMode, discountValue } = catalogNorm.fields

    const { data: created, error } = await supabase
      .from("articles")
      .insert({
        pop_id: popId,
        name,
        description: input.description.trim(),
        image_url: imageUrlInsert ? imageUrlInsert : null,
        sale_price: input.itemKind === "merchandise" ? salePrice : 0,
        iva,
        category_id: categoryId,
        is_active: input.isActive,
        ...articleDbPayloadFromInput({
          ...input,
          brand,
          sku: idFields.sku ?? "",
          barcode: idFields.barcode ?? "",
          discountMode,
          discountValue,
        }),
      })
      .select("id")
      .single()

    if (error || !created?.id) {
      return { success: false, error: error?.message || "No se pudo crear." }
    }
    const articleId = String(created.id)

    const syncCosts = await syncArticleCosts(supabase, popId, articleId, costLines)
    if (!syncCosts.ok) {
      await supabase.from("articles").delete().eq("id", articleId).eq("pop_id", popId)
      return { success: false, error: syncCosts.error }
    }

    if (wantsInitial && initialUnitCostSaleUom != null) {
      const stockRes = await createInitialStockLedgerForArticle(popId, {
        articleId,
        quantity: initialQty,
        siteId: siteIdForStock,
        unitCostSaleUom: initialUnitCostSaleUom,
      })
      if (!stockRes.success) {
        await supabase.from("articles").delete().eq("id", articleId).eq("pop_id", popId)
        return { success: false, error: stockRes.error }
      }
    }

    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function createPopCategory(
  popId: string,
  nameRaw: string,
  itemKind: ArticleItemKind = "merchandise",
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.ARTICLE_CREATE.resource,
        POP_PERMS.ARTICLE_CREATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para crear categorías." }
    }
    const name = nameRaw.trim()
    if (!name) {
      return { success: false, error: "El nombre no puede quedar vacío." }
    }
    if (!isArticleItemKind(itemKind)) {
      return { success: false, error: "Tipo de ítem inválido." }
    }
    const supabase = await createClient()
    const { data: maxRow } = await supabase
      .from("categories")
      .select("sort_order")
      .eq("pop_id", popId)
      .eq("show_in_sale", true)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle()
    const nextSort =
      maxRow?.sort_order != null ? Number(maxRow.sort_order) + 1 : 0

    const { error } = await supabase.from("categories").insert({
      pop_id: popId,
      name,
      item_kind: itemKind,
      sort_order: nextSort,
      show_in_sale: true,
    })
    if (error) {
      return { success: false, error: error.message || "No se pudo crear." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function updatePopCategory(
  popId: string,
  categoryId: string,
  nameRaw: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.ARTICLE_UPDATE.resource,
        POP_PERMS.ARTICLE_UPDATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para editar categorías." }
    }
    const name = nameRaw.trim()
    if (!name) {
      return { success: false, error: "El nombre no puede quedar vacío." }
    }
    const supabase = await createClient()
    const { error } = await supabase
      .from("categories")
      .update({ name })
      .eq("id", categoryId)
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo guardar." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function syncPopCategorySaleLayout(
  popId: string,
  updates: CategoryLayoutUpdate[],
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.ARTICLE_UPDATE.resource,
        POP_PERMS.ARTICLE_UPDATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para ordenar categorías." }
    }
    if (updates.length === 0) {
      return { success: true }
    }
    const supabase = await createClient()
    const ids = [...new Set(updates.map((u) => u.id.trim()).filter(Boolean))]
    const { data: validRows, error: validErr } = await supabase
      .from("categories")
      .select("id")
      .eq("pop_id", popId)
      .in("id", ids)
    if (validErr) {
      return { success: false, error: validErr.message || "No se pudo validar." }
    }
    const validIds = new Set((validRows ?? []).map((r) => String(r.id)))
    const filtered = updates.filter((u) => validIds.has(u.id))
    for (const u of filtered) {
      const { error } = await supabase
        .from("categories")
        .update({
          sort_order: Math.max(0, Math.trunc(u.sortOrder)),
          show_in_sale: u.showInSale,
        })
        .eq("id", u.id)
        .eq("pop_id", popId)
      if (error) {
        return { success: false, error: error.message || "No se pudo guardar el orden." }
      }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getPopCategoryArticleCount(
  popId: string,
  categoryId: string,
): Promise<{ success: true; count: number } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.ARTICLE_READ.resource,
        POP_PERMS.ARTICLE_READ.action,
      )
    ) {
      return {
        success: false,
        error: "Sin permiso para consultar artículos en este punto de venta.",
      }
    }
    const supabase = await createClient()
    const { count, error } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("pop_id", popId)
      .eq("category_id", categoryId)
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, count: count ?? 0 }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

function categoryDeleteBlockedMessage(
  categoryName: string,
  articleCount: number,
): string {
  const label = categoryName.trim() || "Esta categoría"
  const articlesLabel =
    articleCount === 1 ? "1 artículo relacionado" : `${articleCount} artículos relacionados`
  return `${label} tiene ${articlesLabel}. Para eliminar, cambiá la categoría de los artículos que la utilizan actualmente.`
}

export async function deletePopCategory(
  popId: string,
  categoryId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.ARTICLE_DELETE.resource,
        POP_PERMS.ARTICLE_DELETE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para eliminar categorías." }
    }
    const supabase = await createClient()
    const { data: categoryRow, error: categoryError } = await supabase
      .from("categories")
      .select("name")
      .eq("id", categoryId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (categoryError) {
      return { success: false, error: categoryError.message || "No se pudo eliminar." }
    }
    if (!categoryRow) {
      return { success: false, error: "La categoría ya no existe." }
    }
    const relatedCount = await getPopCategoryArticleCount(popId, categoryId)
    if (!relatedCount.success) {
      return { success: false, error: relatedCount.error }
    }
    if (relatedCount.count > 0) {
      return {
        success: false,
        error: categoryDeleteBlockedMessage(
          String(categoryRow.name ?? ""),
          relatedCount.count,
        ),
      }
    }
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo eliminar." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function deletePopArticle(
  popId: string,
  articleId: string,
  confirmationTyped: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.ARTICLE_DELETE.resource,
        POP_PERMS.ARTICLE_DELETE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para eliminar artículos." }
    }
    const supabase = await createClient()
    const { data: article, error: fetchError } = await supabase
      .from("articles")
      .select("name")
      .eq("id", articleId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (fetchError) {
      return { success: false, error: fetchError.message || "No se encontró el artículo." }
    }
    if (!article) {
      return { success: false, error: "No se encontró el artículo." }
    }
    const expectedPhrase = articleDeleteConfirmPhrase(String(article.name ?? ""))
    if (confirmationTyped.trim() !== expectedPhrase) {
      return {
        success: false,
        error: `Escribí (${expectedPhrase}) para confirmar el borrado.`,
      }
    }
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", articleId)
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo eliminar." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export type GetPopArticlesTableInput = {
  page: number
  pageSize: number
  search: string
  soloActivos: boolean
  soloInactivos: boolean
  conDescuento: boolean
  sinDescuento: boolean
  conStock: boolean
  sinStock: boolean
  stockNegativo: boolean
  ventaSinStock: boolean
  categoryId: string
  /** Vacío o los tres tipos = sin filtrar por tipo. */
  itemKinds: ArticleItemKind[]
  sort?: string | null
  ord?: "asc" | "desc"
}

const ARTICLE_LIST_SORT = {
  allowed: {
    name: "name",
    sale_price: "sale_price",
  },
  defaultColumn: "name" as const,
  defaultAscending: true,
}

function articleMatchesStockFilter(
  stock: number,
  input: Pick<
    GetPopArticlesTableInput,
    "conStock" | "sinStock" | "stockNegativo"
  >,
): boolean {
  if (!input.conStock && !input.sinStock && !input.stockNegativo) return true
  const zero = Math.abs(stock) < 1e-6
  const positive = stock > 1e-6
  const negative = stock < -1e-6
  const checks: boolean[] = []
  if (input.conStock) checks.push(positive)
  if (input.sinStock) checks.push(zero)
  if (input.stockNegativo) checks.push(negative)
  return checks.some(Boolean)
}

async function stockOnHandForPop(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<Map<string, number>> {
  const out = new Map<string, number>()
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("article_id, quantity_delta")
    .eq("pop_id", popId)

  if (error) return out

  for (const row of data ?? []) {
    const id = String(row.article_id)
    out.set(id, (out.get(id) ?? 0) + parseStockQty(row.quantity_delta))
  }

  for (const [id, qty] of out) {
    out.set(id, Math.round(qty * 1e6) / 1e6)
  }

  return out
}

function normalizeArticlesListPaging(page: number, pageSize: number) {
  const sizes = new Set<number>(ARTICLE_TABLE_PAGE_SIZES as unknown as number[])
  const ps = sizes.has(pageSize) ? pageSize : DEFAULT_ARTICLE_TABLE_PAGE_SIZE
  const p = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1
  return { page: p, pageSize: ps }
}

function escapeIlikeToken(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

function buildArticlesSearchOrClause(raw: string): string | null {
  const t = raw.trim().replace(/,/g, " ").trim()
  if (!t) return null
  const pattern = `%${escapeIlikeToken(t)}%`
  return `name.ilike.${pattern},description.ilike.${pattern},sku.ilike.${pattern},barcode.ilike.${pattern}`
}

function appendArticleListFilters<
  Q extends {
    eq: (a: string, b: string | boolean) => Q
    or: (s: string) => Q
    in: (column: string, values: readonly string[]) => Q
    not: (column: string, operator: string, value: null) => Q
    gt: (column: string, value: number) => Q
  },
>(q: Q, input: GetPopArticlesTableInput): Q {
  let x = q
  if (input.soloActivos) {
    x = x.eq("is_active", true)
  }
  if (input.soloInactivos) {
    x = x.eq("is_active", false)
  }
  if (input.conDescuento) {
    x = x.not("discount_mode", "is", null).gt("discount_value", 0)
  }
  if (input.sinDescuento) {
    x = x.or(
      "discount_mode.is.null,discount_value.is.null,discount_value.lte.0",
    )
  }
  if (input.ventaSinStock) {
    x = x.eq("allow_negative_stock", true)
  }
  const kinds = input.itemKinds.filter((k) => isArticleItemKind(k))
  if (kinds.length > 0 && kinds.length < ARTICLE_ITEM_KINDS.length) {
    x = x.in("item_kind", kinds)
  }
  const cid = input.categoryId.trim()
  if (cid) {
    x = x.eq("category_id", cid)
  }
  const orClause = buildArticlesSearchOrClause(input.search)
  if (orClause) {
    x = x.or(orClause)
  }
  return x
}

const ARTICLE_LIST_SELECT = `
  id,
  name,
  description,
  image_url,
  brand,
  sku,
  barcode,
  item_kind,
  unit_of_measure,
  is_sellable,
  default_waste_pct,
  min_stock_level,
  sale_price,
  iva,
  discount_mode,
  discount_value,
  category_id,
  is_active,
  allow_negative_stock,
  categories ( id, name )
`

export async function getPopArticlesTable(
  popId: string,
  input: GetPopArticlesTableInput,
): Promise<
  | {
      success: true
      articles: ArticleTableRow[]
      totalCount: number
      page: number
      popName: string
      canCreate: boolean
      canPostInitialStock: boolean
      canUpdate: boolean
      canDelete: boolean
    }
  | {
      success: false
      error: string
      redirect?: string
      articles: ArticleTableRow[]
      totalCount: number
      page: number
      popName?: string
      canCreate: boolean
      canPostInitialStock: boolean
      canUpdate: boolean
      canDelete: boolean
    }
> {
  const empty = {
    articles: [] as ArticleTableRow[],
    totalCount: 0,
    page: 1,
    canCreate: false,
    canPostInitialStock: false,
    canUpdate: false,
    canDelete: false,
  }
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return {
        success: false,
        error: access.error || "Sin acceso",
        redirect: "/home",
        ...empty,
        popName: "",
      }
    }

    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.ARTICLE_READ.resource,
        POP_PERMS.ARTICLE_READ.action,
      )
    ) {
      return {
        success: false,
        error:
          "No tenés permiso para ver artículos en este punto de venta.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
        ...empty,
        popName: "",
      }
    }

    const canCreate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.ARTICLE_CREATE.resource,
      POP_PERMS.ARTICLE_CREATE.action,
    )
    const canPostInitialStock = canCreate
    const canUpdate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.ARTICLE_UPDATE.resource,
      POP_PERMS.ARTICLE_UPDATE.action,
    )
    const canDelete = permissionKeysInclude(
      snap.keys,
      POP_PERMS.ARTICLE_DELETE.resource,
      POP_PERMS.ARTICLE_DELETE.action,
    )

    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""

    const { page: reqPage, pageSize } = normalizeArticlesListPaging(
      input.page,
      input.pageSize,
    )

    const supabase = await createClient()

    const needsStockFilter =
      input.conStock || input.sinStock || input.stockNegativo
    let stockArticleIds: string[] | null = null

    if (needsStockFilter) {
      let idQuery = supabase.from("articles").select("id").eq("pop_id", popId)
      idQuery = appendArticleListFilters(idQuery, input)
      const { data: idRows, error: idErr } = await idQuery
      if (idErr) {
        return {
          success: false,
          error: idErr.message || "No se pudieron cargar los artículos.",
          ...empty,
          popName,
        }
      }

      const stockById = await stockOnHandForPop(supabase, popId)
      stockArticleIds = (idRows ?? [])
        .map((row) => String(row.id))
        .filter((id) =>
          articleMatchesStockFilter(stockById.get(id) ?? 0, input),
        )

      if (stockArticleIds.length === 0) {
        return {
          success: true,
          articles: [],
          totalCount: 0,
          page: 1,
          popName,
          canCreate,
          canPostInitialStock,
          canUpdate,
          canDelete,
        }
      }
    }

    let countQuery = supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("pop_id", popId)
    countQuery = appendArticleListFilters(countQuery, input)
    if (stockArticleIds) {
      countQuery = countQuery.in("id", stockArticleIds)
    }

    const { count: countRaw, error: countErr } = await countQuery
    if (countErr) {
      return {
        success: false,
        error: countErr.message || "No se pudieron cargar los artículos.",
        ...empty,
        popName,
      }
    }

    const totalCount = countRaw ?? 0
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
    const safePage = Math.min(Math.max(1, reqPage), totalPages)
    const from = (safePage - 1) * pageSize
    const to = from + pageSize - 1

    let dataQuery = supabase
      .from("articles")
      .select(ARTICLE_LIST_SELECT)
      .eq("pop_id", popId)
    dataQuery = appendArticleListFilters(dataQuery, input)
    if (stockArticleIds) {
      dataQuery = dataQuery.in("id", stockArticleIds)
    }
    const listOrder = resolveWorkspaceTableListOrder(
      { sort: input.sort ?? null, ord: input.ord ?? "asc" },
      ARTICLE_LIST_SORT,
    )
    dataQuery = dataQuery
      .order(listOrder.column, { ascending: listOrder.ascending })
      .range(from, to)

    const { data, error } = await dataQuery
    if (error) {
      return {
        success: false,
        error: error.message || "No se pudieron cargar los artículos.",
        ...empty,
        popName,
      }
    }

    const rows = (data || []) as Record<string, unknown>[]
    const articlesBase: ArticleTableRow[] = rows.map((row) => articleRowFromDb(row))
    const articleIds = articlesBase.map((row) => row.id)
    const [stockById, costCountById] = await Promise.all([
      stockOnHandByArticleIds(supabase, popId, articleIds),
      activeCostCountByArticleIds(supabase, popId, articleIds),
    ])
    const articles = articlesBase.map((row) => ({
      ...row,
      stockOnHand: stockById.get(row.id) ?? 0,
      activeCostCount: costCountById.get(row.id) ?? 0,
    }))

    return {
      success: true,
      articles,
      totalCount,
      page: safePage,
      popName,
      canCreate,
      canPostInitialStock,
      canUpdate,
      canDelete,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return {
      success: false,
      error: message,
      ...empty,
      popName: "",
    }
  }
}

export async function uploadArticleImage(
  popId: string,
  formData: FormData,
): Promise<
  { success: true; imageUrl: string } | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const snap = await loadPopPermissionsSnapshot(popId)
    const canUpload =
      permissionKeysInclude(
        snap.keys,
        POP_PERMS.ARTICLE_CREATE.resource,
        POP_PERMS.ARTICLE_CREATE.action,
      ) ||
      permissionKeysInclude(
        snap.keys,
        POP_PERMS.ARTICLE_UPDATE.resource,
        POP_PERMS.ARTICLE_UPDATE.action,
      )
    if (!canUpload) {
      return { success: false, error: "Sin permiso para subir imágenes." }
    }

    const raw = formData.get("file")
    if (!(raw instanceof File) || raw.size <= 0) {
      return { success: false, error: "Elegí una imagen para subir." }
    }
    if (raw.type !== "image/webp") {
      return { success: false, error: "La imagen debe estar en formato WebP." }
    }
    if (raw.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "La imagen comprimida supera el límite de 5 MB.",
      }
    }

    const fileName = buildArticleImageFileName()
    const storagePath = buildArticleImageStoragePath(popId, fileName)
    const bytes = Buffer.from(await raw.arrayBuffer())

    const supabase = await createClient()
    const { error: uploadError } = await supabase.storage
      .from(ARTICLE_IMAGE_STORAGE_BUCKET)
      .upload(storagePath, bytes, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      })

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message || "No se pudo subir la imagen.",
      }
    }

    const { data: publicUrlData } = supabase.storage
      .from(ARTICLE_IMAGE_STORAGE_BUCKET)
      .getPublicUrl(storagePath)

    const imageUrl = publicUrlData.publicUrl?.trim()
    if (!imageUrl) {
      return { success: false, error: "No se pudo obtener la URL pública." }
    }

    return { success: true, imageUrl }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
