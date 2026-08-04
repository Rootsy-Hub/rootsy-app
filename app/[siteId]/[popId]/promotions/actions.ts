"use server"

import { promotionDeleteConfirmPhrase } from "@/app/[siteId]/[popId]/promotions/promotionConstants"
import {
  DEFAULT_PROMOTION_TABLE_PAGE_SIZE,
  PROMOTION_TABLE_PAGE_SIZES,
} from "@/app/[siteId]/[popId]/promotions/promotionConstants"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import { popMenuHref } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import {
  isPromotionBenefitTarget,
  isPromotionOptionKind,
  isPromotionPricingMode,
  isPromotionType,
  promotionPricingSummary,
  type PromotionBenefitTarget,
  type PromotionDiscountMode,
  type PromotionOptionKind,
  type PromotionPricingMode,
  type PromotionType,
} from "@/lib/promotionTypes"
import {
  normalizeScheduleDays,
  scheduleDateFromDb,
  scheduleDaysFromDb,
  scheduleTimeFromDb,
  validatePromotionSchedule,
} from "@/lib/promotionSchedule"
import { createClient } from "@/utils/supabase/server"

export type PromotionCatalogOption = {
  id: string
  name: string
  kind: PromotionOptionKind
  salePrice: number
}

export type PromotionSlotOptionRow = {
  id: string
  kind: PromotionOptionKind
  refId: string
  name: string
  salePrice: number
}

export type PromotionSlotRow = {
  id: string
  label: string
  quantity: number
  sortOrder: number
  options: PromotionSlotOptionRow[]
}

export type PromotionTableRow = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  promotionType: PromotionType
  pricingMode: PromotionPricingMode
  fixedPrice: number | null
  discountMode: PromotionDiscountMode | null
  discountValue: number | null
  buyQuantity: number | null
  benefitQuantity: number | null
  benefitDiscountPct: number | null
  applyBenefitTo: PromotionBenefitTarget | null
  autoApply: boolean
  showInMenu: boolean
  isActive: boolean
  sortOrder: number
  validFrom: string | null
  validUntil: string | null
  validTimeStart: string | null
  validTimeEnd: string | null
  scheduleDays: number[]
  slotCount: number
  optionCount: number
  pricingSummary: string
  scheduleSummary: string
}

export type PromotionDetail = PromotionTableRow & {
  slots: PromotionSlotRow[]
}

export type PromotionSlotOptionInput = {
  kind: PromotionOptionKind
  refId: string
}

export type PromotionSlotInput = {
  label: string
  quantity: number
  options: PromotionSlotOptionInput[]
}

export type CreatePromotionInput = {
  name: string
  description: string
  imageUrl: string
  promotionType: PromotionType
  pricingMode: PromotionPricingMode
  fixedPrice: number | null
  discountMode: PromotionDiscountMode | null
  discountValue: number | null
  buyQuantity: number | null
  benefitQuantity: number | null
  benefitDiscountPct: number | null
  applyBenefitTo: PromotionBenefitTarget | null
  autoApply: boolean
  showInMenu: boolean
  isActive: boolean
  validFrom: string | null
  validUntil: string | null
  validTimeStart: string | null
  validTimeEnd: string | null
  scheduleDays: number[]
  slots: PromotionSlotInput[]
}

export type UpdatePromotionInput = CreatePromotionInput

export type GetPopPromotionsTableInput = {
  q?: string
  page?: number
  pageSize?: number
  soloActivos?: boolean
  promotionType?: PromotionType | ""
}

const PROMOTION_SELECT = `
  id,
  pop_id,
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
  sort_order,
  valid_from,
  valid_until,
  valid_time_start,
  valid_time_end,
  schedule_days
`

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  )
}

async function promotionPermissionFlags(popId: string) {
  const snap = await loadPopPermissionsSnapshot(popId)
  return {
    canRead: permissionKeysInclude(
      snap.keys,
      POP_PERMS.PROMOTION_READ.resource,
      POP_PERMS.PROMOTION_READ.action,
    ),
    canCreate: permissionKeysInclude(
      snap.keys,
      POP_PERMS.PROMOTION_CREATE.resource,
      POP_PERMS.PROMOTION_CREATE.action,
    ),
    canUpdate: permissionKeysInclude(
      snap.keys,
      POP_PERMS.PROMOTION_UPDATE.resource,
      POP_PERMS.PROMOTION_UPDATE.action,
    ),
    canDelete: permissionKeysInclude(
      snap.keys,
      POP_PERMS.PROMOTION_DELETE.resource,
      POP_PERMS.PROMOTION_DELETE.action,
    ),
  }
}

