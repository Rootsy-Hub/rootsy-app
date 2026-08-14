"use client"

import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import {
  CheckoutSectionLabel,
  CheckoutSectionPanel,
} from "@/components/checkout/CheckoutFormFields"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
import { RootsFormField } from "@/components/rootsy-form"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  type PurchaseComprobantePickerOption,
} from "@/lib/purchaseComprobantePicker"
import { cn } from "@/lib/utils"
import { FileText, Paperclip, Receipt, ShieldCheck, Truck, X } from "lucide-react"
import { useEffect, useState, type RefObject } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  options: readonly PurchaseComprobantePickerOption[]
  comprobanteTipo: string | null
  onComprobanteTipoChange: (value: string | null) => void
  documentNumber: string
  onDocumentNumberChange: (value: string) => void
  documentDate: string
  onDocumentDateChange: (value: string) => void
  dueDate: string
  onDueDateChange: (value: string) => void
  attachment: File | null
  onAttachmentChange: (file: File | null) => void
  attachmentInputRef: RefObject<HTMLInputElement | null>
}

function purchaseComprobanteIcon(kind: PurchaseComprobantePickerOption["kind"]) {
  switch (kind) {
    case "none":
      return Receipt
    case "fiscal":
      return ShieldCheck
    case "other":
      return Truck
    default:
      return FileText
  }
}

