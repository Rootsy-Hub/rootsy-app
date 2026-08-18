"use client"

import type { PopRoleRow } from "@/app/[siteId]/[popId]/hr/actions"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextareaField,
  RootsFormTextField,
} from "@/components/rootsy-form"
import { RootsDefaultButton } from "@/components/rootsy-button"
import { Dialog } from "@/components/ui/dialog"
import { useEffect, useState, type FormEvent } from "react"

export type HrInviteResult = {
  inviteUrl: string
  emailSent: boolean
  emailError?: string
  resendConfigured: boolean
}

type Props = {
  open: boolean
  roles: PopRoleRow[]
  saving: boolean
  error: string | null
  result: HrInviteResult | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: {
    email: string
    roleId: string
    message: string
  }) => void | Promise<void>
  onInviteAnother: () => void
  onCreateRole: () => void
}

export function HrInviteDialog({
  open,
  roles,
  saving,
  error,
  result,
  onOpenChange,
  onSubmit,
  onInviteAnother,
  onCreateRole,
}: Props) {
  const [email, setEmail] = useState("")
  const [roleId, setRoleId] = useState("")
  const [message, setMessage] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) {
      setEmail("")
      setRoleId(roles[0]?.id ?? "")
      setMessage("")
      setCopied(false)
      return
    }
    setRoleId((prev) => prev || roles[0]?.id || "")
  }, [open, roles])

  const canSubmit = email.trim().length > 0 && Boolean(roleId) && roles.length > 0

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    void onSubmit({ email, roleId, message })
  }

  const copyInviteUrl = async () => {
    if (!result?.inviteUrl) return
    await navigator.clipboard.writeText(result.inviteUrl)
    setCopied(true)
  }

  const successHint = result
    ? result.emailSent
      ? "Le mandamos el correo. Si no le llega, compartí el enlace."
      : result.resendConfigured && result.emailError
        ? `El correo no salió: ${result.emailError}. Compartí el enlace.`
        : "Compartí el enlace para que entre a este local."
    : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="wide" showCloseButton={!saving}>
        {result ? (
          <>
            <RootsDialogHeader
              open={open}
              title="Invitación lista"
              description={successHint}
            />
            <RootsDialogBody className="space-y-4">
              <RootsFormTextField
                label="Enlace"
                id="hr-invite-url"
                value={result.inviteUrl}
                readOnly
              />
              <RootsDefaultButton type="button" onClick={() => void copyInviteUrl()}>
                {copied ? "Copiado" : "Copiar enlace"}
              </RootsDefaultButton>
            </RootsDialogBody>
            <RootsDialogDualActionFooter
              cancelLabel="Invitar a otra persona"
              confirmLabel="Listo"
              onCancel={onInviteAnother}
              onConfirm={() => onOpenChange(false)}
            />
          </>
        ) : (
          <RootsDialogForm onSubmit={handleSubmit}>
            <RootsDialogHeader
              open={open}
              title="Invitar al equipo"
              description="Escribí el correo de alguien que ya tenga cuenta en Rootsy. Le llega un enlace para entrar a este local."
            />
            <RootsDialogBody className="space-y-4">
              {roles.length === 0 ? (
                <div className="space-y-3">
                  <p className="font-canopy text-sm leading-relaxed text-rootsy-bruma-500">
                    Primero creá un rol para poder invitar.
                  </p>
                  <RootsDefaultButton type="button" onClick={onCreateRole}>
                    Crear rol
                  </RootsDefaultButton>
                </div>
              ) : (
                <>
                  <RootsFormTextField
                    label="Correo electrónico"
                    id="hr-invite-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nombre@ejemplo.com"
                    autoComplete="email"
                    autoFocus
                    required
                  />
                  <RootsFormSelectField
                    label="Rol"
                    id="hr-invite-role"
                    value={roleId}
                    onValueChange={setRoleId}
                    placeholder="Elegir rol"
                    hint="Define qué puede ver y hacer en este local."
                  >
                    {roles.map((role) => (
                      <RootsFormSelectItem key={role.id} value={role.id}>
                        {role.displayName}
                      </RootsFormSelectItem>
                    ))}
                  </RootsFormSelectField>
                  <RootsFormTextareaField
                    label="Mensaje"
                    id="hr-invite-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Te sumo al local para que puedas operar…"
                    hint="Opcional. Va en el correo."
                  />
                </>
              )}
              {error ? <RootsDialogErrorBanner>{error}</RootsDialogErrorBanner> : null}
            </RootsDialogBody>
            <RootsDialogDualActionFooter
              onCancel={() => onOpenChange(false)}
              confirmLabel="Enviar invitación"
              confirmLoadingLabel="Enviando…"
              confirmType="submit"
              confirmDisabled={!canSubmit}
              confirmLoading={saving}
            />
          </RootsDialogForm>
        )}
      </RootsDialogContent>
    </Dialog>
  )
}
