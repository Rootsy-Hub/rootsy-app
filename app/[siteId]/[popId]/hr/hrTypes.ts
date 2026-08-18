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
