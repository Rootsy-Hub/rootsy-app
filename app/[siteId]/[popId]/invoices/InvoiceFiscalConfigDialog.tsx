"use client"

import { RootsBanner } from "@/components/rootsy-banner"
import { RootsDefaultButton, RootsIconButton } from "@/components/rootsy-button"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormDateField,
  RootsFormField,
  RootsFormImageUploadField,
  RootsFormPrefixedInput,
  rootsFormBrumaTextSecondaryClass,
  rootsFormFieldLabelClass,
  rootsFormImageUploadShellClass,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { useArcaFiscalConfig } from "@/hooks/useArcaFiscalConfig"
import {
  arcaSalePointStatusLabel,
  ARCA_PTO_VTA_PAD,
  formatArcaPtoVta,
  padArcaPtoVtaDigits,
  parseArcaPtoVta,
  popArcaPtoVtaDigit,
  pushArcaPtoVtaDigit,
} from "@/lib/arcaPtoVta"
import { popArcaFiscalConfigQueryKey } from "@/lib/queryKeys"
import {
  createArcaSalePoint,
  downloadArcaSalePointCsr,
  updateArcaSalePoint,
  type ArcaSalePoint,
} from "@/lib/rootsyApi/arcaSalePointsClient"
import { formatSaleComprobanteCuit } from "@/lib/saleComprobantePreview"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { es as esLocale } from "date-fns/locale"
import {
  Building2,
  ChevronRight,
  ExternalLink,
  Download,
  FileKey,
  FileText,
  Hash,
  Loader2,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useId, useMemo, useState } from "react"

function formatUploadedLabel(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = parseISO(iso)
  if (Number.isNaN(d.getTime())) return null
  return format(d, "d MMM yyyy", { locale: esLocale })
}

function ArcaPtoVtaPadInput({
  id,
  value,
  onChange,
  disabled,
  className,
  onEnter,
}: {
  id: string
  value: string
  onChange: (next: string) => void
  disabled?: boolean
  className?: string
  onEnter?: () => void
}) {
  return (
    <RootsFormPrefixedInput
      id={id}
      prefix={<Hash className="size-4" />}
      numeric
      inputMode="numeric"
      autoComplete="off"
      placeholder={ARCA_PTO_VTA_PAD}
      maxLength={5}
      disabled={disabled}
      value={value}
      className={className}
      inputClassName="tabular-nums"
      onChange={(event) => onChange(padArcaPtoVtaDigits(event.target.value))}
      onKeyDown={(event) => {
        if (event.key >= "0" && event.key <= "9") {
          event.preventDefault()
          onChange(pushArcaPtoVtaDigit(value, event.key))
          return
        }
        if (event.key === "Backspace" || event.key === "Delete") {
          event.preventDefault()
          onChange(popArcaPtoVtaDigit(value))
          return
        }
        if (event.key === "Enter" && onEnter) {
          event.preventDefault()
          onEnter()
        }
      }}
    />
  )
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/pkcs10" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function fileHint(pending: File | null, uploadedAt: string | null): string | undefined {
  if (pending) return "Archivo seleccionado para subir"
  const label = formatUploadedLabel(uploadedAt)
  return label ? `Subido el ${label}` : undefined
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  siteId: string
}

