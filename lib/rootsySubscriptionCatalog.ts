export type RootsModuleSectionKey =
  | "operar"
  | "administrar"
  | "configurar"
  | "extras"

export type RootsModuleDefinition = {
  key: string
  label: string
}

export type RootsPublicBusinessTypeKey = "comercio" | "restaurant" | "fabrica"

/** Rubros visibles al público + rubro interno `platform_full`. */
export type RootsBusinessTypeKey = RootsPublicBusinessTypeKey | "platform_full"

export type RootsPlanKey =
  | "free_trial"
  | "starter"
  | "enterprise"
  | "professional"
  | "rootsy_internal"

/** Precio mensual de add-on por módulo extra (ARS). */
export const ROOTS_EXTRA_MODULE_PRICES: Record<string, number> = {
  manufacturing: 15,
  invoices: 10,
  printers: 8,
  chat: 12,
}

export const ROOTS_BUSINESS_TYPE_ORDER: RootsPublicBusinessTypeKey[] = [
  "comercio",
  "restaurant",
  "fabrica",
]

export type RootsPublicPaidPlanKey = Exclude<
  RootsPlanKey,
  "free_trial" | "rootsy_internal"
>

export const ROOTS_PAID_PLAN_ORDER: RootsPublicPaidPlanKey[] = [
  "starter",
  "professional",
  "enterprise",
]

export const ROOTS_SHARED_MODULES: Record<
  Exclude<RootsModuleSectionKey, "extras">,
  RootsModuleDefinition[]
> = {
  operar: [
    { key: "clients", label: "Clientes" },
    { key: "services", label: "Servicios" },
    { key: "active_services", label: "Servicios activos" },
    { key: "current_accounts", label: "Cuentas corrientes" },
    { key: "checks", label: "Cheques" },
    { key: "expenses", label: "Gastos" },
  ],
  administrar: [
    { key: "summary", label: "Resumen" },
    { key: "statistics", label: "Estadísticas" },
    { key: "reports", label: "Reportes" },
    { key: "operations", label: "Operaciones" },
  ],
  configurar: [
    { key: "alerts", label: "Alertas" },
    { key: "accounts", label: "Cuentas" },
    { key: "hr", label: "Recursos Humanos" },
    { key: "settings", label: "Ajustes" },
  ],
}

function dedupeModulesByKey(
  modules: RootsModuleDefinition[],
): RootsModuleDefinition[] {
  const seen = new Set<string>()
  const out: RootsModuleDefinition[] = []
  for (const mod of modules) {
    if (seen.has(mod.key)) continue
    seen.add(mod.key)
    out.push(mod)
  }
  return out
}

type RootsBusinessTypeModulesConfig = {
  displayName: string
  description: string
  specific: Record<Exclude<RootsModuleSectionKey, "extras">, RootsModuleDefinition[]>
  extras: RootsModuleDefinition[]
}

const ROOTS_PUBLIC_BUSINESS_TYPE_MODULES: Record<
  RootsPublicBusinessTypeKey,
  RootsBusinessTypeModulesConfig
