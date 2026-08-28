import { HandbookShell } from "@/app/handbook/HandbookShell"
import { HandbookWorkspace } from "@/app/handbook/HandbookWorkspace"
import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Handbook · Rootsy",
  description: "Fuente compartida de marca, producto y forma de trabajo de Rootsy.",
}

export default function HandbookLayout({ children }: { children: ReactNode }) {
  return (
    <HandbookShell>
      <HandbookWorkspace />
      {children}
    </HandbookShell>
  )
}
