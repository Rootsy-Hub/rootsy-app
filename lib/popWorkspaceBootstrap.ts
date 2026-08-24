import type { PopEmisorIvaCondition } from "@/lib/saleComprobanteRules"

export type PopWorkspaceBootstrapData = {
  popId: string
  siteId: string
  popName: string
  backgroundImageUrl: string | null
  hasAccess: boolean
  isPopActive: boolean
  userFullName: string
  userImageUrl: string | null
  roleLabel: string
  permissionKeys: string[]
  canSetApprovalCode: boolean
  hasValidPopFiscalCuit: boolean
  popEmisorIvaCondition: PopEmisorIvaCondition
}

export type PopWorkspaceBootstrapResult =
  | { success: true; data: PopWorkspaceBootstrapData }
  | { success: false; error: string; redirect?: string }
