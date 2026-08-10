"use client"

import { LibraryAccessGate } from "@/app/library/LibraryAccessGate"
import { LibraryShellChrome } from "@/app/library/LibraryShellChrome"
import type { ReactNode } from "react"

export default function LibraryShell({ children }: { children: ReactNode }) {
  return (
    <LibraryAccessGate>
      <LibraryShellChrome>{children}</LibraryShellChrome>
    </LibraryAccessGate>
  )
}
