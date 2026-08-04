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
import { createClient } from "@/utils/supabase/server"
import { clientDeleteConfirmPhrase } from "@/app/[siteId]/[popId]/clients/clientConstants"
import { CLIENT_IVA_CONDITION_VALUES } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import {
  CLIENT_TABLE_PAGE_SIZES,
  DEFAULT_CLIENT_TABLE_PAGE_SIZE,
} from "@/app/[siteId]/[popId]/clients/workspaceUrl"
import { isAllowedSaleComprobanteLabel } from "@/lib/saleComprobantePicker"
import { hasValidPopFiscalCuit } from "@/lib/popFiscalCuit"

function normalizeIvaCondition(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  return (CLIENT_IVA_CONDITION_VALUES as readonly string[]).includes(t)
    ? t
    : null
}

async function normalizeDefaultInvoiceTypeLabel(
  popId: string,
  raw: string,
): Promise<string | null> {
  const t = raw.trim()
  if (!t) return null
  const siteId = await getPopSiteId(popId)
  const popRes = await getPopById(popId)
  const hasValidFiscalCuit =
    popRes.success && popRes.pop?.fiscalCuit
      ? hasValidPopFiscalCuit(popRes.pop.fiscalCuit)
      : false
  const settings =
    popRes.success && popRes.pop?.settings
      ? (popRes.pop.settings as Record<string, unknown>)
      : null
  const emisorIva =
    settings?.fiscal_iva_condition === "monotributo"
      ? "monotributo"
      : "responsable_inscripto"
  if (
    !isAllowedSaleComprobanteLabel(
      siteId,
      t,
      emisorIva,
      hasValidFiscalCuit,
    )
  ) {
    return null
  }
  return t
}

function aggregateCompletedSalesByClient(
  rows: { client_id: string | null; total: unknown; sold_at: string }[],
): Map<
  string,
  { lastSaleAt: string | null; count: number; totalSpentArs: number }
> {
  const map = new Map<
    string,
    { lastMs: number; count: number; totalSpentArs: number }
  >()
  for (const r of rows) {
    const cid = r.client_id
    if (!cid) continue
    const n =
      typeof r.total === "number"
        ? r.total
        : typeof r.total === "string"
          ? Number(r.total)
          : NaN
    const total = Number.isFinite(n) ? n : 0
    const soldMs = r.sold_at ? Date.parse(r.sold_at) : NaN
    const cur = map.get(cid) ?? { lastMs: -1, count: 0, totalSpentArs: 0 }
    cur.count += 1
    cur.totalSpentArs += total
    if (Number.isFinite(soldMs) && soldMs > cur.lastMs) cur.lastMs = soldMs
    map.set(cid, cur)
  }
  const out = new Map<
    string,
    { lastSaleAt: string | null; count: number; totalSpentArs: number }
  >()
  for (const [cid, v] of map) {
    out.set(cid, {
      lastSaleAt: v.lastMs >= 0 ? new Date(v.lastMs).toISOString() : null,
      count: v.count,
      totalSpentArs: v.totalSpentArs,
    })
  }
  return out
}

export type ClientTableRow = {
  id: string
  name: string
  email: string
  phone: string
  taxId: string
  notes: string
  ivaCondition: string | null
  addressLine: string
  defaultInvoiceTypeLabel: string | null
  isActive: boolean
  lastSaleAt: string | null
  completedSalesCount: number
  totalSpentArs: number
}

export type UpsertPopClientInput = {
  name: string
  email: string
  phone: string
  taxId: string
  notes: string
  ivaCondition: string
  addressLine: string
  defaultInvoiceTypeLabel: string
  isActive: boolean
}

