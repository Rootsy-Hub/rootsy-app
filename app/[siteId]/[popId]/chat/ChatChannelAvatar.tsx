"use client"

import { ChatAvatarLightbox } from "@/app/[siteId]/[popId]/chat/ChatAvatarLightbox"
import { Avatar } from "@/components/Avatar"
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

  return (
    <>
      <Avatar
        imageUrl={src}
        initials={initials}
        size="xl"
        shape="circle"
        tone="light"
        className={className}
        ariaLabel={src ? `Ver foto de ${title}` : undefined}
        onClick={src ? () => setOpen(true) : undefined}
      />
      {src ? (
        <ChatAvatarLightbox
          open={open}
          onOpenChange={setOpen}
          src={src}
          title={title}
          frameClassName="rounded-full"
        />
      ) : null}
    </>
  )
}
