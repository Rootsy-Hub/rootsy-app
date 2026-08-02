"use client"

import { CashRegisterArcaPtoVtaSelect } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDialogSelects"
import { CheckoutSectionLabel } from "@/components/checkout/CheckoutFormFields"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"
import {
  saleOpLightFormPrefix,
  saleOpLightFormSurface,
  saleOpLightUploadZone,
} from "@/components/sale-operation/saleOperationStyles"
import { format, parseISO } from "date-fns"
import { es as esLocale } from "date-fns/locale"
import { FileKey, FileText, Upload, X, type LucideIcon } from "lucide-react"
import type { RefObject } from "react"

export type CashRegisterArcaFormPayload = {
  arcaPtoVta: string
  arcaExpiresAt: string
  crtFile: File | null
  keyFile: File | null
}

export function formatArcaExpiryLabel(iso: string | null | undefined): string | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return null
  const d = parseISO(iso.slice(0, 10))
  if (Number.isNaN(d.getTime())) return null
  return format(d, "d MMM yyyy", { locale: esLocale })
}

export function ArcaPemFileField({
  inputId,
  inputRef,
  label,
  storedFileName,
  storedUploadedAt,
  storedMeta,
  pendingFile,
  onPendingFileChange,
  accept,
  extensionsHint,
  emptyHint,
  icon: Icon,
}: {
  inputId: string
  inputRef: RefObject<HTMLInputElement | null>
  label: string
  storedFileName: string | null
  storedUploadedAt: string | null
  storedMeta?: string | null
  pendingFile: File | null
  onPendingFileChange: (file: File | null) => void
  accept: string
  extensionsHint: string
  emptyHint: string
  icon: LucideIcon
}) {
  const displayName = pendingFile?.name ?? storedFileName
  const uploadedLabel = pendingFile
    ? "Archivo seleccionado para subir"
    : storedUploadedAt
      ? `Subido el ${storedUploadedAt}`
      : null

  const clearSelection = () => {
    onPendingFileChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2.5">
      <CheckoutSectionLabel>{label}</CheckoutSectionLabel>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          onPendingFileChange(e.target.files?.[0] ?? null)
        }}
      />

      {displayName ? (
        <div
          className={cn(
            saleOpLightFormSurface,
            "flex items-center gap-3 rounded-xl px-3.5 py-3",
          )}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-zinc-500">
            <Icon className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {displayName}
            </p>
            {uploadedLabel ? (
              <p className="text-xs text-muted-foreground">{uploadedLabel}</p>
            ) : null}
            {storedMeta ? (
              <p className="text-xs text-muted-foreground">{storedMeta}</p>
            ) : null}
          </div>
          {pendingFile ? (
            <Button
              type="button"
              variant="ghost-neutral"
              size="icon"
              className="size-8 shrink-0 rounded-lg"
              aria-label={`Quitar ${label.toLowerCase()}`}
              onClick={clearSelection}
            >
              <X className="size-4" aria-hidden />
            </Button>
          ) : storedFileName ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 rounded-lg"
              onClick={() => inputRef.current?.click()}
            >
              Reemplazar
            </Button>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            saleOpLightUploadZone,
            "flex w-full flex-col items-center gap-1.5 px-4 py-5 text-sm",
          )}
        >
          <Upload className="size-5 text-zinc-400" aria-hidden />
          <span className="font-medium text-foreground">{emptyHint}</span>
          <span className="text-xs text-muted-foreground">{extensionsHint}</span>
        </button>
      )}
    </div>
  )
}

type ArcaConfigFieldsProps = {
  idPrefix: string
  arcaPtoVta: string
  onArcaPtoVtaChange: (value: string) => void
  arcaExpiresAt: string
  onArcaExpiresAtChange: (value: string) => void
  crtRef: RefObject<HTMLInputElement | null>
  keyRef: RefObject<HTMLInputElement | null>
  crtFile: File | null
  onCrtFileChange: (file: File | null) => void
  keyFile: File | null
  onKeyFileChange: (file: File | null) => void
  storedCrtName?: string | null
  storedKeyName?: string | null
  storedCrtUploadedAt?: string | null
  storedKeyUploadedAt?: string | null
  certExpiryLabel?: string | null
  filesHint?: string
}

export function CashRegisterArcaConfigFields({
  idPrefix,
  arcaPtoVta,
  onArcaPtoVtaChange,
  arcaExpiresAt,
  onArcaExpiresAtChange,
  crtRef,
  keyRef,
  crtFile,
  onCrtFileChange,
  keyFile,
  onKeyFileChange,
  storedCrtName = null,
  storedKeyName = null,
  storedCrtUploadedAt = null,
  storedKeyUploadedAt = null,
  certExpiryLabel = null,
  filesHint = "Subí ambos archivos juntos para reemplazar el par guardado, o dejalos vacíos para conservarlo.",
}: ArcaConfigFieldsProps) {
  return (
    <div className="space-y-5">
      <CheckoutSectionLabel>Configuración ARCA de esta caja</CheckoutSectionLabel>

      <div className="space-y-2.5">
        <CheckoutSectionLabel>Punto de venta</CheckoutSectionLabel>
        <CashRegisterArcaPtoVtaSelect
          id={`${idPrefix}-arca-pto`}
          value={arcaPtoVta}
          onValueChange={onArcaPtoVtaChange}
        />
      </div>

      <div className="space-y-2.5">
        <CheckoutSectionLabel>Vencimiento del certificado (opcional)</CheckoutSectionLabel>
        <DatePicker
          id={`${idPrefix}-arca-exp`}
          value={arcaExpiresAt}
          onChange={onArcaExpiresAtChange}
          placeholder="Elegí el vencimiento"
          light
          variant="field"
          className={cn(
            saleOpLightFormSurface,
            "h-11 w-full overflow-hidden rounded-xl p-0 shadow-none",
          )}
          prefixClassName={saleOpLightFormPrefix}
        />
      </div>

      <ArcaPemFileField
        inputId={`${idPrefix}-arca-crt`}
        inputRef={crtRef}
        label="Certificado (.crt)"
        storedFileName={storedCrtName}
        storedUploadedAt={storedCrtUploadedAt}
        storedMeta={certExpiryLabel ? `Vence el ${certExpiryLabel}` : null}
        pendingFile={crtFile}
        onPendingFileChange={onCrtFileChange}
        accept=".crt"
        extensionsHint="Solo archivo .crt"
        emptyHint="Subir certificado"
        icon={FileText}
      />

      <ArcaPemFileField
        inputId={`${idPrefix}-arca-key`}
        inputRef={keyRef}
        label="Clave privada (.key)"
        storedFileName={storedKeyName}
        storedUploadedAt={storedKeyUploadedAt}
        pendingFile={keyFile}
        onPendingFileChange={onKeyFileChange}
        accept=".key"
        extensionsHint="Solo archivo .key"
        emptyHint="Subir clave privada"
        icon={FileKey}
      />

      <p className="text-xs leading-relaxed text-muted-foreground">{filesHint}</p>
    </div>
  )
}
