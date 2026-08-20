"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { AuthGoogleButton } from "@/components/auth/AuthGoogleButton"
import {
  AuthLead,
  AuthMarketingShell,
  AuthOrDivider,
  AuthTextLink,
  AuthTitle,
} from "@/components/auth/AuthMarketingShell"
import { AuthEmailField } from "@/components/auth/AuthEmailField"
import { AuthLegalSheet } from "@/components/auth/AuthLegalSheet"
import { AuthPasswordField } from "@/components/auth/AuthPasswordField"
import type { LegalDocId } from "@/lib/legal/rootsyLegalDocuments"
import { RootsBanner } from "@/components/rootsy-banner"
import { RootsPrimaryButton } from "@/components/rootsy-button"
import {
  RootsFormCheckbox,
  RootsFormFieldMessage,
  RootsFormToneProvider,
} from "@/components/rootsy-form"
import { withGuestAuth } from "@/hoc/withGuestAuth"
import {
  SIGNUP_PASSWORD_HINT,
  formatEmailInput,
  validateEmailField,
  validateSignupPassword,
} from "@/lib/authValidation"
import {
  authPathWithNext,
  getAuthCallbackUrlWithNext,
  resolveAuthNextFromSearch,
  setAuthNextPath,
} from "@/lib/authCallbackRedirect"
import {
  LOGIN_PATH,
  POP_CREATE_PATH,
  persistSignupIntent,
  signupIntentHref,
  resolveSignupIntent,
} from "@/lib/signupIntent"
import { registerAccountWithEmail } from "@/app/auth/actions"
import { AuthResendConfirmation } from "@/components/auth/AuthResendConfirmation"
import { REGISTER_COPY } from "@/lib/auth/rootsyAuthUiCopy"
import { createClient } from "@/utils/supabase/client"

