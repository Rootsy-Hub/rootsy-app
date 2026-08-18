import { AuthGate } from "@/components/auth/AuthGate"
import type { ReactNode } from "react"

export default function PopsLayout({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>
}
