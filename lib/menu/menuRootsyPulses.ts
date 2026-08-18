import type { MenuRootsyContext } from "@/lib/menu/menuRootsyTypes"
import type { MenuRootsyPulse, MenuRootsyPulseTone } from "@/lib/menu/menuRootsyTypes"

function formatMoneyShort(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (abs >= 10_000) {
    return `$${Math.round(value / 1000)}k`
  }
  return `$${Math.round(value).toLocaleString("es-AR")}`
}

function pushPulse(
  pulses: MenuRootsyPulse[],
  pulse: MenuRootsyPulse,
): void {
  if (pulses.some((entry) => entry.id === pulse.id)) return
  pulses.push(pulse)
}

/** Chips analíticos — solo datos de negocio, nada operativo del día. */
export function buildMenuRootsyPulses(context: MenuRootsyContext): MenuRootsyPulse[] {
  const { insights } = context
  if (!insights) return []

  const pulses: MenuRootsyPulse[] = []

  if (insights.grossMarginPercent != null && insights.hasProfitData) {
    const margin = insights.grossMarginPercent
    const tone: MenuRootsyPulseTone =
      margin >= 35 ? "ok" : margin >= 20 ? "neutral" : "warn"
    pushPulse(pulses, {
      id: "margin",
      label: `Margen ${margin.toFixed(0)}% ${insights.periodLabel}`,
      tone,
      attention: false,
    })
  }

  if (insights.totalSales != null && insights.totalSales > 0) {
    pushPulse(pulses, {
      id: "sales",
      label: `${formatMoneyShort(insights.totalSales)} ${insights.periodLabel}`,
      tone: "ok",
      attention: false,
    })
  }

  if (insights.avgTicket != null && insights.avgTicket > 0) {
    pushPulse(pulses, {
      id: "ticket",
      label: `Ticket ${formatMoneyShort(insights.avgTicket)}`,
      tone: "neutral",
      attention: false,
    })
  }

  if (insights.peakHourLabel) {
    pushPulse(pulses, {
      id: "peak",
      label: `Pico ${insights.todayWeekdayLabel} ${insights.peakHourLabel}`,
      tone: "neutral",
      attention: false,
    })
  }

  return pulses.slice(0, 4)
}
