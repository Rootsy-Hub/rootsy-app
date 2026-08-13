"use server"

import { serviceDeleteConfirmPhrase } from "@/app/[siteId]/[popId]/services/serviceConstants"
import {
  DEFAULT_SERVICE_TABLE_PAGE_SIZE,
  SERVICE_TABLE_PAGE_SIZES,
} from "@/app/[siteId]/[popId]/services/workspaceUrl"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import { popMenuHref } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import {
  billingPeriodDisplayLabel,
  isServiceBillingPeriod,
  isServiceDiscountMode,
  isServiceLateInterestType,
  isServicePaymentTiming,
  normalizeServiceDetailsGrid,
  parseServiceDetailsGrid,
  serviceDetailsGridHasContent,
  type ServiceBillingPeriod,
  type ServiceDetailsGrid,
  type ServiceDiscountMode,
  type ServiceLateInterestType,
  type ServicePaymentTiming,
} from "@/lib/serviceCatalogTypes"
import {
  ARTICLE_IMAGE_STORAGE_BUCKET,
} from "@/lib/articleImageStorage"
import {
  buildServiceImageFileName,
  buildServiceImageStoragePath,
} from "@/lib/serviceImageStorage"
import {
  isArticleItemKind,
  normalizeStoredUnitOfMeasure,
  type ArticleItemKind,
} from "@/lib/articleItemKind"
import { resolveWorkspaceTableListOrder } from "@/lib/workspaceTableSort"
import { createClient } from "@/utils/supabase/server"

export type ServiceCategoryOption = {
  id: string
  name: string
  kind: "fijo" | "variable"
  sortOrder: number
}

export type ServiceArticleOption = {
  id: string
  name: string
  itemKind: ArticleItemKind
  unitOfMeasure: string
}

export type ServiceArticleInput = {
  articleId: string
  quantity: number
}

export type ServiceAddonInput = {
  name: string
  price: number
  articles: ServiceArticleInput[]
}

export type ServiceAddonRow = Omit<ServiceAddonInput, "articles"> & {
  id: string
  sortOrder: number
  articles: ServiceArticleRow[]
}

export type ServiceArticleRow = ServiceArticleInput & {
  id: string
  articleName: string
  unitOfMeasure: string
  itemKind: ArticleItemKind
}

export type ServiceTableRow = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  categoryId: string | null
  categoryName: string
  defaultPrice: number
  billingPeriod: ServiceBillingPeriod
  billingPeriodLabel: string | null
  billingPeriodDisplay: string
  detailCount: number
  contractHasText: boolean
  articleCount: number
  isActive: boolean
}

export type ServiceDetail = ServiceTableRow & {
  detailsGrid: ServiceDetailsGrid
  contractText: string
  paymentTiming: ServicePaymentTiming
  dueDaysAfter: number
  lateInterestType: ServiceLateInterestType
  lateInterestValue: number | null
  discountMode: ServiceDiscountMode
  discountValue: number | null
  articles: ServiceArticleRow[]
  addons: ServiceAddonRow[]
}

export type UpsertServiceInput = {
  name: string
  description: string
  categoryId: string
  imageUrl: string
  defaultPrice: number
  billingPeriod: ServiceBillingPeriod
  billingPeriodLabel: string
  detailsGrid: ServiceDetailsGrid
  contractText: string
  paymentTiming: ServicePaymentTiming
  dueDaysAfter: number
  lateInterestType: ServiceLateInterestType
  lateInterestValue: number | null
  discountMode: ServiceDiscountMode
  discountValue: number | null
  articles: ServiceArticleInput[]
  addons: ServiceAddonInput[]
  isActive: boolean
}

export type GetPopServicesTableInput = {
  q?: string
  page?: number
  pageSize?: number
  soloActivos?: boolean
  categoryId?: string
  sort?: string | null
  ord?: "asc" | "desc"
}