export async function createPopClient(
  popId: string,
  input: UpsertPopClientInput,
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
        POP_PERMS.CLIENT_CREATE.resource,
        POP_PERMS.CLIENT_CREATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para crear clientes." }
    }
    const name = input.name.trim()
    if (!name) {
      return { success: false, error: "Name is required." }
    }
    const supabase = await createClient()
    const defaultInvoiceTypeLabel = await normalizeDefaultInvoiceTypeLabel(
      popId,
      input.defaultInvoiceTypeLabel,
    )
    const { error } = await supabase.from("clients").insert({
      pop_id: popId,
      name,
      email: input.email.trim() || null,
      phone: input.phone.trim() || null,
      tax_id: input.taxId.trim() || null,
      notes: input.notes.trim() || null,
      iva_condition: normalizeIvaCondition(input.ivaCondition),
      address_line: input.addressLine.trim() || null,
      default_invoice_type_label: defaultInvoiceTypeLabel,
      is_active: input.isActive,
    })
    if (error) {
      return { success: false, error: error.message || "Could not create." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { success: false, error: message }
  }
}

export async function updatePopClient(
  popId: string,
  clientId: string,
  input: UpsertPopClientInput,
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
        POP_PERMS.CLIENT_UPDATE.resource,
        POP_PERMS.CLIENT_UPDATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para editar clientes." }
    }
    const name = input.name.trim()
    if (!name) {
      return { success: false, error: "Name is required." }
    }
    const supabase = await createClient()
    const defaultInvoiceTypeLabel = await normalizeDefaultInvoiceTypeLabel(
      popId,
      input.defaultInvoiceTypeLabel,
    )
    const { error } = await supabase
      .from("clients")
      .update({
        name,
        email: input.email.trim() || null,
        phone: input.phone.trim() || null,
        tax_id: input.taxId.trim() || null,
        notes: input.notes.trim() || null,
        iva_condition: normalizeIvaCondition(input.ivaCondition),
        address_line: input.addressLine.trim() || null,
        default_invoice_type_label: defaultInvoiceTypeLabel,
        is_active: input.isActive,
      })
      .eq("id", clientId)
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "Could not save." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { success: false, error: message }
  }
}

export async function deletePopClient(
  popId: string,
  clientId: string,
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
        POP_PERMS.CLIENT_DELETE.resource,
        POP_PERMS.CLIENT_DELETE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para eliminar clientes." }
    }
    const supabase = await createClient()
    const { data: client, error: fetchError } = await supabase
      .from("clients")
      .select("name")
      .eq("id", clientId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (fetchError) {
      return {
        success: false,
        error: fetchError.message || "No se encontró el cliente.",
      }
    }
    if (!client) {
      return { success: false, error: "No se encontró el cliente." }
    }
    const expectedPhrase = clientDeleteConfirmPhrase(String(client.name ?? ""))
    if (confirmationTyped.trim() !== expectedPhrase) {
      return {
        success: false,
        error: `Escribí (${expectedPhrase}) para confirmar el borrado.`,
      }
    }
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId)
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "Could not delete." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { success: false, error: message }
  }
}

export type GetPopClientsTableInput = {
  page: number
  pageSize: number
  search: string
  soloActivos: boolean
  withEmail: boolean
  withTaxId: boolean
}

function normalizeClientsListPaging(page: number, pageSize: number) {
  const sizes = new Set<number>(CLIENT_TABLE_PAGE_SIZES as unknown as number[])
  const ps = sizes.has(pageSize) ? pageSize : DEFAULT_CLIENT_TABLE_PAGE_SIZE
  const p = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1
  return { page: p, pageSize: ps }
}

