"use server"

import { recipeDeleteConfirmPhrase } from "@/app/[siteId]/[popId]/recipes/recipeConstants"
import {
  DEFAULT_RECIPE_TABLE_PAGE_SIZE,
  RECIPE_TABLE_PAGE_SIZES,
} from "@/app/[siteId]/[popId]/recipes/workspaceUrl"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import { popMenuHref } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { resolveWorkspaceTableListOrder } from "@/lib/workspaceTableSort"
import { computeRecipeCostPrice } from "@/lib/recipeCost"
import { resolveArticleReferenceUnitCostsByArticleId } from "@/lib/articleReferenceUnitCost"
import { createClient } from "@/utils/supabase/server"
import { syncItemPriceListAmounts } from "@/app/[siteId]/[popId]/articles/priceListActions"
import type { SalePriceListAmountInput } from "@/lib/salePriceLists"
import type { ArticleItemKind } from "@/lib/articleItemKind"
import {
  isArticleItemKind,
  normalizeStoredUnitOfMeasure,
} from "@/lib/articleItemKind"
import {
  RECIPE_IMAGE_STORAGE_BUCKET,
  buildRecipeImageFileName,
  buildRecipeImageStoragePath,
} from "@/lib/recipeImageStorage"

export type RecipeCategoryOption = {
  id: string
  name: string
  sortOrder: number
  showInMenu: boolean
  isActive: boolean
  stationId: string | null
  stationName: string | null
}

export type ComandaStationOption = {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
}

export type RecipeCategoryLayoutUpdate = {
  id: string
  sortOrder: number
  showInMenu: boolean
}

export type RecipeIngredientOption = {
  id: string
  name: string
  itemKind: ArticleItemKind
  unitOfMeasure: string
  costPrice: number
  defaultWastePct: number | null
}

export type RecipeIngredientInput = {
  articleId: string
  quantity: number
  wastePct: number | null
}

export type RecipeIngredientRow = {
  id: string
  articleId: string
  articleName: string
  itemKind: ArticleItemKind
  unitOfMeasure: string
  quantity: number
  wastePct: number | null
  articleCostPrice: number
  articleDefaultWastePct: number | null
  lineCost: number
}

export type RecipeTableRow = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  categoryId: string | null
  categoryName: string
  salePrice: number
  costPrice: number
  iva: number
  ingredientCount: number
  isActive: boolean
  allowNegativeStock: boolean
}

export type RecipeDetail = RecipeTableRow & {
  ingredients: RecipeIngredientRow[]
}

export type CreateRecipeInput = {
  name: string
  description: string
  imageUrl: string
  categoryId: string
  salePrice: number
  iva: number
  isActive: boolean
  allowNegativeStock: boolean
  ingredients: RecipeIngredientInput[]
  listPrices?: SalePriceListAmountInput[]
}

export type UpdateRecipeInput = CreateRecipeInput

export type GetPopRecipesTableInput = {
  q?: string
  page?: number
  pageSize?: number
  soloActivos?: boolean
  categoryId?: string
  sort?: string | null
  ord?: "asc" | "desc"
}

const RECIPE_LIST_SORT = {
  allowed: {
    name: "name",
    sale_price: "sale_price",
    cost_price: "cost_price",
  },
  defaultColumn: "name" as const,
  defaultAscending: true,
}

const RECIPE_SELECT = `
  id,
  pop_id,
  category_id,
  name,
  description,
  sale_price,
  cost_price,
  iva,
  image_url,
  is_active,
  allow_negative_stock,
  recipe_categories ( name )
`

const INGREDIENT_SELECT = `
  id,
  article_id,
  quantity,
  waste_pct,
  sort_order,
  articles (
    id,
    name,
    item_kind,
    unit_of_measure,
    default_waste_pct
  )
`

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function parseOptionalPct(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0 || n > 100) return null
  return Math.round(n * 100) / 100
}

function parseQty(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  )
}

async function recipePermissionFlags(popId: string) {
  const snap = await loadPopPermissionsSnapshot(popId)
  return {
    canRead: permissionKeysInclude(
      snap.keys,
      POP_PERMS.RECIPE_READ.resource,
      POP_PERMS.RECIPE_READ.action,
    ),
    canCreate: permissionKeysInclude(
      snap.keys,
      POP_PERMS.RECIPE_CREATE.resource,
      POP_PERMS.RECIPE_CREATE.action,
    ),
    canUpdate: permissionKeysInclude(
      snap.keys,
      POP_PERMS.RECIPE_UPDATE.resource,
      POP_PERMS.RECIPE_UPDATE.action,
    ),
    canDelete: permissionKeysInclude(
      snap.keys,
      POP_PERMS.RECIPE_DELETE.resource,
      POP_PERMS.RECIPE_DELETE.action,
    ),
  }
}

