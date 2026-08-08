import { allUniquePermissionKeys } from "@/lib/popPageCrudConstants"
import { getPopById } from "@/lib/popHelpers"

function sameUserId(a: string, b: string): boolean {
  return a.replace(/-/g, "").toLowerCase().trim() ===
    b.replace(/-/g, "").toLowerCase().trim()
}

export async function isPopOwnerUser(
  popId: string,
  userId: string,
): Promise<boolean> {
  const popRes = await getPopById(popId, { includeOwnerUserId: true })
  if (!popRes.success || !popRes.pop) return false
  const ownerUserId =
    "ownerUserId" in popRes.pop ? popRes.pop.ownerUserId : null
  if (!ownerUserId) return false
  return sameUserId(ownerUserId, userId)
}

/** El dueño del POP tiene acceso a todas las pantallas definidas en POP_PAGES. */
export function mergeOwnerPermissionKeys(
  keys: readonly string[],
  isOwner: boolean,
): string[] {
  if (!isOwner) return [...keys]
  return [...new Set([...keys, ...allUniquePermissionKeys()])]
}