function sanitizeDocumentNumber(raw: string): string {
  return raw.replace(/\D/g, "")
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function clearAttachment(
  attachmentInputRef: RefObject<HTMLInputElement | null>,
  onAttachmentChange: (file: File | null) => void,
) {
  onAttachmentChange(null)
  if (attachmentInputRef.current) {
    attachmentInputRef.current.value = ""
  }
}

function isOptionSelected(
  opt: PurchaseComprobantePickerOption,
  draft: string | null,
): boolean {
  return opt.kind === "none" ? draft == null : draft === opt.label
}

function optionDraftValue(opt: PurchaseComprobantePickerOption): string | null {
  return opt.kind === "none" ? null : opt.label
}

function PurchaseDocumentDetailForm({
  documentNumber,
  onDocumentNumberChange,
  documentDate,
  onDocumentDateChange,
  dueDate,
  onDueDateChange,
  attachment,
  onAttachmentChange,
  attachmentInputRef,
}: {
  documentNumber: string
  onDocumentNumberChange: (value: string) => void
  documentDate: string
  onDocumentDateChange: (value: string) => void
  dueDate: string
  onDueDateChange: (value: string) => void
  attachment: File | null
  onAttachmentChange: (file: File | null) => void
  attachmentInputRef: RefObject<HTMLInputElement | null>
}) {
  return (
    <CheckoutSectionPanel className="space-y-4">
      <RootsFormField label="Nº comprobante" htmlFor="purchase-doc-number">
        <Input
          id="purchase-doc-number"
          type="text"
          inputMode="numeric"
          value={documentNumber}
          onChange={(e) =>
            onDocumentNumberChange(sanitizeDocumentNumber(e.target.value))
          }
          placeholder="Ej. 00001234"
          className="h-11 rounded-xl"
          autoComplete="off"
        />
      </RootsFormField>

      <RootsFormField label="Fecha comprobante" htmlFor="purchase-doc-date">
        <DatePicker
          id="purchase-doc-date"
          value={documentDate}
          onChange={onDocumentDateChange}
          placeholder="Elegí la fecha del comprobante"
          className="h-11 w-full rounded-xl"
        />
      </RootsFormField>

      <RootsFormField label="Vencimiento pago" htmlFor="purchase-due-date">
        <DatePicker
          id="purchase-due-date"
          value={dueDate}
          onChange={onDueDateChange}
          placeholder="Elegí el vencimiento"
          className="h-11 w-full rounded-xl"
        />
      </RootsFormField>

      <div className="space-y-2">
        <CheckoutSectionLabel htmlFor="purchase-doc-attachment">
          Adjunto
        </CheckoutSectionLabel>
        <input
          ref={attachmentInputRef}
          id="purchase-doc-attachment"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,image/*,application/pdf"
          className="sr-only"
          onChange={(e) => {
            onAttachmentChange(e.target.files?.[0] ?? null)
          }}
        />
        {attachment ? (
          <div className="flex items-center gap-3 rounded-xl border border-[var(--rootsy-bruma-200)] bg-white px-3 py-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--rootsy-savia-400)_10%,white)] text-[var(--rootsy-savia-700)]">
              <Paperclip className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--rootsy-bruma-900)]">
                {attachment.name}
              </p>
              <p className="text-xs text-[var(--rootsy-bruma-500)]">
                {formatFileSize(attachment.size)}
              </p>
            </div>
            <RootsIconButton
              type="button"
              label="Quitar adjunto"
              theme="workspace"
              emphasis="ghost"
              size="default"
              className="shrink-0"
              onClick={() => clearAttachment(attachmentInputRef, onAttachmentChange)}
            >
              <X aria-hidden />
            </RootsIconButton>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => attachmentInputRef.current?.click()}
            className={cn(
              "flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed border-[var(--rootsy-bruma-200)]",
              "bg-white px-4 py-5 text-sm transition-colors",
              "hover:border-[color-mix(in_srgb,var(--rootsy-savia-400)_35%,var(--rootsy-bruma-200))] hover:bg-[var(--rootsy-bruma-50)]",
              "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_25%,transparent)]",
            )}
          >
            <Paperclip
              className="size-5 text-[var(--rootsy-bruma-500)]"
              aria-hidden
            />
            <span className="font-semibold text-[var(--rootsy-bruma-900)]">
              Adjuntar PDF o imagen
            </span>
            <span className="text-xs text-[var(--rootsy-bruma-500)]">
              PDF, JPG o PNG
            </span>
          </button>
        )}
      </div>
    </CheckoutSectionPanel>
  )
}

export function PurchaseComprobantePickerDialog({
  open,
  onOpenChange,
  options,
  comprobanteTipo,
  onComprobanteTipoChange,
  documentNumber,
  onDocumentNumberChange,
  documentDate,
  onDocumentDateChange,
  dueDate,
  onDueDateChange,
  attachment,
  onAttachmentChange,
  attachmentInputRef,
}: Props) {
  const [draftTipo, setDraftTipo] = useState<string | null>(comprobanteTipo)

  useEffect(() => {
    if (!open) return
    setDraftTipo(comprobanteTipo)
  }, [open, comprobanteTipo])

  const clearDocumentFields = () => {
    onDocumentNumberChange("")
    onDocumentDateChange("")
    onDueDateChange("")
    clearAttachment(attachmentInputRef, onAttachmentChange)
  }

  const handleConfirm = () => {
    if (draftTipo == null) {
      onComprobanteTipoChange(null)
      clearDocumentFields()
    } else {
      onComprobanteTipoChange(draftTipo)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default" className="flex flex-col">
        <RootsDialogHeader
          title="Comprobante"
          description="Documento del proveedor para esta compra."
        />

        <RootsDialogBody className="space-y-4">
          <ul className="flex flex-col gap-2" role="listbox" aria-label="Tipos de comprobante">
            {options.map((opt) => {
              const selected = isOptionSelected(opt, draftTipo)
              return (
                <li key={opt.label} className="flex flex-col gap-2">
                  <CheckoutOptionCard
                    title={opt.label}
                    subtitle={opt.hint}
                    selected={selected}
                    onClick={() => setDraftTipo(optionDraftValue(opt))}
                    icon={purchaseComprobanteIcon(opt.kind)}
                    trailing={selected ? "check" : "none"}
                  />
                  {selected && opt.kind !== "none" ? (
                    <PurchaseDocumentDetailForm
                      documentNumber={documentNumber}
                      onDocumentNumberChange={onDocumentNumberChange}
                      documentDate={documentDate}
                      onDocumentDateChange={onDocumentDateChange}
                      dueDate={dueDate}
                      onDueDateChange={onDueDateChange}
                      attachment={attachment}
                      onAttachmentChange={onAttachmentChange}
                      attachmentInputRef={attachmentInputRef}
                    />
                  ) : null}
                </li>
              )
            })}
          </ul>
        </RootsDialogBody>

        <RootsDialogDualActionFooter
          onCancel={() => onOpenChange(false)}
          cancelLabel="Cancelar"
          onConfirm={handleConfirm}
          confirmLabel={draftTipo == null ? "Continuar sin comprobante" : "Confirmar"}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
