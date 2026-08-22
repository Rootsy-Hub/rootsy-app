"use client"

import { useState } from "react"
import { AUTH_RESEND_COPY } from "@/lib/auth/rootsyAuthUiCopy"
import { resendSignupConfirmationEmail } from "@/app/auth/actions"
import { RootsBanner } from "@/components/rootsy-banner"
import type { BannerIntentId } from "@/components/rootsy-banner/rootsBannerSpecRuntime"

type Props = {
  email: string
  message: string
  next?: string
  intent?: BannerIntentId
}

export function AuthResendConfirmation({
  email,
  message,
  next,
  intent = "success",
}: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = useState("")

  const handleResend = async () => {
    if (status === "sending") return
    setError("")
    setStatus("sending")
    const result = await resendSignupConfirmationEmail({ email, next })
    if (!result.success) {
      setError(result.error)
      setStatus("idle")
      return
    }
    setStatus("sent")
  }

  return (
    <div className="space-y-3">
      <RootsBanner
        intent={intent}
        tone="dark"
        density="compact"
        message={message}
        actionLabel={
          status === "sending"
            ? AUTH_RESEND_COPY.resending
            : status === "sent"
              ? AUTH_RESEND_COPY.resent
              : AUTH_RESEND_COPY.resend
        }
        onAction={() => {
          if (status === "sent") return
          void handleResend()
        }}
      />
      {error ? (
        <RootsBanner intent="danger" tone="dark" density="compact" message={error} />
      ) : null}
    </div>
  )
}
