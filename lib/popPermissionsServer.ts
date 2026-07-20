import { cache } from "react"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import {
  isPopOwnerUser,
  mergeOwnerPermissionKeys,
} from "@/lib/popOwnerPermissions"
import { permissionRowsToKeys } from "@/lib/popPermissionConstants"
import { createClient } from "@/utils/supabase/server"

export type PopPermissionsSnapshotJSON = {
  keys: string[]
}

const fetchPopPermissionsForUser = cache(
  async (popId: string, userId: string): Promise<PopPermissionsSnapshotJSON> => {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc("get_user_all_permissions", {
      p_pop_id: popId,
      p_user_id: userId,
    })
    if (error || !Array.isArray(data)) {
      return { keys: [] }
    }
    return { keys: permissionRowsToKeys(data) }
  },
)

export async function loadPopPermissionsSnapshot(
  popId: string,
): Promise<PopPermissionsSnapshotJSON> {
  const user = await requireAuthenticatedUser()
  const snapshot = await fetchPopPermissionsForUser(popId, user.uid)
  const owner = await isPopOwnerUser(popId, user.uid)
  return {
    keys: mergeOwnerPermissionKeys(snapshot.keys, owner),
  }
}
