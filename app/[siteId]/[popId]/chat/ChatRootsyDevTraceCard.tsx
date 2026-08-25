"use client"

import {
  chatRootsyDevActorLabel,
  fillChatRootsyDevStations,
  type ChatRootsyDevCall,
  type ChatRootsyDevTrace,
} from "@/lib/chat/chatRootsyDevTrace"
import { downloadDevmodeJson } from "@/lib/devmode"
import { Download } from "lucide-react"
import { useState } from "react"

type Props = {
  trace?: ChatRootsyDevTrace | null
}

export function ChatRootsyDevTraceCard({ trace }: Props) {
  const filled = fillChatRootsyDevStations(trace)
  const calls = filled.calls

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="font-canopy text-[11px] leading-4 text-rootsy-bruma-600">
        Rootsy apertura, cada viaje del Planificador y Rootsy cierre o
        aclaración. Cada uno tiene enviado y recibido. Al abrir, todo queda
        cerrado.
      </p>
      <button
        type="button"
        className="mt-2 inline-flex items-center gap-1 font-canopy text-[11px] font-semibold text-[var(--rootsy-sol-800)] underline-offset-2 hover:underline"
        onClick={() =>
          downloadDevmodeJson(
            `chat-rootsy-devmode-${Date.now()}.json`,
            filled,
          )
        }
      >
        <Download className="size-3" aria-hidden />
        Bajar JSON
      </button>
      {filled.error ? (
        <div className="mt-3 rounded-lg border border-[var(--rootsy-danger)]/40 bg-white px-2.5 py-2">
          <p className="font-canopy text-[10px] font-bold uppercase tracking-wide text-rootsy-danger">
            Error
          </p>
          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-4 text-rootsy-bruma-900">
            {filled.error}
          </pre>
        </div>
      ) : null}
      <ol className="mt-3 min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-4">
        {calls.map((call, index) => (
          <DevCallBlock
            key={call.id ?? `${call.actor}-${index}`}
            call={call}
            index={index}
          />
        ))}
      </ol>
    </div>
  )
}

function DevCallBlock({
  call,
  index,
}: {
  call: ChatRootsyDevCall
  index: number
}) {
  const actor = chatRootsyDevActorLabel(call.actor)
  return (
    <li>
      <p className="font-canopy text-sm font-bold text-rootsy-bruma-900">
        <span className="tabular-nums text-rootsy-bruma-400">{index + 1}.</span>{" "}
        {actor}
        {call.phase ? (
          <span className="ml-1.5 font-medium text-rootsy-bruma-500">
            · {call.phase}
          </span>
        ) : null}
      </p>
      {call.userMessage ? (
        <p className="mt-1 font-canopy text-xs leading-4 text-rootsy-bruma-700">
          Mensaje: {call.userMessage}
        </p>
      ) : null}
      {call.note ? (
        <p className="mt-1 font-canopy text-xs leading-4 text-rootsy-bruma-500">
          {call.note}
        </p>
      ) : null}
      <div className="mt-2 space-y-2">
        <DevIoBlock letter="a" label="Enviado" body={call.sent} />
        <DevIoBlock letter="b" label="Recibido" body={call.received} />
      </div>
    </li>
  )
}

function DevIoBlock({
  letter,
  label,
  body,
}: {
  letter: string
  label: string
  body: string
}) {
  const [copied, setCopied] = useState(false)
  return (
    <details className="rounded-lg bg-rootsy-bruma-50 px-2.5 py-2">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-canopy text-xs font-semibold text-rootsy-bruma-900 [&::-webkit-details-marker]:hidden">
        <span className="tabular-nums text-[10px] text-rootsy-bruma-400">
          {letter}.
        </span>
        {label}
      </summary>
      <div className="mt-1.5">
        <button
          type="button"
          className="font-canopy text-[10px] text-[var(--rootsy-sol-800)] underline-offset-2 hover:underline"
          onClick={() => {
            void navigator.clipboard.writeText(body)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1200)
          }}
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
        <pre className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-4 text-rootsy-bruma-900">
          {body}
        </pre>
      </div>
    </details>
  )
}
