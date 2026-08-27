"use client"

import { HomePageHeader } from "@/app/home/HomePageHeader"
import { MenuDormantDock } from "@/app/[siteId]/[popId]/menu/MenuDormantDock"
import { MenuDormantHeader } from "@/app/[siteId]/[popId]/menu/MenuDormantHeader"
import { MenuDormantNavigator } from "@/app/[siteId]/[popId]/menu/MenuDormantNavigator"
import { DockIconVisual } from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import { MenuIconChrome } from "@/app/[siteId]/[popId]/menu/MenuIconChrome"
import { MenuOuterEntity } from "@/app/[siteId]/[popId]/menu/MenuOuterEntity"
import { MenuPageHeader } from "@/app/[siteId]/[popId]/menu/MenuPageHeader"
import { MenuSectionNavigator } from "@/app/[siteId]/[popId]/menu/MenuSectionNavigator"
import { menuGhostBarClass, menuGhostTileClass } from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import { menuNatureShellClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import {
  menuPlanetIconGlyphClass,
  menuPlanetIconShellClass,
  menuPlanetTileClass,
  menuPlanetTileLabelClass,
} from "@/app/[siteId]/[popId]/menu/menuPlanetGridStyles"
import "@/app/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import "@/app/[siteId]/[popId]/menu/menuPlanetLife.css"
import { HandbookDesignSystemNav } from "@/app/handbook/HandbookDesignSystemNav"
import { HANDBOOK_FINAL_SECTION_SPECIMENS } from "@/app/handbook/components/HandbookComponentsFinalSpecimens"
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
import { RootsIconButton } from "@/components/rootsy-button"
import { RootsFormSegmentField } from "@/components/rootsy-form"
import {
  menuHoloFloatLiftClass,
  menuHoloFocusRingForSection,
  menuHoloGlyphClass,
  menuHoloIconHoverForSection,
  menuHoloIconShellForSection,
  menuHoloLabelClass,
  menuHoloPlanetLifeClass,
  menuHoloRealmWorldRimClass,
  menuHoloTileMotionClass,
  menuPlanetLifeStyle,
  type MenuPlanetRealm,
} from "@/lib/menu/menuHoloStyles"
import {
  DEFAULT_MENU_DOCK_IDS,
  getMenuCatalogItem,
  menuSectionsRaw,
  type MenuCatalogItem,
} from "@/lib/menuCatalog"
import {
  libraryDocPageDescriptionClass,
  libraryDocPageTitleClass,
  libraryDocSectionTitleClass,
  handbookDocChapterClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Check, Pencil } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const PERSON_PHOTO = "/rootsy/rootsy-alerta-amable.png"
const POP_PHOTO = "/logos/pop/narciso/narciso-avatar.jpg"
const BRUMA = "var(--rootsy-bruma-100)"
const ETER = "var(--rootsy-eter-950)"
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
      <ComponentView defaultOpen
        background={ETER}
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
      <ComponentView defaultOpen
        background={ETER}
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
      <ComponentView defaultOpen
        background={ETER}
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
          {
            items: [{ name: "con sidebar" }, { name: "sin sidebar" }],
          },
          {
            items: [{ name: "online" }, { name: "offline" }],
          },
        ]}
        render={(_variant, extras) => (
          <ModuleWorkspaceHeaderSpecimen
            loading={extras[0] === "loading"}
            canCollapseSidebar={extras[1] !== "sin sidebar"}
            isOnline={extras[2] !== "offline"}
          />
        )}
      />
      <AvatarFinalSpecimen />
      {HANDBOOK_FINAL_SECTION_SPECIMENS["header-pieces"]?.()}
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

function ModuleWorkspaceHeaderSpecimen({
  loading,
  canCollapseSidebar,
  isOnline,
}: {
  loading: boolean
  canCollapseSidebar: boolean
  isOnline: boolean
}) {
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
        isOnline={isOnline}
        subline="Administradora"
        hasResolvedRole
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen((current) => !current)}
        canCollapseSidebar={canCollapseSidebar}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((current) => !current)}
        subscriptionsHref={null}
      />
    </div>
  )
}

