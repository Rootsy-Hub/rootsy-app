import { AuthGate } from "@/components/auth/AuthGate"
import type { ReactNode } from "react"

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <AuthGate tone="dark">{children}</AuthGate>
}