const SERVICE_LIST_SORT = {
  allowed: {
    name: "name",
    default_price: "default_price",
    billing_period: "billing_period",
  },
  defaultColumn: "name" as const,
  defaultAscending: true,
}

const SERVICE_SELECT = `
  id,
  pop_id,
  category_id,
  name,
  description,
  image_url,
  default_price,
  billing_period,
  billing_period_label,
  details_grid,
  contract_text,
  payment_timing,
  due_days_after,
  late_interest_type,
  late_interest_value,
  discount_mode,
  discount_value,
  is_active,
  service_categories ( name )
`

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  )
}

async function servicePermissionFlags(popId: string) {
  const snap = await loadPopPermissionsSnapshot(popId)
  return {
    canRead: permissionKeysInclude(
      snap.keys,
      POP_PERMS.SERVICE_READ.resource,
      POP_PERMS.SERVICE_READ.action,
    ),
    canCreate: permissionKeysInclude(
      snap.keys,
      POP_PERMS.SERVICE_CREATE.resource,
      POP_PERMS.SERVICE_CREATE.action,
    ),
    canUpdate: permissionKeysInclude(
      snap.keys,
      POP_PERMS.SERVICE_UPDATE.resource,
      POP_PERMS.SERVICE_UPDATE.action,
    ),
    canDelete: permissionKeysInclude(
      snap.keys,
      POP_PERMS.SERVICE_DELETE.resource,
      POP_PERMS.SERVICE_DELETE.action,
    ),
  }
}

function mapServiceTableRow(row: Record<string, unknown>): ServiceTableRow {
  const cat = row.service_categories as { name?: string } | null
  const billingPeriodRaw = String(row.billing_period ?? "monthly")
  const billingPeriod: ServiceBillingPeriod = isServiceBillingPeriod(
    billingPeriodRaw,
  )
    ? billingPeriodRaw
    : "monthly"
  const billingPeriodLabel =
    typeof row.billing_period_label === "string" &&
    row.billing_period_label.trim()
      ? row.billing_period_label.trim()
      : null
  const detailsGrid = parseServiceDetailsGrid(row.details_grid)
  const contractText =
    typeof row.contract_text === "string" ? row.contract_text.trim() : ""
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    imageUrl:
      typeof row.image_url === "string" && row.image_url.trim()
        ? row.image_url.trim()
        : null,
    categoryId: row.category_id ? String(row.category_id) : null,
    categoryName: cat?.name ? String(cat.name) : "—",
    defaultPrice: Number(row.default_price ?? 0) || 0,
    billingPeriod,
    billingPeriodLabel,
    billingPeriodDisplay: billingPeriodDisplayLabel(
      billingPeriod,
      billingPeriodLabel,
    ),
    detailCount: serviceDetailsGridHasContent(detailsGrid)
      ? detailsGrid.rows.length
      : 0,
    contractHasText: contractText.length > 0,
    articleCount: 0,
    isActive: Boolean(row.is_active),
  }
}

async function loadServiceTypeArticles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  serviceTypeId: string,
): Promise<ServiceArticleRow[]> {
  const { data, error } = await supabase
    .from("service_type_articles")
    .select(
      `
      id,
      article_id,
      quantity,
      articles ( name, item_kind, unit_of_measure )
    `,
    )
    .eq("pop_id", popId)
    .eq("service_type_id", serviceTypeId)
    .order("sort_order", { ascending: true })
  if (error) return []
  return (data ?? []).map((row) => {
    const article = row.articles as {
      name?: string
      item_kind?: string
      unit_of_measure?: string
    } | null
    const rawKind = String(article?.item_kind ?? "raw_material")
    const itemKind = isArticleItemKind(rawKind) ? rawKind : "raw_material"
    const unitOfMeasure = normalizeStoredUnitOfMeasure(
      String(article?.unit_of_measure ?? "u"),
      "u",
    )
    return {
      id: String(row.id),
      articleId: String(row.article_id),
      articleName: String(article?.name ?? "—"),
      quantity: Number(row.quantity ?? 0) || 0,
      unitOfMeasure,
      itemKind,
    }
  })
}

