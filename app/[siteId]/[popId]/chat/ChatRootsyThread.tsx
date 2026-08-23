"use client"

import { ChatEmojiPicker } from "@/app/[siteId]/[popId]/chat/ChatEmojiPicker"
import { ChatRootsyAvatar } from "@/app/[siteId]/[popId]/chat/ChatRootsyAvatar"
import { sendRootsyChatMessage } from "@/app/[siteId]/[popId]/chat/chatRootsyActions"
import {
  ROOTSY_CHAT_AUTHOR_ID,
  ROOTSY_CHAT_WELCOME,
  loadRootsyChatMessages,
  rootsyHistoryFromMessages,
  saveRootsyChatMessages,
} from "@/app/[siteId]/[popId]/chat/chatRootsy"
import {
  chatStandaloneEmojiCount,
  formatChatTime,
  type ChatMessageRow,
} from "@/app/[siteId]/[popId]/chat/chatTypes"
import {
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsIconButton, RootsPrimaryButton } from "@/components/rootsy-button"
import { RootsFormControlInput } from "@/components/rootsy-form/RootsFormControlInput"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { cn } from "@/lib/utils"
import { ArrowLeft, Send } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

type Props = {
  siteId: string
  popId: string
  userName: string
  onBack: () => void
  onPreviewChange?: (body: string | null) => void
}

