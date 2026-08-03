"use client"

import { uploadPopSettingsImage } from "@/app/[siteId]/[popId]/settings/actions"
import { popSettingsFormFieldStackClass } from "@/app/[siteId]/[popId]/settings/popSettingsConstants"
import {
  CheckoutFieldHint,
  CheckoutSectionLabel,
} from "@/components/checkout/CheckoutFormFields"
import { Button } from "@/components/ui/button"
import {
  compressImageFileToWebp,
  revokeCompressedWebpPreview,
} from "@/lib/compressImageToWebp"
import {
  compressImageFileToTicketPng,
  revokeCompressedTicketPngPreview,
} from "@/lib/compressImageToTicketPng"
import type { PopSettingsImageKind } from "@/lib/popImageStorage"
import { cn } from "@/lib/utils"
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

type Props = {
  id: string
  popId: string
  kind: PopSettingsImageKind
  label: string
  hint?: string
  emptyTitle: string
  emptySubtitle: string
  value: string
  onChange: (imageUrl: string) => void
  disabled?: boolean
  previewAspectClass?: string
  previewObjectFit?: "cover" | "contain"
  previewCheckerboard?: boolean
  previewCaption?: string
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function revokePreview(url: string | null, kind: PopSettingsImageKind) {
  if (kind === "ticket-logo") {
    revokeCompressedTicketPngPreview(url)
  } else {
    revokeCompressedWebpPreview(url)
  }
}

export function PopSettingsImageUploadField({
  id,
  popId,
  kind,
  label,
  hint,
  emptyTitle,
  emptySubtitle,
  value,
  onChange,
  disabled = false,
  previewAspectClass = "aspect-[5/4]",
  previewObjectFit = "cover",
  previewCheckerboard = false,
  previewCaption,
}: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [compressionHint, setCompressionHint] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    return () => {
      revokePreview(localPreview, kind)
    }
  }, [localPreview, kind])

  const previewSrc = localPreview || value.trim() || null

  const openPicker = () => {
    if (disabled || busy) return
    inputRef.current?.click()
  }

  const handleRemove = () => {
    if (disabled || busy) return
    revokePreview(localPreview, kind)
    setLocalPreview(null)
    setCompressionHint(null)
    setError(null)
    onChange("")
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleFileChange = async (file: File | null) => {
    if (!file || disabled || busy) return
    setError(null)
    setCompressionHint(null)
    setBusy(true)

    try {
      if (kind === "ticket-logo") {
        const compressed = await compressImageFileToTicketPng(file)
        revokePreview(localPreview, kind)
        setLocalPreview(compressed.previewUrl)
        setCompressionHint(
          `Convertida a PNG B/N · ${formatBytes(compressed.originalSize)} → ${formatBytes(compressed.compressedSize)}`,
        )

        const formData = new FormData()
        formData.append(
          "file",
          new File([compressed.blob], "ticket-logo.png", { type: "image/png" }),
        )

        const res = await uploadPopSettingsImage(popId, kind, formData)
        if (!res.success) {
          setError(res.error)
          return
        }

        onChange(res.imageUrl)
        revokePreview(compressed.previewUrl, kind)
        setLocalPreview(null)
      } else {
        const compressed = await compressImageFileToWebp(file, {
          maxWidth: kind === "menu-background" ? 1920 : 640,
          maxHeight: kind === "menu-background" ? 1080 : 640,
          quality: kind === "menu-background" ? 0.8 : 0.85,
        })
        revokePreview(localPreview, kind)
        setLocalPreview(compressed.previewUrl)
        setCompressionHint(
          `Optimizada a WebP · ${formatBytes(compressed.originalSize)} → ${formatBytes(compressed.compressedSize)}`,
        )

        const formData = new FormData()
        formData.append(
          "file",
          new File([compressed.blob], "pop-image.webp", { type: "image/webp" }),
        )

        const res = await uploadPopSettingsImage(popId, kind, formData)
        if (!res.success) {
          setError(res.error)
          return
        }

        onChange(res.imageUrl)
        revokePreview(compressed.previewUrl, kind)
        setLocalPreview(null)
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "No se pudo procesar la imagen."
      setError(message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault()
    if (disabled || busy || previewSrc) return
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    if (event.currentTarget.contains(event.relatedTarget as Node)) return
    setDragOver(false)
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    if (disabled || busy || previewSrc) return
    setDragOver(true)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    if (disabled || busy || previewSrc) return
    const file = event.dataTransfer.files?.[0] ?? null
    void handleFileChange(file)
  }

  const previewBgClass = previewCheckerboard
    ? "bg-[linear-gradient(45deg,#e5e5e5_25%,transparent_25%,transparent_75%,#e5e5e5_75%,#e5e5e5),linear-gradient(45deg,#e5e5e5_25%,transparent_25%,transparent_75%,#e5e5e5_75%,#e5e5e5)] bg-[length:16px_16px] bg-[position:0_0,8px_8px] bg-white"
    : "bg-muted/20"

  return (
    <div className={popSettingsFormFieldStackClass}>
      <CheckoutSectionLabel>{label}</CheckoutSectionLabel>
      {hint ? <CheckoutFieldHint>{hint}</CheckoutFieldHint> : null}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif"
        className="sr-only"
        disabled={disabled || busy}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null
          void handleFileChange(file)
        }}
      />

      {previewSrc ? (
        <div
          className={cn(
            "group relative overflow-hidden rounded-xl border border-border/55 bg-muted/10",
            disabled && "opacity-60",
          )}
        >
          <div
            className={cn(
              "relative w-full overflow-hidden",
              previewAspectClass,
              previewBgClass,
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt=""
              className={cn(
                "size-full transition-transform duration-300 group-hover:scale-[1.02]",
                previewObjectFit === "contain" ? "object-contain p-4" : "object-cover",
              )}
            />
            {!previewCheckerboard ? (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-80" />
            ) : null}
            {busy ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-[2px]">
                <Loader2
                  className="size-7 animate-spin text-foreground"
                  aria-hidden
                />
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-muted/15 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {busy ? "Subiendo imagen…" : previewCaption ?? label}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {compressionHint ??
                  (kind === "ticket-logo"
                    ? "PNG blanco y negro · fondo transparente"
                    : "JPG, PNG o WebP · se comprime automáticamente")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || busy}
                onClick={openPicker}
              >
                Cambiar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || busy}
                onClick={handleRemove}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-3.5" aria-hidden />
                Quitar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          id={id}
          disabled={disabled || busy}
          onClick={openPicker}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "group relative w-full overflow-hidden rounded-xl border-2 border-dashed text-left transition-[border-color,background-color,box-shadow] duration-200",
            dragOver
              ? "border-primary/55 bg-primary/[0.06] shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.12)]"
              : "border-border/55 bg-muted/10 hover:border-primary/35 hover:bg-primary/[0.03]",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <div
            className={cn(
              "relative flex w-full flex-col items-center justify-center gap-3 px-5 py-6",
              previewAspectClass,
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.2]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, hsl(var(--border)) 0.7px, transparent 0.7px)",
                backgroundSize: "14px 14px",
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,hsl(var(--muted)/0.45)_0%,transparent_48%,hsl(var(--muted)/0.22)_100%)]" />

            {busy ? (
              <Loader2
                className="relative size-8 animate-spin text-muted-foreground"
                aria-hidden
              />
            ) : (
              <>
                <div className="relative flex size-14 items-center justify-center rounded-2xl bg-background/90 text-primary/75 shadow-sm ring-1 ring-border/45 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-md">
                  <ImagePlus className="size-6" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="relative max-w-[15rem] text-center">
                  <p className="text-sm font-semibold tracking-tight text-foreground">
                    {emptyTitle}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {emptySubtitle}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-border/45">
                    <Upload className="size-3" aria-hidden />
                    {kind === "ticket-logo" ? "PNG · B/N" : "JPG · PNG · WebP"}
                  </p>
                </div>
              </>
            )}
          </div>
        </button>
      )}

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