function mapServiceDetail(
  row: Record<string, unknown>,
  articles: ServiceArticleRow[],
): ServiceDetail {
  const base = mapServiceTableRow(row)
  const lateInterestRaw = String(row.late_interest_type ?? "none")
  const lateInterestType: ServiceLateInterestType = isServiceLateInterestType(
    lateInterestRaw,
  )
    ? lateInterestRaw
    : "none"
  const discountModeRaw = String(row.discount_mode ?? "none")
  const discountMode: ServiceDiscountMode = isServiceDiscountMode(discountModeRaw)
    ? discountModeRaw
    : "none"
  const paymentTimingRaw = String(row.payment_timing ?? "end_of_period")
  const paymentTiming: ServicePaymentTiming = isServicePaymentTiming(
    paymentTimingRaw,
  )
    ? paymentTimingRaw
    : "end_of_period"
  const dueDaysAfterRaw = row.due_days_after
  const dueDaysAfter =
    dueDaysAfterRaw == null || dueDaysAfterRaw === ""
      ? 0
      : Number(dueDaysAfterRaw)
  const lateInterestValueRaw = row.late_interest_value
  const lateInterestValue =
    lateInterestValueRaw == null || lateInterestValueRaw === ""
      ? null
      : Number(lateInterestValueRaw)
  const discountValueRaw = row.discount_value
  const discountValue =
    discountValueRaw == null || discountValueRaw === ""
      ? null
      : Number(discountValueRaw)
  return {
    ...base,
    articleCount: articles.length,
    detailsGrid: parseServiceDetailsGrid(row.details_grid),
    contractText:
      typeof row.contract_text === "string" ? row.contract_text : "",
    paymentTiming,
    dueDaysAfter:
      Number.isFinite(dueDaysAfter) && dueDaysAfter >= 0
        ? Math.min(365, Math.floor(dueDaysAfter))
        : 0,
    lateInterestType,
    lateInterestValue:
      lateInterestValue != null && Number.isFinite(lateInterestValue)
        ? lateInterestValue
        : null,
    discountMode,
    discountValue:
      discountValue != null && Number.isFinite(discountValue)
        ? discountValue
        : null,
    articles,
    addons: [],
  }
}

async function syncServiceTypeArticles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  serviceTypeId: string,
  articles: ServiceArticleInput[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error: deleteError } = await supabase
    .from("service_type_articles")
    .delete()
    .eq("service_type_id", serviceTypeId)
    .eq("pop_id", popId)
  if (deleteError) return { ok: false, error: deleteError.message }

  const rows = articles
    .filter((line) => line.articleId.trim() && line.quantity > 0)
    .map((line, index) => ({
      pop_id: popId,
      service_type_id: serviceTypeId,
      article_id: line.articleId.trim(),
      quantity: line.quantity,
      sort_order: index,
    }))
  if (rows.length === 0) return { ok: true }

  const { error: insertError } = await supabase
    .from("service_type_articles")
    .insert(rows)
  if (insertError) return { ok: false, error: insertError.message }
  return { ok: true }
}

