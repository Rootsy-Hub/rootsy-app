"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import {
  isServiceBillingPeriod,
  isServiceDiscountMode,
  isServiceLateInterestType,
  isServicePaymentTiming,
  billingPeriodDisplayLabel,
  parseServiceDetailsGrid,
  type ServiceBillingPeriod,
  type ServiceDetailsGrid,
  type ServiceDiscountMode,
  type ServiceLateInterestType,
  type ServicePaymentTiming,
} from "@/lib/serviceCatalogTypes"
import {
  availableBillingScopesForService,
  billingPeriodRequiresManualPeriodEnd,
  chargeMatchesViewFilter,
  computeChargeAmount,
  computeChargeDueDate,
  resolveChargePeriodRange,
  deriveStoredStatusFromPayments,
  isActiveServicesViewFilter,
  isServiceChargeBillingScope,
  resolveServiceChargeEffectiveStatus,
  roundServiceChargeMoney,
  type ActiveServicesViewFilter,
  type ServiceChargeBillingScope,
  type ServiceChargeEffectiveStatus,
  type ServiceChargePaymentMode,
  type ServiceChargeStoredStatus,
} from "@/lib/serviceChargeTypes"
import { postServiceChargePaymentLedger } from "@/lib/serviceChargeAccountingPosting"
import { getTreasuryPaymentContext } from "@/lib/treasuryPaymentContext"
import {
  buildPayPaymentOptions,
  type TreasuryPaymentContext,
  type TreasuryPaymentOption,
} from "@/lib/treasuryPaymentOptions"
import { isValidOperationPaymentKind } from "@/lib/operationPaymentKinds"
import {
  deleteCheckoutCheck,
  insertCheckoutCheck,
  parseCheckoutCheckDetails,
  resolveCheckTreasuryAccountId,
  type CheckoutCheckDetails,
} from "@/lib/checkoutCheck"
import type { OperationPartyCatalogItem } from "@/lib/operationPartyPicker"
import { CLIENT_IVA_CONDITION_VALUES } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { SERVICE_CHARGE_CLIENT_SEARCH_LIMIT } from "@/app/[siteId]/[popId]/active-services/serviceChargeClientConstants"
import { createClient } from "@/utils/supabase/server"

export type ServiceChargeListRow = {
  id: string
  clientId: string
  clientName: string
  serviceTypeId: string
  serviceName: string
  billingPeriod: ServiceBillingPeriod
  billingPeriodLabel: string | null
  billingScope: ServiceChargeBillingScope
  paymentMode: ServiceChargePaymentMode
  periodCount: number
  sequenceIndex: number
  periodStart: string | null
  periodEnd: string | null
  periodDisplay: string
  unitPrice: number
  discountMode: ServiceDiscountMode
  discountValue: number | null
  amount: number
  paidTotal: number
  balance: number
  dueDate: string
  storedStatus: ServiceChargeStoredStatus
  effectiveStatus: ServiceChargeEffectiveStatus
  cancelledAt: string | null
  notes: string
  createdAt: string
}

export type ActiveServicesStats = {
  activeClients: number
  activeCharges: number
  overdueCharges: number
  cancelledCharges: number
}

export type ServiceTypeChargeAddonOption = {
  id: string
  name: string
  price: number
}

export type ServiceTypeChargeOption = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  defaultPrice: number
  billingPeriod: ServiceBillingPeriod
  billingPeriodLabel: string | null
  billingPeriodDisplay: string
  paymentTiming: ServicePaymentTiming
  dueDaysAfter: number
  categoryId: string | null
  categoryName: string | null
  addons: ServiceTypeChargeAddonOption[]
}

export type ServiceTypeChargeDetailArticle = {
  articleName: string
  quantity: number
  unitOfMeasure: string
}

export type ServiceTypeChargeDetail = ServiceTypeChargeOption & {
  detailsGrid: ServiceDetailsGrid
  contractText: string
  lateInterestType: ServiceLateInterestType
  lateInterestValue: number | null
  discountMode: ServiceDiscountMode
  discountValue: number | null
  articles: ServiceTypeChargeDetailArticle[]
}

export type ServiceChargePaymentMethodOption = TreasuryPaymentOption

export type CreateServiceChargeUpdateClientInput = {
  email: string
  ivaCondition: string
}

export type CreateServiceChargeNewClientInput = {
  name: string
  taxId: string
  email: string
  ivaCondition: string
}

export type CreateServiceChargeAddonInput = {
  addonId: string
  chargeFrequency: "once" | "each_period"
}

export type CreateServiceChargeInput = {
  clientId?: string
  updateExistingClient?: CreateServiceChargeUpdateClientInput
  newClient?: CreateServiceChargeNewClientInput
  /** Alta en cartera al crear el cargo (cliente manual). */
  saveNewClient?: boolean
  serviceTypeId: string
  billingScope: ServiceChargeBillingScope
  periodCount: number
  periodStartDate: string
  periodEndDate?: string | null
  paymentTiming: ServicePaymentTiming
  dueDaysAfter: number
  unitPrice: number
  discountMode: ServiceDiscountMode
  discountValue: number | null
  addons?: CreateServiceChargeAddonInput[]
  notes?: string
}

