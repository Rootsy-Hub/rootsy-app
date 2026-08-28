"use client"

import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import { WorkspaceMobileAccountCluster } from "@/components/layouts/WorkspaceMobileAccountCluster"
import { PopLogoLightboxButton } from "@/components/pop-identity/PopLogoLightboxButton"
import { RootsIconButton } from "@/components/rootsy-button"
import { RootsFormSearchField, RootsFormToneProvider } from "@/components/rootsy-form"
import { menuHeaderRowClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { menuSearchShortcutClass } from "@/app/[siteId]/[popId]/menu/menuSearchFieldStyles"
import {
  eterHeaderDividerClass,
  eterHeaderHairlineClass,
  eterHeaderMutedClass,
  eterHeaderTitleClass,
} from "@/lib/eter/eterChrome"
import { cn } from "@/lib/utils"
import { MenuNotificationsButton } from "@/app/[siteId]/[popId]/menu/MenuNotificationsButton"
import { Home, Search } from "lucide-react"
import type { RefObject } from "react"

type MenuPageHeaderProps = {
  popLogoSrc: string
  popName: string
  popAddress: string
  userName: string
  userAvatarSrc: string | null
  userRoleLabel: string
  isOnline: boolean
  subscriptionsHref: string | null
  clockLabel: string
  dateLabel: string
  showSearch: boolean
  searchQuery: string
  searchShortcutLabel: string
  mobileSearchRef: RefObject<HTMLInputElement | null>
  desktopSearchRef: RefObject<HTMLInputElement | null>
  onSearchChange: (value: string) => void
  onSearchFocus: () => void
  onSearchBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  onOpenSearch: () => void
  onCloseSearch: () => void
}

export function MenuPageHeader({
  popLogoSrc,
  popName,
  popAddress,
  userName,
  userAvatarSrc,
  userRoleLabel,
  isOnline,
  subscriptionsHref,
  clockLabel,
  dateLabel,
  showSearch,
  searchQuery,
  searchShortcutLabel,
  mobileSearchRef,
  desktopSearchRef,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onOpenSearch,
  onCloseSearch,
}: MenuPageHeaderProps) {
  return (
    <>
      <div className="flex h-full min-w-0 items-center gap-1.5 px-2 md:hidden">
        {showSearch ? (
          <MenuSearchField
            inputRef={mobileSearchRef}
            query={searchQuery}
            shortcutLabel={searchShortcutLabel}
            showShortcut={false}
            expanded
            onChange={onSearchChange}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            onOpen={onOpenSearch}
            onClose={onCloseSearch}
          />
        ) : (
          <>
            <RootsIconButton
              href="/home"
              size="default"
              label="Ir al inicio"
              semantic="tertiary"
              atmosphere="eter"
            >
              <Home aria-hidden />
            </RootsIconButton>

            <MenuPopIdentity
              logoSrc={popLogoSrc}
              name={popName}
              address={popAddress}
              compact
            />

            <div className="ml-auto flex shrink-0 items-center gap-1">
              <MenuNotificationsButton />
              <RootsIconButton
                size="default"
                label="Buscar en el menú"
                semantic="tertiary"
                atmosphere="eter"
                onClick={onOpenSearch}
              >
                <Search aria-hidden />
              </RootsIconButton>
              <WorkspaceMobileAccountCluster
                userName={userName}
                userAvatarSrc={userAvatarSrc}
                isOnline={isOnline}
                subscriptionsHref={subscriptionsHref}
              />
            </div>
          </>
        )}
      </div>

      <div className={cn(menuHeaderRowClass, "hidden md:grid")}>
        <div className="flex min-w-0 items-center gap-6">
          <RootsIconButton
            href="/home"
            size="large"
            label="Ir al inicio"
            semantic="tertiary"
            atmosphere="eter"
          >
            <Home aria-hidden />
          </RootsIconButton>

          <MenuPopIdentity
            logoSrc={popLogoSrc}
            name={popName}
            address={popAddress}
          />
        </div>

        <div className="w-full justify-self-center">
          <MenuSearchField
            inputRef={desktopSearchRef}
            query={searchQuery}
            shortcutLabel={searchShortcutLabel}
            showShortcut
            expanded={showSearch}
            onChange={onSearchChange}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            onOpen={onOpenSearch}
            onClose={onCloseSearch}
          />
        </div>

        <div className="flex min-w-0 items-center justify-end gap-6">
          <div className="flex items-center gap-1">
            <MenuNotificationsButton />
          </div>

          <div className={cn("h-6 w-px", eterHeaderDividerClass)} />

          <div className="flex shrink-0 flex-col items-end">
            <span className={cn("text-lg tabular-nums", eterHeaderTitleClass, "font-semibold")}>
              {clockLabel}
            </span>
            <span className={cn("text-xs uppercase tracking-wide", eterHeaderMutedClass)}>
              {dateLabel}
            </span>
          </div>

          <div className={cn("h-6 w-px", eterHeaderDividerClass)} />

          <MenuUserCluster
            userName={userName}
            userAvatarSrc={userAvatarSrc}
            userRoleLabel={userRoleLabel}
            isOnline={isOnline}
          />
        </div>
      </div>
    </>
  )
}

function MenuPopIdentity({
  logoSrc,
  name,
  address,
  compact = false,
}: {
  logoSrc: string
  name: string
  address: string
  compact?: boolean
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5 md:gap-3", compact && "flex-1")}>
      <PopLogoLightboxButton
        src={logoSrc}
        name={name}
        className={cn(
          eterHeaderHairlineClass,
          compact ? "size-9" : "size-12",
        )}
      />
      <div className="min-w-0">
        <p className={cn("truncate text-sm font-semibold", eterHeaderTitleClass)}>
          {name}
        </p>
        {compact ? null : (
          <p className={cn("truncate text-xs font-normal", eterHeaderMutedClass)}>
            {address}
          </p>
        )}
      </div>
    </div>
  )
}

function MenuUserCluster({
  userName,
  userAvatarSrc,
  userRoleLabel,
  isOnline,
}: {
  userName: string
  userAvatarSrc: string | null
  userRoleLabel: string
  isOnline: boolean
}) {
  return (
    <DataWorkspaceHeaderUserMenu
      userName={userName}
      userAvatarSrc={userAvatarSrc}
      isOnline={isOnline}
      headerVariant="dark"
      roleLabel={userRoleLabel}
      hasResolvedRole={Boolean(userRoleLabel)}
    />
  )
}

function MenuSearchField({
  inputRef,
  query,
  shortcutLabel,
  showShortcut,
  expanded,
  onChange,
  onFocus,
  onBlur,
  onOpen,
  onClose,
}: {
  inputRef: RefObject<HTMLInputElement | null>
  query: string
  shortcutLabel: string
  showShortcut: boolean
  expanded: boolean
  onChange: (value: string) => void
  onFocus: () => void
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  onOpen: () => void
  onClose: () => void
}) {
  return (
    <div
      className={cn("relative min-w-0 flex-1", !expanded && "cursor-text")}
      onClick={(event) => {
        if (expanded) return
        if (event.target instanceof HTMLInputElement) return
        onOpen()
      }}
    >
      <RootsFormToneProvider tone="eter">
        <RootsFormSearchField
          hideLabel
          label="Buscar en el menú"
          placeholder="Buscar..."
          value={query}
          onChange={(event) => onChange(event.target.value)}
          onClear={expanded ? onClose : undefined}
          inputRef={inputRef}
          className="min-w-0 gap-0"
          surface="ghost"
          inputProps={{
            "aria-expanded": expanded,
            onFocus,
            onBlur,
          }}
          clearButtonProps={{
            "data-menu-search-close": true,
            "aria-label": "Cerrar búsqueda",
          }}
        />
      </RootsFormToneProvider>
      {!expanded && showShortcut ? (
        <kbd
          className={cn(
            "pointer-events-none absolute right-4 top-1/2 z-1 -translate-y-1/2",
            menuSearchShortcutClass,
          )}
        >
          {shortcutLabel}
        </kbd>
      ) : null}
    </div>
  )
}
