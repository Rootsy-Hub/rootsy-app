"use client"

import { Avatar } from "@/components/Avatar"
import { RootsImageLightbox } from "@/components/rootsy-lightbox/RootsImageLightbox"
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

  const initials = name.trim().slice(0, 2).toUpperCase() || "·"

  return (
    <>
      <Avatar
        imageUrl={image}
        initials={initials}
        size="md"
        shape="square"
        tone="dark"
        ariaLabel={`Ver logo de ${name}`}
        onClick={() => setOpen(true)}
        className={className}
      />
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
