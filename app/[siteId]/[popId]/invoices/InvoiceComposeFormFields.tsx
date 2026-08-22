"use client"

import type { InvoiceFormContextResult } from "@/app/[siteId]/[popId]/invoices/actions"
import type { InvoiceComposeFormState } from "@/app/[siteId]/[popId]/invoices/invoiceComposeFormState"
import { RootsBanner } from "@/components/rootsy-banner"
import {
  RootsFormField,
  RootsFormMoneyField,
  RootsFormSegmentField,
  RootsFormTextField,
  RootsFormTextareaField,
  rootsFormBrumaTextSecondaryClass,
  rootsFormImageUploadShellClass,
  rootsFormTextFieldClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form"
import { formatArcaPtoVta } from "@/lib/arcaPtoVta"
import { rootsFormImageUploadShellEmptyClass } from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import { FileKey, FileText, Upload, X } from "lucide-react"
import type { Dispatch, ReactNode, RefObject, SetStateAction } from "react"

type FormCtx = InvoiceFormContextResult

type Props = {
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

function StatusNotice({
  title,
  children,
  tone = "amber",
}: {
  title: string
  children: ReactNode
  tone?: "amber" | "muted"
}) {
  return (
    <RootsBanner
      intent={tone === "amber" ? "warning" : "neutral"}
      density="compact"
      title={title}
      message={children}
    />
  )
}

function PemFileField({
  label,
  id,
  accept,
  extensionsHint,
  file,
  onFileChange,
  inputRef,
  icon: Icon,
  disabled,
}: {
  label: string
  id: string
  accept: string
  extensionsHint: string
  file: File | null
  onFileChange: (file: File | null) => void
  inputRef: RefObject<HTMLInputElement | null>
  icon: typeof FileText
  disabled?: boolean
}) {
  const clear = () => {
    onFileChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <RootsFormField label={label} htmlFor={id}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <div
          className={cn(
            rootsFormTextFieldClass,
            "flex items-center gap-3 px-3 py-2.5",
            disabled && "opacity-60",
          )}
        >
          <Icon className="size-4 shrink-0 text-[color:var(--rootsy-bruma-500)]" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
          <button
            type="button"
            disabled={disabled}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-[color:var(--rootsy-bruma-600)] transition-colors hover:bg-[color:var(--rootsy-bruma-100)]"
            aria-label={`Quitar ${label.toLowerCase()}`}
            onClick={clear}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            rootsFormImageUploadShellEmptyClass,
            "flex w-full flex-col items-center gap-1.5 px-4 py-5 text-sm",
          )}
        >
          <Upload className="size-5 text-[color:var(--rootsy-bruma-400)]" aria-hidden />
          <span className="font-medium text-[color:var(--rootsy-bruma-900)]">
            Elegir archivo
          </span>
          <span className={rootsFormBrumaTextSecondaryClass}>{extensionsHint}</span>
        </button>
      )}
    </RootsFormField>
  )
}

