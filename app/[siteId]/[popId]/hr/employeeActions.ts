"use server"

import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { parseMoneyInput } from "@/lib/moneyInput"
import { POP_PERMS, permissionKeysInclude } from "@/lib/popPermissionConstants"
import { validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import type {
  AttendancePunchRow,
  EmployeeRow,
  UpsertEmployeeInput,
} from "@/app/[siteId]/[popId]/hr/hrTypes"
import { createClient } from "@/utils/supabase/server"
import { createServiceRoleClient } from "@/utils/supabase/service-role"

async function requireHrWrite(popId: string, action: "create" | "update" | "delete") {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { ok: false as const, error: access.error || "Sin acceso al local" }
  }
  const perms = await loadPopPermissionsSnapshot(popId)
  const allowed =
    permissionKeysInclude(perms.keys, "hr", action) ||
    permissionKeysInclude(perms.keys, "hr", "update")
  if (!allowed) {
    return {
      ok: false as const,
      error: "No tenés permiso para administrar personas de este local.",
    }
  }
  await requireAuthenticatedUser()
  return { ok: true as const }
}

function mapEmployee(
  row: {
    id: string
    user_id: string | null
    first_name: string
    last_name: string
    job_title: string | null
    document_number: string | null
    email: string | null
    phone: string | null
    monthly_salary: number | string | null
    hired_at: string | null
    left_at: string | null
    notes: string | null
  },
  openByEmployee: Map<string, string>,
): EmployeeRow {
  const salary =
    row.monthly_salary == null || row.monthly_salary === ""
      ? null
      : Number(row.monthly_salary)
  return {
    id: row.id,
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    jobTitle: row.job_title,
    documentNumber: row.document_number,
    email: row.email,
    phone: row.phone,
    monthlySalary: Number.isFinite(salary) ? salary : null,
    hiredAt: row.hired_at,
    leftAt: row.left_at,
    notes: row.notes,
    isClockedIn: openByEmployee.has(row.id),
    clockedInAt: openByEmployee.get(row.id) ?? null,
  }
}

export async function listPopEmployees(popId: string): Promise<
  { success: true; employees: EmployeeRow[] } | { success: false; error: string }
> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso" }
  }
  const supabase = await createClient()
  const { data: rows, error } = await supabase
    .from("pop_employees")
    .select(
      "id, user_id, first_name, last_name, job_title, document_number, email, phone, monthly_salary, hired_at, left_at, notes",
    )
    .eq("pop_id", popId)
    .order("last_name")
    .order("first_name")

  if (error) return { success: false, error: error.message }

  const { data: openRows } = await supabase
    .from("pop_employee_attendance")
    .select("employee_id, clocked_in_at")
    .eq("pop_id", popId)
    .is("clocked_out_at", null)

  const openByEmployee = new Map<string, string>()
  for (const punch of openRows || []) {
    openByEmployee.set(punch.employee_id, punch.clocked_in_at)
  }

  return {
    success: true,
    employees: (rows || []).map((row) => mapEmployee(row, openByEmployee)),
  }
}

export async function getPopEmployeeDetail(
  popId: string,
  employeeId: string,
): Promise<
  | {
      success: true
      employee: EmployeeRow
      punches: AttendancePunchRow[]
      imageUrl: string | null
      canManagePeople: boolean
    }
  | { success: false; error: string }
> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso" }
  }

  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from("pop_employees")
    .select(
      "id, user_id, first_name, last_name, job_title, document_number, email, phone, monthly_salary, hired_at, left_at, notes",
    )
    .eq("pop_id", popId)
    .eq("id", employeeId)
    .maybeSingle()

  if (error) return { success: false, error: error.message }
  if (!row) return { success: false, error: "No encontramos a esa persona." }

  const { data: punchRows, error: punchError } = await supabase
    .from("pop_employee_attendance")
    .select("id, clocked_in_at, clocked_out_at")
    .eq("pop_id", popId)
    .eq("employee_id", employeeId)
    .order("clocked_in_at", { ascending: false })
    .limit(500)

  if (punchError) return { success: false, error: punchError.message }

  const punches: AttendancePunchRow[] = (punchRows || []).map((punch) => ({
    id: punch.id,
    clockedInAt: punch.clocked_in_at,
    clockedOutAt: punch.clocked_out_at,
  }))
  const openPunch = punches.find((punch) => punch.clockedOutAt == null)
  const openByEmployee = new Map<string, string>()
  if (openPunch) openByEmployee.set(row.id, openPunch.clockedInAt)

  let imageUrl: string | null = null
  if (row.user_id) {
    const { data: profile } = await supabase
      .from("users")
      .select("image_url")
      .eq("id", row.user_id)
      .maybeSingle()
    imageUrl = profile?.image_url ?? null
  }

  const perms = await loadPopPermissionsSnapshot(popId)
  const canManagePeople =
    permissionKeysInclude(perms.keys, "hr", "create") ||
    permissionKeysInclude(perms.keys, "hr", "update")

  return {
    success: true,
    employee: mapEmployee(row, openByEmployee),
    punches,
    imageUrl,
    canManagePeople,
  }
}

