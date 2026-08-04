"use client"

import { ClientUpsertFormFields } from "@/app/[siteId]/[popId]/clients/ClientUpsertFormFields"
import type { UpsertPopClientInput } from "@/app/[siteId]/[popId]/clients/actions"
import type { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import type { SaleComprobantePickerOption } from "@/lib/saleComprobantePicker"
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
  form: UpsertPopClientInput
  setForm: Dispatch<SetStateAction<UpsertPopClientInput>>
  padron: ReturnType<typeof usePadronAutofillRazonSocial>
  comprobanteFormOptions: SaleComprobantePickerOption[]
  suggestedComprobante: string | null
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
  /** Limpieza diferida — después de la animación de cierre. */
  onAfterClose?: () => void
}

export function ClientUpsertDialog({
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
  const confirmLabel = mode === "create" ? "Crear cliente" : "Guardar cambios"
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
            <ClientUpsertFormFields {...formProps} />
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
