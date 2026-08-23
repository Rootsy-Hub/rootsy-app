"use client"

import { RootsImageLightbox } from "@/components/rootsy-lightbox/RootsImageLightbox"
import { cn } from "@/lib/utils"
import { useState } from "react"

type Props = {
  src: string
  name: string
  className?: string
}

export function PopLogoLightboxButton({ src, name, className }: Props) {
  const [open, setOpen] = useState(false)
  const image = src.trim()
  if (!image) return null

  return (
    <>
      <button
        type="button"
        className={cn(
          "shrink-0 cursor-pointer overflow-hidden rounded-lg",
          "transition-opacity hover:opacity-90",
          className,
        )}
        aria-label={`Ver logo de ${name}`}
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="size-full object-cover" />
      </button>
      <RootsImageLightbox
        open={open}
        onOpenChange={setOpen}
        src={image}
        title={name}
        frameClassName="rounded-lg"
      />
    </>
  )
}
