"use client"

import { uploadRecipeImage } from "@/lib/rootsyApi/recipesClient"
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

export function RecipeImageUploadField({
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
        new File([compressed.blob], "recipe.webp", { type: "image/webp" }),
      )

      const res = await uploadRecipeImage(popId, formData)
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
    }
  }

  return (
    <RootsFormImageUploadField
      id={id}
      label="Imagen"
      previewSrc={previewSrc}
      busy={busy}
      disabled={disabled}
      emptyTitle="Agregar foto de la receta"
      emptySubtitle="Arrastrá o hacé clic · JPG, PNG o WebP"
      previewCaption="Foto de la receta"
      statusHint={
        compressionHint ?? "JPG, PNG o WebP · se comprime automáticamente"
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
