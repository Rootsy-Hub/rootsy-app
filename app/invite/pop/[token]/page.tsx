"use client"

import {
  acceptPopInvitation,
  getPopInvitationPreview,
} from "@/app/invite/pop/actions"
import {
  AuthEyebrow,
  AuthLead,
  AuthMarketingShell,
  AuthTitle,
} from "@/components/auth/AuthMarketingShell"
import { RootsBanner } from "@/components/rootsy-banner"
import { RootsPrimaryButton, RootsSubtleButton } from "@/components/rootsy-button"
import { useAuth } from "@/context/AuthContextSupabase"
import { LOGIN_PATH, REGISTER_PATH } from "@/lib/signupIntent"
import {
  authPathWithNext,
  setAuthNextPath,
} from "@/lib/authCallbackRedirect"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

function sameEmail(a: string | null | undefined, b: string | null | undefined) {
  return (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase()
}

function InvitePopPage() {
  const { user, loading: authLoading, logOut } = useAuth()
  const params = useParams()
  const router = useRouter()
  const token = typeof params?.token === "string" ? params.token : ""
  const invitePath = token ? `/invite/pop/${token}` : ""

  const [preview, setPreview] = useState<
    Awaited<ReturnType<typeof getPopInvitationPreview>> | null
  >(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    void getPopInvitationPreview(token)
      .then((res) => {
        if (!cancelled) setPreview(res)
      })
      .catch(() => {
        if (!cancelled) {
          setPreview({ success: false, error: "No se pudo leer la invitación." })
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const registerHref = useMemo(
    () =>
      authPathWithNext(
        REGISTER_PATH,
        invitePath,
        preview?.success ? preview.email : undefined,
      ),
    [invitePath, preview],
  )
  const loginHref = useMemo(
    () =>
      authPathWithNext(
        LOGIN_PATH,
        invitePath,
        preview?.success ? preview.email : undefined,
      ),
    [invitePath, preview],
  )

  const goToAuth = (href: string) => {
    if (invitePath) setAuthNextPath(invitePath)
    router.push(href)
  }

  const onAccept = async () => {
    if (!token) {
      setErr("Enlace inválido.")
      return
    }
    setBusy(true)
    setErr(null)
    const res = await acceptPopInvitation(token)
    setBusy(false)
    if (!res.success) {
      setErr(res.error)
      return
    }
    setMsg("Listo. Ya tenés acceso a este local.")
    setTimeout(() => {
      router.push(`/${res.siteId}/${res.popId}/menu`)
    }, 900)
  }

  const onSwitchAccount = async () => {
    setBusy(true)
    await logOut()
    setBusy(false)
    goToAuth(loginHref)
  }

  const loading = authLoading || preview == null
  const popName = preview?.success ? preview.popName : "este local"
  const invitedEmail = preview?.success ? preview.email : ""
  const emailMatches = sameEmail(user?.email, invitedEmail)

  return (
    <AuthMarketingShell
      asideKicker="Invitación"
      asideTitle={`Te suman a ${popName}`}
      asideLead="Si no tenés cuenta, la creás con este mismo enlace. El correo tiene que ser el de la invitación."
    >
      <header className="space-y-2">
        <AuthEyebrow>Invitación</AuthEyebrow>
        <AuthTitle>Sumarte a {popName}</AuthTitle>
        <AuthLead>
          {invitedEmail
            ? `La invitaron a ${invitedEmail}. Tiene que ser esa cuenta.`
            : "Abrí este enlace con el correo al que te invitaron."}
        </AuthLead>
      </header>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-white/70">Cargando invitación…</p>
        ) : preview && !preview.success ? (
          <RootsBanner intent="danger" tone="dark" density="compact" message={preview.error} />
        ) : preview?.success && !preview.usable ? (
          <RootsBanner
            intent="warning"
            tone="dark"
            density="compact"
            message={
              preview.expired
                ? "Esta invitación venció. Pedile al dueño que la renueve."
                : "Esta invitación ya no está disponible."
            }
          />
        ) : (
          <>
            {err ? (
              <RootsBanner intent="danger" tone="dark" density="compact" message={err} />
            ) : null}
            {msg ? (
              <RootsBanner intent="success" tone="dark" density="compact" message={msg} />
            ) : null}

            {!user ? (
              <div className="flex flex-col gap-3">
                <RootsPrimaryButton type="button" onClick={() => goToAuth(registerHref)}>
                  Crear mi cuenta
                </RootsPrimaryButton>
                <RootsSubtleButton type="button" onClick={() => goToAuth(loginHref)}>
                  Ya tengo cuenta
                </RootsSubtleButton>
              </div>
            ) : !emailMatches ? (
              <div className="space-y-3">
                <RootsBanner
                  intent="warning"
                  tone="dark"
                  density="compact"
                  message={`Entraste con ${user.email}. Esta invitación es para ${invitedEmail}.`}
                />
                <RootsSubtleButton
                  type="button"
                  disabled={busy}
                  onClick={() => void onSwitchAccount()}
                >
                  {busy ? "Saliendo…" : "Entrar con el correo correcto"}
                </RootsSubtleButton>
              </div>
            ) : (
              <RootsPrimaryButton
                type="button"
                disabled={busy || !token}
                onClick={() => void onAccept()}
              >
                {busy ? "Sumándote…" : "Aceptar invitación"}
              </RootsPrimaryButton>
            )}
          </>
        )}
      </div>
    </AuthMarketingShell>
  )
}

export default InvitePopPage