function mapPromotionTableRow(
  row: Record<string, unknown>,
  slotCount = 0,
  optionCount = 0,
): PromotionTableRow {
  const rawImg = row.image_url
  const imageUrl =
    typeof rawImg === "string" && rawImg.trim() !== "" ? rawImg.trim() : null
  const promotionType = String(row.promotion_type ?? "combo")
  const pricingMode = String(row.pricing_mode ?? "fixed_total")
  const typeSafe = isPromotionType(promotionType) ? promotionType : "combo"
  const pricingSafe = isPromotionPricingMode(pricingMode)
    ? pricingMode
    : "fixed_total"
  const discountModeRaw = row.discount_mode
  const discountMode =
    discountModeRaw === "porcentaje" || discountModeRaw === "fijo"
      ? discountModeRaw
      : null
  const applyRaw = row.apply_benefit_to
  const applyBenefitTo = isPromotionBenefitTarget(String(applyRaw ?? ""))
    ? (String(applyRaw) as PromotionBenefitTarget)
    : null

  const scheduleDays = scheduleDaysFromDb(row.schedule_days)
  const validFrom = scheduleDateFromDb(row.valid_from)
  const validUntil = scheduleDateFromDb(row.valid_until)
  const validTimeStart = scheduleTimeFromDb(row.valid_time_start)
  const validTimeEnd = scheduleTimeFromDb(row.valid_time_end)

  const pricingSummary = promotionPricingSummary({
    promotionType: typeSafe,
    pricingMode: pricingSafe,
    fixedPrice:
      row.fixed_price != null ? Number(row.fixed_price) || 0 : null,
    discountMode,
    discountValue:
      row.discount_value != null ? Number(row.discount_value) || 0 : null,
    buyQuantity: row.buy_quantity != null ? Number(row.buy_quantity) : null,
    benefitQuantity:
      row.benefit_quantity != null ? Number(row.benefit_quantity) : null,
    benefitDiscountPct:
      row.benefit_discount_pct != null
        ? Number(row.benefit_discount_pct)
        : null,
    applyBenefitTo,
  })

  const scheduleParts: string[] = []
  if (validFrom || validUntil) {
    scheduleParts.push(`${validFrom ?? "…"} → ${validUntil ?? "…"}`)
  }
  if (validTimeStart && validTimeEnd) {
    scheduleParts.push(`${validTimeStart}–${validTimeEnd}`)
  }
  if (scheduleDays.length > 0 && scheduleDays.length < 7) {
    const labels = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"]
    scheduleParts.push(scheduleDays.map((d) => labels[d]).join(", "))
  }

  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    imageUrl,
    promotionType: typeSafe,
    pricingMode: pricingSafe,
    fixedPrice: row.fixed_price != null ? Number(row.fixed_price) || 0 : null,
    discountMode,
    discountValue:
      row.discount_value != null ? Number(row.discount_value) || 0 : null,
    buyQuantity: row.buy_quantity != null ? Number(row.buy_quantity) : null,
    benefitQuantity:
      row.benefit_quantity != null ? Number(row.benefit_quantity) : null,
    benefitDiscountPct:
      row.benefit_discount_pct != null
        ? Number(row.benefit_discount_pct)
        : null,
    applyBenefitTo,
    autoApply: Boolean(row.auto_apply),
    showInMenu: Boolean(row.show_in_menu),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0) || 0,
    validFrom,
    validUntil,
    validTimeStart,
    validTimeEnd,
    scheduleDays,
    slotCount,
    optionCount,
    pricingSummary,
    scheduleSummary:
      scheduleParts.length > 0 ? scheduleParts.join(" · ") : "Siempre activa",
  }
}

