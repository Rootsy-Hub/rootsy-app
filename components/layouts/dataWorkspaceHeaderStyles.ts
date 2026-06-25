import { cn } from "@/lib/utils"

export type DataWorkspaceHeaderVariant = "default" | "dark"

/** Botón cuadrado del header (Volver, pantalla completa, panel). */
export function dataWorkspaceHeaderChromeButtonClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  const isDark = headerVariant === "dark"
  return cn(
    "group inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all",
    isDark
      ? "border-white/10 bg-zinc-900 text-zinc-300 hover:border-white/15 hover:bg-zinc-800 hover:text-white"
      : "border-foreground/10 bg-secondary text-foreground/70 hover:border-primary/25 hover:bg-muted hover:text-foreground",
  )
}

/** Botón de ícono de acción en el header (Nuevo, categorías, etc.). */
export function dataWorkspaceHeaderIconButtonClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
  options?: { primary?: boolean },
): string {
  const isDark = headerVariant === "dark"
  const primary = options?.primary ?? false
  if (primary && isDark) {
    return cn(
      "group inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all",
      "border-emerald-500/35 bg-emerald-500/12 text-emerald-300",
      "hover:border-emerald-400/45 hover:bg-emerald-500/20 hover:text-emerald-200",
      "disabled:pointer-events-none disabled:opacity-40",
    )
  }
  if (primary) {
    return cn(
      "group inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all",
      "border-primary/30 bg-primary/10 text-primary",
      "hover:border-primary/40 hover:bg-primary/15",
      "disabled:pointer-events-none disabled:opacity-40",
    )
  }
  return cn(
    "group inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all",
    isDark
      ? "border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/15 hover:bg-zinc-800 hover:text-white"
      : "border-foreground/10 bg-secondary text-muted-foreground hover:border-primary/25 hover:bg-muted hover:text-foreground",
    "disabled:pointer-events-none disabled:opacity-40",
  )
}
