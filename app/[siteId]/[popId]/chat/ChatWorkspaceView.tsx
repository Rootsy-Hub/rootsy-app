"use client"

import { ChatBubble } from "@/app/[siteId]/[popId]/chat/ChatBubble"
import { ChatChannelAvatar } from "@/app/[siteId]/[popId]/chat/ChatChannelAvatar"
import { ChatChannelDialog } from "@/app/[siteId]/[popId]/chat/ChatChannelDialog"
import { ChatEmojiPicker } from "@/app/[siteId]/[popId]/chat/ChatEmojiPicker"
import { ChatRootsyAvatar } from "@/app/[siteId]/[popId]/chat/ChatRootsyAvatar"
import { ChatRootsyThread } from "@/app/[siteId]/[popId]/chat/ChatRootsyThread"
import {
  ROOTSY_CHAT_ID,
  loadRootsyChatMessages,
} from "@/app/[siteId]/[popId]/chat/chatRootsy"
import "@/app/[siteId]/[popId]/chat/chatThreadSurface.css"
import { ChatWorkspaceSkeleton } from "@/app/[siteId]/[popId]/chat/ChatWorkspaceSkeleton"
import {
  applyChatMessageToCache,
  applyOptimisticChatMessage,
  chatChannelIdFromEvent,
  chatMessageFromEvent,
  confirmOptimisticChatMessage,
  invalidatePopChat,
  markChatChannelReadInCache,
  removeChatMessageFromCache,
} from "@/app/[siteId]/[popId]/chat/chatRealtime"
import {
  chatBubbleClusterFlags,
  chatMessageAuthorImageUrl,
  chatThreadKindFromChannel,
  formatChatTime,
  type ChatMessageRow,
  type UpsertChatChannelInput,
} from "@/app/[siteId]/[popId]/chat/chatTypes"
import {
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceBlocksPageScopeClass,
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceDetailEmptyStateClass,
  dataWorkspaceDetailEmptyStateContentClass,
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceDetailEmptyStateIconWrapClass,
  dataWorkspaceDetailEmptyStateTitleClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceHeaderTooltipIconButton } from "@/components/layouts/DataWorkspaceHeaderTooltipIconButton"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { RootsBanner } from "@/components/rootsy-banner"
