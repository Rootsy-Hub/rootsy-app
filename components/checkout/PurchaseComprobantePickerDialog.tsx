"use client"

import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { PurchaseComprobantePickerOption } from "@/lib/purchaseComprobantePicker"
import { cn } from "@/lib/utils"
import {
  saleOpDialogBody,
  saleOpDialogContentMd,
  saleOpDialogHeader,
} from "@/components/sale-operation/saleOperationStyles"
import { FileText, Paperclip, Receipt, ShieldCheck, Truck, X } from "lucide-react"
import type { RefObject } from "react"

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
    <div className="rounded-xl border border-border/60 bg-muted/10 p-3.5">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="purchase-doc-number">Nº comprobante</FieldLabel>
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
        </Field>

        <Field>
          <FieldLabel htmlFor="purchase-doc-date">Fecha comprobante</FieldLabel>
          <DatePicker
            id="purchase-doc-date"
            value={documentDate}
            onChange={onDocumentDateChange}
            placeholder="Elegí la fecha del comprobante"
            className="h-11 w-full rounded-xl"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="purchase-due-date">Vencimiento pago</FieldLabel>
          <DatePicker
            id="purchase-due-date"
            value={dueDate}
            onChange={onDueDateChange}
            placeholder="Elegí el vencimiento"
            className="h-11 w-full rounded-xl"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="purchase-doc-attachment">Adjunto</FieldLabel>
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
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background px-3 py-2.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Paperclip className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{attachment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost-neutral"
                size="icon"
                className="size-8 shrink-0 rounded-lg"
                aria-label="Quitar adjunto"
                onClick={() => clearAttachment(attachmentInputRef, onAttachmentChange)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => attachmentInputRef.current?.click()}
              className={cn(
                "flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed border-border/70",
                "bg-background px-4 py-5 text-sm transition-colors",
                "hover:border-primary/35 hover:bg-primary/3",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
              )}
            >
              <Paperclip className="size-5 text-muted-foreground" aria-hidden />
              <span className="font-medium text-foreground">Adjuntar PDF o imagen</span>
              <span className="text-xs text-muted-foreground">PDF, JPG o PNG</span>
            </button>
          )}
        </Field>
      </FieldGroup>
    </div>
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
  const clearDocumentFields = () => {
    onDocumentNumberChange("")
    onDocumentDateChange("")
    onDueDateChange("")
    clearAttachment(attachmentInputRef, onAttachmentChange)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={saleOpDialogContentMd}>
        <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Comprobante del proveedor
          </DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            saleOpDialogBody,
            "min-h-0 flex-1 overflow-y-auto overscroll-contain",
          )}
        >
          <ul className="flex flex-col gap-2" role="listbox" aria-label="Tipos de comprobante">
            {options.map((opt) => {
              const selected =
                opt.kind === "none"
                  ? comprobanteTipo == null
                  : comprobanteTipo === opt.label
              const showDetailForm = selected && opt.kind !== "none"

              return (
                <li key={opt.label} className="flex flex-col gap-2">
                  <CheckoutOptionCard
                    title={opt.label}
                    selected={selected}
                    onClick={() => {
                      if (opt.kind === "none") {
                        onComprobanteTipoChange(null)
                        clearDocumentFields()
                        onOpenChange(false)
                        return
                      }
                      onComprobanteTipoChange(opt.label)
                    }}
                    icon={purchaseComprobanteIcon(opt.kind)}
                    trailing={selected ? "check" : "none"}
                  />
                  {showDetailForm ? (
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
        </div>

        <CheckoutDialogFooter
          secondaryAction={{
            label: "Quitar selección",
            onClick: () => {
              onComprobanteTipoChange(null)
              clearDocumentFields()
              onOpenChange(false)
            },
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
