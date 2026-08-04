"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps } from "@/components/rootsy-form/rootsFormFieldContext"
import { rootsFormEarthPrefixTextClass } from "@/components/rootsy-form/rootsFormEarthTokens"
import {
  rootsFormImageUploadActionClass,
  rootsFormImageUploadActionDestructiveClass,
  rootsFormImageUploadMetaClass,
  rootsFormImageUploadShellClass,
  rootsFormImageUploadShellDragClass,
  rootsFormImageUploadShellEmptyClass,
  rootsFormImageUploadThumbClass,
  rootsFormImageUploadThumbEmptyClass,
  rootsFormImageUploadTitleClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"
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
  onFileSelect: (file: File) => void
  onRemove?: () => void
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
  const [dragOver, setDragOver] = useState(false)

  const hasPreview = Boolean(previewSrc?.trim())
  const isDisabled = disabled || busy

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
  }

  const dragClass = dragOver ? rootsFormImageUploadShellDragClass : undefined

  return (
    <RootsFormField
      label={label}
      htmlFor={hasPreview ? undefined : fieldId}
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

      {hasPreview ? (
        <div
          className={cn(
            rootsFormImageUploadShellClass,
            dragClass,
            isDisabled && "pointer-events-none opacity-50",
          )}
          {...dragProps}
        >
          <button
            type="button"
            id={fieldId}
            disabled={isDisabled}
            aria-label="Cambiar imagen"
            className={cn(rootsFormImageUploadThumbClass, "cursor-pointer p-0")}
            onClick={openPicker}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc ?? undefined}
              alt=""
              className="size-full object-cover"
            />
            {busy ? (
              <span className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                <Loader2 className="size-5 animate-spin text-[#57534e]" aria-hidden />
              </span>
            ) : null}
          </button>

          <div className="min-w-0 flex-1">
            <p className={rootsFormImageUploadTitleClass}>
              {busy ? "Subiendo imagen…" : previewCaption}
            </p>
            <p className={rootsFormImageUploadMetaClass}>
              {statusHint ?? emptySubtitle}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              disabled={isDisabled}
              aria-label="Cambiar imagen"
              className={rootsFormImageUploadActionClass}
              onClick={openPicker}
            >
              <ImagePlus className="size-4" aria-hidden />
            </button>
            {onRemove ? (
              <button
                type="button"
                disabled={isDisabled}
                aria-label="Quitar imagen"
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
            rootsFormImageUploadShellEmptyClass,
            dragClass,
            isDisabled && "cursor-not-allowed opacity-50",
          )}
          onClick={openPicker}
          {...dragProps}
        >
          <span className={rootsFormImageUploadThumbEmptyClass}>
            {busy ? (
              <Loader2 className="size-5 animate-spin text-[#57534e]" aria-hidden />
            ) : (
              <ImagePlus
                className={cn("size-5", rootsFormEarthPrefixTextClass)}
                strokeWidth={1.75}
                aria-hidden
              />
            )}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className={cn("block", rootsFormImageUploadTitleClass)}>
              {busy ? "Procesando imagen…" : emptyTitle}
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
