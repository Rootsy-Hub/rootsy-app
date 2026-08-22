import "server-only"

import { rootsyApiFetch } from "@/lib/rootsyApi/server"

export async function publishPopDomainEvent(input: {
  popId: string
  type: string
  payload?: Record<string, unknown>
  resource?: { type: string; id: string }
  require?: { permissions?: string[] }
  channels?: string[]
}) {
  return rootsyApiFetch<{ success: true; seq: number }>(
    `/v1/pops/${input.popId}/realtime/events`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: input.type,
        payload: input.payload ?? {},
        resource: input.resource,
        require: input.require,
        channels: input.channels,
      }),
    },
  )
}
