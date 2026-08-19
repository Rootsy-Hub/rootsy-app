"use server"

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
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { createClient } from "@/utils/supabase/server"
import { purchaseComprobanteAccruesInputVat } from "@/lib/purchaseComprobantePicker"
import {
  ARTICLE_ITEM_KINDS,
  ARTICLE_ITEM_KIND_STOCK_LABEL,
  isArticleItemKind,
  type ArticleItemKind,
} from "@/lib/articleItemKind"
import { activeArticleCostsByArticleIdForPop } from "@/lib/articleCostQueries"
import {
  OPERATE_CATALOG_PAGE_SIZE,
  sanitizeCatalogIlike,
  type OperateCatalogItemsFilter,
  type OperateCatalogItemsPage,
} from "@/lib/operateCatalogPage"
import {
  finalizePurchaseCheckout,
} from "@/lib/purchaseCheckoutLines"
import { resolvePurchaseCheckoutLine } from "@/app/[siteId]/[popId]/purchases/purchaseLineResolve"
import {
  derivePurchaseKindFromItemKinds,
  isPurchaseKind,
  type PurchaseKind,
} from "@/lib/purchaseKind"

export type { PurchaseKind } from "@/lib/purchaseKind"

export type PurchaseStatus =
  | "draft"
  | "pending"
  | "partial"
  | "paid"
  | "cancelled"
  | "voided"

export type SupplierOption = {
  id: string
  name: string
  taxId: string
}

export type PurchaseArticleOption = {
  id: string
  name: string
  iva: number
}

export type PurchaseCatalogArticleCost = {
  id: string
  name: string
  costUnitLabel: string
  saleUnitsPerCostUnit: number
  unitPrice: number
  supplierId: string | null
}

export type PurchaseListRow = {
  id: string
  purchaseKind: PurchaseKind
  status: PurchaseStatus
  documentNumber: string | null
  documentDate: string | null
  dueDate: string | null
  supplierId: string | null
  supplierName: string
  supplierTaxId: string | null
  total: number
  currency: string
  lineCount: number
  paidTotal: number
  createdAt: string
  receivedAt: string | null
}

export type CreatePurchaseLineInput = {
  articleId: string
  articleCostId: string
  /** Cantidad de unidades de costo (ej. maples). */
  costQuantity: number
  /** Precio por unidad de costo. */
  unitCost: number
  /** Si true, actualiza article_costs.unit_price al confirmar. */
  updateArticleCost?: boolean
  itemDiscountMode?: "porcentaje" | "fijo"
  itemDiscountDraft?: string
  comment?: string
  /** Vencimiento del lote (YYYY-MM-DD). Opcional. */
  expiresOn?: string | null
}

import { getTreasuryPaymentContext } from "@/lib/treasuryPaymentContext"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import type { CheckoutCheckDetails } from "@/lib/checkoutCheck"
import type { OperationPaymentKind } from "@/lib/operationPaymentKinds"
import { isValidOperationPaymentKind } from "@/lib/operationPaymentKinds"
import {
  deleteCheckoutCheck,
  insertCheckoutCheck,
  parseCheckoutCheckDetails,
  resolveCheckTreasuryAccountId,
} from "@/lib/checkoutCheck"

export type PurchaseCatalogPaymentOption = {
  kind: OperationPaymentKind
  treasuryAccountId: string
  label: string
  checkDetails?: CheckoutCheckDetails
}

/** @deprecated Usar PurchaseCatalogPaymentOption */
export type PurchaseCatalogPaymentMethod = PurchaseCatalogPaymentOption

export type PurchaseSupplierManualInput = {
  name: string
  taxId: string | null
}

export type CreatePurchaseInput = {
  supplierId: string | null
  /** Datos de proveedor solo para esta compra (sin crear registro en catálogo). */
  supplierManual?: PurchaseSupplierManualInput | null
  purchaseKind: PurchaseKind
  documentNumber?: string
  documentDate?: string
  dueDate?: string
  documentKind?: string | null
  attachmentFileName?: string | null
  notes?: string
  lines: CreatePurchaseLineInput[]
  /** Si true, la compra queda confirmada (pending) y admite pagos. */
  confirmPurchase?: boolean
  generalDiscountMode?: "porcentaje" | "fijo"
  generalDiscountValue?: number
  paymentKind?: string | null
  treasuryAccountId?: string | null
  checkDetails?: CheckoutCheckDetails | null
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function parseMoney(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return roundMoney(n)
}

function parseQty(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 1e6) / 1e6
}

