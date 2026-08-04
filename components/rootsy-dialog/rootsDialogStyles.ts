import { rootsFormEarthBgSubtleClass } from "@/components/rootsy-form/rootsFormEarthTokens"
import { cn } from "@/lib/utils"

/** Contenido scrollable — tierra suave; header y footer en blanco. */
export const rootsDialogBodyClass = cn(
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4",
  rootsFormEarthBgSubtleClass,
)

/** Área centrada para spinner de carga en modales. */
export const rootsDialogLoadingBodyClass =
  "flex min-h-[12rem] flex-col items-center justify-center py-8"
