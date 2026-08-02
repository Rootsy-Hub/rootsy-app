"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string | null
  title?: string
}

const dialogSurface = cn(
  "rootsy-app-light gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 text-foreground shadow-2xl ring-1 ring-black/[0.04] sm:max-w-lg",
  "max-h-[min(90vh,720px)] flex flex-col overflow-hidden",
)

export function ArticleImagePreviewDialog({
  open,
  onOpenChange,
  imageUrl,
  title = "Imagen del artículo",
}: Props) {
  const src = imageUrl?.trim() ?? ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-rootsy-light-shell="true"
        showCloseButton
        className={dialogSurface}
      >
        <DialogHeader className="shrink-0 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Vista ampliada de la imagen del artículo
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted/10 p-6">
          {src ? (
            <img
              src={src}
              alt=""
              className="max-h-[min(60vh,520px)] w-auto max-w-full rounded-xl border border-border/60 bg-white object-contain shadow-sm"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
