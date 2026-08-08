"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { LANDING_REGISTER_PATH } from "@/components/landing/constants"
import { useLandingChapterNavigation } from "@/components/landing/hooks/useLandingChapterNavigation"
import type {
  LandingLayoutMode,
  LandingNavigationValue,
} from "@/components/landing/types"

const LandingNavigationContext = createContext<LandingNavigationValue | null>(
  null,
)

type LandingNavigationProviderProps = {
  layout: LandingLayoutMode
  children: ReactNode
}

export function LandingNavigationProvider({
  layout,
  children,
}: LandingNavigationProviderProps) {
  const router = useRouter()
  const { activeChapter, sceneKey, goToChapter } =
    useLandingChapterNavigation(layout)

  const goRegister = useCallback(() => {
    router.push(LANDING_REGISTER_PATH)
  }, [router])

  const value = useMemo<LandingNavigationValue>(
    () => ({
      layout,
      activeChapter,
      sceneKey,
      goToChapter,
      goRegister,
    }),
    [layout, activeChapter, sceneKey, goToChapter, goRegister],
  )

  return (
    <LandingNavigationContext.Provider value={value}>
      {children}
    </LandingNavigationContext.Provider>
  )
}

export function useLandingNavigation(): LandingNavigationValue {
  const ctx = useContext(LandingNavigationContext)
  if (!ctx) {
    throw new Error("useLandingNavigation debe usarse dentro de LandingNavigationProvider")
  }
  return ctx
}
