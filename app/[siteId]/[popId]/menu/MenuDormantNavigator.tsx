import {
  menuSectionRealmDividerClass,
  menuSectionRealmRailClass,
  menuSectionRealmTabClass,
} from "@/app/[siteId]/[popId]/menu/menuSectionRealmStyles"
import { menuGhostBarClass } from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import { cn } from "@/lib/utils"

const GHOST_TABS = 3

/** Selector de mundos en fantasma — mismas cajas, sin nombres. */
export function MenuDormantNavigator() {
  return (
    <div className="mx-auto flex w-full max-w-4xl shrink-0 justify-center px-6 pb-1 pt-0">
      <div className={menuSectionRealmRailClass} aria-hidden>
        {Array.from({ length: GHOST_TABS }, (_, index) => (
          <div key={index} className="flex items-stretch">
            <span
              className={cn(
                menuSectionRealmTabClass,
                "flex items-center justify-center",
              )}
            >
              <span className={cn(menuGhostBarClass, "h-2.5 w-14")} />
            </span>
            {index < GHOST_TABS - 1 ? (
              <span className={menuSectionRealmDividerClass} />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