export function InvoiceComposeFormFields({
  idPrefix,
  form,
  setForm,
  formCtx,
  canEmit,
  cashEmitReady,
  hasOpenCashSession,
  crtFile,
  onCrtFileChange,
  crtInputRef,
  keyFile,
  onKeyFileChange,
  keyInputRef,
  disabled = false,
}: Props) {
  const patch = (next: Partial<InvoiceComposeFormState>) =>
    setForm((current) => ({ ...current, ...next }))

  return (
    <div className="flex flex-col gap-4">
      <RootsFormSegmentField
        label="Modo de emisión"
        value={form.tab}
        onValueChange={(value) =>
          patch({ tab: value === "homologacion" ? "homologacion" : "caja" })
        }
        disabled={disabled}
        options={[
          { value: "caja", label: "Con caja abierta" },
          { value: "homologacion", label: "Prueba homologación" },
        ]}
      />

      {form.tab === "caja" ? (
        <>
          {formCtx?.success && formCtx.cashSession ? (
            <div className={cn(rootsFormImageUploadShellClass, "px-3 py-2.5 text-sm")}>
              <p className="font-medium text-[color:var(--rootsy-bruma-900)]">
                {formCtx.cashSession.cashRegisterName || "Caja"}
              </p>
              {formCtx.cashSession.salePoint ? (
                <p className={cn("mt-1 text-xs", rootsFormBrumaTextSecondaryClass)}>
                  Punto de venta AFIP:{" "}
                  <span className="tabular-nums text-[color:var(--rootsy-bruma-900)]">
                    {formatArcaPtoVta(formCtx.cashSession.salePoint.ptoVta)}
                  </span>
                </p>
              ) : null}
            </div>
          ) : null}

          {formCtx?.success && !hasOpenCashSession ? (
            <StatusNotice title="No hay sesión de caja abierta">
              Abrí una sesión en Cajas para este punto de venta. Si acabás de
              abrirla, esperá un momento o cerrá y volvé a abrir este modal.
            </StatusNotice>
          ) : null}

          {hasOpenCashSession &&
          formCtx?.success === true &&
          !formCtx.cashSession?.salePoint ? (
            <StatusNotice title="Falta punto de venta">
              Asigná un punto de venta AFIP a esta caja en Cajas.
            </StatusNotice>
          ) : null}

          {hasOpenCashSession &&
          formCtx?.success === true &&
          formCtx.cashSession?.salePoint &&
          !cashEmitReady ? (
            <StatusNotice title="Falta configuración fiscal">
              Ese punto de venta no tiene certificado. Cargalo en Configuración
              fiscal.
            </StatusNotice>
          ) : null}

          {formCtx?.success && !canEmit ? (
            <StatusNotice title="Sin permiso" tone="muted">
              No tenés permiso para emitir facturas en este punto de venta.
            </StatusNotice>
          ) : null}
        </>
      ) : (
        <p className={cn("text-xs leading-relaxed", rootsFormBrumaTextSecondaryClass)}>
          Es un ambiente distinto al de producción: el WSAA solo acepta el
          certificado digital que generaste para{" "}
          <strong className="font-medium text-[color:var(--rootsy-bruma-900)]">
            homologación
          </strong>{" "}
          (no el .crt de producción). No se guarda ningún registro en Rootsy.
        </p>
      )}

      {form.tab === "homologacion" ? (
        <>
          <div className={rootsFormTwoColRowClass}>
            <PemFileField
              label="Certificado (.crt)"
              id={`${idPrefix}-crt`}
              accept=".crt,.pem,text/*"
              extensionsHint="Archivo .crt o .pem"
              file={crtFile}
              onFileChange={onCrtFileChange}
              inputRef={crtInputRef}
              icon={FileText}
              disabled={disabled}
            />
            <PemFileField
              label="Clave privada (.key)"
              id={`${idPrefix}-key`}
              accept=".key,.pem,text/*"
              extensionsHint="Archivo .key o .pem"
              file={keyFile}
              onFileChange={onKeyFileChange}
              inputRef={keyInputRef}
              icon={FileKey}
              disabled={disabled}
            />
          </div>
          <RootsFormTextField
            label="Punto de venta"
            id={`${idPrefix}-pto`}
            type="number"
            min={0}
            max={99999}
            value={form.ptoVta}
            onChange={(e) => patch({ ptoVta: e.target.value })}
            disabled={disabled}
            inputMode="numeric"
            required
          />
        </>
      ) : null}

      <RootsFormMoneyField
        label="Importe total (ARS)"
        id={`${idPrefix}-importe`}
        value={form.importeTotal}
        onChange={(value) => patch({ importeTotal: value })}
        disabled={disabled}
        placeholder="0,00"
      />

      <div className={rootsFormTwoColRowClass}>
        <RootsFormTextField
          label="Tipo doc. receptor"
          id={`${idPrefix}-doc-tipo`}
          type="number"
          min={0}
          value={form.docTipo}
          onChange={(e) => patch({ docTipo: e.target.value })}
          disabled={disabled}
          inputMode="numeric"
        />
        <RootsFormTextField
          label="Nº documento"
          id={`${idPrefix}-doc-nro`}
          value={form.docNro}
          onChange={(e) => patch({ docNro: e.target.value })}
          disabled={disabled}
          inputMode="numeric"
        />
      </div>

      <RootsFormTextareaField
        label="Razón social receptor"
        id={`${idPrefix}-razon`}
        rows={2}
        value={form.receptorRazonSocial}
        onChange={(e) => patch({ receptorRazonSocial: e.target.value })}
        disabled={disabled}
      />
    </div>
  )
}