> = {
  comercio: {
    displayName: "Comercio",
    description: "Retail y comercio minorista.",
    specific: {
      operar: [
        { key: "sale", label: "Vender" },
        { key: "purchases", label: "Comprar" },
        { key: "promotions", label: "Promociones" },
        { key: "stock", label: "Stock" },
        { key: "suppliers", label: "Proveedores" },
      ],
      administrar: [
        { key: "quotes", label: "Presupuestos" },
        { key: "purchase_orders", label: "Órdenes de compra" },
        { key: "inventory", label: "Inventario" },
      ],
      configurar: [{ key: "cash_registers", label: "Cajas" }],
    },
    extras: [
      { key: "manufacturing", label: "Fabricación" },
      { key: "invoices", label: "Facturas" },
      { key: "printers", label: "Impresoras" },
      { key: "chat", label: "Chat" },
    ],
  },
  restaurant: {
    displayName: "Bar/Restaurantes",
    description: "Bares, restaurantes y gastronomía.",
    specific: {
      operar: [
        { key: "mesas", label: "Mesas" },
        { key: "mostrador", label: "Mostrador" },
        { key: "recipes", label: "Recetas" },
        { key: "promotions", label: "Promociones" },
        { key: "stock", label: "Stock" },
        { key: "suppliers", label: "Proveedores" },
      ],
      administrar: [
        { key: "quotes", label: "Presupuestos" },
        { key: "purchase_orders", label: "Órdenes de compra" },
        { key: "inventory", label: "Inventario" },
      ],
      configurar: [{ key: "cash_registers", label: "Cajas" }],
    },
    extras: [
      { key: "manufacturing", label: "Fabricación" },
      { key: "invoices", label: "Facturas" },
      { key: "printers", label: "Impresoras" },
      { key: "chat", label: "Chat" },
    ],
  },
  fabrica: {
    displayName: "Fábrica",
    description: "Producción y manufactura.",
    specific: {
      operar: [
        { key: "sale", label: "Vender" },
        { key: "manufacturing", label: "Fabricar" },
        { key: "recipes", label: "Recetas" },
        { key: "promotions", label: "Promociones" },
        { key: "stock", label: "Stock" },
        { key: "suppliers", label: "Proveedores" },
      ],
      administrar: [
        { key: "quotes", label: "Presupuestos" },
        { key: "purchase_orders", label: "Órdenes de compra" },
        { key: "inventory", label: "Inventario" },
      ],
      configurar: [{ key: "cash_registers", label: "Cajas" }],
    },
    extras: [
      { key: "invoices", label: "Facturas" },
      { key: "printers", label: "Impresoras" },
      { key: "chat", label: "Chat" },
    ],
  },
}

function buildPlatformFullBusinessTypeModules(): RootsBusinessTypeModulesConfig {
  return {
    displayName: "Plataforma completa",
    description: "Uso interno Rootsy: todos los módulos de todos los rubros.",
    specific: {
      operar: dedupeModulesByKey(
        ROOTS_BUSINESS_TYPE_ORDER.flatMap(
          (key) => ROOTS_PUBLIC_BUSINESS_TYPE_MODULES[key].specific.operar,
        ),
      ),
      administrar: dedupeModulesByKey(
        ROOTS_BUSINESS_TYPE_ORDER.flatMap(
          (key) => ROOTS_PUBLIC_BUSINESS_TYPE_MODULES[key].specific.administrar,
        ),
      ),
      configurar: dedupeModulesByKey([
        ...ROOTS_BUSINESS_TYPE_ORDER.flatMap(
          (key) => ROOTS_PUBLIC_BUSINESS_TYPE_MODULES[key].specific.configurar,
        ),
        { key: "accounting", label: "Contabilidad" },
      ]),
    },
    extras: dedupeModulesByKey(
      ROOTS_BUSINESS_TYPE_ORDER.flatMap(
        (key) => ROOTS_PUBLIC_BUSINESS_TYPE_MODULES[key].extras,
      ),
    ),
  }
}

export const ROOTS_BUSINESS_TYPE_MODULES: Record<
  RootsBusinessTypeKey,
  RootsBusinessTypeModulesConfig
> = {
  ...ROOTS_PUBLIC_BUSINESS_TYPE_MODULES,
  platform_full: buildPlatformFullBusinessTypeModules(),
}

export const ROOTS_PLAN_DEFINITIONS: Record<
  Exclude<RootsPlanKey, "rootsy_internal">,
  {
    displayName: string
    description: string
    trialDays: number
    sortOrder: number
  }
> = {
  free_trial: {
    displayName: "Prueba gratis",
    description: "Starter por 7 días sin cargo.",
    trialDays: 7,
    sortOrder: 0,
  },
  starter: {
    displayName: "Starter",
    description: "Plan inicial según tipo de negocio.",
    trialDays: 0,
    sortOrder: 1,
  },
  enterprise: {
    displayName: "Enterprise",
    description: "Todos los módulos y consumos ilimitados.",
    trialDays: 0,
    sortOrder: 3,
  },
  professional: {
    displayName: "Professional",
    description: "Límites ampliados según tipo de negocio.",
    trialDays: 0,
    sortOrder: 2,
  },
}

