"use client"

import { layoutsOperarStepErrorBannerClass } from "@/app/library/layouts/layoutsOperarStyles"
import { CircleAlert } from "lucide-react"

type Props = {
  messages: string[]
}

export function ServiceOperateStepErrorBanner({ messages }: Props) {
  if (messages.length === 0) return null

  return (
    <div className={layoutsOperarStepErrorBannerClass} role="alert">
      <CircleAlert
        className="mt-0.5 size-4 shrink-0 text-[#fca5a5]"
        aria-hidden
      />
      {messages.length === 1 ? (
        <span className="min-w-0 flex-1">{messages[0]}</span>
      ) : (
        <ul className="min-w-0 flex-1 space-y-1">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
