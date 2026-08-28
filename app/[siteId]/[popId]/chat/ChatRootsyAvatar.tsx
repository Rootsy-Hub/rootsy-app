"use client"

import { ChatAvatarLightbox } from "@/app/[siteId]/[popId]/chat/ChatAvatarLightbox"
import { Avatar } from "@/components/Avatar"
import { useState } from "react"

const ROOTSY_AVATAR_SRC = "/logos/rootsy/rootsy-perfil.png"

type Props = {
  className?: string
  size?: "list" | "header"
}

export function ChatRootsyAvatar({ className, size = "list" }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Avatar
        imageUrl={ROOTSY_AVATAR_SRC}
        initials="R"
        size={size === "header" ? "xl" : "xl"}
        shape="circle"
        tone="light"
        className={className}
        ariaLabel="Ver foto de Rootsy"
        onClick={() => setOpen(true)}
      />
      <ChatAvatarLightbox
        open={open}
        onOpenChange={setOpen}
        src={ROOTSY_AVATAR_SRC}
        title="Rootsy"
        frameClassName="rounded-full"
        imageClassName="object-cover"
      />
    </>
  )
}
