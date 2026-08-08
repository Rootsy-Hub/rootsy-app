"use client"

import type {
  BackofficeBusinessTypeRow,
  BackofficePlanLimitRow,
  BackofficeSubscriptionCatalog,
  BackofficeSubscriptionPlanRow,
} from "@/app/backoffice/actions"
import { formatBackofficeMoney } from "@/app/backoffice/components/BackofficeSection"
import {
  ROOTS_BUSINESS_TYPE_ORDER,
  ROOTS_EXTRA_MODULE_PRICES,
  ROOTS_MODULE_SECTION_LABELS,
  ROOTS_PAID_PLAN_ORDER,
  ROOTS_PLAN_DEFINITIONS,
  ROOTS_SHARED_MODULES,
  listSpecificModulesFlat,
  type RootsBusinessTypeKey,
  type RootsModuleDefinition,
  type RootsModuleSectionKey,
} from "@/lib/rootsySubscriptionCatalog"
import { getRootsModuleIcon } from "@/lib/rootsyModuleIcons"
import type { LucideIcon } from "lucide-react"

type ModuleEntry = { key: string; label: string }

function parseModuleEntries(raw: unknown): ModuleEntry[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (entry): entry is ModuleEntry =>
      typeof entry === "object" &&
      entry != null &&
      typeof (entry as ModuleEntry).key === "string" &&
      typeof (entry as ModuleEntry).label === "string",
  )
}

function ModuleIconTile({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <div className="flex w-[5.5rem] flex-col items-center gap-2 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border/80 bg-muted/30 text-primary shadow-sm">
        <Icon className="size-6" aria-hidden />
      </div>
      <span className="text-[11px] font-medium leading-tight text-foreground">
        {label}
      </span>
    </div>
  )
}

const SHARED_MODULE_SECTIONS: Exclude<RootsModuleSectionKey, "extras">[] = [
  "operar",
  "administrar",
  "configurar",
]

function ModuleCategoryBlock({
  title,
  modules,
}: {
  title: string
  modules: RootsModuleDefinition[]
}) {
  if (modules.length === 0) return null
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </h3>
      <ModuleIconGrid modules={modules} />
    </div>
  )
}

function ModuleIconGrid({ modules }: { modules: RootsModuleDefinition[] }) {
  if (modules.length === 0) return null
  return (
    <div className="flex flex-wrap gap-4">
      {modules.map((mod) => (
        <ModuleIconTile
          key={mod.key}
          label={mod.label}
          icon={getRootsModuleIcon(mod.key)}
        />
      ))}
    </div>
  )
}

function ExtraModuleRow({
  label,
  icon: Icon,
  price,
}: {
  label: string
  icon: LucideIcon
  price: number
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background text-primary">
          <Icon className="size-4" aria-hidden />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold tabular-nums text-foreground">
        {formatBackofficeMoney(price)}
        <span className="text-xs font-normal text-muted-foreground">/mes</span>
      </span>
    </div>
  )
}

function PlanLimitCard({
  plan,
  limit,
}: {
  plan: BackofficeSubscriptionPlanRow
  limit: BackofficePlanLimitRow
}) {
  const planMeta = ROOTS_PLAN_DEFINITIONS[plan.name as keyof typeof ROOTS_PLAN_DEFINITIONS]

  return (
    <article className="library-spec-card rounded-2xl p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold">{plan.displayName}</h4>
          {planMeta?.description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {planMeta.description}
            </p>
          ) : null}
        </div>
        <p className="text-lg font-bold tabular-nums">
          {formatBackofficeMoney(limit.priceMonthly)}
          <span className="text-xs font-normal text-muted-foreground">/mes</span>
        </p>
      </div>

      <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
        <li>
          <span className="font-medium text-foreground">
            {limit.maxUsersLabel}
          </span>{" "}
          usuarios
        </li>
        <li>
          <span className="font-medium text-foreground">
            {limit.maxArticlesLabel}
          </span>{" "}
          artículos
        </li>
        <li>
          <span className="font-medium text-foreground">
            {limit.maxOperationsPerMonthLabel}
          </span>{" "}
          operaciones/mes
        </li>
        {limit.allModules ? (
          <li className="pt-1 text-emerald-700">Todos los módulos incluidos</li>
        ) : null}
      </ul>
    </article>
  )
}

