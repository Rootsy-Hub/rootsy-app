"use client"

import {
  chatRootsyDevLaneLabel,
  type ChatRootsyDevLane,
  type ChatRootsyDevTrace,
} from "@/lib/chat/chatRootsyDevTrace"
import { cn } from "@/lib/utils"
import { useState } from "react"

type Props = {
  trace: ChatRootsyDevTrace
}

const LANE_CLASS: Record<ChatRootsyDevLane, string> = {
  rootsy: "bg-rootsy-savia-100 text-rootsy-savia-800",
  planner: "bg-[var(--rootsy-sol-100)] text-[var(--rootsy-sol-900)]",
  api: "bg-rootsy-bruma-100 text-rootsy-bruma-700",
  close: "bg-rootsy-savia-50 text-rootsy-savia-900",
  choice: "bg-[var(--rootsy-sol-50)] text-[var(--rootsy-sol-800)]",
}

export function ChatRootsyDevTraceCard({ trace }: Props) {
  if (!trace.steps.length && !trace.error) return null
  const lastId = trace.steps[trace.steps.length - 1]?.id

  return (
    <details
      className="mt-1 w-full max-w-[min(40rem,96%)] rounded-xl border border-dashed border-[var(--rootsy-sol-400)] bg-[var(--rootsy-sol-50)] px-3 py-2.5"
      open
    >
      <summary className="cursor-pointer font-canopy text-[10px] font-bold uppercase tracking-wide text-[var(--rootsy-sol-800)]">
        DEV · historial de la corrida · {trace.steps.length}{" "}
        {trace.steps.length === 1 ? "paso" : "pasos"}
      </summary>
      <p className="mt-1 font-canopy text-[11px] leading-4 text-rootsy-bruma-600">
        Ida y vuelta de Rootsy, el Planificador y la API. Solo se ve con el flag
        de traza.
      </p>
      {trace.error ? (
        <div className="mt-2 rounded-lg border border-[var(--rootsy-danger)]/40 bg-white px-2.5 py-2">
          <p className="font-canopy text-[10px] font-bold uppercase tracking-wide text-rootsy-danger">
            Error
          </p>
          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-4 text-rootsy-bruma-900">
            {trace.error}
          </pre>
        </div>
      ) : null}
      <ol className="mt-2 space-y-2">
        {trace.steps.map((step, index) => (
          <DevStepBlock
            key={step.id ?? `${step.title}-${index}`}
            step={step}
            index={index}
            defaultOpen={Boolean(trace.error) || step.id === lastId}
          />
        ))}
      </ol>
    </details>
  )
}

function DevStepBlock({
  step,
  index,
  defaultOpen,
}: {
  step: ChatRootsyDevTrace["steps"][number]
  index: number
  defaultOpen: boolean
}) {
  const [copied, setCopied] = useState(false)
  const lane = step.lane ?? "api"

  return (
    <li>
      <details
        className="rounded-lg bg-white/80 px-2.5 py-2"
        open={defaultOpen}
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 font-canopy text-xs font-semibold text-rootsy-bruma-900 [&::-webkit-details-marker]:hidden">
          <span className="tabular-nums text-[10px] text-rootsy-bruma-400">
            {index + 1}
          </span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
              LANE_CLASS[lane],
            )}
          >
            {chatRootsyDevLaneLabel(lane)}
          </span>
          <span className="min-w-0 flex-1">{step.title}</span>
        </summary>
        {step.note ? (
          <p className="mt-1 font-canopy text-xs leading-4 text-rootsy-bruma-600">
            {step.note}
          </p>
        ) : null}
        {step.body ? (
          <div className="mt-1.5">
            <button
              type="button"
              className="font-canopy text-[10px] text-[var(--rootsy-sol-800)] underline-offset-2 hover:underline"
              onClick={() => {
                void navigator.clipboard.writeText(step.body ?? "")
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1200)
              }}
            >
              {copied ? "Copiado" : "Copiar"}
            </button>
            <pre className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-4 text-rootsy-bruma-900">
              {step.body}
            </pre>
          </div>
        ) : null}
      </details>
    </li>
  )
}
