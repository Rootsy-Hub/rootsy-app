"use client"

import { uploadPopSettingsImage } from "@/app/[siteId]/[popId]/settings/actions"
import { RootsFormImageUploadField } from "@/components/rootsy-form"
import {
  compressImageFileToWebp,
  revokeCompressedWebpPreview,
} from "@/lib/compressImageToWebp"
import {
  compressImageFileToTicketPng,
  revokeCompressedTicketPngPreview,
} from "@/lib/compressImageToTicketPng"
import type { PopSettingsImageKind } from "@/lib/popImageStorage"
import { useEffect, useState } from "react"

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
  previewCaption,
}: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [compressionHint, setCompressionHint] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      revokePreview(localPreview, kind)
    }
  }, [localPreview, kind])

  const previewSrc = localPreview || value.trim() || null

  const handleRemove = () => {
    if (disabled || busy) return
    revokePreview(localPreview, kind)
    setLocalPreview(null)
    setCompressionHint(null)
    setError(null)
    onChange("")
  }

  const handleFileSelect = async (file: File) => {
    if (disabled || busy) return
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
    }
  }

  const defaultStatusHint =
    kind === "ticket-logo"
      ? "PNG blanco y negro · fondo transparente"
      : "JPG, PNG o WebP · se comprime automáticamente"

  return (
    <RootsFormImageUploadField
      id={id}
      label={label}
      hint={hint}
      error={error ?? undefined}
      previewSrc={previewSrc}
      busy={busy}
      disabled={disabled}
      emptyTitle={emptyTitle}
      emptySubtitle={emptySubtitle}
      previewCaption={previewCaption ?? label}
      statusHint={compressionHint ?? defaultStatusHint}
      onFileSelect={(file) => void handleFileSelect(file)}
      onRemove={previewSrc ? handleRemove : undefined}
    />
  )
}
