"use client"

import { ChatBubble } from "@/app/[siteId]/[popId]/chat/ChatBubble"
import { ChatEmojiPicker } from "@/app/[siteId]/[popId]/chat/ChatEmojiPicker"
import "@/app/[siteId]/[popId]/chat/chatRootsy.css"
import { ChatRootsyAvatar } from "@/app/[siteId]/[popId]/chat/ChatRootsyAvatar"
import { ChatRootsyDevTraceCard } from "@/app/[siteId]/[popId]/chat/ChatRootsyDevTraceCard"
import { ChatRootsyOperationCard } from "@/app/[siteId]/[popId]/chat/ChatRootsyOperationCard"
import { ChatRootsyThinkingHalo } from "@/app/[siteId]/[popId]/chat/ChatRootsyThinkingHalo"
import {
  continueRootsyPlannerRun,
  runRootsyChatTools,
  sendRootsyChatMessage,
  startRootsyPlannerRun,
  type SendRootsyChatResult,
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
  type ChatRootsyToolResult,
} from "@/app/[siteId]/[popId]/chat/chatTypes"
import {
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsIconButton, RootsPrimaryButton } from "@/components/rootsy-button"
import { RootsFormControlInput } from "@/components/rootsy-form/RootsFormControlInput"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { humanizeChatRootsyApiError } from "@/lib/chat/chatRootsyApiError"
import {
  isChatRootsyDevTraceEnabled,
  mergeChatRootsyDevTraces,
} from "@/lib/chat/chatRootsyDevTrace"
import {
  deriveChatRootsyOperations,
  chatRootsyOffersAutoExecute,
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
  threadVisible?: boolean
}

function rootsyToolResultRows(
  toolResults: ChatRootsyToolResult[],
  now: string,
): ChatMessageRow[] {
  return toolResults.map((toolResult) => ({
    id: `rootsy-tool:${crypto.randomUUID()}`,
    authorUserId: ROOTSY_CHAT_AUTHOR_ID,
    authorName: "Rootsy",
    body: `${toolResult.title?.trim() || toolResult.tool} · ${toolResult.periodLabel}`,
    createdAt: now,
    mine: false,
    toolResult,
  }))
}

function rootsyFollowUpRow(
  res: Extract<SendRootsyChatResult, { success: true }>,
  now: string,
  body: string,
): ChatMessageRow | null {
  const text = body.trim()
  if (
    !text &&
    !res.toolOffers?.length &&
    !res.plannerChoices?.length &&
    !res.closeBrief &&
    !res.devTrace
  ) {
    return null
  }
  return {
    id: `rootsy-ai:${crypto.randomUUID()}`,
    authorUserId: ROOTSY_CHAT_AUTHOR_ID,
    authorName: "Rootsy",
    body: text,
    createdAt: now,
    mine: false,
    toolOffer: res.toolOffers?.[0],
    toolOffers: res.toolOffers,
    plannerRun: res.plannerRun,
    plannerChoices: res.plannerChoices,
    closeBrief: res.closeBrief,
    devTrace: res.devTrace,
  }
}

