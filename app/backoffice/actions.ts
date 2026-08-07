"use server"

import { requireBackofficeAccess } from "@/app/backoffice/backofficeAuth"
import {
  BACKOFFICE_POPS_PAGE_SIZE_OPTIONS,
  DEFAULT_BACKOFFICE_POPS_PAGE_SIZE,
} from "@/app/backoffice/backofficePopsConstants"
import { createServiceRoleClient } from "@/utils/supabase/service-role"

async function backofficeDb() {
  await requireBackofficeAccess()
  return createServiceRoleClient()
}

export type BackofficeSubscriptionPlanRow = {
  id: string
  name: string
  displayName: string
  description: string | null
  basePriceMonthly: number
  basePriceYearly: number
  trialDays: number
  sortOrder: number
  isActive: boolean
}

export type BackofficeBusinessTypeModules = {
  shared?: Record<string, unknown>
  specific?: Record<string, unknown>
  extras?: unknown
}

export type BackofficeBusinessTypeRow = {
  id: string
  name: string
  displayName: string
  description: string | null
  addonPriceMonthly: number
  addonPriceYearly: number
  modulesStructured: BackofficeBusinessTypeModules
  isActive: boolean
}

export type BackofficePlanLimitRow = {
  id: string
  planId: string
  planName: string
  businessTypeId: string
  businessTypeName: string
  maxUsers: number
  maxArticles: number
  maxOperationsPerMonth: number
  maxUsersLabel: string
  maxArticlesLabel: string
  maxOperationsPerMonthLabel: string
  priceMonthly: number
  priceYearly: number
  allModules: boolean
}

export type BackofficeSubscriptionCatalog = {
  plans: BackofficeSubscriptionPlanRow[]
  businessTypes: BackofficeBusinessTypeRow[]
  planLimits: BackofficePlanLimitRow[]
}

export type BackofficePopExtraModuleSummary = {
  key: string
  label: string
}

export type BackofficePopRow = {
  id: string
  name: string
  siteId: string
  country: string | null
  imageUrl: string | null
  isActive: boolean
  ownerUserId: string
  ownerName: string
  organizationId: string | null
  organizationName: string | null
  organizationOwnerName: string | null
  businessTypeName: string | null
  businessTypeDisplayName: string | null
  subscriptionStatus: string | null
  planName: string | null
  planDisplayName: string | null
  billingCycle: "monthly" | "yearly" | null
  priceMonthly: number
  priceYearly: number
  extraModules: BackofficePopExtraModuleSummary[]
  createdAt: string
}