import { RootsIconButton, RootsPrimaryButton } from "@/components/rootsy-button"
import { RootsConfirmDialog } from "@/components/rootsy-dialog"
import { RootsFormControlInput } from "@/components/rootsy-form/RootsFormControlInput"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useInfiniteScrollSentinel } from "@/hooks/useInfiniteScrollSentinel"
import { usePopChatChannel } from "@/hooks/usePopChatChannel"
import { usePopChatMessages } from "@/hooks/usePopChatMessages"
import { usePopChatWorkspace } from "@/hooks/usePopChatWorkspace"
import { usePopRealtime } from "@/hooks/usePopRealtime"
import { popChatChannelQueryKey, popChatQueryRoot } from "@/lib/queryKeys"
import type { DomainEvent } from "@/lib/realtime/protocol"
import {
  ChatQueryError,
  createChatChannel,
  deleteChatChannel,
  markChatChannelRead,
  sendChatMessage,
  updateChatChannel,
} from "@/lib/rootsyApi/chatClient"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, MessageSquare, Plus, Send, Trash2, Users } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export function ChatWorkspaceView() {
  const params = useParams()
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()
  const queryClient = useQueryClient()

  const workspaceQuery = usePopChatWorkspace(popId || undefined, {
    enabled: Boolean(popId && siteId),
  })
  const workspace = workspaceQuery.data
  const workspaceError =
    workspaceQuery.error instanceof ChatQueryError
      ? workspaceQuery.error
      : workspaceQuery.error instanceof Error
        ? workspaceQuery.error
        : null

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [sendError, setSendError] = useState<string | null>(null)
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false)
  const [rootsyPreview, setRootsyPreview] = useState<string | null>(null)
  const isRootsyChat = selectedId === ROOTSY_CHAT_ID
  const threadListRef = useRef<HTMLDivElement | null>(null)
  const [threadListEl, setThreadListEl] = useState<HTMLDivElement | null>(null)
  const [olderSentinelEl, setOlderSentinelEl] = useState<HTMLDivElement | null>(
    null,
  )
  const markedReadRef = useRef<string | null>(null)
  const stickToBottomRef = useRef(true)
  const skipStickRef = useRef(false)
  const composerRef = useRef<HTMLInputElement>(null)
  const composerRangeRef = useRef({ start: 0, end: 0 })
  const sendButtonRef = useRef<HTMLButtonElement>(null)

  const threadQuery = usePopChatChannel(
    popId || undefined,
    isRootsyChat ? null : selectedId,
  )
  const thread = threadQuery.data
  const messagesQuery = usePopChatMessages(
    popId || undefined,
    isRootsyChat ? null : selectedId,
  )
  const messages = messagesQuery.messages

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editBanner, setEditBanner] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)

  const channels = workspace?.channels ?? []
  const members = workspace?.members ?? []
  const roles = workspace?.roles ?? []
  const currentUserId = workspace?.currentUserId ?? ""
  const canCreate = Boolean(workspace?.canCreate)
  const canUpdate = Boolean(workspace?.canUpdate)
  const canDelete = Boolean(workspace?.canDelete)
  const channelCount = workspace?.channelCount ?? channels.length
  const channelLimit = workspace?.channelLimit ?? 8
  const loading = Boolean(popId && siteId) && !workspace && workspaceQuery.isPending
  const threadLoading =
    Boolean(selectedId) &&
    !isRootsyChat &&
    messages.length === 0 &&
    messagesQuery.isPending
  const error =
    !popId || !siteId
      ? "No se encontró el punto de venta."
      : sendError ??
        (workspaceError instanceof ChatQueryError
          ? workspaceError.message
          : workspaceError?.message ?? null)

  const selected = useMemo(
    () => channels.find((item) => item.id === selectedId) ?? null,
    [channels, selectedId],
  )
  const threadKind = chatThreadKindFromChannel(selected)

  const focusSendButton = useCallback(() => {
    window.requestAnimationFrame(() => {
      sendButtonRef.current?.focus()
    })
  }, [])

  const focusComposer = useCallback(() => {
    window.requestAnimationFrame(() => {
      composerRef.current?.focus()
    })
  }, [])

  useEffect(() => {
    if (
      !selectedId ||
      isRootsyChat ||
      threadLoading ||
      createOpen ||
      editOpen ||
      deleteOpen
    ) {
      return
    }
    focusSendButton()
  }, [
    createOpen,
    deleteOpen,
    editOpen,
    focusSendButton,
    isRootsyChat,
    selectedId,
    threadLoading,
  ])

  useEffect(() => {
    if (!popId) return
    const stored = loadRootsyChatMessages(popId)
    const last = [...stored].reverse().find((row) => !row.pending)
    setRootsyPreview(last?.body ?? null)
  }, [popId])

  useEffect(() => {
    if (!workspace) return
    setSelectedId((prev) => {
      if (prev === ROOTSY_CHAT_ID) return prev
      if (prev && workspace.channels.some((item) => item.id === prev)) return prev
      return workspace.channels[0]?.id ?? ROOTSY_CHAT_ID
    })
  }, [workspace])

  useEffect(() => {
    if (!(workspaceError instanceof ChatQueryError) || !workspaceError.redirect) {
      return
    }
    const redirect = workspaceError.redirect
    const timer = window.setTimeout(() => {
      routerRef.current.push(redirect)
    }, 1600)
    return () => window.clearTimeout(timer)
  }, [workspaceError])

  useEffect(() => {
    if (!popId || !selectedId || thread?.channel.id !== selectedId) return
    if (markedReadRef.current === selectedId) return
    markedReadRef.current = selectedId
    markChatChannelReadInCache(queryClient, popId, selectedId)
    void markChatChannelRead(popId, selectedId)
  }, [popId, selectedId, thread?.channel.id, queryClient])

  const selectedIdRef = useRef(selectedId)
  selectedIdRef.current = selectedId
  const currentUserIdRef = useRef(currentUserId)
  currentUserIdRef.current = currentUserId

  const onRealtimeEvent = useCallback(
    (event: DomainEvent) => {
      if (!popId) return
      const channelId = chatChannelIdFromEvent(event)
      if (!channelId) return

      if (event.type === "chat.message") {
        const message = chatMessageFromEvent(event, currentUserIdRef.current)
        if (!message) return
        const patched = applyChatMessageToCache(
          queryClient,
          popId,
          channelId,
          message,
          selectedIdRef.current,
        )
        if (!patched) {
          invalidatePopChat(queryClient, popId)
          return
        }
        if (selectedIdRef.current === channelId && !message.mine) {
          void markChatChannelRead(popId, channelId)
        }
        return
      }

      if (event.type === "chat.deleted") {
        if (selectedIdRef.current === channelId) {
          setSelectedId(null)
          queryClient.removeQueries({
            queryKey: popChatChannelQueryKey(popId, channelId),
          })
        }
        invalidatePopChat(queryClient, popId)
        return
      }

      if (event.type === "chat.created" || event.type === "chat.updated") {
        invalidatePopChat(
          queryClient,
          popId,
          event.type === "chat.updated" ? channelId : undefined,
        )
      }
    },
    [popId, queryClient],
  )

  const onRealtimeResync = useCallback(() => {
    if (!popId) return
    invalidatePopChat(queryClient, popId)
  }, [popId, queryClient])

  usePopRealtime({
    channels: ["domain:chat"],
    enabled: Boolean(popId && siteId && (workspace || workspaceQuery.isFetched)),
    onEvent: onRealtimeEvent,
    onResync: onRealtimeResync,
  })

  const loadOlderMessages = useCallback(() => {
    if (!messagesQuery.hasNextPage || messagesQuery.isFetchingNextPage) return
    const el = threadListRef.current
    const prevHeight = el?.scrollHeight ?? 0
    skipStickRef.current = true
    void messagesQuery.fetchNextPage().then(() => {
      requestAnimationFrame(() => {
        const list = threadListRef.current
        if (!list) return
        list.scrollTop = list.scrollHeight - prevHeight
      })
    })
  }, [
    messagesQuery.fetchNextPage,
    messagesQuery.hasNextPage,
    messagesQuery.isFetchingNextPage,
  ])

  useInfiniteScrollSentinel(
    threadListEl,
    olderSentinelEl,
    Boolean(messagesQuery.hasNextPage) && !messagesQuery.isFetchingNextPage,
    loadOlderMessages,
  )

  const scrollThreadToEnd = useCallback(() => {
    const list = threadListRef.current
    if (!list) return
    list.scrollTop = list.scrollHeight
  }, [])

  useEffect(() => {
    stickToBottomRef.current = true
  }, [selectedId])

  useEffect(() => {
    if (skipStickRef.current) {
      skipStickRef.current = false
      return
    }
    if (!stickToBottomRef.current) return
    const frame = window.requestAnimationFrame(scrollThreadToEnd)
    return () => window.cancelAnimationFrame(frame)
  }, [messages.length, scrollThreadToEnd, selectedId, threadLoading])

  const openChannel = (id: string) => {
    setSelectedId(id)
    setMobileThreadOpen(true)
    setDraft("")
  }

  const sendDraft = async () => {
    const body = draft.trim()
    if (!body || !selected || !popId) return
    const channelId = selected.id
    const optimisticId = `optimistic:${crypto.randomUUID()}`
    const optimistic: ChatMessageRow = {
      id: optimisticId,
      authorUserId: currentUserId,
      authorName: bootstrap?.userFullName || "Vos",
      body,
      createdAt: new Date().toISOString(),
      mine: true,
      pending: true,
    }
    setDraft("")
    setSendError(null)
    applyOptimisticChatMessage(queryClient, popId, channelId, optimistic)

    const res = await sendChatMessage(popId, channelId, body)
    if (!res.success) {
      removeChatMessageFromCache(queryClient, popId, channelId, optimisticId)
      setDraft((current) => (current.trim() ? current : body))
      setSendError(res.error)
      focusComposer()
      return
    }
    confirmOptimisticChatMessage(
      queryClient,
      popId,
      channelId,
      optimisticId,
      res.message,
    )
    focusComposer()
  }

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

  const atLimit = channelCount >= channelLimit

  const submitCreate = async (input: UpsertChatChannelInput) => {
    if (!popId) return
    setCreateSaving(true)
    setCreateBanner(null)
    const res = await createChatChannel(popId, input)
    setCreateSaving(false)
    if (!res.success) {
      setCreateBanner(res.error)
      return
    }
    setCreateOpen(false)
    await queryClient.invalidateQueries({
      queryKey: popChatQueryRoot(popId),
    })
    setSelectedId(res.id)
    setMobileThreadOpen(true)
  }

  const submitEdit = async (input: UpsertChatChannelInput) => {
    if (!popId || !selected) return
    setEditSaving(true)
    setEditBanner(null)
    const res = await updateChatChannel(popId, selected.id, input)
    setEditSaving(false)
    if (!res.success) {
      setEditBanner(res.error)
      return
    }
    setEditOpen(false)
    await queryClient.invalidateQueries({
      queryKey: popChatQueryRoot(popId),
    })
  }

  const submitDelete = async () => {
    if (!popId || !selected) return
    setDeleteBusy(true)
    setDeleteBanner(null)
    const res = await deleteChatChannel(popId, selected.id)
    setDeleteBusy(false)
    if (!res.success) {
      setDeleteBanner(res.error)
      return
    }
    setDeleteOpen(false)
    queryClient.removeQueries({
      queryKey: popChatChannelQueryKey(popId, selected.id),
    })
    setSelectedId(null)
    await queryClient.invalidateQueries({
      queryKey: popChatQueryRoot(popId),
    })
  }

  const atLimitHint = atLimit
    ? `Este local ya tiene ${channelLimit} canales.`
    : undefined

  return (
    <>
      <DataWorkspaceModuleLayout
        siteId={siteId}
        popId={popId}
        popName={bootstrap?.popName ?? ""}
        title="Chat"
        headerVariant={dataWorkspaceModuleHeaderVariant}
        loading={bootstrapLoading}
        userName={bootstrap?.userFullName}
        userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
        userRoleLabel={bootstrap?.roleLabel}
        headerActions={
          canCreate ? (
            <DataWorkspaceHeaderTooltipIconButton
              label={atLimitHint ?? "Nuevo canal"}
              headerVariant={dataWorkspaceModuleHeaderVariant}
              primary
              disabled={atLimit}
              onClick={() => {
                setCreateBanner(null)
                setCreateOpen(true)
              }}
            >
              <Plus className="size-5" aria-hidden />
            </DataWorkspaceHeaderTooltipIconButton>
          ) : null
        }
        contentFlush
        mainMaxWidthClass="max-w-none"
        mainClassName={cn(
          dataWorkspaceBlocksPageMainClass,
          "flex min-h-0 flex-1 flex-col overflow-hidden",
        )}
      >
        <div
          className={cn(
            dataWorkspaceBlocksPageScopeClass,
            "flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-6 pb-0 sm:px-6 lg:px-8",
          )}
        >
          {bootstrapError ? (
            <RootsBanner
              intent="danger"
              layout="message"
              className="mb-4"
              message={`Cabecera: ${bootstrapError}`}
            />
          ) : null}
          {error ? (
            <RootsBanner
              intent="danger"
              layout="message"
              className="mb-4"
              message={error}
            />
          ) : null}

          {loading ? (
            <ChatWorkspaceSkeleton />
          ) : (
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)]">
              <aside
                className={cn(
                  dataWorkspaceDetailFlushBottomCardClass,
                  mobileThreadOpen ? "hidden lg:flex" : "flex",
                )}
              >
                <header className={dataWorkspaceDetailCardHeaderClass}>
                  <p className={dataWorkspaceEntityCardEyebrowClass}>
                    Canales · {channelCount}/{channelLimit}
                  </p>
                  <h2 className={cn(dataWorkspaceEntityCardTitleClass, "mt-1")}>
                    Conversaciones
                  </h2>
                </header>
                <div
                  className={cn(
                    "flex w-full shrink-0 items-start gap-3 border-b border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-6",
                    "transition-colors hover:bg-[var(--rootsy-bruma-50)]",
                    isRootsyChat &&
                      "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_8%,white)]",
                  )}
                >
                  <ChatRootsyAvatar />
                  <button
                    type="button"
                    onClick={() => openChannel(ROOTSY_CHAT_ID)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]">
                        Rootsy
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                      {rootsyPreview ?? "Preguntame lo que quieras"}
                    </span>
                  </button>
                </div>
                <p className="px-4 pt-3 pb-1 font-canopy text-[11px] font-semibold uppercase tracking-wide text-[var(--rootsy-bruma-500)] sm:px-6">
                  Equipos
                </p>
                <ul className="game-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  {channels.map((channel) => {
                    const active = channel.id === selectedId
                    return (
                      <li key={channel.id}>
                        <div
                          className={cn(
                            "flex w-full items-start gap-3 border-b border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-6",
                            "transition-colors hover:bg-[var(--rootsy-bruma-50)]",
                            active &&
                              "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_8%,white)]",
                          )}
                        >
                          <ChatChannelAvatar
                            title={channel.title}
                            initials={channel.initials}
                            imageUrl={channel.imageUrl}
                          />
                          <button
                            type="button"
                            onClick={() => openChannel(channel.id)}
                            className="flex min-w-0 flex-1 items-start gap-3 text-left"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="flex items-baseline justify-between gap-3">
                                <span className="truncate font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]">
                                  {channel.title}
                                </span>
                                <span className="shrink-0 font-canopy text-[11px] text-[var(--rootsy-bruma-500)]">
                                  {formatChatTime(channel.lastMessageAt)}
                                </span>
                              </span>
                              <span className="mt-0.5 block truncate font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                                {channel.lastMessageBody ?? "Sin mensajes"}
                              </span>
                            </span>
                            {channel.unread > 0 ? (
                              <span
                                className="mt-0.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--rootsy-savia-600)] px-1.5 font-canopy text-[11px] font-semibold text-white"
                                aria-label={`${channel.unread} sin leer`}
                              >
                                {channel.unread}
                              </span>
                            ) : null}
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </aside>

              <section
                className={cn(
                  dataWorkspaceDetailFlushBottomCardClass,
                  mobileThreadOpen ? "flex" : "hidden lg:flex",
                )}
              >
                {isRootsyChat ? (
                  <ChatRootsyThread
                    siteId={siteId}
                    popId={popId}
                    userName={bootstrap?.userFullName ?? ""}
                    onBack={() => setMobileThreadOpen(false)}
                    onPreviewChange={setRootsyPreview}
                  />
                ) : selected ? (
                  <>
                    <header
                      className={cn(
                        dataWorkspaceDetailCardHeaderClass,
                        "flex items-center gap-3",
                      )}
                    >
                      <RootsIconButton
                        theme="workspace"
                        emphasis="ghost"
                        size="compact"
                        label="Volver a canales"
                        className="lg:hidden"
                        onClick={() => setMobileThreadOpen(false)}
                      >
                        <ArrowLeft />
                      </RootsIconButton>
                      <ChatChannelAvatar
                        title={selected.title}
                        initials={selected.initials}
                        imageUrl={selected.imageUrl}
                      />
                      <div className="min-w-0 flex-1">
                        <h2 className={dataWorkspaceEntityCardTitleClass}>
                          {selected.title}
                        </h2>
                        <p className="mt-0.5 truncate font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                          {selected.subtitle ??
                            `${selected.memberCount} participantes`}
                        </p>
                      </div>
                      {canUpdate ? (
                        <RootsIconButton
                          theme="workspace"
                          emphasis="ghost"
                          size="compact"
                          label="Participantes"
                          disabled={thread?.channel.id !== selected.id}
                          onClick={() => {
                            setEditBanner(null)
                            setEditOpen(true)
                          }}
                        >
                          <Users />
                        </RootsIconButton>
                      ) : null}
                      {canDelete && !selected.isEquipo ? (
                        <RootsIconButton
                          theme="workspace"
                          emphasis="ghost"
                          size="compact"
                          label="Eliminar canal"
                          onClick={() => {
                            setDeleteBanner(null)
                            setDeleteOpen(true)
                          }}
                        >
                          <Trash2 />
                        </RootsIconButton>
                      ) : null}
                    </header>

                    <div
                      ref={(node) => {
                        threadListRef.current = node
                        setThreadListEl(node)
                      }}
                      className="chat-thread-surface game-scroll flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 [overflow-anchor:none]"
                      onScroll={(event) => {
                        const el = event.currentTarget
                        stickToBottomRef.current =
                          el.scrollHeight - el.scrollTop - el.clientHeight < 80
                      }}
                    >
                      <div ref={setOlderSentinelEl} aria-hidden className="h-px" />
                      {threadLoading || messagesQuery.isFetchingNextPage ? (
                        <div className="flex w-full justify-center py-2">
                          <RootsSpinner
                            size="sm"
                            label={
                              threadLoading
                                ? "Cargando mensajes"
                                : "Cargando anteriores"
                            }
                          />
                        </div>
                      ) : null}
                      {threadLoading && messages.length === 0 ? null : messages.length === 0 ? (
                        <p className="font-canopy text-sm text-[var(--rootsy-bruma-500)]">
                          Todavía no hay mensajes en este canal.
                        </p>
                      ) : (
                        messages.map((message, index) => {
                          const cluster = chatBubbleClusterFlags(messages, index)
                          return (
                          <ChatBubble
                            key={message.id}
                            variant={threadKind}
                            mine={message.mine}
                            body={message.body}
                            authorName={message.authorName}
                            authorUserId={message.authorUserId}
                            authorImageUrl={chatMessageAuthorImageUrl(
                              message,
                              members,
                            )}
                            createdAt={message.createdAt}
                            firstInCluster={cluster.firstInCluster}
                            lastInCluster={cluster.lastInCluster}
                            pending={message.pending}
                            className={
                              index === 0
                                ? "mt-0"
                                : cluster.firstInCluster
                                  ? "mt-3"
                                  : "mt-0.5"
                            }
                          />
                          )
                        })
                      )}
                    </div>

                    <form
                      className="flex shrink-0 items-center gap-2 border-t border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-6"
                      onSubmit={(event) => {
                        event.preventDefault()
                        void sendDraft()
                      }}
                    >
                      <label className="sr-only" htmlFor="chat-composer">
                        Escribir mensaje
                      </label>
                      <RootsFormControlInput
                        ref={composerRef}
                        id="chat-composer"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onSelect={rememberComposerRange}
                        onBlur={rememberComposerRange}
                        placeholder="Escribí un mensaje…"
                        autoComplete="off"
                        className="min-w-0 flex-1"
                      />
                      <ChatEmojiPicker onPick={insertEmoji} />
                      <RootsPrimaryButton
                        ref={sendButtonRef}
                        type="submit"
                        size="default"
                        withIcon
                        disabled={messagesQuery.isPending}
                        className="h-full shrink-0 self-stretch"
                      >
                        <Send className="size-4" aria-hidden />
                        Enviar
                      </RootsPrimaryButton>
                    </form>
                  </>
                ) : (
                  <div className={dataWorkspaceDetailEmptyStateClass}>
                    <div className={dataWorkspaceDetailEmptyStateContentClass}>
                      <div className={dataWorkspaceDetailEmptyStateIconWrapClass}>
                        <MessageSquare className="size-5" strokeWidth={1.75} />
                      </div>
                      <p className={dataWorkspaceDetailEmptyStateTitleClass}>
                        Elegí un canal
                      </p>
                      <p className={dataWorkspaceDetailEmptyStateDescriptionClass}>
                        Los canales y los mensajes del local aparecen acá.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </DataWorkspaceModuleLayout>

      <ChatChannelDialog
        open={createOpen}
        mode="create"
        isEquipo={false}
        saving={createSaving}
        banner={createBanner}
        popId={popId}
        currentUserId={currentUserId}
        members={members}
        roles={roles}
        onOpenChange={setCreateOpen}
        onSubmit={submitCreate}
      />

      <ChatChannelDialog
        open={editOpen}
        mode="edit"
        isEquipo={Boolean(selected?.isEquipo)}
        saving={editSaving}
        banner={editBanner}
        popId={popId}
        currentUserId={currentUserId}
        members={members}
        roles={roles}
        initialTitle={selected?.title}
        initialSubtitle={selected?.subtitle ?? ""}
        initialImageUrl={selected?.imageUrl}
        initialUserIds={thread?.memberUserIds}
        onOpenChange={setEditOpen}
        onSubmit={submitEdit}
      />

      <RootsConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar canal"
        description="Se borran los mensajes de este canal."
        confirmLabel="Eliminar"
        busy={deleteBusy}
        error={deleteBanner}
        destructive
        onConfirm={() => void submitDelete()}
      />
    </>
  )
}
