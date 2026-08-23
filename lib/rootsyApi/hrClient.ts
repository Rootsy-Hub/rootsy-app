import type {
  AttendancePunchRow,
  ClockByPinResult,
  DayMarkKind,
  EmployeePaymentRow,
  EmployeeRow,
  FrancoRow,
  HrDashboardData,
  PermissionCatalogRow,
  UpsertEmployeeInput,
} from "@/app/[siteId]/[popId]/hr/hrTypes"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import { buildHrPermissionCatalogRows } from "@/lib/hrPermissionCatalog"

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

async function parseMutate(res: Response): Promise<MutateResult> {
  const parsed = await parseJson<unknown>(res)
  return parsed.success ? { success: true } : parsed
}

export async function fetchHrDashboard(
  popId: string,
): Promise<
  | ({ success: true } & HrDashboardData)
  | { success: false; error: string; redirect?: string }
> {
  const res = await fetch(`/api/pops/${popId}/hr`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseJson<HrDashboardData>(res)
  if (!parsed.success) return parsed
  return { success: true, ...parsed.data }
}

export async function fetchHrEmployeeDetail(
  popId: string,
  employeeId: string,
): Promise<
  | {
      success: true
      employee: EmployeeRow
      punches: AttendancePunchRow[]
      francos: FrancoRow[]
      payments: EmployeePaymentRow[]
      imageUrl: string | null
      canManagePeople: boolean
    }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/hr/employees/${employeeId}`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseJson<{
    employee: EmployeeRow
    punches: AttendancePunchRow[]
    francos: FrancoRow[]
    payments: EmployeePaymentRow[]
    imageUrl: string | null
    canManagePeople: boolean
  }>(res)
  if (!parsed.success) return parsed
  return { success: true, ...parsed.data }
}

export async function upsertPopEmployee(
  popId: string,
  input: UpsertEmployeeInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const path = input.id
    ? `/api/pops/${popId}/hr/employees/${input.id}`
    : `/api/pops/${popId}/hr/employees`
  const res = await fetch(path, {
    method: input.id ? "PATCH" : "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const parsed = await parseJson<{ id: string }>(res)
  if (!parsed.success) return parsed
  return { success: true, id: parsed.data.id }
}

export async function markEmployeeLeft(popId: string, employeeId: string) {
  const res = await fetch(`/api/pops/${popId}/hr/employees/${employeeId}/left`, {
    method: "POST",
    headers: { accept: "application/json" },
  })
  return parseMutate(res)
}

export async function markEmployeeReturned(popId: string, employeeId: string) {
  const res = await fetch(
    `/api/pops/${popId}/hr/employees/${employeeId}/returned`,
    { method: "POST", headers: { accept: "application/json" } },
  )
  return parseMutate(res)
}

export async function clockEmployeeIn(popId: string, employeeId: string) {
  const res = await fetch(
    `/api/pops/${popId}/hr/employees/${employeeId}/clock-in`,
    { method: "POST", headers: { accept: "application/json" } },
  )
  return parseMutate(res)
}

export async function clockEmployeeOut(popId: string, employeeId: string) {
  const res = await fetch(
    `/api/pops/${popId}/hr/employees/${employeeId}/clock-out`,
    { method: "POST", headers: { accept: "application/json" } },
  )
  return parseMutate(res)
}

export async function fetchClockStation(popId: string) {
  const res = await fetch(`/api/pops/${popId}/hr/clock-station`, {
    headers: { accept: "application/json" },
  })
  return parseJson<{
    canManageStation: boolean
    clockStationPin: string | null
  }>(res)
}

export async function unlockClockStation(popId: string, pin: string) {
  const res = await fetch(`/api/pops/${popId}/hr/clock-station/unlock`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  })
  return parseMutate(res)
}

export async function rotateClockStationPin(popId: string) {
  const res = await fetch(`/api/pops/${popId}/hr/clock-station/pin`, {
    method: "POST",
    headers: { accept: "application/json" },
  })
  return parseJson<{ clockStationPin: string }>(res)
}

export async function clockEmployeeByPin(popId: string, pin: string) {
  const res = await fetch(`/api/pops/${popId}/hr/clock`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  })
  return parseJson<ClockByPinResult>(res)
}

export async function rotateEmployeeClockPin(popId: string, employeeId: string) {
  const res = await fetch(
    `/api/pops/${popId}/hr/employees/${employeeId}/clock-pin`,
    { method: "POST", headers: { accept: "application/json" } },
  )
  return parseJson<{ clockPin: string }>(res)
}

export async function markEmployeeFranco(
  popId: string,
  employeeId: string,
  day: string,
  kind: DayMarkKind = "franco",
) {
  const res = await fetch(
    `/api/pops/${popId}/hr/employees/${employeeId}/francos`,
    {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ day, kind }),
    },
  )
  return parseMutate(res)
}

export async function removeEmployeeFranco(
  popId: string,
  employeeId: string,
  francoId: string,
) {
  const res = await fetch(
    `/api/pops/${popId}/hr/employees/${employeeId}/francos/${francoId}`,
    { method: "DELETE", headers: { accept: "application/json" } },
  )
  return parseMutate(res)
}

export async function fetchHrPaymentContext(
  popId: string,
): Promise<
  | { success: true; context: TreasuryPaymentContext }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/hr/payment-context`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseJson<TreasuryPaymentContext>(res)
  if (!parsed.success) return parsed
  return { success: true, context: parsed.data }
}

