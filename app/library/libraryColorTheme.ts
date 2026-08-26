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

/** Superficies de documentación — bruma, sin sombra (layout · bloques). */
export const librarySpecCardClass = "library-spec-card"
export const libraryDocCardClass = "library-doc-card"
export const libraryDocPanelClass = "library-doc-panel"
export const libraryDocTableShellClass = "library-doc-table-shell"
export const libraryDoPanelClass = "library-doc-do-panel"
export const libraryDontPanelClass = "library-doc-dont-panel"

/** Tipografía de documentación — títulos UI, prosa de lectura. */
export const libraryDocSectionTitleClass =
  "rootsy-text-section-title text-[var(--color-texto)]"
export const libraryDocSubheadingClass =
  "rootsy-text-heading-small text-[var(--color-texto)]"
export const libraryDocSectionDescriptionClass =
  "max-w-2xl rootsy-text-meta leading-relaxed text-[var(--color-texto-muted)]"
export const libraryDocBodyClass =
  "rootsy-text-reading text-[var(--color-texto)]"
export const libraryDocPageTitleClass =
  "rootsy-text-page-title text-[var(--color-texto)]"
export const libraryDocPageDescriptionClass =
  "rootsy-text-meta leading-relaxed text-[var(--color-texto-muted)]"
/** Metadatos, eyebrows y subheadings técnicos. Mínimo 12px. */
export const libraryDocMetaLabelClass =
  "rootsy-text-label text-[var(--color-texto-muted)]"
export const libraryDocBorderClass = "border-[var(--color-borde)]"
export const libraryRelatedLinksSectionClass =
  "library-related-links space-y-3 border-t border-[var(--color-borde)] pt-8"

/** Tablas de documentación — header y filas con bruma. */
export const libraryDocTableShellOverflowClass =
  "library-doc-table-shell overflow-hidden rounded-2xl"
export const libraryDocTableHeaderClass =
  "border-b border-[var(--color-borde)] bg-[var(--color-elevada)] text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-texto-muted)]"
export const libraryDocTableRowClass =
  "border-b border-[var(--color-borde)] last:border-b-0"
export const libraryDocMutedTextClass = "text-[var(--color-texto-muted)]"
export const libraryDocPrimaryTextClass = "text-[var(--color-texto)]"
export const libraryDocTokenAccentClass = "text-[var(--color-accion)]"
export const libraryDocSurfaceMutedClass = "bg-[var(--color-elevada)]"
