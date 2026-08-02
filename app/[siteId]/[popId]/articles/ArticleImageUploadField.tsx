"use client"

import { uploadArticleImage } from "@/app/[siteId]/[popId]/articles/actions"
import { articleFormFieldStackClass } from "@/app/[siteId]/[popId]/articles/articleConstants"
import { CheckoutSectionLabel } from "@/components/checkout/CheckoutFormFields"
import { Button } from "@/components/ui/button"
import {
  compressImageFileToWebp,
  revokeCompressedWebpPreview,
} from "@/lib/compressImageToWebp"
import { cn } from "@/lib/utils"
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

type Props = {
  id: string
  popId: string
  value: string
  onChange: (imageUrl: string) => void
  disabled?: boolean
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function ArticleImageUploadField({
  id,
  popId,
  value,
  onChange,
  disabled = false,
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
      revokeCompressedWebpPreview(localPreview)
    }
  }, [localPreview])

  const previewSrc = localPreview || value.trim() || null

  const openPicker = () => {
    if (disabled || busy) return
    inputRef.current?.click()
  }

  const handleRemove = () => {
    if (disabled || busy) return
    revokeCompressedWebpPreview(localPreview)
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
      const compressed = await compressImageFileToWebp(file)
      revokeCompressedWebpPreview(localPreview)
      setLocalPreview(compressed.previewUrl)
      setCompressionHint(
        `Optimizada a WebP · ${formatBytes(compressed.originalSize)} → ${formatBytes(compressed.compressedSize)}`,
      )

      const formData = new FormData()
      formData.append(
        "file",
        new File([compressed.blob], "article.webp", { type: "image/webp" }),
      )

      const res = await uploadArticleImage(popId, formData)
      if (!res.success) {
        setError(res.error)
        return
      }

      onChange(res.imageUrl)
      revokeCompressedWebpPreview(compressed.previewUrl)
      setLocalPreview(null)
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

  return (
    <div className={articleFormFieldStackClass}>
      <CheckoutSectionLabel>Imagen</CheckoutSectionLabel>
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
          <div className="relative aspect-[5/4] w-full overflow-hidden bg-muted/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt=""
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-80" />
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
                {busy ? "Subiendo imagen…" : "Foto del artículo"}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {compressionHint ??
                  "JPG, PNG o WebP · se comprime automáticamente"}
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
          <div className="relative flex aspect-[5/4] w-full flex-col items-center justify-center gap-3 px-5 py-6">
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
                    Agregar foto del producto
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Arrastrá una imagen o hacé clic para elegir
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-border/45">
                    <Upload className="size-3" aria-hidden />
                    JPG · PNG · WebP
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
