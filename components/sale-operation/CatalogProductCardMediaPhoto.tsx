"use client"

import { LayoutsOperarProductCardMediaEmptyState } from "@/app/library/layouts/LayoutsOperarProductCardProposalPrimitives"
import { LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import type { LayoutsOperarProductCardProposalId } from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { isCatalogProductPhotoUrl } from "@/lib/catalogProductImageCache"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useEffect, useState } from "react"

type Props = {
  src: string
  proposalId?: LayoutsOperarProductCardProposalId
  sizes?: string
}

export function CatalogProductCardMediaPhoto({
  src,
  proposalId = LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL,
  sizes,
}: Props) {
  const hasPhoto = isCatalogProductPhotoUrl(src)
  const [failed, setFailed] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const showPhoto = hasPhoto && !failed

  useEffect(() => {
    setFailed(false)
    setRevealed(false)
  }, [src])

  return (
    <>
      <LayoutsOperarProductCardMediaEmptyState
        proposalId={proposalId}
        decorative={showPhoto}
        className={showPhoto ? "absolute inset-0" : undefined}
      />
      {showPhoto ? (
        <Image
          src={src}
          alt=""
          fill
          loading="eager"
          decoding="async"
          unoptimized
          sizes={sizes}
          onLoad={() => setRevealed(true)}
          onError={() => setFailed(true)}
          className={cn(
            "object-cover transition-[opacity,transform] duration-200 ease-out group-hover:scale-[1.03]",
            revealed ? "opacity-100" : "opacity-0",
          )}
        />
      ) : null}
    </>
  )
}
