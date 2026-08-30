"use client"

import { usePopWorkspaceOptional } from "@/context/PopWorkspaceContext"
import {
  derivePopOperateCapabilities,
  moduleKeysFromPopAccess,
  OPEN_POP_OPERATE_CAPABILITIES,
  type PopOperateCapabilities,
} from "@/lib/popOperateCapabilities"

export function usePopOperateCapabilities(): {
  caps: PopOperateCapabilities
  ready: boolean
} {
  const workspace = usePopWorkspaceOptional()
  if (!workspace) {
    return { caps: OPEN_POP_OPERATE_CAPABILITIES, ready: true }
  }
  if (workspace.loading) {
    return { caps: derivePopOperateCapabilities([]), ready: false }
  }
  return {
    caps: derivePopOperateCapabilities(
      moduleKeysFromPopAccess(workspace.popAccess?.enabledModules),
    ),
    ready: true,
  }
}