function validatePromotionInput(
  input: CreatePromotionInput,
): { ok: true } | { ok: false; error: string } {
  const name = input.name.trim()
  if (!name) return { ok: false, error: "Indicá el nombre de la promoción." }
  if (name.length > 200) {
    return { ok: false, error: "El nombre no puede superar 200 caracteres." }
  }
  if (!isPromotionType(input.promotionType)) {
    return { ok: false, error: "Tipo de promoción inválido." }
  }

  const scheduleCheck = validatePromotionSchedule({
    validFrom: input.validFrom,
    validUntil: input.validUntil,
    validTimeStart: input.validTimeStart,
    validTimeEnd: input.validTimeEnd,
    scheduleDays: input.scheduleDays,
  })
  if (!scheduleCheck.ok) return scheduleCheck

  if (input.promotionType === "combo") {
    if (!isPromotionPricingMode(input.pricingMode)) {
      return { ok: false, error: "Modo de precio inválido." }
    }
    if (input.pricingMode === "fixed_total") {
      const fixed = Number(input.fixedPrice)
      if (!Number.isFinite(fixed) || fixed < 0) {
        return { ok: false, error: "Precio fijo inválido." }
      }
    } else if (input.pricingMode === "percent_off") {
      const pct = Number(input.discountValue)
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        return { ok: false, error: "Porcentaje de descuento inválido." }
      }
    } else if (input.pricingMode === "fixed_off") {
      const amt = Number(input.discountValue)
      if (!Number.isFinite(amt) || amt < 0) {
        return { ok: false, error: "Monto de descuento inválido." }
      }
    }
    if (!input.slots.length) {
      return { ok: false, error: "Agregá al menos un ítem al combo." }
    }
    for (const slot of input.slots) {
      const label = slot.label.trim()
      if (!label) {
        return { ok: false, error: "Cada ítem del combo necesita un nombre." }
      }
      const qty = Number(slot.quantity)
      if (!Number.isFinite(qty) || qty < 1 || !Number.isInteger(qty)) {
        return { ok: false, error: "Cantidad de ítem inválida." }
      }
      if (!slot.options.length) {
        return {
          ok: false,
          error: `Agregá productos o recetas al ítem «${label}».`,
        }
      }
      const seen = new Set<string>()
      for (const opt of slot.options) {
        if (!isPromotionOptionKind(opt.kind) || !isUuid(opt.refId.trim())) {
          return { ok: false, error: "Opción de ítem inválida." }
        }
        const key = `${opt.kind}:${opt.refId.trim()}`
        if (seen.has(key)) {
          return {
            ok: false,
            error: `No podés repetir la misma opción en «${label}».`,
          }
        }
        seen.add(key)
      }
    }
    return { ok: true }
  }

  const buy = Number(input.buyQuantity)
  const benefit = Number(input.benefitQuantity)
  const pct = Number(input.benefitDiscountPct)
  if (!Number.isFinite(buy) || buy < 1 || !Number.isInteger(buy)) {
    return { ok: false, error: "Cantidad a comprar inválida." }
  }
  if (!Number.isFinite(benefit) || benefit < 1 || !Number.isInteger(benefit)) {
    return { ok: false, error: "Cantidad bonificada inválida." }
  }
  if (benefit > buy) {
    return {
      ok: false,
      error: "La cantidad bonificada no puede superar la cantidad a comprar.",
    }
  }
  if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
    return { ok: false, error: "Porcentaje de beneficio inválido." }
  }
  if (
    !input.applyBenefitTo ||
    !isPromotionBenefitTarget(input.applyBenefitTo)
  ) {
    return { ok: false, error: "Indicá a qué unidad aplica el beneficio." }
  }
  const pool = input.slots[0]
  if (!pool?.options.length) {
    return {
      ok: false,
      error: "Agregá al menos un producto o receta elegible.",
    }
  }
  const seenPool = new Set<string>()
  for (const opt of pool.options) {
    if (!isPromotionOptionKind(opt.kind) || !isUuid(opt.refId.trim())) {
      return { ok: false, error: "Opción elegible inválida." }
    }
    const key = `${opt.kind}:${opt.refId.trim()}`
    if (seenPool.has(key)) {
      return { ok: false, error: "No podés repetir la misma opción elegible." }
    }
    seenPool.add(key)
  }
  return { ok: true }
}

