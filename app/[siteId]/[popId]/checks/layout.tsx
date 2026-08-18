import { Suspense, type ReactNode } from "react"

export default function ChecksLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="rootsy-app-light flex min-h-[40vh] items-center justify-center bg-background p-6 text-sm text-muted-foreground">
          Cargando…
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
