import type { HrPermissionCatalogRow } from "@/lib/hrPermissionCatalog"

export type EmployeeRow = {
  id: string
  userId: string | null
  firstName: string
  lastName: string
  jobTitle: string | null
  documentNumber: string | null
  email: string | null
  phone: string | null
  monthlySalary: number | null
  hiredAt: string | null
  leftAt: string | null
  notes: string | null
  isClockedIn: boolean
  clockedInAt: string | null
}

export type AttendancePunchRow = {
  id: string
  clockedInAt: string
  clockedOutAt: string | null
}

export type DayMarkKind = "franco" | "falta"

export type FrancoRow = {
  id: string
  day: string
  kind: DayMarkKind
}

export type EmployeePaymentRow = {
  id: string
  amount: number
  paidAt: string
  paymentKind: string
  treasuryAccountId: string
  treasuryAccountName: string | null
  notes: string | null
}

export type PopRoleRow = {
  id: string
  name: string
  displayName: string
  description: string | null
  isSystem: boolean
  popId: string | null
}

export type MemberRow = {
  userId: string
  roleId: string
  roleDisplayName: string
  roleName: string
  firstName: string
  lastName: string
  imageUrl: string | null
  invitedAt: string | null
  isOwner: boolean
  isActive: boolean
}

export type PendingInviteRow = {
  id: string
  email: string
  employeeId: string | null
  roleId: string
  roleDisplayName: string
  message: string | null
  createdAt: string
  expiresAt: string
  inviteUrl: string
}

export type PermissionCatalogRow = HrPermissionCatalogRow

export type HrDashboardData = {
  popName: string
  isOwner: boolean
  canManageInvites: boolean
  canManagePeople: boolean
  permissionKeys: string[]
  roles: PopRoleRow[]
  members: MemberRow[]
  employees: EmployeeRow[]
  pendingInvites: PendingInviteRow[]
}

export type UpsertEmployeeInput = {
  id?: string
  firstName: string
  lastName: string
  jobTitle: string
  documentNumber: string
  email: string
  phone: string
  monthlySalary: string
  hiredAt: string
  notes: string
}
