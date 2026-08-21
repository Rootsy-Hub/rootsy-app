"use client"

import { HOME_COPY } from "@/app/home/homeCopy"
import {
  homeHarmonyWashClass,
  homeVignetteClass,
  menuAmbientTopGlowClass,
  menuPlanetOrbClass,
} from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import { RootsIconButton } from "@/components/rootsy-button"
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
import "@/app/home/homeHarmony.css"

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName={cn(
          "menu-nature-shell rootsy-nature-palette overflow-hidden",
          "bg-[color-mix(in_srgb,var(--rootsy-eter-950)_78%,var(--rootsy-sombra-950)_22%)]",
        )}
        overlayChildren={<HomePhotoFirmament />}
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
            "shadow-[0_0_0_1px_color-mix(in_srgb,#ffffff_10%,transparent),0_24px_64px_-18px_rgb(5_8_7/0.55),0_0_48px_color-mix(in_srgb,var(--rootsy-savia-600)_16%,transparent)]",
          )}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <span
              className={cn(
                "flex size-full items-center justify-center text-5xl font-semibold sm:text-6xl",
                menuRealmTitleClass,
              )}
            >
              {initials}
            </span>
          )}
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

function HomePhotoFirmament() {
  const orbs = [
    { section: "operar" as const, left: "28%", top: "48%" },
    { section: "administrar" as const, left: "50%", top: "40%" },
    { section: "configurar" as const, left: "72%", top: "48%" },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className={cn(
          "absolute inset-0 opacity-80",
          homeHarmonyWashClass,
          "home-constellation-wash",
        )}
      />
      {orbs.map((orb) => (
        <div
          key={orb.section}
          className={cn(
            "home-firmament-orb absolute rounded-full blur-[140px]",
            menuPlanetOrbClass(orb.section),
          )}
          style={{
            width: 420,
            height: 420,
            left: orb.left,
            top: orb.top,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      <div
        className={cn(
          "absolute top-0 left-1/2 h-80 w-[56.25rem] -translate-x-1/2 rounded-full blur-[110px]",
          menuAmbientTopGlowClass,
        )}
      />
      <div className={cn("absolute inset-0", homeVignetteClass)} />
    </div>
  )
}
