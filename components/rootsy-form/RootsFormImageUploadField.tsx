"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps } from "@/components/rootsy-form/rootsFormFieldContext"
import {
  getFormImageUploadShellStyle,
  getFormImageUploadThumbStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import {
  rootsFormImageUploadActionClass,
  rootsFormImageUploadActionDestructiveClass,
  rootsFormImageUploadMetaClass,
  rootsFormImageUploadTitleClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { RootsFormImageUploadIcon } from "@/components/rootsy-form/RootsFormImageUploadIcon"
import type { FormImageUploadDisplayStateId } from "@/app/library/ui-components/formsUiHardcodedSpec"
import { cn } from "@/lib/utils"
import { FileUp, ImagePlus, Loader2, Trash2, type LucideIcon } from "lucide-react"
import { useId, useRef, useState, type DragEvent } from "react"

const DEFAULT_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif"

type Props = {
  label: string
  id?: string
  previewSrc?: string | null
  busy?: boolean
  disabled?: boolean
  emptyTitle?: string
  emptySubtitle?: string
  previewCaption?: string
  statusHint?: string
  accept?: string
  /** Estado filled sin preview (p. ej. archivo guardado o pendiente). */
  filled?: boolean
  /** Ícono del thumb cuando no hay imagen de preview. */
  documentIcon?: LucideIcon
  /** Acción de la derecha. Por defecto cámara si es imagen, archivo si hay `documentIcon`. */
  actionIcon?: LucideIcon
  changeAriaLabel?: string
  removeAriaLabel?: string
  /** Preview circular — avatares de chat. */
  roundThumb?: boolean
  onFileSelect: (file: File) => void
  onRemove?: () => void
  className?: string
} & RootsFormFieldAssistProps

export function RootsFormImageUploadField({
  label,
  id,
  previewSrc,
  busy = false,
  disabled = false,
  emptyTitle = "Agregar imagen",
  emptySubtitle = "JPG · PNG · WebP",
  previewCaption = "Imagen cargada",
  statusHint,
  accept = DEFAULT_ACCEPT,
  filled = false,
  documentIcon: DocumentIcon,
  actionIcon: ActionIcon,
  changeAriaLabel = "Cambiar imagen",
  removeAriaLabel = "Quitar imagen",
  roundThumb = false,
  onFileSelect,
  onRemove,
  hint,
  error,
  warning,
  success,
  invalid,
  className,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const inputId = `${fieldId}-file`
  const inputRef = useRef<HTMLInputElement>(null)
  const controlProps = useRootsFormFieldControlProps({ invalid })
  const { state: interactionState, interactionHandlers } = useRootsFormControlInteraction({
    disabled: disabled || busy,
    invalid: invalid ?? Boolean(error),
  })
  const [dragOver, setDragOver] = useState(false)

  const hasPreviewImage = Boolean(previewSrc?.trim())
  const hasFile = filled || hasPreviewImage
  const isDisabled = disabled || busy
  const uploadMode = hasFile ? "filled" : "empty"
  const showDocumentThumb = hasFile && !hasPreviewImage && DocumentIcon
  const ChangeIcon = ActionIcon ?? (DocumentIcon ? FileUp : ImagePlus)
  const displayState: FormImageUploadDisplayStateId = dragOver ? "drag" : interactionState
  const shellStyle = getFormImageUploadShellStyle(uploadMode, displayState)
  const thumbStyle = {
    ...getFormImageUploadThumbStyle(uploadMode, displayState),
    ...(roundThumb ? { borderRadius: 9999 } : null),
  }

  const openPicker = () => {
    if (isDisabled) return
    inputRef.current?.click()
  }

  const pickFile = (file: File | null) => {
    if (!file || isDisabled) return
    onFileSelect(file)
  }

  const handleDragEnter = (event: DragEvent) => {
    event.preventDefault()
    if (isDisabled) return
    setDragOver(true)
  }

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    if (event.currentTarget.contains(event.relatedTarget as Node)) return
    setDragOver(false)
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    if (isDisabled) return
    setDragOver(true)
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    if (isDisabled) return
    pickFile(event.dataTransfer.files?.[0] ?? null)
  }

  const dragProps = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    onMouseEnter: interactionHandlers.onMouseEnter,
    onMouseLeave: interactionHandlers.onMouseLeave,
  }

  const focusProps = {
    onFocus: interactionHandlers.onFocus,
    onBlur: interactionHandlers.onBlur,
  }

  return (
    <RootsFormField
      label={label}
      htmlFor={hasFile ? undefined : fieldId}
      className={className}
      hint={hint}
      error={error}
      warning={warning}
      success={success}
      invalid={invalid ?? Boolean(error)}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={isDisabled}
        aria-describedby={controlProps.describedBy}
        onChange={(event) => {
          pickFile(event.target.files?.[0] ?? null)
          event.target.value = ""
        }}
      />

      {hasFile ? (
        <div
          className={cn(isDisabled && "pointer-events-none opacity-50")}
          style={shellStyle}
          {...dragProps}
        >
          <button
            type="button"
            id={fieldId}
            disabled={isDisabled}
            aria-label={changeAriaLabel}
            className="relative cursor-pointer border-0 bg-transparent p-0"
            style={thumbStyle}
            onClick={openPicker}
            {...focusProps}
          >
            {hasPreviewImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewSrc ?? undefined}
                alt=""
                className="size-full object-cover"
              />
            ) : showDocumentThumb ? (
              <span className="flex size-full items-center justify-center">
                <DocumentIcon className="size-5 text-[var(--rootsy-bruma-500)]" aria-hidden />
              </span>
            ) : null}
            {busy ? (
              <span className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                <Loader2 className="size-5 animate-spin text-[color:var(--rootsy-bruma-600)]" aria-hidden />
              </span>
            ) : null}
          </button>

          <div className="min-w-0 flex-1">
            <p className={rootsFormImageUploadTitleClass}>
              {busy ? "Subiendo…" : previewCaption}
            </p>
            <p className={rootsFormImageUploadMetaClass}>
              {statusHint ?? emptySubtitle}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              disabled={isDisabled}
              aria-label={changeAriaLabel}
              className={rootsFormImageUploadActionClass}
              onClick={openPicker}
            >
              <ChangeIcon className="size-4" aria-hidden />
            </button>
            {onRemove ? (
              <button
                type="button"
                disabled={isDisabled}
                aria-label={removeAriaLabel}
                className={rootsFormImageUploadActionDestructiveClass}
                onClick={onRemove}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <button
          type="button"
          id={fieldId}
          disabled={isDisabled}
          aria-describedby={controlProps.describedBy}
          className={cn(
            "w-full cursor-pointer appearance-none text-left",
            isDisabled && "cursor-not-allowed opacity-50",
          )}
          style={shellStyle}
          onClick={openPicker}
          {...dragProps}
          {...focusProps}
        >
          <span style={thumbStyle}>
            {busy ? (
              <Loader2 className="size-5 animate-spin text-[color:var(--rootsy-bruma-600)]" aria-hidden />
            ) : DocumentIcon ? (
              <DocumentIcon className="size-5 text-[var(--rootsy-bruma-500)]" aria-hidden />
            ) : (
              <RootsFormImageUploadIcon className="size-5 text-[var(--rootsy-bruma-500)]" />
            )}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className={cn("block", rootsFormImageUploadTitleClass)}>
              {busy
                ? DocumentIcon
                  ? "Procesando archivo…"
                  : "Procesando imagen…"
                : emptyTitle}
            </span>
            <span className={cn("block", rootsFormImageUploadMetaClass)}>
              {emptySubtitle}
            </span>
          </span>
        </button>
      )}
    </RootsFormField>
  )
}
