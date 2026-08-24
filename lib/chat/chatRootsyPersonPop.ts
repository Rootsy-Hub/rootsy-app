export type ChatRootsyBusinessCard = {
  firstName: string
  lastName: string
  roleName: string
  isOwner: boolean
  popName: string
  businessType: string
  modules: Array<{ key: string; label: string }>
}

export type ChatRootsyPersonPopContext = {
  nombre: string
  apellido: string
  rol: string
  pop: string
  tipo_negocio: string
}

function cardText(value: string, max = 80): string {
  return value.replace(/\s+/g, " ").trim().slice(0, max)
}

export function buildChatRootsyBusinessCard(
  card: ChatRootsyBusinessCard,
): ChatRootsyBusinessCard {
  return {
    firstName: cardText(card.firstName),
    lastName: cardText(card.lastName),
    roleName: cardText(card.roleName) || "Miembro",
    isOwner: card.isOwner,
    popName: cardText(card.popName) || "Negocio",
    businessType: cardText(card.businessType) || "Negocio",
    modules: card.modules,
  }
}

export function compactChatRootsyPersonPopContext(
  card: ChatRootsyBusinessCard,
): ChatRootsyPersonPopContext {
  const built = buildChatRootsyBusinessCard(card)
  return {
    nombre: built.firstName,
    apellido: built.lastName,
    rol: built.roleName,
    pop: built.popName,
    tipo_negocio: built.businessType,
  }
}

export function formatChatRootsyPersonPopMessage(
  card: ChatRootsyBusinessCard,
): string {
  return [
    "Contexto de quien habla (JSON). No es el pedido. Usalo para saber quién es y en qué negocio están. No lo recites.",
    JSON.stringify(compactChatRootsyPersonPopContext(card)),
  ].join("\n")
}

export function insertChatRootsyContextNotes<
  T extends { role: "user" | "assistant"; body: string },
>(history: T[], notes: Array<string | null | undefined>): T[] {
  const extra = notes
    .map((note) => note?.trim() ?? "")
    .filter(Boolean)
    .map((body) => ({ role: "user" as const, body }) as T)
  if (extra.length === 0) return history
  if (history.length === 0) return extra
  const last = history[history.length - 1]
  if (last?.role === "user") {
    return [...history.slice(0, -1), ...extra, last]
  }
  return [...history, ...extra]
}
