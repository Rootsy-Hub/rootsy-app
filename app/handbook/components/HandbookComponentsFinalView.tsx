"use client"

import { HomePageHeader } from "@/app/home/HomePageHeader"
import { MenuDormantHeader } from "@/app/[siteId]/[popId]/menu/MenuDormantHeader"
import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import { MenuPageHeader } from "@/app/[siteId]/[popId]/menu/MenuPageHeader"
import { HandbookDesignSystemNav } from "@/app/handbook/HandbookDesignSystemNav"
import {
  HANDBOOK_COMPONENT_PAGES,
  HANDBOOK_COMPONENT_SECTIONS,
  handbookComponentFinalBaseId,
} from "@/app/handbook/components/handbookComponentsSpec"
import { HANDBOOK_DESIGN_SYSTEM_BACK_HREF } from "@/app/handbook/handbookDesignSystem"
import { HandbookNav } from "@/app/handbook/layoutHandbookShared"
import { Avatar, AVATAR_SIZES, type AvatarSize } from "@/components/Avatar"
import {
  ComponentView,
  type ComponentViewRenderContext,
} from "@/components/ComponentView"
import { ModuleWorkspaceHeader } from "@/components/layouts-module/ModuleWorkspaceHeader"
import { MenuSidebar } from "@/components/MenuSidebar"
import {
  libraryDocPageDescriptionClass,
  libraryDocPageTitleClass,
  libraryDocSectionTitleClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

const PERSON_PHOTO = "/rootsy/rootsy-alerta-amable.png"
const POP_PHOTO = "/logos/pop/narciso/narciso-avatar.jpg"
const BRUMA = "var(--rootsy-bruma-100)"
const noop = () => {}

const AVATAR_APPEARANCES = [
  "con foto",
  "sin foto",
  "cargando",
  "online",
  "offline",
] as const

function renderAvatar(
  variant: string,
  extras: readonly string[],
  context: ComponentViewRenderContext,
) {
  const appearance = extras[0] ?? "con foto"
  const size = (extras[1] ?? "lg") as AvatarSize
  const isCircle = variant === "Círculo"
  const shape = isCircle ? "circle" : "square"
  const initials = isCircle ? "AF" : "NA"
  const photo = isCircle ? PERSON_PHOTO : POP_PHOTO
  const tone = context.worldId === "bruma" || context.worldId === null ? "light" : "dark"

  return (
    <Avatar
      shape={shape}
      size={size}
      tone={tone}
      initials={initials}
      imageUrl={appearance === "con foto" ? photo : null}
      pending={appearance === "cargando"}
      isOnline={
        appearance === "online" ? true : appearance === "offline" ? false : undefined
      }
      ariaLabel="Tu foto"
      onClick={appearance === "cargando" ? undefined : noop}
    />
  )
}

function HeaderFinalSpecimen() {
  return (
    <div className="flex flex-col gap-4">
      <ComponentView
        background="black"
        componentName="HomePageHeader"
        componentProperties={[
          { name: "loading", values: ["true", "false"] },
          { name: "userId", values: ["string", "undefined"] },
        ]}
        variants={[{ name: "Home" }]}
        extras={[
          {
            items: [{ name: "loaded" }, { name: "loading" }],
          },
        ]}
        render={(_variant, extras) => (
          <HomePageHeader loading={extras[0] === "loading"} />
        )}
      />
      <ComponentView
        background="black"
        componentName="MenuPageHeader"
        componentProperties={[
          { name: "popLogoSrc", values: ["string"] },
          { name: "popName", values: ["string"] },
          { name: "popAddress", values: ["string"] },
          { name: "userName", values: ["string"] },
          { name: "userAvatarSrc", values: ["string", "null"] },
          { name: "userRoleLabel", values: ["string"] },
          { name: "isOnline", values: ["true", "false"] },
          { name: "subscriptionsHref", values: ["string", "null"] },
          { name: "clockLabel", values: ["string"] },
          { name: "dateLabel", values: ["string"] },
          { name: "showSearch", values: ["true", "false"] },
          { name: "searchQuery", values: ["string"] },
          { name: "searchShortcutLabel", values: ["string"] },
        ]}
        variants={[{ name: "Menú" }]}
        extras={[
          {
            items: [{ name: "loaded" }, { name: "loading" }],
          },
          {
            items: [{ name: "idle" }, { name: "search" }],
          },
        ]}
        render={(_variant, extras) => (
          <MenuPageHeaderSpecimen
            loading={extras[0] === "loading"}
            searching={extras[1] === "search"}
          />
        )}
      />
      <ComponentView
        background="black"
        componentName="ModuleWorkspaceHeader"
        componentProperties={[
          { name: "backHref", values: ["string", "undefined"] },
          { name: "title", values: ["string", "undefined"] },
          { name: "popName", values: ["string", "undefined"] },
          { name: "popLogoSrc", values: ["string", "undefined"] },
          { name: "loading", values: ["true", "false"] },
          { name: "userName", values: ["string", "undefined"] },
          { name: "userAvatarSrc", values: ["string", "null"] },
          { name: "subline", values: ["string", "undefined"] },
          { name: "isOnline", values: ["true", "false"] },
          { name: "showFullscreen", values: ["true", "false"] },
          { name: "isFullscreen", values: ["true", "false"] },
          { name: "canCollapseSidebar", values: ["true", "false"] },
          { name: "sidebarOpen", values: ["true", "false"] },
        ]}
        variants={[{ name: "Módulo" }]}
        extras={[
          {
            items: [{ name: "loaded" }, { name: "loading" }],
          },
        ]}
        render={(_variant, extras) => (
          <ModuleWorkspaceHeaderSpecimen loading={extras[0] === "loading"} />
        )}
      />
      <AvatarFinalSpecimen />
    </div>
  )
}

function MenuPageHeaderSpecimen({
  loading,
  searching,
}: {
  loading: boolean
  searching: boolean
}) {
  const mobileSearchRef = useRef<HTMLInputElement>(null)
  const desktopSearchRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [showSearch, setShowSearch] = useState(searching)

  useEffect(() => {
    setShowSearch(searching)
    if (!searching) setQuery("")
  }, [searching])

  return (
    <MenuHeaderEntity className="w-full">
      {loading ? (
        <MenuDormantHeader />
      ) : (
        <MenuPageHeader
          popLogoSrc={POP_PHOTO}
          popName="Narciso"
          popAddress="Palermo, Buenos Aires"
          userName="María González"
          userAvatarSrc={PERSON_PHOTO}
          userRoleLabel="Administradora"
          isOnline
          subscriptionsHref={null}
          clockLabel="15:14"
          dateLabel="mié 26 ago"
          showSearch={showSearch}
          searchQuery={query}
          searchShortcutLabel="⌘K"
          mobileSearchRef={mobileSearchRef}
          desktopSearchRef={desktopSearchRef}
          onSearchChange={setQuery}
          onSearchFocus={() => setShowSearch(true)}
          onSearchBlur={() => {}}
          onOpenSearch={() => setShowSearch(true)}
          onCloseSearch={() => {
            setShowSearch(false)
            setQuery("")
          }}
        />
      )}
    </MenuHeaderEntity>
  )
}

function ModuleWorkspaceHeaderSpecimen({ loading }: { loading: boolean }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className="w-full">
      <ModuleWorkspaceHeader
        backHref="/home"
        showFullscreen
        popLogoSrc={POP_PHOTO}
        popName="Narciso"
        title="Clientes"
        loading={loading}
        brandPending={loading}
        userPending={loading}
        rolePending={loading}
        userName="María González"
        userAvatarSrc={PERSON_PHOTO}
        isOnline
        subline="Administradora"
        hasResolvedRole
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen((current) => !current)}
        canCollapseSidebar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((current) => !current)}
        subscriptionsHref={null}
      />
    </div>
  )
}

