"use client"

import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"

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
  const src = imageUrl?.trim() ?? ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent>
        <RootsDialogHeader
          open={open}
          title={title}
          description="Vista ampliada de la imagen del artículo"
          descriptionHidden
        />
        <RootsDialogBody className="flex items-center justify-center">
          {src ? (
            <img
              src={src}
              alt=""
              className="max-h-[min(60vh,520px)] w-auto max-w-full rounded-xl border border-[var(--rootsy-bruma-200)] bg-white object-contain"
            />
          ) : null}
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
