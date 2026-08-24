import {
  ROOTS_BUSINESS_TYPE_ORDER,
  ROOTS_PAID_PLAN_ORDER,
  type RootsPublicBusinessTypeKey,
  type RootsPublicPaidPlanKey,
} from "@/lib/rootsySubscriptionCatalog"

export const SIGNUP_INTENT_STORAGE_KEY = "rootsy_signup_intent"

export const POP_CREATE_PATH = "/pops/create"
export const REGISTER_PATH = "/register"
export const LOGIN_PATH = "/login"

export type SignupBillingCycle = "monthly" | "yearly"

export type SignupIntent = {
  plan: RootsPublicPaidPlanKey | null
  cycle: SignupBillingCycle
  type: RootsPublicBusinessTypeKey | null
}

const PLAN_LABELS: Record<RootsPublicPaidPlanKey, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
}

const TYPE_LABELS: Record<RootsPublicBusinessTypeKey, string> = {
  comercio: "Comercio",
  restaurant: "Restaurant",
  fabrica: "Fábrica",
}

function isPaidPlanKey(value: string | null): value is RootsPublicPaidPlanKey {
  return (
    value != null &&
    ROOTS_PAID_PLAN_ORDER.includes(value as RootsPublicPaidPlanKey)
  )
}

function isBusinessTypeKey(
  value: string | null,
): value is RootsPublicBusinessTypeKey {
  return (
    value != null &&
    ROOTS_BUSINESS_TYPE_ORDER.includes(value as RootsPublicBusinessTypeKey)
  )
}

export function isSelfServePlan(
  plan: string | null,
): plan is "starter" | "professional" {
  return plan === "starter" || plan === "professional"
}

export function parseSignupIntent(
  search: Pick<URLSearchParams, "get">,
): SignupIntent {
  const planRaw = search.get("plan")
  const cycleRaw = search.get("cycle")
  const typeRaw = search.get("type")
  return {
    plan: isPaidPlanKey(planRaw) ? planRaw : null,
    cycle: cycleRaw === "yearly" ? "yearly" : "monthly",
    type: isBusinessTypeKey(typeRaw) ? typeRaw : null,
  }
}

export function hasSignupSelection(intent: SignupIntent): boolean {
  return intent.plan != null || intent.type != null
}

export function signupIntentSearchParams(intent: SignupIntent): URLSearchParams {
  const params = new URLSearchParams()
  if (intent.plan) {
    params.set("plan", intent.plan)
    params.set("cycle", intent.cycle)
  }
  if (intent.type) params.set("type", intent.type)
  return params
}

export function signupIntentHref(path: string, intent: SignupIntent): string {
  const params = signupIntentSearchParams(intent)
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

export function persistSignupIntent(intent: SignupIntent) {
  if (typeof window === "undefined") return
  if (!hasSignupSelection(intent)) return
  window.sessionStorage.setItem(
    SIGNUP_INTENT_STORAGE_KEY,
    JSON.stringify({
      plan: intent.plan,
      cycle: intent.cycle,
      type: intent.type,
    }),
  )
}

export function readPersistedSignupIntent(): SignupIntent | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(SIGNUP_INTENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SignupIntent>
    const cycle = parsed.cycle === "yearly" ? "yearly" : "monthly"
    return {
      plan: isPaidPlanKey(parsed.plan ?? null) ? parsed.plan : null,
      cycle,
      type: isBusinessTypeKey(parsed.type ?? null) ? parsed.type : null,
    }
  } catch {
    return null
  }
}

export function clearSignupIntent() {
  if (typeof window === "undefined") return
  window.sessionStorage.removeItem(SIGNUP_INTENT_STORAGE_KEY)
}

export function resolveSignupIntent(
  search: Pick<URLSearchParams, "get">,
): SignupIntent {
  const fromSearch = parseSignupIntent(search)
  if (hasSignupSelection(fromSearch)) return fromSearch
  return (
    readPersistedSignupIntent() ?? {
      plan: null,
      cycle: "monthly",
      type: null,
    }
  )
}

export function signupContinueHref(
  search: Pick<URLSearchParams, "get">,
): string {
  const intent = resolveSignupIntent(search)
  if (!hasSignupSelection(intent) || intent.plan === "enterprise") {
    return "/home"
  }
  return signupIntentHref(POP_CREATE_PATH, intent)
}

export function signupIntentSummary(intent: SignupIntent): string | null {
  if (!hasSignupSelection(intent)) return null
  const parts: string[] = []
  if (intent.plan) parts.push(PLAN_LABELS[intent.plan])
  if (intent.plan) {
    parts.push(intent.cycle === "yearly" ? "anual" : "mensual")
  }
  if (intent.type) parts.push(TYPE_LABELS[intent.type])
  return parts.join(" · ")
}
