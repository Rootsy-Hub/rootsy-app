import type { MenuRootsyContext } from "@/lib/menu/menuRootsyTypes"

export type MenuRootsyAiPayload = {
  lead: string
  suggestionModuleKeys: string[]
}

export const MENU_ROOTSY_AI_SYSTEM_PROMPT = [
  "Sos Rootsy, la mascota que vive en el piso del negocio y respira sus números todos los días.",
  "Hablás en primera persona, desde el corazón, con la sabiduría de quien conoce el negocio por dentro.",
  "Respondé en español rioplatense, cálido y claro. Sin emojis. Sin títulos. Sin listas. Sin pills.",
  "No menciones trial, caja, stock ni tareas operativas del día.",
  "Solo podés recomendar módulos de allowedModuleKeys.",
  'Respondé JSON: {"lead":"...", "suggestionModuleKeys":["key"]}.',
  "lead: 2 or 3 oraciones, máximo 380 caracteres. Una sola voz continua, como un consejo íntimo.",
  "Podés cerrar invitando suavemente a un módulo (Estadísticas, Promociones, etc.) sin sonar a botón.",
  "suggestionModuleKeys: exactamente 1 key, alineada con lo que decís.",
  "Usá insights si vienen. No inventes números. Decí el nombre del negocio (popName), no POP.",
].join(" ")

export function buildMenuRootsyAiUserPayload(context: MenuRootsyContext) {
  const insights = context.insights

  return {
    popName: context.popName,
    businessType: context.businessType,
    roleName: context.roleName,
    isOwner: context.isOwner,
    hourLocal: context.hourLocal,
    allowedModuleKeys: context.allModules.map((mod) => mod.moduleKey),
    allowedModules: context.allModules.map((mod) => ({
      key: mod.moduleKey,
      label: mod.label,
    })),
    insights: insights
      ? {
          periodLabel: insights.periodLabel,
          totalSales: insights.totalSales,
          salesDeltaPercent: insights.salesDeltaPercent,
          avgTicket: insights.avgTicket,
          grossMarginPercent: insights.grossMarginPercent,
          grossMarginDeltaPoints: insights.grossMarginDeltaPoints,
          todayWeekdayLabel: insights.todayWeekdayLabel,
          peakHourLabel: insights.peakHourLabel,
          slowHourLabel: insights.slowHourLabel,
          topProfitProduct: insights.topProfitProduct,
          topVolumeProduct: insights.topVolumeProduct,
          hiddenGemProduct: insights.hiddenGemProduct,
          sampleVoices: insights.opportunities.slice(0, 4).map((entry) => entry.voice),
        }
      : null,
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
    suggestionModuleKeys: suggestionModuleKeys.slice(0, 1),
  }
}
