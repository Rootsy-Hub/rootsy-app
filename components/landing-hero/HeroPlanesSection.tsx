"use client"

import {
  listPublicSubscriptionCatalog,
  type PublicBusinessTypeRow,
  type PublicPlanLimitRow,
  type PublicSubscriptionCatalog,
  type PublicSubscriptionPlanRow,
} from "@/app/landing/catalogActions"
import { SALES_URL } from "@/components/landing-hero/navConfig"
import { useAuth } from "@/context/AuthContextSupabase"
import {
  POP_CREATE_PATH,
  REGISTER_PATH,
  isSelfServePlan,
  persistSignupIntent,
  signupIntentHref,
  type SignupIntent,
} from "@/lib/signupIntent"
import {
  LANDING_FEATURED_PLAN,
  LANDING_PLAN_COPY,
  formatLandingPlanMoney,
  landingPlanFeatures,
  landingYearlySavingsPercent,
} from "@/lib/landingSubscriptionPlans"
import {
  ROOTS_BUSINESS_TYPE_MODULES,
  ROOTS_BUSINESS_TYPE_ORDER,
  ROOTS_EXTRA_MODULE_PRICES,
  ROOTS_PAID_PLAN_ORDER,
  listSpecificModulesFlat,
  type RootsPublicBusinessTypeKey,
  type RootsPublicPaidPlanKey,
} from "@/lib/rootsySubscriptionCatalog"
import { getRootsModuleIcon } from "@/lib/rootsyModuleIcons"
import { cn } from "@/lib/utils"
import { Check, Factory, Store, UtensilsCrossed } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

type BillingCycle = "monthly" | "yearly"

const BUSINESS_TYPE_ICONS = {
  comercio: Store,
  restaurant: UtensilsCrossed,
  fabrica: Factory,
} as const satisfies Record<RootsPublicBusinessTypeKey, typeof Store>

const FEATURED_CTA_CLASS =
  "border border-emerald-400/30 bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-[0_16px_48px_-12px_rgba(16,185,129,0.5)] hover:from-emerald-400 hover:to-teal-400"

function isPublicPaidPlanKey(value: string): value is RootsPublicPaidPlanKey {
  return ROOTS_PAID_PLAN_ORDER.includes(value as RootsPublicPaidPlanKey)
}

function isPublicBusinessTypeKey(
  value: string,
): value is RootsPublicBusinessTypeKey {
  return ROOTS_BUSINESS_TYPE_ORDER.includes(value as RootsPublicBusinessTypeKey)
}

