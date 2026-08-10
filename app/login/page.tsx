"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { withGuestAuth } from "@/hoc/withGuestAuth"
import {
  getAuthCallbackUrl,
  setAuthNextPath,
} from "@/lib/authCallbackRedirect"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"

function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const callbackError = searchParams.get("error")
  const mergedBanner =
    callbackError === "callback"
      ? "No pudimos completar el inicio de sesión. Intentá de nuevo."
      : ""

  const validateForm = useCallback(() => {
    const errors = { email: "", password: "" }
    let ok = true
    const e = email.trim()
    if (!e) {
      errors.email = "El correo electrónico es requerido"
      ok = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      errors.email = "Ingresá un correo electrónico válido"
      ok = false
    }
    if (!password) {
      errors.password = "La contraseña es requerida"
      ok = false
    }
    setFieldErrors(errors)
    return ok
  }, [email, password])

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError("")
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const { data, error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signError) throw signError
      if (data.session) {
        await new Promise((r) => setTimeout(r, 100))
        router.push("/home")
        router.refresh()
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase()
      if (
        msg.includes("invalid login credentials") ||
        msg.includes("invalid credentials") ||
        msg.includes("email not confirmed")
      ) {
        setError("Correo electrónico o contraseña incorrectos")
      } else if (err instanceof Error) {
        setError(err.message || "Error al iniciar sesión")
      } else {
        setError("Error al iniciar sesión")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError("")
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      setAuthNextPath("/home")
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl(origin),
        },
      })
      if (oauthError) throw oauthError
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión con Google")
      setGoogleLoading(false)
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#080c0b] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <Image
          src="/login-mascota.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-br from-[#080c0b]/70 via-[#0a0e0d]/40 to-[#080c0b]/60" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.12), transparent 70%)'
        }}
      />

      <main className="relative z-10 flex min-h-dvh w-full items-center justify-center px-5 py-10 sm:px-8">
        <div className="relative w-full max-w-md rounded-4xl border border-white/12 bg-white/[0.035] p-7 shadow-[0_30px_90px_-42px_rgba(10,18,14,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-9">
            <Link
              href="/"
              aria-label="Rootsy — inicio"
              className="absolute -top-6 left-1/2 z-20 inline-flex -translate-x-1/2 items-center rounded-full border border-white/16 bg-[#0b1110]/90 px-4 py-2.5 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.8)] ring-1 ring-emerald-400/25 transition-all hover:scale-[1.02] hover:border-emerald-300/45 hover:ring-emerald-300/35"
            >
              <Image
                src="/rootsy-logo.svg"
                alt="Rootsy"
                width={90}
                height={29}
                priority
                className="h-7 w-auto"
              />
            </Link>
            <div className="pointer-events-none absolute -top-10 left-1/2 h-20 w-2/3 -translate-x-1/2 rounded-full bg-emerald-400/18 blur-2xl" />
            <div className="space-y-1.5">
              <h1 className="font-sans text-3xl font-bold tracking-[-0.03em] sm:text-[2.1rem]">
                Iniciar sesión
              </h1>
              <p className="text-sm text-muted-foreground">
                No tenes cuenta?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-meadow transition-colors hover:text-emerald-500"
                >
                  Registrarte
                </Link>{" "}
                es muy facil.
              </p>
            </div>

            {(mergedBanner || error) ? (
              <p
                className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {error || mergedBanner}
              </p>
            ) : null}

            <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@mail.com"
                  aria-invalid={Boolean(fieldErrors.email)}
                  className={cn(
                    "h-12 border-white/14 bg-white/8 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.9)] focus-visible:ring-emerald-400/40",
                    fieldErrors.email && "border-destructive/60",
                  )}
                />
                {fieldErrors.email ? (
                  <p className="text-xs text-destructive">{fieldErrors.email}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    aria-invalid={Boolean(fieldErrors.password)}
                    className={cn(
                      "h-12 border-white/14 bg-white/8 pr-10 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.9)] focus-visible:ring-emerald-400/40",
                      fieldErrors.password && "border-destructive/60",
                    )}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4.5" aria-hidden />
                    ) : (
                      <Eye className="size-4.5" aria-hidden />
                    )}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p className="text-xs text-destructive">{fieldErrors.password}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full bg-linear-to-r from-emerald-500 to-teal-500 text-base font-semibold text-white shadow-[0_16px_30px_-14px_rgba(16,185,129,0.65)] hover:from-emerald-400 hover:to-teal-400"
              >
                {isLoading ? "Ingresando…" : "Ingresar"}
              </Button>

              <Link
                href="/recovery-password"
                className="mx-auto block text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                No recuerdo mi contraseña
              </Link>
            </form>

            <div className="space-y-4 pt-6">
              <Separator className="bg-white/12" />
              <Button
                type="button"
                variant="outline"
                disabled={googleLoading}
                onClick={() => void handleGoogle()}
                className="h-12 w-full justify-center gap-3 border-white/20 bg-black/15 text-foreground/85 hover:bg-white/10"
              >
                <span className="inline-flex size-5 items-center justify-center rounded-full border border-border bg-white text-[11px] font-bold text-[#4285F4]">
                  G
                </span>
                {googleLoading ? "Redirigiendo…" : "Inicia sesion con tu cuenta de Google."}
              </Button>
            </div>
          </div>
      </main>
    </div>
  )
}

export default withGuestAuth(LoginPage)
