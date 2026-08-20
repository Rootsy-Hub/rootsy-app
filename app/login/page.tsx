"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { AuthGoogleButton } from "@/components/auth/AuthGoogleButton"
import {
  AuthEyebrow,
  AuthLead,
  AuthMarketingShell,
  AuthMutedLink,
  AuthOrDivider,
  AuthTextLink,
  AuthTitle,
} from "@/components/auth/AuthMarketingShell"
import { AuthEmailField } from "@/components/auth/AuthEmailField"
import { AuthPasswordField } from "@/components/auth/AuthPasswordField"
import { RootsBanner } from "@/components/rootsy-banner"
import { RootsPrimaryButton } from "@/components/rootsy-button"
import { RootsFormToneProvider } from "@/components/rootsy-form"
import { formatEmailInput, validateEmailField } from "@/lib/authValidation"
import { withGuestAuth } from "@/hoc/withGuestAuth"
import {
  authPathWithNext,
  getAuthCallbackUrlWithNext,
  resolveAuthNextFromSearch,
  setAuthNextPath,
} from "@/lib/authCallbackRedirect"
import { checkSignupEmailStatus } from "@/app/auth/actions"
import {
  REGISTER_PATH,
  persistSignupIntent,
  resolveSignupIntent,
  signupContinueHref,
  signupIntentHref,
} from "@/lib/signupIntent"
import { AuthResendConfirmation } from "@/components/auth/AuthResendConfirmation"
import { LOGIN_COPY } from "@/lib/auth/rootsyAuthUiCopy"
import { createClient } from "@/utils/supabase/client"

function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const [email, setEmail] = useState(() => searchParams.get("email")?.trim() ?? "")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [offerRecovery, setOfferRecovery] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const signupIntent = useMemo(
    () => resolveSignupIntent(searchParams),
    [searchParams],
  )
  const afterAuthHref = resolveAuthNextFromSearch(
    searchParams,
    signupContinueHref(searchParams),
  )
  const registerHref = authPathWithNext(
    signupIntentHref(REGISTER_PATH, signupIntent),
    afterAuthHref,
    searchParams.get("email") ?? email,
  )

  const callbackError = searchParams.get("error")
  const bannerMessage =
    error ||
    (callbackError === "callback" ? LOGIN_COPY.errors.callback : "")

  const validateForm = useCallback(() => {
    const errors = {
      email: validateEmailField(email),
      password: password ? "" : LOGIN_COPY.errors.passwordRequired,
    }
    setFieldErrors(errors)
    return !errors.email && !errors.password
  }, [email, password])

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError("")
    setNeedsConfirmation(false)
    setOfferRecovery(false)
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const { data, error: signError } = await supabase.auth.signInWithPassword({
        email: formatEmailInput(email),
        password,
      })
      if (signError) throw signError
      if (data.session) {
        await new Promise((r) => setTimeout(r, 100))
        persistSignupIntent(signupIntent)
        router.push(afterAuthHref)
        router.refresh()
      }
    } catch (err: unknown) {
      const cleanEmail = formatEmailInput(email)
      const { status } = await checkSignupEmailStatus({ email: cleanEmail })
      if (status === "unconfirmed") {
        setNeedsConfirmation(true)
        setError(LOGIN_COPY.errors.unconfirmed)
        return
      }

      const msg =
        err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase()
      if (
        msg.includes("invalid login credentials") ||
        msg.includes("invalid credentials") ||
        msg.includes("email not confirmed")
      ) {
        setOfferRecovery(status === "confirmed")
        setError(
          status === "confirmed"
            ? LOGIN_COPY.errors.wrongPasswordConfirmed
            : LOGIN_COPY.errors.invalidCredentials,
        )
      } else if (err instanceof Error) {
        setError(err.message || LOGIN_COPY.errors.generic)
      } else {
        setError(LOGIN_COPY.errors.generic)
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
      persistSignupIntent(signupIntent)
      setAuthNextPath(afterAuthHref)
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrlWithNext(origin, afterAuthHref),
        },
      })
      if (oauthError) throw oauthError
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : LOGIN_COPY.errors.google)
      setGoogleLoading(false)
    }
  }

  return (
    <AuthMarketingShell>
      <header className="space-y-2">
        <AuthEyebrow>{LOGIN_COPY.eyebrow}</AuthEyebrow>
        <AuthTitle>{LOGIN_COPY.title}</AuthTitle>
        <AuthLead>
          {LOGIN_COPY.leadBeforeLink}{" "}
          <AuthTextLink href={registerHref}>{LOGIN_COPY.registerLink}</AuthTextLink>.
        </AuthLead>
      </header>

      {bannerMessage ? (
        <div className="mt-5">
          {needsConfirmation ? (
            <AuthResendConfirmation
              email={formatEmailInput(email)}
              message={bannerMessage}
              next={afterAuthHref}
              intent="warning"
            />
          ) : (
            <RootsBanner
              intent="danger"
              tone="dark"
              density="compact"
              message={bannerMessage}
              actionLabel={offerRecovery ? "Restablecer contraseña" : undefined}
              actionHref={offerRecovery ? "/recovery-password" : undefined}
            />
          )}
        </div>
      ) : null}

      <RootsFormToneProvider tone="dark">
        <form className="mt-7 space-y-5" noValidate onSubmit={handleSubmit}>
          <AuthEmailField
            value={email}
            onChange={(next) => {
              setEmail(next)
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: "" }))
              }
            }}
            error={fieldErrors.email || undefined}
            disabled={isLoading || googleLoading}
          />

          <AuthPasswordField
            id="password"
            label="Contraseña"
            value={password}
            autoComplete="current-password"
            placeholder="Tu contraseña"
            error={fieldErrors.password || undefined}
            disabled={isLoading || googleLoading}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: "" }))
              }
            }}
          />

          <RootsPrimaryButton
            type="submit"
            size="large"
            loading={isLoading}
            loadingLabel={LOGIN_COPY.submitLoading}
            disabled={googleLoading}
            className="w-full"
          >
            {LOGIN_COPY.submit}
          </RootsPrimaryButton>

          <div className="text-center">
            <AuthMutedLink href="/recovery-password">
              {LOGIN_COPY.forgotPasswordLink}
            </AuthMutedLink>
          </div>
        </form>

        <div className="mt-7 space-y-4">
          <AuthOrDivider />
          <AuthGoogleButton
            loading={googleLoading}
            disabled={isLoading}
            onClick={() => void handleGoogle()}
          >
            {LOGIN_COPY.google}
          </AuthGoogleButton>
        </div>
      </RootsFormToneProvider>
    </AuthMarketingShell>
  )
}

export default withGuestAuth(LoginPage)
