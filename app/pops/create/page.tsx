"use client"

import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { updateCardToken } from "@mercadopago/sdk-react"
import {
  finalizePopCreation,
  getActiveBusinessTypes,
  getPopCreateBillingSetup,
  getPopCreatePlanOptions,
  type BusinessTypeOption,
  type PopCreatePlanOption,
} from "@/app/pops/create/actions"
import {
  AuthEyebrow,
  AuthLead,
  AuthMarketingShell,
  AuthMutedLink,
  AuthTitle,
} from "@/components/auth/AuthMarketingShell"
import type { MercadoPagoCardCaptureHandle } from "@/components/platformBilling/MercadoPagoCardCapture"
import { RootsBanner } from "@/components/rootsy-banner"
import { RootsPrimaryButton } from "@/components/rootsy-button"
import {
  RootsFormFieldMessage,
  RootsFormTextField,
  RootsFormToneProvider,
} from "@/components/rootsy-form"
import { FORM_UI_LABEL_STYLE_DARK } from "@/app/library/ui-components/formsUiHardcodedSpec"
import { Spinner } from "@/components/ui/spinner"
import {
  LANDING_TRIAL_DAYS,
  formatLandingFirstChargeDate,
  formatLandingPlanMoney,
} from "@/lib/landingSubscriptionPlans"
import { popMenuHref } from "@/lib/popRoutes"
import {
  ROOTS_BUSINESS_TYPE_ORDER,
  ROOTS_BUSINESS_TYPE_SIGNUP_COPY,
  isRootsPublicBusinessTypeKey,
  type RootsPublicBusinessTypeKey,
} from "@/lib/rootsySubscriptionCatalog"
import {
  clearSignupIntent,
  isSelfServePlan,
  persistSignupIntent,
  resolveSignupIntent,
  type SignupIntent,
} from "@/lib/signupIntent"
import { POP_CREATE_COPY } from "@/lib/auth/rootsyAuthUiCopy"
import { cn } from "@/lib/utils"

const MercadoPagoCardCapture = dynamic(
  () =>
    import("@/components/platformBilling/MercadoPagoCardCapture").then(
      (mod) => mod.MercadoPagoCardCapture,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 py-6 text-sm text-[var(--rootsy-sombra-300)]">
        <Spinner className="size-4" />
        Cargando Mercado Pago…
      </div>
    ),
  },
)

const choiceCardClass = (selected: boolean) =>
  cn(
    "flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-colors",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--rootsy-savia-400)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--color-elevated)]",
    selected
      ? "border-[color-mix(in_srgb,var(--rootsy-savia-400)_50%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-savia-400)_10%,transparent)]"
      : "border-[var(--color-border)] bg-transparent hover:border-[color-mix(in_srgb,var(--rootsy-savia-400)_28%,transparent)]",
  )

function rubroCopy(name: string, fallbackTitle: string, fallbackHint: string | null) {
  if (!isRootsPublicBusinessTypeKey(name)) {
    return { title: fallbackTitle, hint: fallbackHint }
  }
  return ROOTS_BUSINESS_TYPE_SIGNUP_COPY[name]
}

function sortBusinessTypes(types: BusinessTypeOption[]) {
  return [...types].sort((a, b) => {
    const indexA = ROOTS_BUSINESS_TYPE_ORDER.indexOf(
      a.name as RootsPublicBusinessTypeKey,
    )
    const indexB = ROOTS_BUSINESS_TYPE_ORDER.indexOf(
      b.name as RootsPublicBusinessTypeKey,
    )
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB)
  })
}

function CreatePopPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cardCaptureRef = useRef<MercadoPagoCardCaptureHandle>(null)
  const signupIntent = resolveSignupIntent(searchParams)
  const preferredPlanNameRef = useRef<string | null>(signupIntent.plan)

  const [popName, setPopName] = useState("")
  const [businessTypeId, setBusinessTypeId] = useState("")
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeOption[]>([])
  const [plans, setPlans] = useState<PopCreatePlanOption[]>([])
  const [planId, setPlanId] = useState("")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    signupIntent.cycle,
  )
  const [trialAvailable, setTrialAvailable] = useState(true)
  const [mercadoPagoPublicKey, setMercadoPagoPublicKey] = useState<string | null>(
    null,
  )
  const [mercadoPagoConfigured, setMercadoPagoConfigured] = useState(false)

  const [loadingTypes, setLoadingTypes] = useState(true)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({
    popName: "",
    businessType: "",
    plan: "",
  })

  const firstChargeLabel = useMemo(() => formatLandingFirstChargeDate(), [])

  const persistCurrentIntent = useCallback(
    (patch?: Partial<SignupIntent>) => {
      const typeName = businessTypes.find((row) => row.id === businessTypeId)?.name
      const planName = plans.find((row) => row.id === planId)?.name
      persistSignupIntent({
        plan:
          planName && isSelfServePlan(planName)
            ? planName
            : preferredPlanNameRef.current &&
                isSelfServePlan(preferredPlanNameRef.current)
              ? preferredPlanNameRef.current
              : signupIntent.plan,
        cycle: billingCycle,
        type:
          typeName && isRootsPublicBusinessTypeKey(typeName)
            ? typeName
            : signupIntent.type,
        ...patch,
      })
    },
    [billingCycle, businessTypeId, businessTypes, planId, plans, signupIntent.type],
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const intent = resolveSignupIntent(searchParams)
        persistSignupIntent(intent)
        preferredPlanNameRef.current = intent.plan
        setBillingCycle(intent.cycle)
        const [types, billingSetup] = await Promise.all([
          getActiveBusinessTypes(),
          getPopCreateBillingSetup(),
        ])
        if (cancelled) return
        setBusinessTypes(sortBusinessTypes(types))
        setTrialAvailable(billingSetup.trialAvailable)
        setMercadoPagoPublicKey(billingSetup.mercadoPagoPublicKey)
        setMercadoPagoConfigured(billingSetup.mercadoPagoConfigured)
        const preferredType = intent.type
          ? types.find((row) => row.name === intent.type)
          : undefined
        if (preferredType) {
          setBusinessTypeId(preferredType.id)
        } else if (types.length === 1) {
          setBusinessTypeId(types[0].id)
        }
      } finally {
        if (!cancelled) setLoadingTypes(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [searchParams])

  useEffect(() => {
    if (!businessTypeId) {
      setPlans([])
      setPlanId("")
      return
    }

    let cancelled = false
    setLoadingPlans(true)
    ;(async () => {
      try {
        const nextPlans = await getPopCreatePlanOptions(businessTypeId)
        if (cancelled) return
        setPlans(nextPlans)
        setPlanId((current) => {
          const preferredName = preferredPlanNameRef.current
          const preferred = preferredName
            ? nextPlans.find((plan) => plan.name === preferredName)
            : undefined
          if (preferred) return preferred.id
          if (current && nextPlans.some((plan) => plan.id === current)) {
            return current
          }
          return nextPlans[0]?.id ?? ""
        })
      } finally {
        if (!cancelled) setLoadingPlans(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [businessTypeId])

  const selectedPlan = plans.find((plan) => plan.id === planId) ?? null
  const selectedPrice =
    billingCycle === "yearly"
      ? selectedPlan?.priceYearly ?? 0
      : selectedPlan?.priceMonthly ?? 0
  const periodLabel = billingCycle === "yearly" ? "año" : "mes"

  const validate = useCallback(() => {
    const errors = { popName: "", businessType: "", plan: "" }
    const name = popName.trim()
    if (!name) {
      errors.popName = POP_CREATE_COPY.errors.popNameRequired
    } else if (name.length < 3) {
      errors.popName = POP_CREATE_COPY.errors.popNameMin
    } else if (name.length > 100) {
      errors.popName = POP_CREATE_COPY.errors.popNameMax
    }
    if (businessTypes.length > 0 && !businessTypeId) {
      errors.businessType = POP_CREATE_COPY.errors.businessTypeRequired
    }
    if (plans.length > 0 && !planId) {
      errors.plan = POP_CREATE_COPY.errors.planRequired
    }
    setFieldErrors(errors)
    return !errors.popName && !errors.businessType && !errors.plan
  }, [popName, businessTypeId, businessTypes.length, plans.length, planId])

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError("")
    if (!validate()) return
    if (!mercadoPagoConfigured || !mercadoPagoPublicKey) {
      setError(POP_CREATE_COPY.errors.mercadoPagoNotConfigured)
      return
    }

    setLoading(true)
    try {
      const cardToken = await cardCaptureRef.current?.tokenize()
      if (!cardToken?.token) {
        setError(POP_CREATE_COPY.errors.cardIncomplete)
        setLoading(false)
        return
      }

      let paymentCardToken = cardToken.token
      if (!trialAvailable) {
        const refreshed = await updateCardToken(cardToken.token)
        if (refreshed?.id) {
          paymentCardToken = refreshed.id
        }
      }

      const result = await finalizePopCreation({
        popName: popName.trim(),
        businessTypeId: businessTypeId || undefined,
        planId,
        billingCycle,
        cardToken: cardToken.token,
        paymentCardToken,
      })

      if (!result.success) {
        setError(result.details ?? result.error)
        setLoading(false)
        return
      }

      clearSignupIntent()
      router.push(popMenuHref(result.pop.siteId, result.pop.id))
      router.refresh()
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : POP_CREATE_COPY.errors.unexpected
      setError(message)
      setLoading(false)
    }
  }

  const submitLabel = trialAvailable
    ? POP_CREATE_COPY.submitTrial(LANDING_TRIAL_DAYS)
    : selectedPrice > 0
      ? POP_CREATE_COPY.submitActivate(formatLandingPlanMoney(selectedPrice))
      : POP_CREATE_COPY.submitCreate

  return (
    <AuthMarketingShell
      cardWidthClassName="max-w-lg"
      contentAlign="start"
      asideEyebrow={
        trialAvailable
          ? POP_CREATE_COPY.asideEyebrowTrial(LANDING_TRIAL_DAYS)
          : POP_CREATE_COPY.asideEyebrowPaid
      }
      asideTitle={POP_CREATE_COPY.asideTitle}
      asideLead={
        trialAvailable
          ? POP_CREATE_COPY.asideLeadTrial
          : POP_CREATE_COPY.asideLeadPaid
      }
    >
      <header className="space-y-2">
        <AuthEyebrow>
          {trialAvailable ? POP_CREATE_COPY.eyebrowTrial : POP_CREATE_COPY.eyebrowPaid}
        </AuthEyebrow>
        <AuthTitle>{POP_CREATE_COPY.title}</AuthTitle>
        <AuthLead>{POP_CREATE_COPY.lead}</AuthLead>
        <p className="pt-1">
          <AuthMutedLink href="/home">{POP_CREATE_COPY.backHome}</AuthMutedLink>
        </p>
      </header>

      {error ? (
        <div className="mt-5">
          <RootsBanner
            intent="danger"
            tone="dark"
            density="compact"
            message={error}
          />
        </div>
      ) : null}

      {loadingTypes ? (
        <div
          className="mt-10 flex flex-col items-center gap-3 py-12"
          role="status"
          aria-live="polite"
        >
          <Spinner className="size-8 text-[var(--rootsy-savia-400)]" />
          <span className="text-sm text-[var(--rootsy-sombra-300)]">
            {POP_CREATE_COPY.loadingConfig}
          </span>
        </div>
      ) : (
        <RootsFormToneProvider tone="dark">
          <form className="mt-7 space-y-6" onSubmit={handleSubmit} noValidate>
            <RootsFormTextField
              label="Nombre del negocio"
              id="popName"
              name="popName"
              value={popName}
              autoComplete="organization"
              placeholder="Ej: Mi tienda, Bar Central"
              hint={POP_CREATE_COPY.popNameHint}
              error={fieldErrors.popName || undefined}
              invalid={Boolean(fieldErrors.popName)}
              disabled={loading}
              onChange={(event) => {
                setPopName(event.target.value)
                if (fieldErrors.popName) {
                  setFieldErrors((prev) => ({ ...prev, popName: "" }))
                }
              }}
            />

            {businessTypes.length > 0 ? (
              <fieldset className="space-y-3">
                <legend style={FORM_UI_LABEL_STYLE_DARK}>
                  Cómo cobrás la mayor parte del día
                </legend>
                <div className="grid gap-2">
                  {businessTypes.map((bt) => {
                    const selected = businessTypeId === bt.id
                    const copy = rubroCopy(bt.name, bt.displayName, bt.description)
                    return (
                      <label key={bt.id} className={choiceCardClass(selected)}>
                        <input
                          type="radio"
                          name="businessType"
                          value={bt.id}
                          checked={selected}
                          onChange={() => {
                            setBusinessTypeId(bt.id)
                            persistCurrentIntent({
                              type: isRootsPublicBusinessTypeKey(bt.name)
                                ? bt.name
                                : signupIntent.type,
                            })
                            if (fieldErrors.businessType) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                businessType: "",
                              }))
                            }
                          }}
                          className="mt-1 shrink-0 accent-[var(--rootsy-savia-400)]"
                          disabled={loading}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-white">
                            {copy.title}
                          </span>
                          {copy.hint ? (
                            <span className="mt-0.5 block text-xs text-[var(--rootsy-sombra-300)]">
                              {copy.hint}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    )
                  })}
                </div>
                {fieldErrors.businessType ? (
                  <RootsFormFieldMessage variant="error">
                    {fieldErrors.businessType}
                  </RootsFormFieldMessage>
                ) : null}
              </fieldset>
            ) : null}

            {businessTypeId ? (
              <fieldset className="space-y-3">
                <legend style={FORM_UI_LABEL_STYLE_DARK}>
                  {trialAvailable ? "Plan después de la prueba" : "Plan de suscripción"}
                </legend>

                {selectedPlan ? (
                  <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_40%,transparent)] px-4 py-3">
                    <p className="text-sm font-semibold text-white">
                      {selectedPlan.displayName} ·{" "}
                      {billingCycle === "yearly" ? "anual" : "mensual"}
                    </p>
                    {trialAvailable ? (
                      <p className="mt-1 text-sm leading-relaxed text-[var(--rootsy-sombra-300)]">
                        {POP_CREATE_COPY.trialChargeNote(
                          firstChargeLabel,
                          formatLandingPlanMoney(selectedPrice),
                          periodLabel,
                        )}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm leading-relaxed text-[var(--rootsy-sombra-300)]">
                        {POP_CREATE_COPY.paidChargeNote(
                          formatLandingPlanMoney(selectedPrice),
                          periodLabel,
                        )}
                      </p>
                    )}
                  </div>
                ) : null}

                {loadingPlans ? (
                  <div className="flex items-center gap-2 text-sm text-[var(--rootsy-sombra-300)]">
                    <Spinner className="size-4" />
                    {POP_CREATE_COPY.loadingPlans}
                  </div>
                ) : plans.length === 0 ? (
                  <p className="text-sm text-[var(--rootsy-sombra-300)]">
                    {POP_CREATE_COPY.noPlans}
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <p style={FORM_UI_LABEL_STYLE_DARK}>Ciclo de facturación</p>
                      <div
                        className="grid grid-cols-2 gap-1 rounded-xl border border-[var(--color-border)] p-1"
                        role="group"
                        aria-label="Ciclo de facturación"
                      >
                        {(
                          [
                            ["monthly", "Mensual"],
                            ["yearly", "Anual"],
                          ] as const
                        ).map(([value, label]) => {
                          const selected = billingCycle === value
                          return (
                            <button
                              key={value}
                              type="button"
                              disabled={loading}
                              aria-pressed={selected}
                              className={cn(
                                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rootsy-savia-400)]",
                                selected
                                  ? "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_16%,transparent)] text-white"
                                  : "text-[var(--rootsy-sombra-300)] hover:text-white",
                              )}
                              onClick={() => {
                                setBillingCycle(value)
                                persistCurrentIntent({ cycle: value })
                              }}
                            >
                              {label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      {plans.map((plan) => {
                        const selected = planId === plan.id
                        const price =
                          billingCycle === "yearly"
                            ? plan.priceYearly
                            : plan.priceMonthly
                        return (
                          <label
                            key={plan.id}
                            className={choiceCardClass(selected)}
                          >
                            <span className="flex min-w-0 flex-1 gap-3">
                              <input
                                type="radio"
                                name="plan"
                                value={plan.id}
                                checked={selected}
                                onChange={() => {
                                  setPlanId(plan.id)
                                  preferredPlanNameRef.current = plan.name
                                  persistCurrentIntent({
                                    plan: isSelfServePlan(plan.name)
                                      ? plan.name
                                      : signupIntent.plan,
                                  })
                                  if (fieldErrors.plan) {
                                    setFieldErrors((prev) => ({
                                      ...prev,
                                      plan: "",
                                    }))
                                  }
                                }}
                                className="mt-1 shrink-0 accent-[var(--rootsy-savia-400)]"
                                disabled={loading}
                              />
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-white">
                                  {plan.displayName}
                                </span>
                                {plan.description ? (
                                  <span className="mt-0.5 block text-xs text-[var(--rootsy-sombra-300)]">
                                    {plan.description}
                                  </span>
                                ) : null}
                              </span>
                            </span>
                            <span className="shrink-0 text-right text-sm font-semibold text-white">
                              {formatLandingPlanMoney(price)}
                              <span className="block text-xs font-normal text-[var(--rootsy-sombra-300)]">
                                /{periodLabel}
                              </span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </>
                )}

                {fieldErrors.plan ? (
                  <RootsFormFieldMessage variant="error">
                    {fieldErrors.plan}
                  </RootsFormFieldMessage>
                ) : null}
              </fieldset>
            ) : null}

            {planId && mercadoPagoPublicKey ? (
              <fieldset className="space-y-3">
                <legend style={FORM_UI_LABEL_STYLE_DARK}>Tarjeta</legend>
                <p className="text-xs leading-relaxed text-[var(--rootsy-sombra-300)]">
                  {trialAvailable
                    ? POP_CREATE_COPY.cardHintTrial
                    : POP_CREATE_COPY.cardHintPaid}
                </p>
                <MercadoPagoCardCapture
                  ref={cardCaptureRef}
                  publicKey={mercadoPagoPublicKey}
                  disabled={loading}
                />
              </fieldset>
            ) : null}

            <RootsPrimaryButton
              type="submit"
              size="large"
              loading={loading}
              loadingLabel={POP_CREATE_COPY.submitLoading}
              disabled={!mercadoPagoConfigured || !planId || loadingPlans}
              className="w-full"
            >
              {submitLabel}
            </RootsPrimaryButton>
          </form>
        </RootsFormToneProvider>
      )}
    </AuthMarketingShell>
  )
}

export default CreatePopPage
