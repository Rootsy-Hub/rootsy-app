"use client"

import { ChatChannelDialog } from "@/app/[siteId]/[popId]/chat/ChatChannelDialog"
import { ChatWorkspaceSkeleton } from "@/app/[siteId]/[popId]/chat/ChatWorkspaceSkeleton"
import {
  applyChatMessageToList,
  chatChannelIdFromEvent,
  chatMessageFromEvent,
} from "@/app/[siteId]/[popId]/chat/chatRealtime"
import {
  formatChatTime,
  type ChatChannelDetailData,
  type ChatChannelListItem,
  type ChatEligibleUser,
  type ChatMessageRow,
  type ChatRoleOption,
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
  dataWorkspaceEntityCardIsotypeClass,
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
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { usePopRealtime } from "@/hooks/usePopRealtime"
import type { DomainEvent } from "@/lib/realtime/protocol"
import {
  createChatChannel,
  deleteChatChannel,
  fetchChatChannel,
  fetchChatWorkspace,
  markChatChannelRead,
  sendChatMessage,
  updateChatChannel,
} from "@/lib/rootsyApi/chatClient"
import { cn } from "@/lib/utils"
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

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channels, setChannels] = useState<ChatChannelListItem[]>([])
  const [members, setMembers] = useState<ChatEligibleUser[]>([])
  const [roles, setRoles] = useState<ChatRoleOption[]>([])
  const [currentUserId, setCurrentUserId] = useState("")
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [channelCount, setChannelCount] = useState(0)
  const [channelLimit, setChannelLimit] = useState(8)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [thread, setThread] = useState<ChatChannelDetailData | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false)
  const threadEndRef = useRef<HTMLDivElement>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createBanner, setCreateBanner] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editBanner, setEditBanner] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteBanner, setDeleteBanner] = useState<string | null>(null)

  const selected = useMemo(
    () => channels.find((item) => item.id === selectedId) ?? null,
    [channels, selectedId],
  )

  const loadWorkspace = useCallback(async () => {
    if (!popId) return
    const res = await fetchChatWorkspace(popId)
    if (!res.success) {
      setError(res.error || "Error")
      setChannels([])
      if (res.redirect) {
        setTimeout(() => routerRef.current.push(res.redirect!), 1600)
      }
      return
    }
    setError(null)
    setChannels(res.channels)
    setMembers(res.members)
    setRoles(res.roles)
    setCurrentUserId(res.currentUserId)
    setCanCreate(res.canCreate)
    setCanUpdate(res.canUpdate)
    setCanDelete(res.canDelete)
    setChannelCount(res.channelCount)
    setChannelLimit(res.channelLimit)
    setSelectedId((prev) => {
      if (prev && res.channels.some((item) => item.id === prev)) return prev
      return res.channels[0]?.id ?? null
    })
  }, [popId])

  useEffect(() => {
    if (!popId || !siteId) {
      setLoading(false)
      setError("No se encontró el punto de venta.")
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await loadWorkspace()
      } catch {
        if (!cancelled) setError("Error inesperado")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [popId, siteId, loadWorkspace])

  const loadThread = useCallback(
    async (channelId: string) => {
      if (!popId) return
      setThreadLoading(true)
      const res = await fetchChatChannel(popId, channelId)
      setThreadLoading(false)
      if (!res.success) {
        setThread(null)
        return
      }
      setThread(res.data)
      setChannels((prev) =>
        prev.map((item) =>
          item.id === channelId
            ? { ...item, unread: 0, lastMessageBody: item.lastMessageBody }
            : item,
        ),
      )
      void markChatChannelRead(popId, channelId)
    },
    [popId],
  )

  useEffect(() => {
    if (!selectedId) {
      setThread(null)
      return
    }
    void loadThread(selectedId)
  }, [selectedId, loadThread])

  const selectedIdRef = useRef(selectedId)
  selectedIdRef.current = selectedId
  const currentUserIdRef = useRef(currentUserId)
  currentUserIdRef.current = currentUserId
  const loadWorkspaceRef = useRef(loadWorkspace)
  loadWorkspaceRef.current = loadWorkspace
  const loadThreadRef = useRef(loadThread)
  loadThreadRef.current = loadThread

  const onRealtimeEvent = useCallback((event: DomainEvent) => {
    const channelId = chatChannelIdFromEvent(event)
    if (!channelId) return

    if (event.type === "chat.message") {
      const message = chatMessageFromEvent(event, currentUserIdRef.current)
      if (!message) return
      setThread((prev) => {
        if (!prev || prev.channel.id !== channelId) return prev
        if (prev.messages.some((row) => row.id === message.id)) return prev
        return { ...prev, messages: [...prev.messages, message] }
      })
      setChannels((prev) => {
        const next = applyChatMessageToList(
          prev,
          channelId,
          message,
          selectedIdRef.current,
        )
        if (next === prev && !prev.some((item) => item.id === channelId)) {
          void loadWorkspaceRef.current()
        }
        return next
      })
      return
    }

    if (event.type === "chat.deleted") {
      setChannels((prev) => prev.filter((item) => item.id !== channelId))
      if (selectedIdRef.current === channelId) {
        setSelectedId(null)
        setThread(null)
      }
      void loadWorkspaceRef.current()
      return
    }

    if (event.type === "chat.created" || event.type === "chat.updated") {
      void loadWorkspaceRef.current()
      if (selectedIdRef.current === channelId) {
        void loadThreadRef.current(channelId)
      }
    }
  }, [])

  const onRealtimeResync = useCallback(() => {
    void loadWorkspaceRef.current()
    const openId = selectedIdRef.current
    if (openId) void loadThreadRef.current(openId)
  }, [])

  usePopRealtime({
    channels: ["domain:chat"],
    enabled: Boolean(popId && !loading),
    onEvent: onRealtimeEvent,
    onResync: onRealtimeResync,
  })

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: "end" })
  }, [thread?.messages.length])

  const openChannel = (id: string) => {
    setSelectedId(id)
    setMobileThreadOpen(true)
    setDraft("")
  }

  const sendDraft = async () => {
    const body = draft.trim()
    if (!body || !selected || !popId || sending) return
    setSending(true)
    const res = await sendChatMessage(popId, selected.id, body)
    setSending(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    const message: ChatMessageRow = res.message
    setDraft("")
    setThread((prev) => {
      if (!prev || prev.channel.id !== selected.id) return prev
      if (prev.messages.some((row) => row.id === message.id)) return prev
      return { ...prev, messages: [...prev.messages, message] }
    })
    setChannels((prev) =>
      prev.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              unread: 0,
              lastMessageAt: message.createdAt,
              lastMessageBody: message.body,
            }
          : item,
      ),
    )
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
    await loadWorkspace()
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
    await loadWorkspace()
    await loadThread(selected.id)
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
    setSelectedId(null)
    setThread(null)
    await loadWorkspace()
  }

  const messages = thread?.messages ?? []
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
                    Equipo del local
                  </h2>
                </header>
                <ul className="min-h-0 flex-1 overflow-y-auto">
                  {channels.map((channel) => {
                    const active = channel.id === selectedId
                    return (
                      <li key={channel.id}>
                        <button
                          type="button"
                          onClick={() => openChannel(channel.id)}
                          className={cn(
                            "flex w-full items-start gap-3 border-b border-[var(--rootsy-bruma-200)] px-4 py-3 text-left sm:px-6",
                            "transition-colors hover:bg-[var(--rootsy-bruma-50)]",
                            active &&
                              "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_8%,white)]",
                          )}
                        >
                          <span
                            className={cn(
                              dataWorkspaceEntityCardIsotypeClass,
                              "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_10%,white)] text-[var(--rootsy-savia-800)]",
                            )}
                            aria-hidden
                          >
                            <span className="font-canopy text-xs font-semibold">
                              {channel.initials}
                            </span>
                          </span>
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
                {selected ? (
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
                      <span
                        className={cn(
                          dataWorkspaceEntityCardIsotypeClass,
                          "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_10%,white)] text-[var(--rootsy-savia-800)]",
                        )}
                        aria-hidden
                      >
                        <span className="font-canopy text-xs font-semibold">
                          {selected.initials}
                        </span>
                      </span>
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

                    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 sm:px-6">
                      {threadLoading && messages.length === 0 ? (
                        <p className="font-canopy text-sm text-[var(--rootsy-bruma-500)]">
                          Cargando mensajes…
                        </p>
                      ) : messages.length === 0 ? (
                        <p className="font-canopy text-sm text-[var(--rootsy-bruma-500)]">
                          Todavía no hay mensajes en este canal.
                        </p>
                      ) : (
                        messages.map((message) => (
                          <article
                            key={message.id}
                            className={cn(
                              "flex max-w-[min(28rem,92%)] flex-col gap-1",
                              message.mine
                                ? "self-end items-end"
                                : "self-start items-start",
                            )}
                          >
                            {!message.mine ? (
                              <p className="px-1 font-canopy text-[11px] font-medium text-[var(--rootsy-bruma-500)]">
                                {message.authorName}
                              </p>
                            ) : null}
                            <p
                              className={cn(
                                "rounded-[1.125rem] px-3.5 py-2.5 font-canopy text-sm leading-5",
                                message.mine
                                  ? "rounded-br-md bg-[var(--rootsy-savia-600)] text-white"
                                  : "rounded-bl-md bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-900)]",
                              )}
                            >
                              {message.body}
                            </p>
                            <time className="px-1 font-canopy text-[11px] text-[var(--rootsy-bruma-500)]">
                              {formatChatTime(message.createdAt)}
                            </time>
                          </article>
                        ))
                      )}
                      <div ref={threadEndRef} />
                    </div>

                    <form
                      className="flex shrink-0 items-end gap-2 border-t border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-6"
                      onSubmit={(event) => {
                        event.preventDefault()
                        void sendDraft()
                      }}
                    >
                      <label className="sr-only" htmlFor="chat-composer">
                        Escribir mensaje
                      </label>
                      <RootsFormControlInput
                        id="chat-composer"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Escribí un mensaje…"
                        autoComplete="off"
                        className="min-w-0 flex-1"
                      />
                      <RootsPrimaryButton
                        type="submit"
                        size="compact"
                        withIcon
                        disabled={!draft.trim() || sending}
                        className="shrink-0"
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
        currentUserId={currentUserId}
        members={members}
        roles={roles}
        initialTitle={selected?.title}
        initialSubtitle={selected?.subtitle ?? ""}
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
