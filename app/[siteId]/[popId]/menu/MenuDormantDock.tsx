"use client"

import {
  DOCK_EDIT_DIVIDER_HEIGHT_PX,
  DOCK_ICON_SIZE_PX,
  DOCK_SHELL_PADDING_X_PX,
  DOCK_SHELL_PADDING_Y_PX,
  DOCK_SLOT_SHIFT_PX,
  DOCK_TRACK_HEIGHT_PX,
  DOCK_TRACK_INSET_Y_PX,
  DockIconVisual,
} from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import { menuRealmDividerClass } from "@/lib/menu/menuHoloStyles"
import {
  DEFAULT_MENU_DOCK_IDS,
  getMenuCatalogItem,
} from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"
import { Pencil } from "lucide-react"

/** Dock en reposo — misma forma que el dock activo. */
export function MenuDormantDock() {
  const dockItems = DEFAULT_MENU_DOCK_IDS.map((id) => getMenuCatalogItem(id)).filter(
    (item): item is NonNullable<typeof item> => item != null,
  )
  const trackWidth = dockItems.length * DOCK_SLOT_SHIFT_PX
  const iconInset = (DOCK_SLOT_SHIFT_PX - DOCK_ICON_SIZE_PX) / 2

  return (
    <div className="flex w-full justify-center" aria-hidden>
      <div
        className="flex items-end overflow-visible"
        style={{
          paddingTop: DOCK_SHELL_PADDING_Y_PX,
          paddingBottom: DOCK_SHELL_PADDING_Y_PX,
          paddingLeft: DOCK_SHELL_PADDING_X_PX,
          paddingRight: DOCK_SHELL_PADDING_X_PX,
          gap: DOCK_SHELL_PADDING_X_PX,
        }}
      >
        <div
          className="relative shrink-0"
          style={{ width: trackWidth, height: DOCK_TRACK_HEIGHT_PX }}
        >
          {dockItems.map((item, index) => (
            <div
              key={item.id}
              className="absolute flex justify-center"
              style={{
                bottom: DOCK_TRACK_INSET_Y_PX,
                left: index * DOCK_SLOT_SHIFT_PX + iconInset,
                width: DOCK_ICON_SIZE_PX,
              }}
            >
              <DockIconVisual
                icon={item.icon}
                sectionKey={item.sectionKey}
                variant="dock"
              />
            </div>
          ))}
        </div>

        <div
          className="flex shrink-0 items-center self-end opacity-70"
          style={{
            height: DOCK_ICON_SIZE_PX,
            marginBottom: DOCK_TRACK_INSET_Y_PX,
            gap: DOCK_SHELL_PADDING_X_PX,
          }}
        >
          <div
            className={cn("w-px shrink-0", menuRealmDividerClass)}
            style={{ height: DOCK_EDIT_DIVIDER_HEIGHT_PX }}
          />
          <div className="flex size-8 items-center justify-center rounded-xl opacity-60">
            <Pencil className="size-4 text-white/50" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  )
}