export function ChatRootsyThread({
  siteId,
  popId,
  userName,
  onBack,
  onPreviewChange,
  threadVisible = true,
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
  const messagesRef = useRef<ChatMessageRow[]>([])
  const skipThreadMotionRef = useRef(true)
  const confirmReadsRef = useRef<
    (hostId: string, keys: string[]) => void | Promise<void>
  >(() => {})
  const autoReadKeyRef = useRef("")
  const [threadMotion, setThreadMotion] = useState<"idle" | "rise" | "settle">(
    "idle",
  )
  const [haloExiting, setHaloExiting] = useState(false)
  const [arriveId, setArriveId] = useState<string | null>(null)

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

  messagesRef.current = messages

  const scrollToEnd = useCallback((smooth = false) => {
    const list = listRef.current
    if (!list) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (smooth && !reduce) {
      list.scrollTo({ top: list.scrollHeight, behavior: "smooth" })
      return
    }
    list.scrollTop = list.scrollHeight
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const frame = window.requestAnimationFrame(() =>
      scrollToEnd(sending || live.sending),
    )
    return () => window.cancelAnimationFrame(frame)
  }, [hydrated, messages.length, sending, live.sending, scrollToEnd])

  useEffect(() => {
    if (skipThreadMotionRef.current) {
      skipThreadMotionRef.current = false
      return
    }
    if (sending) {
      setHaloExiting(false)
      setThreadMotion("rise")
      setArriveId(null)
      return
    }
    const last = [...messagesRef.current]
      .reverse()
      .find(
        (row) =>
          !row.mine &&
          row.body.trim() &&
          !row.toolResult &&
          row.id !== ROOTSY_CHAT_WELCOME.id,
      )
    setThreadMotion((current) => (current === "rise" ? "settle" : current))
    setArriveId(last?.id ?? null)
    setHaloExiting(true)
    const settleTimer = window.setTimeout(() => {
      setThreadMotion("idle")
      setHaloExiting(false)
      setArriveId(null)
    }, 720)
    return () => window.clearTimeout(settleTimer)
  }, [sending])

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)").matches
    if (!desktop && !threadVisible) return
    const frame = window.requestAnimationFrame(() => {
      composerRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [threadVisible])

  const displayMessages = !hydrated
    ? []
    : messages.length === 0
      ? [ROOTSY_CHAT_WELCOME]
      : messages

  const operations = useMemo(
    () =>
      deriveChatRootsyOperations(displayMessages, {
        ...live,
        sending: sending || live.sending,
        error: sendError,
      }),
    [displayMessages, live, sendError, sending],
  )
  const busy = sending || live.sending

  useEffect(() => {
    if (sending) return
    const operation = operations.find(
      (item) =>
        item.pendingHostId &&
        item.pendingOffers.length > 0 &&
        item.pendingChoices.length === 0 &&
        chatRootsyOffersAutoExecute(item.pendingOffers),
    )
    if (!operation?.pendingHostId) return
    const keys = operation.pendingOffers.map((offer) =>
      chatRootsyOfferKey(offer),
    )
    const key = `${operation.pendingHostId}:${keys.join("|")}`
    if (autoReadKeyRef.current === key) return
    autoReadKeyRef.current = key
    void confirmReadsRef.current(operation.pendingHostId, keys)
  }, [operations, sending])
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
    if (!body || busy) return
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

    const openingId = `rootsy-ai:${crypto.randomUUID()}`
    const opening: ChatMessageRow = {
      id: openingId,
      authorUserId: ROOTSY_CHAT_AUTHOR_ID,
      authorName: "Rootsy",
      body: res.reply,
      createdAt: new Date().toISOString(),
      mine: false,
      devTrace: res.devTrace,
    }
    const pendingRun = res.needsPlanner ? res.plannerRun : undefined
    setMessages([...nextMessages, opening].slice(-ROOTSY_SESSION_HISTORY_MAX))
    setLive(
      pendingRun
        ? { sending: true, mode: "prepare", hostId: userMessage.id }
        : { sending: false, mode: "idle" },
    )
    setSending(false)
    window.requestAnimationFrame(() => composerRef.current?.focus())

    if (!pendingRun) return

    const planRes = await startRootsyPlannerRun({
      siteId,
      popId,
      history: rootsyHistoryFromMessages(nextMessages),
      toolContext: rootsyToolContextFromMessages(nextMessages),
      plannerRun: pendingRun,
    })

    if (!planRes.success) {
      setSendError(
        isChatRootsyDevTraceEnabled() && planRes.devTrace?.error
          ? planRes.devTrace.error
          : planRes.error,
      )
      setMessages((current) =>
        current.map((row) =>
          row.id === openingId
            ? {
                ...row,
                toolError: planRes.error,
                devTrace:
                  mergeChatRootsyDevTraces([row.devTrace, planRes.devTrace]) ??
                  row.devTrace,
              }
            : row,
        ),
      )
      setLive({ sending: false, mode: "idle" })
      return
    }

    const now = new Date().toISOString()
    const ranReads = Boolean(planRes.toolResults?.length)
    const closedFailed = Boolean(planRes.executionError)
    const followUp =
      ranReads || closedFailed
        ? rootsyFollowUpRow(planRes, now, planRes.followUpReply ?? "")
        : null
    setMessages((current) => {
      const next = current.map((row) =>
        row.id === openingId
          ? {
              ...row,
              toolOffer: ranReads || closedFailed ? undefined : planRes.toolOffer,
              toolOffers:
                ranReads || closedFailed ? undefined : planRes.toolOffers,
              plannerRun: planRes.plannerRun ?? row.plannerRun,
              plannerChoices:
                ranReads || closedFailed ? undefined : planRes.plannerChoices,
              closeBrief:
                ranReads || closedFailed ? undefined : planRes.closeBrief,
              toolError: planRes.executionError,
              devTrace:
                ranReads || closedFailed
                  ? row.devTrace
                  : (mergeChatRootsyDevTraces([row.devTrace, planRes.devTrace]) ??
                    planRes.devTrace ??
                    row.devTrace),
            }
          : row,
      )
      return [
        ...next,
        ...rootsyToolResultRows(planRes.toolResults ?? [], now),
        ...(followUp ? [followUp] : []),
      ].slice(-ROOTSY_SESSION_HISTORY_MAX)
    })
    setLive({ sending: false, mode: "idle" })
  }

  const confirmTools = async (messageId: string, tools: string[]) => {
    if (busy || tools.length === 0) return
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
          toolError: undefined,
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
          subject: offer?.preview?.subject,
          confirm: offer?.confirm,
          offerKey: offer?.offerKey ?? key,
        }
      }),
    })

    if (!res.success) {
      const human = humanizeChatRootsyApiError(res.error)
      setMessages((current) => {
        const closed = current.map((row) => {
          if (row.id !== messageId) return row
          return {
            ...row,
            toolError: human,
          }
        })
        return [
          ...closed,
          {
            id: `rootsy-ai:${crypto.randomUUID()}`,
            authorUserId: ROOTSY_CHAT_AUTHOR_ID,
            authorName: "Rootsy",
            body: human,
            createdAt: new Date().toISOString(),
            mine: false,
            closeBrief: {
              pedido: host?.plannerRun?.message ?? "este pedido",
              estado: "no_aplicado" as const,
              error: human,
              hechos: [],
            },
            devTrace: isChatRootsyDevTraceEnabled() ? res.devTrace : undefined,
          },
        ].slice(-ROOTSY_SESSION_HISTORY_MAX)
      })
      setSending(false)
      setLive({ sending: false, mode: "idle" })
      return
    }

    const now = new Date().toISOString()
    const followUp = rootsyFollowUpRow(res, now, res.reply)
    setMessages((current) =>
      [
        ...current.map((row) =>
          row.id === messageId && res.executionError
            ? { ...row, toolError: res.executionError }
            : row,
        ),
        ...rootsyToolResultRows(res.toolResults, now),
        ...(followUp ? [followUp] : []),
      ].slice(-ROOTSY_SESSION_HISTORY_MAX),
    )
    setSending(false)
    setLive({ sending: false, mode: "idle" })
    window.requestAnimationFrame(() => composerRef.current?.focus())
  }

  confirmReadsRef.current = confirmTools

  const cancelPlanner = (messageId: string) => {
    setMessages((current) =>
      current.map((row) => {
        if (row.id !== messageId) return row
        return {
          ...row,
          toolOffer: undefined,
          toolOffers: undefined,
          plannerChoices: undefined,
          toolError: undefined,
        }
      }),
    )
  }

  const pickPlannerChoice = async (
    messageId: string,
    choiceTool: string,
    items: Array<{ id?: string; name: string; sales?: number; balance?: number }>,
  ) => {
    if (busy) return
    const host = messages.find((row) => row.id === messageId)
    const choice = host?.plannerChoices?.find((row) => row.tool === choiceTool)
    if (!host?.plannerRun || !choice || !items.length) return
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
      items,
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

    const now = new Date().toISOString()
    const followUp = rootsyFollowUpRow(
      res,
      now,
      res.followUpReply ?? res.reply,
    )
    setMessages((current) =>
      [
        ...current,
        ...rootsyToolResultRows(res.toolResults ?? [], now),
        ...(followUp ? [followUp] : []),
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

      <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-visible">
        <div
          ref={listRef}
          className={cn(
            "chat-rootsy-thread-list game-scroll flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overscroll-contain bg-transparent px-4 pt-4 sm:px-6 [overflow-anchor:none]",
            (sending || threadMotion === "rise") &&
              "chat-rootsy-thread-list--thinking",
            threadMotion === "rise" && "chat-rootsy-thread-list--rise",
            threadMotion === "settle" && "chat-rootsy-thread-list--settle",
          )}
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
                "chat-rootsy-thread-item flex flex-col",
                operation ? "gap-0" : "gap-1",
                clusterClass,
                operation
                  ? "w-full max-w-[min(36rem,96%)] self-start items-start"
                  : isChatRootsyDevTraceEnabled() && message.devTrace
                    ? "max-w-[min(36rem,96%)] self-start items-start"
                    : null,
                message.mine ? "self-end items-end" : !operation && "self-start items-start",
                arriveId === message.id && "chat-rootsy-thread-item--arrive",
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
                />
              ) : null}
              {operation ? (
                <div className="mt-4 mb-4 w-full">
                  <ChatRootsyOperationCard
                    operation={operation}
                    disabled={busy}
                    onApprove={(hostId, keys) => {
                      void confirmTools(hostId, keys)
                    }}
                    onReject={(hostId) => cancelPlanner(hostId)}
                    onPick={(hostId, choiceTool, items) => {
                      void pickPlannerChoice(hostId, choiceTool, items)
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
          {sendError && !operations.some((item) => item.error) ? (
            <p className="font-canopy text-xs text-rootsy-danger">
              {sendError}
            </p>
          ) : null}
        </div>
        {sending || haloExiting ? (
          <ChatRootsyThinkingHalo exiting={haloExiting && !sending} />
        ) : null}
      </div>

      <form
        className={cn(
          "chat-rootsy-thread-chrome flex shrink-0 items-center gap-2 border-t border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-6",
          (sending || threadMotion === "rise") &&
            "chat-rootsy-thread-chrome--thinking",
        )}
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
          disabled={busy}
          className="h-full shrink-0 self-stretch"
        >
          <Send className="size-4" aria-hidden />
          Enviar
        </RootsPrimaryButton>
      </form>
    </div>
  )
}
