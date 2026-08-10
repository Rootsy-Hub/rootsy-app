"use client"

import type {
  BackofficeBusinessTypeRow,
  BackofficePlanLimitRow,
  BackofficeSubscriptionCatalog,
  BackofficeSubscriptionPlanRow,
} from "@/app/backoffice/actions"
import { formatBackofficeMoney } from "@/app/backoffice/components/BackofficeSection"
import { FoundationSpecCard } from "@/app/library/libraryFoundationDocShared"
import {
  ROOTS_BUSINESS_TYPE_MODULES,
  ROOTS_BUSINESS_TYPE_ORDER,
  ROOTS_EXTRA_MODULE_PRICES,
  ROOTS_PAID_PLAN_ORDER,
  ROOTS_PLAN_DEFINITIONS,
  formatPlanLimitValue,
  listSpecificModulesFlat,
  type RootsPublicBusinessTypeKey,
  type RootsPublicPaidPlanKey,
} from "@/lib/rootsySubscriptionCatalog"
import { getRootsModuleIcon } from "@/lib/rootsyModuleIcons"
import { cn } from "@/lib/utils"
import {
  Check,
  Factory,
  Sparkles,
  Store,
  UtensilsCrossed,
} from "lucide-react"
import { useMemo, useState } from "react"

type BillingCycle = "monthly" | "yearly"

const FEATURED_PLAN: RootsPublicPaidPlanKey = "professional"

const BUSINESS_TYPE_ICONS = {
  comercio: Store,
  restaurant: UtensilsCrossed,
  fabrica: Factory,
} as const satisfies Record<
  RootsPublicBusinessTypeKey,
  typeof Store
>

const PLAN_LANDING_COPY: Record<
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

function yearlySavingsPercent(monthly: number, yearly: number): number | null {
  if (monthly <= 0 || yearly <= 0) return null
  const fullYear = monthly * 12
  if (fullYear <= yearly) return null
  return Math.round(((fullYear - yearly) / fullYear) * 100)
}

function buildPlanFeatures(
  limit: BackofficePlanLimitRow,
  specificModulesCount: number,
): string[] {
  const features = [
    `Hasta ${limit.maxUsersLabel} usuarios`,
    `${limit.maxArticlesLabel} artículos en catálogo`,
    `${limit.maxOperationsPerMonthLabel} operaciones por mes`,
  ]

  if (limit.allModules) {
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

function PricingHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--rootsy-bruma-200)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--rootsy-savia-500)_8%,white)_0%,var(--rootsy-bruma-50)_45%,var(--rootsy-white)_100%)] px-6 py-10 sm:px-10 sm:py-12">
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[color-mix(in_srgb,var(--rootsy-savia-400)_18%,transparent)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-1/3 size-48 rounded-full bg-[color-mix(in_srgb,var(--rootsy-bruma-400)_20%,transparent)] blur-3xl"
        aria-hidden
      />

      <div className="relative max-w-2xl space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--rootsy-savia-500)_25%,transparent)] bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--rootsy-savia-700)]">
          <Sparkles className="size-3.5" aria-hidden />
          Vista landing
        </span>
        <h2 className="font-canopy text-3xl font-semibold tracking-tight text-[var(--rootsy-bruma-900)] sm:text-4xl">
          Planes simples para cada etapa de tu negocio
        </h2>
        <p className="text-base leading-relaxed text-[var(--rootsy-bruma-600)]">
          Precios en pesos argentinos. Probá Rootsy{" "}
          <strong className="font-semibold text-[var(--rootsy-bruma-900)]">
            7 días gratis
          </strong>{" "}
          con tarjeta — sin cargo hasta que termina la prueba.
        </p>
      </div>
    </div>
  )
}

function BillingToggle({
  value,
  onChange,
  savingsHint,
}: {
  value: BillingCycle
  onChange: (cycle: BillingCycle) => void
  savingsHint: number | null
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div className="inline-flex rounded-full border border-[var(--rootsy-bruma-200)] bg-white p-1 shadow-sm">
        <button
          type="button"
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            value === "monthly"
              ? "bg-[var(--rootsy-sombra-700)] text-white"
              : "text-[var(--rootsy-bruma-600)] hover:text-[var(--rootsy-bruma-900)]",
          )}
          onClick={() => onChange("monthly")}
        >
          Mensual
        </button>
        <button
          type="button"
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            value === "yearly"
              ? "bg-[var(--rootsy-sombra-700)] text-white"
              : "text-[var(--rootsy-bruma-600)] hover:text-[var(--rootsy-bruma-900)]",
          )}
          onClick={() => onChange("yearly")}
        >
          Anual
        </button>
      </div>
      {savingsHint != null && value === "yearly" ? (
        <span className="rounded-full bg-[color-mix(in_srgb,var(--rootsy-savia-500)_12%,white)] px-3 py-1 text-xs font-semibold text-[var(--rootsy-savia-700)]">
          Ahorrá {savingsHint}% pagando anual
        </span>
      ) : null}
    </div>
  )
}

