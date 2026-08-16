/**
 * Tema visual de la página Librería.
 * Consume tokens globales — lib/design-system/ + styles/rootsy/
 */

export const libraryThemeClass = "rootsy-theme-library"

export const librarySidebarClass = "library-sidebar"
export const librarySidebarHeaderClass = "library-sidebar-header"
export const librarySidebarEyebrowClass = "library-sidebar-eyebrow"
export const libraryContentAreaClass = "library-content-area"
export const libraryContentEyebrowClass = "library-content-eyebrow"
export const libraryNavGroupClass = "library-nav-group"
export const libraryNavGroupLabelClass = "library-nav-group-label"
export const libraryNavItemClass = "library-nav-item"
export const libraryNavItemActiveClass = "library-nav-item--active"
export const libraryNavItemParentActiveClass = "library-nav-item--parent-active"
export const libraryNavItemNestedClass = "library-nav-item--nested"
export const libraryNavItemIconClass = "library-nav-item-icon"
export const libraryNavItemLabelClass = "library-nav-item-label"
export const libraryNavToggleClass = "library-nav-toggle"
export const libraryNavNestedListClass = "library-nav-nested-list"
/** Nav en superficie clara (módulo POP · bruma) — mismos items que library-nav. */
export const libraryNavSurfaceLightClass = "library-nav-surface-light"
/** Nav en superficie oscura (sombra · rail library / estadísticas). */
export const libraryNavSurfaceDarkClass = "library-nav-surface-dark"
/** @deprecated Use libraryNavItemClass */
export const libraryNavLinkClass = "library-nav-item"
/** @deprecated Use libraryNavItemActiveClass */
export const libraryNavLinkActiveClass = "library-nav-item--active"
/** @deprecated Use libraryNavItemParentActiveClass */
export const libraryNavLinkParentActiveClass = "library-nav-item--parent-active"
export const libraryPageHeaderClass = "library-page-header"
export const libraryPageHeaderBadgeClass = "library-page-header-badge"
export const libraryPageHeaderMonoClass = "library-page-header-mono"
export const libraryShellMainClass = "rootsy-library-shell"
export const libraryScrollDarkClass = "library-scroll library-scroll--dark"
export const libraryScrollLightClass = "library-scroll library-scroll--light"

/** Superficies de documentación — bruma/blanco, sin sombra (layout · bloques). */
export const librarySpecCardClass = "library-spec-card"
export const libraryDocCardClass = "library-doc-card"
export const libraryDocPanelClass = "library-doc-panel"
export const libraryDocTableShellClass = "library-doc-table-shell"
export const libraryDoPanelClass = "library-doc-do-panel"
export const libraryDontPanelClass = "library-doc-dont-panel"

/** Tipografía de documentación — mismo contrato que módulos POP (dataWorkspaceListStyles). */
export const libraryDocSectionTitleClass =
  "font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]"
export const libraryDocSectionDescriptionClass =
  "max-w-2xl font-canopy text-xs leading-relaxed text-[var(--rootsy-bruma-500)]"
export const libraryDocBodyClass =
  "max-w-3xl font-canopy text-sm leading-relaxed text-[var(--rootsy-bruma-700)]"
export const libraryDocPageTitleClass =
  "font-canopy text-lg font-semibold tracking-tight text-[var(--rootsy-bruma-900)]"
export const libraryDocPageDescriptionClass =
  "font-canopy text-xs leading-relaxed text-[var(--rootsy-bruma-500)]"
/** Metadatos, eyebrows y subheadings técnicos — mismo bruma-500, énfasis en peso. */
export const libraryDocMetaLabelClass =
  "font-canopy text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]"
/** Bordes de documentación — bruma-200 (no border-border shadcn). */
export const libraryDocBorderClass = "border-[var(--rootsy-bruma-200)]"
export const libraryRelatedLinksSectionClass =
  "library-related-links space-y-3 border-t border-[var(--rootsy-bruma-200)] pt-8"

/** Tablas de documentación — header y filas con bruma. */
export const libraryDocTableShellOverflowClass =
  "library-doc-table-shell overflow-hidden rounded-2xl"
export const libraryDocTableHeaderClass =
  "border-b border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]"
export const libraryDocTableRowClass =
  "border-b border-[var(--rootsy-bruma-200)] last:border-b-0"
export const libraryDocMutedTextClass = "text-[var(--rootsy-bruma-500)]"
export const libraryDocPrimaryTextClass = "text-[var(--rootsy-bruma-900)]"
export const libraryDocTokenAccentClass = "text-[var(--rootsy-savia-600)]"
export const libraryDocSurfaceMutedClass = "bg-[var(--rootsy-bruma-50)]"