function AvatarFinalSpecimen() {
  return (
    <ComponentView
      background={BRUMA}
      componentName="Avatar"
      componentProperties={[
        { name: "initials", values: ["string"] },
        { name: "imageUrl", values: ["string", "null"] },
        { name: "size", values: [...AVATAR_SIZES] },
        { name: "shape", values: ["circle", "square"] },
        { name: "tone", values: ["dark", "light"] },
        { name: "pending", values: ["true", "false"] },
        { name: "isOnline", values: ["true", "false", "undefined"] },
        { name: "ariaLabel", values: ["string"] },
        { name: "onClick", values: ["() => void"] },
      ]}
      variants={[{ name: "Círculo" }, { name: "Cuadrado" }]}
      extras={[
        {
          items: AVATAR_APPEARANCES.map((name) => ({ name })),
        },
        {
          items: AVATAR_SIZES.map((name) => ({ name })),
          initial: "lg",
        },
      ]}
      render={renderAvatar}
    />
  )
}

function MenuSidebarSpecimen({ variant }: { variant: string }) {
  const [activePageId, setActivePageId] = useState("navegacion-final")
  const isDesignSystem = variant !== "Handbook"

  return (
    <div className="h-[28rem] overflow-hidden rounded-xl">
      {isDesignSystem ? (
        <MenuSidebar
          collapseBelowLg={false}
          backHref={HANDBOOK_DESIGN_SYSTEM_BACK_HREF}
          backLabel="Volver"
          eyebrow="Sistema de diseño"
        >
          <HandbookDesignSystemNav
            activePageId={activePageId}
            onSelectPage={setActivePageId}
          />
        </MenuSidebar>
      ) : (
        <MenuSidebar
          collapseBelowLg={false}
          brand={
            <Link
              href="/"
              aria-label="Rootsy — landing"
              className="mb-6 inline-flex px-2"
            >
              <Image
                src="/rootsy-logo.svg"
                alt="Rootsy"
                width={90}
                height={29}
                className="h-7 w-auto"
              />
            </Link>
          }
        >
          <HandbookNav
            activeSectionId="overview"
            onSelectSection={() => {}}
          />
        </MenuSidebar>
      )}
    </div>
  )
}

