"use client"

import { HOME_COPY } from "@/app/home/homeCopy"
import { HomeWorkspaceBackdrop } from "@/components/layouts/HomeWorkspaceBackdrop"
import { RootsIconButton } from "@/components/rootsy-button"
import { RootsImageLightbox } from "@/components/rootsy-lightbox/RootsImageLightbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { menuRealmTitleClass } from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import "@/app/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"

type HomeUserPhotoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  imageUrl: string | null
  initials: string
}

export function HomeUserPhotoDialog({
  open,
  onOpenChange,
  name,
  imageUrl,
  initials,
}: HomeUserPhotoDialogProps) {
  const photo = imageUrl?.trim() || null

  if (photo) {
    return (
      <RootsImageLightbox
        open={open}
        onOpenChange={onOpenChange}
        src={photo}
        title={name || HOME_COPY.photoModalTitle}
        frameClassName="rounded-[34%]"
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName={cn(
          "menu-nature-shell rootsy-nature-palette overflow-hidden",
          "bg-[color-mix(in_srgb,var(--rootsy-eter-950)_78%,var(--rootsy-sombra-950)_22%)]",
        )}
        overlayChildren={<HomeWorkspaceBackdrop />}
        className={cn(
          "flex w-auto max-w-[min(92vw,26rem)] translate-x-[-50%] translate-y-[-50%] flex-col items-center gap-5 border-0 bg-transparent p-0 shadow-none",
        )}
      >
        <DialogTitle className="sr-only">{name || HOME_COPY.photoModalTitle}</DialogTitle>
        <DialogDescription className="sr-only">{HOME_COPY.photoModalTitle}</DialogDescription>

        <div
          className={cn(
            "relative size-[min(72vw,20rem)] overflow-hidden rounded-[34%]",
            "bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_70%,transparent)]",
            "shadow-[0_0_0_1px_color-mix(in_srgb,var(--rootsy-eter-100)_12%,transparent),0_24px_64px_-18px_rgb(4_5_6/0.62),0_0_48px_color-mix(in_srgb,var(--rootsy-eter-100)_10%,transparent)]",
          )}
        >
          <span
            className={cn(
              "flex size-full items-center justify-center text-5xl font-semibold sm:text-6xl",
              menuRealmTitleClass,
            )}
          >
            {initials}
          </span>
        </div>

        {name ? (
          <p className={cn("text-center text-lg sm:text-xl", menuRealmTitleClass)}>
            {name}
          </p>
        ) : null}

        <RootsIconButton
          type="button"
          label={HOME_COPY.photoModalClose}
          theme="pos"
          emphasis="ghost"
          size="default"
          onClick={() => onOpenChange(false)}
        >
          <X />
        </RootsIconButton>
      </DialogContent>
    </Dialog>
  )
}
