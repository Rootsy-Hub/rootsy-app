"use client"

import type { RootsFormTone } from "@/app/library/ui-components/formsUiHardcodedSpec"
import { useAmbientRootsFormTone } from "@/components/rootsy-form/rootsFormToneContext"
import { createContext, useContext } from "react"

type RootsFormFieldContextValue = {
  describedBy?: string
  invalid?: boolean
  tone?: RootsFormTone
}

export const RootsFormFieldContext = createContext<RootsFormFieldContextValue>({})

export function useRootsFormFieldControlProps(overrides?: { invalid?: boolean }) {
  const context = useContext(RootsFormFieldContext)
  const isInvalid = overrides?.invalid ?? context.invalid ?? false

  return {
    isInvalid,
    describedBy: context.describedBy,
  }
}

export function useRootsFormControlTone(explicit?: RootsFormTone): RootsFormTone {
  const context = useContext(RootsFormFieldContext)
  const ambient = useAmbientRootsFormTone()
  return explicit ?? context.tone ?? ambient ?? "light"
}
