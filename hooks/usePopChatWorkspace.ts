"use client"

import type { ChatWorkspaceData } from "@/app/[siteId]/[popId]/chat/chatTypes"
import { chatWorkspaceQueryOptions } from "@/lib/chatWorkspaceQuery"
import { useQuery } from "@tanstack/react-query"

export function usePopChatWorkspace(
  popId: string | undefined,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)

  return useQuery<ChatWorkspaceData>({
    ...chatWorkspaceQueryOptions(popId ?? ""),
    enabled,
  })
}