function AvatarFinalSpecimen() {
  return (
    <ComponentView defaultOpen
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

const TAB_FILTER_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "operativo", label: "Operativo" },
  { value: "fiscal", label: "Fiscal" },
  { value: "gestion", label: "Gestión" },
  { value: "control", label: "Control" },
  { value: "config", label: "Configuración" },
] as const

const TAB_FORM_OPTIONS = [
  { value: "product", label: "Producto" },
  { value: "service", label: "Servicio" },
] as const

function atmosphereChrome(worldId: ComponentViewRenderContext["worldId"]) {
  switch (worldId) {
    case "eter":
    case "herramientas":
      return { themeClass: "rootsy-theme-landing", tone: "dark" as const }
    case "bruma-oscura":
      return { themeClass: "rootsy-theme-bruma-oscura", tone: "dark" as const }
    case "suelo":
    case "sombra":
      return { themeClass: "rootsy-theme-pos", tone: "dark" as const }
    default:
      return { themeClass: "rootsy-theme-workspace", tone: "light" as const }
  }
}

function TabsSegmentLive({
  variant,
  extras,
  worldId,
}: {
  variant: string
  extras: readonly string[]
  worldId: ComponentViewRenderContext["worldId"]
}) {
  const isFilter = variant !== "Formulario"
  const options = isFilter ? TAB_FILTER_OPTIONS : TAB_FORM_OPTIONS
  const [value, setValue] = useState<string>(options[0].value)
  const chrome = atmosphereChrome(worldId)

  return (
    <div
      className={cn(isFilter ? "w-full" : "w-full max-w-sm", chrome.themeClass)}
    >
      <RootsFormSegmentField
        label={isFilter ? "Ver reportes" : "Tipo"}
        aria-label={isFilter ? "Filtrar reportes" : "Tipo"}
        layout={isFilter ? "inline" : "grid"}
        className={isFilter ? "[&>span:first-child]:sr-only" : undefined}
        groupClassName={isFilter ? "border-0" : undefined}
        value={value}
        onValueChange={setValue}
        options={options}
        disabled={extras[0] === "deshabilitado"}
        tone={chrome.tone}
      />
    </div>
  )
}

function TabsFinalSpecimen() {
  return (
    <ComponentView defaultOpen
      background={BRUMA}
      componentName="RootsFormSegmentField"
      componentProperties={[
        { name: "label", values: ["string"] },
        { name: "value", values: ["string"] },
        { name: "onValueChange", values: ["(value: string) => void"] },
        { name: "options", values: ["RootsFormSegmentOption[]"] },
        { name: "layout", values: ["inline", "grid"] },
        { name: "disabled", values: ["true", "false"] },
        { name: "groupClassName", values: ["string"] },
        { name: "className", values: ["string"] },
        { name: "aria-label", values: ["string"] },
        { name: "tone", values: ["light", "dark"] },
      ]}
      variants={[{ name: "Filtro" }, { name: "Formulario" }]}
      extras={[{ items: [{ name: "idle" }, { name: "deshabilitado" }] }]}
      render={(variant, extras, context) => (
        <TabsSegmentLive
          key={variant}
          variant={variant}
          extras={extras}
          worldId={context.worldId}
        />
      )}
    />
  )
}

const MENU_POP_SECTIONS = [
  { key: "operar", title: menuSectionsRaw.operar.title },
  { key: "administrar", title: menuSectionsRaw.administrar.title },
  { key: "configurar", title: menuSectionsRaw.configurar.title },
] as const

const MENU_POP_DOCK_ITEMS = DEFAULT_MENU_DOCK_IDS.map((id) =>
  getMenuCatalogItem(id),
).filter((item) => item != null)

const MENU_BUTTON_EXAMPLE_IDS = ["sale", "mesas", "articles", "settings"] as const

const MENU_BUTTON_EXAMPLES = MENU_BUTTON_EXAMPLE_IDS.map((id) =>
  getMenuCatalogItem(id),
).filter((item): item is MenuCatalogItem => item != null)