export type GetActiveServicesInput = {
  view?: ActiveServicesViewFilter
  clientQ?: string
}

const CHARGE_SELECT = `
  id,
  pop_id,
  client_id,
  service_type_id,
  charge_group_id,
  sequence_index,
  billing_scope,
  period_count,
  payment_mode,
  period_start,
  period_end,
  unit_price,
  discount_mode,
  discount_value,
  amount,
  due_date,
  status,
  cancelled_at,
  cancel_reason,
  notes,
  created_at,
  clients ( name ),
  service_types ( name, billing_period, billing_period_label )
`

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  )
}

async function chargePermissionFlags(popId: string) {
  const snap = await loadPopPermissionsSnapshot(popId)
  return {
    canRead: permissionKeysInclude(
      snap.keys,
      POP_PERMS.SERVICE_CHARGE_READ.resource,
      POP_PERMS.SERVICE_CHARGE_READ.action,
    ),
    canCreate: permissionKeysInclude(
      snap.keys,
      POP_PERMS.SERVICE_CHARGE_CREATE.resource,
      POP_PERMS.SERVICE_CHARGE_CREATE.action,
    ),
    canUpdate: permissionKeysInclude(
      snap.keys,
      POP_PERMS.SERVICE_CHARGE_UPDATE.resource,
      POP_PERMS.SERVICE_CHARGE_UPDATE.action,
    ),
    canDelete: permissionKeysInclude(
      snap.keys,
      POP_PERMS.SERVICE_CHARGE_DELETE.resource,
      POP_PERMS.SERVICE_CHARGE_DELETE.action,
    ),
    canReadClients: permissionKeysInclude(
      snap.keys,
      POP_PERMS.CLIENT_READ.resource,
      POP_PERMS.CLIENT_READ.action,
    ),
    canCreateClient: permissionKeysInclude(
      snap.keys,
      POP_PERMS.CLIENT_CREATE.resource,
      POP_PERMS.CLIENT_CREATE.action,
    ),
    canUpdateClient: permissionKeysInclude(
      snap.keys,
      POP_PERMS.CLIENT_UPDATE.resource,
      POP_PERMS.CLIENT_UPDATE.action,
    ),
  }
}

