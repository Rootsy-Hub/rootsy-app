"use client"

import type { PopRoleRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
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
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { useEffect, useState, type FormEvent } from "react"

type Props = {
  open: boolean
  personName: string
  roles: PopRoleRow[]
  currentRoleId: string
  saving: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (roleId: string) => void | Promise<void>
}

export function HrChangeRoleDialog({
  open,
  personName,
  roles,
  currentRoleId,
  saving,
  error,
  onOpenChange,
  onSubmit,
}: Props) {
  const [roleId, setRoleId] = useState(currentRoleId)

  useEffect(() => {
    if (!open) return
    setRoleId(currentRoleId || roles[0]?.id || "")
  }, [open, currentRoleId, roles])

  const canSubmit = Boolean(roleId) && roleId !== currentRoleId && roles.length > 0

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    void onSubmit(roleId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent showCloseButton={!saving}>
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogHeader
            open={open}
            title="Cambiar rol de Rootsy"
            description={`${personName} sigue en el equipo. Esto solo cambia qué puede hacer cuando abre el sistema.`}
          />
          <RootsDialogBody className="space-y-4">
            <RootsFormSelectField
              label="Rol"
              id="hr-change-role"
              value={roleId}
              onValueChange={setRoleId}
              placeholder="Elegir rol"
              hint="No cambia el puesto en el local."
            >
              {roles.map((role) => (
                <RootsFormSelectItem key={role.id} value={role.id}>
                  {role.displayName}
                </RootsFormSelectItem>
              ))}
            </RootsFormSelectField>
            {error ? <RootsDialogErrorBanner>{error}</RootsDialogErrorBanner> : null}
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel="Cambiar rol"
            confirmLoadingLabel="Guardando…"
            confirmType="submit"
            confirmDisabled={!canSubmit}
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
