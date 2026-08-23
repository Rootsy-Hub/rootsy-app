import type {
  ChatChannelDetailData,
  ChatMessageCursor,
  ChatMessageRow,
  ChatMessagesPage,
  ChatWorkspaceData,
  UpsertChatChannelInput,
} from "@/app/[siteId]/[popId]/chat/chatTypes"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string; redirect?: string }

type MutateResult = { success: true } | { success: false; error: string }

async function parseJson<T>(
  res: Response,
): Promise<
  | { success: true; data: T }
  | { success: false; error: string; redirect?: string }
> {
  const json = (await res.json().catch(() => null)) as ApiOk<T> | ApiErr | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, data: json.data }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    redirect:
      json && "redirect" in json && typeof json.redirect === "string"
        ? json.redirect
        : undefined,
  }
}

export class ChatQueryError extends Error {
  redirect?: string

  constructor(message: string, redirect?: string) {
    super(message)
    this.name = "ChatQueryError"
    this.redirect = redirect
  }
}

export async function queryChatWorkspace(popId: string): Promise<ChatWorkspaceData> {
  const res = await fetchChatWorkspace(popId)
  if (!res.success) {
    throw new ChatQueryError(res.error, res.redirect)
  }
  const { success: _success, ...data } = res
  return data
}

export async function queryChatChannel(
  popId: string,
  channelId: string,
): Promise<ChatChannelDetailData> {
  const res = await fetchChatChannel(popId, channelId)
  if (!res.success) {
    throw new ChatQueryError(res.error)
  }
  return res.data
}

export async function queryChatMessages(
  popId: string,
  channelId: string,
  cursor?: ChatMessageCursor | null,
  limit = 40,
): Promise<ChatMessagesPage> {
  const res = await fetchChatMessages(popId, channelId, cursor, limit)
  if (!res.success) {
    throw new ChatQueryError(res.error)
  }
  return res.data
}

export async function fetchChatWorkspace(
  popId: string,
): Promise<
  | ({ success: true } & ChatWorkspaceData)
  | { success: false; error: string; redirect?: string }
> {
  const res = await fetch(`/api/pops/${popId}/chat`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseJson<ChatWorkspaceData>(res)
  if (!parsed.success) return parsed
  return { success: true, ...parsed.data }
}

export async function fetchChatChannel(
  popId: string,
  channelId: string,
): Promise<
  | { success: true; data: ChatChannelDetailData }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/chat/${channelId}`, {
    headers: { accept: "application/json" },
  })
  return parseJson<ChatChannelDetailData>(res)
}

export async function fetchChatMessages(
  popId: string,
  channelId: string,
  cursor?: ChatMessageCursor | null,
  limit = 40,
): Promise<
  | { success: true; data: ChatMessagesPage }
  | { success: false; error: string }
> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor?.createdAt) params.set("before", cursor.createdAt)
  if (cursor?.id) params.set("beforeId", cursor.id)
  const res = await fetch(
    `/api/pops/${popId}/chat/${channelId}/messages?${params}`,
    { headers: { accept: "application/json" } },
  )
  return parseJson<ChatMessagesPage>(res)
}

export async function createChatChannel(
  popId: string,
  input: UpsertChatChannelInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const res = await fetch(`/api/pops/${popId}/chat`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      title: input.title,
      subtitle: input.subtitle || null,
      imageUrl: input.imageUrl.trim() || null,
      userIds: input.userIds,
    }),
  })
  const parsed = await parseJson<{ id: string }>(res)
  if (!parsed.success) return parsed
  return { success: true, id: parsed.data.id }
}

export async function updateChatChannel(
  popId: string,
  channelId: string,
  input: UpsertChatChannelInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/chat/${channelId}`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      title: input.title,
      subtitle: input.subtitle || null,
      imageUrl: input.imageUrl.trim() || null,
      userIds: input.userIds,
    }),
  })
  const parsed = await parseJson<unknown>(res)
  return parsed.success ? { success: true } : parsed
}

export async function uploadChatChannelImage(
  popId: string,
  formData: FormData,
): Promise<
  { success: true; imageUrl: string } | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/chat/image`, {
    method: "POST",
    headers: { accept: "application/json" },
    body: formData,
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ imageUrl: string }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, imageUrl: json.data.imageUrl }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function deleteChatChannel(
  popId: string,
  channelId: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/chat/${channelId}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  const parsed = await parseJson<unknown>(res)
  return parsed.success ? { success: true } : parsed
}

export async function sendChatMessage(
  popId: string,
  channelId: string,
  body: string,
): Promise<
  | { success: true; message: ChatMessageRow }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/chat/${channelId}/messages`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  })
  const parsed = await parseJson<ChatMessageRow>(res)
  if (!parsed.success) return parsed
  return { success: true, message: parsed.data }
}

export async function markChatChannelRead(popId: string, channelId: string) {
  await fetch(`/api/pops/${popId}/chat/${channelId}/read`, {
    method: "POST",
    headers: { accept: "application/json" },
  })
}
