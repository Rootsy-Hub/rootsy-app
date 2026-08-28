import {
  DOCK_ICON_SIZE_PX,
  DOCK_SHELL_PADDING_X_PX,
  DOCK_SHELL_PADDING_Y_PX,
  DOCK_SLOT_SHIFT_PX,
  DOCK_TRACK_HEIGHT_PX,
  DOCK_TRACK_INSET_Y_PX,
} from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import { menuGhostTileClass } from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import { DEFAULT_MENU_DOCK_IDS } from "@/lib/menuCatalog"
import { MOBILE_MAX_MENU_DOCK_ITEMS } from "@/lib/menuDockPreference"
import { cn } from "@/lib/utils"

/** Dock en fantasma — mismos huecos, sin íconos. */
export function MenuDormantDock() {
  const dockCount = DEFAULT_MENU_DOCK_IDS.length
  const trackWidth =
    dockCount > 0
      ? (dockCount - 1) * DOCK_SLOT_SHIFT_PX + DOCK_ICON_SIZE_PX
      : 0

  return (
    <div className="flex w-full justify-center" aria-hidden>
      <div
        className="flex items-end overflow-visible"
        style={{
          paddingTop: DOCK_SHELL_PADDING_Y_PX,
          paddingBottom: DOCK_SHELL_PADDING_Y_PX,
          paddingLeft: DOCK_SHELL_PADDING_X_PX,
          paddingRight: DOCK_SHELL_PADDING_X_PX,
        }}
      >
        <div
          className="relative shrink-0 max-md:!w-64"
          style={{ width: trackWidth, height: DOCK_TRACK_HEIGHT_PX }}
        >
          {Array.from({ length: dockCount }, (_, index) => (
            <div
              key={index}
              className={cn(
                "absolute flex justify-center",
                index >= MOBILE_MAX_MENU_DOCK_ITEMS && "max-md:hidden",
              )}
              style={{
                bottom: DOCK_TRACK_INSET_Y_PX,
                left: index * DOCK_SLOT_SHIFT_PX,
                width: DOCK_ICON_SIZE_PX,
              }}
            >
              <div
                className={cn("size-12 rounded-[22%]", menuGhostTileClass)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
