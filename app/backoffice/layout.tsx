import BackofficeShell from "@/app/backoffice/BackofficeShell"
import type { ReactNode } from "react"

export default function BackofficeLayout({ children }: { children: ReactNode }) {
  return <BackofficeShell>{children}</BackofficeShell>
}