export type BackofficePopsPageResult = {
  rows: BackofficePopRow[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export type BackofficePopExtraModule = {
  key: string
  label: string
  priceMonthly: number
}

export type BackofficePopLastPayment = {
  id: string
  amount: number
  paidAt: string
  paymentMethod: string
  paymentReference: string | null
}

export type BackofficePopSubscriptionDetail = {
  id: string
  status: string
  planName: string
  planDisplayName: string
  businessTypeName: string
  businessTypeDisplayName: string
  extraModules: BackofficePopExtraModule[]
  periodStart: string | null
  periodEnd: string | null
  priceMonthly: number
  lastPayment: BackofficePopLastPayment | null
}

export type BackofficePopDetail = {
  id: string
  name: string
  imageUrl: string | null
  siteId: string
  isActive: boolean
  createdAt: string
  owner: {
    id: string
    name: string
    imageUrl: string | null
  }
  subscription: BackofficePopSubscriptionDetail | null
  timeline: BackofficeTimelineEntry[]
}

export type BackofficeUserRow = {
  id: string
  email: string | null
  firstName: string
  lastName: string
  fullName: string
  imageUrl: string | null
  country: string | null
  language: string | null
  createdAt: string
}

export type BackofficeUserPopSummary = {
  id: string
  name: string
  imageUrl: string | null
  siteId: string
  isActive: boolean
  businessTypeName: string | null
  businessTypeDisplayName: string | null
  planName: string | null
  planDisplayName: string | null
  subscriptionStatus: string | null
  lastPaymentAmount: number | null
  lastPaymentAt: string | null
}

export type BackofficeUserMembershipPop = BackofficeUserPopSummary & {
  roleName: string
  roleDisplayName: string
  membershipActive: boolean
}

export type BackofficeUserDetail = {
  id: string
  email: string | null
  firstName: string
  lastName: string
  fullName: string
  imageUrl: string | null
  country: string | null
  language: string | null
  createdAt: string
  ownedPops: BackofficeUserPopSummary[]
  memberPops: BackofficeUserMembershipPop[]
}

import { formatPlanLimitValue } from "@/lib/rootsySubscriptionCatalog"
import {
  buildBackofficeTimeline,
  parseBackofficeExtraModules,
  type BackofficeTimelineEntry,
} from "@/lib/backofficeSubscriptionTimeline"

function mapPlanLimitLabel(value: number): string {
  return formatPlanLimitValue(value)
}

const BACKOFFICE_POP_SUMMARY_SELECT = `
  id,
  name,
  image_url,
  site_id,
  is_active,
  owner_user_id,
  subscription_id,
  _business_types:business_type_id ( name, display_name ),
  _pop_subscriptions:subscription_id (
    status,
    _subscription_plans:plan_id ( name, display_name )
  )
`

type PopSummaryRow = {
  id: string
  name: string
  image_url: string | null
  site_id: string
  is_active: boolean
  owner_user_id: string
  _business_types:
    | { name: string; display_name: string }
    | { name: string; display_name: string }[]
    | null
  _pop_subscriptions:
    | {
        status: string
        _subscription_plans:
          | { name: string; display_name: string }
          | { name: string; display_name: string }[]
          | null
      }
    | {
        status: string
        _subscription_plans:
          | { name: string; display_name: string }
          | { name: string; display_name: string }[]
          | null
      }[]
    | null
}

function mapPopSummaryRow(
  row: PopSummaryRow,
  lastPaymentByPopId: Map<string, { amount: number; paidAt: string }>,
): BackofficeUserPopSummary {
  const businessType = Array.isArray(row._business_types)
    ? row._business_types[0]
    : row._business_types
  const subscription = Array.isArray(row._pop_subscriptions)
    ? row._pop_subscriptions[0]
    : row._pop_subscriptions
  const planRaw = subscription?._subscription_plans
  const plan = Array.isArray(planRaw) ? planRaw[0] : planRaw
  const lastPayment = lastPaymentByPopId.get(String(row.id))

  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    imageUrl: row.image_url != null ? String(row.image_url) : null,
    siteId: String(row.site_id ?? ""),
    isActive: Boolean(row.is_active),
    businessTypeName: businessType?.name ? String(businessType.name) : null,
    businessTypeDisplayName: businessType?.display_name
      ? String(businessType.display_name)
      : null,
    planName: plan?.name ? String(plan.name) : null,
    planDisplayName: plan?.display_name
      ? String(plan.display_name)
      : plan?.name
        ? String(plan.name)
        : null,
    subscriptionStatus: subscription?.status
      ? String(subscription.status)
      : null,
    lastPaymentAmount: lastPayment?.amount ?? null,
    lastPaymentAt: lastPayment?.paidAt ?? null,
  }
}

async function fetchLastPaymentsByPopId(
  supabase: Awaited<ReturnType<typeof backofficeDb>>,
  popIds: string[],
): Promise<Map<string, { amount: number; paidAt: string }>> {
  const map = new Map<string, { amount: number; paidAt: string }>()
  if (popIds.length === 0) return map

  const { data } = await supabase
    .from("_subscription_invoices")
    .select("pop_id, amount, paid_at")
    .in("pop_id", popIds)
    .eq("status", "paid")
    .not("paid_at", "is", null)
    .order("paid_at", { ascending: false })

  for (const row of data ?? []) {
    const popId = String(row.pop_id ?? "")
    if (!popId || map.has(popId)) continue
    map.set(popId, {
      amount: Number(row.amount ?? 0),
      paidAt: String(row.paid_at ?? ""),
    })
  }

  return map
}

export async function listBackofficeSubscriptionCatalog(): Promise<BackofficeSubscriptionCatalog> {
  const [plans, businessTypes, planLimits] = await Promise.all([
    listBackofficeSubscriptionPlans(),
    listBackofficeBusinessTypes(),
    listBackofficePlanLimits(),
  ])
  return { plans, businessTypes, planLimits }
}

export async function listBackofficeSubscriptionPlans(): Promise<
  BackofficeSubscriptionPlanRow[]
> {
  const supabase = await backofficeDb()
  const { data, error } = await supabase
    .from("_subscription_plans")
    .select(
      "id, name, display_name, description, base_price_monthly, base_price_yearly, trial_days, sort_order, is_active",
    )
    .order("sort_order", { ascending: true })

  if (error || !data) return []

  return data.map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ""),
    displayName: String(row.display_name ?? row.name ?? ""),
    description: row.description != null ? String(row.description) : null,
    basePriceMonthly: Number(row.base_price_monthly ?? 0),
    basePriceYearly: Number(row.base_price_yearly ?? 0),
    trialDays: Number(row.trial_days ?? 0),
    sortOrder: Number(row.sort_order ?? 0),
    isActive: Boolean(row.is_active),
  }))
}