function BusinessTypeSection({
  businessType,
  plans,
  limits,
}: {
  businessType: BackofficeBusinessTypeRow
  plans: BackofficeSubscriptionPlanRow[]
  limits: BackofficePlanLimitRow[]
}) {
  const typeKey = businessType.name as RootsBusinessTypeKey
  const specificFromDb = [
    ...parseModuleEntries(businessType.modulesStructured.specific?.operar),
    ...parseModuleEntries(businessType.modulesStructured.specific?.administrar),
    ...parseModuleEntries(businessType.modulesStructured.specific?.configurar),
  ]
  const specificModules =
    specificFromDb.length > 0
      ? specificFromDb
      : listSpecificModulesFlat(typeKey)

  const extras =
    parseModuleEntries(businessType.modulesStructured.extras).length > 0
      ? parseModuleEntries(businessType.modulesStructured.extras)
      : []

  const paidPlans = ROOTS_PAID_PLAN_ORDER.map((planName) =>
    plans.find((plan) => plan.name === planName),
  ).filter((plan): plan is BackofficeSubscriptionPlanRow => Boolean(plan))

  const limitsByPlan = new Map(
    limits
      .filter((row) => row.businessTypeName === businessType.name)
      .map((row) => [row.planName, row]),
  )

  return (
    <section className="library-spec-card space-y-6 rounded-2xl p-6 sm:p-8">
      <div>
        <h2 className="font-canopy text-xl font-semibold tracking-tight text-[var(--rootsy-bruma-900)]">
          {businessType.displayName}
        </h2>
        {businessType.description ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {businessType.description}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Módulos específicos
        </h3>
        <ModuleIconGrid modules={specificModules} />
      </div>

      {extras.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Extras
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {extras.map((mod) => (
              <ExtraModuleRow
                key={mod.key}
                label={mod.label}
                icon={getRootsModuleIcon(mod.key)}
                price={ROOTS_EXTRA_MODULE_PRICES[mod.key] ?? 0}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Planes
        </h3>
        <div className="grid gap-3 lg:grid-cols-3">
          {paidPlans.map((plan) => {
            const limit = limitsByPlan.get(plan.name)
            if (!limit) {
              return (
                <article
                  key={plan.id}
                  className="rounded-xl border border-dashed border-border/80 px-4 py-6 text-sm text-muted-foreground"
                >
                  {plan.displayName}: sin límites configurados
                </article>
              )
            }
            return (
              <PlanLimitCard key={plan.id} plan={plan} limit={limit} />
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function BackofficeBusinessTypesOverview({
  catalog,
}: {
  catalog: BackofficeSubscriptionCatalog
}) {
  const businessTypesByName = new Map(
    catalog.businessTypes
      .filter((row) => row.isActive)
      .map((row) => [row.name, row]),
  )

  const orderedBusinessTypes = ROOTS_BUSINESS_TYPE_ORDER.map((key) =>
    businessTypesByName.get(key),
  ).filter((row): row is BackofficeBusinessTypeRow => Boolean(row))

  return (
    <div className="space-y-12">
      <section className="library-spec-card space-y-6 rounded-2xl p-6">
        <h2 className="font-canopy text-lg font-semibold text-[var(--rootsy-bruma-900)]">
          Módulos generales
        </h2>
        <div className="space-y-8">
          {SHARED_MODULE_SECTIONS.map((section) => (
            <ModuleCategoryBlock
              key={section}
              title={ROOTS_MODULE_SECTION_LABELS[section]}
              modules={ROOTS_SHARED_MODULES[section]}
            />
          ))}
        </div>
      </section>

      {orderedBusinessTypes.map((businessType) => (
        <BusinessTypeSection
          key={businessType.id}
          businessType={businessType}
          plans={catalog.plans}
          limits={catalog.planLimits}
        />
      ))}
    </div>
  )
}