function parseLineItems(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return []
  return raw
}

async function purchasesAccess(popId: string) {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { ok: false as const, error: access.error || "Sin acceso" }
  }
  const snap = await loadPopPermissionsSnapshot(popId)
  const canRead = permissionKeysInclude(
    snap.keys,
    POP_PERMS.OPERATIONS_READ.resource,
    POP_PERMS.OPERATIONS_READ.action,
  )
  if (!canRead) {
    return {
      ok: false as const,
      error: "No tenés permiso para ver compras en este punto de venta.",
      redirect: popMenuHref(await getPopSiteId(popId), popId),
    }
  }
  const canCreate = permissionKeysInclude(
    snap.keys,
    POP_PERMS.OPERATIONS_CREATE.resource,
    POP_PERMS.OPERATIONS_CREATE.action,
  )
  const canUpdate = permissionKeysInclude(
    snap.keys,
    POP_PERMS.OPERATIONS_UPDATE.resource,
    POP_PERMS.OPERATIONS_UPDATE.action,
  )
  const canDelete = permissionKeysInclude(
    snap.keys,
    POP_PERMS.OPERATIONS_DELETE.resource,
    POP_PERMS.OPERATIONS_DELETE.action,
  )
  const canUpdateArticles = permissionKeysInclude(
    snap.keys,
    POP_PERMS.ARTICLE_UPDATE.resource,
    POP_PERMS.ARTICLE_UPDATE.action,
  )
  return { ok: true as const, canCreate, canUpdate, canDelete, canUpdateArticles }
}

export type PurchaseCatalogSupplier = {
  id: string
  name: string
  taxId: string
}

export type PurchaseCatalogCategory = {
  id: string
  name: string
  itemKind: ArticleItemKind
}

export type PurchaseCatalogCategorySection = {
  id: ArticleItemKind
  label: string
  categories: PurchaseCatalogCategory[]
}

export type PurchaseCatalogArticle = {
  id: string
  name: string
  description: string
  iva: number
  categoryId: string
  categoryName: string
  itemKind: ArticleItemKind
  unitOfMeasure: string
  imageUrl: string | null
  costs: PurchaseCatalogArticleCost[]
}

export async function getPurchaseCatalog(
  popId: string,
  options?: { items?: "all" | "none" },
): Promise<
  | {
      success: true
      popName: string
      categories: PurchaseCatalogCategory[]
      categorySections: PurchaseCatalogCategorySection[]
      articles: PurchaseCatalogArticle[]
      suppliers: PurchaseCatalogSupplier[]
      treasuryPaymentContext: TreasuryPaymentContext | null
      canCreate: boolean
      canUpdateArticles: boolean
      canReadPaymentMethods: boolean
    }
  | { success: false; error: string }
