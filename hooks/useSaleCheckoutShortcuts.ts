"use client"

import { useEffect } from "react"

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === "TEXTAREA" || tag === "SELECT"
}

export function useSaleCheckoutShortcuts(input: {
  enabled: boolean
  onCharge: () => void
  onClient: () => void
  onDiscount: () => void
  onDiscard: () => void
}) {
  const { enabled, onCharge, onClient, onDiscount, onDiscard } = input

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return
      if (isEditableTarget(event.target)) return

      const key = event.key
      if (key === "F2" || ((event.metaKey || event.ctrlKey) && key === "Enter")) {
        event.preventDefault()
        onCharge()
        return
      }
      if (key === "F4") {
        event.preventDefault()
        onClient()
        return
      }
      if (key === "F8") {
        event.preventDefault()
        onDiscount()
        return
      }
      if (key === "Escape") {
        event.preventDefault()
        onDiscard()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enabled, onCharge, onClient, onDiscount, onDiscard])
}