export function HeroPlanesSection() {
  const router = useRouter()
  const { user } = useAuth()
  const [catalog, setCatalog] = useState<PublicSubscriptionCatalog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [businessTypeId, setBusinessTypeId] = useState("")
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly")

  useEffect(() => {
    let cancelled = false
    void listPublicSubscriptionCatalog()
      .then((data) => {
        if (cancelled) return
        setCatalog(data)
        const ordered = ROOTS_BUSINESS_TYPE_ORDER.map((key) =>
          data.businessTypes.find((row) => row.name === key),
        ).filter((row): row is PublicBusinessTypeRow => Boolean(row))
        setBusinessTypeId(ordered[0]?.id ?? data.businessTypes[0]?.id ?? "")
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar los planes.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const businessTypes = useMemo(() => {
    if (!catalog) return []
    const byName = new Map(catalog.businessTypes.map((row) => [row.name, row]))
    return ROOTS_BUSINESS_TYPE_ORDER.map((key) => byName.get(key)).filter(
      (row): row is PublicBusinessTypeRow => Boolean(row),
    )
  }, [catalog])

  const selectedBusinessType =
    businessTypes.find((row) => row.id === businessTypeId) ?? businessTypes[0]

  const selectedTypeKey = selectedBusinessType
    ? isPublicBusinessTypeKey(selectedBusinessType.name)
      ? selectedBusinessType.name
      : null
    : null

  const specificModulesCount = selectedTypeKey
    ? listSpecificModulesFlat(selectedTypeKey).length
    : 0

  const limitsForType = useMemo(
    () =>
      catalog?.planLimits.filter(
        (row) => row.businessTypeName === selectedBusinessType?.name,
      ) ?? [],
    [catalog, selectedBusinessType?.name],
  )

  const paidPlans = useMemo(() => {
    if (!catalog) return []
    return ROOTS_PAID_PLAN_ORDER.map((name) =>
      catalog.plans.find((plan) => plan.name === name),
    ).filter((plan): plan is PublicSubscriptionPlanRow => Boolean(plan))
  }, [catalog])

  const limitsByPlan = useMemo(
    () => new Map(limitsForType.map((row) => [row.planName, row])),
    [limitsForType],
  )

  const savingsHint = useMemo(() => {
    const pro = limitsForType.find((row) => row.planName === "professional")
    if (!pro) return null
    return landingYearlySavingsPercent(pro.priceMonthly, pro.priceYearly)
  }, [limitsForType])

  const extras = selectedTypeKey
    ? ROOTS_BUSINESS_TYPE_MODULES[selectedTypeKey].extras
    : []

  const startWithPlan = (planName: string) => {
    if (!isSelfServePlan(planName)) {
      window.location.href = SALES_URL
      return
    }

    const intent: SignupIntent = {
      plan: planName,
      cycle: billingCycle,
      type: selectedTypeKey,
    }
    persistSignupIntent(intent)
    const nextPath = user ? POP_CREATE_PATH : REGISTER_PATH
    router.push(signupIntentHref(nextPath, intent))
  }

  return (
    <div
      className="mx-auto flex w-full min-w-0 max-w-6xl flex-col py-2 sm:py-4"
      aria-label="Planes"
    >
      <header className="mb-8 text-center sm:mb-10">
        <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
          Elegí tu plan
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-white/80 sm:text-xl">
          7 días de prueba con tarjeta — sin cargo hasta que termina.
        </p>
      </header>

      {loading ? (
        <HeroPlanesSkeleton />
      ) : error || !catalog || !selectedBusinessType ? (
        <p className="text-center text-sm text-white/60">
          {error || "Todavía no hay planes públicos para mostrar."}
        </p>
      ) : (
        <div className="space-y-8">
          <div className="space-y-5">
            <div className="flex flex-wrap justify-center gap-2">
              {businessTypes.map((bt) => {
                const Icon = isPublicBusinessTypeKey(bt.name)
                  ? BUSINESS_TYPE_ICONS[bt.name]
                  : Store
                const selected = bt.id === selectedBusinessType.id
                return (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => setBusinessTypeId(bt.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080c0b]",
                      selected
                        ? "border-meadow/40 bg-meadow/12 text-white"
                        : "border-white/10 bg-white/3 text-white/65 hover:border-white/20 hover:text-white",
                    )}
                    aria-pressed={selected}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {bt.displayName}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex rounded-full border border-white/10 bg-white/4 p-1">
                <button
                  type="button"
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080c0b]",
                    billingCycle === "monthly"
                      ? "bg-white text-[#000347]"
                      : "text-white/65 hover:text-white",
                  )}
                  aria-pressed={billingCycle === "monthly"}
                  onClick={() => setBillingCycle("monthly")}
                >
                  Mensual
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080c0b]",
                    billingCycle === "yearly"
                      ? "bg-white text-[#000347]"
                      : "text-white/65 hover:text-white",
                  )}
                  aria-pressed={billingCycle === "yearly"}
                  onClick={() => setBillingCycle("yearly")}
                >
                  Anual
                </button>
              </div>
              {savingsHint != null && billingCycle === "yearly" ? (
                <span className="rounded-full bg-meadow/15 px-3 py-1 text-xs font-semibold text-meadow">
                  Ahorrá {savingsHint}% pagando anual
                </span>
              ) : null}
            </div>
          </div>

          <ul className="grid list-none gap-5 lg:grid-cols-3 lg:gap-6">
            {paidPlans.map((plan) => {
              const limit = limitsByPlan.get(plan.name)
              if (!limit) {
                return (
                  <li
                    key={plan.id}
                    className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/45"
                  >
                    {plan.displayName}: sin precio para este rubro.
                  </li>
                )
              }
              return (
                <HeroPricingCard
                  key={plan.id}
                  plan={plan}
                  limit={limit}
                  billingCycle={billingCycle}
                  specificModulesCount={specificModulesCount}
                  featured={plan.name === LANDING_FEATURED_PLAN}
                  onSelect={() => startWithPlan(plan.name)}
                />
              )
            })}
          </ul>

          <p className="text-center text-xs text-white/40">
            Precios de referencia en ARS. Los valores finales pueden variar según
            promociones, impuestos y acuerdos comerciales.
          </p>

          <HeroModulesIncluded
            businessType={selectedBusinessType}
            extras={extras}
          />
        </div>
      )}
    </div>
  )
}

