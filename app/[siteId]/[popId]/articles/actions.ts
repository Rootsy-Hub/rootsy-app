"use server"

import { createInitialStockLedgerForArticle } from "@/app/[siteId]/[popId]/inventory/actions"
import { ARTICLE_DELETE_CONFIRM_PHRASE } from "@/app/[siteId]/[popId]/articles/articleConstants"
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
import {
  normalizeArticleBarcode,
  normalizeArticleSku,
  validateArticleBarcodeInput,
} from "@/lib/articleIdentifiers"
import {
  ARTICLE_TABLE_PAGE_SIZES,
  DEFAULT_ARTICLE_TABLE_PAGE_SIZE,
} from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import { isArticleDiscountMode } from "@/lib/articleDiscount"
import { createClient } from "@/utils/supabase/server"

export type ArticleSupplierRef = {
  id: string
  name: string
}

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
  costPrice: number
  iva: number
  discountMode: ArticleDiscountMode | null
  discountValue: number | null
  categoryId: string
  categoryName: string
  suppliers: ArticleSupplierRef[]
  isActive: boolean
  stockOnHand: number
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
  costPrice: number
  iva: number
  categoryId: string
  isActive: boolean
  discountMode: ArticleDiscountMode | null
  discountValue: number | null
  supplierIds: string[]
} & ArticleItemFieldsInput