const MENU_BUTTON_WORLDS = {
  Savia: "operar",
  Sol: "administrar",
  Cielo: "configurar",
  Lava: "lava",
} as const satisfies Record<string, MenuPlanetRealm>

type MenuButtonWorldName = keyof typeof MENU_BUTTON_WORLDS

function MenuPlanetButtonVisual({
  item,
  realm,
}: {
  item: MenuCatalogItem
  realm: MenuPlanetRealm
}) {
  const Icon = item.icon
  const lifeStyle = menuPlanetLifeStyle(`${realm}-${item.id}`)

  return (
    <button
      type="button"
      className={cn(
        menuPlanetTileClass,
        "border-0 bg-transparent p-0",
        menuHoloFocusRingForSection(realm),
      )}
    >
      <div
        className={cn("relative overflow-visible p-1 -m-1", menuHoloPlanetLifeClass)}
        style={lifeStyle}
      >
        <div
          className={cn(
            menuPlanetIconShellClass,
            menuHoloIconShellForSection(realm, "default"),
            menuHoloRealmWorldRimClass(realm),
            menuHoloFloatLiftClass,
            menuHoloTileMotionClass,
            menuHoloIconHoverForSection(realm),
          )}
        >
          <MenuIconChrome sectionKey={realm} alive />
          <Icon className={cn(menuPlanetIconGlyphClass, menuHoloGlyphClass)} />
        </div>
      </div>
      <span
        className={cn(
          "flex h-7 w-full items-start justify-center text-center line-clamp-2 md:h-8 md:items-center",
          menuPlanetTileLabelClass,
          menuHoloLabelClass,
        )}
      >
        {item.name}
      </span>
    </button>
  )
}

function MenuPlanetButtonGhost() {
  return (
    <div aria-hidden className={cn(menuPlanetTileClass, "justify-self-center")}>
      <div className={cn(menuPlanetIconShellClass, menuGhostTileClass)} />
      <span className={cn(menuGhostBarClass, "h-3 w-[3.25rem]")} />
    </div>
  )
}

function MenuGridItemButtonSpecimen({
  world,
  loading,
}: {
  world: string
  loading: boolean
}) {
  const realm =
    MENU_BUTTON_WORLDS[world as MenuButtonWorldName] ?? MENU_BUTTON_WORLDS.Savia

  return (
    <div className={cn("dark", menuNatureShellClass, "w-full py-8")}>
      <div className="flex flex-wrap items-end justify-center gap-x-3 gap-y-6 md:gap-x-6">
        {loading
          ? MENU_BUTTON_EXAMPLES.map((item) => (
              <MenuPlanetButtonGhost key={item.id} />
            ))
          : MENU_BUTTON_EXAMPLES.map((item) => (
              <MenuPlanetButtonVisual key={item.id} item={item} realm={realm} />
            ))}
      </div>
    </div>
  )
}

function MenuSectionNavigatorSpecimen({ loading }: { loading: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <div className={cn("dark", menuNatureShellClass, "w-full py-6")}>
      {loading ? (
        <MenuDormantNavigator />
      ) : (
        <MenuSectionNavigator
          sections={[...MENU_POP_SECTIONS]}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
      )}
    </div>
  )
}