async function loadServiceTypeAddonArticles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  addonIds: string[],
): Promise<Map<string, ServiceArticleRow[]>> {
  const byAddon = new Map<string, ServiceArticleRow[]>()
  if (addonIds.length === 0) return byAddon

  const { data, error } = await supabase
    .from("service_type_addon_articles")
    .select(
      `
      id,
      addon_id,
      article_id,
      quantity,
      sort_order,
      articles ( name, item_kind, unit_of_measure )
    `,
    )
    .eq("pop_id", popId)
    .in("addon_id", addonIds)
    .order("sort_order", { ascending: true })
  if (error) return byAddon

  for (const row of data ?? []) {
    const addonId = String(row.addon_id)
    const article = row.articles as {
      name?: string
      item_kind?: string
      unit_of_measure?: string
    } | null
    const rawKind = String(article?.item_kind ?? "raw_material")
    const itemKind = isArticleItemKind(rawKind) ? rawKind : "raw_material"
    const unitOfMeasure = normalizeStoredUnitOfMeasure(
      String(article?.unit_of_measure ?? "u"),
      "u",
    )
    const line: ServiceArticleRow = {
      id: String(row.id),
      articleId: String(row.article_id),
      articleName: String(article?.name ?? "—"),
      quantity: Number(row.quantity ?? 0) || 0,
      unitOfMeasure,
      itemKind,
    }
    const current = byAddon.get(addonId) ?? []
    current.push(line)
    byAddon.set(addonId, current)
  }
  return byAddon
}

async function loadServiceTypeAddons(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  serviceTypeId: string,
): Promise<ServiceAddonRow[]> {
  const { data, error } = await supabase
    .from("service_type_addons")
    .select("id, name, price, sort_order")
    .eq("pop_id", popId)
    .eq("service_type_id", serviceTypeId)
    .order("sort_order", { ascending: true })
  if (error || !data?.length) return []

  const addonIds = data.map((row) => String(row.id))
  const articlesByAddon = await loadServiceTypeAddonArticles(
    supabase,
    popId,
    addonIds,
  )

  return data.map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ""),
    price: Number(row.price ?? 0) || 0,
    sortOrder: Number(row.sort_order ?? 0) || 0,
    articles: articlesByAddon.get(String(row.id)) ?? [],
  }))
}

async function syncServiceTypeAddons(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  serviceTypeId: string,
  addons: ServiceAddonInput[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error: deleteError } = await supabase
    .from("service_type_addons")
    .delete()
    .eq("service_type_id", serviceTypeId)
    .eq("pop_id", popId)
  if (deleteError) return { ok: false, error: deleteError.message }

  const rows = addons
    .map((addon) => ({
      name: addon.name.trim(),
      price: addon.price,
      articles: addon.articles.filter(
        (line) => line.articleId.trim() && line.quantity > 0,
      ),
    }))
    .filter((addon) => addon.name.length > 0)

  for (let index = 0; index < rows.length; index += 1) {
    const addon = rows[index]
    const { data, error } = await supabase
      .from("service_type_addons")
      .insert({
        pop_id: popId,
        service_type_id: serviceTypeId,
        name: addon.name,
        price: addon.price,
        sort_order: index,
      })
      .select("id")
      .single()
    if (error || !data?.id) {
      return {
        ok: false,
        error: error?.message || "No se pudieron guardar los adicionales.",
      }
    }

    const articleRows = addon.articles.map((line, articleIndex) => ({
      pop_id: popId,
      addon_id: String(data.id),
      article_id: line.articleId.trim(),
      quantity: line.quantity,
      sort_order: articleIndex,
    }))
    if (articleRows.length === 0) continue

    const { error: insertArticlesError } = await supabase
      .from("service_type_addon_articles")
      .insert(articleRows)
    if (insertArticlesError) {
      return { ok: false, error: insertArticlesError.message }
    }
  }

  return { ok: true }
}