export function ChatRootsyThread({
  siteId,
  popId,
  userName,
  onBack,
  onPreviewChange,
}: Props) {
  const [messages, setMessages] = useState<ChatMessageRow[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const composerRef = useRef<HTMLInputElement>(null)
  const composerRangeRef = useRef({ start: 0, end: 0 })
  const sendButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const stored = loadRootsyChatMessages(popId)
    setMessages(stored)
    setHydrated(true)
  }, [popId])

  useEffect(() => {
    if (!hydrated) return
    saveRootsyChatMessages(popId, messages)
    const last = [...messages].reverse().find((row) => !row.pending)
    onPreviewChange?.(last?.body ?? null)
  }, [hydrated, messages, onPreviewChange, popId])

  const scrollToEnd = useCallback(() => {
    const list = listRef.current
    if (!list) return
    list.scrollTop = list.scrollHeight
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const frame = window.requestAnimationFrame(scrollToEnd)
    return () => window.cancelAnimationFrame(frame)
  }, [hydrated, messages.length, sending, scrollToEnd])

  useEffect(() => {
    window.requestAnimationFrame(() => {
      sendButtonRef.current?.focus()
    })
  }, [])

  const displayMessages = !hydrated
    ? []
    : messages.length === 0
      ? [ROOTSY_CHAT_WELCOME]
      : messages

  const rememberComposerRange = () => {
    const el = composerRef.current
    if (!el) return
    composerRangeRef.current = {
      start: el.selectionStart ?? draft.length,
      end: el.selectionEnd ?? draft.length,
    }
  }

  const insertEmoji = (emoji: string) => {
    const el = composerRef.current
    const start = el?.selectionStart ?? composerRangeRef.current.start
    const end = el?.selectionEnd ?? composerRangeRef.current.end
    const next = `${draft.slice(0, start)}${emoji}${draft.slice(end)}`
    const pos = start + emoji.length
    composerRangeRef.current = { start: pos, end: pos }
    setDraft(next)
    window.requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      el.setSelectionRange(pos, pos)
    })
  }

  const sendDraft = async () => {
    const body = draft.trim()
    if (!body || sending) return
    const userMessage: ChatMessageRow = {
      id: `rootsy-user:${crypto.randomUUID()}`,
      authorUserId: "me",
      authorName: userName || "Vos",
      body,
      createdAt: new Date().toISOString(),
      mine: true,
    }
    const nextMessages = [...messages, userMessage]
    setDraft("")
    setSendError(null)
    setSending(true)
    setMessages(nextMessages)

    const res = await sendRootsyChatMessage({
      siteId,
      popId,
      history: rootsyHistoryFromMessages(nextMessages),
    })

    if (!res.success) {
      setMessages(messages)
      setDraft((current) => (current.trim() ? current : body))
      setSendError(res.error)
      setSending(false)
      window.requestAnimationFrame(() => composerRef.current?.focus())
      return
    }

    setMessages([
      ...nextMessages,
      {
        id: `rootsy-ai:${crypto.randomUUID()}`,
        authorUserId: ROOTSY_CHAT_AUTHOR_ID,
        authorName: "Rootsy",
        body: res.reply,
        createdAt: new Date().toISOString(),
        mine: false,
      },
    ])
    setSending(false)
    window.requestAnimationFrame(() => composerRef.current?.focus())
  }

  return (
    <>
      <header
        className={cn(dataWorkspaceDetailCardHeaderClass, "flex items-center gap-3")}
      >
        <RootsIconButton
          theme="workspace"
          emphasis="ghost"
          size="compact"
          label="Volver a canales"
          className="lg:hidden"
          onClick={onBack}
        >
          <ArrowLeft />
        </RootsIconButton>
        <ChatRootsyAvatar size="header" />
        <div className="min-w-0 flex-1">
          <h2 className={dataWorkspaceEntityCardTitleClass}>Rootsy</h2>
          <p className="mt-0.5 truncate font-canopy text-xs text-[var(--rootsy-bruma-500)]">
            Tu compañera del bosque
          </p>
        </div>
      </header>

      <div
        ref={listRef}
        className="chat-thread-surface game-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 [overflow-anchor:none]"
      >
        {!hydrated ? (
          <div className="flex w-full justify-center py-2">
            <RootsSpinner size="sm" label="Cargando chat de Rootsy" />
          </div>
        ) : null}
        {displayMessages.map((message) => {
          const emojiCount = chatStandaloneEmojiCount(message.body)
          return (
            <article
              key={message.id}
              className={cn(
                "flex max-w-[min(28rem,92%)] flex-col gap-1",
                message.mine ? "self-end items-end" : "self-start items-start",
              )}
            >
              {!message.mine ? (
                <p className="px-1 font-canopy text-[11px] font-bold text-[var(--rootsy-savia-800)]">
                  Rootsy
                </p>
              ) : null}
              <p
                className={cn(
                  "font-canopy",
                  emojiCount === 1 && "px-1 text-[4.5rem] leading-none",
                  emojiCount === 2 &&
                    "rounded-[1.125rem] px-3 py-2 text-[3rem] leading-none",
                  emojiCount === 3 &&
                    "rounded-[1.125rem] px-3 py-2 text-[2.25rem] leading-none",
                  !emojiCount && "rounded-[1.125rem] px-3.5 py-2.5 text-sm leading-5",
                  emojiCount === 1
                    ? null
                    : message.mine
                      ? "rounded-br-md bg-[var(--rootsy-savia-600)] text-white"
                      : "rounded-bl-md border border-[var(--rootsy-bruma-200)] bg-white text-[var(--rootsy-bruma-900)]",
                )}
              >
                {message.body.trim()}
              </p>
              {message.id !== ROOTSY_CHAT_WELCOME.id ? (
                <time className="px-1 font-canopy text-[11px] text-[var(--rootsy-bruma-500)]">
                  {formatChatTime(message.createdAt)}
                </time>
              ) : null}
            </article>
          )
        })}
        {sending ? (
          <div className="flex items-center gap-2 px-1 py-1">
            <RootsSpinner size="sm" label="Rootsy está pensando" />
            <span className="font-canopy text-xs text-[var(--rootsy-bruma-500)]">
              Rootsy está pensando…
            </span>
          </div>
        ) : null}
        {sendError ? (
          <p className="font-canopy text-xs text-[var(--rootsy-danger)]">
            {sendError}
          </p>
        ) : null}
      </div>

      <form
        className="flex shrink-0 items-center gap-2 border-t border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-6"
        onSubmit={(event) => {
          event.preventDefault()
          void sendDraft()
        }}
      >
        <label className="sr-only" htmlFor="chat-rootsy-composer">
          Escribir a Rootsy
        </label>
        <RootsFormControlInput
          ref={composerRef}
          id="chat-rootsy-composer"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onSelect={rememberComposerRange}
          onBlur={rememberComposerRange}
          placeholder="Preguntale a Rootsy…"
          autoComplete="off"
          className="min-w-0 flex-1"
        />
        <ChatEmojiPicker onPick={insertEmoji} />
        <RootsPrimaryButton
          ref={sendButtonRef}
          type="submit"
          size="default"
          withIcon
          disabled={sending}
          className="h-full shrink-0 self-stretch"
        >
          <Send className="size-4" aria-hidden />
          Enviar
        </RootsPrimaryButton>
      </form>
    </>
  )
}