export async function listBackofficePlanLimits(): Promise<BackofficePlanLimitRow[]> {
  const supabase = await backofficeDb()
  const { data, error } = await supabase
    .from("_subscription_plan_limits")
    .select(
      `
      id,
      max_users,
      max_articles,
      max_operations_per_month,
      price_monthly,
      price_yearly,
      all_modules,
      plan:_subscription_plans ( id, name ),
      business_type:_business_types ( id, name )
    `,
    )
    .order("price_monthly", { ascending: true })

  if (error || !data) return []

  return data.map((row) => {
    const planRaw = Array.isArray(row.plan) ? row.plan[0] : row.plan
    const btRaw = Array.isArray(row.business_type)
      ? row.business_type[0]
      : row.business_type
    const maxUsers = Number(row.max_users ?? 0)
    const maxArticles = Number(row.max_articles ?? 0)
    const maxOps = Number(row.max_operations_per_month ?? 0)
    return {
      id: String(row.id),
      planId: String(planRaw?.id ?? ""),
      planName: String(planRaw?.name ?? ""),
      businessTypeId: String(btRaw?.id ?? ""),
      businessTypeName: String(btRaw?.name ?? ""),
      maxUsers,
      maxArticles,
      maxOperationsPerMonth: maxOps,
      maxUsersLabel: mapPlanLimitLabel(maxUsers),
      maxArticlesLabel: mapPlanLimitLabel(maxArticles),
      maxOperationsPerMonthLabel: mapPlanLimitLabel(maxOps),
      priceMonthly: Number(row.price_monthly ?? 0),
      priceYearly: Number(row.price_yearly ?? 0),
      allModules: Boolean(row.all_modules),
    }
  })
}

export async function listBackofficeBusinessTypes(): Promise<
  BackofficeBusinessTypeRow[]
> {
  const supabase = await backofficeDb()
  const { data, error } = await supabase
    .from("_business_types")
    .select(
      "id, name, display_name, description, addon_price_monthly, addon_price_yearly, modules, is_active",
    )
    .order("display_name", { ascending: true })

  if (error || !data) return []

  return data.map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ""),
    displayName: String(row.display_name ?? row.name ?? ""),
    description: row.description != null ? String(row.description) : null,
    addonPriceMonthly: Number(row.addon_price_monthly ?? 0),
    addonPriceYearly: Number(row.addon_price_yearly ?? 0),
    modulesStructured: (row.modules as BackofficeBusinessTypeModules) ?? {},
    isActive: Boolean(row.is_active),
  }))
}

function mapBackofficeUserName(
  user:
    | { first_name?: string | null; last_name?: string | null }
    | null
    | undefined,
  fallback = "",
): string {
  const first = String(user?.first_name ?? "").trim()
  const last = String(user?.last_name ?? "").trim()
  return `${first} ${last}`.trim() || fallback
}

function normalizeBillingCycle(
  value: unknown,
): "monthly" | "yearly" | null {
  if (value === "monthly" || value === "yearly") return value
  return null
}

