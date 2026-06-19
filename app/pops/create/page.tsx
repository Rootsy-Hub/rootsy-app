"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  getActiveBusinessTypes,
  type BusinessTypeOption,
} from "@/app/pops/create/actions"
import withAuth from "@/hoc/withAuth"
import { createPop } from "@/lib/popHelpers"
import { popMenuHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"

function CreatePopPage() {
  const router = useRouter()
  const [popName, setPopName] = useState("")
  const [businessTypeId, setBusinessTypeId] = useState("")
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeOption[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({
    popName: "",
    businessType: "",
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const types = await getActiveBusinessTypes()
        if (!cancelled) {
          setBusinessTypes(types)
          if (types.length === 1) {
            setBusinessTypeId(types[0].id)
          }
        }
      } finally {
        if (!cancelled) setLoadingTypes(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const validate = useCallback(() => {
    const errors = { popName: "", businessType: "" }
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
    setFieldErrors(errors)
    return !errors.popName && !errors.businessType
  }, [popName, businessTypeId, businessTypes.length])

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError("")
    if (!validate()) return

    setLoading(true)
    try {
      const result = await createPop({
        name: popName.trim(),
        businessTypeId: businessTypeId || undefined,
      })

      if (!result.success) {
        setError(result.details ?? result.error)
        setLoading(false)
        return
      }

      router.push(popMenuHref(result.pop.siteId, result.pop.id))
      router.refresh()
    } catch {
      setError("Error inesperado al crear el punto de venta")
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <main className="relative z-10 grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:block">
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
              7 días gratis
            </p>
            <h2 className="mt-4 max-w-md text-3xl font-extrabold tracking-tight text-white">
              Creá tu punto de venta en minutos
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-white/75">
              Sin tarjeta. Elegí cómo opera tu negocio y empezá a probar ventas,
              stock y administración desde un solo lugar.
            </p>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_90%_70%_at_20%_50%,rgba(16,185,129,0.16),transparent_62%)] px-5 py-10 sm:px-8 lg:px-10">
          <div className="relative w-full max-w-lg rounded-4xl border border-white/12 bg-white/[0.035] p-7 shadow-[0_30px_90px_-42px_rgba(10,18,14,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-9">
            <Link
              href="/"
              className="absolute -top-6 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/16 bg-[#0b1110]/90 px-4 py-2 text-sm font-semibold tracking-wide text-white shadow-[0_14px_30px_-18px_rgba(0,0,0,0.8)] ring-1 ring-emerald-400/25 transition-all hover:scale-[1.02] hover:border-emerald-300/45"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-400/16 text-emerald-200">
                <Leaf className="size-4" aria-hidden />
              </span>
              Rootsy
            </Link>

            <div className="space-y-1.5">
              <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Prueba gratuita
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-[2.1rem]">
                Nuevo punto de venta
              </h1>
              <p className="text-sm text-muted-foreground">
                <Link href="/home" className="font-medium text-meadow hover:underline">
                  Volver al inicio
                </Link>
                {" · "}
                7 días sin tarjeta
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
                  Cargando tipos de negocio…
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
                    <div className="grid gap-2 sm:grid-cols-1">
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
                  className="h-12 w-full rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-base font-bold text-white hover:from-emerald-400 hover:to-teal-500"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner className="mr-2 size-4 text-white" />
                      Creando…
                    </>
                  ) : (
                    "Crear y empezar prueba"
                  )}
                </Button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default withAuth(CreatePopPage)
