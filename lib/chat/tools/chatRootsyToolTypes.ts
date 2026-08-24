export const CHAT_ROOTSY_TOOL_TOP_SOLD = "top_sold_products" as const
export const CHAT_ROOTSY_TOOL_PRODUCT_MARGINS = "product_margins" as const
export const CHAT_ROOTSY_TOOL_SUPPLIER_PAYMENTS =
  "supplier_upcoming_payments" as const

export type ChatRootsyToolName =
  | typeof CHAT_ROOTSY_TOOL_TOP_SOLD
  | typeof CHAT_ROOTSY_TOOL_PRODUCT_MARGINS
  | typeof CHAT_ROOTSY_TOOL_SUPPLIER_PAYMENTS

export type ChatRootsyRecentToolUse = {
  tool: string
  items: Array<{ id?: string; name: string }>
}

export type ChatRootsyToolMatchContext = {
  recent: ChatRootsyRecentToolUse[]
}

export type ChatRootsyToolFilters = Record<string, string | number | boolean>

export type ChatRootsyFollowUp = {
  method: string
  path: string
  body?: Record<string, unknown>
}

export type ChatRootsyToolProposal = {
  tool: string
  filters: ChatRootsyToolFilters
  request?: string
  method?: string
  path?: string
  body?: Record<string, unknown>
  action?: string
  subject?: string
  confirm?: "confirm" | "confirm_one" | "confirm_many"
  offerKey?: string
  next?: ChatRootsyFollowUp
}

export function isChatRootsyToolName(value: string): value is ChatRootsyToolName {
  return (
    value === CHAT_ROOTSY_TOOL_TOP_SOLD ||
    value === CHAT_ROOTSY_TOOL_PRODUCT_MARGINS ||
    value === CHAT_ROOTSY_TOOL_SUPPLIER_PAYMENTS
  )
}

export function findRecentToolUse(
  context: ChatRootsyToolMatchContext | undefined,
  names: readonly string[],
): ChatRootsyRecentToolUse | null {
  if (!context?.recent.length) return null
  for (let index = context.recent.length - 1; index >= 0; index -= 1) {
    const row = context.recent[index]
    if (names.includes(row.tool) && row.items.length > 0) {
      return row
    }
  }
  return null
}
