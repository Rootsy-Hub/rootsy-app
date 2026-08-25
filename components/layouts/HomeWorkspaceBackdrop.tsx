import { menuVignetteClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/home/homeEter.css"
import { cn } from "@/lib/utils"

type HomeWorkspaceBackdropProps = {
  className?: string
}

/** Éter a pantalla — noche sideral, un layer estático. Sin planetas. */
export function HomeWorkspaceBackdrop({ className }: HomeWorkspaceBackdropProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="home-eter-void absolute inset-0" />
      <div className="home-eter-atmosphere absolute inset-0" />
      <div className={cn("absolute inset-0", menuVignetteClass)} />
    </div>
  )
}

/** @deprecated Usar menuNatureShellClass en el shell raíz */
export const homeWorkspaceSurfaceClass = "bg-[var(--rootsy-eter-950)]"