function mapIngredientRow(
  row: Record<string, unknown>,
  referenceUnitCostByArticleId: Map<string, number>,
): RecipeIngredientRow | null {
  const art = row.articles as Record<string, unknown> | null
  if (!art?.id) return null
  const articleId = String(art.id)
  const rawKind = String(art.item_kind ?? "raw_material")
  const itemKind = isArticleItemKind(rawKind) ? rawKind : "raw_material"
  const rawUom = String(art.unit_of_measure ?? "kg")
  const unitOfMeasure = normalizeStoredUnitOfMeasure(rawUom, "kg")
  const quantity = Number(row.quantity ?? 0)
  const wasteRaw = row.waste_pct
  const wastePct =
    wasteRaw != null && Number.isFinite(Number(wasteRaw))
      ? Number(wasteRaw)
      : null
  const articleCostPrice = referenceUnitCostByArticleId.get(articleId) ?? 0
  const wasteDefaultRaw = art.default_waste_pct
  const articleDefaultWastePct =
    wasteDefaultRaw != null && Number.isFinite(Number(wasteDefaultRaw))
      ? Number(wasteDefaultRaw)
      : null
  const lineCost = computeRecipeCostPrice([
    {
      quantity,
      wastePct,
      articleCostPrice,
      articleDefaultWastePct,
    },
  ])
  return {
    id: String(row.id),
    articleId,
    articleName: String(art.name ?? ""),
    itemKind,
    unitOfMeasure,
    quantity,
    wastePct,
    articleCostPrice,
    articleDefaultWastePct,
    lineCost,
  }
}

function mapRecipeTableRow(
  row: Record<string, unknown>,
  ingredientCount = 0,
): RecipeTableRow {
  const cat = row.recipe_categories as { name?: string } | null
  const rawImg = row.image_url
  const imageUrl =
    typeof rawImg === "string" && rawImg.trim() !== "" ? rawImg.trim() : null
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    imageUrl,
    categoryId: row.category_id ? String(row.category_id) : null,
    categoryName: cat?.name ? String(cat.name) : "—",
    salePrice: Number(row.sale_price ?? 0) || 0,
    costPrice: Number(row.cost_price ?? 0) || 0,
    iva: Number(row.iva ?? 0) || 0,
    ingredientCount,
    isActive: Boolean(row.is_active),
    allowNegativeStock: Boolean(row.allow_negative_stock),
  }
}

function validateRecipeInput(
  input: CreateRecipeInput,
): { ok: true } | { ok: false; error: string } {
  const name = input.name.trim()
  if (!name) return { ok: false, error: "Indicá el nombre de la receta." }
  if (name.length > 200) {
    return { ok: false, error: "El nombre no puede superar 200 caracteres." }
  }
  const categoryId = input.categoryId.trim()
  if (!categoryId) return { ok: false, error: "Elegí una categoría." }
  const salePrice = Number(input.salePrice)
  if (!Number.isFinite(salePrice) || salePrice < 0) {
    return { ok: false, error: "Precio de venta inválido." }
  }
  const iva = Number(input.iva)
  if (!Number.isFinite(iva) || iva < 0 || iva > 100) {
    return { ok: false, error: "IVA inválido." }
  }
  if (!input.ingredients?.length) {
    return { ok: false, error: "Agregá al menos un ingrediente." }
  }
  const seen = new Set<string>()
  for (const line of input.ingredients) {
    const articleId = line.articleId?.trim()
    if (!articleId || !isUuid(articleId)) {
      return { ok: false, error: "Ingrediente inválido." }
    }
    if (seen.has(articleId)) {
      return { ok: false, error: "No podés repetir el mismo ingrediente." }
    }
    seen.add(articleId)
    const qty = parseQty(line.quantity)
    if (qty == null) {
      return { ok: false, error: "Cantidad de ingrediente inválida." }
    }
    if (line.wastePct != null) {
      const w = parseOptionalPct(line.wastePct)
      if (w == null) {
        return { ok: false, error: "Merma inválida en un ingrediente." }
      }
    }
  }
  return { ok: true }
}

