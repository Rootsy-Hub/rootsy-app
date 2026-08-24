import type { ChatRootsyDataRequest } from "@/lib/chat/chatRootsyDataRequest"
import type { ChatRootsyToolItem } from "@/app/[siteId]/[popId]/chat/chatTypes"
import type {
  ChatRootsyFollowUp,
  ChatRootsyToolProposal,
} from "@/lib/chat/tools/chatRootsyToolTypes"
import {
  validateChatRootsyPlannerPlan,
  type ChatRootsyPlannerQuery,
} from "@/lib/chat/tools/chatRootsyToolPlanner"

const WRITE_INTENT =
  /\b(cambiar|actualiz|subir|bajar|poner|dejar|crear|borrar|eliminar|aumento|descuento|precio)\b/i

export function readChatRootsyMoneyAr(text: string): number | null {
  const matches = [...text.matchAll(/\$\s*(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/g)]
  const raw = matches.at(-1)?.[1]
  if (!raw) return null
  if (raw.includes(",")) {
    const parsed = Number(raw.replace(/\./g, "").replace(",", "."))
    return Number.isFinite(parsed) ? parsed : null
  }
  if (/^\d{1,3}(\.\d{3})+$/.test(raw)) {
    const parsed = Number(raw.replace(/\./g, ""))
    return Number.isFinite(parsed) ? parsed : null
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export function readChatRootsyProductQuery(text: string): string | undefined {
  const patterns = [
    /producto(?: exacto)?\s+(.+?)\s+de\s+\$/i,
    /del producto\s+(.+?)\s+de\s+\$/i,
    /precio(?: del| de la| de)?\s+(.+?)\s+de\s+\$/i,
    /(?:artículo|articulo)\s+(.+?)\s+de\s+\$/i,
  ]
  for (const pattern of patterns) {
    const match = pattern.exec(text)
    const name = match?.[1]?.replace(/^["“]|["”]$/g, "").trim()
    if (name) return name
  }
  return undefined
}

export function recoverChatRootsyWriteQueries(
  dataRequest: ChatRootsyDataRequest,
): ChatRootsyPlannerQuery[] {
  const text = dataRequest.objective
  if (!WRITE_INTENT.test(text)) return []
  const q = dataRequest.filters?.q?.trim() || readChatRootsyProductQuery(text)
  if (!q) return []
  return [
    {
      id: "",
      path: "/v1/pops/:popId/articles",
      method: "GET",
      filters: { q, pageSize: 20, soloActivos: true },
    },
  ]
}

export function recoverChatRootsyPriceFollowUp(
  text: string,
): ChatRootsyFollowUp | undefined {
  if (!WRITE_INTENT.test(text) || !/\bprecio\b/i.test(text)) return undefined
  const salePrice = readChatRootsyMoneyAr(text)
  if (salePrice == null) return undefined
  return {
    method: "PATCH",
    path: "/v1/pops/:popId/articles/:articleId",
    body: { salePrice },
  }
}

export function applyChatRootsyWriteRecovery(
  dataRequest: ChatRootsyDataRequest,
  plan: { proposals: ChatRootsyToolProposal[]; discarded: number; clarifyingQuestion?: string },
): { proposals: ChatRootsyToolProposal[]; discarded: number; clarifyingQuestion?: string } {
  if (plan.proposals.length) return plan
  const recovered = validateChatRootsyPlannerPlan({
    queries: recoverChatRootsyWriteQueries(dataRequest),
  })
  if (!recovered.proposals.length) return plan
  const followUp = recoverChatRootsyPriceFollowUp(dataRequest.objective)
  return {
    proposals: recovered.proposals.map((proposal) =>
      followUp ? { ...proposal, next: followUp } : proposal,
    ),
    discarded: plan.discarded,
  }
}

export function pickChatRootsyArticleForWrite(
  items: ChatRootsyToolItem[],
  q?: string,
): ChatRootsyToolItem | null {
  const withId = items.filter((item) => item.id)
  if (!withId.length) return null
  if (q) {
    const needle = q.trim().toLowerCase()
    const exact = withId.filter((item) => item.name.trim().toLowerCase() === needle)
    if (exact.length === 1 && exact[0]) return exact[0]
  }
  return withId.length === 1 && withId[0] ? withId[0] : null
}

export function followUpFromArticleResult(
  next: ChatRootsyFollowUp,
  items: ChatRootsyToolItem[],
  q?: string,
): ChatRootsyToolProposal | null {
  const article = pickChatRootsyArticleForWrite(items, q)
  if (!article?.id) return null
  const planned = validateChatRootsyPlannerPlan({
    queries: [
      {
        id: "",
        path: next.path,
        method: next.method,
        filters: { articleId: article.id },
        body: next.body,
      },
    ],
  })
  return planned.proposals[0] ?? null
}
