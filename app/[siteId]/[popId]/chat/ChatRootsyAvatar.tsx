"use client"

import { ChatAvatarLightbox } from "@/app/[siteId]/[popId]/chat/ChatAvatarLightbox"
import "@/app/[siteId]/[popId]/chat/chatRootsy.css"
import { dataWorkspaceEntityCardIsotypeClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
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
      <button
        type="button"
        className="shrink-0 overflow-hidden rounded-full"
        aria-label="Ver foto de Rootsy"
        onClick={(event) => {
          event.stopPropagation()
          setOpen(true)
        }}
      >
        <span
          className={cn(
            dataWorkspaceEntityCardIsotypeClass,
            "chat-rootsy-avatar overflow-hidden rounded-full p-0",
            size === "header" && "size-11",
            className,
          )}
          aria-hidden
        >
          <img
            src={ROOTSY_AVATAR_SRC}
            alt=""
            className="size-full object-cover"
          />
        </span>
      </button>
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
