"use client"

import { CashRegisterArcaPtoVtaSelect } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDialogSelects"
import {
  RootsFormDateField,
  RootsFormImageUploadField,
  rootsFormFieldLabelClass,
} from "@/components/rootsy-form"
import { format, parseISO } from "date-fns"
import { es as esLocale } from "date-fns/locale"
import { FileKey, FileText } from "lucide-react"

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

function buildFileStatusHint({
  pendingFile,
  storedUploadedAt,
  storedMeta,
}: {
  pendingFile: File | null
  storedUploadedAt: string | null
  storedMeta?: string | null
}): string | undefined {
  if (pendingFile) return "Archivo seleccionado para subir"
  const parts = [
    storedUploadedAt ? `Subido el ${storedUploadedAt}` : null,
    storedMeta ?? null,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : undefined
}

type ArcaConfigFieldsProps = {
  idPrefix: string
  arcaPtoVta: string
  onArcaPtoVtaChange: (value: string) => void
  arcaExpiresAt: string
  onArcaExpiresAtChange: (value: string) => void
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
  const crtDisplayName = crtFile?.name ?? storedCrtName
  const keyDisplayName = keyFile?.name ?? storedKeyName

  return (
    <div className="space-y-5">
      <p className={rootsFormFieldLabelClass}>Configuración ARCA de esta caja</p>

      <CashRegisterArcaPtoVtaSelect
        id={`${idPrefix}-arca-pto`}
        value={arcaPtoVta}
        onValueChange={onArcaPtoVtaChange}
      />

      <RootsFormDateField
        label="Vencimiento del certificado (opcional)"
        id={`${idPrefix}-arca-exp`}
        value={arcaExpiresAt}
        onChange={onArcaExpiresAtChange}
        placeholder="Elegí el vencimiento"
      />

      <RootsFormImageUploadField
        label="Certificado (.crt)"
        id={`${idPrefix}-arca-crt`}
        filled={Boolean(crtDisplayName)}
        documentIcon={FileText}
        previewCaption={crtDisplayName ?? "Certificado"}
        statusHint={buildFileStatusHint({
          pendingFile: crtFile,
          storedUploadedAt: storedCrtUploadedAt,
          storedMeta: certExpiryLabel ? `Vence el ${certExpiryLabel}` : null,
        })}
        emptyTitle="Subir certificado"
        emptySubtitle="Solo archivo .crt"
        accept=".crt"
        changeAriaLabel="Cambiar certificado"
        removeAriaLabel="Quitar certificado"
        onFileSelect={onCrtFileChange}
        onRemove={crtFile ? () => onCrtFileChange(null) : undefined}
      />

      <RootsFormImageUploadField
        label="Clave privada (.key)"
        id={`${idPrefix}-arca-key`}
        filled={Boolean(keyDisplayName)}
        documentIcon={FileKey}
        previewCaption={keyDisplayName ?? "Clave privada"}
        statusHint={buildFileStatusHint({
          pendingFile: keyFile,
          storedUploadedAt: storedKeyUploadedAt,
        })}
        emptyTitle="Subir clave privada"
        emptySubtitle="Solo archivo .key"
        accept=".key"
        changeAriaLabel="Cambiar clave privada"
        removeAriaLabel="Quitar clave privada"
        onFileSelect={onKeyFileChange}
        onRemove={keyFile ? () => onKeyFileChange(null) : undefined}
      />

      <p className="text-xs leading-relaxed text-muted-foreground">{filesHint}</p>
    </div>
  )
}
