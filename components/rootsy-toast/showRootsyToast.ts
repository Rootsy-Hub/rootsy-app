import { toast } from "@/hooks/use-toast"
import {
  ROOTSY_TOAST_DURATION_MS,
  type RootsyToastIntent,
} from "@/components/rootsy-toast/rootsyToast"
import type { ReactNode } from "react"

type ShowRootsyToastOptions = {
  title: string
  description?: string
  intent?: RootsyToastIntent
  duration?: number
  action?: ReactNode
  actionLabel?: string
  onAction?: () => void
}

export function showRootsyToast(options: ShowRootsyToastOptions) {
  const duration = options.duration ?? ROOTSY_TOAST_DURATION_MS
  const persist = !Number.isFinite(duration)

  return toast({
    title: options.title,
    description: options.description,
    duration,
    intent: options.intent ?? "success",
    dismissible: persist,
    action: options.action,
    actionLabel: options.actionLabel,
    onAction: options.onAction,
  })
}
