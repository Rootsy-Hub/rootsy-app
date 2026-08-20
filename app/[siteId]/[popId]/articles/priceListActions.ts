"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import {
  isSalePriceListItemKind,
  type SalePriceList,
  type SalePriceListAmountInput,
  type SalePriceListItemKind,
} from "@/lib/salePriceLists"
import { createClient } from "@/utils/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"

function mapPriceListRow(row: {
  id: unknown
  name: unknown
  is_default: unknown
  sort_order: unknown
}): SalePriceList {
  return {
    id: String(row.id),
    name: String(row.name ?? "").trim(),
    isDefault: row.is_default === true,
    sortOrder: Number(row.sort_order ?? 0) || 0,
  }
}

async function requirePopMember(popId: string) {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { ok: false as const, error: access.error || "Sin acceso" }
  }
  return { ok: true as const }
}

async function requireArticleWrite(
  popId: string,
  action: "create" | "update" | "delete",
) {
  const member = await requirePopMember(popId)
  if (!member.ok) return member
  const snap = await loadPopPermissionsSnapshot(popId)
  const perm =
    action === "create"
      ? POP_PERMS.ARTICLE_CREATE
      : action === "delete"
        ? POP_PERMS.ARTICLE_DELETE
        : POP_PERMS.ARTICLE_UPDATE
  if (!permissionKeysInclude(snap.keys, perm.resource, perm.action)) {
    return {
      ok: false as const,
      error: "Sin permiso para administrar listas de precios.",
    }
  }
  return { ok: true as const }
}

export async function ensurePopDefaultPriceList(
  supabase: SupabaseClient,
  popId: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc("ensure_pop_default_price_list", {
    p_pop_id: popId,
  })
  if (error || data == null) {
    return {
      ok: false,
      error: error?.message || "No se pudo crear la lista principal.",
    }
  }
  return { ok: true, id: String(data) }
}

export async function getPopPriceLists(
  popId: string,
): Promise<
  | { success: true; lists: SalePriceList[] }
  | { success: false; error: string }
