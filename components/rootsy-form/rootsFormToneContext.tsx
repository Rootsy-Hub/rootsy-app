"use client"

import type { RootsFormTone } from "@/app/library/ui-components/formsUiHardcodedSpec"
import { createContext, useContext, type ReactNode } from "react"

export const RootsFormToneContext = createContext<RootsFormTone>("light")

export function RootsFormToneProvider({
  tone,
  children,
}: {
  tone: RootsFormTone
  children: ReactNode
}) {
  return (
    <RootsFormToneContext.Provider value={tone}>{children}</RootsFormToneContext.Provider>
  )
}

export function useAmbientRootsFormTone(): RootsFormTone {
  return useContext(RootsFormToneContext)
}
