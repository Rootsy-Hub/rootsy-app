"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

type HomeSaludoHoverValue = {
  hello: boolean
  setHello: (hello: boolean) => void
}

const HomeSaludoHoverContext = createContext<HomeSaludoHoverValue>({
  hello: false,
  setHello: () => {},
})

export function HomeSaludoHoverProvider({ children }: { children: ReactNode }) {
  const [hello, setHello] = useState(false)
  const value = useMemo(() => ({ hello, setHello }), [hello])

  return (
    <HomeSaludoHoverContext.Provider value={value}>
      {children}
    </HomeSaludoHoverContext.Provider>
  )
}

export function useHomeSaludoHover() {
  return useContext(HomeSaludoHoverContext)
}