function MenuDockSpecimen({
  loading,
  editing,
}: {
  loading: boolean
  editing: boolean
}) {
  return (
    <div
      className={cn(
        "dark",
        menuNatureShellClass,
        "relative flex min-h-[8rem] w-full items-center justify-center py-8",
      )}
    >
      {loading ? (
        <MenuDormantDock />
      ) : (
        <MenuOuterEntity
          variant="foot"
          floating
          className="!relative !bottom-auto !left-auto !w-auto !max-w-full !translate-x-0"
        >
          <div className="flex items-end overflow-visible px-2 py-1">
            <div className="flex items-end gap-4">
              {MENU_POP_DOCK_ITEMS.map((item) => (
                <DockIconVisual
                  key={item.id}
                  icon={item.icon}
                  sectionKey={item.sectionKey}
                  variant="dock"
                  size="md"
                />
              ))}
            </div>
            <div
              className="ml-3 hidden shrink-0 items-center self-end md:flex"
              style={{ height: 48 }}
            >
              <div
                className="mr-2 w-px shrink-0 bg-white/20"
                style={{ height: 32 }}
                aria-hidden
              />
              <RootsIconButton
                tone="ghost"
                surface="dark"
                size="compact"
                label={editing ? "Listo" : "Editar accesos directos"}
              >
                {editing ? (
                  <Check aria-hidden strokeWidth={2.5} />
                ) : (
                  <Pencil aria-hidden />
                )}
              </RootsIconButton>
            </div>
          </div>
        </MenuOuterEntity>
      )}
    </div>
  )
}

function MenusFinalSpecimen() {
  return (
    <div className="flex flex-col gap-4">
      <ComponentView defaultOpen
        background={ETER}
        componentName="MenuSectionNavigator"
        componentProperties={[
          { name: "sections", values: ["Operar", "Administrar", "Configurar"] },
          { name: "selectedIndex", values: ["number"] },
          { name: "onSelect", values: ["(index: number) => void"] },
          { name: "dormant", values: ["true", "false"] },
        ]}
        variants={[{ name: "Menú POP" }]}
        extras={[{ items: [{ name: "loaded" }, { name: "loading" }] }]}
        render={(_variant, extras) => (
          <MenuSectionNavigatorSpecimen loading={extras[0] === "loading"} />
        )}
      />
      <ComponentView defaultOpen
        background={ETER}
        componentName="MenuGridItemButton"
        componentProperties={[
          { name: "item", values: ["Vender", "Mesas", "Artículos", "Ajustes"] },
          { name: "sectionKey", values: ["operar", "administrar", "configurar"] },
          { name: "world", values: ["savia", "sol", "cielo", "lava"] },
        ]}
        variants={[
          { name: "Savia" },
          { name: "Sol" },
          { name: "Cielo" },
          { name: "Lava" },
        ]}
        extras={[{ items: [{ name: "loaded" }, { name: "loading" }] }]}
        render={(variant, extras) => (
          <MenuGridItemButtonSpecimen
            world={variant}
            loading={extras[0] === "loading"}
          />
        )}
      />
      <ComponentView defaultOpen
        background={ETER}
        componentName="MenuDock"
        componentProperties={[
          { name: "siteId", values: ["string"] },
          { name: "popId", values: ["string"] },
          { name: "dockItems", values: ["home", "sale", "mesas", "articles", "settings"] },
          { name: "editing", values: ["true", "false"] },
        ]}
        variants={[{ name: "Menú POP" }]}
        extras={[
          { items: [{ name: "loaded" }, { name: "loading" }] },
          { items: [{ name: "idle" }, { name: "editing" }] },
        ]}
        render={(_variant, extras) => (
          <MenuDockSpecimen
            loading={extras[0] === "loading"}
            editing={extras[1] === "editing"}
          />
        )}
      />
      <ComponentView defaultOpen
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
    </div>
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
            className={cn(handbookDocChapterClass, "first:border-t-0 first:pt-0")}
          >
            <h2 className={libraryDocSectionTitleClass}>{section.title}</h2>
            <div className="mt-6">
              {section.status === "absent" && section.absentNote ? (
                <p className={cn(libraryDocPageDescriptionClass, "max-w-md italic")}>
                  {section.absentNote}
                </p>
              ) : pageId === "navegacion-final" && section.id === "header" ? (
                <HeaderFinalSpecimen />
              ) : pageId === "navegacion-final" && section.id === "menus" ? (
                <MenusFinalSpecimen />
              ) : pageId === "navegacion-final" && section.id === "tabs" ? (
                <TabsFinalSpecimen />
              ) : HANDBOOK_FINAL_SECTION_SPECIMENS[section.id] ? (
                HANDBOOK_FINAL_SECTION_SPECIMENS[section.id]()
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