export function InvoiceFiscalConfigDialog({
  open,
  onOpenChange,
  popId,
  siteId,
}: Props) {
  const queryClient = useQueryClient()
  const addFieldId = useId()
  const editFieldId = useId()
  const configQuery = useArcaFiscalConfig(popId, { enabled: open && Boolean(popId) })
  const config = configQuery.data
  const canWrite = Boolean(config?.success && config.canUpdate)

  const [view, setView] = useState<"list" | "detail">("list")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newPtoVta, setNewPtoVta] = useState(ARCA_PTO_VTA_PAD)
  const [addError, setAddError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const [editPtoVta, setEditPtoVta] = useState("")
  const [editExpiresAt, setEditExpiresAt] = useState("")
  const [crtFile, setCrtFile] = useState<File | null>(null)
  const [keyFile, setKeyFile] = useState<File | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [creatingCsr, setCreatingCsr] = useState(false)
  const [csrPem, setCsrPem] = useState<string | null>(null)
  const [csrBusy, setCsrBusy] = useState(false)

  const salePoints = config?.success ? config.salePoints : []
  const selected = useMemo(
    () => salePoints.find((row) => row.id === selectedId) ?? null,
    [salePoints, selectedId],
  )

  useEffect(() => {
    if (open) return
    setView("list")
    setSelectedId(null)
    setNewPtoVta(ARCA_PTO_VTA_PAD)
    setAddError(null)
    setEditPtoVta("")
    setEditExpiresAt("")
    setCrtFile(null)
    setKeyFile(null)
    setSaveError(null)
    setCreatingCsr(false)
    setCsrPem(null)
    setCsrBusy(false)
  }, [open])

  const openDetail = (row: ArcaSalePoint) => {
    setSelectedId(row.id)
    setEditPtoVta(formatArcaPtoVta(row.ptoVta))
    setEditExpiresAt(row.expiresAt ?? "")
    setCrtFile(null)
    setKeyFile(null)
    setSaveError(null)
    setCsrPem(null)
    setCreatingCsr(false)
    setView("detail")
  }

  const backToList = () => {
    setView("list")
    setSelectedId(null)
    setSaveError(null)
    setCrtFile(null)
    setKeyFile(null)
    setCsrPem(null)
    setCreatingCsr(false)
  }

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: popArcaFiscalConfigQueryKey(popId),
    })

  const handleAdd = async () => {
    if (!canWrite || adding) return
    const parsed = parseArcaPtoVta(newPtoVta)
    if (!parsed.success) {
      setAddError(parsed.error)
      return
    }
    if (!fiscalCuit) {
      setAddError("Configurá el CUIT en ajustes antes de crear un punto de venta.")
      return
    }
    setAdding(true)
    setAddError(null)
    setSaveError(null)
    setCsrPem(null)
    setSelectedId(null)
    setEditPtoVta(formatArcaPtoVta(parsed.value))
    setEditExpiresAt("")
    setCrtFile(null)
    setKeyFile(null)
    setCreatingCsr(true)
    setView("detail")
    const result = await createArcaSalePoint(popId, parsed.value)
    setAdding(false)
    setCreatingCsr(false)
    if (!result.success) {
      setView("list")
      setAddError(result.error)
      return
    }
    setNewPtoVta(ARCA_PTO_VTA_PAD)
    setSelectedId(result.salePoint.id)
    setEditPtoVta(formatArcaPtoVta(result.salePoint.ptoVta))
    setCsrPem(result.csrPem)
    await invalidate()
  }

  const handleSave = async () => {
    if (!canWrite || !selected || saving) return
    const parsed = parseArcaPtoVta(editPtoVta)
    if (!parsed.success) {
      setSaveError(parsed.error)
      return
    }
    const hasManagedKey = Boolean(selected.keyUploadedAt || csrPem)
    if (!hasManagedKey && ((crtFile && !keyFile) || (!crtFile && keyFile))) {
      setSaveError("Subí ambos archivos (.crt y .key) o ninguno.")
      return
    }
    if (hasManagedKey && keyFile) {
      setSaveError("La clave privada ya la genera Rootsy. Subí solo el .crt.")
      return
    }
    setSaving(true)
    setSaveError(null)
    const result = await updateArcaSalePoint(popId, selected.id, {
      ptoVta: parsed.value,
      expiresAt: editExpiresAt.trim().slice(0, 10) || null,
      crtFile,
      keyFile: hasManagedKey ? null : keyFile,
    })
    setSaving(false)
    if (!result.success) {
      setSaveError(result.error)
      return
    }
    await invalidate()
    backToList()
  }

  const handleDownloadCsr = async () => {
    if (csrBusy) return
    if (csrPem) {
      downloadTextFile(`pedido-${editPtoVta || "punto-de-venta"}.csr`, csrPem)
      return
    }
    if (!selected) return
    setCsrBusy(true)
    setSaveError(null)
    const result = await downloadArcaSalePointCsr(popId, selected.id)
    setCsrBusy(false)
    if (!result.success) {
      setSaveError(result.error)
      return
    }
    setCsrPem(result.csrPem)
    downloadTextFile(
      `pedido-${formatArcaPtoVta(selected.ptoVta)}.csr`,
      result.csrPem,
    )
  }

  const fiscalCuit = config?.success ? config.fiscalCuit : null
  const fiscalRazonSocial = config?.success ? config.fiscalRazonSocial : null
  const cuitFormatted = fiscalCuit ? formatSaleComprobanteCuit(fiscalCuit) : null
  const settingsHref = `/${siteId}/${popId}/settings`
  const loading =
    open &&
    (configQuery.isPending ||
      (configQuery.isFetching && !configQuery.isFetched))
  const loadError =
    config?.success === false
      ? config.error
      : configQuery.error instanceof Error
        ? configQuery.error.message
        : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default" className="sm:max-w-lg">
        <RootsDialogHeader
          open={open}
          title={
            view === "detail"
              ? `Punto de venta ${
                  selected
                    ? formatArcaPtoVta(selected.ptoVta)
                    : editPtoVta || ""
                }`
              : "Configuración fiscal"
          }
          description={
            view === "detail"
              ? creatingCsr
                ? "Generando el pedido de certificado y la clave privada."
                : "Editá el número AFIP y cargá el certificado que te dé ARCA."
              : "CUIT del negocio y puntos de venta electrónicos de ARCA."
          }
        />

        {view === "list" ? (
          <RootsDialogBody>
            {loading ? (
              <div
                className="h-0.5 w-full overflow-hidden bg-[color:var(--rootsy-bruma-200)]"
                aria-hidden
              >
                <div className="h-full w-1/3 animate-pulse bg-[color:var(--rootsy-savia-500)]/50" />
              </div>
            ) : null}

            {loadError ? (
              <RootsDialogErrorBanner>{loadError}</RootsDialogErrorBanner>
            ) : null}

            {cuitFormatted ? (
              <RootsBanner
                intent="neutral"
                title={cuitFormatted}
                message={
                  fiscalRazonSocial ? (
                    <span className="block">{fiscalRazonSocial}</span>
                  ) : (
                    "CUIT configurado en ajustes."
                  )
                }
                icon={<Building2 className="size-4 shrink-0" aria-hidden />}
              />
            ) : (
              <RootsBanner
                intent="warning"
                layout="message"
                message={
                  <>
                    <span className="block">
                      Todavía no hay un CUIT en los ajustes del punto de venta.
                      Configuralo antes de facturar.
                    </span>
                    <Link
                      href={settingsHref}
                      className="mt-2 inline-flex items-center gap-1.5 font-medium underline-offset-2 hover:underline"
                      style={{ color: "inherit" }}
                    >
                      Ir a ajustes
                      <ExternalLink className="size-3.5" aria-hidden />
                    </Link>
                  </>
                }
              />
            )}

            <div className="pt-4">
              <RootsFormField
                label="Nuevo punto de venta"
                htmlFor={addFieldId}
                error={addError}
                hint={canWrite ? "Formato AFIP, por ejemplo 00001." : undefined}
              >
                <div className="flex items-center gap-2">
                  <ArcaPtoVtaPadInput
                    id={addFieldId}
                    value={newPtoVta}
                    disabled={!canWrite || adding}
                    className="min-w-0 flex-1"
                    onChange={(next) => {
                      setAddError(null)
                      setNewPtoVta(next)
                    }}
                    onEnter={() => void handleAdd()}
                  />
                  <RootsIconButton
                    label="Agregar punto de venta"
                    theme="workspace"
                    emphasis="filled"
                    disabled={!canWrite || adding || !parseArcaPtoVta(newPtoVta).success}
                    onClick={() => void handleAdd()}
                  >
                    <Plus />
                  </RootsIconButton>
                </div>
              </RootsFormField>
            </div>

            <div className="pt-5">
              <p className={rootsFormFieldLabelClass}>Puntos de venta</p>
              {salePoints.length === 0 ? (
                <p className={cn("mt-2 text-sm", rootsFormBrumaTextSecondaryClass)}>
                  Todavía no hay puntos de venta. Agregá el número AFIP para
                  empezar.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {salePoints.map((row) => {
                    const status = arcaSalePointStatusLabel(row)
                    return (
                      <li key={row.id}>
                        <button
                          type="button"
                          onClick={() => openDetail(row)}
                          className={cn(
                            rootsFormImageUploadShellClass,
                            "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[color:var(--rootsy-bruma-50)]",
                          )}
                        >
                          <span className="font-medium tabular-nums text-[color:var(--rootsy-bruma-900)]">
                            {formatArcaPtoVta(row.ptoVta)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className={cn(
                                "text-xs",
                                row.configured
                                  ? row.daysUntilExpiry != null &&
                                    row.daysUntilExpiry < 0
                                    ? "text-destructive"
                                    : "text-[color:var(--rootsy-bruma-600)]"
                                  : "text-[color:var(--rootsy-bruma-500)]",
                              )}
                            >
                              {status}
                            </span>
                            <ChevronRight
                              className="size-4 text-[color:var(--rootsy-bruma-400)]"
                              aria-hidden
                            />
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </RootsDialogBody>
        ) : (
          <RootsDialogForm
            onSubmit={(event) => {
              event.preventDefault()
              void handleSave()
            }}
          >
            <RootsDialogBody>
              {saveError ? (
                <RootsDialogErrorBanner>{saveError}</RootsDialogErrorBanner>
              ) : null}

              <RootsFormField
                label="Punto de venta"
                htmlFor={editFieldId}
                hint="No puede repetirse otro punto de venta del mismo negocio."
              >
                <ArcaPtoVtaPadInput
                  id={editFieldId}
                  value={editPtoVta}
                  disabled={!canWrite || saving || creatingCsr}
                  onChange={setEditPtoVta}
                />
              </RootsFormField>

              {creatingCsr ? (
                <div
                  className={cn(
                    rootsFormImageUploadShellClass,
                    "mt-4 flex items-center gap-3 px-3 py-3",
                  )}
                >
                  <Loader2
                    className="size-4 shrink-0 animate-spin text-[color:var(--rootsy-bruma-500)]"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[color:var(--rootsy-bruma-900)]">
                      Creando CSR…
                    </p>
                    <p className={cn("mt-0.5 text-xs", rootsFormBrumaTextSecondaryClass)}>
                      Generamos el pedido y guardamos la clave en Rootsy. La
                      clave no se muestra ni se descarga.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="pt-4">
                    <RootsFormDateField
                      label="Vencimiento del certificado (opcional)"
                      id={`${editFieldId}-exp`}
                      value={editExpiresAt}
                      onChange={setEditExpiresAt}
                      placeholder="Elegí el vencimiento"
                      disabled={!canWrite || saving}
                    />
                  </div>

                  {csrPem || selected?.csrUploadedAt ? (
                    <div className="pt-4">
                      <p className={rootsFormFieldLabelClass}>
                        Pedido de certificado (.csr)
                      </p>
                      <div
                        className={cn(
                          rootsFormImageUploadShellClass,
                          "mt-2 flex items-center gap-3 px-3 py-2.5",
                        )}
                      >
                        <FileText
                          className="size-4 shrink-0 text-[color:var(--rootsy-bruma-500)]"
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[color:var(--rootsy-bruma-900)]">
                            pedido-{editPtoVta || "punto-de-venta"}.csr
                          </p>
                          <p
                            className={cn(
                              "mt-0.5 text-xs",
                              rootsFormBrumaTextSecondaryClass,
                            )}
                          >
                            Subilo en ARCA para obtener el .crt. La clave queda
                            en Rootsy.
                          </p>
                        </div>
                        <RootsDefaultButton
                          type="button"
                          size="compact"
                          theme="workspace"
                          withIcon
                          loading={csrBusy}
                          loadingLabel="…"
                          disabled={csrBusy}
                          onClick={() => void handleDownloadCsr()}
                        >
                          <Download className="size-3.5" aria-hidden />
                          Descargar
                        </RootsDefaultButton>
                      </div>
                    </div>
                  ) : null}

                  <div className="pt-4">
                    <RootsFormImageUploadField
                      label="Certificado (.crt)"
                      id={`${editFieldId}-crt`}
                      filled={Boolean(crtFile || selected?.crtUploadedAt)}
                      documentIcon={FileText}
                      previewCaption={crtFile?.name ?? "Certificado"}
                      statusHint={fileHint(
                        crtFile,
                        selected?.crtUploadedAt ?? null,
                      )}
                      emptyTitle="Subir certificado"
                      emptySubtitle="El .crt que te da ARCA"
                      accept=".crt"
                      changeAriaLabel="Cambiar certificado"
                      removeAriaLabel="Quitar certificado"
                      disabled={!canWrite || saving}
                      onFileSelect={setCrtFile}
                      onRemove={crtFile ? () => setCrtFile(null) : undefined}
                    />
                  </div>

                  {selected?.keyUploadedAt || csrPem ? null : (
                    <div className="pt-4">
                      <RootsFormImageUploadField
                        label="Clave privada (.key)"
                        id={`${editFieldId}-key`}
                        filled={Boolean(keyFile)}
                        documentIcon={FileKey}
                        previewCaption={keyFile?.name ?? "Clave privada"}
                        statusHint={fileHint(keyFile, null)}
                        emptyTitle="Subir clave privada"
                        emptySubtitle="Solo si ya tenés un .key"
                        accept=".key"
                        changeAriaLabel="Cambiar clave privada"
                        removeAriaLabel="Quitar clave privada"
                        disabled={!canWrite || saving}
                        onFileSelect={setKeyFile}
                        onRemove={keyFile ? () => setKeyFile(null) : undefined}
                      />
                    </div>
                  )}
                </>
              )}
            </RootsDialogBody>
            <RootsDialogDualActionFooter
              cancelLabel="Volver"
              confirmLabel="Guardar"
              confirmLoadingLabel={creatingCsr ? "Creando CSR…" : "Guardando…"}
              confirmType="submit"
              confirmLoading={saving || creatingCsr}
              confirmDisabled={!canWrite || saving || creatingCsr || !selected}
              onCancel={backToList}
            />
          </RootsDialogForm>
        )}
      </RootsDialogContent>
    </Dialog>
  )
}
