"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import type { OperationPartyCatalogItem } from "@/lib/operationPartyPicker"
import { CLIENT_IVA_CONDITION_VALUES } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { createClient } from "@/utils/supabase/server"

const CHECKOUT_PARTY_SEARCH_LIMIT = 8

export type CreateCheckoutClientInput = {
  name: string
  taxId: string
  email: string
  ivaCondition: string
}

function normalizeClientIvaCondition(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  return (CLIENT_IVA_CONDITION_VALUES as readonly string[]).includes(t) ? t : null
}

function mapCheckoutClientRow(c: {
  id: string
  name: string | null
  tax_id: string | null
  email?: string | null
  iva_condition: string | null
  default_invoice_type_label: string | null
  current_account_enabled?: boolean | null
}): OperationPartyCatalogItem {
  return {
    id: String(c.id),
    name: String(c.name ?? ""),
    taxId: c.tax_id != null ? String(c.tax_id) : null,
    email: c.email != null && String(c.email).trim() !== "" ? String(c.email).trim() : null,
    ivaCondition:
      c.iva_condition != null && String(c.iva_condition).trim() !== ""
        ? String(c.iva_condition).trim()
        : null,
    defaultInvoiceTypeLabel:
      c.default_invoice_type_label != null &&
      String(c.default_invoice_type_label).trim() !== ""
        ? String(c.default_invoice_type_label).trim()
        : null,
    currentAccountEnabled: c.current_account_enabled === true,
  }
}

function escapeIlikeToken(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

function buildPartySearchOrClause(raw: string): string | null {
  const t = raw.trim().replace(/,/g, " ").trim()
  if (!t) return null
  const pattern = `%${escapeIlikeToken(t)}%`
  return [`name.ilike.${pattern}`, `tax_id.ilike.${pattern}`].join(",")
}

export async function searchCheckoutClients(
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

    const snap = await loadPopPermissionsSnapshot(popId)
    const canRead = permissionKeysInclude(
      snap.keys,
      POP_PERMS.SALE_READ.resource,
      POP_PERMS.SALE_READ.action,
    )
    if (!canRead) {
      return { success: false, error: "Sin permiso para buscar clientes." }
    }

    const orClause = buildPartySearchOrClause(trimmed)
    if (!orClause) {
      return { success: true, parties: [] }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("clients")
      .select(
        "id, name, tax_id, email, iva_condition, default_invoice_type_label, is_active, current_account_enabled",
      )
      .eq("pop_id", popId)
      .eq("is_active", true)
      .or(orClause)
      .order("name", { ascending: true })
      .limit(CHECKOUT_PARTY_SEARCH_LIMIT)

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      parties: (data ?? []).map((c) => mapCheckoutClientRow(c)),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function createCheckoutClient(
  popId: string,
  input: CreateCheckoutClientInput,
): Promise<
  | { success: true; party: OperationPartyCatalogItem }
  | { success: false; error: string }
> {
  const name = input.name.trim()
  if (!name) {
    return { success: false, error: "Completá el nombre o razón social." }
  }

  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return {
        success: false,
        error: access.error ?? "No tienes acceso a este POP",
      }
    }

    const snap = await loadPopPermissionsSnapshot(popId)
    const canCreate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.CLIENT_CREATE.resource,
      POP_PERMS.CLIENT_CREATE.action,
    )
    if (!canCreate) {
      return { success: false, error: "Sin permiso para crear clientes." }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("clients")
      .insert({
        pop_id: popId,
        name,
        email: input.email.trim() || null,
        tax_id: input.taxId.trim() || null,
        iva_condition: normalizeClientIvaCondition(input.ivaCondition),
        default_invoice_type_label: null,
        is_active: true,
      })
      .select(
        "id, name, tax_id, email, iva_condition, default_invoice_type_label, current_account_enabled",
      )
      .single()

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "No se pudo crear el cliente.",
      }
    }

    return { success: true, party: mapCheckoutClientRow(data) }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function searchCheckoutSuppliers(
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

    const snap = await loadPopPermissionsSnapshot(popId)
    const canRead = permissionKeysInclude(
      snap.keys,
      POP_PERMS.OPERATIONS_READ.resource,
      POP_PERMS.OPERATIONS_READ.action,
    )
    if (!canRead) {
      return { success: false, error: "Sin permiso para buscar proveedores." }
    }

    const orClause = buildPartySearchOrClause(trimmed)
    if (!orClause) {
      return { success: true, parties: [] }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("suppliers")
      .select("id, name, tax_id, current_account_enabled")
      .eq("pop_id", popId)
      .or(orClause)
      .order("name", { ascending: true })
      .limit(CHECKOUT_PARTY_SEARCH_LIMIT)

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      parties: (data ?? []).map((s) => ({
        id: String(s.id),
        name: String(s.name ?? ""),
        taxId: s.tax_id != null ? String(s.tax_id) : null,
        ivaCondition: null,
        defaultInvoiceTypeLabel: null,
        currentAccountEnabled: s.current_account_enabled === true,
      })),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
