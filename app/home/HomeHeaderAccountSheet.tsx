"use client"

import { HOME_COPY } from "@/app/home/homeCopy"
import { Avatar } from "@/components/Avatar"
import {
  menuRealmChromeShellClass,
  menuRealmLightMutedClass,
  menuRealmTitleClass,
} from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { CreditCard, LogOut, UserCog } from "lucide-react"
import type { ReactNode } from "react"

type HomeHeaderAccountSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  imageUrl: string | null
  initials: string
  isOnline: boolean
  subscriptionsHref: string | null
  onOpenPhoto: () => void
  onEditProfile: () => void
  onSubscriptions: (href: string) => void
  onLogOut: () => void
}

export function HomeHeaderAccountSheet({
  open,
  onOpenChange,
  name,
  imageUrl,
  initials,
  isOnline,
  subscriptionsHref,
  onOpenPhoto,
  onEditProfile,
  onSubscriptions,
  onLogOut,
}: HomeHeaderAccountSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "gap-0 border-t px-4 pt-3 text-white",
          "rounded-t-[22px] sm:max-w-none",
          "bg-[color-mix(in_srgb,var(--rootsy-eter-950)_88%,var(--rootsy-sombra-950)_12%)]",
          "border-[rgba(228,242,248,0.14)]",
          "shadow-[0_-18px_48px_-16px_rgba(0,0,0,0.55)]",
          "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
          "[&>button]:hidden",
        )}
      >
        <div
          aria-hidden
          className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/22"
        />

        <SheetTitle className="sr-only">{HOME_COPY.accountMenu}</SheetTitle>
        <SheetDescription className="sr-only">{name || HOME_COPY.accountMenu}</SheetDescription>

        <div className="flex flex-col items-center gap-3 px-2 pb-5">
          <Avatar
            imageUrl={imageUrl}
            initials={initials}
            size="sheet"
            isOnline={isOnline}
            ariaLabel={HOME_COPY.photoModalTitle}
            onClick={onOpenPhoto}
          />

          {name ? (
            <p className={cn("text-center text-lg", menuRealmTitleClass)}>{name}</p>
          ) : null}
          <p className={cn("text-xs", menuRealmLightMutedClass)}>
            {isOnline ? HOME_COPY.online : HOME_COPY.offline}
          </p>
        </div>

        <div
          className={cn(
            "flex flex-col overflow-hidden rounded-2xl border",
            menuRealmChromeShellClass,
          )}
        >
          <HomeAccountRow
            icon={<UserCog className="size-4" aria-hidden />}
            onClick={onEditProfile}
          >
            {HOME_COPY.editProfile}
          </HomeAccountRow>

          {subscriptionsHref ? (
            <HomeAccountRow
              icon={<CreditCard className="size-4" aria-hidden />}
              onClick={() => onSubscriptions(subscriptionsHref)}
            >
              {HOME_COPY.subscriptions}
            </HomeAccountRow>
          ) : null}

          <HomeAccountRow
            icon={<LogOut className="size-4" aria-hidden />}
            danger
            onClick={onLogOut}
          >
            {HOME_COPY.logOut}
          </HomeAccountRow>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function HomeAccountRow({
  icon,
  children,
  onClick,
  danger = false,
}: {
  icon: ReactNode
  children: ReactNode
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-12 w-full items-center gap-3 px-4 text-left",
        "font-canopy text-sm",
        "border-t border-[rgba(228,242,248,0.08)] first:border-t-0",
        "transition-colors duration-150",
        danger
          ? "text-[#F87171] hover:bg-[color-mix(in_srgb,#DC2626_16%,transparent)]"
          : "text-[rgba(255,255,255,0.88)] hover:bg-white/8",
      )}
    >
      <span className={cn("shrink-0", danger ? "text-[#F87171]" : "text-white/55")}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  )
}