type MemberSeed = {
  userId: string
  firstName: string
  lastName: string
  isActive: boolean
  isOwner: boolean
  roleDisplayName: string
}

export async function ensureEmployeesFromMembers(
  popId: string,
  members: MemberSeed[],
): Promise<void> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) return
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from("pop_employees")
    .select("id, user_id, email, first_name, last_name")
    .eq("pop_id", popId)

  const known = new Set(
    (existing || []).map((row) => row.user_id).filter(Boolean) as string[],
  )
  const unlinkedByEmail = new Map<string, string>()
  const stubIdsByUser = new Map<string, string>()
  for (const row of existing || []) {
    if (!row.user_id && row.email) {
      unlinkedByEmail.set(String(row.email).trim().toLowerCase(), row.id)
    }
    if (row.user_id && isEmployeeStubName(row.first_name, row.last_name)) {
      stubIdsByUser.set(row.user_id, row.id)
    }
  }

  const missing = members.filter(
    (member) => member.isActive && member.userId && !known.has(member.userId),
  )
  const stubsToHeal = members.filter(
    (member) => member.isActive && member.userId && stubIdsByUser.has(member.userId),
  )
  if (missing.length === 0 && stubsToHeal.length === 0) return

  let admin: ReturnType<typeof createServiceRoleClient> | null = null
  try {
    admin = createServiceRoleClient()
  } catch {
    admin = null
  }

  const stillMissing: Array<MemberSeed & { email: string }> = []
  for (const member of missing) {
    const email = await authEmailForUser(admin, member.userId)
    const employeeId = email ? unlinkedByEmail.get(email) : undefined
    if (employeeId) {
      await supabase
        .from("pop_employees")
        .update({ user_id: member.userId })
        .eq("pop_id", popId)
        .eq("id", employeeId)
        .is("user_id", null)
      continue
    }
    stillMissing.push({ ...member, email })
  }

  for (const member of stubsToHeal) {
    const email = await authEmailForUser(admin, member.userId)
    const employeeId = stubIdsByUser.get(member.userId)
    if (!employeeId) continue
    await supabase
      .from("pop_employees")
      .update({
        first_name: member.firstName.trim() || emailLocalPart(email) || "Persona",
        last_name: member.lastName.trim(),
        email: email || null,
      })
      .eq("pop_id", popId)
      .eq("id", employeeId)
  }

  const ownerStubs = stillMissing.filter((member) => member.isOwner)
  if (ownerStubs.length === 0) return

  await supabase.from("pop_employees").insert(
    ownerStubs.map((member) => ({
      pop_id: popId,
      user_id: member.userId,
      first_name:
        member.firstName.trim() || emailLocalPart(member.email) || "Persona",
      last_name: member.lastName.trim(),
      email: member.email || null,
      job_title: "Dueño",
    })),
  )
}

function isEmployeeStubName(firstName: string | null, lastName: string | null) {
  const first = (firstName || "").trim()
  const last = (lastName || "").trim()
  return !first || (first === "Sin" && !last)
}

function emailLocalPart(email: string) {
  const local = email.split("@")[0]?.trim()
  return local || ""
}

async function authEmailForUser(
  admin: ReturnType<typeof createServiceRoleClient> | null,
  userId: string,
): Promise<string> {
  if (!admin) return ""
  const { data } = await admin.auth.admin.getUserById(userId)
  return data.user?.email?.trim().toLowerCase() ?? ""
}

