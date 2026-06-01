"use server"

import { getWorkspaceHeaderForPop } from "@/lib/workspaceHeaderServer"

export async function getLayoutPreviewHeaderData(popId: string) {
  return getWorkspaceHeaderForPop(popId)
}
