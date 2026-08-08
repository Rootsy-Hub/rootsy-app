"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import type { OperationPartyCatalogItem } from "@/lib/operationPartyPicker"
import { createClient } from "@/utils/supabase/server"

const CHECKOUT_PARTY_SEARCH_LIMIT = 8

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
        "id, name, tax_id, iva_condition, default_invoice_type_label, is_active",
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
      parties: (data ?? []).map((c) => ({
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
      })),
    }
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
      .select("id, name, tax_id")
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
      })),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
