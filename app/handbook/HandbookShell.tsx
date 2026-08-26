import "@/app/library/libraryColorTheme.css"
import {
  libraryShellMainClass,
  libraryThemeClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function HandbookShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        libraryThemeClass,
        libraryShellMainClass,
        "rootsy-app-light fixed inset-0 flex flex-col overflow-hidden",
      )}
    >
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  )
}
