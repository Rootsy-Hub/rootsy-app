"use client"

import {
  getBackofficeEmailOverview,
  sendBackofficeEmailTest,
  type BackofficeEmailOverview,
} from "@/app/backoffice/emailActions"
import {
  BackofficePanel,
  BackofficeSection,
} from "@/app/backoffice/components/BackofficeSection"
import { FoundationSpecCard } from "@/app/library/libraryFoundationDocShared"
import { dataWorkspaceBlocksSectionTitleClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsPrimaryButton } from "@/components/rootsy-button"
import {
  RootsFormTextField,
  RootsFormToneProvider,
} from "@/components/rootsy-form"
import type { RootsyEmailDefinition } from "@/lib/email/rootsyEmailCatalog"
import { cn } from "@/lib/utils"
import { Mail, Send } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

type TestState = {
  email: string
  loading: boolean
  result: { type: "ok" | "err"; text: string } | null
}

function providerLabel(_provider: RootsyEmailDefinition["provider"]): string {
  return "Resend"
}

function providerBadgeClass(_provider: RootsyEmailDefinition["provider"]): string {
  return "bg-[color-mix(in_srgb,var(--rootsy-savia-500)_14%,transparent)] text-[var(--rootsy-savia-700)]"
}

function EmailCatalogCard({
  entry,
  resendConfigured,
  testState,
  onEmailChange,
  onSendTest,
}: {
  entry: RootsyEmailDefinition
  resendConfigured: boolean
  testState: TestState
  onEmailChange: (value: string) => void
  onSendTest: () => void
}) {
  const resendBlocked = !resendConfigured

  return (
    <FoundationSpecCard className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={cn(dataWorkspaceBlocksSectionTitleClass, "text-lg")}>
              {entry.name}
            </h2>
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                providerBadgeClass(entry.provider),
              )}
            >
              {providerLabel(entry.provider)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[var(--rootsy-bruma-600)]">
            {entry.description}
          </p>
        </div>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
            Disparador
          </dt>
          <dd className="text-[var(--rootsy-bruma-800)]">{entry.trigger}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
            Asunto (ejemplo)
          </dt>
          <dd className="font-mono text-xs text-[var(--rootsy-bruma-800)]">
            {entry.subjectExample}
          </dd>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
            Template
          </dt>
          <dd className="font-mono text-xs text-[var(--rootsy-bruma-700)]">
            {entry.templateLocation}
          </dd>
        </div>
      </dl>

      {entry.testNote ? (
        <p className="rounded-xl border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-3 py-2 text-xs leading-relaxed text-[var(--rootsy-bruma-600)]">
          {entry.testNote}
        </p>
      ) : null}

      {resendBlocked ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Resend no está conectado en este entorno. No podés enviar pruebas de
          este correo hasta que esté configurado.
        </p>
      ) : null}


      <div className="border-t border-[var(--rootsy-bruma-200)] pt-4">
        <RootsFormToneProvider tone="light">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <RootsFormTextField
              label="Enviar prueba a"
              className="min-w-0 flex-1"
              type="email"
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              value={testState.email}
              onChange={(event) => onEmailChange(event.target.value)}
            />

            <RootsPrimaryButton
              type="button"
              withIcon
              loading={testState.loading}
              loadingLabel="Enviando…"
              disabled={resendBlocked}
              onClick={onSendTest}
              className="shrink-0"
            >
              <Send className="size-4" aria-hidden />
              Enviar prueba
            </RootsPrimaryButton>
          </div>
        </RootsFormToneProvider>

        {testState.result ? (
          <p
            className={cn(
              "mt-3 rounded-xl px-3 py-2 text-sm",
              testState.result.type === "ok"
                ? "border border-[color-mix(in_srgb,var(--rootsy-savia-500)_24%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-savia-500)_10%,transparent)] text-[var(--rootsy-savia-700)]"
                : "border border-destructive/30 bg-destructive/10 text-destructive",
            )}
            role="status"
          >
            {testState.result.text}
          </p>
        ) : null}
      </div>
    </FoundationSpecCard>
  )
}

export function BackofficeEmailsView() {
  const [overview, setOverview] = useState<BackofficeEmailOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testById, setTestById] = useState<Record<string, TestState>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getBackofficeEmailOverview()
      setOverview(data)
      setTestById((prev) => {
        const next = { ...prev }
        for (const entry of data.emails) {
          if (!next[entry.id]) {
            next[entry.id] = { email: "", loading: false, result: null }
          }
        }
        return next
      })
    } catch {
      setError("No se pudo cargar el catálogo de correos.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const updateTestEmail = (id: string, email: string) => {
    setTestById((prev) => ({
      ...prev,
      [id]: {
        email,
        loading: prev[id]?.loading ?? false,
        result: null,
      },
    }))
  }

  const handleSendTest = async (id: RootsyEmailDefinition["id"]) => {
    const current = testById[id]
    if (!current?.email.trim()) {
      setTestById((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          email: prev[id]?.email ?? "",
          loading: false,
          result: { type: "err", text: "Ingresá un correo de destino." },
        },
      }))
      return
    }

    setTestById((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        email: prev[id]?.email ?? "",
        loading: true,
        result: null,
      },
    }))

    const result = await sendBackofficeEmailTest(id, current.email)

    setTestById((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        email: prev[id]?.email ?? "",
        loading: false,
        result: result.success
          ? { type: "ok", text: result.message }
          : { type: "err", text: result.error },
      },
    }))
  }

  return (
    <BackofficeSection title="Correos" loading={loading} error={error}>
      {overview ? (
        <>
          <BackofficePanel className="p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--rootsy-savia-500)_12%,transparent)] text-[var(--rootsy-savia-600)]">
                <Mail className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm leading-relaxed text-[var(--rootsy-bruma-700)]">
                  Catálogo de correos transaccionales que Rootsy envía por Resend,
                  con la plantilla Rootsy unificada.
                </p>
                <dl className="grid gap-2 text-sm">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
                      Resend
                    </dt>
                    <dd className="text-[var(--rootsy-bruma-800)]">
                      {overview.resendConfigured ? (
                        <>
                          Conectado · remitente{" "}
                          <span className="font-mono text-xs">
                            {overview.resendFrom}
                          </span>
                        </>
                      ) : (
                        <span className="text-destructive">Sin conectar</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </BackofficePanel>

          <div className="space-y-4">
            {overview.emails.map((entry) => (
              <EmailCatalogCard
                key={entry.id}
                entry={entry}
                resendConfigured={overview.resendConfigured}
                testState={
                  testById[entry.id] ?? {
                    email: "",
                    loading: false,
                    result: null,
                  }
                }
                onEmailChange={(value) => updateTestEmail(entry.id, value)}
                onSendTest={() => void handleSendTest(entry.id)}
              />
            ))}
          </div>
        </>
      ) : null}
    </BackofficeSection>
  )
}
