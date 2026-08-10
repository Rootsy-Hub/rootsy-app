import LibraryShell from "@/app/library/LibraryShell"
import type { ReactNode } from "react"

export default function LibraryShellLayout({ children }: { children: ReactNode }) {
  return <LibraryShell>{children}</LibraryShell>
}
