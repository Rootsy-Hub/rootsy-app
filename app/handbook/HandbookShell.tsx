import "@/app/library/libraryColorTheme.css"
import "@/app/handbook/handbookAtmosphere.css"
import { libraryShellMainClass } from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function HandbookShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "rootsy-theme-workspace handbook-shell",
        libraryShellMainClass,
        "fixed inset-0 flex flex-col overflow-hidden",
      )}
    >
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  )
}
