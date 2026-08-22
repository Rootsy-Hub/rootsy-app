"use client"

import type { PopRoleRow } from "@/app/[siteId]/[popId]/hr/actions"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
  RootsDialogSingleActionFooter,
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
  personName: string
  email: string
  saving: boolean
  error: string | null
  result: HrInviteResult | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: {
    roleId: string
    message: string
  }) => void | Promise<void>
  onCreateRole: () => void
}

export function HrInviteDialog({
  open,
  roles,
  personName,
  email,
  saving,
  error,
  result,
  onOpenChange,
  onSubmit,
  onCreateRole,
}: Props) {
  const [roleId, setRoleId] = useState("")
  const [message, setMessage] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) {
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
    void onSubmit({ roleId, message })
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
            <RootsDialogSingleActionFooter
              label="Listo"
              onAction={() => onOpenChange(false)}
            />
          </>
        ) : (
          <RootsDialogForm onSubmit={handleSubmit}>
            <RootsDialogHeader
              open={open}
              title={`Dar acceso a ${personName || "esta persona"}`}
              description="Si no tiene cuenta de Rootsy, la crea con el mismo enlace y queda en esta ficha."
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
                    readOnly
                    hint={
                      email
                        ? "El de la ficha. Ahí le llega el enlace."
                        : "Cargá el correo en la ficha antes de dar acceso."
                    }
                  />
                  <RootsFormSelectField
                    label="Rol"
                    id="hr-invite-role"
                    value={roleId}
                    onValueChange={setRoleId}
                    placeholder="Elegir rol"
                    hint="Qué puede hacer cuando abre Rootsy en este local."
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
