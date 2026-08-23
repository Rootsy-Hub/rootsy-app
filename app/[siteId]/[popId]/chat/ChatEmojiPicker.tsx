"use client"

import { RootsIconButton } from "@/components/rootsy-button"
import { RootsSpinner } from "@/components/rootsy-spinner"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SmilePlus } from "lucide-react"
import dynamic from "next/dynamic"
import { useState } from "react"
import "./chatEmojiPicker.css"

function ChatEmojiPickerLoading() {
  return (
    <div className="flex h-[380px] w-[320px] items-center justify-center bg-white">
      <RootsSpinner size="sm" label="Cargando emojis" />
    </div>
  )
}

const ChatEmojiPickerPanel = dynamic(
  () => import("./ChatEmojiPickerPanel"),
  {
    ssr: false,
    loading: () => <ChatEmojiPickerLoading />,
  },
)

type Props = {
  onPick: (emoji: string) => void
}

export function ChatEmojiPicker({ onPick }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <RootsIconButton
          type="button"
          theme="workspace"
          emphasis="ghost"
          size="compact"
          label="Emojis"
        >
          <SmilePlus />
        </RootsIconButton>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={8}
        className="chat-emoji-picker w-auto overflow-hidden rounded-xl border border-[var(--rootsy-bruma-200)] bg-white p-0 text-[var(--rootsy-bruma-900)] shadow-lg"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onFocusOutside={(event) => event.preventDefault()}
      >
        {open ? <ChatEmojiPickerPanel onPick={onPick} /> : null}
      </PopoverContent>
    </Popover>
  )
}