function validateServiceInput(
  input: UpsertServiceInput,
): { ok: true } | { ok: false; error: string } {
  const name = input.name.trim()
  if (!name) return { ok: false, error: "Indicá el nombre del servicio." }
  if (name.length > 200) {
    return { ok: false, error: "El nombre no puede superar 200 caracteres." }
  }
  const categoryId = input.categoryId.trim()
  if (!categoryId) return { ok: false, error: "Elegí una categoría." }
  if (!isUuid(categoryId)) return { ok: false, error: "Categoría inválida." }
  const defaultPrice = Number(input.defaultPrice)
  if (!Number.isFinite(defaultPrice) || defaultPrice < 0) {
    return { ok: false, error: "Precio inválido." }
  }
  if (!isServiceBillingPeriod(input.billingPeriod)) {
    return { ok: false, error: "Período de cobro inválido." }
  }
  if (
    input.billingPeriod === "custom" &&
    !input.billingPeriodLabel.trim()
  ) {
    return {
      ok: false,
      error: "Indicá la etiqueta del período personalizado.",
    }
  }
  if (
    !Number.isFinite(input.dueDaysAfter) ||
    input.dueDaysAfter < 0 ||
    input.dueDaysAfter > 365
  ) {
    return {
      ok: false,
      error: "Los días de vencimiento deben estar entre 0 y 365.",
    }
  }
  if (!isServicePaymentTiming(input.paymentTiming)) {
    return { ok: false, error: "Momento de pago inválido." }
  }
  if (
    input.lateInterestType === "simple_percent" &&
    (input.lateInterestValue == null ||
      !Number.isFinite(input.lateInterestValue) ||
      input.lateInterestValue <= 0)
  ) {
    return { ok: false, error: "Indicá un interés por mora válido." }
  }
  if (
    input.discountMode === "porcentaje" &&
    input.discountValue != null &&
    (input.discountValue <= 0 || input.discountValue > 100)
  ) {
    return { ok: false, error: "El descuento porcentual debe ser entre 1 y 100." }
  }
  if (
    input.discountMode === "fijo" &&
    input.discountValue != null &&
    input.discountValue <= 0
  ) {
    return { ok: false, error: "Indicá un descuento fijo válido." }
  }
  for (const line of input.articles) {
    if (!isUuid(line.articleId)) {
      return { ok: false, error: "Artículo inválido en la composición." }
    }
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
      return { ok: false, error: "Cantidad inválida en artículos del servicio." }
    }
  }
  for (const addon of input.addons) {
    if (!addon.name.trim()) {
      return { ok: false, error: "Indicá el nombre de cada adicional." }
    }
    if (!Number.isFinite(addon.price) || addon.price < 0) {
      return { ok: false, error: "Precio inválido en un adicional." }
    }
    for (const line of addon.articles) {
      if (!isUuid(line.articleId)) {
        return { ok: false, error: "Artículo inválido en un adicional." }
      }
      if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
        return { ok: false, error: "Cantidad inválida en artículos de un adicional." }
      }
    }
  }
  return { ok: true }
}

async function assertCategoryBelongsToPop(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  categoryId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("id")
    .eq("id", categoryId)
    .eq("pop_id", popId)
    .is("deleted_at", null)
    .maybeSingle()
  if (error) return { ok: false, error: error.message }
  if (!data?.id) {
    return { ok: false, error: "La categoría no existe en este punto de venta." }
  }
  return { ok: true }
}

