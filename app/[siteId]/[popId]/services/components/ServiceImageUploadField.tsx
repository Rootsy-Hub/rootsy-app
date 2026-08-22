"use client"

import { uploadServiceImage } from "@/lib/rootsyApi/servicesClient"
import { RootsFormImageUploadField } from "@/components/rootsy-form/RootsFormImageUploadField"
import {
  compressImageFileToWebp,
  revokeCompressedWebpPreview,
} from "@/lib/compressImageToWebp"
import { useEffect, useState } from "react"

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

export function ServiceImageUploadField({
  id,
  popId,
  value,
  onChange,
  disabled = false,
}: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [compressionHint, setCompressionHint] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      revokeCompressedWebpPreview(localPreview)
    }
  }, [localPreview])

  const previewSrc = localPreview || value.trim() || null

  const handleRemove = () => {
    if (disabled || busy) return
    revokeCompressedWebpPreview(localPreview)
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
      const compressed = await compressImageFileToWebp(file)
      revokeCompressedWebpPreview(localPreview)
      setLocalPreview(compressed.previewUrl)
      setCompressionHint(
        `WebP · ${formatBytes(compressed.originalSize)} → ${formatBytes(compressed.compressedSize)}`,
      )

      const formData = new FormData()
      formData.append(
        "file",
        new File([compressed.blob], "service.webp", { type: "image/webp" }),
      )

      const res = await uploadServiceImage(popId, formData)
      if (!res.success) {
        setError(res.error)
        return
      }

      onChange(res.imageUrl)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <RootsFormImageUploadField
      id={id}
      label="Imagen"
      previewSrc={previewSrc}
      busy={busy}
      disabled={disabled}
      emptyTitle="Agregar imagen del servicio"
      emptySubtitle="Arrastrá o hacé clic · JPG, PNG o WebP"
      previewCaption="Imagen del servicio"
      statusHint={
        compressionHint ?? "Opcional — se muestra en el catálogo de servicios."
      }
      onFileSelect={(file) => {
        void handleFileSelect(file)
      }}
      onRemove={handleRemove}
      error={error ?? undefined}
      invalid={Boolean(error)}
    />
  )
}
