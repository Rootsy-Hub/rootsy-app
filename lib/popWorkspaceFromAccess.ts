import type {
  PopAccessCache,
  UserProfileCache,
} from "@/app/home/homeUserDataTypes"
import { buildUserProfileFullName } from "@/app/home/homeUserDataResolve"
import { normalizePopAccessCache } from "@/lib/popAccessNormalize"
import { permissionKeysFromPopAccess } from "@/lib/popAccessPermissions"
import type { PopWorkspaceBootstrapData } from "@/lib/popWorkspaceBootstrap"

export function buildPopRoleLabel(access: PopAccessCache): string {
  if (access.isOwner) return "Dueño"
  return access.role?.displayName || access.role?.name || "Miembro"
}

/** Vista compatible con `PopWorkspaceBootstrapData` armada desde cache. */
export function buildWorkspaceBootstrapFromAccess(
  access: PopAccessCache,
  profile: UserProfileCache,
): PopWorkspaceBootstrapData {
  const normalized = normalizePopAccessCache(access)!
  return {
    popId: normalized.pop.id,
    siteId: normalized.pop.siteId,
    popName: normalized.pop.name,
    backgroundImageUrl: normalized.pop.backgroundImageUrl,
    hasAccess: true,
    isPopActive: normalized.pop.isActive,
    userFullName: buildUserProfileFullName(profile),
    userImageUrl: profile.imageUrl,
    roleLabel: buildPopRoleLabel(normalized),
    permissionKeys: permissionKeysFromPopAccess(normalized),
    hasValidPopFiscalCuit: normalized.fiscal.hasValidCuit,
    popEmisorIvaCondition: normalized.fiscal.emisorIvaCondition,
  }
}
