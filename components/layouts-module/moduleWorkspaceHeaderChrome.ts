import type { DataWorkspaceHeaderVariant } from "@/components/layouts/dataWorkspaceHeaderStyles"
import type { RootsButtonAtmosphere } from "@/components/rootsy-button/rootsButtonAtmosphere"
import {
  eterHeaderDividerClass,
  eterHeaderMutedClass,
  eterHeaderTitleClass,
} from "@/lib/eter/eterChrome"

export const MODULE_WORKSPACE_HEADER_ATMOSPHERES = [
  "eter",
  "sombra",
  "bruma",
] as const

export type ModuleWorkspaceHeaderAtmosphere =
  (typeof MODULE_WORKSPACE_HEADER_ATMOSPHERES)[number]

export const MODULE_WORKSPACE_HEADER_ATMOSPHERE_LABELS: Record<
  ModuleWorkspaceHeaderAtmosphere,
  string
> = {
  eter: "Sotobosque",
  sombra: "Sombra",
  bruma: "Luz",
}

export function moduleWorkspaceHeaderVariant(
  atmosphere: RootsButtonAtmosphere,
): DataWorkspaceHeaderVariant {
  if (atmosphere === "sombra") return "tables"
  if (atmosphere === "bruma") return "default"
  return "dark"
}

export function moduleWorkspaceHeaderTitleClass(
  atmosphere: RootsButtonAtmosphere,
) {
  if (atmosphere === "bruma") {
    return "antialiased text-[var(--rootsy-bruma-950)]"
  }
  if (atmosphere === "sombra") {
    return "antialiased text-[var(--rootsy-sombra-50)]"
  }
  return eterHeaderTitleClass
}

export function moduleWorkspaceHeaderMutedClass(
  atmosphere: RootsButtonAtmosphere,
) {
  if (atmosphere === "bruma") return "text-[var(--rootsy-bruma-700)]"
  if (atmosphere === "sombra") return "text-[var(--rootsy-sombra-300)]"
  return eterHeaderMutedClass
}

export function moduleWorkspaceHeaderDividerClass(
  atmosphere: RootsButtonAtmosphere,
) {
  if (atmosphere === "bruma") return "bg-[var(--rootsy-bruma-200)]"
  if (atmosphere === "sombra") return "bg-[var(--rootsy-sombra-700)]"
  return eterHeaderDividerClass
}

export function moduleWorkspaceHeaderIconProps(
  atmosphere: RootsButtonAtmosphere,
) {
  if (atmosphere === "bruma") {
    return {
      theme: "workspace" as const,
      emphasis: "ghost" as const,
      size: "default" as const,
    }
  }
  return {
    semantic: "tertiary" as const,
    atmosphere,
    size: "default" as const,
  }
}

export function moduleWorkspaceHeaderIdentityTone(
  atmosphere: RootsButtonAtmosphere,
): "dark" | "light" {
  return atmosphere === "bruma" ? "light" : "dark"
}