> {
  try {
    const access = await purchasesAccess(popId)
    if (!access.ok) {
      return { success: false, error: access.error }
    }
    const supabase = await createClient()
    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""

    const { data: catRows, error: catErr } = await supabase
      .from("categories")
      .select("id, name, item_kind")
      .eq("pop_id", popId)
      .in("item_kind", [...ARTICLE_ITEM_KINDS])
      .order("name", { ascending: true })
    if (catErr) {
      return { success: false, error: catErr.message }
    }
    const categories: PurchaseCatalogCategory[] = (catRows || []).map((c) => {
      const rawKind = String(c.item_kind ?? "merchandise")
      return {
        id: String(c.id),
        name: String(c.name ?? ""),
        itemKind: isArticleItemKind(rawKind) ? rawKind : "merchandise",
      }
    })

    const loadItems = options?.items !== "none"
    const { data: artRows, error: artErr } = loadItems
      ? await supabase
          .from("articles")
          .select(
            `
        id,
        name,
        description,
        iva,
        category_id,
        item_kind,
        unit_of_measure,
        image_url,
        categories ( id, name )
      `,
          )
          .eq("pop_id", popId)
          .eq("is_active", true)
          .in("item_kind", [...ARTICLE_ITEM_KINDS])
          .order("name", { ascending: true })
      : { data: [], error: null }
    if (artErr) {
      return { success: false, error: artErr.message }
    }
    const costsByArticleId = loadItems
      ? await activeArticleCostsByArticleIdForPop(supabase, popId)
      : new Map<string, never[]>()
    const articles: PurchaseCatalogArticle[] = (artRows || []).map((row) => {
      const cat = row.categories as unknown as { name?: string } | null
      const rawKind = String(row.item_kind ?? "merchandise")
      const articleId = String(row.id)
      const costs: PurchaseCatalogArticleCost[] = (
        costsByArticleId.get(articleId) ?? []
      ).map((entry) => ({
        id: entry.id,
        name: entry.name,
        costUnitLabel: entry.costUnitLabel,
        saleUnitsPerCostUnit: entry.saleUnitsPerCostUnit,
        unitPrice: entry.unitPrice,
        supplierId: entry.supplierId,
      }))
      return {
        id: String(row.id),
        name: String(row.name ?? ""),
        description: String(row.description ?? ""),
        iva: parseMoney(row.iva),
        categoryId: String(row.category_id ?? ""),
        categoryName: cat?.name ? String(cat.name) : "—",
        itemKind: isArticleItemKind(rawKind) ? rawKind : "merchandise",
        unitOfMeasure: String(row.unit_of_measure ?? "unidad"),
        imageUrl:
          typeof row.image_url === "string" && row.image_url.trim()
            ? row.image_url.trim()
            : null,
        costs,
      }
    })

    const { data: supRows, error: supErr } = await supabase
      .from("suppliers")
      .select("id, name, tax_id")
      .eq("pop_id", popId)
      .order("name", { ascending: true })
    if (supErr) {
      return { success: false, error: supErr.message }
    }
    const suppliers: PurchaseCatalogSupplier[] = (supRows || []).map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ""),
      taxId: r.tax_id != null ? String(r.tax_id) : "",
    }))

    const canReadPaymentMethods = access.canCreate
    let treasuryPaymentContext: TreasuryPaymentContext | null = null
    if (canReadPaymentMethods) {
      const treasuryRes = await getTreasuryPaymentContext(popId)
      if (!treasuryRes.success) {
        return { success: false, error: treasuryRes.error }
      }
      treasuryPaymentContext = treasuryRes.context
    }

    const visibleCategoryIds = new Set(categories.map((c) => c.id))
    const visibleArticles = articles.filter(
      (article) =>
        article.categoryId !== "" && visibleCategoryIds.has(article.categoryId),
    )

    const categorySections: PurchaseCatalogCategorySection[] =
      ARTICLE_ITEM_KINDS.map((kind) => ({
        id: kind,
        label: ARTICLE_ITEM_KIND_STOCK_LABEL[kind],
        categories: categories.filter((category) => category.itemKind === kind),
      })).filter((section) => section.categories.length > 0)

    return {
      success: true,
      popName,
      categories,
      categorySections,
      articles: visibleArticles,
      suppliers,
      treasuryPaymentContext,
      canCreate: access.canCreate,
      canUpdateArticles: access.canUpdateArticles,
      canReadPaymentMethods,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

const PURCHASE_CATALOG_ARTICLE_SELECT = `
  id,
  name,
  description,
  iva,
  category_id,
  item_kind,
  unit_of_measure,
  image_url,
  categories ( id, name )
` as const

function mapPurchaseCatalogArticle(
  row: Record<string, unknown>,
  costsByArticleId: Map<
    string,
    Array<{
      id: string
      name: string
      costUnitLabel: string
      saleUnitsPerCostUnit: number
      unitPrice: number
      supplierId: string | null
    }>
  >,
): PurchaseCatalogArticle {
  const cat = row.categories as unknown as { name?: string } | null
  const rawKind = String(row.item_kind ?? "merchandise")
  const articleId = String(row.id)
  const costs: PurchaseCatalogArticleCost[] = (
    costsByArticleId.get(articleId) ?? []
  ).map((entry) => ({
    id: entry.id,
    name: entry.name,
    costUnitLabel: entry.costUnitLabel,
    saleUnitsPerCostUnit: entry.saleUnitsPerCostUnit,
    unitPrice: entry.unitPrice,
    supplierId: entry.supplierId,
  }))
  return {
    id: articleId,
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    iva: parseMoney(row.iva),
    categoryId: String(row.category_id ?? ""),
    categoryName: cat?.name ? String(cat.name) : "—",
    itemKind: isArticleItemKind(rawKind) ? rawKind : "merchandise",
    unitOfMeasure: String(row.unit_of_measure ?? "unidad"),
    imageUrl:
      typeof row.image_url === "string" && row.image_url.trim()
        ? row.image_url.trim()
        : null,
    costs,
  }
}

export async function getPurchaseCatalogItemsPage(
  popId: string,
  filter: OperateCatalogItemsFilter,
  offset = 0,
): Promise<
  | { success: true; page: OperateCatalogItemsPage<PurchaseCatalogArticle> }
  | { success: false; error: string }
> {
  try {
    const access = await purchasesAccess(popId)
    if (!access.ok) {
      return { success: false, error: access.error }
    }

    const supabase = await createClient()
    const search = sanitizeCatalogIlike(filter.search)
    const itemKind = isArticleItemKind(filter.section) ? filter.section : null

    let query = supabase
      .from("articles")
      .select(PURCHASE_CATALOG_ARTICLE_SELECT)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .in("item_kind", [...ARTICLE_ITEM_KINDS])
      .order("name", { ascending: true })
      .order("id", { ascending: true })

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    } else if (filter.categoryId && itemKind) {
      query = query.eq("category_id", filter.categoryId).eq("item_kind", itemKind)
    } else if (itemKind) {
      query = query.eq("item_kind", itemKind)
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
    const pageRows = rows.slice(0, OPERATE_CATALOG_PAGE_SIZE)
    const costsByArticleId = await activeArticleCostsByArticleIdForPop(
      supabase,
      popId,
      pageRows.map((row) => String(row.id)),
    )
    const items = pageRows.map((row) =>
      mapPurchaseCatalogArticle(row, costsByArticleId),
    )
    return {
      success: true,
      page: {
        items,
        nextOffset:
          rows.length > OPERATE_CATALOG_PAGE_SIZE
            ? from + OPERATE_CATALOG_PAGE_SIZE
            : null,
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getPurchaseCatalogArticlesByIds(
  popId: string,
  ids: string[],
): Promise<
  | { success: true; articles: PurchaseCatalogArticle[] }
  | { success: false; error: string }
> {
  try {
    const unique = [...new Set(ids.filter(Boolean))]
    if (unique.length === 0) return { success: true, articles: [] }
    const access = await purchasesAccess(popId)
    if (!access.ok) return { success: false, error: access.error }
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("articles")
      .select(PURCHASE_CATALOG_ARTICLE_SELECT)
      .eq("pop_id", popId)
      .in("id", unique)
    if (error) return { success: false, error: error.message }
    const rows = (data ?? []) as Record<string, unknown>[]
    const costsByArticleId = await activeArticleCostsByArticleIdForPop(
      supabase,
      popId,
      rows.map((row) => String(row.id)),
    )
    return {
      success: true,
      articles: rows.map((row) =>
        mapPurchaseCatalogArticle(row, costsByArticleId),
      ),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function findPurchaseCatalogArticleByScan(
  popId: string,
  rawQuery: string,
): Promise<
  | { success: true; article: PurchaseCatalogArticle | null }
  | { success: false; error: string }
> {
  try {
    const query = rawQuery.trim()
    if (!query) return { success: true, article: null }
    const access = await purchasesAccess(popId)
    if (!access.ok) {
      return { success: false, error: access.error }
    }
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("articles")
      .select(PURCHASE_CATALOG_ARTICLE_SELECT)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .in("item_kind", [...ARTICLE_ITEM_KINDS])
      .ilike("name", query)
      .limit(2)
    if (error) {
      return { success: false, error: error.message }
    }
    if ((data ?? []).length !== 1) {
      return { success: true, article: null }
    }
    const row = data![0] as Record<string, unknown>
    const costsByArticleId = await activeArticleCostsByArticleIdForPop(
      supabase,
      popId,
      [String(row.id)],
    )
    return {
      success: true,
      article: mapPurchaseCatalogArticle(row, costsByArticleId),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getPurchasesPageData(popId: string): Promise<
  | {
      success: true
      popName: string
      suppliers: SupplierOption[]
      articles: PurchaseArticleOption[]
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
  | { success: false; error: string; redirect?: string }
> {
  try {
    const access = await purchasesAccess(popId)
    if (!access.ok) {
      return {
        success: false,
        error: access.error,
        redirect: access.redirect,
      }
    }
    const supabase = await createClient()
    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""

    const suppliers: SupplierOption[] = []

    const { data: artRows, error: artErr } = await supabase
      .from("articles")
      .select("id, name, iva")
      .eq("pop_id", popId)
      .eq("is_active", true)
      .order("name", { ascending: true })
    if (artErr) {
      return {
        success: false,
        error: artErr.message || "No se pudieron cargar artículos.",
      }
    }
    const articles: PurchaseArticleOption[] = (artRows || []).map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ""),
      iva: parseMoney(r.iva),
    }))

    return {
      success: true,
      popName,
      suppliers,
      articles,
      canCreate: access.canCreate,
      canUpdate: access.canUpdate,
      canDelete: access.canDelete,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function listPurchases(popId: string): Promise<
  | { success: true; rows: PurchaseListRow[] }
  | { success: false; error: string }
> {
  try {
    const access = await purchasesAccess(popId)
    if (!access.ok) {
      return { success: false, error: access.error }
    }
    const supabase = await createClient()
    const { data: rows, error } = await supabase
      .from("purchases")
      .select(
        `
        id,
        purchase_kind,
        status,
        document_number,
        document_date,
        due_date,
        supplier_id,
        supplier_name,
        supplier_tax_id,
        total,
        currency,
        line_items,
        created_at,
        received_at,
        suppliers ( name, tax_id )
      `,
      )
      .eq("pop_id", popId)
      .order("created_at", { ascending: false })
      .limit(500)
    if (error) {
      return { success: false, error: error.message || "No se pudieron cargar compras." }
    }

    const list = rows || []
    const ids = list.map((r) => String(r.id))
    const paidByPurchase = new Map<string, number>()
    if (ids.length > 0) {
      const { data: payRows, error: payErr } = await supabase
        .from("purchase_payments")
        .select("purchase_id, amount")
        .eq("pop_id", popId)
        .in("purchase_id", ids)
      if (payErr) {
        return {
          success: false,
          error: payErr.message || "No se pudieron cargar pagos.",
        }
      }
      for (const p of payRows || []) {
        const pid = String(p.purchase_id)
        paidByPurchase.set(
          pid,
          roundMoney((paidByPurchase.get(pid) ?? 0) + parseMoney(p.amount)),
        )
      }
    }

    const out: PurchaseListRow[] = list.map((r) => {
      const sup = r.suppliers as { name?: string; tax_id?: string | null } | null
      const id = String(r.id)
      const supplierName =
        sup?.name?.trim() ||
        (r.supplier_name != null ? String(r.supplier_name) : "") ||
        "—"
      return {
        id,
        purchaseKind: String(r.purchase_kind ?? "merchandise") as PurchaseKind,
        status: String(r.status ?? "draft") as PurchaseStatus,
        documentNumber:
          r.document_number != null ? String(r.document_number) : null,
        documentDate:
          r.document_date != null ? String(r.document_date) : null,
        dueDate: r.due_date != null ? String(r.due_date) : null,
        supplierId: r.supplier_id != null ? String(r.supplier_id) : null,
        supplierName,
        supplierTaxId:
          sup?.tax_id != null
            ? String(sup.tax_id)
            : r.supplier_tax_id != null
              ? String(r.supplier_tax_id)
              : null,
        total: parseMoney(r.total),
        currency: String(r.currency ?? "ARS"),
        lineCount: parseLineItems(r.line_items).length,
        paidTotal: paidByPurchase.get(id) ?? 0,
        createdAt: String(r.created_at ?? ""),
        receivedAt: r.received_at != null ? String(r.received_at) : null,
      }
    })

    return { success: true, rows: out }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function createPurchase(
  popId: string,
  input: CreatePurchaseInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const access = await purchasesAccess(popId)
    if (!access.ok) {
      return { success: false, error: access.error }
    }
    if (!access.canCreate) {
      return { success: false, error: "Sin permiso para crear compras." }
    }

    const kind = input.purchaseKind
    if (!isPurchaseKind(kind)) {
      return { success: false, error: "Tipo de compra inválido." }
    }

    const lines = input.lines.filter(
      (l) =>
        l.articleId?.trim() &&
        l.articleCostId?.trim() &&
        parseQty(l.costQuantity) > 0,
    )
    if (lines.length === 0) {
      return {
        success: false,
        error: "Agregá al menos un ítem con cantidad mayor a cero.",
      }
    }

    const user = await requireAuthenticatedUser()
    const supabase = await createClient()

    let supplierName: string | null = null
    let supplierTaxId: string | null = null
    const supplierId = input.supplierId?.trim() || null
    if (supplierId) {
      const { data: supRow, error: supErr } = await supabase
        .from("suppliers")
        .select("id, name, tax_id")
        .eq("id", supplierId)
        .eq("pop_id", popId)
        .maybeSingle()
      if (supErr || !supRow) {
        return { success: false, error: "Proveedor inválido." }
      }
      supplierName = String(supRow.name ?? "")
      supplierTaxId =
        supRow.tax_id != null ? String(supRow.tax_id) : null
    } else {
      const manual = input.supplierManual
      const manualName = manual?.name?.trim() || ""
      const manualTaxId = manual?.taxId?.trim() || ""
      if (manualName || manualTaxId) {
        supplierName = manualName || null
        supplierTaxId = manualTaxId || null
      }
    }

    const built = []
    for (const l of lines) {
      const resolved = await resolvePurchaseCheckoutLine(supabase, popId, {
        articleId: l.articleId,
        articleCostId: l.articleCostId,
        costQuantity: l.costQuantity,
        unitCost: l.unitCost,
        itemDiscountMode: l.itemDiscountMode,
        itemDiscountDraft: l.itemDiscountDraft,
        comment: l.comment,
        expiresOn: l.expiresOn,
        updateArticleCost: l.updateArticleCost,
      })
      if ("error" in resolved) {
        return { success: false, error: resolved.error }
      }
      built.push(resolved.line)
    }
    if (built.length === 0) {
      return { success: false, error: "No hay ítems válidos en la compra." }
    }

    const resolvedKind = derivePurchaseKindFromItemKinds(
      built.map((line) => line.itemKind),
    )

    const checkout = finalizePurchaseCheckout(
      built,
      input.generalDiscountMode ?? "porcentaje",
      Number(input.generalDiscountValue ?? 0),
    )
    if (checkout.total <= 0) {
      return { success: false, error: "El total de la compra debe ser mayor que cero." }
    }

    const {
      generalDiscount,
      itemDiscountTotal,
      discountTotal,
      total,
      subtotalNet,
      taxTotal,
      lineItemsJson,
      subtotalAfterItems,
    } = checkout

    const docKind = input.documentKind?.trim() || null
    const accrueInputVat = purchaseComprobanteAccruesInputVat(docKind)
    const persistedSubtotal = accrueInputVat ? subtotalNet : total
    const persistedTaxTotal = accrueInputVat ? taxTotal : 0
    const lineItemsToPersist = accrueInputVat
      ? lineItemsJson
      : lineItemsJson.map((li) => ({ ...li, iva: 0 }))

    const purchaseMetadata: Record<string, unknown> = {
      purchase_accrues_input_vat: accrueInputVat,
    }
    if (docKind) {
      purchaseMetadata.purchase_document_kind = docKind
    }
    if (!accrueInputVat && taxTotal > 0) {
      purchaseMetadata.vat_included_estimate = taxTotal
    }
    if (itemDiscountTotal > 0) {
      purchaseMetadata.item_discount_total = itemDiscountTotal
    }
    if (generalDiscount > 0) {
      purchaseMetadata.general_discount_amount = generalDiscount
      purchaseMetadata.general_discount_mode = input.generalDiscountMode ?? "porcentaje"
      purchaseMetadata.general_discount_value = Number(input.generalDiscountValue ?? 0)
      purchaseMetadata.subtotal_before_general_discount = subtotalAfterItems
    }

    const confirmPurchase = input.confirmPurchase !== false
    const initialStatus = confirmPurchase ? "pending" : "draft"

    const paymentKind = input.paymentKind?.trim() || null
    let treasuryAccountId = input.treasuryAccountId?.trim() || null
    let checkoutCheckDetails = null
    if (confirmPurchase && paymentKind === "check") {
      const parsed = parseCheckoutCheckDetails(input.checkDetails)
      if (!parsed.ok) return { success: false, error: parsed.error }
      checkoutCheckDetails = parsed.details
      const checkTreasuryId = await resolveCheckTreasuryAccountId(
        supabase,
        popId,
        "issued",
      )
      if (!checkTreasuryId) {
        return {
          success: false,
          error: "Faltan las cuentas de cheques. Recargá la página o contactá a soporte.",
        }
      }
      treasuryAccountId = checkTreasuryId
    }
    if (confirmPurchase && paymentKind && treasuryAccountId) {
      if (!isValidOperationPaymentKind(paymentKind)) {
        return { success: false, error: "Tipo de pago inválido." }
      }
      const { data: taRow, error: taErr } = await supabase
        .from("treasury_accounts")
        .select("id")
        .eq("id", treasuryAccountId)
        .eq("pop_id", popId)
        .eq("is_active", true)
        .maybeSingle()
      if (taErr || !taRow) {
        return { success: false, error: "Cuenta de tesorería inválida." }
      }
    }

    const { data: ins, error } = await supabase
      .from("purchases")
      .insert({
        pop_id: popId,
        supplier_id: supplierId,
        supplier_name: supplierName,
        supplier_tax_id: supplierTaxId,
        purchase_kind: resolvedKind,
        document_number: input.documentNumber?.trim() || null,
        document_date: input.documentDate?.trim() || null,
        due_date: input.dueDate?.trim() || null,
        line_items: lineItemsToPersist,
        subtotal: persistedSubtotal,
        tax_total: persistedTaxTotal,
        discount_total: discountTotal,
        total,
        currency: "ARS",
        status: initialStatus,
        notes: input.notes?.trim() || "",
        metadata: purchaseMetadata,
        created_by: user.uid,
      })
      .select("id")
      .maybeSingle()

    if (error || !ins?.id) {
      return {
        success: false,
        error: error?.message || "No se pudo crear la compra.",
      }
    }

    const purchaseId = String(ins.id)
    const attachmentName = input.attachmentFileName?.trim() || null
    if (docKind || attachmentName || input.documentNumber?.trim()) {
      const { error: docErr } = await supabase.from("purchase_documents").insert({
        pop_id: popId,
        purchase_id: purchaseId,
        doc_kind: docKind,
        invoice_number: input.documentNumber?.trim() || null,
        invoice_date: input.documentDate?.trim() || null,
        amount: total,
        metadata: attachmentName
          ? {
              attachment_name: attachmentName,
            }
          : {},
      })
      if (docErr) {
        return {
          success: false,
          error: docErr.message || "No se pudo registrar el comprobante.",
        }
      }
    }

    if (confirmPurchase && paymentKind && treasuryAccountId) {
      let checkId: string | null = null
      if (paymentKind === "check" && checkoutCheckDetails) {
        const checkRes = await insertCheckoutCheck(supabase, {
          popId,
          userId: user.uid,
          direction: "issued",
          amount: total,
          details: checkoutCheckDetails,
          sourceKind: "purchase",
          sourceId: purchaseId,
        })
        if (!checkRes.success) return checkRes
        checkId = checkRes.checkId
      }
      const { error: payErr } = await supabase.from("purchase_payments").insert({
        pop_id: popId,
        purchase_id: purchaseId,
        payment_kind: paymentKind,
        treasury_account_id: treasuryAccountId,
        amount: total,
        paid_at: new Date().toISOString().slice(0, 10),
        created_by: user.uid,
        check_id: checkId,
      })
      if (payErr) {
        if (checkId) await deleteCheckoutCheck(supabase, checkId)
        return {
          success: false,
          error: payErr.message || "No se pudo registrar el pago.",
        }
      }
    }

    return { success: true, id: purchaseId }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function cancelPurchaseDraft(
  popId: string,
  purchaseId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await purchasesAccess(popId)
    if (!access.ok) {
      return { success: false, error: access.error }
    }
    if (!access.canDelete) {
      return { success: false, error: "Sin permiso para anular compras." }
    }
    const supabase = await createClient()
    const { data: row, error: readErr } = await supabase
      .from("purchases")
      .select("id, status")
      .eq("id", purchaseId.trim())
      .eq("pop_id", popId)
      .maybeSingle()
    if (readErr || !row) {
      return { success: false, error: "Compra no encontrada." }
    }
    if (String(row.status) !== "draft") {
      return {
        success: false,
        error: "Solo se pueden anular compras en borrador.",
      }
    }
    const { error } = await supabase
      .from("purchases")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", purchaseId.trim())
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo anular." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
