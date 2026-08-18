"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  AuthEyebrow,
  AuthLead,
  AuthMarketingShell,
  AuthMutedLink,
  AuthTitle,
} from "@/components/auth/AuthMarketingShell"
import { AuthEmailField } from "@/components/auth/AuthEmailField"
import { AuthPasswordField } from "@/components/auth/AuthPasswordField"
import { RootsBanner } from "@/components/rootsy-banner"
import { RootsPrimaryButton } from "@/components/rootsy-button"
import { RootsFormToneProvider } from "@/components/rootsy-form"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { useAuth } from "@/context/AuthContextSupabase"
import {
  SIGNUP_PASSWORD_HINT,
  formatEmailInput,
  validateEmailField,
  validateSignupPassword,
} from "@/lib/authValidation"
import {
  RECOVERY_NEW_PASSWORD_PATH,
  setAuthNextPath,
} from "@/lib/authCallbackRedirect"
import { requestPasswordRecoveryEmail } from "@/app/auth/actions"
import { RECOVERY_COPY } from "@/lib/auth/rootsyAuthUiCopy"
import { createClient } from "@/utils/supabase/client"

type Phase =
  | "verifying"
  | "request"
  | "new-password"
  | "email-sent"
  | "fatal"

function RecoverPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const paso = searchParams.get("paso")
  const tokenHash = searchParams.get("token_hash")
  const typeParam = searchParams.get("type")

  const [phase, setPhase] = useState<Phase>("verifying")
  const [fatalMessage, setFatalMessage] = useState("")

  const [email, setEmail] = useState("")
  const [fieldErrors, setFieldErrors] = useState({ email: "" })
  const [requestError, setRequestError] = useState("")
  const [requestLoading, setRequestLoading] = useState(false)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwFieldErrors, setPwFieldErrors] = useState({
    password: "",
    confirmPassword: "",
  })
  const [updateError, setUpdateError] = useState("")
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function verify() {
      if (tokenHash && typeParam) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type: typeParam as
            | "signup"
            | "invite"
            | "magiclink"
            | "recovery"
            | "email_change"
            | "email",
          token_hash: tokenHash,
        })
        if (cancelled) return
        if (verifyError) {
          setFatalMessage(RECOVERY_COPY.fatalInvalidLink)
          setPhase("fatal")
          return
        }
        setPhase("new-password")
        return
      }

      if (paso === "nueva") {
        await new Promise((r) => setTimeout(r, 500))
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (cancelled) return
        if (!session) {
          setFatalMessage(RECOVERY_COPY.fatalNoSession)
          setPhase("fatal")
          return
        }
        setPhase("new-password")
        return
      }

      if (cancelled) return
      if (searchParams.get("error") === "enlace") {
        setRequestError(RECOVERY_COPY.fatalInvalidLink)
      }
      setPhase("request")
    }

    void verify()
    return () => {
      cancelled = true
    }
  }, [paso, tokenHash, typeParam, searchParams, supabase])

  useEffect(() => {
    if (phase !== "request" || authLoading) return
    if (user) {
      router.replace("/home")
    }
  }, [phase, authLoading, user, router])

  const validateRequestEmail = () => {
    const err = validateEmailField(email)
    setFieldErrors({ email: err })
    return !err
  }

  const handleSendEmail = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setRequestError("")
    if (!validateRequestEmail()) return

    setRequestLoading(true)
    setFieldErrors({ email: "" })
    try {
      const cleanEmail = formatEmailInput(email)
      setAuthNextPath(RECOVERY_NEW_PASSWORD_PATH)
      const result = await requestPasswordRecoveryEmail({ email: cleanEmail })
      if (!result.success) {
        throw new Error(result.error)
      }
      setPhase("email-sent")
    } catch (err: unknown) {
      setRequestError(
        err instanceof Error ? err.message : RECOVERY_COPY.errors.sendFailed,
      )
    } finally {
      setRequestLoading(false)
    }
  }

  const validatePasswordForm = () => {
    const pErr = validateSignupPassword(password)
    let cErr = ""
    if (!confirmPassword) {
      cErr = "Confirmá tu contraseña"
    } else if (confirmPassword !== password) {
      cErr = "Las contraseñas no coinciden"
    }
    setPwFieldErrors({
      password: pErr,
      confirmPassword: cErr,
    })
    return !pErr && !cErr
  }

  const handleUpdatePassword = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setUpdateError("")
    if (!validatePasswordForm()) return

    setUpdateLoading(true)
    setPwFieldErrors({ password: "", confirmPassword: "" })
    try {
      const { error: updateErrorInner } = await supabase.auth.updateUser({
        password,
      })
      if (updateErrorInner) throw updateErrorInner
      setUpdateSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err: unknown) {
      setUpdateError(
        err instanceof Error ? err.message : RECOVERY_COPY.errors.updateFailed,
      )
    } finally {
      setUpdateLoading(false)
    }
  }

  const shell = (children: ReactNode) => (
    <AuthMarketingShell>{children}</AuthMarketingShell>
  )

  if (phase === "verifying") {
    return shell(
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <RootsSpinner tone="dark" label={RECOVERY_COPY.verifyingSpinner} />
        <div className="space-y-2">
          <AuthTitle>{RECOVERY_COPY.verifyingTitle}</AuthTitle>
          <AuthLead>{RECOVERY_COPY.verifyingLead}</AuthLead>
        </div>
      </div>,
    )
  }

  if (phase === "fatal") {
    return shell(
      <>
        <header className="space-y-2">
          <AuthEyebrow>{RECOVERY_COPY.eyebrow}</AuthEyebrow>
          <AuthTitle>{RECOVERY_COPY.fatalTitle}</AuthTitle>
        </header>
        <div className="mt-5">
          <RootsBanner
            intent="danger"
            tone="dark"
            density="compact"
            message={fatalMessage}
          />
        </div>
        <div className="mt-7 space-y-4">
          <RootsPrimaryButton
            type="button"
            size="large"
            className="w-full"
            onClick={() => router.push("/recovery-password")}
          >
            {RECOVERY_COPY.retryLink}
          </RootsPrimaryButton>
          <div className="text-center">
            <AuthMutedLink href="/login">{RECOVERY_COPY.backToLogin}</AuthMutedLink>
          </div>
        </div>
      </>,
    )
  }

  if (phase === "email-sent") {
    return shell(
      <>
        <header className="space-y-2">
          <AuthEyebrow>{RECOVERY_COPY.eyebrow}</AuthEyebrow>
          <AuthTitle>{RECOVERY_COPY.emailSentTitle}</AuthTitle>
          <AuthLead>{RECOVERY_COPY.emailSentLead}</AuthLead>
        </header>
        <div className="mt-7 space-y-4">
          <RootsPrimaryButton
            type="button"
            size="large"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            {RECOVERY_COPY.backToLogin}
          </RootsPrimaryButton>
        </div>
      </>,
    )
  }

  if (phase === "new-password") {
    return shell(
      <>
        <header className="space-y-2">
          <AuthEyebrow>{RECOVERY_COPY.eyebrow}</AuthEyebrow>
          <AuthTitle>{RECOVERY_COPY.newPasswordTitle}</AuthTitle>
          <AuthLead>{SIGNUP_PASSWORD_HINT}</AuthLead>
        </header>

        {updateSuccess ? (
          <div className="mt-5">
            <RootsBanner
              intent="success"
              tone="dark"
              density="compact"
              message={RECOVERY_COPY.passwordUpdated}
            />
          </div>
        ) : null}

        {updateError && !updateSuccess ? (
          <div className="mt-5">
            <RootsBanner
              intent="danger"
              tone="dark"
              density="compact"
              message={updateError}
            />
          </div>
        ) : null}

        <RootsFormToneProvider tone="dark">
          <form
            className="mt-7 space-y-5"
            noValidate
            onSubmit={handleUpdatePassword}
          >
            <AuthPasswordField
              id="new-password"
              label="Nueva contraseña"
              value={password}
              autoComplete="new-password"
              placeholder="Nueva contraseña"
              error={pwFieldErrors.password || undefined}
              disabled={updateLoading || updateSuccess}
              onChange={(e) => {
                setPassword(e.target.value)
                if (pwFieldErrors.password) {
                  setPwFieldErrors((prev) => ({ ...prev, password: "" }))
                }
              }}
            />

            <AuthPasswordField
              id="confirm-password"
              label="Confirmar contraseña"
              value={confirmPassword}
              autoComplete="new-password"
              placeholder="Repetí la contraseña"
              error={pwFieldErrors.confirmPassword || undefined}
              disabled={updateLoading || updateSuccess}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (pwFieldErrors.confirmPassword) {
                  setPwFieldErrors((prev) => ({ ...prev, confirmPassword: "" }))
                }
              }}
            />

            <RootsPrimaryButton
              type="submit"
              size="large"
              loading={updateLoading}
              loadingLabel={RECOVERY_COPY.submitUpdateLoading}
              disabled={updateSuccess}
              className="w-full"
            >
              {RECOVERY_COPY.submitUpdate}
            </RootsPrimaryButton>

            <div className="text-center">
              <AuthMutedLink href="/login">
                {RECOVERY_COPY.backToLogin}
              </AuthMutedLink>
            </div>
          </form>
        </RootsFormToneProvider>
      </>,
    )
  }

  return shell(
    <>
      <header className="space-y-2">
        <AuthEyebrow>{RECOVERY_COPY.eyebrow}</AuthEyebrow>
        <AuthTitle>{RECOVERY_COPY.requestTitle}</AuthTitle>
        <AuthLead>{RECOVERY_COPY.requestLead}</AuthLead>
      </header>

      {requestError ? (
        <div className="mt-5">
          <RootsBanner
            intent="danger"
            tone="dark"
            density="compact"
            message={requestError}
          />
        </div>
      ) : null}

      <RootsFormToneProvider tone="dark">
        <form className="mt-7 space-y-5" noValidate onSubmit={handleSendEmail}>
          <AuthEmailField
            id="correo"
            value={email}
            onChange={(next) => {
              setEmail(next)
              if (fieldErrors.email) {
                setFieldErrors({ email: "" })
              }
            }}
            error={fieldErrors.email || undefined}
            disabled={requestLoading}
          />

          <RootsPrimaryButton
            type="submit"
            size="large"
            loading={requestLoading}
            loadingLabel={RECOVERY_COPY.submitRequestLoading}
            className="w-full"
          >
            {RECOVERY_COPY.submitRequest}
          </RootsPrimaryButton>

          <div className="text-center">
            <AuthMutedLink href="/login">{RECOVERY_COPY.backToLogin}</AuthMutedLink>
          </div>
        </form>
      </RootsFormToneProvider>
    </>,
  )
}

export default RecoverPasswordPage