async function validatePromotionOptions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  slots: PromotionSlotInput[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const articleIds = new Set<string>()
  const recipeIds = new Set<string>()
  for (const slot of slots) {
    for (const opt of slot.options) {
      const id = opt.refId.trim()
      if (opt.kind === "article") articleIds.add(id)
      else recipeIds.add(id)
    }
  }

  if (articleIds.size > 0) {
    const { data, error } = await supabase
      .from("articles")
      .select("id, is_active, item_kind")
      .eq("pop_id", popId)
      .in("id", [...articleIds])
    if (error) {
      return { ok: false, error: error.message || "No se pudieron validar productos." }
    }
    const byId = new Map((data ?? []).map((r) => [String(r.id), r]))
    for (const id of articleIds) {
      const row = byId.get(id)
      if (!row?.is_active) {
        return { ok: false, error: "Un producto elegible ya no está disponible." }
      }
      const kind = String(row.item_kind ?? "")
      if (kind !== "merchandise") {
        return {
          ok: false,
          error: "Solo podés incluir productos vendibles en promociones.",
        }
      }
    }
  }

  if (recipeIds.size > 0) {
    const { data, error } = await supabase
      .from("recipes")
      .select("id, is_active")
      .eq("pop_id", popId)
      .in("id", [...recipeIds])
    if (error) {
      return { ok: false, error: error.message || "No se pudieron validar recetas." }
    }
    const byId = new Map((data ?? []).map((r) => [String(r.id), r]))
    for (const id of recipeIds) {
      const row = byId.get(id)
      if (!row?.is_active) {
        return { ok: false, error: "Una receta elegible ya no está disponible." }
      }
    }
  }

  return { ok: true }
}

function promotionInsertRow(
  popId: string,
  input: CreatePromotionInput,
  sortOrder: number,
): Record<string, unknown> {
  const imageUrl = input.imageUrl.trim()
  const scheduleDays = normalizeScheduleDays(input.scheduleDays)
  const base: Record<string, unknown> = {
    pop_id: popId,
    name: input.name.trim(),
    description: input.description.trim(),
    image_url: imageUrl ? imageUrl : null,
    promotion_type: input.promotionType,
    auto_apply: input.autoApply,
    show_in_menu: input.showInMenu,
    is_active: input.isActive,
    sort_order: sortOrder,
    valid_from: input.validFrom?.trim() || null,
    valid_until: input.validUntil?.trim() || null,
    valid_time_start: input.validTimeStart?.trim() || null,
    valid_time_end: input.validTimeEnd?.trim() || null,
    schedule_days: scheduleDays,
  }

  if (input.promotionType === "combo") {
    base.pricing_mode = input.pricingMode
    base.fixed_price =
      input.pricingMode === "fixed_total"
        ? roundMoney(Number(input.fixedPrice))
        : null
    base.discount_mode =
      input.pricingMode === "fixed_total" ? null : input.discountMode
    base.discount_value =
      input.pricingMode === "fixed_total"
        ? null
        : roundMoney(Number(input.discountValue))
    base.buy_quantity = null
    base.benefit_quantity = null
    base.benefit_discount_pct = null
    base.apply_benefit_to = null
  } else {
    base.pricing_mode = "percent_off"
    base.fixed_price = null
    base.discount_mode = "porcentaje"
    base.discount_value = null
    base.buy_quantity = Number(input.buyQuantity)
    base.benefit_quantity = Number(input.benefitQuantity)
    base.benefit_discount_pct = Number(input.benefitDiscountPct)
    base.apply_benefit_to = input.applyBenefitTo
  }

  return base
}

async function syncPromotionSlots(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  promotionId: string,
  slots: PromotionSlotInput[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error: delSlotErr } = await supabase
    .from("promotion_slots")
    .delete()
    .eq("promotion_id", promotionId)
    .eq("pop_id", popId)
  if (delSlotErr) {
    return {
      ok: false,
      error: delSlotErr.message || "No se pudieron actualizar ítems.",
    }
  }

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]
    const { data: slotRow, error: slotErr } = await supabase
      .from("promotion_slots")
      .insert({
        promotion_id: promotionId,
        pop_id: popId,
        label: slot.label.trim(),
        quantity: Number(slot.quantity),
        sort_order: i,
      })
      .select("id")
      .single()
    if (slotErr || !slotRow?.id) {
      return {
        ok: false,
        error: slotErr?.message || "No se pudo guardar un ítem de la promoción.",
      }
    }
    const slotId = String(slotRow.id)
    if (slot.options.length === 0) continue
    const { error: optErr } = await supabase.from("promotion_slot_options").insert(
      slot.options.map((opt, index) => ({
        promotion_slot_id: slotId,
        pop_id: popId,
        article_id: opt.kind === "article" ? opt.refId.trim() : null,
        recipe_id: opt.kind === "recipe" ? opt.refId.trim() : null,
        sort_order: index,
      })),
    )
    if (optErr) {
      return {
        ok: false,
        error: optErr.message || "No se pudieron guardar opciones.",
      }
    }
  }

  return { ok: true }
}

