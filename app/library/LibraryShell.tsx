"use client"

import { LibraryShellChrome } from "@/app/library/LibraryShellChrome"
import type { ReactNode } from "react"

export default function LibraryShell({ children }: { children: ReactNode }) {
  return <LibraryShellChrome>{children}</LibraryShellChrome>
}
