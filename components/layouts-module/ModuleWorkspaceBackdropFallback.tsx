import { cn } from "@/lib/utils"

/**
 * Fallback sin foto de POP — sombra + bruma + savia.
 * Espejo de ROOTSY_LAYOUTS_MODULE_BACKDROP_FALLBACK.
 */
export function ModuleWorkspaceBackdropFallback({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[linear-gradient(165deg,var(--rootsy-sombra-950)_0%,var(--rootsy-sombra-900)_42%,var(--rootsy-sombra-800)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,color-mix(in_srgb,var(--rootsy-bruma-100)_14%,transparent)_0%,transparent_68%)]" />
      <div className="absolute top-0 left-1/2 h-[400px] w-[1000px] -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--rootsy-savia-600)_8%,transparent)] blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,color-mix(in_srgb,var(--rootsy-sombra-950)_55%,transparent)_100%)]" />
    </div>
  )
}

export const moduleWorkspaceFallbackSurfaceClass =
  "bg-[var(--rootsy-sombra-950)]"