export async function getPopServiceCategories(popId: string): Promise<
  | { success: true; categories: ServiceCategoryOption[] }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await servicePermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver servicios." }
    }
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("service_categories")
      .select("id, name, kind, sort_order")
      .eq("pop_id", popId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
    if (error) return { success: false, error: error.message }
    return {
      success: true,
      categories: (data ?? []).map((r) => ({
        id: String(r.id),
        name: String(r.name ?? ""),
        kind: String(r.kind ?? "variable") === "fijo" ? "fijo" : "variable",
        sortOrder: Number(r.sort_order ?? 0) || 0,
      })),
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function createServiceCategory(
  popId: string,
  nameRaw: string,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await servicePermissionFlags(popId)
    if (!perms.canCreate) {
      return { success: false, error: "Sin permiso para crear categorías." }
    }
    const name = nameRaw.trim()
    if (!name) return { success: false, error: "Indicá el nombre de la categoría." }
    const supabase = await createClient()
    const { data: maxRow } = await supabase
      .from("service_categories")
      .select("sort_order")
      .eq("pop_id", popId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle()
    const sortOrder = (Number(maxRow?.sort_order ?? -1) || -1) + 1
    const { data, error } = await supabase
      .from("service_categories")
      .insert({
        pop_id: popId,
        name,
        kind: "variable",
        sort_order: sortOrder,
      })
      .select("id")
      .single()
    if (error || !data?.id) {
      return {
        success: false,
        error: error?.message || "No se pudo crear la categoría.",
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

export async function updateServiceCategory(
  popId: string,
  categoryId: string,
  nameRaw: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await servicePermissionFlags(popId)
    if (!perms.canUpdate) {
      return { success: false, error: "Sin permiso para editar categorías." }
    }
    if (!isUuid(categoryId)) return { success: false, error: "Categoría inválida." }
    const name = nameRaw.trim()
    if (!name) return { success: false, error: "Indicá el nombre de la categoría." }
    const supabase = await createClient()
    const { error } = await supabase
      .from("service_categories")
      .update({ name })
      .eq("id", categoryId)
      .eq("pop_id", popId)
      .is("deleted_at", null)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function deleteServiceCategory(
  popId: string,
  categoryId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await servicePermissionFlags(popId)
    if (!perms.canDelete) {
      return { success: false, error: "Sin permiso para eliminar categorías." }
    }
    if (!isUuid(categoryId)) return { success: false, error: "Categoría inválida." }
    const supabase = await createClient()
    const { count, error: countError } = await supabase
      .from("service_types")
      .select("id", { count: "exact", head: true })
      .eq("pop_id", popId)
      .eq("category_id", categoryId)
      .is("deleted_at", null)
    if (countError) return { success: false, error: countError.message }
    if ((count ?? 0) > 0) {
      return {
        success: false,
        error: "No podés eliminar una categoría con servicios asignados.",
      }
    }
    const { error } = await supabase
      .from("service_categories")
      .update({ deleted_at: new Date().toISOString() })
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

export async function getPopServicesTable(
  popId: string,
  input: GetPopServicesTableInput = {},
): Promise<
  | {
      success: true
      services: ServiceTableRow[]
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
      services: ServiceTableRow[]
      totalCount: number
      page: number
      popName: string
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
> {
  const empty = {
    services: [] as ServiceTableRow[],
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
    const perms = await servicePermissionFlags(popId)
    if (!perms.canRead) {
      return {
        success: false,
        error: "No tenés permiso para ver servicios en este punto de venta.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
        ...empty,
        popName: "",
      }
    }

    const pageSizeRaw = Number(input.pageSize)
    const pageSize = SERVICE_TABLE_PAGE_SIZES.includes(
      pageSizeRaw as (typeof SERVICE_TABLE_PAGE_SIZES)[number],
    )
      ? pageSizeRaw
      : DEFAULT_SERVICE_TABLE_PAGE_SIZE
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
      .from("service_types")
      .select(SERVICE_SELECT, { count: "exact" })
      .eq("pop_id", popId)
      .is("deleted_at", null)

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
      SERVICE_LIST_SORT,
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

    const services = (data ?? []).map((row) =>
      mapServiceTableRow(row as Record<string, unknown>),
    )

    return {
      success: true,
      services,
      totalCount: count ?? services.length,
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
      popName: "",
    }
  }
}

export async function getPopServiceDetail(
  popId: string,
  serviceId: string,
): Promise<
  | { success: true; service: ServiceDetail }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await servicePermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver servicios." }
    }
    if (!isUuid(serviceId)) return { success: false, error: "Servicio inválido." }
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("service_types")
      .select(SERVICE_SELECT)
      .eq("id", serviceId)
      .eq("pop_id", popId)
      .is("deleted_at", null)
      .maybeSingle()
    if (error) return { success: false, error: error.message }
    if (!data) return { success: false, error: "No se encontró el servicio." }
    const articles = await loadServiceTypeArticles(supabase, popId, serviceId)
    const addons = await loadServiceTypeAddons(supabase, popId, serviceId)
    return {
      success: true,
      service: {
        ...mapServiceDetail(data as Record<string, unknown>, articles),
        addons,
      },
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function createPopService(
  popId: string,
  input: UpsertServiceInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await servicePermissionFlags(popId)
    if (!perms.canCreate) {
      return { success: false, error: "Sin permiso para crear servicios." }
    }
    const validation = validateServiceInput(input)
    if (!validation.ok) return { success: false, error: validation.error }

    const supabase = await createClient()
    const categoryCheck = await assertCategoryBelongsToPop(
      supabase,
      popId,
      input.categoryId.trim(),
    )
    if (!categoryCheck.ok) return { success: false, error: categoryCheck.error }

    const detailsGrid = normalizeServiceDetailsGrid(input.detailsGrid)

    const { data, error } = await supabase
      .from("service_types")
      .insert({
        pop_id: popId,
        category_id: input.categoryId.trim(),
        name: input.name.trim(),
        description: input.description.trim(),
        image_url: input.imageUrl.trim() || null,
        default_price: input.defaultPrice,
        billing_period: input.billingPeriod,
        billing_period_label:
          input.billingPeriod === "custom"
            ? input.billingPeriodLabel.trim()
            : null,
        details_grid: detailsGrid,
        contract_text: input.contractText.trim(),
        payment_timing: input.paymentTiming,
        due_days_after: input.dueDaysAfter,
        late_interest_type: input.lateInterestType,
        late_interest_value:
          input.lateInterestType === "simple_percent"
            ? input.lateInterestValue
            : null,
        discount_mode: input.discountMode,
        discount_value:
          input.discountMode === "none" ? null : input.discountValue,
        is_active: input.isActive,
      })
      .select("id")
      .single()

    if (error || !data?.id) {
      return {
        success: false,
        error: error?.message || "No se pudo crear el servicio.",
      }
    }
    const serviceId = String(data.id)
    const articlesSync = await syncServiceTypeArticles(
      supabase,
      popId,
      serviceId,
      input.articles,
    )
    if (!articlesSync.ok) {
      return { success: false, error: articlesSync.error }
    }
    const addonsSync = await syncServiceTypeAddons(
      supabase,
      popId,
      serviceId,
      input.addons,
    )
    if (!addonsSync.ok) {
      return { success: false, error: addonsSync.error }
    }
    return { success: true, id: serviceId }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function updatePopService(
  popId: string,
  serviceId: string,
  input: UpsertServiceInput,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await servicePermissionFlags(popId)
    if (!perms.canUpdate) {
      return { success: false, error: "Sin permiso para editar servicios." }
    }
    if (!isUuid(serviceId)) return { success: false, error: "Servicio inválido." }
    const validation = validateServiceInput(input)
    if (!validation.ok) return { success: false, error: validation.error }

    const supabase = await createClient()
    const categoryCheck = await assertCategoryBelongsToPop(
      supabase,
      popId,
      input.categoryId.trim(),
    )
    if (!categoryCheck.ok) return { success: false, error: categoryCheck.error }

    const detailsGrid = normalizeServiceDetailsGrid(input.detailsGrid)

    const { error } = await supabase
      .from("service_types")
      .update({
        category_id: input.categoryId.trim(),
        name: input.name.trim(),
        description: input.description.trim(),
        image_url: input.imageUrl.trim() || null,
        default_price: input.defaultPrice,
        billing_period: input.billingPeriod,
        billing_period_label:
          input.billingPeriod === "custom"
            ? input.billingPeriodLabel.trim()
            : null,
        details_grid: detailsGrid,
        contract_text: input.contractText.trim(),
        payment_timing: input.paymentTiming,
        due_days_after: input.dueDaysAfter,
        late_interest_type: input.lateInterestType,
        late_interest_value:
          input.lateInterestType === "simple_percent"
            ? input.lateInterestValue
            : null,
        discount_mode: input.discountMode,
        discount_value:
          input.discountMode === "none" ? null : input.discountValue,
        is_active: input.isActive,
      })
      .eq("id", serviceId)
      .eq("pop_id", popId)
      .is("deleted_at", null)

    if (error) return { success: false, error: error.message }
    const articlesSync = await syncServiceTypeArticles(
      supabase,
      popId,
      serviceId,
      input.articles,
    )
    if (!articlesSync.ok) return { success: false, error: articlesSync.error }
    const addonsSync = await syncServiceTypeAddons(
      supabase,
      popId,
      serviceId,
      input.addons,
    )
    if (!addonsSync.ok) return { success: false, error: addonsSync.error }
    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function deletePopService(
  popId: string,
  serviceId: string,
  confirmPhrase: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await servicePermissionFlags(popId)
    if (!perms.canDelete) {
      return { success: false, error: "Sin permiso para eliminar servicios." }
    }
    if (!isUuid(serviceId)) return { success: false, error: "Servicio inválido." }

    const supabase = await createClient()
    const { data: service, error: fetchError } = await supabase
      .from("service_types")
      .select("name")
      .eq("id", serviceId)
      .eq("pop_id", popId)
      .is("deleted_at", null)
      .maybeSingle()
    if (fetchError) {
      return {
        success: false,
        error: fetchError.message || "No se encontró el servicio.",
      }
    }
    if (!service) {
      return { success: false, error: "No se encontró el servicio." }
    }

    const expectedPhrase = serviceDeleteConfirmPhrase(String(service.name ?? ""))
    if (confirmPhrase.trim() !== expectedPhrase) {
      return {
        success: false,
        error: `Escribí (${expectedPhrase}) para confirmar el borrado.`,
      }
    }

    const { error } = await supabase
      .from("service_types")
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq("id", serviceId)
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

export async function getServiceArticleOptions(
  popId: string,
  input: {
    query?: string
    limit?: number
    excludeIds?: string[]
  } = {},
): Promise<
  | { success: true; articles: ServiceArticleOption[] }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await servicePermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver artículos." }
    }

    const query = input.query?.trim() ?? ""
    if (!query) {
      return { success: true, articles: [] }
    }

    const limit = Math.min(Math.max(1, input.limit ?? 5), 20)
    const excludeIds = new Set(input.excludeIds ?? [])
    const pattern = `%${query.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")}%`

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("articles")
      .select("id, name, item_kind, unit_of_measure")
      .eq("pop_id", popId)
      .eq("is_active", true)
      .in("item_kind", ["raw_material", "supply", "merchandise"])
      .ilike("name", pattern)
      .order("name", { ascending: true })
      .limit(limit + excludeIds.size)
    if (error) return { success: false, error: error.message }

    const articles = (data ?? [])
      .map((row) => {
        const rawKind = String(row.item_kind ?? "raw_material")
        const itemKind = isArticleItemKind(rawKind) ? rawKind : "raw_material"
        const unitOfMeasure = normalizeStoredUnitOfMeasure(
          String(row.unit_of_measure ?? "u"),
          "u",
        )
        return {
          id: String(row.id),
          name: String(row.name ?? ""),
          itemKind,
          unitOfMeasure,
        }
      })
      .filter((row) => !excludeIds.has(row.id))
      .slice(0, limit)

    return { success: true, articles }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function uploadServiceImage(
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
        POP_PERMS.SERVICE_CREATE.resource,
        POP_PERMS.SERVICE_CREATE.action,
      ) ||
      permissionKeysInclude(
        snap.keys,
        POP_PERMS.SERVICE_UPDATE.resource,
        POP_PERMS.SERVICE_UPDATE.action,
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

    const fileName = buildServiceImageFileName()
    const storagePath = buildServiceImageStoragePath(popId, fileName)
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