async function loadPromotionSlots(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  promotionId: string,
): Promise<PromotionSlotRow[]> {
  const { data: slotRows } = await supabase
    .from("promotion_slots")
    .select("id, label, quantity, sort_order")
    .eq("promotion_id", promotionId)
    .eq("pop_id", popId)
    .order("sort_order", { ascending: true })

  if (!slotRows?.length) return []

  const slotIds = slotRows.map((r) => String(r.id))
  const { data: optRows } = await supabase
    .from("promotion_slot_options")
    .select("id, promotion_slot_id, article_id, recipe_id, sort_order")
    .eq("pop_id", popId)
    .in("promotion_slot_id", slotIds)
    .order("sort_order", { ascending: true })

  const articleIds = (optRows ?? [])
    .filter((r) => r.article_id)
    .map((r) => String(r.article_id))
  const recipeIds = (optRows ?? [])
    .filter((r) => r.recipe_id)
    .map((r) => String(r.recipe_id))

  const articleNames = new Map<string, { name: string; salePrice: number }>()
  if (articleIds.length > 0) {
    const { data } = await supabase
      .from("articles")
      .select("id, name, sale_price")
      .eq("pop_id", popId)
      .in("id", articleIds)
    for (const r of data ?? []) {
      articleNames.set(String(r.id), {
        name: String(r.name ?? ""),
        salePrice: Number(r.sale_price ?? 0) || 0,
      })
    }
  }

  const recipeNames = new Map<string, { name: string; salePrice: number }>()
  if (recipeIds.length > 0) {
    const { data } = await supabase
      .from("recipes")
      .select("id, name, sale_price")
      .eq("pop_id", popId)
      .in("id", recipeIds)
    for (const r of data ?? []) {
      recipeNames.set(String(r.id), {
        name: String(r.name ?? ""),
        salePrice: Number(r.sale_price ?? 0) || 0,
      })
    }
  }

  const optsBySlot = new Map<string, PromotionSlotOptionRow[]>()
  for (const row of optRows ?? []) {
    const slotId = String(row.promotion_slot_id)
    const list = optsBySlot.get(slotId) ?? []
    if (row.article_id) {
      const id = String(row.article_id)
      const meta = articleNames.get(id)
      list.push({
        id: String(row.id),
        kind: "article",
        refId: id,
        name: meta?.name ?? "—",
        salePrice: meta?.salePrice ?? 0,
      })
    } else if (row.recipe_id) {
      const id = String(row.recipe_id)
      const meta = recipeNames.get(id)
      list.push({
        id: String(row.id),
        kind: "recipe",
        refId: id,
        name: meta?.name ?? "—",
        salePrice: meta?.salePrice ?? 0,
      })
    }
    optsBySlot.set(slotId, list)
  }

  return slotRows.map((slot) => ({
    id: String(slot.id),
    label: String(slot.label ?? ""),
    quantity: Number(slot.quantity ?? 1) || 1,
    sortOrder: Number(slot.sort_order ?? 0) || 0,
    options: optsBySlot.get(String(slot.id)) ?? [],
  }))
}