function escapeIlikeToken(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

function buildClientsSearchOrClause(raw: string): string | null {
  const t = raw.trim().replace(/,/g, " ").trim()
  if (!t) return null
  const pattern = `%${escapeIlikeToken(t)}%`
  const cols = [
    "name",
    "email",
    "phone",
    "tax_id",
    "notes",
    "address_line",
    "iva_condition",
  ] as const
  return cols.map((c) => `${c}.ilike.${pattern}`).join(",")
}

const CLIENT_LIST_SELECT =
  "id, name, email, phone, tax_id, notes, iva_condition, address_line, default_invoice_type_label, is_active"

function appendClientListFilters<
  Q extends {
    eq: (a: string, b: string | boolean) => Q
    neq: (a: string, b: string) => Q
    or: (s: string) => Q
  },
>(q: Q, input: GetPopClientsTableInput): Q {
  let x = q
  if (input.soloActivos) {
    x = x.eq("is_active", true)
  }
  if (input.withEmail) {
    x = x.neq("email", "")
  }
  if (input.withTaxId) {
    x = x.neq("tax_id", "")
  }
  const orClause = buildClientsSearchOrClause(input.search)
  if (orClause) {
    x = x.or(orClause)
  }
  return x
}

export async function getPopClientsTable(
  popId: string,
  input: GetPopClientsTableInput,
): Promise<
  | {
      success: true
      clients: ClientTableRow[]
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
      clients: ClientTableRow[]
      totalCount: number
      page: number
      popName?: string
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
> {
  const empty = {
    clients: [] as ClientTableRow[],
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
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.CLIENT_READ.resource,
        POP_PERMS.CLIENT_READ.action,
      )
    ) {
      return {
        success: false,
        error: "You do not have permission to view clients for this store.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
        ...empty,
        popName: "",
      }
    }
    const canCreate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.CLIENT_CREATE.resource,
      POP_PERMS.CLIENT_CREATE.action,
    )
    const canUpdate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.CLIENT_UPDATE.resource,
      POP_PERMS.CLIENT_UPDATE.action,
    )
    const canDelete = permissionKeysInclude(
      snap.keys,
      POP_PERMS.CLIENT_DELETE.resource,
      POP_PERMS.CLIENT_DELETE.action,
    )
    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""
    const { page: reqPage, pageSize } = normalizeClientsListPaging(
      input.page,
      input.pageSize,
    )

    const supabase = await createClient()

    let countQuery = supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("pop_id", popId)
    countQuery = appendClientListFilters(countQuery, input)

    const { count: countRaw, error: countErr } = await countQuery
    if (countErr) {
      return {
        success: false,
        error: countErr.message || "Could not load clients.",
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
      .from("clients")
      .select(CLIENT_LIST_SELECT)
      .eq("pop_id", popId)
    dataQuery = appendClientListFilters(dataQuery, input)
    dataQuery = dataQuery.order("name", { ascending: true }).range(from, to)

    const { data, error } = await dataQuery
    if (error) {
      return {
        success: false,
        error: error.message || "Could not load clients.",
        ...empty,
        popName,
      }
    }

    const clientRows = data || []
    const clientIds = clientRows.map((r) => String(r.id))
    let agg = new Map<
      string,
      { lastSaleAt: string | null; count: number; totalSpentArs: number }
    >()
    if (clientIds.length > 0) {
      const { data: saleRows, error: salesErr } = await supabase
        .from("sales")
        .select("client_id, total, sold_at")
        .eq("pop_id", popId)
        .eq("status", "completed")
        .not("client_id", "is", null)
        .in("client_id", clientIds)
      if (!salesErr && saleRows?.length) {
        agg = aggregateCompletedSalesByClient(
          saleRows as {
            client_id: string | null
            total: unknown
            sold_at: string
          }[],
        )
      }
    }
    const clients: ClientTableRow[] = clientRows.map((r) => {
      const id = String(r.id)
      const a = agg.get(id)
      const ivaRaw = r.iva_condition
      const ivaStr =
        typeof ivaRaw === "string" && ivaRaw.trim() !== ""
          ? ivaRaw.trim()
          : null
      return {
        id,
        name: String(r.name ?? ""),
        email: String(r.email ?? ""),
        phone: String(r.phone ?? ""),
        taxId: String(r.tax_id ?? ""),
        notes: String(r.notes ?? ""),
        ivaCondition: ivaStr,
        addressLine: String(r.address_line ?? ""),
        defaultInvoiceTypeLabel:
          r.default_invoice_type_label != null &&
          String(r.default_invoice_type_label).trim() !== ""
            ? String(r.default_invoice_type_label).trim()
            : null,
        isActive: Boolean(r.is_active ?? true),
        lastSaleAt: a?.lastSaleAt ?? null,
        completedSalesCount: a?.count ?? 0,
        totalSpentArs: a?.totalSpentArs ?? 0,
      }
    })
    return {
      success: true,
      clients,
      totalCount,
      page: safePage,
      popName,
      canCreate,
      canUpdate,
      canDelete,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return {
      success: false,
      error: message,
      ...empty,
      popName: "",
    }
  }
}