function BusinessTypeTabs({
  businessTypes,
  value,
  onChange,
}: {
  businessTypes: BackofficeBusinessTypeRow[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {businessTypes.map((bt) => {
        const Icon =
          BUSINESS_TYPE_ICONS[bt.name as RootsPublicBusinessTypeKey] ?? Store
        const selected = value === bt.id
        return (
          <button
            key={bt.id}
            type="button"
            onClick={() => onChange(bt.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all",
              selected
                ? "border-[color-mix(in_srgb,var(--rootsy-savia-500)_35%,transparent)] bg-white text-[var(--rootsy-bruma-900)] shadow-[0_8px_24px_-12px_rgba(16,24,20,0.25)]"
                : "border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-600)] hover:border-[var(--rootsy-bruma-300)] hover:text-[var(--rootsy-bruma-900)]",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {bt.displayName}
          </button>
        )
      })}
    </div>
  )
}

function LandingPricingCard({
  plan,
  limit,
  billingCycle,
  specificModulesCount,
  featured,
}: {
  plan: BackofficeSubscriptionPlanRow
  limit: BackofficePlanLimitRow
  billingCycle: BillingCycle
  specificModulesCount: number
  featured: boolean
}) {
  const planKey = plan.name as RootsPublicPaidPlanKey
  const planMeta = ROOTS_PLAN_DEFINITIONS[planKey]
  const copy = PLAN_LANDING_COPY[planKey]
  const monthly = limit.priceMonthly
  const yearly = limit.priceYearly
  const displayAmount = billingCycle === "yearly" ? yearly : monthly
  const periodLabel = billingCycle === "yearly" ? "/ año" : "/ mes"
  const features = buildPlanFeatures(limit, specificModulesCount)

  return (
    <li className={cn("flex", featured && "lg:-mt-2 lg:mb-2")}>
      <article
        className={cn(
          "relative flex w-full flex-col overflow-hidden rounded-2xl border bg-white transition-shadow",
          featured
            ? "border-[color-mix(in_srgb,var(--rootsy-savia-500)_35%,transparent)] shadow-[0_24px_60px_-28px_rgba(16,185,129,0.45)] ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-500)_20%,transparent)]"
            : "border-[var(--rootsy-bruma-200)] shadow-[0_12px_40px_-24px_rgba(16,24,20,0.2)]",
        )}
      >
        {featured ? (
          <div className="bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-white">
            Más elegido
          </div>
        ) : null}

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <header className="space-y-3">
            <div>
              <h3 className="font-canopy text-xl font-semibold text-[var(--rootsy-bruma-900)]">
                {plan.displayName}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--rootsy-bruma-600)]">
                {copy.tagline || planMeta?.description}
              </p>
            </div>

            <div className="pt-1">
              <p className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="font-canopy text-4xl font-semibold tabular-nums tracking-tight text-[var(--rootsy-bruma-900)]">
                  {formatBackofficeMoney(displayAmount)}
                </span>
                <span className="text-base font-medium text-[var(--rootsy-bruma-500)]">
                  {periodLabel}
                </span>
              </p>
              {billingCycle === "yearly" && monthly > 0 ? (
                <p className="mt-1 text-xs text-[var(--rootsy-bruma-500)]">
                  Equivalente a {formatBackofficeMoney(Math.round(yearly / 12))}
                  /mes
                </p>
              ) : (
                <p className="mt-1 text-xs text-[var(--rootsy-bruma-500)]">
                  Facturación mensual · precios de referencia
                </p>
              )}
            </div>
          </header>

          <ul className="mt-6 flex flex-1 flex-col gap-3">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex gap-3 text-sm leading-snug text-[var(--rootsy-bruma-700)]"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--rootsy-savia-500)_14%,white)] text-[var(--rootsy-savia-600)]">
                  <Check className="size-3.5 stroke-[2.5]" aria-hidden />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-[var(--rootsy-bruma-200)] pt-6">
            <div
              className={cn(
                "flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold",
                featured
                  ? "bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-900/15"
                  : "border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-800)]",
              )}
            >
              {copy.cta}
            </div>
            <p className="mt-2 text-center text-[10px] text-[var(--rootsy-bruma-500)]">
              Preview · botón deshabilitado en backoffice
            </p>
          </div>
        </div>
      </article>
    </li>
  )
}

function ModulesIncludedPanel({
  businessType,
}: {
  businessType: BackofficeBusinessTypeRow
}) {
  const typeKey = businessType.name as RootsPublicBusinessTypeKey | "platform_full"
  const catalogConfig =
    typeKey in ROOTS_BUSINESS_TYPE_MODULES
      ? ROOTS_BUSINESS_TYPE_MODULES[typeKey]
      : null
  const specificModules =
    typeKey in ROOTS_BUSINESS_TYPE_MODULES
      ? listSpecificModulesFlat(typeKey)
      : []
  const extras = catalogConfig?.extras ?? []

  return (
    <FoundationSpecCard className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
          Qué incluye {businessType.displayName}
        </p>
        <p className="mt-1 text-sm text-[var(--rootsy-bruma-600)]">
          Módulos específicos del rubro más la base compartida de Rootsy en todos
          los planes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
            Módulos del rubro
          </h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {specificModules.map((mod) => {
              const Icon = getRootsModuleIcon(mod.key)
              return (
                <li
                  key={mod.key}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-3 py-1.5 text-xs font-medium text-[var(--rootsy-bruma-800)]"
                >
                  <Icon className="size-3.5 text-[var(--rootsy-savia-600)]" aria-hidden />
                  {mod.label}
                </li>
              )
            })}
          </ul>
        </div>

        {extras.length > 0 ? (
          <div>
            <h4 className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
              Extras opcionales
            </h4>
            <ul className="mt-3 space-y-2">
              {extras.map((mod) => {
                const Icon = getRootsModuleIcon(mod.key)
                const price = ROOTS_EXTRA_MODULE_PRICES[mod.key] ?? 0
                return (
                  <li
                    key={mod.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--rootsy-bruma-200)] bg-white px-3 py-2.5 text-sm"
                  >
                    <span className="flex items-center gap-2 font-medium text-[var(--rootsy-bruma-800)]">
                      <Icon className="size-4 text-[var(--rootsy-savia-600)]" aria-hidden />
                      {mod.label}
                    </span>
                    <span className="tabular-nums text-[var(--rootsy-bruma-600)]">
                      +{formatBackofficeMoney(price)}/mes
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </FoundationSpecCard>
  )
}

function LimitsReferenceTable({
  plans,
  limits,
  businessTypeName,
}: {
  plans: BackofficeSubscriptionPlanRow[]
  limits: BackofficePlanLimitRow[]
  businessTypeName: string
}) {
  const paidPlans = ROOTS_PAID_PLAN_ORDER.map((name) =>
    plans.find((p) => p.name === name),
  ).filter((p): p is BackofficeSubscriptionPlanRow => Boolean(p))

  const limitsByPlan = new Map(
    limits
      .filter((row) => row.businessTypeName === businessTypeName)
      .map((row) => [row.planName, row]),
  )

  return (
    <FoundationSpecCard className="overflow-x-auto p-0">
      <div className="border-b border-[var(--rootsy-bruma-200)] px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
          Referencia técnica
        </p>
        <p className="mt-1 text-sm text-[var(--rootsy-bruma-600)]">
          Límites configurados en base de datos para este tipo de negocio.
        </p>
      </div>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]">
            <th className="px-5 py-3 font-semibold text-[var(--rootsy-bruma-700)]">
              Plan
            </th>
            <th className="px-5 py-3 font-semibold text-[var(--rootsy-bruma-700)]">
              Usuarios
            </th>
            <th className="px-5 py-3 font-semibold text-[var(--rootsy-bruma-700)]">
              Artículos
            </th>
            <th className="px-5 py-3 font-semibold text-[var(--rootsy-bruma-700)]">
              Ops/mes
            </th>
            <th className="px-5 py-3 font-semibold text-[var(--rootsy-bruma-700)]">
              Mensual
            </th>
            <th className="px-5 py-3 font-semibold text-[var(--rootsy-bruma-700)]">
              Anual
            </th>
          </tr>
        </thead>
        <tbody>
          {paidPlans.map((plan) => {
            const limit = limitsByPlan.get(plan.name)
            if (!limit) return null
            return (
              <tr
                key={plan.id}
                className="border-b border-[var(--rootsy-bruma-100)] last:border-0"
              >
                <td className="px-5 py-3 font-medium text-[var(--rootsy-bruma-900)]">
                  {plan.displayName}
                </td>
                <td className="px-5 py-3 tabular-nums text-[var(--rootsy-bruma-700)]">
                  {formatPlanLimitValue(limit.maxUsers)}
                </td>
                <td className="px-5 py-3 tabular-nums text-[var(--rootsy-bruma-700)]">
                  {formatPlanLimitValue(limit.maxArticles)}
                </td>
                <td className="px-5 py-3 tabular-nums text-[var(--rootsy-bruma-700)]">
                  {formatPlanLimitValue(limit.maxOperationsPerMonth)}
                </td>
                <td className="px-5 py-3 tabular-nums text-[var(--rootsy-bruma-700)]">
                  {formatBackofficeMoney(limit.priceMonthly)}
                </td>
                <td className="px-5 py-3 tabular-nums text-[var(--rootsy-bruma-700)]">
                  {formatBackofficeMoney(limit.priceYearly)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </FoundationSpecCard>
  )
}

export function BackofficePlansLandingView({
  catalog,
}: {
  catalog: BackofficeSubscriptionCatalog
}) {
  const businessTypes = useMemo(() => {
    const byName = new Map(
      catalog.businessTypes
        .filter((row) => row.isActive)
        .map((row) => [row.name, row]),
    )
    return ROOTS_BUSINESS_TYPE_ORDER.map((key) => byName.get(key)).filter(
      (row): row is BackofficeBusinessTypeRow => Boolean(row),
    )
  }, [catalog.businessTypes])

  const [businessTypeId, setBusinessTypeId] = useState(
    () => businessTypes[0]?.id ?? "",
  )
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly")

  const selectedBusinessType =
    businessTypes.find((bt) => bt.id === businessTypeId) ?? businessTypes[0]

  const selectedTypeKey = selectedBusinessType?.name as
    | RootsPublicBusinessTypeKey
    | undefined

  const specificModulesCount = selectedTypeKey
    ? listSpecificModulesFlat(selectedTypeKey).length
    : 0

  const limitsForType = catalog.planLimits.filter(
    (row) => row.businessTypeName === selectedBusinessType?.name,
  )

  const sampleSavings = useMemo(() => {
    const pro = limitsForType.find((l) => l.planName === "professional")
    if (!pro) return null
    return yearlySavingsPercent(pro.priceMonthly, pro.priceYearly)
  }, [limitsForType])

  const paidPlans = ROOTS_PAID_PLAN_ORDER.map((planName) =>
    catalog.plans.find((plan) => plan.name === planName),
  ).filter((plan): plan is BackofficeSubscriptionPlanRow => Boolean(plan))

  const limitsByPlan = new Map(
    limitsForType.map((row) => [row.planName, row]),
  )

  if (!selectedBusinessType) return null

  return (
    <div className="space-y-10">
      <PricingHero />

      <div className="space-y-6">
        <BusinessTypeTabs
          businessTypes={businessTypes}
          value={selectedBusinessType.id}
          onChange={setBusinessTypeId}
        />
        <BillingToggle
          value={billingCycle}
          onChange={setBillingCycle}
          savingsHint={sampleSavings}
        />
      </div>

      <ul className="grid list-none gap-5 lg:grid-cols-3 lg:gap-6">
        {paidPlans.map((plan) => {
          const limit = limitsByPlan.get(plan.name)
          if (!limit) {
            return (
              <li key={plan.id}>
                <FoundationSpecCard className="flex min-h-[320px] items-center justify-center text-sm text-[var(--rootsy-bruma-500)]">
                  {plan.displayName}: sin límites configurados para este rubro.
                </FoundationSpecCard>
              </li>
            )
          }
          return (
            <LandingPricingCard
              key={plan.id}
              plan={plan}
              limit={limit}
              billingCycle={billingCycle}
              specificModulesCount={specificModulesCount}
              featured={plan.name === FEATURED_PLAN}
            />
          )
        })}
      </ul>

      <p className="text-center text-xs text-[var(--rootsy-bruma-500)]">
        Precios de referencia en ARS. Los valores finales pueden variar según
        promociones, impuestos y acuerdos comerciales.
      </p>

      <ModulesIncludedPanel businessType={selectedBusinessType} />

      <LimitsReferenceTable
        plans={catalog.plans}
        limits={catalog.planLimits}
        businessTypeName={selectedBusinessType.name}
      />
    </div>
  )
}
