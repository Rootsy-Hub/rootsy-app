import type { DataWorkspaceHeaderVariant } from "@/components/layouts/dataWorkspaceHeaderStyles"
import { cn } from "@/lib/utils"

export type DataWorkspaceHeaderTitleProps = {
  title: string
  headerVariant?: DataWorkspaceHeaderVariant
}

export function DataWorkspaceHeaderTitle({
  title,
  headerVariant = "default",
}: DataWorkspaceHeaderTitleProps) {
  const isDark = headerVariant === "dark"

  return (
    <h1 className="relative inline-flex flex-col items-center">
      <span className="relative inline-block text-[1.65rem] font-black tracking-tight">
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 select-none",
            isDark
              ? "translate-y-px text-zinc-600/35 blur-[0.35px]"
              : "translate-y-px text-foreground/20 blur-[0.35px]",
          )}
        >
          {title}
        </span>

        <span
          className={cn(
            "relative block bg-clip-text text-transparent",
            isDark
              ? cn(
                  "bg-gradient-to-br from-zinc-50 via-white to-emerald-200/55",
                  "drop-shadow-[0_1px_0_rgba(255,255,255,0.11)]",
                  "drop-shadow-[0_1px_2px_rgba(0,0,0,0.28)]",
                )
              : cn(
                  "bg-gradient-to-br from-foreground via-foreground/95 to-primary/55",
                  "drop-shadow-[0_1px_0_rgba(255,255,255,0.45)]",
                  "drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.1)]",
                ),
          )}
        >
          {title}
        </span>
      </span>
    </h1>
  )
}