function HeroPricingCard({
  plan,
  limit,
  billingCycle,
  specificModulesCount,
  featured,
  onSelect,
}: {
  plan: PublicSubscriptionPlanRow
  limit: PublicPlanLimitRow
  billingCycle: BillingCycle
  specificModulesCount: number
  featured: boolean
  onSelect: () => void
}) {
  const planKey = isPublicPaidPlanKey(plan.name) ? plan.name : "starter"
  const copy = LANDING_PLAN_COPY[planKey]
  const displayAmount =
    billingCycle === "yearly" ? limit.priceYearly : limit.priceMonthly
  const periodLabel = billingCycle === "yearly" ? "/ año" : "/ mes"
  const features = landingPlanFeatures(limit, specificModulesCount)

  return (
    <li className={cn("flex", featured && "lg:-mt-2 lg:mb-2")}>
      <article
        className={cn(
          "relative flex w-full flex-col overflow-hidden rounded-2xl border bg-white/5",
          featured
            ? "border-meadow/35 shadow-[0_24px_60px_-28px_rgba(16,185,129,0.45)]"
            : "border-white/10",
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
              <h3 className="text-xl font-bold text-white">{plan.displayName}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                {copy.tagline}
              </p>
            </div>
            <div className="pt-1">
              <p className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="text-4xl font-extrabold tabular-nums tracking-tight text-white">
                  {formatLandingPlanMoney(displayAmount)}
                </span>
                <span className="text-base font-medium text-white/50">
                  {periodLabel}
                </span>
              </p>
              {billingCycle === "yearly" && limit.priceMonthly > 0 ? (
                <p className="mt-1 text-xs text-white/45">
                  Equivalente a{" "}
                  {formatLandingPlanMoney(Math.round(limit.priceYearly / 12))}
                  /mes
                </p>
              ) : (
                <p className="mt-1 text-xs text-white/45">
                  Facturación mensual · 7 días de prueba
                </p>
              )}
            </div>
          </header>

          <ul className="mt-6 flex flex-1 flex-col gap-3">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex gap-3 text-sm leading-snug text-white/80"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-meadow/15 text-meadow">
                  <Check className="size-3.5 stroke-[2.5]" aria-hidden />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={onSelect}
              className={cn(
                "flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080c0b]",
                featured
                  ? FEATURED_CTA_CLASS
                  : "border border-white/15 bg-white/4 text-white hover:border-white/25 hover:bg-white/8",
              )}
            >
              {copy.cta}
            </button>
          </div>
        </div>
      </article>
    </li>
  )
}

function HeroModulesIncluded({
  businessType,
  extras,
}: {
  businessType: PublicBusinessTypeRow
  extras: Array<{ key: string; label: string }>
}) {
  const typeKey = isPublicBusinessTypeKey(businessType.name)
    ? businessType.name
    : null
  const specificModules = typeKey ? listSpecificModulesFlat(typeKey) : []

  if (!typeKey) return null

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 px-5 py-6 sm:px-7">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-meadow">
        Qué incluye {businessType.displayName}
      </p>
      <p className="mt-1 text-sm text-white/60">
        Módulos específicos del rubro más la base compartida de Rootsy en todos
        los planes.
      </p>
      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Módulos del rubro</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {specificModules.map((mod) => {
              const Icon = getRootsModuleIcon(mod.key)
              return (
                <li
                  key={mod.key}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-medium text-white/80"
                >
                  <Icon className="size-3.5 text-meadow" aria-hidden />
                  {mod.label}
                </li>
              )
            })}
          </ul>
        </div>
        {extras.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-white">Extras opcionales</h3>
            <ul className="mt-3 space-y-2">
              {extras.map((mod) => {
                const Icon = getRootsModuleIcon(mod.key)
                const price = ROOTS_EXTRA_MODULE_PRICES[mod.key] ?? 0
                return (
                  <li
                    key={mod.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm"
                  >
                    <span className="flex items-center gap-2 font-medium text-white/85">
                      <Icon className="size-4 text-meadow" aria-hidden />
                      {mod.label}
                    </span>
                    <span className="tabular-nums text-white/55">
                      +{formatLandingPlanMoney(price)}/mes
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function HeroPlanesSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Cargando planes">
      <div className="flex justify-center gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-10 w-28 rounded-full border border-white/10 bg-white/4"
          />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-80 rounded-2xl border border-white/10 bg-white/3"
          />
        ))}
      </div>
    </div>
  )
}
