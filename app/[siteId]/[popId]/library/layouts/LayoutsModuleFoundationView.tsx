"use client"

import {
  LayoutsModuleBackdropFallbackDemo,
  LayoutsModuleBackdropFallbackSpecs,
  LayoutsModuleBackdropPhotoLayersDemo,
  LayoutsModuleBackdropPhotoOnlyDemo,
  LayoutsModuleBackdropPhotoSpecs,
  LayoutsModuleBodyWireframeDemo,
  LayoutsModuleContentTypesGrid,
  LayoutsModuleDocSubsection,
  LayoutsModuleHeaderComponentDemo,
  LayoutsModuleHeaderGlassDemo,
  LayoutsModuleHeaderSpecs,
  LayoutsModuleShellPreviewDemo,
} from "@/app/[siteId]/[popId]/library/layouts/LayoutsModuleDocPrimitives"
import {
  LAYOUTS_RELATED_LINKS,
  getLayoutsPageMeta,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsLibraryNav"
import { LayoutsSystemHero } from "@/app/[siteId]/[popId]/library/layouts/LayoutsDocShared"
import {
  LibraryDocSection,
  LibraryRelatedLinks,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function LayoutsModuleFoundationView({ sectionId, siteId, popId }: Props) {
  if (sectionId !== "layouts-module") return null

  return (
    <div className="space-y-10">
      <LayoutsSystemHero variant="module" />

      <LibraryDocSection id="layouts-module-preview" title="Vista previa">
        <LayoutsModuleShellPreviewDemo />
      </LibraryDocSection>

      <LibraryDocSection id="layouts-module-backdrop" title="1 · Fondo del POP">
        <div className="space-y-8">
          <LayoutsModuleDocSubsection title="1.1 · Fondo cargado por el usuario">
            <div className="space-y-6">
              <LayoutsModuleDocSubsection title="1.1.a · Imagen">
                <LayoutsModuleBackdropPhotoOnlyDemo />
              </LayoutsModuleDocSubsection>
              <LayoutsModuleDocSubsection title="1.1.b · Capa superior">
                <LayoutsModuleBackdropPhotoLayersDemo />
                <LayoutsModuleBackdropPhotoSpecs />
              </LayoutsModuleDocSubsection>
            </div>
          </LayoutsModuleDocSubsection>

          <LayoutsModuleDocSubsection title="1.2 · Fondo sin imagen cargada">
            <LayoutsModuleDocSubsection title="1.2.a · Fallback">
              <LayoutsModuleBackdropFallbackDemo />
              <LayoutsModuleBackdropFallbackSpecs />
            </LayoutsModuleDocSubsection>
          </LayoutsModuleDocSubsection>
        </div>
      </LibraryDocSection>

      <LibraryDocSection id="layouts-module-header" title="2 · Header">
        <div className="space-y-8">
          <LayoutsModuleDocSubsection title="2.1 · Fondo del header">
            <LayoutsModuleHeaderGlassDemo />
            <LayoutsModuleHeaderSpecs />
          </LayoutsModuleDocSubsection>
          <LayoutsModuleDocSubsection title="2.2 · Componente">
            <p className="mb-4 text-sm text-muted-foreground">
              Header reutilizable del producto — cristal sombra · savia con{" "}
              <code className="text-xs">RootsIconButton</code> tema{" "}
              <code className="text-xs">pos</code>. El scope{" "}
              <code className="text-xs">menu-nature-shell</code> queda solo para el fondo POP.
            </p>
            <LayoutsModuleHeaderComponentDemo />
          </LayoutsModuleDocSubsection>
        </div>
      </LibraryDocSection>

      <LibraryDocSection id="layouts-module-body" title="3 · Body">
        <div className="space-y-8">
          <LayoutsModuleDocSubsection title="3.1 · Fondo bruma">
            <LayoutsModuleBodyWireframeDemo />
          </LayoutsModuleDocSubsection>
          <LayoutsModuleDocSubsection title="3.2 · Opcional · tipos de contenido">
            <LayoutsModuleContentTypesGrid siteId={siteId} popId={popId} />
          </LayoutsModuleDocSubsection>
        </div>
      </LibraryDocSection>

      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <LibraryRelatedLinks
          siteId={siteId}
          popId={popId}
          excludeId={sectionId}
          links={LAYOUTS_RELATED_LINKS}
        />
      </div>
    </div>
  )
}

export function getLayoutsModuleFoundationHeading(sectionId: string) {
  return getLayoutsPageMeta(sectionId)?.title ?? "Módulo"
}
