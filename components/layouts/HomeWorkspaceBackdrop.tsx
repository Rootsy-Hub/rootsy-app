import {
  menuAmbientTopGlowClass,
  menuVignetteClass,
} from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/home/homeEter.css"
import { cn } from "@/lib/utils"

type HomeWorkspaceBackdropProps = {
  className?: string
}

/** Éter a pantalla — noche sideral del header de menú, sin planetas. */
export function HomeWorkspaceBackdrop({ className }: HomeWorkspaceBackdropProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="home-eter-void absolute inset-0" />
      <div className="home-eter-sky absolute inset-0" />
      <div className="home-eter-core absolute inset-0" />
      <div className="home-eter-nebula absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]" />

      <div
        className={cn(
          "absolute top-0 left-1/2 h-100 w-250 -translate-x-1/2 rounded-full blur-[120px]",
          menuAmbientTopGlowClass,
        )}
      />

      <div className="home-eter-stars absolute inset-0" />

      <div className="absolute inset-0">
        <span className="home-eter-star home-eter-star--md" />
        <span className="home-eter-star home-eter-star--sm" />
        <span className="home-eter-star home-eter-star--md" />
        <span className="home-eter-star home-eter-star--sm" />
        <span className="home-eter-star home-eter-star--md" />
        <span className="home-eter-star home-eter-star--sm" />
        <span className="home-eter-star home-eter-star--md" />
      </div>

      <div className={cn("absolute inset-0", menuVignetteClass)} />
    </div>
  )
}

/** @deprecated Usar menuNatureShellClass en el shell raíz */
export const homeWorkspaceSurfaceClass = "bg-[var(--rootsy-eter-950)]"
