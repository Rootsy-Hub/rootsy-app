import type {
  MenuRootsyAdvice,
  MenuRootsyAllowedModule,
  MenuRootsyContext,
  MenuRootsySuggestion,
} from "@/lib/menu/menuRootsyTypes"

const MAX_SUGGESTIONS = 3

const SECTION_LEAD: Record<
  MenuRootsyContext["sectionKey"],
  string
> = {
  operar:
    "Acá movés el día a día: ventas, mostrador, stock en piso y lo que pasa en el negocio.",
  administrar:
    "Administrás lo que sostiene el negocio: personas, stock, números y reportes.",
  configurar:
    "Configurás las bases del negocio: cuentas, ajustes e integraciones.",
}

function roleKind(roleName: string, isOwner: boolean): "owner" | "cashier" | "admin" | "member" {
  const role = roleName.toLowerCase()
  if (isOwner || role.includes("dueñ") || role.includes("owner")) return "owner"
  if (role.includes("caj") || role.includes("venta")) return "cashier"
  if (role.includes("admin") || role.includes("geren") || role.includes("super")) {
    return "admin"
  }
  return "member"
}

function dayPhase(hour: number): "morning" | "midday" | "afternoon" | "evening" {
  if (hour < 12) return "morning"
  if (hour < 15) return "midday"
  if (hour < 19) return "afternoon"
  return "evening"
}

function businessFlavor(businessType: string): "food" | "retail" | "services" | "generic" {
  const type = businessType.toLowerCase()
  if (
    type.includes("gastron") ||
    type.includes("restaur") ||
    type.includes("bar") ||
    type.includes("caf")
  ) {
    return "food"
  }
  if (type.includes("servicio")) return "services"
  if (type.includes("comercio") || type.includes("retail") || type.includes("ferre")) {
    return "retail"
  }
  return "generic"
}

function pickModule(
  allowed: MenuRootsyAllowedModule[],
  keys: string[],
): MenuRootsyAllowedModule | undefined {
  for (const key of keys) {
    const match = allowed.find(
      (entry) =>
        entry.moduleKey === key ||
        entry.link === key ||
        entry.moduleKey.replace(/_/g, "-") === key,
    )
    if (match) return match
  }
  return undefined
}

function toSuggestion(mod: MenuRootsyAllowedModule): MenuRootsySuggestion {
  return {
    label: mod.label,
    href: mod.href,
    moduleKey: mod.moduleKey,
  }
}

function buildPriorityKeys(context: MenuRootsyContext): string[] {
  const { sectionKey, hourLocal, isOwner, roleName } = context
  const role = roleKind(roleName, isOwner)
  const phase = dayPhase(hourLocal)
  const flavor = businessFlavor(context.businessType)

  if (sectionKey === "operar") {
    if (role === "cashier") {
      return ["sale", "mostrador", "mesas", "cash_registers", "inventory"]
    }
    if (phase === "morning") {
      return flavor === "food"
        ? ["mostrador", "mesas", "sale", "cash_registers", "inventory"]
        : ["sale", "cash_registers", "mostrador", "inventory", "purchases"]
    }
    if (phase === "evening") {
      return ["sale", "operations", "inventory", "cash_registers", "expenses"]
    }
    return ["sale", "mostrador", "inventory", "purchases", "active_services"]
  }

  if (sectionKey === "administrar") {
    if (role === "owner" || role === "admin") {
      return phase === "evening"
        ? ["reports", "statistics", "operations", "invoices", "clients"]
        : ["reports", "statistics", "clients", "stock", "operations"]
    }
    return ["clients", "stock", "operations", "reports", "suppliers"]
  }

  if (role === "owner" || role === "admin") {
    return ["settings", "accounts", "cash_registers", "hr", "printers"]
  }
  return ["settings", "cash_registers", "printers", "accounts"]
}

function buildLead(context: MenuRootsyContext, suggestions: MenuRootsySuggestion[]): string {
  const { sectionKey, trialDaysLeft, subscriptionActive, allowedModules } = context

  if (allowedModules.length === 0) {
    return "Todavía no tenés módulos acá. Pedile a quien administra el negocio que te habilite acceso."
  }

  if (!subscriptionActive) {
    return "Tu suscripción no está activa. Revisá Cuentas o Ajustes para regularizar el acceso."
  }

  if (trialDaysLeft != null && trialDaysLeft <= 7) {
    const trialNote =
      trialDaysLeft === 0
        ? "Tu prueba termina hoy."
        : `Te quedan ${trialDaysLeft} día${trialDaysLeft === 1 ? "" : "s"} de prueba.`
    return `${trialNote} Mientras tanto, esto te puede servir en ${context.sectionTitle.toLowerCase()}.`
  }

  const role = roleKind(context.roleName, context.isOwner)
  const phase = dayPhase(context.hourLocal)
  const first = suggestions[0]?.label

  if (sectionKey === "operar" && role === "cashier" && first) {
    return `Con tu rol, lo más habitual es arrancar por ${first}.`
  }

  if (sectionKey === "operar" && phase === "morning" && first) {
    return `Buen arranque de jornada — ${first} suele ser lo primero del día.`
  }

  if (sectionKey === "administrar" && phase === "evening" && first) {
    return `Para cerrar el día, ${first} suele ser un buen punto de partida.`
  }

  if (first && suggestions.length > 1) {
    const second = suggestions[1]?.label
    return `En ${context.sectionTitle.toLowerCase()}, ${first}${second ? ` y ${second}` : ""} son buenos puntos de partida.`
  }

  return SECTION_LEAD[sectionKey]
}

/** Sugerencias determinísticas — siempre válidas y con links reales. */
export function buildMenuRootsyRuleAdvice(
  context: MenuRootsyContext,
): MenuRootsyAdvice {
  const priorityKeys = buildPriorityKeys(context)
  const suggestions: MenuRootsySuggestion[] = []

  for (const key of priorityKeys) {
    if (suggestions.length >= MAX_SUGGESTIONS) break
    const mod = pickModule(context.allowedModules, [key])
    if (!mod) continue
    if (suggestions.some((entry) => entry.href === mod.href)) continue
    suggestions.push(toSuggestion(mod))
  }

  for (const mod of context.allowedModules) {
    if (suggestions.length >= MAX_SUGGESTIONS) break
    if (suggestions.some((entry) => entry.href === mod.href)) continue
    suggestions.push(toSuggestion(mod))
  }

  return {
    title: context.sectionTitle,
    lead: buildLead(context, suggestions),
    suggestions: suggestions.slice(0, MAX_SUGGESTIONS),
    source: "rules",
  }
}

export function sanitizeMenuRootsyAdvice(
  raw: Pick<MenuRootsyAdvice, "lead" | "suggestions">,
  context: MenuRootsyContext,
  fallback: MenuRootsyAdvice,
): MenuRootsyAdvice {
  const allowedByKey = new Map(
    context.allowedModules.map((mod) => [mod.moduleKey, mod]),
  )

  const suggestions: MenuRootsySuggestion[] = []
  for (const entry of raw.suggestions) {
    if (suggestions.length >= MAX_SUGGESTIONS) break
    const mod =
      allowedByKey.get(entry.moduleKey) ??
      context.allowedModules.find((item) => item.link === entry.moduleKey)
    if (!mod) continue
    if (suggestions.some((s) => s.href === mod.href)) continue
    suggestions.push(toSuggestion(mod))
  }

  const lead = raw.lead?.trim().slice(0, 280) || fallback.lead

  if (suggestions.length === 0) {
    return fallback
  }

  return {
    title: context.sectionTitle,
    lead,
    suggestions,
    source: "ai",
  }
}
