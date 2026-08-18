import { toISODateLocal } from "@/lib/dataWorkspaceDateFilter"
import type { CheckDirection } from "@/lib/checkDocuments"

export type CheckCreateFormState = {
  direction: CheckDirection
  checkNumber: string
  bankName: string
  amount: string
  issueDate: string
  dueDate: string
  partyName: string
  partyId: string
  notes: string
}

export function defaultCheckCreateFormState(
  direction: CheckDirection,
): CheckCreateFormState {
  const today = toISODateLocal(new Date())
  return {
    direction,
    checkNumber: "",
    bankName: "",
    amount: "",
    issueDate: today,
    dueDate: today,
    partyName: "",
    partyId: "",
    notes: "",
  }
}
