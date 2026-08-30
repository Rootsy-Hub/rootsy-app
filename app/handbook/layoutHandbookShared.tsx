import {
  libraryNavGroupClass,
  libraryNavGroupLabelClass,
  libraryNavItemActiveClass,
  libraryNavItemClass,
  libraryNavItemIconClass,
  libraryNavItemLabelClass,
} from "@/app/library/libraryColorTheme"
import { getHandbookNavIcon } from "@/app/handbook/handbookNavIcons"
import { cn } from "@/lib/utils"
import Link from "next/link"

export type HandbookNavItem = {
  id: string
  label: string
}

export type HandbookNavGroup = {
  id: string
  label: string
  items: HandbookNavItem[]
}

/** Navegación agrupada — títulos de grupo no clickeables. Mundo de Rootsy, no Universo. */
export const HANDBOOK_NAV_GROUPS: HandbookNavGroup[] = [
  {
    id: "inicio",
    label: "Inicio",
    items: [{ id: "overview", label: "Overview" }],
  },
  {
    id: "fundamentos",
    label: "Fundamentos",
    items: [
      { id: "vision", label: "Visión" },
      { id: "estrategia", label: "Estrategia" },
      { id: "principios", label: "Principios" },
    ],
  },
  {
    id: "marca",
    label: "Marca",
    items: [
      { id: "plataforma-de-marca", label: "Plataforma de marca" },
      { id: "voz-y-tono", label: "Voz y tono" },
      { id: "identidad-visual", label: "Identidad visual" },
    ],
  },
  {
    id: "mundo-de-rootsy",
    label: "Mundo de Rootsy",
    items: [
      { id: "territorio", label: "Territorio" },
      { id: "comunidad", label: "Comunidad" },
      { id: "ecosistema", label: "Ecosistema" },
    ],
  },
  {
    id: "producto-y-experiencia",
    label: "Producto y experiencia",
    items: [
      { id: "producto", label: "Producto" },
      { id: "experiencia", label: "Experiencia" },
      { id: "sistema-de-diseno", label: "Sistema de diseño" },
      { id: "sistema-de-diseno-v2", label: "Sistema de diseño v2" },
      { id: "contenido", label: "Contenido" },
    ],
  },
  {
    id: "operacion",
    label: "Operación",
    items: [
      { id: "organizacion", label: "Organización" },
      { id: "forma-de-trabajo", label: "Forma de trabajo" },
      { id: "impacto", label: "Impacto" },
    ],
  },
  {
    id: "recursos",
    label: "Recursos",
    items: [
      { id: "biblioteca", label: "Biblioteca" },
      { id: "plantillas", label: "Plantillas" },
      { id: "actualizaciones", label: "Actualizaciones" },
    ],
  },
]

export const DEFAULT_HANDBOOK_SECTION = "overview"

export const HANDBOOK_SECTION_IDS = HANDBOOK_NAV_GROUPS.flatMap((group) =>
  group.items.map((item) => item.id),
)

export function isValidHandbookSection(sectionId: string): boolean {
  return HANDBOOK_SECTION_IDS.includes(sectionId)
}

export function handbookSectionHref(sectionId: string): string {
  if (sectionId === "sistema-de-diseno-v2") return "/handbook/v2"
  return `/handbook/${sectionId}`
}

export function handbookHomeHref(): string {
  return handbookSectionHref(DEFAULT_HANDBOOK_SECTION)
}

export function getHandbookNavGroup(
  sectionId: string,
): HandbookNavGroup | undefined {
  return HANDBOOK_NAV_GROUPS.find((group) =>
    group.items.some((item) => item.id === sectionId),
  )
}

function HandbookNavItemLink({
  item,
  activeSectionId,
  onSelectSection,
}: {
  item: HandbookNavItem
  activeSectionId: string
  onSelectSection?: (sectionId: string) => void
}) {
  const isActive = item.id === activeSectionId
  const Icon = getHandbookNavIcon(item.id)

  return (
    <Link
      href={handbookSectionHref(item.id)}
      scroll={false}
      prefetch
      aria-current={isActive ? "page" : undefined}
      className={cn(libraryNavItemClass, isActive && libraryNavItemActiveClass)}
      onClick={() => onSelectSection?.(item.id)}
    >
      {Icon ? <Icon className={libraryNavItemIconClass} aria-hidden /> : null}
      <span className={libraryNavItemLabelClass}>{item.label}</span>
    </Link>
  )
}

export function HandbookNav({
  activeSectionId,
  className,
  onSelectSection,
}: {
  activeSectionId: string
  className?: string
  onSelectSection?: (sectionId: string) => void
}) {
  return (
    <nav className={cn("library-nav", className)} aria-label="Secciones del handbook">
      {HANDBOOK_NAV_GROUPS.map((group, groupIndex) => (
        <section
          key={group.id}
          className={cn(libraryNavGroupClass, groupIndex > 0 && "library-nav-group--separated")}
        >
          <h2 className={libraryNavGroupLabelClass}>{group.label}</h2>
          <ul className="library-nav-list">
            {group.items.map((item) => (
              <li key={item.id}>
                <HandbookNavItemLink
                  item={item}
                  activeSectionId={activeSectionId}
                  onSelectSection={onSelectSection}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  )
}
