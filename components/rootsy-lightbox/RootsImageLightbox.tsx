"use client"

import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import * as DialogPrimitive from "@radix-ui/react-dialog"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string | null | undefined
  title: string
  frameClassName?: string
  imageClassName?: string
}

export function RootsImageLightbox({
  open,
  onOpenChange,
  src,
  title,
  frameClassName,
  imageClassName,
}: Props) {
  const image = src?.trim() ?? ""
  if (!image) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="overflow-hidden bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_42%,transparent)] backdrop-blur-[28px]">
          <span
            aria-hidden
            className="absolute inset-[-12%] bg-cover bg-center opacity-40 blur-3xl saturate-[0.8]"
            style={{ backgroundImage: `url(${image})` }}
          />
        </DialogOverlay>
        <DialogPrimitive.Content
          className="fixed inset-0 z-[510] flex items-center justify-center border-0 bg-transparent p-6 shadow-none outline-none"
          onClick={() => onOpenChange(false)}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
          <div
            className={cn(
              "size-[min(72vh,22rem)] overflow-hidden rounded-xl shadow-[0_24px_64px_rgba(8,12,11,0.45)]",
              frameClassName,
            )}
            onClick={(event) => event.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={title}
              className={cn("size-full object-cover", imageClassName)}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
