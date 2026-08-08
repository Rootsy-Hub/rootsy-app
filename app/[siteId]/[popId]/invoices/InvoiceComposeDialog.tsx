"use client"

import { InvoiceComposeFormFields } from "@/app/[siteId]/[popId]/invoices/InvoiceComposeFormFields"
import type { getInvoiceFormContext } from "@/app/[siteId]/[popId]/invoices/actions"
import type { InvoiceComposeFormState } from "@/app/[siteId]/[popId]/invoices/invoiceComposeFormState"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { rootsFormEarthTextSecondaryClass } from "@/components/rootsy-form"
import { cn } from "@/lib/utils"
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

type FormCtx = Awaited<ReturnType<typeof getInvoiceFormContext>>

type FormFieldsProps = {
  idPrefix: string
  form: InvoiceComposeFormState
  setForm: Dispatch<SetStateAction<InvoiceComposeFormState>>
  formCtx: FormCtx | null
  canEmit: boolean
  cashEmitReady: boolean
  hasOpenCashSession: boolean
  crtFile: File | null
  onCrtFileChange: (file: File | null) => void
  crtInputRef: RefObject<HTMLInputElement | null>
  keyFile: File | null
  onKeyFileChange: (file: File | null) => void
  keyInputRef: RefObject<HTMLInputElement | null>
  disabled?: boolean
}

type Props = FormFieldsProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
  saving?: boolean
  banner?: string | null
  debugFecae?: string | null
  confirmDisabled?: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  onCancel: () => void
  onAfterClose?: () => void
}

export function InvoiceComposeDialog({
  open,
  onOpenChange,
  saving = false,
  banner,
  debugFecae,
  confirmDisabled = false,
  onSubmit,
  onCancel,
  onAfterClose,
  form,
  ...formProps
}: Props) {
  const isHomologacion = form.tab === "homologacion"
  const confirmLabel = isHomologacion ? "Emitir prueba" : "Emitir y guardar"
  const confirmLoadingLabel = isHomologacion ? "Probando…" : "Emitiendo…"
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
        <RootsDialogHeader
          title="Nueva factura ARCA"
          description="Factura B consumidor final. Elegí si emitís con la caja abierta o una prueba en homologación sin guardar."
        />
        <RootsDialogForm onSubmit={onSubmit}>
          <RootsDialogBody>
            {banner ? (
              <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner>
            ) : null}
            {debugFecae ? (
              <details className="mb-4 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2">
                <summary className="cursor-pointer text-xs font-medium text-destructive">
                  Detalle técnico (copiar para soporte)
                </summary>
                <pre
                  className={cn(
                    "mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-snug",
                    rootsFormEarthTextSecondaryClass,
                  )}
                >
                  {debugFecae}
                </pre>
              </details>
            ) : null}
            <InvoiceComposeFormFields form={form} {...formProps} />
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={onCancel}
            confirmLabel={confirmLabel}
            confirmLoadingLabel={confirmLoadingLabel}
            confirmType="submit"
            confirmDisabled={confirmDisabled}
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
