"use client"

import type {
  TreasuryAccountTableRow,
  TreasuryChildAccountKind,
} from "@/app/[siteId]/[popId]/accounts/actions"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsFormTextField } from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { treasuryChildCreateDialogCopy } from "@/lib/treasuryAccountMenuActions"
import type { FormEvent } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  parent: TreasuryAccountTableRow | null
  kind: TreasuryChildAccountKind | null
  name: string
  onNameChange: (value: string) => void
  saving: boolean
  banner: string | null
  onSubmit: (e: FormEvent) => void | Promise<void>
}

export function TreasuryChildAccountCreateDialog({
  open,
  onOpenChange,
  parent,
  kind,
  name,
  onNameChange,
  saving,
  banner,
  onSubmit,
}: Props) {
  const copy =
    parent && kind ? treasuryChildCreateDialogCopy(kind, parent.name) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {copy ? (
        <RootsDialogContent size="default">
        <RootsDialogHeader title={copy.title} description={copy.description} />
        <RootsDialogForm onSubmit={onSubmit}>
          <RootsDialogBody className="space-y-4">
            {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
            <RootsFormTextField
              label={copy.nameLabel}
              id="child-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              required
              autoFocus
              placeholder={copy.namePlaceholder}
            />
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel={copy.submitLabel}
            confirmLoadingLabel="Guardando…"
            confirmType="submit"
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
      ) : null}
    </Dialog>
  )
}
