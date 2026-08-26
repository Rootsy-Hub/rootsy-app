import { HandbookNav } from "@/app/handbook/layoutHandbookShared"
import {
  libraryScrollDarkClass,
  librarySidebarClass,
  librarySidebarEyebrowClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"

export function HandbookMobileNav({
  activeSectionId,
}: {
  activeSectionId: string
}) {
  return (
    <details className="lg:hidden">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between rounded-xl border px-4 py-3",
          "border-[var(--rootsy-bruma-200)] bg-white text-sm font-medium text-[var(--rootsy-bruma-900)]",
        )}
      >
        Secciones
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
          Handbook
        </span>
      </summary>
      <div
        className={cn(
          "mt-3 overflow-hidden rounded-2xl border border-[var(--rootsy-sombra-border)]",
          librarySidebarClass,
        )}
      >
        <div className={cn("max-h-[70vh] overflow-y-auto p-4", libraryScrollDarkClass)}>
          <p className={cn("mb-4 px-2", librarySidebarEyebrowClass)}>Navegación</p>
          <HandbookNav activeSectionId={activeSectionId} />
        </div>
      </div>
    </details>
  )
}
