import type { DataWorkspaceHeaderVariant } from "@/components/layouts/dataWorkspaceHeaderStyles"
import { isDarkChromeHeader } from "@/components/layouts/dataWorkspaceHeaderStyles"
import { cn } from "@/lib/utils"

export type DataWorkspaceHeaderTitleProps = {
  title: string
  headerVariant?: DataWorkspaceHeaderVariant
}

export function DataWorkspaceHeaderTitle({
  title,
  headerVariant = "default",
}: DataWorkspaceHeaderTitleProps) {
  const isDarkChrome = isDarkChromeHeader(headerVariant)

  if (isDarkChrome) {
    return (
      <h1 className="inline-flex flex-col items-center">
        <span className="text-[1.65rem] font-black tracking-tight text-zinc-50">
          {title}
        </span>
      </h1>
    )
  }

  return (
    <h1 className="relative inline-flex flex-col items-center">
      <span className="relative inline-block text-[1.65rem] font-black tracking-tight">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 translate-y-px select-none text-foreground/20 blur-[0.35px]"
        >
          {title}
        </span>

        <span
          className={cn(
            "relative block bg-clip-text text-transparent",
            "bg-gradient-to-br from-foreground via-foreground/95 to-primary/55",
            "drop-shadow-[0_1px_0_rgba(255,255,255,0.45)]",
            "drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.1)]",
          )}
        >
          {title}
        </span>
      </span>
    </h1>
  )
}