function mapBackofficePopListRow(row: Record<string, unknown>): BackofficePopRow {
  const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner
  const organization = Array.isArray(row.organization)
    ? row.organization[0]
    : row.organization
  const businessType = Array.isArray(row._business_types)
    ? row._business_types[0]
    : row._business_types
  const subscription = Array.isArray(row._pop_subscriptions)
    ? row._pop_subscriptions[0]
    : row._pop_subscriptions
  const planRaw = subscription?._subscription_plans
  const plan = Array.isArray(planRaw) ? planRaw[0] : planRaw
  const billingCycle =
    normalizeBillingCycle(subscription?.scheduled_billing_cycle) ??
    normalizeBillingCycle(subscription?.billing_cycle)
  const extraModules = parseBackofficeExtraModules(subscription?.extra_modules).map(
    (mod) => ({
      key: mod.key,
      label: mod.label,
    }),
  )

  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    siteId: String(row.site_id ?? ""),
    country: row.country != null ? String(row.country) : null,
    imageUrl: row.image_url != null ? String(row.image_url) : null,
    isActive: Boolean(row.is_active),
    ownerUserId: String(row.owner_user_id ?? ""),
    ownerName: mapBackofficeUserName(
      owner as { first_name?: string | null; last_name?: string | null },
      String(row.owner_user_id ?? ""),
    ),
    organizationId:
      organization?.id != null ? String(organization.id) : null,
    organizationName:
      organization?.name != null ? String(organization.name) : null,
    organizationOwnerName: mapBackofficeUserName(
      owner as { first_name?: string | null; last_name?: string | null },
    ) || null,
    businessTypeName: businessType?.name
      ? String(businessType.name)
      : null,
    businessTypeDisplayName: businessType?.display_name
      ? String(businessType.display_name)
      : businessType?.name
        ? String(businessType.name)
        : null,
    subscriptionStatus: subscription?.status
      ? String(subscription.status)
      : null,
    planName: plan?.name ? String(plan.name) : null,
    planDisplayName: plan?.display_name
      ? String(plan.display_name)
      : plan?.name
        ? String(plan.name)
        : null,
    billingCycle,
    priceMonthly: Number(subscription?.price_monthly ?? 0),
    priceYearly: Number(subscription?.price_yearly ?? 0),
    extraModules,
    createdAt: String(row.created_at ?? ""),
  }
}

const BACKOFFICE_POPS_LIST_SELECT = `
  id,
  name,
  site_id,
  country,
  image_url,
  is_active,
  owner_user_id,
  created_at,
  organization:organization_id (
    id,
    name
  ),
  _business_types:business_type_id ( name, display_name ),
  _pop_subscriptions:subscription_id (
    status,
    billing_cycle,
    scheduled_billing_cycle,
    price_monthly,
    price_yearly,
    extra_modules,
    _subscription_plans:plan_id ( name, display_name )
  ),
  owner:owner_user_id ( first_name, last_name )
`

function normalizeBackofficePopsPaging(page: number, pageSize: number) {
  const sizes = new Set<number>(BACKOFFICE_POPS_PAGE_SIZE_OPTIONS)
  const ps = sizes.has(pageSize) ? pageSize : DEFAULT_BACKOFFICE_POPS_PAGE_SIZE
  const p = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1
  return { page: p, pageSize: ps }
}

export async function listBackofficePopsPage(input: {
  page: number
  pageSize: number
}): Promise<BackofficePopsPageResult> {
  const supabase = await backofficeDb()
  const { page: reqPage, pageSize } = normalizeBackofficePopsPaging(
    input.page,
    input.pageSize,
  )

  const { count, error: countError } = await supabase
    .from("pops")
    .select("id", { count: "exact", head: true })

  if (countError) {
    return {
      rows: [],
      totalCount: 0,
      page: 1,
      pageSize,
      totalPages: 1,
    }
  }

  const totalCount = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(reqPage, totalPages)
  const from = (safePage - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error } = await supabase
    .from("pops")
    .select(BACKOFFICE_POPS_LIST_SELECT)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error || !data) {
    throw new Error(
      error?.message ?? "No se pudieron cargar los puntos de venta.",
    )
  }

  return {
    rows: data.map((row) => mapBackofficePopListRow(row as Record<string, unknown>)),
    totalCount,
    page: safePage,
    pageSize,
    totalPages,
  }
}

export async function deactivateBackofficePop(
  popId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await backofficeDb()
  const { error } = await supabase
    .from("pops")
    .update({ is_active: false })
    .eq("id", popId)

  if (error) {
    return {
      success: false,
      error: "No se pudo desactivar el punto de venta.",
    }
  }

  return { success: true }
}

