"use client"

import {
  layoutsOperarCatalogEmptyMascotImageClass,
  layoutsOperarCatalogEmptyMascotShellClass,
  layoutsOperarCatalogEmptySpeechBubbleClass,
  layoutsOperarCatalogEmptySpeechHintClass,
  layoutsOperarCatalogEmptySpeechTitleClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function getSaleCatalogEmptyMascotCopy(hasSearch: boolean) {
  if (hasSearch) {
    return {
      line1: "No encontré nada.",
      line2: "¿Escaneamos otro?",
    }
  }

  return {
    line1: "No encontré nada.",
    line2: "¿Probamos otro filtro?",
  }
}

type Props = {
  hasSearch?: boolean
  line1?: string
  line2?: string
  className?: string
}

export function SaleCatalogEmptyMascot({
  hasSearch = false,
  line1,
  line2,
  className,
}: Props) {
  const copy = getSaleCatalogEmptyMascotCopy(hasSearch)
  const resolvedLine1 = line1 ?? copy.line1
  const resolvedLine2 = line2 ?? copy.line2

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(layoutsOperarCatalogEmptyMascotShellClass, className)}
    >
      <div className="relative shrink-0">
        <Image
          src="/empty-products-mascot.png"
          alt=""
          width={260}
          height={260}
          className={layoutsOperarCatalogEmptyMascotImageClass}
        />
        <div
          aria-hidden
          className={cn(
            layoutsOperarCatalogEmptySpeechBubbleClass,
            "rootsy-hero-rise rootsy-hero-rise-d2 absolute right-[54%] bottom-[58%]",
          )}
        >
          <p className={layoutsOperarCatalogEmptySpeechTitleClass}>{resolvedLine1}</p>
          <p className={layoutsOperarCatalogEmptySpeechHintClass}>{resolvedLine2}</p>
        </div>
      </div>
      <span className="sr-only">
        {resolvedLine1} {resolvedLine2}
      </span>
    </div>
  )
}