export async function recordEmployeePayment(
  popId: string,
  employeeId: string,
  input: {
    amount: number
    paidAt: string
    paymentKind: string
    treasuryAccountId: string
    notes?: string | null
  },
) {
  const res = await fetch(
    `/api/pops/${popId}/hr/employees/${employeeId}/payments`,
    {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  )
  return parseMutate(res)
}

export async function inviteUserToPop(
  popId: string,
  _emailRaw: string,
  roleId: string,
  message?: string | null,
  employeeId?: string | null,
): Promise<
  | {
      success: true
      emailSent: boolean
      inviteUrl: string
      emailError?: string
      resendConfigured: boolean
    }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/hr/invitations`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      employeeId,
      roleId,
      message: message ?? null,
    }),
  })
  const parsed = await parseJson<{
    inviteUrl: string
    emailSent: boolean
    emailError?: string
    resendConfigured: boolean
  }>(res)
  if (!parsed.success) return parsed
  return { success: true, ...parsed.data }
}

export async function revokePopInvitation(popId: string, invitationId: string) {
  const res = await fetch(
    `/api/pops/${popId}/hr/invitations/${invitationId}/revoke`,
    { method: "POST", headers: { accept: "application/json" } },
  )
  return parseMutate(res)
}

export async function renewPopInvitation(popId: string, invitationId: string) {
  const res = await fetch(
    `/api/pops/${popId}/hr/invitations/${invitationId}/renew`,
    { method: "POST", headers: { accept: "application/json" } },
  )
  return parseMutate(res)
}

export async function deactivatePopMember(popId: string, memberUserId: string) {
  const res = await fetch(
    `/api/pops/${popId}/hr/members/${memberUserId}/deactivate`,
    { method: "POST", headers: { accept: "application/json" } },
  )
  return parseMutate(res)
}

export async function reactivatePopMember(popId: string, memberUserId: string) {
  const res = await fetch(
    `/api/pops/${popId}/hr/members/${memberUserId}/reactivate`,
    { method: "POST", headers: { accept: "application/json" } },
  )
  return parseMutate(res)
}

export async function updatePopMemberRole(
  popId: string,
  memberUserId: string,
  roleId: string,
) {
  const res = await fetch(`/api/pops/${popId}/hr/members/${memberUserId}/role`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ roleId }),
  })
  return parseMutate(res)
}

export async function deleteInactivePopMember(
  popId: string,
  memberUserId: string,
) {
  const res = await fetch(`/api/pops/${popId}/hr/members/${memberUserId}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  return parseMutate(res)
}

export async function getRolePermissionsEditorData(
  popId: string,
  roleId: string,
): Promise<
  | {
      success: true
      role: { id: string; displayName: string; name: string }
      permissions: PermissionCatalogRow[]
      selectedGrantKeys: string[]
    }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/hr/roles/${roleId}`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseJson<{
    role: { id: string; displayName: string; name: string }
    selectedGrantKeys: string[]
  }>(res)
  if (!parsed.success) return parsed
  const permissions = buildHrPermissionCatalogRows({
    businessTypeName: "platform_full",
    allModules: true,
  })
  return {
    success: true,
    role: parsed.data.role,
    permissions,
    selectedGrantKeys: parsed.data.selectedGrantKeys,
  }
}

export async function savePopRolePermissions(
  popId: string,
  roleId: string,
  grantKeys: string[],
) {
  const res = await fetch(`/api/pops/${popId}/hr/roles/${roleId}`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ grantKeys }),
  })
  return parseMutate(res)
}

export async function createPopRole(
  popId: string,
  displayName: string,
  grantKeys: string[],
): Promise<{ success: true; roleId: string } | { success: false; error: string }> {
  const res = await fetch(`/api/pops/${popId}/hr/roles`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ displayName, grantKeys }),
  })
  const parsed = await parseJson<{ roleId: string }>(res)
  if (!parsed.success) return parsed
  return { success: true, roleId: parsed.data.roleId }
}

export async function deletePopRole(popId: string, roleId: string) {
  const res = await fetch(`/api/pops/${popId}/hr/roles/${roleId}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  return parseMutate(res)
}
