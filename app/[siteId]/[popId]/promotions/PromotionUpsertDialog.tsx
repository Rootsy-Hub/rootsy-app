"use client"

import { PromotionUpsertFormFields } from "@/app/[siteId]/[popId]/promotions/PromotionUpsertFormFields"
import type { PromotionFormState } from "@/app/[siteId]/[popId]/promotions/promotionFormState"
import type { PromotionCatalogOption } from "@/app/[siteId]/[popId]/promotions/actions"
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
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEventHandler,
  type SetStateAction,
} from "react"

type FormFieldsProps = {
  idPrefix: string
  form: PromotionFormState
  setForm: Dispatch<SetStateAction<PromotionFormState>>
  catalogOptions: PromotionCatalogOption[]
  disabled?: boolean
}

type Props = FormFieldsProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  idPrefix: string
  title: string
  description: string
  loading?: boolean
  loadingMessage?: string
  saving?: boolean
  banner?: string | null
  onSubmit: FormEventHandler<HTMLFormElement>
  onCancel: () => void
  onAfterClose?: () => void
}

export function PromotionUpsertDialog({
  open,
  onOpenChange,
  mode,
  title,
  description,
  loading = false,
  loadingMessage = "Cargando promoción…",
  saving = false,
  banner,
  onSubmit,
  onCancel,
  onAfterClose,
  idPrefix,
  ...formProps
}: Props) {
  const confirmLabel = mode === "create" ? "Crear promoción" : "Guardar cambios"
  const confirmLoadingLabel = mode === "create" ? "Creando…" : "Guardando…"
  const wasOpenRef = useRef(false)
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      setMounted(true)
      return
    }
    if (!wasOpenRef.current) return
    const timer = window.setTimeout(() => {
      wasOpenRef.current = false
      setMounted(false)
      onAfterClose?.()
    }, 220)
    return () => window.clearTimeout(timer)
  }, [open, onAfterClose])

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="twoCol">
        <RootsDialogHeader title={title} description={description} />
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
              <PromotionUpsertFormFields idPrefix={idPrefix} {...formProps} />
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
