"use client"

import { HOME_COPY } from "@/app/home/homeCopy"
import {
  menuRealmChromeShellClass,
  menuRealmLightMutedClass,
  menuRealmLightStaticClass,
} from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"

type HomeLoadErrorProps = {
  onRetry?: () => void | Promise<unknown>
}

export function HomeLoadError({ onRetry }: HomeLoadErrorProps) {
  return (
    <div
      className={cn(
        "mx-auto mt-2 max-w-md rounded-2xl px-6 py-5 text-center",
        menuRealmChromeShellClass,
      )}
    >
      <p className={cn("text-sm leading-relaxed", menuRealmLightMutedClass)}>
        {HOME_COPY.loadError}{" "}
        <button
          type="button"
          className={cn(
            "font-semibold underline underline-offset-2 transition-colors",
            menuRealmLightStaticClass,
            "hover:text-white",
          )}
          onClick={() => {
            if (onRetry) {
              void onRetry()
              return
            }
            window.location.reload()
          }}
        >
          {HOME_COPY.retry}
        </button>
      </p>
    </div>
  )
}