async function loadIngredientArticles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  ingredients: RecipeIngredientInput[],
): Promise<
  | {
      ok: true
      rows: {
        articleId: string
        quantity: number
        wastePct: number | null
        costPrice: number
        defaultWastePct: number | null
        itemKind: ArticleItemKind
      }[]
    }
  | { ok: false; error: string }
> {
  const ids = ingredients.map((i) => i.articleId.trim())
  const { data, error } = await supabase
    .from("articles")
    .select("id, item_kind, default_waste_pct, is_active")
    .eq("pop_id", popId)
    .in("id", ids)
  if (error) {
    return { ok: false, error: error.message || "No se pudieron validar ingredientes." }
  }
  const referenceUnitCosts = await resolveArticleReferenceUnitCostsByArticleId(
    supabase,
    popId,
    ids,
  )
  const byId = new Map(
    (data ?? []).map((r) => [String(r.id), r as Record<string, unknown>]),
  )
  const rows: {
    articleId: string
    quantity: number
    wastePct: number | null
    costPrice: number
    defaultWastePct: number | null
    itemKind: ArticleItemKind
  }[] = []

  for (const line of ingredients) {
    const row = byId.get(line.articleId.trim())
    if (!row || !row.is_active) {
      return { ok: false, error: "Uno de los ingredientes ya no está disponible." }
    }
    const rawKind = String(row.item_kind ?? "")
    if (rawKind !== "raw_material" && rawKind !== "supply") {
      return {
        ok: false,
        error: "Solo podés usar materias primas o insumos en una receta.",
      }
    }
    const qty = parseQty(line.quantity)
    if (qty == null) {
      return { ok: false, error: "Cantidad de ingrediente inválida." }
    }
    const wastePct =
      line.wastePct == null ? null : parseOptionalPct(line.wastePct)
    rows.push({
      articleId: line.articleId.trim(),
      quantity: qty,
      wastePct,
      costPrice: referenceUnitCosts.get(line.articleId.trim()) ?? 0,
      defaultWastePct:
        row.default_waste_pct != null && Number.isFinite(Number(row.default_waste_pct))
          ? Number(row.default_waste_pct)
          : null,
      itemKind: rawKind as ArticleItemKind,
    })
  }
  return { ok: true, rows }
}

async function syncRecipeIngredients(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  recipeId: string,
  ingredients: RecipeIngredientInput[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error: delErr } = await supabase
    .from("recipe_ingredients")
    .delete()
    .eq("recipe_id", recipeId)
    .eq("pop_id", popId)
  if (delErr) {
    return { ok: false, error: delErr.message || "No se pudieron actualizar ingredientes." }
  }
  if (ingredients.length === 0) return { ok: true }

  const { error: insErr } = await supabase.from("recipe_ingredients").insert(
    ingredients.map((line, index) => ({
      recipe_id: recipeId,
      pop_id: popId,
      article_id: line.articleId.trim(),
      quantity: parseQty(line.quantity),
      waste_pct: line.wastePct == null ? null : parseOptionalPct(line.wastePct),
      sort_order: index,
    })),
  )
  if (insErr) {
    return { ok: false, error: insErr.message || "No se pudieron guardar ingredientes." }
  }
  return { ok: true }
}

