"use client"

import { ChatBubble } from "@/app/[siteId]/[popId]/chat/ChatBubble"
import { ChatEmojiPicker } from "@/app/[siteId]/[popId]/chat/ChatEmojiPicker"
import "@/app/[siteId]/[popId]/chat/chatRootsy.css"
import { ChatRootsyAvatar } from "@/app/[siteId]/[popId]/chat/ChatRootsyAvatar"
import { ChatRootsyDevTraceCard } from "@/app/[siteId]/[popId]/chat/ChatRootsyDevTraceCard"
import { ChatRootsyOperationCard } from "@/app/[siteId]/[popId]/chat/ChatRootsyOperationCard"
import {
  continueRootsyPlannerRun,
  runRootsyChatTools,
  sendRootsyChatMessage,
} from "@/app/[siteId]/[popId]/chat/chatRootsyActions"
import { chatRootsyOfferKey } from "@/lib/chat/chatRootsyPlannerStep"
import {
  ROOTSY_CHAT_AUTHOR_ID,
  ROOTSY_CHAT_WELCOME,
  ROOTSY_SESSION_HISTORY_MAX,
  loadRootsyChatMessages,
  rootsyHistoryFromMessages,
  rootsyToolContextFromMessages,
  saveRootsyChatMessages,
} from "@/app/[siteId]/[popId]/chat/chatRootsy"
import {
  chatBubbleClusterFlags,
  type ChatMessageRow,
} from "@/app/[siteId]/[popId]/chat/chatTypes"
import {
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsIconButton, RootsPrimaryButton } from "@/components/rootsy-button"
import { RootsFormControlInput } from "@/components/rootsy-form/RootsFormControlInput"
import { RootsSpinner } from "@/components/rootsy-spinner"
import {
  isChatRootsyDevTraceEnabled,
  mergeChatRootsyDevTraces,
} from "@/lib/chat/chatRootsyDevTrace"
import {
  deriveChatRootsyOperations,
  isChatRootsyOperationShell,
  type ChatRootsyOperationLive,
} from "@/lib/chat/chatRootsyOperation"
import { collectChatRootsyAppliedActions } from "@/lib/chat/chatRootsySessionActions"
import { cn } from "@/lib/utils"
import { ArrowLeft, Send } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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
  const [live, setLive] = useState<ChatRootsyOperationLive>({
    sending: false,
    mode: "idle",
  })
  const listRef = useRef<HTMLDivElement | null>(null)
  const composerRef = useRef<HTMLInputElement>(null)
  const composerRangeRef = useRef({ start: 0, end: 0 })
  const sendButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const stored = loadRootsyChatMessages(popId)
    const showDev = isChatRootsyDevTraceEnabled()
    setMessages(
      showDev
        ? stored
        : stored.map((row) =>
            row.devTrace ? { ...row, devTrace: undefined } : row,
          ),
    )
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

  const operations = useMemo(
    () =>
      deriveChatRootsyOperations(displayMessages, {
        ...live,
        sending,
        error: sendError,
      }),
    [displayMessages, live, sendError, sending],
  )
  const operationByAnchor = useMemo(
    () => new Map(operations.map((item) => [item.anchorMessageId, item])),
    [operations],
  )
  const hiddenIds = useMemo(() => {
    const ids = new Set<string>()
    for (const row of displayMessages) {
      if (isChatRootsyOperationShell(row)) ids.add(row.id)
    }
    return ids
  }, [displayMessages])
  const liveOperation = operations.some((item) =>
    ["understanding", "preparing", "waiting", "executing"].includes(item.phase),
  )
  const tracesByOperation = useMemo(() => {
    const map = new Map<string, ReturnType<typeof mergeChatRootsyDevTraces>>()
    for (const operation of operations) {
      map.set(
        operation.id,
        mergeChatRootsyDevTraces(
          operation.memberIds.map(
            (id) => displayMessages.find((row) => row.id === id)?.devTrace,
          ),
        ),
      )
    }
    return map
  }, [displayMessages, operations])
  const ownedTraceIds = useMemo(() => {
    const ids = new Set<string>()
    for (const operation of operations) {
      if (!tracesByOperation.get(operation.id)) continue
      for (const id of operation.memberIds) ids.add(id)
    }
    return ids
  }, [operations, tracesByOperation])

  const bubbleMessages = useMemo(
    () =>
      displayMessages.filter((message) => {
        const operation = operationByAnchor.get(message.id)
        if (hiddenIds.has(message.id) && !operation) return false
        return message.body.trim().length > 0
      }),
    [displayMessages, hiddenIds, operationByAnchor],
  )
  const bubbleIndexById = useMemo(
    () => new Map(bubbleMessages.map((message, index) => [message.id, index])),
    [bubbleMessages],
  )

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
    const nextMessages = [...messages, userMessage].slice(
      -ROOTSY_SESSION_HISTORY_MAX,
    )
    setDraft("")
    setSendError(null)
    setSending(true)
    setLive({ sending: true, mode: "understand", hostId: userMessage.id })
    setMessages(nextMessages)

    const res = await sendRootsyChatMessage({
      siteId,
      popId,
      history: rootsyHistoryFromMessages(nextMessages),
      toolContext: rootsyToolContextFromMessages(nextMessages),
      appliedActions: collectChatRootsyAppliedActions(nextMessages),
    })

    if (!res.success) {
      setDraft((current) => (current.trim() ? current : body))
      setSendError(
        isChatRootsyDevTraceEnabled() && res.devTrace?.error
          ? res.devTrace.error
          : res.error,
      )
      setMessages(
        [
          ...nextMessages,
          {
            id: `rootsy-dev:${crypto.randomUUID()}`,
            authorUserId: ROOTSY_CHAT_AUTHOR_ID,
            authorName: "Rootsy",
            body: res.error,
            createdAt: new Date().toISOString(),
            mine: false,
            devTrace: res.devTrace,
          },
        ].slice(-ROOTSY_SESSION_HISTORY_MAX),
      )
      setSending(false)
      setLive({ sending: false, mode: "idle" })
      window.requestAnimationFrame(() => composerRef.current?.focus())
      return
    }

    setMessages(
      [
        ...nextMessages,
        {
          id: `rootsy-ai:${crypto.randomUUID()}`,
          authorUserId: ROOTSY_CHAT_AUTHOR_ID,
          authorName: "Rootsy",
          body: res.reply,
          createdAt: new Date().toISOString(),
          mine: false,
          toolOffer: res.toolOffer,
          toolOffers: res.toolOffers,
          plannerRun: res.plannerRun,
          plannerChoices: res.plannerChoices,
          closeBrief: res.closeBrief,
          devTrace: res.devTrace,
        },
      ].slice(-ROOTSY_SESSION_HISTORY_MAX),
    )
    setSending(false)
    setLive({ sending: false, mode: "idle" })
    window.requestAnimationFrame(() => composerRef.current?.focus())
  }

  const confirmTools = async (messageId: string, tools: string[]) => {
    if (sending || tools.length === 0) return
    const host = messages.find((row) => row.id === messageId)
    const offers = host?.toolOffers?.length
      ? host.toolOffers
      : host?.toolOffer
        ? [host.toolOffer]
        : []
    const selected = new Set(tools)
    setSendError(null)
    setSending(true)
    setLive({ sending: true, mode: "execute", hostId: messageId })
    setMessages((current) =>
      current.map((row) => {
        if (row.id !== messageId) return row
        return {
          ...row,
          toolOffer:
            row.toolOffer && selected.has(chatRootsyOfferKey(row.toolOffer))
              ? { ...row.toolOffer, status: "used" as const }
              : row.toolOffer,
          toolOffers: row.toolOffers?.map((item) =>
            selected.has(chatRootsyOfferKey(item))
              ? { ...item, status: "used" as const }
              : item,
          ),
        }
      }),
    )

    const res = await runRootsyChatTools({
      siteId,
      popId,
      history: rootsyHistoryFromMessages(messages),
      recent: rootsyToolContextFromMessages(messages).recent,
      plannerRun: host?.plannerRun,
      queries: tools.map((key) => {
        const offer = offers.find((row) => chatRootsyOfferKey(row) === key)
        return {
          tool: offer?.tool ?? key,
          filters: offer?.filters,
          method: offer?.method,
          path: offer?.path,
          body: offer?.body,
          action: offer?.action ?? offer?.label,
          confirm: offer?.confirm,
          offerKey: offer?.offerKey ?? key,
        }
      }),
    })

    if (!res.success) {
      setSendError(
        isChatRootsyDevTraceEnabled() && res.devTrace?.error
          ? res.devTrace.error
          : res.error,
      )
      setMessages((current) => {
        const restored = current.map((row) => {
          if (row.id !== messageId) return row
          return {
            ...row,
            toolOffer: undefined,
            toolOffers: undefined,
          }
        })
        if (!res.devTrace) return restored
        return [
          ...restored,
          {
            id: `rootsy-dev:${crypto.randomUUID()}`,
            authorUserId: ROOTSY_CHAT_AUTHOR_ID,
            authorName: "Rootsy",
            body: res.error,
            createdAt: new Date().toISOString(),
            mine: false,
            devTrace: res.devTrace,
          },
        ].slice(-ROOTSY_SESSION_HISTORY_MAX)
      })
      setSending(false)
      setLive({ sending: false, mode: "idle", hostId: messageId, error: res.error })
      return
    }

    const now = new Date().toISOString()
    const followUp =
      res.reply.trim() ||
      res.toolOffers?.length ||
      res.plannerChoices?.length ||
      res.devTrace
        ? {
            id: `rootsy-ai:${crypto.randomUUID()}`,
            authorUserId: ROOTSY_CHAT_AUTHOR_ID,
            authorName: "Rootsy",
            body: res.reply,
            createdAt: now,
            mine: false,
            toolOffer: res.toolOffers?.[0],
            toolOffers: res.toolOffers,
            plannerRun: res.plannerRun,
            plannerChoices: res.plannerChoices,
            closeBrief: res.closeBrief,
            devTrace: res.devTrace,
          }
        : null
    setMessages((current) =>
      [
        ...current,
        ...res.toolResults.map((toolResult) => ({
          id: `rootsy-tool:${crypto.randomUUID()}`,
          authorUserId: ROOTSY_CHAT_AUTHOR_ID,
          authorName: "Rootsy",
          body: `${toolResult.title?.trim() || toolResult.tool} · ${toolResult.periodLabel}`,
          createdAt: now,
          mine: false,
          toolResult,
        })),
        ...(followUp ? [followUp] : []),
      ].slice(-ROOTSY_SESSION_HISTORY_MAX),
    )
    setSending(false)
    setLive({ sending: false, mode: "idle" })
    window.requestAnimationFrame(() => composerRef.current?.focus())
  }

  const cancelPlanner = (messageId: string) => {
    setMessages((current) =>
      current.map((row) => {
        if (row.id !== messageId) return row
        return {
          ...row,
          toolOffer: undefined,
          toolOffers: undefined,
          plannerChoices: undefined,
        }
      }),
    )
  }

  const pickPlannerChoice = async (
    messageId: string,
    choiceTool: string,
    item: { id?: string; name: string; sales?: number; balance?: number },
  ) => {
    if (sending) return
    const host = messages.find((row) => row.id === messageId)
    const choice = host?.plannerChoices?.find((row) => row.tool === choiceTool)
    if (!host?.plannerRun || !choice) return
    setSendError(null)
    setSending(true)
    setLive({ sending: true, mode: "choose", hostId: messageId })
    setMessages((current) =>
      current.map((row) => {
        if (row.id !== messageId) return row
        return { ...row, plannerChoices: undefined }
      }),
    )

    const res = await continueRootsyPlannerRun({
      siteId,
      popId,
      plannerRun: host.plannerRun,
      choice,
      item,
    })

    if (!res.success) {
      setSendError(
        isChatRootsyDevTraceEnabled() && res.devTrace?.error
          ? res.devTrace.error
          : res.error,
      )
      setMessages((current) =>
        current.map((row) => {
          if (row.id !== messageId) return row
          return { ...row, plannerChoices: host.plannerChoices }
        }),
      )
      setSending(false)
      setLive({ sending: false, mode: "idle", hostId: messageId, error: res.error })
      return
    }

    setMessages((current) =>
      [
        ...current,
        {
          id: `rootsy-ai:${crypto.randomUUID()}`,
          authorUserId: ROOTSY_CHAT_AUTHOR_ID,
          authorName: "Rootsy",
          body: res.reply,
          createdAt: new Date().toISOString(),
          mine: false,
          toolOffer: res.toolOffer,
          toolOffers: res.toolOffers,
          plannerRun: res.plannerRun,
          plannerChoices: res.plannerChoices,
          devTrace: res.devTrace,
        },
      ].slice(-ROOTSY_SESSION_HISTORY_MAX),
    )
    setSending(false)
    setLive({ sending: false, mode: "idle" })
    window.requestAnimationFrame(() => composerRef.current?.focus())
  }

  return (
    <div className="chat-rootsy-thread-surface relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <header
        className={cn(
          dataWorkspaceDetailCardHeaderClass,
          "chat-rootsy-thread-chrome flex items-center gap-3",
        )}
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
            {isChatRootsyDevTraceEnabled()
              ? "DEV · historial de Rootsy y el Planificador"
              : "Tu compañera del bosque"}
          </p>
        </div>
      </header>

      <div
        ref={listRef}
        className="game-scroll flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overscroll-contain bg-transparent px-4 py-4 sm:px-6 [overflow-anchor:none]"
      >
        {!hydrated ? (
          <div className="flex w-full justify-center py-2">
            <RootsSpinner size="sm" label="Cargando chat de Rootsy" />
          </div>
        ) : null}
        {displayMessages.map((message) => {
          const operation = operationByAnchor.get(message.id)
          if (hiddenIds.has(message.id) && !operation) {
            if (ownedTraceIds.has(message.id)) return null
            return isChatRootsyDevTraceEnabled() && message.devTrace ? (
              <ChatRootsyDevTraceCard key={message.id} trace={message.devTrace} />
            ) : null
          }
          const bubbleIndex = bubbleIndexById.get(message.id)
          const cluster =
            bubbleIndex != null
              ? chatBubbleClusterFlags(bubbleMessages, bubbleIndex)
              : { firstInCluster: true, lastInCluster: true }
          const clusterClass =
            bubbleIndex === 0
              ? "mt-0"
              : cluster.firstInCluster
                ? "mt-3"
                : "mt-0.5"
          const hasBody = Boolean(message.body.trim())
          return (
            <div
              key={message.id}
              className={cn(
                "flex flex-col gap-1",
                clusterClass,
                operation
                  ? "w-full max-w-[min(36rem,96%)] self-start items-start"
                  : isChatRootsyDevTraceEnabled() && message.devTrace
                    ? "max-w-[min(36rem,96%)] self-start items-start"
                    : null,
                message.mine ? "self-end items-end" : !operation && "self-start items-start",
              )}
            >
              {hasBody ? (
                <ChatBubble
                  variant="direct"
                  mine={message.mine}
                  body={message.body}
                  authorName={message.authorName}
                  authorUserId={message.authorUserId}
                  createdAt={message.createdAt}
                  firstInCluster={cluster.firstInCluster}
                  lastInCluster={cluster.lastInCluster}
                  tail={cluster.lastInCluster && !operation}
                  hideTime={message.id === ROOTSY_CHAT_WELCOME.id}
                  timeClassName="chat-rootsy-thread-caption text-rootsy-bruma-700"
                />
              ) : null}
              {operation ? (
                <div className="w-full">
                  <ChatRootsyOperationCard
                    operation={operation}
                    disabled={sending}
                    onApprove={(hostId, keys) => {
                      void confirmTools(hostId, keys)
                    }}
                    onReject={(hostId) => cancelPlanner(hostId)}
                    onPick={(hostId, choiceTool, item) => {
                      void pickPlannerChoice(hostId, choiceTool, item)
                    }}
                  />
                  {isChatRootsyDevTraceEnabled() &&
                  tracesByOperation.get(operation.id) ? (
                    <ChatRootsyDevTraceCard
                      trace={tracesByOperation.get(operation.id)!}
                    />
                  ) : null}
                </div>
              ) : null}
              {isChatRootsyDevTraceEnabled() &&
              message.devTrace &&
              !ownedTraceIds.has(message.id) ? (
                <ChatRootsyDevTraceCard trace={message.devTrace} />
              ) : null}
            </div>
          )
        })}
        {sending && !liveOperation ? (
          <div className="mt-3 flex items-center gap-2 px-1 py-1">
            <RootsSpinner size="sm" label="Rootsy está pensando" />
            <span className="chat-rootsy-thread-caption font-canopy text-xs text-rootsy-bruma-700">
              Rootsy está pensando…
            </span>
          </div>
        ) : null}
        {sendError && !operations.some((item) => item.error) ? (
          <p className="font-canopy text-xs text-rootsy-danger">
            {sendError}
          </p>
        ) : null}
      </div>

      <form
        className="chat-rootsy-thread-chrome flex shrink-0 items-center gap-2 border-t border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-6"
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
    </div>
  )
}
