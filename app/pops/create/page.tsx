"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { updateCardToken } from "@mercadopago/sdk-react"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  finalizePopCreation,
  getActiveBusinessTypes,
  getPopCreateBillingSetup,
  getPopCreatePlanOptions,
  type BusinessTypeOption,
  type PopCreatePlanOption,
} from "@/app/pops/create/actions"
import type { MercadoPagoCardCaptureHandle } from "@/components/platformBilling/MercadoPagoCardCapture"
import { popMenuHref } from "@/lib/popRoutes"
import {
  clearSignupIntent,
  persistSignupIntent,
  resolveSignupIntent,
} from "@/lib/signupIntent"
import { cn } from "@/lib/utils"

const MercadoPagoCardCapture = dynamic(
  () =>
    import("@/components/platformBilling/MercadoPagoCardCapture").then(
      (mod) => mod.MercadoPagoCardCapture,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        Cargando Mercado Pago…
      </div>
    ),
  },
)

function formatArs(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value)
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
        setBusinessTypes(types)
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

  const validate = useCallback(() => {
    const errors = { popName: "", businessType: "", plan: "" }
    const name = popName.trim()
    if (!name) {
      errors.popName = "El nombre del punto de venta es requerido"
    } else if (name.length < 3) {
      errors.popName = "Usá al menos 3 caracteres"
    } else if (name.length > 100) {
      errors.popName = "Máximo 100 caracteres"
    }
    if (businessTypes.length > 0 && !businessTypeId) {
      errors.businessType = "Elegí el tipo de negocio"
    }
    if (plans.length > 0 && !planId) {
      errors.plan = "Elegí un plan"
    }
    setFieldErrors(errors)
    return !errors.popName && !errors.businessType && !errors.plan
  }, [popName, businessTypeId, businessTypes.length, plans.length, planId])

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError("")
    if (!validate()) return
    if (!mercadoPagoConfigured || !mercadoPagoPublicKey) {
      setError("Mercado Pago no está configurado en este entorno.")
      return
    }

    setLoading(true)
    try {
      const cardToken = await cardCaptureRef.current?.tokenize()
      if (!cardToken?.token) {
        setError("Completá los datos de la tarjeta")
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
          : "Error inesperado al crear el punto de venta"
      setError(message)
      setLoading(false)
    }
  }

  const submitLabel = trialAvailable
    ? "Crear y empezar prueba de 7 días"
    : selectedPrice > 0
      ? `Crear y pagar ${formatArs(selectedPrice)}`
      : "Crear punto de venta"

  return (
    <div className="h-dvh overflow-hidden bg-background text-foreground">
      <main className="grid h-full min-h-0 w-full grid-cols-1 lg:grid-cols-2">
        <section className="relative hidden h-full overflow-hidden lg:block">
          <Image
            src="/login-mascota.png"
            alt="Rootsy"
            fill
            priority
            className="object-cover"
            sizes="50vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/40 via-black/20 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end p-10 xl:p-14">
            <p className="inline-flex w-fit items-center rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
              {trialAvailable ? "7 días gratis" : "Suscripción inmediata"}
            </p>
            <h2 className="mt-4 max-w-md text-3xl font-extrabold tracking-tight text-white">
              Creá tu punto de venta en minutos
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-white/75">
              {trialAvailable
                ? "Elegí tu plan, guardá una tarjeta y empezá a probar ventas, stock y administración sin cargo durante 7 días."
                : "Este POP se activa con el plan elegido y el primer cobro al crearlo."}
            </p>
          </div>
        </section>

        <section className="relative h-full min-h-0 overflow-y-auto bg-[radial-gradient(ellipse_90%_70%_at_20%_50%,rgba(16,185,129,0.16),transparent_62%)]">
          <div className="mx-auto flex w-full max-w-lg flex-col px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="relative mt-4 w-full rounded-4xl border border-white/12 bg-white/[0.035] p-7 shadow-[0_30px_90px_-42px_rgba(10,18,14,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-9">
            <Link
              href="/home"
              className="absolute -top-6 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/16 bg-[#0b1110]/90 px-4 py-2 text-sm font-semibold tracking-wide text-white shadow-[0_14px_30px_-18px_rgba(0,0,0,0.8)] ring-1 ring-emerald-400/25 transition-all hover:scale-[1.02] hover:border-emerald-300/45"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-400/16 text-emerald-200">
                <Leaf className="size-4" aria-hidden />
              </span>
              Rootsy
            </Link>

            <div className="space-y-1.5">
              <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                {trialAvailable ? "Prueba gratis" : "Plan pago"}
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-[2.1rem]">
                Nuevo punto de venta
              </h1>
              <p className="text-sm text-muted-foreground">
                <Link href="/home" className="font-medium text-meadow hover:underline">
                  Volver al inicio
                </Link>
                {" · "}
                {trialAvailable
                  ? "Tarjeta requerida · cobro al día 7"
                  : "Pago upfront al crear"}
              </p>
            </div>

            {loadingTypes ? (
              <div
                className="mt-10 flex flex-col items-center gap-3 py-12"
                role="status"
                aria-live="polite"
              >
                <Spinner className="size-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Cargando configuración…
                </span>
              </div>
            ) : (
              <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="popName">Nombre del punto de venta</Label>
                  <Input
                    id="popName"
                    name="popName"
                    value={popName}
                    onChange={(e) => {
                      setPopName(e.target.value)
                      if (fieldErrors.popName) {
                        setFieldErrors((prev) => ({ ...prev, popName: "" }))
                      }
                    }}
                    placeholder="Ej: Mi tienda, Bar Central"
                    autoComplete="organization"
                    aria-invalid={!!fieldErrors.popName}
                    disabled={loading}
                  />
                  {fieldErrors.popName ? (
                    <p className="text-sm text-destructive" role="alert">
                      {fieldErrors.popName}
                    </p>
                  ) : null}
                </div>

                {businessTypes.length > 0 ? (
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-medium">Tipo de negocio</legend>
                    <div className="grid gap-2">
                      {businessTypes.map((bt) => {
                        const selected = businessTypeId === bt.id
                        return (
                          <label
                            key={bt.id}
                            className={cn(
                              "flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-colors",
                              selected
                                ? "border-emerald-500/50 bg-emerald-500/8 ring-1 ring-emerald-500/25"
                                : "border-border/80 bg-background/40 hover:border-emerald-500/30",
                            )}
                          >
                            <input
                              type="radio"
                              name="businessType"
                              value={bt.id}
                              checked={selected}
                              onChange={() => {
                                setBusinessTypeId(bt.id)
                                if (fieldErrors.businessType) {
                                  setFieldErrors((prev) => ({
                                    ...prev,
                                    businessType: "",
                                  }))
                                }
                              }}
                              className="mt-1 shrink-0 accent-emerald-600"
                              disabled={loading}
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold">
                                {bt.displayName}
                              </span>
                              {bt.description ? (
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                  {bt.description}
                                </span>
                              ) : null}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                    {fieldErrors.businessType ? (
                      <p className="text-sm text-destructive" role="alert">
                        {fieldErrors.businessType}
                      </p>
                    ) : null}
                  </fieldset>
                ) : null}

                {businessTypeId ? (
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-medium">
                      {trialAvailable
                        ? "Plan post-prueba"
                        : "Plan de suscripción"}
                    </legend>

                    {loadingPlans ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Spinner className="size-4" />
                        Cargando planes…
                      </div>
                    ) : plans.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No hay planes disponibles para este tipo de negocio.
                      </p>
                    ) : (
                      <>
                        <div className="inline-flex rounded-xl border border-border/80 bg-background/40 p-1">
                          <button
                            type="button"
                            className={cn(
                              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                              billingCycle === "monthly"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : "text-muted-foreground",
                            )}
                            onClick={() => setBillingCycle("monthly")}
                            disabled={loading}
                          >
                            Mensual
                          </button>
                          <button
                            type="button"
                            className={cn(
                              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                              billingCycle === "yearly"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : "text-muted-foreground",
                            )}
                            onClick={() => setBillingCycle("yearly")}
                            disabled={loading}
                          >
                            Anual
                          </button>
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
                                className={cn(
                                  "flex cursor-pointer items-start justify-between gap-3 rounded-xl border px-4 py-3 transition-colors",
                                  selected
                                    ? "border-emerald-500/50 bg-emerald-500/8 ring-1 ring-emerald-500/25"
                                    : "border-border/80 bg-background/40 hover:border-emerald-500/30",
                                )}
                              >
                                <span className="flex min-w-0 gap-3">
                                  <input
                                    type="radio"
                                    name="plan"
                                    value={plan.id}
                                    checked={selected}
                                    onChange={() => {
                                      setPlanId(plan.id)
                                      preferredPlanNameRef.current = plan.name
                                      if (fieldErrors.plan) {
                                        setFieldErrors((prev) => ({
                                          ...prev,
                                          plan: "",
                                        }))
                                      }
                                    }}
                                    className="mt-1 shrink-0 accent-emerald-600"
                                    disabled={loading}
                                  />
                                  <span className="min-w-0">
                                    <span className="block text-sm font-semibold">
                                      {plan.displayName}
                                    </span>
                                    {plan.description ? (
                                      <span className="mt-0.5 block text-xs text-muted-foreground">
                                        {plan.description}
                                      </span>
                                    ) : null}
                                  </span>
                                </span>
                                <span className="shrink-0 text-sm font-semibold">
                                  {formatArs(price)}
                                  <span className="block text-xs font-normal text-muted-foreground">
                                    /{billingCycle === "yearly" ? "año" : "mes"}
                                  </span>
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </>
                    )}

                    {fieldErrors.plan ? (
                      <p className="text-sm text-destructive" role="alert">
                        {fieldErrors.plan}
                      </p>
                    ) : null}
                  </fieldset>
                ) : null}

                {planId && mercadoPagoPublicKey ? (
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-medium">Tarjeta</legend>
                    <p className="text-xs text-muted-foreground">
                      {trialAvailable
                        ? "La tarjeta queda guardada para el cobro automático al finalizar la prueba."
                        : "Se cobrará el primer período al confirmar la creación."}
                    </p>
                    <MercadoPagoCardCapture
                      ref={cardCaptureRef}
                      publicKey={mercadoPagoPublicKey}
                      disabled={loading}
                    />
                  </fieldset>
                ) : null}

                {error ? (
                  <p
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-base font-bold text-white hover:from-emerald-400 hover:to-teal-500"
                  disabled={
                    loading ||
                    !mercadoPagoConfigured ||
                    !planId ||
                    loadingPlans
                  }
                >
                  {loading ? (
                    <>
                      <Spinner className="mr-2 size-4 text-white" />
                      Procesando…
                    </>
                  ) : (
                    submitLabel
                  )}
                </Button>
              </form>
            )}
          </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default CreatePopPage
