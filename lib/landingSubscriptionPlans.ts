import {
  formatPlanLimitValue,
  type RootsPublicPaidPlanKey,
} from "@/lib/rootsySubscriptionCatalog"

export const LANDING_FEATURED_PLAN: RootsPublicPaidPlanKey = "professional"

export const LANDING_PLAN_COPY: Record<
  RootsPublicPaidPlanKey,
  { tagline: string; cta: string }
> = {
  starter: {
    tagline: "Para arrancar con orden: ventas, stock y administración en un solo lugar.",
    cta: "Empezar con Starter",
  },
  professional: {
    tagline: "El equilibrio entre potencia y simplicidad para el día a día del negocio.",
    cta: "Elegir Professional",
  },
  enterprise: {
    tagline: "Escala sin límites: todos los módulos, equipos grandes y operación intensiva.",
    cta: "Hablar con ventas",
  },
}

export function landingYearlySavingsPercent(
  monthly: number,
  yearly: number,
): number | null {
  if (monthly <= 0 || yearly <= 0) return null
  const fullYear = monthly * 12
  if (fullYear <= yearly) return null
  return Math.round(((fullYear - yearly) / fullYear) * 100)
}

export function landingPlanFeatures(
  input: {
    maxUsersLabel: string
    maxArticlesLabel: string
    maxOperationsPerMonthLabel: string
    allModules: boolean
  },
  specificModulesCount: number,
): string[] {
  const features = [
    `Hasta ${input.maxUsersLabel} usuarios`,
    `${input.maxArticlesLabel} artículos en catálogo`,
    `${input.maxOperationsPerMonthLabel} operaciones por mes`,
  ]
  if (input.allModules) {
    features.push("Todos los módulos del rubro y extras")
    features.push("Límites ampliados en toda la plataforma")
    features.push("Prioridad en soporte")
  } else {
    features.push(`${specificModulesCount} módulos específicos del rubro`)
    features.push("Módulos generales incluidos")
    features.push("Add-ons disponibles bajo demanda")
  }
  return features
}

export function formatLandingPlanMoney(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value)
}

export function landingPlanLimitLabel(value: number): string {
  return formatPlanLimitValue(value)
}