> {
  try {
    const member = await requirePopMember(popId)
    if (!member.ok) return { success: false, error: member.error }

    const supabase = await createClient()
    const ensured = await ensurePopDefaultPriceList(supabase, popId)
    if (!ensured.ok) return { success: false, error: ensured.error }

    const { data, error } = await supabase
      .from("price_lists")
      .select("id, name, is_default, sort_order")
      .eq("pop_id", popId)
      .order("is_default", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
    if (error) return { success: false, error: error.message }

    return {
      success: true,
      lists: (data ?? []).map(mapPriceListRow),
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function createPopPriceList(
  popId: string,
  nameRaw: string,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const gate = await requireArticleWrite(popId, "create")
    if (!gate.ok) return { success: false, error: gate.error }

    const name = nameRaw.trim()
    if (!name) {
      return { success: false, error: "El nombre no puede quedar vacío." }
    }

    const supabase = await createClient()
    const { data: maxRow } = await supabase
      .from("price_lists")
      .select("sort_order")
      .eq("pop_id", popId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle()
    const nextSort =
      maxRow?.sort_order != null ? Number(maxRow.sort_order) + 1 : 1

    const { data, error } = await supabase
      .from("price_lists")
      .insert({
        pop_id: popId,
        name,
        is_default: false,
        sort_order: nextSort,
      })
      .select("id")
      .single()
    if (error || !data?.id) {
      if (error?.code === "23505") {
        return { success: false, error: "Ya existe una lista con ese nombre." }
      }
      return { success: false, error: error?.message || "No se pudo crear." }
    }
    return { success: true, id: String(data.id) }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function updatePopPriceList(
  popId: string,
  listId: string,
  nameRaw: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const gate = await requireArticleWrite(popId, "update")
    if (!gate.ok) return { success: false, error: gate.error }

    const name = nameRaw.trim()
    if (!name) {
      return { success: false, error: "El nombre no puede quedar vacío." }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from("price_lists")
      .update({ name })
      .eq("id", listId)
      .eq("pop_id", popId)
    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Ya existe una lista con ese nombre." }
      }
      return { success: false, error: error.message || "No se pudo guardar." }
    }
    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function deletePopPriceList(
  popId: string,
  listId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const gate = await requireArticleWrite(popId, "delete")
    if (!gate.ok) return { success: false, error: gate.error }

    const supabase = await createClient()
    const { data: row } = await supabase
      .from("price_lists")
      .select("id, is_default")
      .eq("id", listId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (!row?.id) {
      return { success: false, error: "Lista no encontrada." }
    }
    if (row.is_default) {
      return { success: false, error: "La lista principal no se puede eliminar." }
    }

    const { error } = await supabase
      .from("price_lists")
      .delete()
      .eq("id", listId)
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo eliminar." }
    }
    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function getItemPriceListAmounts(
  popId: string,
  itemKind: SalePriceListItemKind,
  itemId: string,
): Promise<
  | { success: true; amounts: Record<string, number> }
  | { success: false; error: string }
> {
  try {
    const member = await requirePopMember(popId)
    if (!member.ok) return { success: false, error: member.error }
    if (!isSalePriceListItemKind(itemKind) || !itemId) {
      return { success: true, amounts: {} }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("price_list_items")
      .select("price_list_id, amount")
      .eq("pop_id", popId)
      .eq("item_kind", itemKind)
      .eq("item_id", itemId)
    if (error) return { success: false, error: error.message }

    const amounts: Record<string, number> = {}
    for (const row of data ?? []) {
      amounts[String(row.price_list_id)] = Number(row.amount ?? 0)
    }
    return { success: true, amounts }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function syncItemPriceListAmounts(
  supabase: SupabaseClient,
  popId: string,
  itemKind: SalePriceListItemKind,
  itemId: string,
  inputs: SalePriceListAmountInput[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSalePriceListItemKind(itemKind) || !itemId) {
    return { ok: true }
  }

  const { data: extraLists, error: listsError } = await supabase
    .from("price_lists")
    .select("id")
    .eq("pop_id", popId)
    .eq("is_default", false)
  if (listsError) return { ok: false, error: listsError.message }

  const extraIds = new Set((extraLists ?? []).map((row) => String(row.id)))
  const wanted = inputs.filter((input) => extraIds.has(input.listId))

  for (const input of wanted) {
    if (input.amount == null) {
      const { error } = await supabase
        .from("price_list_items")
        .delete()
        .eq("pop_id", popId)
        .eq("price_list_id", input.listId)
        .eq("item_kind", itemKind)
        .eq("item_id", itemId)
      if (error) return { ok: false, error: error.message }
      continue
    }

    const { error } = await supabase.from("price_list_items").upsert(
      {
        pop_id: popId,
        price_list_id: input.listId,
        item_kind: itemKind,
        item_id: itemId,
        amount: input.amount,
      },
      { onConflict: "price_list_id,item_kind,item_id" },
    )
    if (error) return { ok: false, error: error.message }
  }

  return { ok: true }
}

export async function loadPriceListOverrideMap(
  supabase: SupabaseClient,
  popId: string,
  priceListId: string | null | undefined,
  itemKind: SalePriceListItemKind,
  itemIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  const unique = [...new Set(itemIds.filter(Boolean))]
  if (!priceListId || unique.length === 0) return map

  const { data: list } = await supabase
    .from("price_lists")
    .select("id, is_default")
    .eq("id", priceListId)
    .eq("pop_id", popId)
    .maybeSingle()
  if (!list?.id || list.is_default) return map

  const { data } = await supabase
    .from("price_list_items")
    .select("item_id, amount")
    .eq("pop_id", popId)
    .eq("price_list_id", priceListId)
    .eq("item_kind", itemKind)
    .in("item_id", unique)

  for (const row of data ?? []) {
    const amount = Number(row.amount)
    if (Number.isFinite(amount)) {
      map.set(String(row.item_id), amount)
    }
  }
  return map
}
