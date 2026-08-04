"use client"

import type { ArticleCategoryOption } from "@/app/[siteId]/[popId]/articles/actions"
import {
  ArticleUpsertFormFields,
  type ArticleUpsertFormState,
} from "@/app/[siteId]/[popId]/articles/ArticleUpsertFormFields"
import type { ArticleItemKind } from "@/lib/articleItemKind"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
  RootsDialogLoadingState,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import type { FormEventHandler } from "react"

type FormFieldsProps = {
  idPrefix: string
  siteId: string
  popId: string
  form: ArticleUpsertFormState
  onChange: (patch: Partial<ArticleUpsertFormState>) => void
  onItemKindChange: (kind: ArticleItemKind) => void
  categories: ArticleCategoryOption[]
  supplierOptions: { id: string; name: string }[]
  suppliersLoading?: boolean
  canPostInitialStock?: boolean
  disabled?: boolean
}

type Props = FormFieldsProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  title: string
  loading?: boolean
  loadingMessage?: string
  saving?: boolean
  banner?: string | null
  onSubmit: FormEventHandler<HTMLFormElement>
  onCancel: () => void
}

export function ArticleUpsertDialog({
  open,
  onOpenChange,
  mode,
  title,
  loading = false,
  loadingMessage = "Cargando categorías…",
  saving = false,
  banner,
  onSubmit,
  onCancel,
  ...formProps
}: Props) {
  const confirmLabel = mode === "create" ? "Crear" : "Guardar"
  const confirmLoadingLabel = mode === "create" ? "Creando…" : "Guardando…"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="twoCol">
        <RootsDialogHeader
          title={title}
          description={title}
          descriptionHidden
        />
        {loading ? (
          <RootsDialogBody>
            <RootsDialogLoadingState message={loadingMessage} />
          </RootsDialogBody>
        ) : (
          <RootsDialogForm onSubmit={onSubmit}>
            <RootsDialogBody>
              {banner ? (
                <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner>
              ) : null}
              <ArticleUpsertFormFields mode={mode} {...formProps} />
            </RootsDialogBody>
            <RootsDialogDualActionFooter
              onCancel={onCancel}
              confirmLabel={confirmLabel}
              confirmLoadingLabel={confirmLoadingLabel}
              confirmType="submit"
              confirmDisabled={saving}
              confirmLoading={saving}
            />
          </RootsDialogForm>
        )}
      </RootsDialogContent>
    </Dialog>
  )
}