export type CreatePopArticleInput = UpdatePopArticleInput & {
  siteId?: string
  initialStockQuantity?: number | null
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

function parseArticleSuppliers(row: Record<string, unknown>): ArticleSupplierRef[] {
  const raw = row.article_suppliers
  if (!Array.isArray(raw)) return []
  const out: ArticleSupplierRef[] = []
  for (const link of raw) {
    if (!link || typeof link !== "object") continue
    const sup = (link as { suppliers?: { id?: unknown; name?: unknown } | null })
      .suppliers
    if (sup?.id) {
      out.push({
        id: String(sup.id),
        name: String(sup.name ?? ""),
      })
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, "es"))
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
    costPrice: Number(row.cost_price ?? 0) || 0,
    iva: Number(row.iva ?? 0) || 0,
    discountMode,
    discountValue,
    categoryId: String(row.category_id ?? ""),
    categoryName: cat?.name ? String(cat.name) : "—",
    suppliers: parseArticleSuppliers(row),
    isActive: Boolean(row.is_active),
    stockOnHand: 0,
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

async function syncArticleSuppliers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  articleId: string,
  supplierIds: string[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const unique = [...new Set(supplierIds.map((id) => id.trim()).filter(Boolean))]
  let filtered: string[] = []
  if (unique.length > 0) {
    const { data: validRows, error: validErr } = await supabase
      .from("suppliers")
      .select("id")
      .eq("pop_id", popId)
      .in("id", unique)
    if (validErr) {
      return { ok: false, error: validErr.message || "No se pudieron validar proveedores." }
    }
    const validIds = new Set((validRows ?? []).map((r) => String(r.id)))
    filtered = unique.filter((id) => validIds.has(id))
  }

  const { error: delErr } = await supabase
    .from("article_suppliers")
    .delete()
    .eq("article_id", articleId)
    .eq("pop_id", popId)
  if (delErr) {
    return { ok: false, error: delErr.message || "No se pudieron actualizar proveedores." }
  }

  if (filtered.length === 0) return { ok: true }

  const { error: insErr } = await supabase.from("article_suppliers").insert(
    filtered.map((supplierId) => ({
      article_id: articleId,
      supplier_id: supplierId,
      pop_id: popId,
    })),
  )
  if (insErr) {
    return { ok: false, error: insErr.message || "No se pudieron vincular proveedores." }
  }
  return { ok: true }
}

function normalizeCatalogFields(
  input: UpdatePopArticleInput,
):
  | {
      ok: true
      fields: Pick<
        UpdatePopArticleInput,
        "brand" | "discountMode" | "discountValue" | "supplierIds"
      >
    }
  | { ok: false; error: string } {
  const brand = input.brand.trim()
  const supplierIds = [
    ...new Set(input.supplierIds.map((id) => id.trim()).filter(Boolean)),
  ]

  if (input.itemKind !== "merchandise") {
    return {
      ok: true,
      fields: {
        brand,
        discountMode: null,
        discountValue: null,
        supplierIds,
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
    fields: { brand, discountMode, discountValue, supplierIds },
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
    const costPrice = Number(input.costPrice)
    if (!Number.isFinite(costPrice) || costPrice < 0) {
      return { success: false, error: "Precio de costo inválido." }
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
    const { brand, discountMode, discountValue, supplierIds } = catalogNorm.fields

    const { error } = await supabase
      .from("articles")
      .update({
        name,
        description: input.description.trim(),
        image_url: imageUrl ? imageUrl : null,
        sale_price: input.itemKind === "merchandise" ? salePrice : 0,
        cost_price: costPrice,
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
          supplierIds,
        }),
      })
      .eq("id", articleId)
      .eq("pop_id", popId)

    if (error) {
      return { success: false, error: error.message || "No se pudo guardar." }
    }

    const syncSup = await syncArticleSuppliers(supabase, popId, articleId, supplierIds)
    if (!syncSup.ok) {
      return { success: false, error: syncSup.error }
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
    const costPrice = Number(input.costPrice)
    if (!Number.isFinite(costPrice) || costPrice < 0) {
      return { success: false, error: "Precio de costo inválido." }
    }
    const rawInitial = input.initialStockQuantity
    const initialQty = rawInitial == null ? 0 : Number(rawInitial)
    const wantsInitial =
      Number.isFinite(initialQty) &&
      Number.isInteger(initialQty) &&
      initialQty > 0
    let siteIdForStock = ""
    if (wantsInitial) {
      if (initialQty < 1 || initialQty > 10000) {
        return {
          success: false,
          error: "El stock inicial debe ser un entero entre 1 y 10000.",
        }
      }
      if (costPrice <= 0) {
        return {
          success: false,
          error:
            "Para registrar stock inicial se requiere un precio de costo mayor que cero.",
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
    const { brand, discountMode, discountValue, supplierIds } = catalogNorm.fields

    const { data: created, error } = await supabase
      .from("articles")
      .insert({
        pop_id: popId,
        name,
        description: input.description.trim(),
        image_url: imageUrlInsert ? imageUrlInsert : null,
        sale_price: input.itemKind === "merchandise" ? salePrice : 0,
        cost_price: costPrice,
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
          supplierIds,
        }),
      })
      .select("id")
      .single()

    if (error || !created?.id) {
      return { success: false, error: error?.message || "No se pudo crear." }
    }
    const articleId = String(created.id)

    const syncSup = await syncArticleSuppliers(supabase, popId, articleId, supplierIds)
    if (!syncSup.ok) {
      await supabase.from("articles").delete().eq("id", articleId).eq("pop_id", popId)
      return { success: false, error: syncSup.error }
    }

    if (wantsInitial) {
      const stockRes = await createInitialStockLedgerForArticle(popId, {
        articleId,
        quantity: initialQty,
        siteId: siteIdForStock,
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
    if (confirmationTyped.trim() !== ARTICLE_DELETE_CONFIRM_PHRASE) {
      return {
        success: false,
        error: `Escribí ${ARTICLE_DELETE_CONFIRM_PHRASE} para confirmar el borrado.`,
      }
    }
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
  categoryId: string
  /** Vacío o los tres tipos = sin filtrar por tipo. */
  itemKinds: ArticleItemKind[]
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
  },
>(q: Q, input: GetPopArticlesTableInput): Q {
  let x = q
  if (input.soloActivos) {
    x = x.eq("is_active", true)
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
  cost_price,
  iva,
  discount_mode,
  discount_value,
  category_id,
  is_active,
  categories ( id, name ),
  article_suppliers (
    supplier_id,
    suppliers ( id, name )
  )
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

    let countQuery = supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("pop_id", popId)
    countQuery = appendArticleListFilters(countQuery, input)

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
    dataQuery = dataQuery.order("name", { ascending: true }).range(from, to)

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
    const stockById = await stockOnHandByArticleIds(
      supabase,
      popId,
      articlesBase.map((row) => row.id),
    )
    const articles = articlesBase.map((row) => ({
      ...row,
      stockOnHand: stockById.get(row.id) ?? 0,
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