/** Límites por plan × tipo de negocio públicos. -1 = ilimitado. */
export const ROOTS_PLAN_LIMITS: Record<
  Exclude<RootsPlanKey, "free_trial" | "rootsy_internal">,
  Record<
    RootsPublicBusinessTypeKey,
    {
      maxUsers: number
      maxArticles: number
      maxOperationsPerMonth: number
      priceMonthly: number
      priceYearly: number
      allModules: boolean
    }
  >
> = {
  starter: {
    comercio: {
      maxUsers: 2,
      maxArticles: 100,
      maxOperationsPerMonth: 500,
      priceMonthly: 29,
      priceYearly: 290,
      allModules: false,
    },
    restaurant: {
      maxUsers: 5,
      maxArticles: 300,
      maxOperationsPerMonth: 1000,
      priceMonthly: 49,
      priceYearly: 490,
      allModules: false,
    },
    fabrica: {
      maxUsers: 3,
      maxArticles: 150,
      maxOperationsPerMonth: 600,
      priceMonthly: 59,
      priceYearly: 590,
      allModules: false,
    },
  },
  enterprise: {
    comercio: {
      maxUsers: -1,
      maxArticles: -1,
      maxOperationsPerMonth: -1,
      priceMonthly: 199,
      priceYearly: 1990,
      allModules: true,
    },
    restaurant: {
      maxUsers: -1,
      maxArticles: -1,
      maxOperationsPerMonth: -1,
      priceMonthly: 229,
      priceYearly: 2290,
      allModules: true,
    },
    fabrica: {
      maxUsers: -1,
      maxArticles: -1,
      maxOperationsPerMonth: -1,
      priceMonthly: 249,
      priceYearly: 2490,
      allModules: true,
    },
  },
  professional: {
    comercio: {
      maxUsers: 15,
      maxArticles: 5000,
      maxOperationsPerMonth: 10000,
      priceMonthly: 79,
      priceYearly: 790,
      allModules: false,
    },
    restaurant: {
      maxUsers: 20,
      maxArticles: 8000,
      maxOperationsPerMonth: 15000,
      priceMonthly: 99,
      priceYearly: 990,
      allModules: false,
    },
    fabrica: {
      maxUsers: 25,
      maxArticles: 10000,
      maxOperationsPerMonth: 20000,
      priceMonthly: 109,
      priceYearly: 1090,
      allModules: false,
    },
  },
}

export function buildBusinessTypeModulesJson(
  businessTypeKey: RootsPublicBusinessTypeKey,
): Record<string, unknown> {
  const config = ROOTS_PUBLIC_BUSINESS_TYPE_MODULES[businessTypeKey]
  return {
    shared: ROOTS_SHARED_MODULES,
    specific: config.specific,
    extras: config.extras,
  }
}

export function formatPlanLimitValue(value: number): string {
  return value < 0 ? "Ilimitado" : value.toLocaleString("es-AR")
}

export function listSharedModulesFlat(): RootsModuleDefinition[] {
  return [
    ...ROOTS_SHARED_MODULES.operar,
    ...ROOTS_SHARED_MODULES.administrar,
    ...ROOTS_SHARED_MODULES.configurar,
  ]
}

export function listSpecificModulesFlat(
  businessTypeKey: RootsBusinessTypeKey,
): RootsModuleDefinition[] {
  const config = ROOTS_BUSINESS_TYPE_MODULES[businessTypeKey]
  return [
    ...config.specific.operar,
    ...config.specific.administrar,
    ...config.specific.configurar,
  ]
}

export function listAllModulesForBusinessType(
  businessTypeKey: RootsBusinessTypeKey,
): RootsModuleDefinition[] {
  const config = ROOTS_BUSINESS_TYPE_MODULES[businessTypeKey]
  return [
    ...ROOTS_SHARED_MODULES.operar,
    ...ROOTS_SHARED_MODULES.administrar,
    ...ROOTS_SHARED_MODULES.configurar,
    ...config.specific.operar,
    ...config.specific.administrar,
    ...config.specific.configurar,
    ...config.extras,
  ]
}

export const ROOTS_MODULE_SECTION_LABELS: Record<RootsModuleSectionKey, string> =
  {
    operar: "Operar",
    administrar: "Administrar",
    configurar: "Configurar",
    extras: "Extras",
  }
