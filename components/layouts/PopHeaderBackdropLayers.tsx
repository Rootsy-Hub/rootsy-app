import { menuNatureShellClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import {
  popHeaderBackgroundImageClass,
  popHeaderBackgroundImageFooterClass,
} from "@/components/layouts/popHeaderBackdropStyles"
import { cn } from "@/lib/utils"

type Props = {
  backgroundImageUrl?: string | null
  /** Superficie sólida cuando no hay foto (p. ej. bosque nocturno). */
  fallbackClassName?: string
  imagePosition?: "default" | "footer"
}

export function PopHeaderBackdropLayers({
  backgroundImageUrl,
  fallbackClassName,
  imagePosition = "default",
}: Props) {
  const url = backgroundImageUrl?.trim()
  const imageClass =
    imagePosition === "footer"
      ? popHeaderBackgroundImageFooterClass
      : popHeaderBackgroundImageClass

  if (url) {
    return (
      <div className={cn("absolute inset-0", menuNatureShellClass)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className={imageClass} />
        <div className="absolute inset-0 bg-background/32" aria-hidden />
      </div>
    )
  }

  if (fallbackClassName) {
    return <div className={cn("absolute inset-0", fallbackClassName)} aria-hidden />
  }

  return null
}