export async function getPromotionCatalogOptions(popId: string): Promise<
  | { success: true; options: PromotionCatalogOption[] }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await promotionPermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver promociones." }
    }

    const supabase = await createClient()
    const [articlesRes, recipesRes] = await Promise.all([
      supabase
        .from("articles")
        .select("id, name, sale_price")
        .eq("pop_id", popId)
        .eq("is_active", true)
        .eq("item_kind", "merchandise")
        .order("name", { ascending: true }),
      supabase
        .from("recipes")
        .select("id, name, sale_price")
        .eq("pop_id", popId)
        .eq("is_active", true)
        .order("name", { ascending: true }),
    ])

    if (articlesRes.error) {
      return { success: false, error: articlesRes.error.message }
    }
    if (recipesRes.error) {
      return { success: false, error: recipesRes.error.message }
    }

    const options: PromotionCatalogOption[] = [
      ...(articlesRes.data ?? []).map((r) => ({
        id: String(r.id),
        name: String(r.name ?? ""),
        kind: "article" as const,
        salePrice: Number(r.sale_price ?? 0) || 0,
      })),
      ...(recipesRes.data ?? []).map((r) => ({
        id: String(r.id),
        name: String(r.name ?? ""),
        kind: "recipe" as const,
        salePrice: Number(r.sale_price ?? 0) || 0,
      })),
    ]

    options.sort((a, b) => a.name.localeCompare(b.name, "es"))

    return { success: true, options }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function getPopPromotionsTable(
  popId: string,
  input: GetPopPromotionsTableInput,
): Promise<
  | {
      success: true
      promotions: PromotionTableRow[]
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
      promotions: PromotionTableRow[]
      totalCount: number
      page: number
      popName?: string
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
> {
  const empty = {
    promotions: [] as PromotionTableRow[],
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
    const perms = await promotionPermissionFlags(popId)
    if (!perms.canRead) {
      return {
        success: false,
        error: "No tenés permiso para ver promociones en este punto de venta.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
        ...empty,
        popName: "",
      }
    }

    const pageSizeRaw = Number(input.pageSize)
    const pageSize = PROMOTION_TABLE_PAGE_SIZES.includes(
      pageSizeRaw as (typeof PROMOTION_TABLE_PAGE_SIZES)[number],
    )
      ? pageSizeRaw
      : DEFAULT_PROMOTION_TABLE_PAGE_SIZE
    const pageRaw = Number(input.page)
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1
    const q = input.q?.trim() ?? ""
    const typeFilter = input.promotionType?.trim() ?? ""

    const supabase = await createClient()
    const { data: popRow } = await supabase
      .from("pops")
      .select("name")
      .eq("id", popId)
      .maybeSingle()

    let query = supabase
      .from("promotions")
      .select(PROMOTION_SELECT, { count: "exact" })
      .eq("pop_id", popId)

    if (input.soloActivos) query = query.eq("is_active", true)
    if (typeFilter && isPromotionType(typeFilter)) {
      query = query.eq("promotion_type", typeFilter)
    }
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
    const { data, error, count } = await query
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
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

    const promoIds = (data ?? []).map((r) => String(r.id))
    const slotCounts = new Map<string, number>()
    const optionCounts = new Map<string, number>()

    if (promoIds.length > 0) {
      const { data: slots } = await supabase
        .from("promotion_slots")
        .select("id, promotion_id")
        .eq("pop_id", popId)
        .in("promotion_id", promoIds)
      const slotIds = (slots ?? []).map((s) => String(s.id))
      for (const s of slots ?? []) {
        const pid = String(s.promotion_id)
        slotCounts.set(pid, (slotCounts.get(pid) ?? 0) + 1)
      }
      if (slotIds.length > 0) {
        const { data: opts } = await supabase
          .from("promotion_slot_options")
          .select("promotion_slot_id")
          .eq("pop_id", popId)
          .in("promotion_slot_id", slotIds)
        const slotToPromo = new Map(
          (slots ?? []).map((s) => [String(s.id), String(s.promotion_id)]),
        )
        for (const o of opts ?? []) {
          const pid = slotToPromo.get(String(o.promotion_slot_id))
          if (pid) optionCounts.set(pid, (optionCounts.get(pid) ?? 0) + 1)
        }
      }
    }

    const promotions = (data ?? []).map((row) =>
      mapPromotionTableRow(
        row as Record<string, unknown>,
        slotCounts.get(String(row.id)) ?? 0,
        optionCounts.get(String(row.id)) ?? 0,
      ),
    )

    return {
      success: true,
      promotions,
      totalCount: count ?? promotions.length,
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

export async function getPopPromotionDetail(
  popId: string,
  promotionId: string,
): Promise<
  | { success: true; promotion: PromotionDetail }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await promotionPermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver promociones." }
    }
    if (!isUuid(promotionId)) {
      return { success: false, error: "Promoción inválida." }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("promotions")
      .select(PROMOTION_SELECT)
      .eq("id", promotionId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (error || !data) {
      return {
        success: false,
        error: error?.message || "Promoción no encontrada.",
      }
    }

    const slots = await loadPromotionSlots(supabase, popId, promotionId)
    const optionCount = slots.reduce((n, s) => n + s.options.length, 0)

    return {
      success: true,
      promotion: {
        ...mapPromotionTableRow(
          data as Record<string, unknown>,
          slots.length,
          optionCount,
        ),
        slots,
      },
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function createPopPromotion(
  popId: string,
  input: CreatePromotionInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await promotionPermissionFlags(popId)
    if (!perms.canCreate) {
      return { success: false, error: "Sin permiso para crear promociones." }
    }

    const validation = validatePromotionInput(input)
    if (!validation.ok) return { success: false, error: validation.error }

    const supabase = await createClient()
    const optionsCheck = await validatePromotionOptions(
      supabase,
      popId,
      input.slots,
    )
    if (!optionsCheck.ok) {
      return { success: false, error: optionsCheck.error }
    }

    const { data: maxRow } = await supabase
      .from("promotions")
      .select("sort_order")
      .eq("pop_id", popId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle()
    const sortOrder = (Number(maxRow?.sort_order ?? -1) || -1) + 1

    const { data: created, error } = await supabase
      .from("promotions")
      .insert(promotionInsertRow(popId, input, sortOrder))
      .select("id")
      .single()

    if (error || !created?.id) {
      return {
        success: false,
        error: error?.message || "No se pudo crear la promoción.",
      }
    }

    const promotionId = String(created.id)
    const sync = await syncPromotionSlots(
      supabase,
      popId,
      promotionId,
      input.slots,
    )
    if (!sync.ok) {
      await supabase.from("promotions").delete().eq("id", promotionId).eq("pop_id", popId)
      return { success: false, error: sync.error }
    }

    return { success: true, id: promotionId }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function updatePopPromotion(
  popId: string,
  promotionId: string,
  input: UpdatePromotionInput,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await promotionPermissionFlags(popId)
    if (!perms.canUpdate) {
      return { success: false, error: "Sin permiso para editar promociones." }
    }
    if (!isUuid(promotionId)) {
      return { success: false, error: "Promoción inválida." }
    }

    const validation = validatePromotionInput(input)
    if (!validation.ok) return { success: false, error: validation.error }

    const supabase = await createClient()
    const { data: existing } = await supabase
      .from("promotions")
      .select("id, sort_order")
      .eq("id", promotionId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (!existing?.id) {
      return { success: false, error: "Promoción no encontrada." }
    }

    const optionsCheck = await validatePromotionOptions(
      supabase,
      popId,
      input.slots,
    )
    if (!optionsCheck.ok) {
      return { success: false, error: optionsCheck.error }
    }

    const sortOrder = Number(existing.sort_order ?? 0) || 0
    const { error } = await supabase
      .from("promotions")
      .update(promotionInsertRow(popId, input, sortOrder))
      .eq("id", promotionId)
      .eq("pop_id", popId)

    if (error) return { success: false, error: error.message }

    const sync = await syncPromotionSlots(
      supabase,
      popId,
      promotionId,
      input.slots,
    )
    if (!sync.ok) return { success: false, error: sync.error }

    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function deletePopPromotion(
  popId: string,
  promotionId: string,
  confirmPhrase: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await promotionPermissionFlags(popId)
    if (!perms.canDelete) {
      return { success: false, error: "Sin permiso para eliminar promociones." }
    }
    if (!isUuid(promotionId)) {
      return { success: false, error: "Promoción inválida." }
    }

    const supabase = await createClient()
    const { data: promotion, error: fetchError } = await supabase
      .from("promotions")
      .select("name")
      .eq("id", promotionId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (fetchError) {
      return {
        success: false,
        error: fetchError.message || "No se encontró la promoción.",
      }
    }
    if (!promotion) {
      return { success: false, error: "No se encontró la promoción." }
    }

    const expectedPhrase = promotionDeleteConfirmPhrase(
      String(promotion.name ?? ""),
    )
    if (confirmPhrase.trim() !== expectedPhrase) {
      return {
        success: false,
        error: `Escribí (${expectedPhrase}) para confirmar el borrado.`,
      }
    }

    const { error } = await supabase
      .from("promotions")
      .delete()
      .eq("id", promotionId)
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
