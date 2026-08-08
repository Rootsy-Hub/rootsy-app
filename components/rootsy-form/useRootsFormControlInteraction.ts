"use client"

import {
  resolveFormControlState,
  type RootsFormInteractionFlags,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import type { FormControlStateId } from "@/app/[siteId]/[popId]/library/ui-components/formsUiHardcodedSpec"
import { useCallback, useState } from "react"

export function useRootsFormControlInteraction(
  flags: Omit<RootsFormInteractionFlags, "hovered" | "focused"> = {},
) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  const state: FormControlStateId = resolveFormControlState({
    ...flags,
    hovered,
    focused,
  })

  const onMouseEnter = useCallback(() => setHovered(true), [])
  const onMouseLeave = useCallback(() => setHovered(false), [])
  const onFocus = useCallback(() => setFocused(true), [])
  const onBlur = useCallback(() => setFocused(false), [])

  return {
    state,
    hovered,
    focused,
    interactionHandlers: {
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
    },
  }
}
