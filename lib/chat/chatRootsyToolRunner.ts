import "server-only"

import type { ChatRootsyToolResult } from "@/app/[siteId]/[popId]/chat/chatTypes"
import {
  buildChatRootsyApiCall,
  chatRootsyApiPeriodHint,
  compactChatRootsyApiPayload,
  itemsFromChatRootsyApiPayload,
  readChatRootsyPlannerBody,
  readChatRootsyPlannerFilters,
  resolveChatRootsyPlannerRequest,
} from "@/lib/chat/chatRootsyApiQuery"
import {
  CHAT_ROOTSY_TOOL_CATALOG,
  CHAT_ROOTSY_TOOL_PRODUCT_MARGINS,
  CHAT_ROOTSY_TOOL_SUPPLIER_PAYMENTS,
  CHAT_ROOTSY_TOOL_TOP_SOLD,
  type ChatRootsyRecentToolUse,
  type ChatRootsyToolName,
} from "@/lib/chat/chatRootsyTools"
import {
  buildMarginItems,
  buildSupplierPaymentItems,
  buildTopSoldItems,
} from "@/lib/chat/chatRootsyToolMap"
import { getChatRootsyRegistryEntry } from "@/lib/chat/tools/chatRootsyToolRegistry"
import {
  validateChatRootsyProposal,
  type ChatRootsyToolProposal,
} from "@/lib/chat/tools/chatRootsyToolSelect"
import { fetchCurrentAccountPartiesServer } from "@/lib/rootsyApi/currentAccountsServer"
import { RootsyApiError, rootsyApiFetch } from "@/lib/rootsyApi/server"
import {
  ROOTSY_AI_EXECUTION_HEADER,
  signRootsyAiExecution,
} from "@/lib/rootsyApi/aiExecutionHmac"
import { createClient } from "@/utils/supabase/server"
import { fetchStatisticsSectionDetailsServer } from "@/lib/rootsyApi/statisticsServer"
import {
  computePreviousSummaryDateBounds,
  computeSummaryDateBounds,
} from "@/lib/summaryDateFilter"

const CURRENT_ACCOUNT_API_PAGE_SIZE = 10

function mapFetchError(error: string): string {
  const lowered = error.toLowerCase()
  if (
    lowered.includes("sin permiso") ||
    lowered.includes("forbidden") ||
    lowered.includes("unauthorized")
  ) {
    return "Sin permiso."
  }
  return error
}