export async function upsertPopEmployee(
  popId: string,
  input: UpsertEmployeeInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const gate = await requireHrWrite(popId, input.id ? "update" : "create")
  if (!gate.ok) return { success: false, error: gate.error }

  const firstName = input.firstName.trim()
  if (!firstName) {
    return { success: false, error: "El nombre es obligatorio." }
  }

  const salaryRaw = input.monthlySalary.trim()
  let monthlySalary: number | null = null
  if (salaryRaw) {
    const parsed = parseMoneyInput(salaryRaw, Number.NaN)
    if (!Number.isFinite(parsed) || parsed < 0) {
      return { success: false, error: "El sueldo no es válido." }
    }
    monthlySalary = parsed
  }

  const payload = {
    pop_id: popId,
    first_name: firstName,
    last_name: input.lastName.trim(),
    job_title: input.jobTitle.trim() || null,
    document_number: input.documentNumber.trim() || null,
    email: input.email.trim().toLowerCase() || null,
    phone: input.phone.trim() || null,
    monthly_salary: monthlySalary,
    hired_at: input.hiredAt.trim() || null,
    notes: input.notes.trim() || null,
  }

  const supabase = await createClient()
  if (input.id) {
    const { error } = await supabase
      .from("pop_employees")
      .update(payload)
      .eq("pop_id", popId)
      .eq("id", input.id)
    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Ya hay alguien activo con ese correo." }
      }
      return { success: false, error: error.message }
    }
    return { success: true, id: input.id }
  }

  const { data, error } = await supabase
    .from("pop_employees")
    .insert(payload)
    .select("id")
    .single()
  if (error || !data) {
    if (error?.code === "23505") {
      return { success: false, error: "Ya hay alguien activo con ese correo." }
    }
    return { success: false, error: error?.message || "No se pudo guardar." }
  }
  return { success: true, id: data.id }
}

export async function markEmployeeLeft(
  popId: string,
  employeeId: string,
): Promise<{ success: boolean; error?: string }> {
  const gate = await requireHrWrite(popId, "update")
  if (!gate.ok) return { success: false, error: gate.error }

  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  await supabase
    .from("pop_employee_attendance")
    .update({ clocked_out_at: new Date().toISOString() })
    .eq("pop_id", popId)
    .eq("employee_id", employeeId)
    .is("clocked_out_at", null)

  const { error } = await supabase
    .from("pop_employees")
    .update({ left_at: today })
    .eq("pop_id", popId)
    .eq("id", employeeId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function markEmployeeReturned(
  popId: string,
  employeeId: string,
): Promise<{ success: boolean; error?: string }> {
  const gate = await requireHrWrite(popId, "update")
  if (!gate.ok) return { success: false, error: gate.error }

  const supabase = await createClient()
  const { data: employee, error: lookErr } = await supabase
    .from("pop_employees")
    .select("id, left_at")
    .eq("pop_id", popId)
    .eq("id", employeeId)
    .maybeSingle()
  if (lookErr) return { success: false, error: lookErr.message }
  if (!employee) return { success: false, error: "No encontramos a esa persona." }
  if (!employee.left_at) {
    return { success: false, error: "Esa persona ya está en el equipo." }
  }

  const { error } = await supabase
    .from("pop_employees")
    .update({ left_at: null })
    .eq("pop_id", popId)
    .eq("id", employeeId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function clockEmployeeIn(
  popId: string,
  employeeId: string,
): Promise<{ success: boolean; error?: string }> {
  const gate = await requireHrWrite(popId, "update")
  if (!gate.ok) return { success: false, error: gate.error }

  const supabase = await createClient()
  const { data: employee } = await supabase
    .from("pop_employees")
    .select("id, left_at")
    .eq("pop_id", popId)
    .eq("id", employeeId)
    .maybeSingle()
  if (!employee) return { success: false, error: "No encontramos a esa persona." }
  if (employee.left_at) {
    return { success: false, error: "Esa persona ya no trabaja en este local." }
  }

  const { error } = await supabase.from("pop_employee_attendance").insert({
    pop_id: popId,
    employee_id: employeeId,
  })
  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Ya está en el local." }
    }
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function clockEmployeeOut(
  popId: string,
  employeeId: string,
): Promise<{ success: boolean; error?: string }> {
  const gate = await requireHrWrite(popId, "update")
  if (!gate.ok) return { success: false, error: gate.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("pop_employee_attendance")
    .update({ clocked_out_at: new Date().toISOString() })
    .eq("pop_id", popId)
    .eq("employee_id", employeeId)
    .is("clocked_out_at", null)
    .select("id")
  if (error) return { success: false, error: error.message }
  if (!data?.length) {
    return { success: false, error: "No está marcada la entrada." }
  }
  return { success: true }
}
