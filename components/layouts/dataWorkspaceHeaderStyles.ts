import { cn } from "@/lib/utils"

export type DataWorkspaceHeaderVariant = "default" | "dark"

/** Superficie del header oscuro (compartida con menús desplegables). */
export const dataWorkspaceDarkHeaderSurfaceClass =
  "border-zinc-800/90 bg-zinc-950/95"

/** Estados de foco/apertura compartidos por botones del header. */
const dataWorkspaceHeaderButtonFocusClass =
  "outline-none focus:outline-none focus-visible:outline-none"

function dataWorkspaceHeaderButtonOpenClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  const isDark = headerVariant === "dark"
  return isDark
    ? cn(
        "data-[state=open]:border-zinc-700/70 data-[state=open]:bg-zinc-800 data-[state=open]:text-zinc-200",
        "data-[state=open]:ring-0 data-[state=open]:outline-none",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-600/25",
      )
    : cn(
        "data-[state=open]:border-primary/20 data-[state=open]:bg-muted data-[state=open]:text-foreground",
        "data-[state=open]:ring-0 data-[state=open]:outline-none",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/15",
      )
}

/** Botón cuadrado del header (Volver, pantalla completa, panel). */
export function dataWorkspaceHeaderChromeButtonClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  const isDark = headerVariant === "dark"
  return cn(
    "group inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all",
    dataWorkspaceHeaderButtonFocusClass,
    dataWorkspaceHeaderButtonOpenClass(headerVariant),
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
    dataWorkspaceHeaderButtonFocusClass,
    dataWorkspaceHeaderButtonOpenClass(headerVariant),
    isDark
      ? "border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/15 hover:bg-zinc-800 hover:text-white"
      : "border-foreground/10 bg-secondary text-muted-foreground hover:border-primary/25 hover:bg-muted hover:text-foreground",
    "disabled:pointer-events-none disabled:opacity-40",
  )
}

/** Botón del selector de sección/vista activa en el header (indicador «estás acá»). */
export function dataWorkspaceSectionMenuTriggerClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  const isDark = headerVariant === "dark"
  return cn(
    "group inline-flex h-10 w-auto max-w-[min(100%,11rem)] shrink-0 items-center gap-2 rounded-xl border px-2.5 text-sm font-semibold transition-all",
    dataWorkspaceHeaderButtonFocusClass,
    isDark
      ? cn(
          "border-emerald-500/40 bg-emerald-500/12 text-emerald-100",
          "shadow-[inset_0_1px_0_rgba(167,243,208,0.08)]",
          "hover:border-emerald-400/55 hover:bg-emerald-500/18 hover:text-emerald-50",
          "data-[state=open]:border-emerald-400/55 data-[state=open]:bg-emerald-500/20 data-[state=open]:text-emerald-50",
          "data-[state=open]:ring-0 data-[state=open]:outline-none",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400/30",
          "[&_svg]:text-emerald-300/95",
        )
      : cn(
          "border-primary/30 bg-primary/10 text-foreground",
          "hover:border-primary/40 hover:bg-primary/14",
          "data-[state=open]:border-primary/45 data-[state=open]:bg-primary/16 data-[state=open]:text-foreground",
          "data-[state=open]:ring-0 data-[state=open]:outline-none",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/20",
          "[&_svg]:text-primary/85",
        ),
  )
}

/** Ítem seleccionado dentro del menú de sección. */
export function dataWorkspaceSectionMenuDropdownItemClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
  selected = false,
): string {
  const isDark = headerVariant === "dark"
  if (!selected) {
    return cn(
      "gap-2",
      isDark && dataWorkspaceHeaderDropdownItemClass,
    )
  }
  return cn(
    "gap-2",
    isDark && dataWorkspaceHeaderDropdownItemClass,
    isDark
      ? "bg-emerald-500/12 text-emerald-100 focus:bg-emerald-500/16 focus:text-emerald-50 [&_svg:not([class*='text-'])]:text-emerald-300/90"
      : "bg-primary/10 text-foreground focus:bg-primary/14",
  )
}

/** Panel desplegable del header oscuro (menú de vista, usuario, etc.). */
export const dataWorkspaceHeaderDropdownContentClass = cn(
  "w-56 overflow-hidden rounded-xl p-1.5 text-zinc-100",
  "!border !border-zinc-800/90 !bg-zinc-950",
  "bg-[linear-gradient(165deg,#09090b_0%,#09090b_56%,#18181b_100%)]",
  "shadow-[0_18px_40px_-18px_rgba(0,0,0,0.78)]",
  "relative outline-none ring-0 [&_[data-slot=dropdown-menu-item]]:rounded-md",
  /** Sin desplazamiento vertical al abrir: evita flash claro entre trigger y panel. */
  "data-[side=bottom]:slide-in-from-top-0 data-[side=top]:slide-in-from-bottom-0",
  "data-[side=left]:slide-in-from-right-0 data-[side=right]:slide-in-from-left-0",
)

/** Menú de usuario: borde derecho alineado al padding del header. */
export const dataWorkspaceHeaderUserDropdownContentClass = cn(
  dataWorkspaceHeaderDropdownContentClass,
  "origin-top-right",
)

/** Panel desplegable sobre superficies claras (tarjetas, paneles light). */
export const dataWorkspaceLightDropdownContentClass = cn(
  "rootsy-app-light w-56 overflow-hidden rounded-xl border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-lg",
  "origin-top-right outline-none ring-0 [&_[data-slot=dropdown-menu-item]]:rounded-md",
  "data-[side=bottom]:slide-in-from-top-0 data-[side=top]:slide-in-from-bottom-0",
  "data-[side=left]:slide-in-from-right-0 data-[side=right]:slide-in-from-left-0",
)

export const dataWorkspaceLightDropdownItemClass =
  "gap-2 text-popover-foreground focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:opacity-70"

export const dataWorkspaceLightDropdownSeparatorClass = "bg-border/60"

export const dataWorkspaceLightDropdownLogoutItemClass = cn(
  "gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive",
  "[&_svg]:!text-destructive",
)

export const dataWorkspaceHeaderDropdownLabelClass =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500"

export const dataWorkspaceHeaderDropdownItemClass =
  "gap-2 text-zinc-200 focus:bg-white/8 focus:text-white [&_svg:not([class*='text-'])]:text-zinc-300 [&_svg]:opacity-70"

export const dataWorkspaceHeaderDropdownSeparatorClass = "bg-white/10"

/** Cerrar sesión: tono destructivo legible sobre fondo oscuro. */
export const dataWorkspaceHeaderDropdownLogoutItemClass = cn(
  "gap-2 text-red-400/95",
  "focus:bg-red-500/14 focus:text-red-300",
  "[&_svg]:!text-red-400/90",
)
