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
  articleHasCatalogDiscount,
  effectiveArticleSalePrice,
  isArticleDiscountMode,
} from "@/lib/articleDiscount"
import {
  loadMenuPromotions,
  type MenuCatalogPromotion,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { filterComboPromotionsForSale } from "@/lib/saleMenuCatalog"
import { resolveOpenCashSession } from "@/lib/cashRegisterSession"
import { getTreasuryPaymentContext } from "@/lib/treasuryPaymentContext"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import type { OperationPaymentKind } from "@/lib/operationPaymentKinds"

export type SaleCatalogPaymentOption = {
  kind: OperationPaymentKind
  treasuryAccountId: string
  label: string
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
}

export type SaleCatalogClient = {
  id: string
  name: string
  taxId: string | null
  ivaCondition: string | null
  defaultInvoiceTypeLabel: string | null
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

    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: catRows, error: catErr } = await supabase
      .from("categories")
      .select("id, name, sort_order")
      .eq("pop_id", popId)
      .eq("show_in_sale", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })

    if (catErr) {
      return { success: false, error: catErr.message }
    }

    const categories: SaleCatalogCategory[] = (catRows || []).map((c) => ({
      id: String(c.id),
      name: String(c.name ?? ""),
      sortOrder: Number(c.sort_order ?? 0) || 0,
    }))
    const visibleCategoryIds = new Set(categories.map((c) => c.id))

    const { data: artRows, error: artErr } = await supabase
      .from("articles")
      .select(
        `
        id,
        name,
        description,
        sale_price,
        iva,
        discount_mode,
        discount_value,
        category_id,
        unit_of_measure,
        categories ( id, name )
      `,
      )
      .eq("pop_id", popId)
      .eq("is_active", true)
      .eq("is_sellable", true)
      .eq("item_kind", "merchandise")
      .order("name", { ascending: true })

    if (artErr) {
      return { success: false, error: artErr.message }
    }

    const rows = (artRows || []) as Record<string, unknown>[]
    const articles: SaleCatalogArticle[] = rows
      .filter((row) => {
        const categoryId = String(row.category_id ?? "")
        return categoryId !== "" && visibleCategoryIds.has(categoryId)
      })
      .map((row) => {
      const cat = row.categories as unknown as { name?: string } | null
      const listPrice = Number(row.sale_price ?? 0) || 0
      const rawDiscountMode = row.discount_mode
      const discountMode: ArticleDiscountMode | null =
        typeof rawDiscountMode === "string" &&
        isArticleDiscountMode(rawDiscountMode)
          ? rawDiscountMode
          : null
      const discountRaw = row.discount_value
      const discountValue =
        discountRaw != null && Number.isFinite(Number(discountRaw))
          ? Number(discountRaw)
          : null
      const hasDiscount = articleHasCatalogDiscount(discountMode, discountValue)
      const effectivePrice = effectiveArticleSalePrice(
        listPrice,
        discountMode,
        discountValue,
      )
      return {
        id: String(row.id),
        name: String(row.name ?? ""),
        description: String(row.description ?? ""),
        salePrice: effectivePrice,
        originalSalePrice: hasDiscount ? listPrice : undefined,
        discountMode: hasDiscount ? discountMode : null,
        discountValue: hasDiscount ? discountValue : null,
        iva: Number(row.iva ?? 0) || 0,
        categoryId: String(row.category_id ?? ""),
        categoryName: cat?.name ? String(cat.name) : "—",
      }
    })

    let clients: SaleCatalogClient[] = []
    if (canReadClients) {
      const { data: clRows, error: clErr } = await supabase
        .from("clients")
        .select(
          "id, name, tax_id, iva_condition, default_invoice_type_label, is_active",
        )
        .eq("pop_id", popId)
        .eq("is_active", true)
        .order("name", { ascending: true })
      if (clErr) {
        return { success: false, error: clErr.message }
      }
      clients = (clRows || []).map((c) => ({
        id: String(c.id),
        name: String(c.name ?? ""),
        taxId: c.tax_id != null ? String(c.tax_id) : null,
        ivaCondition:
          c.iva_condition != null && String(c.iva_condition).trim() !== ""
            ? String(c.iva_condition).trim()
            : null,
        defaultInvoiceTypeLabel:
          c.default_invoice_type_label != null &&
          String(c.default_invoice_type_label).trim() !== ""
            ? String(c.default_invoice_type_label).trim()
            : null,
      }))
    }

    let openCashSession: SaleOpenCashSession | null = null
    if (canReadCashRegisters) {
      const cashRes = await resolveOpenCashSession(supabase, popId, user?.id)
      if (cashRes.success) {
        openCashSession = {
          sessionId: cashRes.ctx.sessionId,
          cashRegisterId: cashRes.ctx.cashRegisterId,
          registerName: cashRes.ctx.registerName,
          cashTreasuryAccountId: cashRes.ctx.cashTreasuryAccountId!,
        }
      }
    }

    let treasuryPaymentContext: TreasuryPaymentContext | null = null
    if (canReadPaymentMethods) {
      const treasuryRes = await getTreasuryPaymentContext(popId)
      if (!treasuryRes.success) {
        return { success: false, error: treasuryRes.error }
      }
      treasuryPaymentContext = treasuryRes.context
    }

    const allPromotions = await loadMenuPromotions(supabase, popId)
    const promotions = filterComboPromotionsForSale(
      allPromotions.filter(
        (p) => p.promotionType === "combo" && p.showInMenu,
      ),
    )
    const quantityDeals = allPromotions.filter(
      (p) => p.promotionType === "quantity_deal" && p.autoApply,
    )

    return {
      success: true,
      popName,
      categories,
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
