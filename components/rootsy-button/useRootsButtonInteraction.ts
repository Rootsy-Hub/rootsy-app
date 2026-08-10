"use client"

import { shouldApplyButtonFocusVisible } from "@/components/rootsy-button/rootsButtonFocusVisibleModality"
import {
  resolveButtonInteractionState,
  type RootsButtonInteractionFlags,
} from "@/components/rootsy-button/rootsButtonSpecRuntime"
import type { ButtonsUiInteractionState } from "@/app/library/ui-components/buttonsUiHardcodedSpec"
import { useCallback, useState, type FocusEvent, type KeyboardEvent } from "react"

export function useRootsButtonInteraction(
  flags: Omit<RootsButtonInteractionFlags, "hovered" | "focusVisible" | "pressed"> = {},
) {
  const [hovered, setHovered] = useState(false)
  const [focusVisible, setFocusVisible] = useState(false)
  const [pressed, setPressed] = useState(false)

  const state: ButtonsUiInteractionState = resolveButtonInteractionState({
    ...flags,
    hovered,
    focusVisible,
    pressed,
  })

  const onMouseEnter = useCallback(() => setHovered(true), [])
  const onMouseLeave = useCallback(() => {
    setHovered(false)
    setPressed(false)
  }, [])
  const onFocus = useCallback((event: FocusEvent<HTMLElement>) => {
    if (shouldApplyButtonFocusVisible(event.currentTarget)) {
      setFocusVisible(true)
    }
  }, [])
  const onBlur = useCallback(() => {
    setFocusVisible(false)
    setPressed(false)
  }, [])
  const onPointerDown = useCallback(() => setPressed(true), [])
  const onPointerUp = useCallback(() => setPressed(false), [])
  const onPointerCancel = useCallback(() => setPressed(false), [])
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === " " || event.key === "Enter") {
      setPressed(true)
    }
  }, [])
  const onKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.key === " " || event.key === "Enter") {
      setPressed(false)
    }
  }, [])

  return {
    state,
    interactionHandlers: {
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onKeyDown,
      onKeyUp,
    },
  }
}
