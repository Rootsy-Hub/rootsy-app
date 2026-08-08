"use client"

import { SupplierUpsertFormFields } from "@/app/[siteId]/[popId]/suppliers/SupplierUpsertFormFields"
import type { UpsertPopSupplierInput } from "@/app/[siteId]/[popId]/suppliers/actions"
import type { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEventHandler,
  type RefObject,
  type SetStateAction,
} from "react"

type FormFieldsProps = {
  idPrefix: string
  form: UpsertPopSupplierInput
  setForm: Dispatch<SetStateAction<UpsertPopSupplierInput>>
  padron: ReturnType<typeof usePadronAutofillRazonSocial>
  showPadronNameButton?: boolean
  taxInputRef?: RefObject<HTMLInputElement | null>
  nameInputRef?: RefObject<HTMLInputElement | null>
}

type Props = FormFieldsProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  title: string
  description: string
  saving?: boolean
  banner?: string | null
  onSubmit: FormEventHandler<HTMLFormElement>
  onCancel: () => void
  onAfterClose?: () => void
}

export function SupplierUpsertDialog({
  open,
  onOpenChange,
  mode,
  title,
  description,
  saving = false,
  banner,
  onSubmit,
  onCancel,
  onAfterClose,
  ...formProps
}: Props) {
  const confirmLabel = mode === "create" ? "Crear proveedor" : "Guardar cambios"
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
      <RootsDialogContent size="default" className="sm:max-w-lg">
        <RootsDialogHeader title={title} description={description} />
        <RootsDialogForm onSubmit={onSubmit}>
          <RootsDialogBody>
            {banner ? (
              <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner>
            ) : null}
            <SupplierUpsertFormFields {...formProps} />
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
      </RootsDialogContent>
    </Dialog>
  )
}
