"use client"

import type { UpsertTreasuryAccountInput } from "@/app/[siteId]/[popId]/accounts/actions"
import { TreasuryAccountFormFields } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountFormFields"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import type { Dispatch, FormEvent, SetStateAction } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: UpsertTreasuryAccountInput
  setForm: Dispatch<SetStateAction<UpsertTreasuryAccountInput>>
  saving: boolean
  banner: string | null
  onSubmit: (e: FormEvent) => void | Promise<void>
}

export function TreasuryAccountEditDialog({
  open,
  onOpenChange,
  form,
  setForm,
  saving,
  banner,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default">
        <RootsDialogHeader
          title="Editar cuenta"
          description="Modificá el nombre del medio seleccionado."
          descriptionHidden
        />
        <RootsDialogForm onSubmit={onSubmit}>
          <RootsDialogBody className="space-y-4">
            {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
            <TreasuryAccountFormFields
              form={form}
              setForm={setForm}
              idPrefix="e"
            />
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel="Guardar"
            confirmLoadingLabel="Guardando…"
            confirmType="submit"
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
