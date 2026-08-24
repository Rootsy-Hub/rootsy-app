import "server-only"

import { createHmac, randomBytes } from "node:crypto"

export const ROOTSY_AI_EXECUTION_HEADER = "x-rootsy-execution"

export function signRootsyAiExecution(input: {
  secret: string
  userId: string
  popId: string
  method: string
  path: string
  timestamp?: number
  nonce?: string
}): string {
  const timestamp = input.timestamp ?? Date.now()
  const nonce = input.nonce ?? randomBytes(8).toString("hex")
  const payload = `${timestamp}.${nonce}.${input.userId}.${input.popId}.${input.method.toUpperCase()}.${input.path}`
  const sig = createHmac("sha256", input.secret).update(payload).digest("hex")
  return `v1=${timestamp}.${nonce}.${sig}`
}
