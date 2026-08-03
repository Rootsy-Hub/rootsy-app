"use client"

import { createContext, useContext } from "react"

type RootsFormFieldContextValue = {
  describedBy?: string
  invalid?: boolean
}

export const RootsFormFieldContext = createContext<RootsFormFieldContextValue>({})

export function useRootsFormFieldControlProps(overrides?: { invalid?: boolean }) {
  const context = useContext(RootsFormFieldContext)
  const isInvalid = overrides?.invalid ?? context.invalid ?? false

  return {
    isInvalid,
    describedBy: context.describedBy,
    "aria-describedby": context.describedBy,
    "aria-invalid": isInvalid || undefined,
  }
}