function SidebarFinalSpecimen() {
  return (
    <ComponentView
      background={BRUMA}
      componentName="MenuSidebar"
      componentProperties={[
        { name: "children", values: ["ReactNode"] },
        { name: "backHref", values: ["string", "undefined"] },
        { name: "backLabel", values: ["string"] },
        { name: "onBack", values: ["() => void"] },
        { name: "eyebrow", values: ["string"] },
        { name: "brand", values: ["ReactNode"] },
        { name: "collapseBelowLg", values: ["true", "false"] },
      ]}
      variants={[{ name: "Sistema de diseño" }, { name: "Handbook" }]}
      render={(variant) => <MenuSidebarSpecimen variant={variant} />}
    />
  )
}

export function HandbookComponentsFinalView({ pageId }: { pageId: string }) {
  const baseId = handbookComponentFinalBaseId(pageId)
  if (!baseId) return null

  const page = HANDBOOK_COMPONENT_PAGES[baseId]
  const sections = HANDBOOK_COMPONENT_SECTIONS[baseId]

  return (
    <article className="w-full">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>{page.title}-final</h1>
      <div className="mt-10">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24 border-t border-[var(--color-borde)] py-10 first:border-t-0 first:pt-0"
          >
            <h2 className={libraryDocSectionTitleClass}>{section.title}</h2>
            <div className="mt-6">
              {pageId === "navegacion-final" && section.id === "header" ? (
                <HeaderFinalSpecimen />
              ) : pageId === "navegacion-final" && section.id === "sidebar" ? (
                <SidebarFinalSpecimen />
              ) : (
                <p className={cn(libraryDocPageDescriptionClass, "max-w-md italic")}>
                  Esta parte todavía se está formando.
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