export async function getPopRecipeCategories(popId: string): Promise<
  | { success: true; categories: RecipeCategoryOption[] }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver recetas." }
    }
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("recipe_categories")
      .select("id, name, sort_order, show_in_menu, is_active, station_id, comanda_stations ( name )")
      .eq("pop_id", popId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
    if (error) return { success: false, error: error.message }
    return {
      success: true,
      categories: (data ?? []).map((r) => {
        const stationRel = r.comanda_stations as { name?: string } | { name?: string }[] | null
        const station = Array.isArray(stationRel) ? stationRel[0] : stationRel
        return {
          id: String(r.id),
          name: String(r.name ?? ""),
          sortOrder: Number(r.sort_order ?? 0) || 0,
          showInMenu: Boolean(r.show_in_menu),
          isActive: Boolean(r.is_active),
          stationId: r.station_id ? String(r.station_id) : null,
          stationName: station?.name?.trim() ? String(station.name) : null,
        }
      }),
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function createRecipeCategory(
  popId: string,
  nameRaw: string,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canCreate) {
      return { success: false, error: "Sin permiso para crear categorías." }
    }
    const name = nameRaw.trim()
    if (!name) return { success: false, error: "Indicá el nombre de la categoría." }
    const supabase = await createClient()
    const { data: maxRow } = await supabase
      .from("recipe_categories")
      .select("sort_order")
      .eq("pop_id", popId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle()
    const sortOrder = (Number(maxRow?.sort_order ?? -1) || -1) + 1
    const { data, error } = await supabase
      .from("recipe_categories")
      .insert({
        pop_id: popId,
        name,
        sort_order: sortOrder,
        show_in_menu: true,
        is_active: true,
      })
      .select("id")
      .single()
    if (error || !data?.id) {
      return { success: false, error: error?.message || "No se pudo crear la categoría." }
    }
    return { success: true, id: String(data.id) }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function updateRecipeCategory(
  popId: string,
  categoryId: string,
  nameRaw: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canUpdate) {
      return { success: false, error: "Sin permiso para editar categorías." }
    }
    if (!isUuid(categoryId)) return { success: false, error: "Categoría inválida." }
    const name = nameRaw.trim()
    if (!name) return { success: false, error: "Indicá el nombre de la categoría." }
    const supabase = await createClient()
    const { error } = await supabase
      .from("recipe_categories")
      .update({ name })
      .eq("id", categoryId)
      .eq("pop_id", popId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function deleteRecipeCategory(
  popId: string,
  categoryId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canDelete) {
      return { success: false, error: "Sin permiso para eliminar categorías." }
    }
    if (!isUuid(categoryId)) return { success: false, error: "Categoría inválida." }
    const supabase = await createClient()
    const { count, error: countErr } = await supabase
      .from("recipes")
      .select("id", { count: "exact", head: true })
      .eq("pop_id", popId)
      .eq("category_id", categoryId)
    if (countErr) return { success: false, error: countErr.message }
    if ((count ?? 0) > 0) {
      return {
        success: false,
        error: "No podés eliminar una categoría con recetas asignadas.",
      }
    }
    const { error } = await supabase
      .from("recipe_categories")
      .delete()
      .eq("id", categoryId)
      .eq("pop_id", popId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function syncRecipeCategoryMenuLayout(
  popId: string,
  updates: RecipeCategoryLayoutUpdate[],
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canUpdate) {
      return { success: false, error: "Sin permiso para editar categorías." }
    }
    const supabase = await createClient()
    for (const u of updates) {
      if (!isUuid(u.id)) continue
      const { error } = await supabase
        .from("recipe_categories")
        .update({
          sort_order: u.sortOrder,
          show_in_menu: u.showInMenu,
        })
        .eq("id", u.id)
        .eq("pop_id", popId)
      if (error) return { success: false, error: error.message }
    }
    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function updateRecipeCategoryStation(
  popId: string,
  categoryId: string,
  stationId: string | null,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canUpdate) {
      return { success: false, error: "Sin permiso para editar categorías." }
    }
    if (!isUuid(categoryId)) return { success: false, error: "Categoría inválida." }
    if (stationId && !isUuid(stationId)) {
      return { success: false, error: "Estación inválida." }
    }
    const supabase = await createClient()
    if (stationId) {
      const { data: station, error: stationErr } = await supabase
        .from("comanda_stations")
        .select("id")
        .eq("id", stationId)
        .eq("pop_id", popId)
        .maybeSingle()
      if (stationErr) return { success: false, error: stationErr.message }
      if (!station) return { success: false, error: "Esa estación no existe." }
    }
    const { error } = await supabase
      .from("recipe_categories")
      .update({ station_id: stationId })
      .eq("id", categoryId)
      .eq("pop_id", popId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

function stationUniqueNameError(message: string): string {
  if (/comanda_stations_pop_name_unique/i.test(message)) {
    return "Ya existe una estación con ese nombre."
  }
  return message
}

export async function getPopComandaStations(popId: string): Promise<
  | { success: true; stations: ComandaStationOption[] }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver recetas." }
    }
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("comanda_stations")
      .select("id, name, sort_order, is_active")
      .eq("pop_id", popId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
    if (error) return { success: false, error: error.message }
    let rows = data ?? []
    if (rows.length === 0) {
      const { error: seedErr } = await supabase.rpc("seed_pop_comanda_stations", {
        p_pop_id: popId,
      })
      if (seedErr) return { success: false, error: seedErr.message }
      const seeded = await supabase
        .from("comanda_stations")
        .select("id, name, sort_order, is_active")
        .eq("pop_id", popId)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true })
      if (seeded.error) return { success: false, error: seeded.error.message }
      rows = seeded.data ?? []
    }
    return {
      success: true,
      stations: rows.map((r) => ({
        id: String(r.id),
        name: String(r.name ?? ""),
        sortOrder: Number(r.sort_order ?? 0) || 0,
        isActive: Boolean(r.is_active),
      })),
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function createComandaStation(
  popId: string,
  nameRaw: string,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canCreate) {
      return { success: false, error: "Sin permiso para crear estaciones." }
    }
    const name = nameRaw.trim()
    if (!name) return { success: false, error: "Indicá el nombre de la estación." }
    const supabase = await createClient()
    const { data: maxRow } = await supabase
      .from("comanda_stations")
      .select("sort_order")
      .eq("pop_id", popId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle()
    const sortOrder = (Number(maxRow?.sort_order ?? -1) || -1) + 1
    const { data, error } = await supabase
      .from("comanda_stations")
      .insert({
        pop_id: popId,
        name,
        sort_order: sortOrder,
        is_active: true,
      })
      .select("id")
      .single()
    if (error || !data?.id) {
      return {
        success: false,
        error: stationUniqueNameError(
          error?.message || "No se pudo crear la estación.",
        ),
      }
    }
    return { success: true, id: String(data.id) }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function updateComandaStation(
  popId: string,
  stationId: string,
  nameRaw: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canUpdate) {
      return { success: false, error: "Sin permiso para editar estaciones." }
    }
    if (!isUuid(stationId)) return { success: false, error: "Estación inválida." }
    const name = nameRaw.trim()
    if (!name) return { success: false, error: "Indicá el nombre de la estación." }
    const supabase = await createClient()
    const { error } = await supabase
      .from("comanda_stations")
      .update({ name })
      .eq("id", stationId)
      .eq("pop_id", popId)
    if (error) return { success: false, error: stationUniqueNameError(error.message) }
    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function deleteComandaStation(
  popId: string,
  stationId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canDelete) {
      return { success: false, error: "Sin permiso para eliminar estaciones." }
    }
    if (!isUuid(stationId)) return { success: false, error: "Estación inválida." }
    const supabase = await createClient()
    const { count, error: countErr } = await supabase
      .from("recipe_categories")
      .select("id", { count: "exact", head: true })
      .eq("pop_id", popId)
      .eq("station_id", stationId)
    if (countErr) return { success: false, error: countErr.message }
    if ((count ?? 0) > 0) {
      return {
        success: false,
        error: "No podés eliminar una estación asignada a categorías.",
      }
    }
    const { error } = await supabase
      .from("comanda_stations")
      .delete()
      .eq("id", stationId)
      .eq("pop_id", popId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

const RECIPE_INGREDIENT_SEARCH_LIMIT = 8

function escapeIngredientIlikeToken(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

function mapRecipeIngredientRows(
  rows: Array<Record<string, unknown>>,
  referenceUnitCosts: Map<string, number>,
): RecipeIngredientOption[] {
  return rows.map((r) => {
    const id = String(r.id)
    const rawKind = String(r.item_kind ?? "raw_material")
    const itemKind = isArticleItemKind(rawKind) ? rawKind : "raw_material"
    const rawUom = String(r.unit_of_measure ?? "kg")
    const unitOfMeasure = normalizeStoredUnitOfMeasure(rawUom, "kg")
    const wasteRaw = r.default_waste_pct
    return {
      id,
      name: String(r.name ?? ""),
      itemKind,
      unitOfMeasure,
      costPrice: referenceUnitCosts.get(id) ?? 0,
      defaultWastePct:
        wasteRaw != null && Number.isFinite(Number(wasteRaw))
          ? Number(wasteRaw)
          : null,
    }
  })
}

export async function searchRecipeIngredientOptions(
  popId: string,
  query: string,
  excludeIds: string[] = [],
): Promise<
  | { success: true; ingredients: RecipeIngredientOption[] }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver ingredientes." }
    }

    const term = query.trim()
    if (!term) {
      return { success: true, ingredients: [] }
    }

    const supabase = await createClient()
    const pattern = `%${escapeIngredientIlikeToken(term)}%`
    const blocked = excludeIds.map((id) => id.trim()).filter(Boolean)
    let q = supabase
      .from("articles")
      .select("id, name, item_kind, unit_of_measure, default_waste_pct")
      .eq("pop_id", popId)
      .eq("is_active", true)
      .eq("item_kind", "raw_material")
      .or(`name.ilike.${pattern},sku.ilike.${pattern}`)
      .order("name", { ascending: true })
      .limit(RECIPE_INGREDIENT_SEARCH_LIMIT)
    if (blocked.length > 0) {
      q = q.not("id", "in", `(${blocked.join(",")})`)
    }
    const { data, error } = await q
    if (error) return { success: false, error: error.message }

    const rows = (data ?? []) as Array<Record<string, unknown>>
    const articleIds = rows.map((r) => String(r.id))
    const referenceUnitCosts = await resolveArticleReferenceUnitCostsByArticleId(
      supabase,
      popId,
      articleIds,
    )
    return {
      success: true,
      ingredients: mapRecipeIngredientRows(rows, referenceUnitCosts),
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function getRecipeIngredientOptionsByIds(
  popId: string,
  articleIds: string[],
): Promise<
  | { success: true; ingredients: RecipeIngredientOption[] }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver ingredientes." }
    }

    const ids = [...new Set(articleIds.map((id) => id.trim()).filter(Boolean))]
    if (ids.length === 0) {
      return { success: true, ingredients: [] }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("articles")
      .select("id, name, item_kind, unit_of_measure, default_waste_pct")
      .eq("pop_id", popId)
      .in("id", ids)
    if (error) return { success: false, error: error.message }

    const rows = (data ?? []) as Array<Record<string, unknown>>
    const referenceUnitCosts = await resolveArticleReferenceUnitCostsByArticleId(
      supabase,
      popId,
      ids,
    )
    return {
      success: true,
      ingredients: mapRecipeIngredientRows(rows, referenceUnitCosts),
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function getPopRecipesTable(
  popId: string,
  input: GetPopRecipesTableInput,
): Promise<
  | {
      success: true
      recipes: RecipeTableRow[]
      totalCount: number
      page: number
      popName: string
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
  | {
      success: false
      error: string
      redirect?: string
      recipes: RecipeTableRow[]
      totalCount: number
      page: number
      popName?: string
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
> {
  const empty = {
    recipes: [] as RecipeTableRow[],
    totalCount: 0,
    page: 1,
    canCreate: false,
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
    const perms = await recipePermissionFlags(popId)
    if (!perms.canRead) {
      return {
        success: false,
        error: "No tenés permiso para ver recetas en este punto de venta.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
        ...empty,
        popName: "",
      }
    }

    const pageSizeRaw = Number(input.pageSize)
    const pageSize = RECIPE_TABLE_PAGE_SIZES.includes(
      pageSizeRaw as (typeof RECIPE_TABLE_PAGE_SIZES)[number],
    )
      ? pageSizeRaw
      : DEFAULT_RECIPE_TABLE_PAGE_SIZE
    const pageRaw = Number(input.page)
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1
    const q = input.q?.trim() ?? ""
    const categoryId = input.categoryId?.trim() ?? ""

    const supabase = await createClient()
    const { data: popRow } = await supabase
      .from("pops")
      .select("name")
      .eq("id", popId)
      .maybeSingle()

    let query = supabase
      .from("recipes")
      .select(RECIPE_SELECT, { count: "exact" })
      .eq("pop_id", popId)

    if (input.soloActivos) query = query.eq("is_active", true)
    if (categoryId) query = query.eq("category_id", categoryId)
    if (q) {
      const escaped = q
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_")
        .replace(/,/g, " ")
      const pattern = `%${escaped}%`
      query = query.or(`name.ilike.${pattern},description.ilike.${pattern}`)
    }

    const from = (page - 1) * pageSize
    const listOrder = resolveWorkspaceTableListOrder(
      { sort: input.sort ?? null, ord: input.ord ?? "asc" },
      RECIPE_LIST_SORT,
    )
    const { data, error, count } = await query
      .order(listOrder.column, { ascending: listOrder.ascending })
      .range(from, from + pageSize - 1)

    if (error) {
      return {
        success: false,
        error: error.message,
        ...empty,
        page,
        popName: String(popRow?.name ?? ""),
        canCreate: perms.canCreate,
        canUpdate: perms.canUpdate,
        canDelete: perms.canDelete,
      }
    }

    const recipeIds = (data ?? []).map((r) => String(r.id))
    const ingredientCounts = new Map<string, number>()
    if (recipeIds.length > 0) {
      const { data: ingRows } = await supabase
        .from("recipe_ingredients")
        .select("recipe_id")
        .eq("pop_id", popId)
        .in("recipe_id", recipeIds)
      for (const row of ingRows ?? []) {
        const id = String(row.recipe_id)
        ingredientCounts.set(id, (ingredientCounts.get(id) ?? 0) + 1)
      }
    }

    const recipes = (data ?? []).map((row) =>
      mapRecipeTableRow(
        row as Record<string, unknown>,
        ingredientCounts.get(String(row.id)) ?? 0,
      ),
    )

    return {
      success: true,
      recipes,
      totalCount: count ?? recipes.length,
      page,
      popName: String(popRow?.name ?? ""),
      canCreate: perms.canCreate,
      canUpdate: perms.canUpdate,
      canDelete: perms.canDelete,
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
      ...empty,
    }
  }
}

export async function getPopRecipeDetail(
  popId: string,
  recipeId: string,
): Promise<
  | { success: true; recipe: RecipeDetail }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver recetas." }
    }
    if (!isUuid(recipeId)) return { success: false, error: "Receta inválida." }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("recipes")
      .select(RECIPE_SELECT)
      .eq("id", recipeId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (error || !data) {
      return { success: false, error: error?.message || "Receta no encontrada." }
    }

    const { data: ingData, error: ingErr } = await supabase
      .from("recipe_ingredients")
      .select(INGREDIENT_SELECT)
      .eq("recipe_id", recipeId)
      .eq("pop_id", popId)
      .order("sort_order", { ascending: true })
    if (ingErr) return { success: false, error: ingErr.message }

    const ingredientArticleIds = (ingData ?? [])
      .map((r) => {
        const art = (r as Record<string, unknown>).articles as
          | Record<string, unknown>
          | null
        return art?.id ? String(art.id) : null
      })
      .filter((id): id is string => id != null)
    const referenceUnitCosts = await resolveArticleReferenceUnitCostsByArticleId(
      supabase,
      popId,
      ingredientArticleIds,
    )
    const ingredients = (ingData ?? [])
      .map((r) =>
        mapIngredientRow(r as Record<string, unknown>, referenceUnitCosts),
      )
      .filter((r): r is RecipeIngredientRow => r != null)

    return {
      success: true,
      recipe: {
        ...mapRecipeTableRow(data as Record<string, unknown>, ingredients.length),
        ingredients,
      },
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function createPopRecipe(
  popId: string,
  input: CreateRecipeInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canCreate) {
      return { success: false, error: "Sin permiso para crear recetas." }
    }

    const validation = validateRecipeInput(input)
    if (!validation.ok) return { success: false, error: validation.error }

    const supabase = await createClient()
    const { data: catRow } = await supabase
      .from("recipe_categories")
      .select("id")
      .eq("id", input.categoryId.trim())
      .eq("pop_id", popId)
      .eq("is_active", true)
      .maybeSingle()
    if (!catRow?.id) {
      return { success: false, error: "Categoría inválida." }
    }

    const loaded = await loadIngredientArticles(supabase, popId, input.ingredients)
    if (!loaded.ok) return { success: false, error: loaded.error }

    const costPrice = computeRecipeCostPrice(
      loaded.rows.map((r) => ({
        quantity: r.quantity,
        wastePct: r.wastePct,
        articleCostPrice: r.costPrice,
        articleDefaultWastePct: r.defaultWastePct,
      })),
    )

    const imageUrl = input.imageUrl.trim()
    const { data: created, error } = await supabase
      .from("recipes")
      .insert({
        pop_id: popId,
        category_id: input.categoryId.trim(),
        name: input.name.trim(),
        description: input.description.trim(),
        sale_price: roundMoney(Number(input.salePrice)),
        cost_price: costPrice,
        iva: Number(input.iva),
        image_url: imageUrl ? imageUrl : null,
        is_active: input.isActive,
        allow_negative_stock: Boolean(input.allowNegativeStock),
      })
      .select("id")
      .single()

    if (error || !created?.id) {
      return { success: false, error: error?.message || "No se pudo crear la receta." }
    }

    const recipeId = String(created.id)
    const sync = await syncRecipeIngredients(
      supabase,
      popId,
      recipeId,
      input.ingredients,
    )
    if (!sync.ok) {
      await supabase.from("recipes").delete().eq("id", recipeId).eq("pop_id", popId)
      return { success: false, error: sync.error }
    }

    const syncLists = await syncItemPriceListAmounts(
      supabase,
      popId,
      "recipe",
      recipeId,
      input.listPrices ?? [],
    )
    if (!syncLists.ok) {
      await supabase.from("recipes").delete().eq("id", recipeId).eq("pop_id", popId)
      return { success: false, error: syncLists.error }
    }

    return { success: true, id: recipeId }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function updatePopRecipe(
  popId: string,
  recipeId: string,
  input: UpdateRecipeInput,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canUpdate) {
      return { success: false, error: "Sin permiso para editar recetas." }
    }
    if (!isUuid(recipeId)) return { success: false, error: "Receta inválida." }

    const validation = validateRecipeInput(input)
    if (!validation.ok) return { success: false, error: validation.error }

    const supabase = await createClient()
    const { data: existing } = await supabase
      .from("recipes")
      .select("id")
      .eq("id", recipeId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (!existing?.id) return { success: false, error: "Receta no encontrada." }

    const { data: catRow } = await supabase
      .from("recipe_categories")
      .select("id")
      .eq("id", input.categoryId.trim())
      .eq("pop_id", popId)
      .eq("is_active", true)
      .maybeSingle()
    if (!catRow?.id) {
      return { success: false, error: "Categoría inválida." }
    }

    const loaded = await loadIngredientArticles(supabase, popId, input.ingredients)
    if (!loaded.ok) return { success: false, error: loaded.error }

    const costPrice = computeRecipeCostPrice(
      loaded.rows.map((r) => ({
        quantity: r.quantity,
        wastePct: r.wastePct,
        articleCostPrice: r.costPrice,
        articleDefaultWastePct: r.defaultWastePct,
      })),
    )

    const imageUrl = input.imageUrl.trim()
    const { error } = await supabase
      .from("recipes")
      .update({
        category_id: input.categoryId.trim(),
        name: input.name.trim(),
        description: input.description.trim(),
        sale_price: roundMoney(Number(input.salePrice)),
        cost_price: costPrice,
        iva: Number(input.iva),
        image_url: imageUrl ? imageUrl : null,
        is_active: input.isActive,
        allow_negative_stock: Boolean(input.allowNegativeStock),
      })
      .eq("id", recipeId)
      .eq("pop_id", popId)

    if (error) return { success: false, error: error.message }

    const sync = await syncRecipeIngredients(
      supabase,
      popId,
      recipeId,
      input.ingredients,
    )
    if (!sync.ok) return { success: false, error: sync.error }

    const syncLists = await syncItemPriceListAmounts(
      supabase,
      popId,
      "recipe",
      recipeId,
      input.listPrices ?? [],
    )
    if (!syncLists.ok) return { success: false, error: syncLists.error }

    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function deletePopRecipe(
  popId: string,
  recipeId: string,
  confirmPhrase: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await recipePermissionFlags(popId)
    if (!perms.canDelete) {
      return { success: false, error: "Sin permiso para eliminar recetas." }
    }
    if (!isUuid(recipeId)) return { success: false, error: "Receta inválida." }

    const supabase = await createClient()
    const { data: recipe, error: fetchError } = await supabase
      .from("recipes")
      .select("name")
      .eq("id", recipeId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (fetchError) {
      return {
        success: false,
        error: fetchError.message || "No se encontró la receta.",
      }
    }
    if (!recipe) {
      return { success: false, error: "No se encontró la receta." }
    }

    const expectedPhrase = recipeDeleteConfirmPhrase(String(recipe.name ?? ""))
    if (confirmPhrase.trim() !== expectedPhrase) {
      return {
        success: false,
        error: `Escribí (${expectedPhrase}) para confirmar el borrado.`,
      }
    }

    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", recipeId)
      .eq("pop_id", popId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function uploadRecipeImage(
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
        POP_PERMS.RECIPE_CREATE.resource,
        POP_PERMS.RECIPE_CREATE.action,
      ) ||
      permissionKeysInclude(
        snap.keys,
        POP_PERMS.RECIPE_UPDATE.resource,
        POP_PERMS.RECIPE_UPDATE.action,
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

    const fileName = buildRecipeImageFileName()
    const storagePath = buildRecipeImageStoragePath(popId, fileName)
    const bytes = Buffer.from(await raw.arrayBuffer())

    const supabase = await createClient()
    const { error: uploadError } = await supabase.storage
      .from(RECIPE_IMAGE_STORAGE_BUCKET)
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
      .from(RECIPE_IMAGE_STORAGE_BUCKET)
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