function numberFilter(
  filters: ChatRootsyToolProposal["filters"],
  name: string,
  fallback: number,
) {
  const value = filters[name]
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

async function fetchProductsDetails(popId: string, period: "this_month") {
  const bounds = computeSummaryDateBounds(period, undefined)
  const prevBounds = computePreviousSummaryDateBounds(period, bounds)

  try {
    return await fetchStatisticsSectionDetailsServer(popId, "products", {
      from: bounds.from,
      to: bounds.to,
      prevFrom: prevBounds.from,
      prevTo: prevBounds.to,
      channel: null,
      supplier: null,
    })
  } catch (error) {
    if (error instanceof RootsyApiError && (error.status === 401 || error.status === 403)) {
      return { success: false as const, error: "Sin permiso." }
    }
    return {
      success: false as const,
      error: error instanceof Error ? mapFetchError(error.message) : "Sin permiso.",
    }
  }
}

async function runSupplierPayments(
  popId: string,
  proposal: ChatRootsyToolProposal,
): Promise<{ ok: true; result: ChatRootsyToolResult } | { ok: false; error: string }> {
  const limit = numberFilter(proposal.filters, "pageSize", 5)
  const res = await fetchCurrentAccountPartiesServer(popId, {
    direction: "payable",
    sort: "overdue",
    ord: "desc",
    page: 1,
    pageSize: CURRENT_ACCOUNT_API_PAGE_SIZE,
  })
  if (!res.success) {
    return { ok: false, error: mapFetchError(res.error) }
  }

  return {
    ok: true,
    result: {
      tool: proposal.tool,
      periodLabel:
        CHAT_ROOTSY_TOOL_CATALOG[proposal.tool as ChatRootsyToolName]?.periodLabel ??
        "A pagar",
      items: buildSupplierPaymentItems(res.parties, limit),
    },
  }
}

async function runApiEndpoint(
  popId: string,
  proposal: ChatRootsyToolProposal,
): Promise<{ ok: true; result: ChatRootsyToolResult } | { ok: false; error: string }> {
  const resolved = resolveChatRootsyPlannerRequest({
    id: proposal.tool,
    path: proposal.path,
    method: proposal.method,
  })
  if (!resolved.ok) {
    return { ok: false, error: "Esa consulta todavía no está disponible." }
  }

  const capped = readChatRootsyPlannerFilters(proposal.filters ?? {})
  const body =
    resolved.endpoint.method === "GET"
      ? undefined
      : readChatRootsyPlannerBody(proposal.body)
  const built = buildChatRootsyApiCall(popId, resolved.endpoint, capped, body)
  if (!built.ok) return built

  const writeHeaders: Record<string, string> = {}
  if (built.method !== "GET") {
    if (built.body !== undefined) {
      writeHeaders["content-type"] = "application/json"
    }
    const secret = process.env.ROOTSY_AI_EXECUTION_SECRET?.trim()
    if (!secret) {
      return { ok: false, error: "Falta la clave de ejecución de Rootsy IA." }
    }
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Sin permiso." }
    writeHeaders[ROOTSY_AI_EXECUTION_HEADER] = signRootsyAiExecution({
      secret,
      userId: user.id,
      popId,
      method: built.method,
      path: built.path,
    })
  }

  try {
    const data = await rootsyApiFetch<unknown>(
      built.path,
      built.method === "GET"
        ? undefined
        : {
            method: built.method,
            headers: writeHeaders,
            body:
              built.body !== undefined ? JSON.stringify(built.body) : undefined,
          },
    )
    return {
      ok: true,
      result: {
        tool: resolved.endpoint.id,
        periodLabel:
          chatRootsyApiPeriodHint(capped) ??
          `${built.method} ${resolved.endpoint.path.replace("/v1/pops/:popId/", "")}`,
        items: itemsFromChatRootsyApiPayload(data),
        payload: compactChatRootsyApiPayload(data),
      },
    }
  } catch (error) {
    if (error instanceof RootsyApiError && (error.status === 401 || error.status === 403)) {
      return { ok: false, error: "Sin permiso." }
    }
    return {
      ok: false,
      error:
        error instanceof Error
          ? mapFetchError(error.message)
          : "No se pudo completar esa acción.",
    }
  }
}

async function runLegacyTool(
  popId: string,
  name: string,
  sourceItems: ChatRootsyRecentToolUse["items"],
  filters?: ChatRootsyToolProposal["filters"],
): Promise<{ ok: true; result: ChatRootsyToolResult } | { ok: false; error: string }> {
  const entry = getChatRootsyRegistryEntry(name)
  if (!entry || entry.status !== "enabled" || entry.kind !== "read") {
    return { ok: false, error: "Esa consulta todavía no está disponible." }
  }
  if (entry.requiresConfirmation) {
    return { ok: false, error: "Esa acción necesita confirmación explícita." }
  }

  const proposal = validateChatRootsyProposal({
    tool: name,
    filters:
      filters ??
      CHAT_ROOTSY_TOOL_CATALOG[name as ChatRootsyToolName]?.defaultParams ??
      {},
  })
  if (!proposal) {
    return { ok: false, error: "Esa consulta todavía no está disponible." }
  }

  if (proposal.tool === CHAT_ROOTSY_TOOL_SUPPLIER_PAYMENTS) {
    return runSupplierPayments(popId, proposal)
  }

  if (proposal.tool === CHAT_ROOTSY_TOOL_PRODUCT_MARGINS && sourceItems.length === 0) {
    return { ok: false, error: "Primero necesitamos los 5 más vendidos." }
  }

  const period = "this_month"
  const limit = numberFilter(
    proposal.filters,
    "limit",
    Number(
      CHAT_ROOTSY_TOOL_CATALOG[proposal.tool as ChatRootsyToolName]?.defaultParams
        .limit ?? 5,
    ),
  )

  const res = await fetchProductsDetails(popId, period)
  if (!res.success) {
    return { ok: false, error: mapFetchError(res.error) }
  }

  const items =
    proposal.tool === CHAT_ROOTSY_TOOL_TOP_SOLD
      ? buildTopSoldItems(res.data, limit)
      : buildMarginItems(res.data, sourceItems, limit)

  return {
    ok: true,
    result: {
      tool: proposal.tool,
      periodLabel:
        CHAT_ROOTSY_TOOL_CATALOG[proposal.tool as ChatRootsyToolName]?.periodLabel ??
        "Este mes",
      items,
    },
  }
}

export async function runChatRootsyTool(
  popId: string,
  proposal: ChatRootsyToolProposal,
  sourceItems: ChatRootsyRecentToolUse["items"] = [],
): Promise<
  { ok: true; result: ChatRootsyToolResult } | { ok: false; error: string }
> {
  const resolved = resolveChatRootsyPlannerRequest({
    id: proposal.tool,
    path: proposal.path,
    method: proposal.method,
  })
  if (resolved.ok) {
    return runApiEndpoint(popId, {
      ...proposal,
      tool: resolved.endpoint.id,
      method: resolved.endpoint.method,
      path: resolved.endpoint.path,
    })
  }
  return runLegacyTool(popId, proposal.tool, sourceItems, proposal.filters)
}
