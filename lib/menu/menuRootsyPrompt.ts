import type { MenuRootsyContext } from "@/lib/menu/menuRootsyTypes"

export type MenuRootsyAiPayload = {
  lead: string
  suggestionModuleKeys: string[]
}

export const MENU_ROOTSY_AI_SYSTEM_PROMPT = [
  "Sos Rootsy, mascota guía de Rootsy (software de gestión para negocios en Argentina).",
  "Respondé en español rioplatense, cercano y claro. Sin emojis.",
  "Solo podés recomendar módulos de allowedModuleKeys.",
  'Respondé JSON: {"lead":"...", "suggestionModuleKeys":["key1","key2"]}.',
  "lead: 1 oración, máximo 220 caracteres.",
  "suggestionModuleKeys: 1 a 3 keys de allowedModuleKeys, ordenadas por utilidad.",
  "No inventes módulos. No menciones POP: decí negocio.",
  "Usá signals si vienen: caja cerrada → priorizá Cajas; ventas en 0 por la mañana → Ventas; lowStockCount > 0 → Stock o Inventario.",
].join(" ")

export function buildMenuRootsyAiUserPayload(context: MenuRootsyContext) {
  return {
    popName: context.popName,
    businessType: context.businessType,
    roleName: context.roleName,
    isOwner: context.isOwner,
    sectionKey: context.sectionKey,
    sectionTitle: context.sectionTitle,
    hourLocal: context.hourLocal,
    trialDaysLeft: context.trialDaysLeft,
    allowedModuleKeys: context.allowedModules.map((mod) => mod.moduleKey),
    allowedModules: context.allowedModules.map((mod) => ({
      key: mod.moduleKey,
      label: mod.label,
    })),
    signals: {
      dayOfWeek: context.signals.dayOfWeek,
      cashRegisterOpen: context.signals.cashRegisterOpen,
      openCashRegisterCount: context.signals.openCashRegisterCount,
      salesTodayCount: context.signals.salesTodayCount,
      lowStockCount: context.signals.lowStockCount,
      outOfStockCount: context.signals.outOfStockCount,
    },
  }
}

export function parseMenuRootsyAiPayload(raw: unknown): MenuRootsyAiPayload | null {
  if (!raw || typeof raw !== "object") return null
  const record = raw as Record<string, unknown>
  if (typeof record.lead !== "string" || !Array.isArray(record.suggestionModuleKeys)) {
    return null
  }
  const suggestionModuleKeys = record.suggestionModuleKeys.filter(
    (key): key is string => typeof key === "string" && key.trim().length > 0,
  )
  if (!record.lead.trim() || suggestionModuleKeys.length === 0) {
    return null
  }
  return {
    lead: record.lead.trim(),
    suggestionModuleKeys,
  }
}
