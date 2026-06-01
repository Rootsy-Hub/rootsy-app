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
import { createClient } from "@/utils/supabase/server"
import {
  ARTICLE_TABLE_PAGE_SIZES,
  DEFAULT_ARTICLE_TABLE_PAGE_SIZE,
} from "@/app/[siteId]/[popId]/articles/workspaceUrl"

export type ArticleTableRow = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  salePrice: number
  costPrice: number
  iva: number
  categoryId: string
  categoryName: string
  isActive: boolean
}

export type ArticleCategoryOption = {
  id: string
  name: string
}

export type UpdatePopArticleInput = {
  name: string
  description: string
  imageUrl: string
  salePrice: number
  costPrice: number
  iva: number
  categoryId: string
  isActive: boolean
}

export type CreatePopArticleInput = UpdatePopArticleInput & {
  siteId?: string
  initialStockQuantity?: number | null
}

export async function getPopArticleCategories(popId: string): Promise<
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
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("pop_id", popId)
      .order("name", { ascending: true })
    if (error) {
      return { success: false, error: error.message }
    }
    const categories: ArticleCategoryOption[] = (data || []).map((c) => ({
      id: String(c.id),
      name: String(c.name ?? ""),
    }))
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
    const salePrice = Number(input.salePrice)
    const iva = Number(input.iva)
    if (!Number.isFinite(salePrice) || salePrice < 0) {
      return { success: false, error: "Precio inválido." }
    }
    if (!Number.isFinite(iva) || iva < 0) {
      return { success: false, error: "IVA inválido." }
    }
    const categoryId = input.categoryId.trim()
    if (!categoryId) {
      return { success: false, error: "Elegí una categoría." }
    }

    const supabase = await createClient()
    const costPrice = Number(input.costPrice)
    if (!Number.isFinite(costPrice) || costPrice < 0) {
      return { success: false, error: "Precio de costo inválido." }
    }
    const imageUrl = input.imageUrl.trim()
    const { error } = await supabase
      .from("articles")
      .update({
        name,
        description: input.description.trim(),
        image_url: imageUrl ? imageUrl : null,
        sale_price: salePrice,
        cost_price: costPrice,
        iva,
        category_id: categoryId,
        is_active: input.isActive,
      })
      .eq("id", articleId)
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
    const salePrice = Number(input.salePrice)
    const iva = Number(input.iva)
    if (!Number.isFinite(salePrice) || salePrice < 0) {
      return { success: false, error: "Precio inválido." }
    }
    if (!Number.isFinite(iva) || iva < 0) {
      return { success: false, error: "IVA inválido." }
    }
    const categoryId = input.categoryId.trim()
    if (!categoryId) {
      return { success: false, error: "Elegí una categoría." }
    }

    const supabase = await createClient()
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
    const { data: created, error } = await supabase
      .from("articles")
      .insert({
        pop_id: popId,
        name,
        description: input.description.trim(),
        image_url: imageUrlInsert ? imageUrlInsert : null,
        sale_price: salePrice,
        cost_price: costPrice,
        iva,
        category_id: categoryId,
        is_active: input.isActive,
      })
      .select("id")
      .single()

    if (error || !created?.id) {
      return { success: false, error: error?.message || "No se pudo crear." }
    }
    const articleId = String(created.id)

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
    const supabase = await createClient()
    const { error } = await supabase
      .from("categories")
      .insert({ pop_id: popId, name })
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
  return `name.ilike.${pattern},description.ilike.${pattern}`
}

function appendArticleListFilters<
  Q extends {
    eq: (a: string, b: string | boolean) => Q
    or: (s: string) => Q
  },
>(q: Q, input: GetPopArticlesTableInput): Q {
  let x = q
  if (input.soloActivos) {
    x = x.eq("is_active", true)
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
  sale_price,
  cost_price,
  iva,
  category_id,
  is_active,
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
    const articles: ArticleTableRow[] = rows.map((row) => {
      const cat = row.categories as unknown as { name?: string } | null
      const rawImg = row.image_url
      const imageUrl =
        typeof rawImg === "string" && rawImg.trim() !== ""
          ? rawImg.trim()
          : null
      return {
        id: String(row.id),
        name: String(row.name ?? ""),
        description: String(row.description ?? ""),
        imageUrl,
        salePrice: Number(row.sale_price ?? 0) || 0,
        costPrice: Number(row.cost_price ?? 0) || 0,
        iva: Number(row.iva ?? 0) || 0,
        categoryId: String(row.category_id ?? ""),
        categoryName: cat?.name ? String(cat.name) : "—",
        isActive: Boolean(row.is_active),
      }
    })

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
