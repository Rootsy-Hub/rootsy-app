"use client"

import { ChatAvatarLightbox } from "@/app/[siteId]/[popId]/chat/ChatAvatarLightbox"
import { dataWorkspaceEntityCardIsotypeClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import { useState } from "react"

type Props = {
  title: string
  initials: string
  imageUrl?: string | null
  className?: string
}

export function ChatChannelAvatar({
  title,
  initials,
  imageUrl,
  className,
}: Props) {
  const src = imageUrl?.trim() || null
  const [open, setOpen] = useState(false)

  const tile = (
    <span
      className={cn(
        dataWorkspaceEntityCardIsotypeClass,
        "rounded-full",
        src
          ? "overflow-hidden p-0"
          : "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_10%,white)] text-[var(--rootsy-savia-800)]",
        className,
      )}
      aria-hidden
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <span className="font-canopy text-xs font-semibold">{initials}</span>
      )}
    </span>
  )

  if (!src) return tile

  return (
    <>
      <button
        type="button"
        className="shrink-0 overflow-hidden rounded-full"
        aria-label={`Ver foto de ${title}`}
        onClick={(event) => {
          event.stopPropagation()
          setOpen(true)
        }}
      >
        {tile}
      </button>
      <ChatAvatarLightbox
        open={open}
        onOpenChange={setOpen}
        src={src}
        title={title}
        frameClassName="rounded-full"
      />
    </>
  )
}
