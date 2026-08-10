import { LibraryAccessGate } from "@/app/library/LibraryAccessGate"
import type { ReactNode } from "react"

export default function LibraryRootLayout({ children }: { children: ReactNode }) {
  return <LibraryAccessGate>{children}</LibraryAccessGate>
}