function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const signupIntent = useMemo(
    () => resolveSignupIntent(searchParams),
    [searchParams],
  )
  const afterAuthHref = resolveAuthNextFromSearch(
    searchParams,
    signupIntentHref(POP_CREATE_PATH, signupIntent),
  )
  const createPopHref = afterAuthHref
  const loginHref = authPathWithNext(
    signupIntentHref(LOGIN_PATH, signupIntent),
    afterAuthHref,
    searchParams.get("email") ?? undefined,
  )

  useEffect(() => {
    persistSignupIntent(signupIntent)
  }, [signupIntent])

  const [email, setEmail] = useState(
    () => searchParams.get("email")?.trim() ?? "",
  )
  const [password, setPassword] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
    terms: "",
  })
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null)

  const clearFieldError = (key: keyof typeof fieldErrors) => {
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev))
  }

  const validateForm = () => {
    const errors = {
      email: validateEmailField(email),
      password: validateSignupPassword(password),
      terms: acceptedTerms ? "" : REGISTER_COPY.errors.termsRequired,
    }
    setFieldErrors(errors)
    return !Object.values(errors).some(Boolean)
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError("")
    setIsSuccess(false)
    if (!validateForm()) return

    setIsLoading(true)
    setFieldErrors({ email: "", password: "", terms: "" })

    try {
      const cleanEmail = formatEmailInput(email)
      persistSignupIntent(signupIntent)

      const result = await registerAccountWithEmail({
        email: cleanEmail,
        password,
        next: afterAuthHref,
      })

      if (!result.success) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      setError(
        result.resent
          ? REGISTER_COPY.successResent
          : REGISTER_COPY.successNew,
      )
      setIsSuccess(true)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : REGISTER_COPY.errors.createFailed
      if (
        errorMessage.includes("already registered") ||
        errorMessage.includes("already exists")
      ) {
        setError(REGISTER_COPY.errors.alreadyRegistered)
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    if (!acceptedTerms) {
      setFieldErrors((prev) => ({
        ...prev,
        terms: REGISTER_COPY.errors.termsRequired,
      }))
      return
    }

    setGoogleLoading(true)
    setError("")
    try {
      persistSignupIntent(signupIntent)
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      setAuthNextPath(createPopHref)
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrlWithNext(origin, afterAuthHref),
        },
      })
      if (oauthError) throw oauthError
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : REGISTER_COPY.errors.google,
      )
      setGoogleLoading(false)
    }
  }

  return (
    <AuthMarketingShell>
      <header className="space-y-2">
        <AuthTitle>{REGISTER_COPY.title}</AuthTitle>
        <AuthLead>
          {REGISTER_COPY.leadBeforeLink}{" "}
          <AuthTextLink href={loginHref}>{REGISTER_COPY.loginLink}</AuthTextLink>.
        </AuthLead>
      </header>

      {error ? (
        <div className="mt-5">
          {isSuccess ? (
            <AuthResendConfirmation
              email={formatEmailInput(email)}
              message={error}
              next={afterAuthHref}
            />
          ) : (
            <RootsBanner
              intent="danger"
              tone="dark"
              density="compact"
              message={error}
            />
          )}
        </div>
      ) : null}

      <RootsFormToneProvider tone="dark">
        <form className="mt-7 space-y-5" noValidate onSubmit={handleSubmit}>
          <AuthEmailField
            id="correo"
            value={email}
            onChange={(next) => {
              setEmail(next)
              clearFieldError("email")
            }}
            error={fieldErrors.email || undefined}
            disabled={isLoading || googleLoading}
          />

          <AuthPasswordField
            id="password"
            label="Contraseña"
            value={password}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            hint={SIGNUP_PASSWORD_HINT}
            error={fieldErrors.password || undefined}
            disabled={isLoading || googleLoading}
            onChange={(e) => {
              setPassword(e.target.value)
              clearFieldError("password")
            }}
          />

          <div className="space-y-2">
            <div className="flex items-start gap-3 text-sm leading-relaxed text-[var(--rootsy-sombra-300)]">
              <RootsFormCheckbox
                id="acepto-terminos"
                checked={acceptedTerms}
                invalid={Boolean(fieldErrors.terms)}
                disabled={isLoading || googleLoading}
                className="mt-0.5 shrink-0"
                onCheckedChange={(value) => {
                  setAcceptedTerms(value === true)
                  if (fieldErrors.terms) clearFieldError("terms")
                }}
              />
              <p>
                <label htmlFor="acepto-terminos">Acepto los </label>
                <button
                  type="button"
                  className="font-semibold text-[var(--rootsy-savia-400)] underline-offset-2 hover:text-[var(--rootsy-savia-300)] hover:underline"
                  aria-haspopup="dialog"
                  onClick={() => setLegalDoc("terms")}
                >
                  Términos y condiciones
                </button>{" "}
                y la{" "}
                <button
                  type="button"
                  className="font-semibold text-[var(--rootsy-savia-400)] underline-offset-2 hover:text-[var(--rootsy-savia-300)] hover:underline"
                  aria-haspopup="dialog"
                  onClick={() => setLegalDoc("privacy")}
                >
                  Política de privacidad
                </button>
                .
              </p>
            </div>
            {fieldErrors.terms ? (
              <RootsFormFieldMessage variant="error">
                {fieldErrors.terms}
              </RootsFormFieldMessage>
            ) : null}
          </div>

          <RootsPrimaryButton
            type="submit"
            size="large"
            loading={isLoading}
            loadingLabel={REGISTER_COPY.submitLoading}
            disabled={googleLoading}
            className="w-full"
          >
            {REGISTER_COPY.submit}
          </RootsPrimaryButton>
        </form>

        <div className="mt-7 space-y-4">
          <AuthOrDivider />
          <AuthGoogleButton
            loading={googleLoading}
            disabled={isLoading}
            onClick={() => void handleGoogle()}
          >
            {REGISTER_COPY.google}
          </AuthGoogleButton>
        </div>
      </RootsFormToneProvider>

      <AuthLegalSheet docId={legalDoc} onClose={() => setLegalDoc(null)} />
    </AuthMarketingShell>
  )
}

export default withGuestAuth(RegisterPage)
