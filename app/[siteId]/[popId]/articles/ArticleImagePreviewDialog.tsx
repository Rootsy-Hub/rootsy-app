"use client"

import { RootsImageLightbox } from "@/components/rootsy-lightbox/RootsImageLightbox"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string | null
  title?: string
}

export function ArticleImagePreviewDialog({
  open,
  onOpenChange,
  imageUrl,
  title = "Imagen del artículo",
}: Props) {
  return (
    <RootsImageLightbox
      open={open}
      onOpenChange={onOpenChange}
      src={imageUrl}
      title={title}
      frameClassName="rounded-lg bg-white"
      imageClassName="object-contain"
    />
  )
}