function escapeIlikeToken(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

function buildClientSearchOrClause(raw: string): string | null {
  const t = raw.trim().replace(/,/g, " ").trim()
  if (!t) return null
  const pattern = `%${escapeIlikeToken(t)}%`
  return [`name.ilike.${pattern}`, `tax_id.ilike.${pattern}`].join(",")
}

function normalizeClientIvaCondition(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  return (CLIENT_IVA_CONDITION_VALUES as readonly string[]).includes(t)
    ? t
    : null
}

export async function searchClientsForServiceCharge(
  popId: string,
  query: string,
): Promise<
  | { success: true; parties: OperationPartyCatalogItem[] }
  | { success: false; error: string }
> {
  const trimmed = query.trim()
  if (!trimmed) {
    return { success: true, parties: [] }
  }

  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return {
        success: false,
        error: access.error ?? "No tienes acceso a este POP",
      }
    }

    const perms = await chargePermissionFlags(popId)
    if (!perms.canReadClients) {
      return { success: false, error: "Sin permiso para buscar clientes." }
    }

    const orClause = buildClientSearchOrClause(trimmed)
    if (!orClause) {
      return { success: true, parties: [] }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("clients")
      .select(
        "id, name, tax_id, email, iva_condition, default_invoice_type_label, is_active",
      )
      .eq("pop_id", popId)
      .eq("is_active", true)
      .or(orClause)
      .order("name", { ascending: true })
      .limit(SERVICE_CHARGE_CLIENT_SEARCH_LIMIT)

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      parties: (data ?? []).map((c) => ({
        id: String(c.id),
        name: String(c.name ?? "").trim(),
        taxId: c.tax_id != null ? String(c.tax_id) : null,
        email: c.email != null ? String(c.email) : null,
        ivaCondition: c.iva_condition != null ? String(c.iva_condition) : null,
        defaultInvoiceTypeLabel:
          c.default_invoice_type_label != null
            ? String(c.default_invoice_type_label)
            : null,
      })),
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

async function resolveServiceChargeClientId(
  popId: string,
  input: CreateServiceChargeInput,
  perms: Awaited<ReturnType<typeof chargePermissionFlags>>,
): Promise<{ ok: true; clientId: string } | { ok: false; error: string }> {
  const supabase = await createClient()
  const existingId = input.clientId?.trim() ?? ""

  if (existingId) {
    if (!isUuid(existingId)) {
      return { ok: false, error: "Elegí un cliente válido." }
    }
    const { data: clientRow } = await supabase
      .from("clients")
      .select("id")
      .eq("id", existingId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (!clientRow?.id) {
      return { ok: false, error: "El cliente no existe en este POP." }
    }

    const clientPatch = input.updateExistingClient
    if (clientPatch) {
      if (!perms.canUpdateClient) {
        return {
          ok: false,
          error: "Sin permiso para actualizar clientes en la cartera.",
        }
      }
      const { error: updateError } = await supabase
        .from("clients")
        .update({
          email: clientPatch.email.trim() || null,
          iva_condition: normalizeClientIvaCondition(clientPatch.ivaCondition),
        })
        .eq("id", existingId)
        .eq("pop_id", popId)
      if (updateError) {
        return {
          ok: false,
          error: updateError.message ?? "No se pudo actualizar el cliente.",
        }
      }
    }

    return { ok: true, clientId: existingId }
  }

  const newClient = input.newClient
  if (!newClient?.name.trim()) {
    return { ok: false, error: "Elegí o cargá un cliente." }
  }
  if (!input.saveNewClient) {
    return {
      ok: false,
      error: "Marcá «Guardar cliente nuevo» o elegí uno de la cartera.",
    }
  }
  if (!perms.canCreateClient) {
    return {
      ok: false,
      error: "Sin permiso para crear clientes. Elegí uno existente.",
    }
  }

  const name = newClient.name.trim()
  if (!name) {
    return { ok: false, error: "Indicá el nombre o razón social del cliente." }
  }

  const { data: inserted, error } = await supabase
    .from("clients")
    .insert({
      pop_id: popId,
      name,
      email: newClient.email.trim() || null,
      phone: null,
      tax_id: newClient.taxId.trim() || null,
      notes: null,
      iva_condition: normalizeClientIvaCondition(newClient.ivaCondition),
      address_line: null,
      default_invoice_type_label: null,
      is_active: true,
    })
    .select("id")
    .single()

  if (error || !inserted?.id) {
    return {
      ok: false,
      error: error?.message ?? "No se pudo crear el cliente.",
    }
  }

  return { ok: true, clientId: String(inserted.id) }
}

function parseMoney(v: unknown): number {
  return roundServiceChargeMoney(Number(v ?? 0) || 0)
}

function mapChargeRow(
  row: Record<string, unknown>,
  paidByChargeId: Map<string, number>,
  today: string,
): ServiceChargeListRow {
  const client = row.clients as { name?: string } | null
  const service = row.service_types as {
    name?: string
    billing_period?: string
    billing_period_label?: string | null
  } | null
  const billingPeriodRaw = String(service?.billing_period ?? "monthly")
  const billingPeriod: ServiceBillingPeriod = isServiceBillingPeriod(
    billingPeriodRaw,
  )
    ? billingPeriodRaw
    : "monthly"
  const billingPeriodLabel =
    typeof service?.billing_period_label === "string" &&
    service.billing_period_label.trim()
      ? service.billing_period_label.trim()
      : null
  const amount = parseMoney(row.amount)
  const paidTotal = roundServiceChargeMoney(
    paidByChargeId.get(String(row.id)) ?? 0,
  )
  const balance = roundServiceChargeMoney(Math.max(0, amount - paidTotal))
  const storedStatus = String(row.status ?? "pending") as ServiceChargeStoredStatus
  const cancelledAt =
    typeof row.cancelled_at === "string" ? row.cancelled_at : null
  const dueDate = String(row.due_date ?? "")
  const effectiveStatus = resolveServiceChargeEffectiveStatus({
    storedStatus,
    cancelledAt,
    amount,
    paidTotal,
    dueDate,
    today,
  })
  const sequenceIndex = Number(row.sequence_index ?? 0) || 0
  const periodCount = Number(row.period_count ?? 1) || 1
  const periodStart =
    typeof row.period_start === "string" ? row.period_start : null
  const periodEnd = typeof row.period_end === "string" ? row.period_end : null

  return {
    id: String(row.id),
    clientId: String(row.client_id),
    clientName: String(client?.name ?? "—"),
    serviceTypeId: String(row.service_type_id),
    serviceName: String(service?.name ?? "—"),
    billingPeriod,
    billingPeriodLabel,
    billingScope: String(row.billing_scope ?? "one_period") as ServiceChargeBillingScope,
    paymentMode: String(row.payment_mode ?? "one_time") as ServiceChargePaymentMode,
    periodCount,
    sequenceIndex,
    periodStart,
    periodEnd,
    periodDisplay:
      periodStart && periodEnd
        ? periodStart === periodEnd
          ? periodStart
          : `${periodStart} → ${periodEnd}`
        : dueDate,
    unitPrice: parseMoney(row.unit_price),
    discountMode: (isServiceDiscountMode(String(row.discount_mode ?? "none"))
      ? String(row.discount_mode)
      : "none") as ServiceDiscountMode,
    discountValue:
      row.discount_value == null || row.discount_value === ""
        ? null
        : parseMoney(row.discount_value),
    amount,
    paidTotal,
    balance,
    dueDate,
    storedStatus,
    effectiveStatus,
    cancelledAt,
    notes: String(row.notes ?? ""),
    createdAt: String(row.created_at ?? ""),
  }
}

function computeStats(rows: ServiceChargeListRow[]): ActiveServicesStats {
  const activeClientIds = new Set<string>()
  let activeCharges = 0
  let overdueCharges = 0
  let cancelledCharges = 0

  for (const row of rows) {
    if (row.effectiveStatus === "cancelled") {
      cancelledCharges += 1
      continue
    }
    if (row.balance > 0) {
      activeCharges += 1
      activeClientIds.add(row.clientId)
    }
    if (row.effectiveStatus === "overdue") overdueCharges += 1
  }

  return {
    activeClients: activeClientIds.size,
    activeCharges,
    overdueCharges,
    cancelledCharges,
  }
}

export async function getActiveServicesPageData(
  popId: string,
  input: GetActiveServicesInput = {},
): Promise<
  | {
      success: true
      stats: ActiveServicesStats
      charges: ServiceChargeListRow[]
      canCreate: boolean
      canUpdate: boolean
      canReadClients: boolean
      canCreateClient: boolean
      canUpdateClient: boolean
      paymentMethods: ServiceChargePaymentMethodOption[]
      treasuryPaymentContext: TreasuryPaymentContext | null
    }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await chargePermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver servicios activos." }
    }

    const view = isActiveServicesViewFilter(input.view) ? input.view : "clients"
    const clientQ = input.clientQ?.trim() ?? ""
    const supabase = await createClient()
    const today = new Date().toISOString().slice(0, 10)

    let query = supabase
      .from("service_charges")
      .select(CHARGE_SELECT)
      .eq("pop_id", popId)
      .order("due_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(500)

    const { data: chargeRows, error: chargeError } = await query
    if (chargeError) return { success: false, error: chargeError.message }

    const chargeIds = (chargeRows ?? []).map((r) => String(r.id))
    const paidByChargeId = new Map<string, number>()

    if (chargeIds.length > 0) {
      const { data: paymentRows, error: paymentError } = await supabase
        .from("service_charge_payments")
        .select("service_charge_id, amount")
        .eq("pop_id", popId)
        .in("service_charge_id", chargeIds)
      if (paymentError) return { success: false, error: paymentError.message }
      for (const p of paymentRows ?? []) {
        const id = String(p.service_charge_id)
        paidByChargeId.set(
          id,
          roundServiceChargeMoney((paidByChargeId.get(id) ?? 0) + parseMoney(p.amount)),
        )
      }
    }

    const allRows = (chargeRows ?? []).map((row) =>
      mapChargeRow(row as Record<string, unknown>, paidByChargeId, today),
    )
    const stats = computeStats(allRows)
    let charges = allRows.filter((row) =>
      chargeMatchesViewFilter(row.effectiveStatus, view),
    )
    if (clientQ) {
      const q = clientQ.toLowerCase()
      charges = charges.filter(
        (row) =>
          row.clientName.toLowerCase().includes(q) ||
          row.serviceName.toLowerCase().includes(q) ||
          row.notes.toLowerCase().includes(q),
      )
    }

    const treasuryRes = await getTreasuryPaymentContext(popId)
    const paymentMethods = treasuryRes.success
      ? buildPayPaymentOptions(treasuryRes.context)
      : []
    const treasuryPaymentContext = treasuryRes.success ? treasuryRes.context : null

    return {
      success: true,
      stats,
      charges,
      canCreate: perms.canCreate,
      canUpdate: perms.canUpdate,
      canReadClients: perms.canReadClients,
      canCreateClient: perms.canCreateClient,
      canUpdateClient: perms.canUpdateClient,
      paymentMethods,
      treasuryPaymentContext,
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

async function loadServiceTypeChargeAddonsByServiceIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  serviceIds: string[],
): Promise<Map<string, ServiceTypeChargeAddonOption[]>> {
  const byService = new Map<string, ServiceTypeChargeAddonOption[]>()
  if (serviceIds.length === 0) return byService

  const { data, error } = await supabase
    .from("service_type_addons")
    .select("id, service_type_id, name, price, sort_order")
    .eq("pop_id", popId)
    .in("service_type_id", serviceIds)
    .order("sort_order", { ascending: true })

  if (error) return byService

  for (const row of data ?? []) {
    const serviceId = String(row.service_type_id)
    const current = byService.get(serviceId) ?? []
    current.push({
      id: String(row.id),
      name: String(row.name ?? ""),
      price: parseMoney(row.price),
    })
    byService.set(serviceId, current)
  }

  return byService
}

export async function getServiceTypeChargeOptions(popId: string): Promise<
  | { success: true; services: ServiceTypeChargeOption[] }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await chargePermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso." }
    }
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("service_types")
      .select(
        "id, name, description, image_url, default_price, billing_period, billing_period_label, payment_timing, due_days_after, category_id, service_categories ( name )",
      )
      .eq("pop_id", popId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("name", { ascending: true })
    if (error) return { success: false, error: error.message }

    const serviceIds = (data ?? []).map((row) => String(row.id))
    const addonsByService = await loadServiceTypeChargeAddonsByServiceIds(
      supabase,
      popId,
      serviceIds,
    )

    return {
      success: true,
      services: (data ?? []).map((row) => {
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
        const paymentTimingRaw = String(row.payment_timing ?? "end_of_period")
        const paymentTiming: ServicePaymentTiming = isServicePaymentTiming(
          paymentTimingRaw,
        )
          ? paymentTimingRaw
          : "end_of_period"
        const dueDaysAfterRaw = Number(row.due_days_after ?? 0)
        const dueDaysAfter =
          Number.isFinite(dueDaysAfterRaw) && dueDaysAfterRaw >= 0
            ? Math.min(365, Math.floor(dueDaysAfterRaw))
            : 0
        const categoryRow = row.service_categories as { name?: string } | null
        const categoryId =
          row.category_id != null ? String(row.category_id) : null
        const categoryName =
          categoryRow?.name && String(categoryRow.name).trim()
            ? String(categoryRow.name).trim()
            : null
        return {
          id: String(row.id),
          name: String(row.name ?? ""),
          description: String(row.description ?? ""),
          imageUrl:
            typeof row.image_url === "string" && row.image_url.trim()
              ? row.image_url.trim()
              : null,
          defaultPrice: parseMoney(row.default_price),
          billingPeriod,
          billingPeriodLabel,
          billingPeriodDisplay: billingPeriodDisplayLabel(
            billingPeriod,
            billingPeriodLabel,
          ),
          paymentTiming,
          dueDaysAfter,
          categoryId,
          categoryName,
          addons: addonsByService.get(String(row.id)) ?? [],
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

function validateCreateInput(
  input: CreateServiceChargeInput,
  billingPeriod: ServiceBillingPeriod,
): { ok: true } | { ok: false; error: string } {
  const hasExistingClient = Boolean(input.clientId?.trim())
  const hasNewClient = Boolean(input.newClient?.name.trim())
  if (hasExistingClient && hasNewClient) {
    return { ok: false, error: "Elegí o cargá un cliente." }
  }
  if (!hasExistingClient && !hasNewClient) {
    return { ok: false, error: "Elegí o cargá un cliente." }
  }
  if (hasNewClient && input.saveNewClient !== true) {
    return {
      ok: false,
      error: "Marcá «Guardar cliente nuevo» o elegí uno de la cartera.",
    }
  }
  if (input.updateExistingClient && !hasExistingClient) {
    return { ok: false, error: "Elegí un cliente de la cartera." }
  }
  if (input.clientId?.trim() && !isUuid(input.clientId.trim())) {
    return { ok: false, error: "Elegí un cliente válido." }
  }
  if (!isUuid(input.serviceTypeId.trim())) {
    return { ok: false, error: "Elegí un servicio válido." }
  }
  if (!isServiceChargeBillingScope(input.billingScope)) {
    return { ok: false, error: "Alcance de facturación inválido." }
  }
  const allowedScopes = availableBillingScopesForService(billingPeriod)
  if (!allowedScopes.includes(input.billingScope)) {
    return {
      ok: false,
      error: "El alcance elegido no aplica a la periodicidad del servicio.",
    }
  }
  if (input.billingScope === "multi_period") {
    const periodCount = Math.floor(Number(input.periodCount))
    if (!Number.isFinite(periodCount) || periodCount < 1 || periodCount > 120) {
      return {
        ok: false,
        error: "La cantidad de períodos debe ser entre 1 y 120.",
      }
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.periodStartDate.trim())) {
    return { ok: false, error: "Indicá una fecha de inicio del período válida." }
  }
  if (billingPeriodRequiresManualPeriodEnd(billingPeriod)) {
    const periodEnd = input.periodEndDate?.trim() ?? ""
    if (!/^\d{4}-\d{2}-\d{2}$/.test(periodEnd)) {
      return { ok: false, error: "Indicá una fecha de fin del período válida." }
    }
    if (periodEnd < input.periodStartDate.trim()) {
      return {
        ok: false,
        error: "El fin del período no puede ser anterior al inicio.",
      }
    }
  }
  if (!isServicePaymentTiming(input.paymentTiming)) {
    return { ok: false, error: "Momento de pago inválido." }
  }
  if (
    !Number.isFinite(input.dueDaysAfter) ||
    input.dueDaysAfter < 0 ||
    input.dueDaysAfter > 365
  ) {
    return {
      ok: false,
      error: "El vencimiento debe estar entre 0 y 365 días.",
    }
  }
  const unitPrice = parseMoney(input.unitPrice)
  if (unitPrice < 0) return { ok: false, error: "Precio inválido." }
  const discountMode = isServiceDiscountMode(input.discountMode)
    ? input.discountMode
    : "none"
  if (
    discountMode === "porcentaje" &&
    input.discountValue != null &&
    (input.discountValue <= 0 || input.discountValue > 100)
  ) {
    return { ok: false, error: "Descuento porcentual inválido." }
  }
  return { ok: true }
}

export async function createServiceCharges(
  popId: string,
  input: CreateServiceChargeInput,
): Promise<
  | { success: true; chargeIds: string[]; count: number }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await chargePermissionFlags(popId)
    if (!perms.canCreate) {
      return { success: false, error: "Sin permiso para crear cargos." }
    }

    const user = await requireAuthenticatedUser()
    const supabase = await createClient()

    const clientResolved = await resolveServiceChargeClientId(popId, input, perms)
    if (!clientResolved.ok) {
      return { success: false, error: clientResolved.error }
    }
    const clientId = clientResolved.clientId

    const { data: serviceRow } = await supabase
      .from("service_types")
      .select(
        "id, billing_period, payment_timing, due_days_after",
      )
      .eq("id", input.serviceTypeId.trim())
      .eq("pop_id", popId)
      .is("deleted_at", null)
      .maybeSingle()
    if (!serviceRow?.id) {
      return { success: false, error: "El servicio no existe en este POP." }
    }

    const billingPeriodRaw = String(serviceRow.billing_period ?? "monthly")
    const billingPeriod: ServiceBillingPeriod = isServiceBillingPeriod(
      billingPeriodRaw,
    )
      ? billingPeriodRaw
      : "monthly"

    const validation = validateCreateInput(input, billingPeriod)
    if (!validation.ok) return { success: false, error: validation.error }

    const paymentTiming = input.paymentTiming
    const dueDaysAfter = Math.min(365, Math.floor(input.dueDaysAfter))

    const discountMode = isServiceDiscountMode(input.discountMode)
      ? input.discountMode
      : "none"
    const discountValue =
      discountMode === "none" ? null : input.discountValue
    const unitPrice = parseMoney(input.unitPrice)
    const amount = computeChargeAmount(unitPrice, discountMode, discountValue)

    const periodStartDate = input.periodStartDate.trim()
    const notes = input.notes?.trim() ?? ""

    const buildChargeRow = (
      index: number,
      chargeCount: number,
      billingScope: ServiceChargeBillingScope,
      chargeGroupId: string | null,
      subscriptionId: string | null,
    ) => {
      const { periodStart, periodEnd } = resolveChargePeriodRange(
        index,
        billingPeriod,
        periodStartDate,
        input.periodEndDate,
      )
      const dueDate = computeChargeDueDate(
        periodStart,
        periodEnd,
        paymentTiming,
        dueDaysAfter,
      )
      return {
        pop_id: popId,
        client_id: clientId,
        service_type_id: input.serviceTypeId.trim(),
        subscription_id: subscriptionId,
        charge_group_id: chargeGroupId,
        sequence_index: index,
        billing_scope: billingScope,
        period_count: chargeCount,
        payment_mode: "one_time" as ServiceChargePaymentMode,
        period_start: periodStart,
        period_end: periodEnd,
        unit_price: unitPrice,
        discount_mode: discountMode,
        discount_value: discountValue,
        amount,
        due_date: dueDate,
        status: "pending",
        notes,
        created_by: user.uid,
      }
    }

    if (input.billingScope === "subscription") {
      const { data: subscription, error: subError } = await supabase
        .from("service_subscriptions")
        .insert({
          pop_id: popId,
          client_id: clientId,
          service_type_id: input.serviceTypeId.trim(),
          status: "active",
          period_start: periodStartDate,
          unit_price: unitPrice,
          discount_mode: discountMode,
          discount_value: discountValue,
          notes,
          created_by: user.uid,
        })
        .select("id")
        .single()
      if (subError || !subscription?.id) {
        return {
          success: false,
          error: subError?.message ?? "No se pudo crear la suscripción.",
        }
      }

      const subscriptionId = String(subscription.id)
      const { data, error } = await supabase
        .from("service_charges")
        .insert([buildChargeRow(0, 1, "subscription", null, subscriptionId)])
        .select("id")
      if (error) return { success: false, error: error.message }

      const chargeIds = (data ?? []).map((r) => String(r.id))
      return { success: true, chargeIds, count: chargeIds.length }
    }

    const chargeCount =
      input.billingScope === "one_period" ? 1 : Math.floor(input.periodCount)
    const chargeGroupId = chargeCount > 1 ? crypto.randomUUID() : null
    const rows = Array.from({ length: chargeCount }, (_, index) =>
      buildChargeRow(
        index,
        chargeCount,
        input.billingScope,
        chargeGroupId,
        null,
      ),
    )

    const { data, error } = await supabase
      .from("service_charges")
      .insert(rows)
      .select("id")
    if (error) return { success: false, error: error.message }

    const chargeIds = (data ?? []).map((r) => String(r.id))
    return { success: true, chargeIds, count: chargeIds.length }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function recordServiceChargePayment(
  popId: string,
  chargeId: string,
  amount: number,
  paidAt: string,
  paymentKind: string | null,
  treasuryAccountId: string | null,
  notes?: string,
  checkDetails?: CheckoutCheckDetails | null,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await chargePermissionFlags(popId)
    if (!perms.canUpdate) {
      return { success: false, error: "Sin permiso para registrar cobros." }
    }
    if (!isUuid(chargeId)) return { success: false, error: "Cargo inválido." }
    const amt = roundServiceChargeMoney(amount)
    if (!(amt > 0)) {
      return { success: false, error: "El importe debe ser mayor a cero." }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(paidAt.trim())) {
      return { success: false, error: "Fecha de cobro inválida." }
    }

    const user = await requireAuthenticatedUser()
    const supabase = await createClient()

    const kind = paymentKind?.trim() || null
    let taId = treasuryAccountId?.trim() || null
    let parsedCheck: CheckoutCheckDetails | null = null
    if (kind && !isValidOperationPaymentKind(kind)) {
      return { success: false, error: "Tipo de pago inválido." }
    }
    if (kind === "check") {
      const parsed = parseCheckoutCheckDetails(checkDetails)
      if (!parsed.ok) return { success: false, error: parsed.error }
      parsedCheck = parsed.details
      const checkTreasuryId = await resolveCheckTreasuryAccountId(
        supabase,
        popId,
        "received",
      )
      if (!checkTreasuryId) {
        return {
          success: false,
          error: "Faltan las cuentas de cheques. Recargá la página o contactá a soporte.",
        }
      }
      taId = checkTreasuryId
    }
    if (kind && taId) {
      const { data: taRow, error: taErr } = await supabase
        .from("treasury_accounts")
        .select("id")
        .eq("id", taId)
        .eq("pop_id", popId)
        .eq("is_active", true)
        .maybeSingle()
      if (taErr) return { success: false, error: taErr.message }
      if (!taRow) {
        return { success: false, error: "Cuenta de tesorería inválida." }
      }
    }

    const { data: charge, error: chargeError } = await supabase
      .from("service_charges")
      .select("id, amount, status, cancelled_at, client_id")
      .eq("id", chargeId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (chargeError) return { success: false, error: chargeError.message }
    if (!charge) return { success: false, error: "No se encontró el cargo." }
    if (charge.cancelled_at || charge.status === "cancelled") {
      return { success: false, error: "No podés cobrar un cargo cancelado." }
    }

    const { data: existingPayments } = await supabase
      .from("service_charge_payments")
      .select("amount")
      .eq("service_charge_id", chargeId)
    const paidTotal = roundServiceChargeMoney(
      (existingPayments ?? []).reduce(
        (sum, row) => sum + parseMoney(row.amount),
        0,
      ),
    )
    const chargeAmount = parseMoney(charge.amount)
    const balance = roundServiceChargeMoney(chargeAmount - paidTotal)
    if (amt > balance + 0.009) {
      return {
        success: false,
        error: `El cobro supera el saldo pendiente (${balance.toLocaleString("es-AR")}).`,
      }
    }

    let checkId: string | null = null
    if (kind === "check" && parsedCheck) {
      const checkRes = await insertCheckoutCheck(supabase, {
        popId,
        userId: user.uid,
        direction: "received",
        amount: amt,
        details: {
          ...parsedCheck,
          partyId: parsedCheck.partyId || String(charge.client_id ?? ""),
        },
        sourceKind: "service_charge",
        sourceId: chargeId,
      })
      if (!checkRes.success) return checkRes
      checkId = checkRes.checkId
    }

    const { data: payIns, error: insertError } = await supabase
      .from("service_charge_payments")
      .insert({
        pop_id: popId,
        service_charge_id: chargeId,
        amount: amt,
        paid_at: paidAt.trim(),
        payment_kind: kind,
        treasury_account_id: taId,
        notes: notes?.trim() ?? "",
        created_by: user.uid,
        check_id: checkId,
      })
      .select("id")
      .maybeSingle()
    if (insertError || !payIns?.id) {
      if (checkId) await deleteCheckoutCheck(supabase, checkId)
      return {
        success: false,
        error: insertError?.message || "No se pudo registrar el cobro.",
      }
    }
    const paymentId = String(payIns.id)

    if (kind && taId) {
      const ledger = await postServiceChargePaymentLedger(supabase, {
        popId,
        userId: user.uid,
        serviceChargePaymentId: paymentId,
      })
      if (!ledger.success) {
        await supabase
          .from("service_charge_payments")
          .delete()
          .eq("id", paymentId)
          .eq("pop_id", popId)
        if (checkId) await deleteCheckoutCheck(supabase, checkId)
        return { success: false, error: ledger.error }
      }
    }

    const nextPaid = roundServiceChargeMoney(paidTotal + amt)
    const nextStatus = deriveStoredStatusFromPayments(
      chargeAmount,
      nextPaid,
      String(charge.status) as ServiceChargeStoredStatus,
    )
    const { error: updateError } = await supabase
      .from("service_charges")
      .update({ status: nextStatus })
      .eq("id", chargeId)
      .eq("pop_id", popId)
    if (updateError) return { success: false, error: updateError.message }

    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}

export async function cancelServiceCharge(
  popId: string,
  chargeId: string,
  reason?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await chargePermissionFlags(popId)
    if (!perms.canUpdate) {
      return { success: false, error: "Sin permiso para cancelar cargos." }
    }
    if (!isUuid(chargeId)) return { success: false, error: "Cargo inválido." }

    const supabase = await createClient()
    const { data: charge } = await supabase
      .from("service_charges")
      .select("id, status, cancelled_at")
      .eq("id", chargeId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (!charge) return { success: false, error: "No se encontró el cargo." }
    if (charge.cancelled_at || charge.status === "cancelled") {
      return { success: true }
    }

    const { error } = await supabase
      .from("service_charges")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancel_reason: reason?.trim() ?? "",
      })
      .eq("id", chargeId)
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

const CHARGE_SERVICE_DETAIL_SELECT = `
  id,
  name,
  description,
  image_url,
  default_price,
  billing_period,
  billing_period_label,
  payment_timing,
  due_days_after,
  details_grid,
  contract_text,
  late_interest_type,
  late_interest_value,
  discount_mode,
  discount_value,
  category_id,
  service_categories ( name )
`

function mapServiceTypeChargeDetail(
  row: Record<string, unknown>,
  articles: ServiceTypeChargeDetailArticle[],
  addons: ServiceTypeChargeAddonOption[] = [],
): ServiceTypeChargeDetail {
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
  const paymentTimingRaw = String(row.payment_timing ?? "end_of_period")
  const paymentTiming: ServicePaymentTiming = isServicePaymentTiming(
    paymentTimingRaw,
  )
    ? paymentTimingRaw
    : "end_of_period"
  const dueDaysAfterRaw = Number(row.due_days_after ?? 0)
  const dueDaysAfter =
    Number.isFinite(dueDaysAfterRaw) && dueDaysAfterRaw >= 0
      ? Math.min(365, Math.floor(dueDaysAfterRaw))
      : 0
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
  const categoryRow = row.service_categories as { name?: string } | null
  const categoryId =
    row.category_id != null ? String(row.category_id) : null
  const categoryName =
    categoryRow?.name && String(categoryRow.name).trim()
      ? String(categoryRow.name).trim()
      : null

  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    imageUrl:
      typeof row.image_url === "string" && row.image_url.trim()
        ? row.image_url.trim()
        : null,
    defaultPrice: parseMoney(row.default_price),
    billingPeriod,
    billingPeriodLabel,
    billingPeriodDisplay: billingPeriodDisplayLabel(
      billingPeriod,
      billingPeriodLabel,
    ),
    paymentTiming,
    dueDaysAfter,
    categoryId,
    categoryName,
    detailsGrid: parseServiceDetailsGrid(row.details_grid),
    contractText:
      typeof row.contract_text === "string" ? row.contract_text : "",
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
    addons,
  }
}

export async function getServiceTypeChargeDetail(
  popId: string,
  serviceTypeId: string,
): Promise<
  | { success: true; service: ServiceTypeChargeDetail }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await chargePermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver servicios." }
    }
    if (!isUuid(serviceTypeId)) {
      return { success: false, error: "Servicio inválido." }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("service_types")
      .select(CHARGE_SERVICE_DETAIL_SELECT)
      .eq("id", serviceTypeId)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle()
    if (error) return { success: false, error: error.message }
    if (!data) return { success: false, error: "No se encontró el servicio." }

    const { data: articleRows } = await supabase
      .from("service_type_articles")
      .select(
        `
        quantity,
        articles ( name, unit_of_measure )
      `,
      )
      .eq("pop_id", popId)
      .eq("service_type_id", serviceTypeId)
      .order("sort_order", { ascending: true })

    const articles: ServiceTypeChargeDetailArticle[] = (articleRows ?? []).map(
      (row) => {
        const article = row.articles as {
          name?: string
          unit_of_measure?: string
        } | null
        return {
          articleName: String(article?.name ?? "—"),
          quantity: Number(row.quantity ?? 0) || 0,
          unitOfMeasure: String(article?.unit_of_measure ?? "u").trim() || "u",
        }
      },
    )

    const addonsByService = await loadServiceTypeChargeAddonsByServiceIds(
      supabase,
      popId,
      [serviceTypeId],
    )

    return {
      success: true,
      service: mapServiceTypeChargeDetail(
        data as Record<string, unknown>,
        articles,
        addonsByService.get(serviceTypeId) ?? [],
      ),
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    }
  }
}