export async function getBackofficePopDetail(
  popId: string,
): Promise<BackofficePopDetail | null> {
  const supabase = await backofficeDb()

  const { data: popRow, error: popError } = await supabase
    .from("pops")
    .select(
      `
      id,
      name,
      site_id,
      image_url,
      is_active,
      owner_user_id,
      created_at,
      subscription_id,
      owner:owner_user_id ( first_name, last_name, image_url )
    `,
    )
    .eq("id", popId)
    .maybeSingle()

  if (popError || !popRow) return null

  const owner = Array.isArray(popRow.owner) ? popRow.owner[0] : popRow.owner
  const ownerFirst = String(owner?.first_name ?? "").trim()
  const ownerLast = String(owner?.last_name ?? "").trim()
  const ownerName =
    `${ownerFirst} ${ownerLast}`.trim() || String(popRow.owner_user_id ?? "")

  let subscription: BackofficePopSubscriptionDetail | null = null

  if (popRow.subscription_id) {
    const { data: subRow } = await supabase
      .from("_pop_subscriptions")
      .select(
        `
        id,
        status,
        current_period_start,
        current_period_end,
        price_monthly,
        extra_modules,
        _subscription_plans:plan_id ( name, display_name ),
        _business_types:business_type_id ( name, display_name )
      `,
      )
      .eq("id", popRow.subscription_id)
      .maybeSingle()

    if (subRow) {
      const planRaw = Array.isArray(subRow._subscription_plans)
        ? subRow._subscription_plans[0]
        : subRow._subscription_plans
      const btRaw = Array.isArray(subRow._business_types)
        ? subRow._business_types[0]
        : subRow._business_types

      const { data: lastInvoice } = await supabase
        .from("_subscription_invoices")
        .select("id, amount, paid_at, payment_method, metadata")
        .eq("pop_id", popId)
        .eq("status", "paid")
        .order("paid_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      const invoiceMeta =
        lastInvoice?.metadata && typeof lastInvoice.metadata === "object"
          ? (lastInvoice.metadata as Record<string, unknown>)
          : {}

      subscription = {
        id: String(subRow.id),
        status: String(subRow.status ?? ""),
        planName: String(planRaw?.name ?? ""),
        planDisplayName: String(
          planRaw?.display_name ?? planRaw?.name ?? "",
        ),
        businessTypeName: String(btRaw?.name ?? ""),
        businessTypeDisplayName: String(
          btRaw?.display_name ?? btRaw?.name ?? "",
        ),
        extraModules: parseBackofficeExtraModules(subRow.extra_modules),
        periodStart:
          subRow.current_period_start != null
            ? String(subRow.current_period_start)
            : null,
        periodEnd:
          subRow.current_period_end != null
            ? String(subRow.current_period_end)
            : null,
        priceMonthly: Number(subRow.price_monthly ?? 0),
        lastPayment: lastInvoice?.paid_at
          ? {
              id: String(lastInvoice.id),
              amount: Number(lastInvoice.amount ?? 0),
              paidAt: String(lastInvoice.paid_at),
              paymentMethod: String(lastInvoice.payment_method ?? "manual"),
              paymentReference:
                typeof invoiceMeta.payment_reference === "string"
                  ? invoiceMeta.payment_reference
                  : null,
            }
          : null,
      }
    }
  }

  const [{ data: events }, { data: invoices }] = await Promise.all([
    supabase
      .from("_subscription_events")
      .select("id, event_type, payload, created_at")
      .eq("pop_id", popId)
      .order("created_at", { ascending: false }),
    supabase
      .from("_subscription_invoices")
      .select(
        `
        id,
        amount,
        status,
        payment_method,
        paid_at,
        period_start,
        period_end,
        metadata,
        created_at,
        _subscription_plans:plan_id ( display_name )
      `,
      )
      .eq("pop_id", popId)
      .order("created_at", { ascending: false }),
  ])

  const paidInvoiceIds = new Set(
    (events ?? [])
      .filter((row) => row.event_type === "payment_received")
      .map((row) => {
        const payload =
          row.payload && typeof row.payload === "object"
            ? (row.payload as Record<string, unknown>)
            : {}
        return typeof payload.invoice_id === "string" ? payload.invoice_id : null
      })
      .filter((id): id is string => Boolean(id)),
  )

  const mappedInvoices = (invoices ?? []).map((row) => {
    const planRaw = Array.isArray(row._subscription_plans)
      ? row._subscription_plans[0]
      : row._subscription_plans
    return {
      id: String(row.id),
      amount: Number(row.amount ?? 0),
      status: String(row.status ?? ""),
      paymentMethod: String(row.payment_method ?? ""),
      paidAt: row.paid_at != null ? String(row.paid_at) : null,
      periodStart: String(row.period_start ?? ""),
      periodEnd: String(row.period_end ?? ""),
      metadata:
        row.metadata && typeof row.metadata === "object"
          ? (row.metadata as Record<string, unknown>)
          : {},
      createdAt: String(row.created_at ?? ""),
      planDisplayName: String(planRaw?.display_name ?? "Plan"),
    }
  })

  const timeline = buildBackofficeTimeline(
    (events ?? []).map((row) => ({
      id: String(row.id),
      eventType: String(row.event_type ?? ""),
      payload:
        row.payload && typeof row.payload === "object"
          ? (row.payload as Record<string, unknown>)
          : {},
      createdAt: String(row.created_at ?? ""),
    })),
    mappedInvoices,
  )

  // Ocultar facturas duplicadas cuando ya hay evento payment_received
  const timelineFiltered = timeline.filter(
    (entry) =>
      entry.kind !== "invoice" ||
      !paidInvoiceIds.has(entry.id.replace(/^invoice-/, "")),
  )

  return {
    id: String(popRow.id),
    name: String(popRow.name ?? ""),
    imageUrl: popRow.image_url != null ? String(popRow.image_url) : null,
    siteId: String(popRow.site_id ?? ""),
    isActive: Boolean(popRow.is_active),
    createdAt: String(popRow.created_at ?? ""),
    owner: {
      id: String(popRow.owner_user_id ?? ""),
      name: ownerName,
      imageUrl:
        owner?.image_url != null ? String(owner.image_url) : null,
    },
    subscription,
    timeline: timelineFiltered,
  }
}

export async function getBackofficeUserDetail(
  userId: string,
): Promise<BackofficeUserDetail | null> {
  const supabase = await backofficeDb()

  const [{ data: profile, error: profileError }, authList] = await Promise.all([
    supabase
      .from("users")
      .select(
        "id, first_name, last_name, image_url, country, language, created_at",
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ])

  if (profileError || !profile) return null

  const email =
    authList.data.users.find((authUser) => authUser.id === userId)?.email ?? null

  const firstName = String(profile.first_name ?? "").trim()
  const lastName = String(profile.last_name ?? "").trim()

  const [{ data: ownedPopRows }, { data: membershipRows }] = await Promise.all([
    supabase
      .from("pops")
      .select(BACKOFFICE_POP_SUMMARY_SELECT)
      .eq("owner_user_id", userId)
      .order("name"),
    supabase
      .from("user_pop_roles")
      .select(
        `
        is_active,
        pops:pop_id (${BACKOFFICE_POP_SUMMARY_SELECT}),
        roles:role_id ( name, display_name, pop_id )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ])

  const ownedPopsRaw = (ownedPopRows ?? []) as PopSummaryRow[]
  const memberPopIds: string[] = []

  for (const row of membershipRows ?? []) {
    const popRaw = Array.isArray(row.pops) ? row.pops[0] : row.pops
    if (!popRaw) continue
    if (String(popRaw.owner_user_id ?? "") === userId) continue
    memberPopIds.push(String(popRaw.id))
  }

  const allPopIds = [
    ...new Set([
      ...ownedPopsRaw.map((row) => String(row.id)),
      ...memberPopIds,
    ]),
  ]
  const lastPaymentByPopId = await fetchLastPaymentsByPopId(supabase, allPopIds)

  const ownedPops = ownedPopsRaw.map((row) =>
    mapPopSummaryRow(row, lastPaymentByPopId),
  )

  const memberPops: BackofficeUserMembershipPop[] = []
  for (const row of membershipRows ?? []) {
    const popRaw = Array.isArray(row.pops) ? row.pops[0] : row.pops
    const roleRaw = Array.isArray(row.roles) ? row.roles[0] : row.roles
    if (!popRaw || !roleRaw) continue
    if (String(popRaw.owner_user_id ?? "") === userId) continue
    if (String(roleRaw.pop_id ?? "") !== String(popRaw.id)) continue

    memberPops.push({
      ...mapPopSummaryRow(popRaw as PopSummaryRow, lastPaymentByPopId),
      roleName: String(roleRaw.name ?? ""),
      roleDisplayName: String(roleRaw.display_name ?? roleRaw.name ?? ""),
      membershipActive: Boolean(row.is_active),
    })
  }

  return {
    id: String(profile.id),
    email,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim() || firstName || "Usuario",
    imageUrl: profile.image_url != null ? String(profile.image_url) : null,
    country: profile.country != null ? String(profile.country) : null,
    language: profile.language != null ? String(profile.language) : null,
    createdAt: String(profile.created_at ?? ""),
    ownedPops,
    memberPops,
  }
}

export async function listBackofficeUsers(): Promise<BackofficeUserRow[]> {
  const supabase = await backofficeDb()
  const [{ data: profiles, error: profilesError }, authList] =
    await Promise.all([
      supabase
        .from("users")
        .select(
          "id, first_name, last_name, image_url, country, language, created_at",
        )
        .order("created_at", { ascending: false }),
      supabase.auth.admin.listUsers({ perPage: 1000 }),
    ])

  if (profilesError || !profiles) return []

  const emailById = new Map<string, string | null>()
  for (const authUser of authList.data.users) {
    emailById.set(authUser.id, authUser.email ?? null)
  }

  return profiles.map((row) => {
    const firstName = String(row.first_name ?? "").trim()
    const lastName = String(row.last_name ?? "").trim()
    return {
      id: String(row.id),
      email: emailById.get(String(row.id)) ?? null,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim() || firstName || "Usuario",
      imageUrl: row.image_url != null ? String(row.image_url) : null,
      country: row.country != null ? String(row.country) : null,
      language: row.language != null ? String(row.language) : null,
      createdAt: String(row.created_at ?? ""),
    }
  })
}

export type BackofficeDashboardStats = {
  usersCount: number
  popsCount: number
  organizationsCount: number
  activeSubscriptionsCount: number
  trialSubscriptionsCount: number
}

export async function getBackofficeDashboardStats(): Promise<BackofficeDashboardStats> {
  const supabase = await backofficeDb()

  const [
    { count: usersCount },
    { count: popsCount },
    { count: organizationsCount },
    { count: activeSubscriptionsCount },
    { count: trialSubscriptionsCount },
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("pops").select("id", { count: "exact", head: true }),
    supabase.from("organizations").select("id", { count: "exact", head: true }),
    supabase
      .from("_pop_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("_pop_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "trial"),
  ])

  return {
    usersCount: usersCount ?? 0,
    popsCount: popsCount ?? 0,
    organizationsCount: organizationsCount ?? 0,
    activeSubscriptionsCount: activeSubscriptionsCount ?? 0,
    trialSubscriptionsCount: trialSubscriptionsCount ?? 0,
  }
}

export type BackofficeOrganizationRow = {
  id: string
  name: string
  popsCount: number
  membersCount: number
  trialConsumed: boolean
  trialConsumedAt: string | null
  mpPayerId: string | null
  createdAt: string
}

export async function listBackofficeOrganizations(): Promise<
  BackofficeOrganizationRow[]
> {
  const supabase = await backofficeDb()
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, trial_consumed_at, mp_payer_id, created_at")
    .order("created_at", { ascending: false })

  if (error || !data) return []

  const orgIds = data.map((row) => String(row.id))
  if (orgIds.length === 0) return []

  const [{ data: pops }, { data: members }] = await Promise.all([
    supabase.from("pops").select("organization_id").in("organization_id", orgIds),
    supabase
      .from("organization_members")
      .select("organization_id")
      .in("organization_id", orgIds),
  ])

  const popsByOrg = new Map<string, number>()
  for (const row of pops ?? []) {
    const orgId = String(row.organization_id ?? "")
    popsByOrg.set(orgId, (popsByOrg.get(orgId) ?? 0) + 1)
  }

  const membersByOrg = new Map<string, number>()
  for (const row of members ?? []) {
    const orgId = String(row.organization_id ?? "")
    membersByOrg.set(orgId, (membersByOrg.get(orgId) ?? 0) + 1)
  }

  return data.map((row) => ({
    id: String(row.id),
    name: String(row.name ?? "Organización"),
    popsCount: popsByOrg.get(String(row.id)) ?? 0,
    membersCount: membersByOrg.get(String(row.id)) ?? 0,
    trialConsumed: row.trial_consumed_at != null,
    trialConsumedAt:
      row.trial_consumed_at != null ? String(row.trial_consumed_at) : null,
    mpPayerId: row.mp_payer_id != null ? String(row.mp_payer_id) : null,
    createdAt: String(row.created_at ?? ""),
  }))
}
